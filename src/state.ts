import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { buildInitialState } from "./seed";
import { addDays, evaluateAchievements, todayISO } from "./helpers";
import type { AppState, DailyRecord, Goal, Task, UserProfile } from "./types";
import { db } from "./firebase";

const ANON_KEY = "ascend.state.anon";
const userKey = (uid: string) => `ascend.state.${uid}`;
const COLLECTION = "ascendState";

/* ---------- Local cache ---------- */

function loadLocal(uid: string | null): AppState | null {
  if (typeof window === "undefined") return null;
  const key = uid ? userKey(uid) : ANON_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !parsed.schemaVersion) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveLocal(uid: string | null, state: AppState) {
  if (typeof window === "undefined") return;
  const key = uid ? userKey(uid) : ANON_KEY;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/* ---------- Demo seed ---------- */

function seedDemo(base: AppState): AppState {
  const today = todayISO();
  const records: Record<string, DailyRecord> = {};
  const distribution = [
    "perfect",
    "strong",
    "partial",
    "perfect",
    "strong",
    "missed",
    "perfect",
    "strong",
    "partial",
    "perfect",
    "perfect",
    "strong",
    "partial",
    "missed",
  ];
  for (let i = 0; i < 14; i++) {
    const date = addDays(today, -(i + 1));
    const intent = distribution[i] as "perfect" | "strong" | "partial" | "missed";
    const completions: Record<string, boolean> = {};
    const tasks = base.defaultTasks;
    let pickRate = 0.4;
    if (intent === "perfect") pickRate = 1;
    if (intent === "strong") pickRate = 0.8;
    if (intent === "partial") pickRate = 0.45;
    if (intent === "missed") pickRate = 0.15;
    for (const t of tasks) {
      const r = mulberry(date + t.id)();
      if (r < pickRate) completions[t.id] = true;
    }
    records[date] = { date, completions, customTasks: [] };
  }
  records[today] = {
    date: today,
    completions: {
      prayer_fajr: true,
      prayer_dhuhr: true,
      work_shift: true,
    },
    customTasks: [],
  };
  return { ...base, records };
}

function mulberry(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let t = h >>> 0;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function freshAnon(): AppState {
  return seedDemo(buildInitialState());
}

function freshAuthed(): AppState {
  // Logged-in users start clean — no demo clutter on their account
  return buildInitialState();
}

/* ---------- The hook ---------- */

export function useAppState(uid: string | null) {
  const [state, setState] = useState<AppState>(() => {
    const cached = loadLocal(uid);
    if (cached) return cached;
    return uid ? freshAuthed() : freshAnon();
  });
  const [syncing, setSyncing] = useState<boolean>(!!uid && !!db);
  const skipNextSave = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUid = useRef<string | null>(uid);

  // When uid changes (login / logout / switch user), reload appropriate state
  useEffect(() => {
    if (lastUid.current === uid) return;
    lastUid.current = uid;
    skipNextSave.current = true;
    const cached = loadLocal(uid);
    if (cached) setState(cached);
    else setState(uid ? freshAuthed() : freshAnon());
    setSyncing(!!uid && !!db);
  }, [uid]);

  // Firestore: subscribe to user's doc
  useEffect(() => {
    if (!uid || !db) return;
    let cancelled = false;
    const ref = doc(db, COLLECTION, uid);
    setSyncing(true);

    // First-time: if doc doesn't exist, create it from current state
    (async () => {
      try {
        const snap = await getDoc(ref);
        if (cancelled) return;
        if (!snap.exists()) {
          const initial = freshAuthed();
          skipNextSave.current = true;
          setState(initial);
          saveLocal(uid, initial);
          await setDoc(ref, initial);
        }
      } catch (e) {
        console.warn("Firestore initial check failed", e);
      }
    })();

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setSyncing(false);
          return;
        }
        const data = snap.data() as AppState;
        if (data && data.schemaVersion) {
          // Avoid loops: only update if remote differs from current
          skipNextSave.current = true;
          setState(data);
          saveLocal(uid, data);
        }
        setSyncing(false);
      },
      (err) => {
        console.warn("Firestore subscribe failed", err);
        setSyncing(false);
      }
    );
    return () => {
      cancelled = true;
      unsub();
    };
  }, [uid]);

  // Persist on state change (debounced)
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveLocal(uid, state);
    if (uid && db) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setDoc(doc(db!, COLLECTION, uid), state).catch((e) =>
          console.warn("Firestore save failed", e)
        );
      }, 900);
    }
  }, [state, uid]);

  // Recompute achievements when records change
  useEffect(() => {
    const unlocked = evaluateAchievements(state);
    if (unlocked.length !== state.unlocked.length) {
      setState((s) => ({ ...s, unlocked }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.records]);

  /* ---------- Actions ---------- */

  const updateRecord = useCallback(
    (date: string, updater: (r: DailyRecord) => DailyRecord) => {
      setState((s) => {
        const cur = s.records[date] ?? {
          date,
          completions: {},
          customTasks: [],
        };
        const next = updater(cur);
        return { ...s, records: { ...s.records, [date]: next } };
      });
    },
    []
  );

  const toggleTask = useCallback(
    (date: string, taskId: string) => {
      updateRecord(date, (r) => ({
        ...r,
        completions: { ...r.completions, [taskId]: !r.completions[taskId] },
      }));
    },
    [updateRecord]
  );

  const setTaskComplete = useCallback(
    (date: string, taskId: string, done: boolean) => {
      updateRecord(date, (r) => ({
        ...r,
        completions: { ...r.completions, [taskId]: done },
      }));
    },
    [updateRecord]
  );

  const addCustomTask = useCallback(
    (date: string, task: Task) => {
      updateRecord(date, (r) => ({
        ...r,
        customTasks: [...(r.customTasks ?? []), task],
      }));
    },
    [updateRecord]
  );

  const removeCustomTask = useCallback(
    (date: string, taskId: string) => {
      updateRecord(date, (r) => {
        const completions = { ...r.completions };
        delete completions[taskId];
        return {
          ...r,
          completions,
          customTasks: (r.customTasks ?? []).filter((t) => t.id !== taskId),
        };
      });
    },
    [updateRecord]
  );

  const updateReview = useCallback(
    (date: string, review: DailyRecord["review"]) => {
      updateRecord(date, (r) => ({ ...r, review: { ...(r.review ?? {}), ...review } }));
    },
    [updateRecord]
  );

  const updateUser = useCallback((u: Partial<UserProfile>) => {
    setState((s) => ({ ...s, user: { ...s.user, ...u } }));
  }, []);

  const upsertGoal = useCallback((g: Goal) => {
    setState((s) => {
      const exists = s.goals.find((x) => x.id === g.id);
      const goals = exists
        ? s.goals.map((x) => (x.id === g.id ? g : x))
        : [...s.goals, g];
      return { ...s, goals };
    });
  }, []);

  const removeGoal = useCallback((id: string) => {
    setState((s) => ({ ...s, goals: s.goals.filter((g) => g.id !== id) }));
  }, []);

  const resetDemo = useCallback(() => {
    const next = uid ? freshAuthed() : freshAnon();
    setState(next);
    saveLocal(uid, next);
    if (uid && db) {
      setDoc(doc(db, COLLECTION, uid), next).catch((e) =>
        console.warn("Firestore reset failed", e)
      );
    }
  }, [uid]);

  const importJSON = useCallback(
    (raw: string) => {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.schemaVersion) {
          setState(parsed as AppState);
          saveLocal(uid, parsed as AppState);
          return true;
        }
      } catch {
        /* ignore */
      }
      return false;
    },
    [uid]
  );

  const exportJSON = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const value = useMemo(
    () => ({
      state,
      setState,
      syncing,
      uid,
      toggleTask,
      setTaskComplete,
      addCustomTask,
      removeCustomTask,
      updateReview,
      updateUser,
      upsertGoal,
      removeGoal,
      resetDemo,
      importJSON,
      exportJSON,
    }),
    [
      state,
      syncing,
      uid,
      toggleTask,
      setTaskComplete,
      addCustomTask,
      removeCustomTask,
      updateReview,
      updateUser,
      upsertGoal,
      removeGoal,
      resetDemo,
      importJSON,
      exportJSON,
    ]
  );

  return value;
}

export type AppStateApi = ReturnType<typeof useAppState>;
