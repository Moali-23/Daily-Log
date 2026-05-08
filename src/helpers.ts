import {
  ACHIEVEMENTS,
  CATEGORIES,
  CATEGORY_ORDER,
  QUOTES,
  RANKS,
  XP_PER_LEVEL,
} from "./constants";
import type {
  AppState,
  CategoryKey,
  DailyRecord,
  Status,
  Task,
  WorkoutDay,
} from "./types";

/* ---------- Date helpers ---------- */

export function todayISO(d = new Date()): string {
  // Local-time ISO yyyy-mm-dd
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return todayISO(d);
}

export function dayOfYear(iso: string): number {
  const d = new Date(iso + "T00:00:00");
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function prettyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/* ---------- Tasks ---------- */

export function getTasksForDate(state: AppState, date: string): Task[] {
  const record = state.records[date];
  const custom = record?.customTasks ?? [];
  return [...state.defaultTasks, ...custom];
}

/**
 * Decide if a task is user-added (and therefore removable) vs a core routine task.
 * Belt-and-braces: prefer the explicit `isCustom` flag, but also treat any task
 * whose ID is not in `defaultTasks` as custom (safety net for older records or
 * tasks where the flag was lost during persistence).
 */
export function isCustomTask(task: Task, defaultTasks: Task[]): boolean {
  if (task.isCustom === true) return true;
  return !defaultTasks.some((d) => d.id === task.id);
}

export function ensureRecord(state: AppState, date: string): DailyRecord {
  return (
    state.records[date] ?? {
      date,
      completions: {},
      customTasks: [],
    }
  );
}

/* ---------- Completion / XP ---------- */

export function calculateCompletion(
  tasks: Task[],
  completions: Record<string, boolean>
) {
  const total = tasks.length;
  const done = tasks.filter((t) => completions[t.id]).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}

export function calculateStatus(
  tasks: Task[],
  completions: Record<string, boolean>
): Status {
  const { pct, done } = calculateCompletion(tasks, completions);
  if (done === 0) return "missed";
  if (pct === 100) return "perfect";
  if (pct >= 70) return "strong";
  if (pct >= 1) return "partial";
  return "missed";
}

export function calculateXPForDate(
  tasks: Task[],
  completions: Record<string, boolean>
) {
  let xp = tasks.reduce(
    (sum, t) => (completions[t.id] ? sum + t.xp : sum),
    0
  );

  // Quest bonuses
  const allPrayers = tasks.filter((t) => t.isPrayer);
  if (
    allPrayers.length === 5 &&
    allPrayers.every((t) => completions[t.id])
  ) {
    xp += 25;
  }
  const tradeTasks = tasks.filter(
    (t) => t.category === "trade" && !t.isCustom
  );
  if (tradeTasks.length >= 4 && tradeTasks.every((t) => completions[t.id])) {
    xp += 25;
  }
  const workoutTask = tasks.find((t) => t.isWorkout);
  if (workoutTask && completions[workoutTask.id]) xp += 15;

  // Perfect day bonus
  const status = calculateStatus(tasks, completions);
  if (status === "perfect") xp += 50;

  return xp;
}

export function totalXP(state: AppState): number {
  let xp = 0;
  for (const date of Object.keys(state.records)) {
    const record = state.records[date];
    const tasks = getTasksForDate(state, date);
    xp += calculateXPForDate(tasks, record.completions);
  }
  return xp;
}

/* ---------- Levels & Ranks ---------- */

export function calculateLevel(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const intoLevel = xp % XP_PER_LEVEL;
  return { level, intoLevel, perLevel: XP_PER_LEVEL };
}

export function getRank(level: number) {
  return [...RANKS].reverse().find((r) => level >= r.minLevel) ?? RANKS[0];
}

export function getNextRank(level: number) {
  return RANKS.find((r) => r.minLevel > level);
}

/* ---------- Streaks ---------- */

function dateMatches(
  state: AppState,
  date: string,
  predicate: (r: DailyRecord, tasks: Task[]) => boolean
) {
  const record = state.records[date];
  if (!record) return false;
  const tasks = getTasksForDate(state, date);
  return predicate(record, tasks);
}

export function streakBack(
  state: AppState,
  predicate: (r: DailyRecord, tasks: Task[]) => boolean,
  startDate = todayISO()
) {
  let count = 0;
  let cur = startDate;
  // If today not yet matching, skip today and check from yesterday
  if (!dateMatches(state, cur, predicate)) {
    cur = addDays(cur, -1);
  }
  while (dateMatches(state, cur, predicate)) {
    count += 1;
    cur = addDays(cur, -1);
  }
  return count;
}

export function streakPerfect(state: AppState) {
  return streakBack(state, (r, tasks) => calculateStatus(tasks, r.completions) === "perfect");
}

export function streakGym(state: AppState) {
  return streakBack(state, (r, tasks) => {
    const w = tasks.find((t) => t.isWorkout);
    if (!w) return false;
    return !!r.completions[w.id];
  });
}

export function streakPrayer(state: AppState) {
  return streakBack(state, (r, tasks) => {
    const p = tasks.filter((t) => t.isPrayer);
    return p.length === 5 && p.every((t) => r.completions[t.id]);
  });
}

export function bestStreak(
  state: AppState,
  predicate: (r: DailyRecord, tasks: Task[]) => boolean
) {
  const dates = Object.keys(state.records).sort();
  let best = 0;
  let cur = 0;
  let prevDate: string | null = null;
  for (const date of dates) {
    if (dateMatches(state, date, predicate)) {
      if (prevDate && addDays(prevDate, 1) === date) {
        cur += 1;
      } else {
        cur = 1;
      }
      best = Math.max(best, cur);
      prevDate = date;
    } else {
      cur = 0;
      prevDate = date;
    }
  }
  return best;
}

export function nonPerfectRunBack(state: AppState, startDate = todayISO()) {
  // count how many recent recorded days are non-perfect (back from yesterday)
  let count = 0;
  let cur = addDays(startDate, -1);
  while (true) {
    const r = state.records[cur];
    if (!r) break;
    const tasks = getTasksForDate(state, cur);
    if (calculateStatus(tasks, r.completions) === "perfect") break;
    count += 1;
    cur = addDays(cur, -1);
  }
  return count;
}

/* ---------- Quote of day ---------- */

export function quoteOfDay(iso: string) {
  const idx = dayOfYear(iso) % QUOTES.length;
  return QUOTES[idx];
}

/* ---------- Workout cycle ---------- */

export function workoutForDate(
  state: AppState,
  iso: string
): WorkoutDay {
  const cycle = state.workoutCycle;
  const start = state.user.cycleStartDate || iso;
  const startDate = new Date(start + "T00:00:00");
  const cur = new Date(iso + "T00:00:00");
  const ms = cur.getTime() - startDate.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const idx = ((days % cycle.length) + cycle.length) % cycle.length;
  return cycle[idx];
}

/* ---------- Aggregation ---------- */

export function categoryStats(state: AppState, date: string) {
  const record = state.records[date];
  const tasks = getTasksForDate(state, date);
  const out: Record<CategoryKey, { done: number; total: number }> = {
    faith: { done: 0, total: 0 },
    trade: { done: 0, total: 0 },
    body: { done: 0, total: 0 },
    mind: { done: 0, total: 0 },
    work: { done: 0, total: 0 },
    review: { done: 0, total: 0 },
  };
  for (const t of tasks) {
    out[t.category].total += 1;
    if (record?.completions[t.id]) out[t.category].done += 1;
  }
  return out;
}

export function lastNDays(state: AppState, n: number, end = todayISO()) {
  const result: { date: string; pct: number; status: Status }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const iso = addDays(end, -i);
    const r = state.records[iso];
    const tasks = getTasksForDate(state, iso);
    const c = r ? calculateCompletion(tasks, r.completions) : { pct: 0, done: 0, total: tasks.length };
    const status: Status = r ? calculateStatus(tasks, r.completions) : "none";
    result.push({ date: iso, pct: c.pct, status });
  }
  return result;
}

export function categoryAggregate(state: AppState, n = 30, end = todayISO()) {
  const out: Record<CategoryKey, { done: number; total: number }> = {
    faith: { done: 0, total: 0 },
    trade: { done: 0, total: 0 },
    body: { done: 0, total: 0 },
    mind: { done: 0, total: 0 },
    work: { done: 0, total: 0 },
    review: { done: 0, total: 0 },
  };
  for (let i = 0; i < n; i++) {
    const iso = addDays(end, -i);
    const r = state.records[iso];
    if (!r) continue;
    const stats = categoryStats(state, iso);
    for (const k of CATEGORY_ORDER) {
      out[k].done += stats[k].done;
      out[k].total += stats[k].total;
    }
  }
  return out;
}

/* ---------- Achievements ---------- */

export function evaluateAchievements(state: AppState): string[] {
  const unlocked = new Set<string>(state.unlocked);
  const dates = Object.keys(state.records).sort();

  let perfectTotal = 0;
  for (const date of dates) {
    const r = state.records[date];
    const tasks = getTasksForDate(state, date);
    if (calculateStatus(tasks, r.completions) === "perfect") perfectTotal += 1;
  }

  if (perfectTotal >= 1) unlocked.add("first_blood");
  if (perfectTotal >= 30) unlocked.add("iron_will");

  const bestPerfect = bestStreak(
    state,
    (r, tasks) => calculateStatus(tasks, r.completions) === "perfect"
  );
  if (bestPerfect >= 3) unlocked.add("momentum");
  if (bestPerfect >= 7) unlocked.add("locked_in");
  if (bestPerfect >= 14) unlocked.add("discipline");

  const bestPrayer = bestStreak(state, (r, tasks) => {
    const p = tasks.filter((t) => t.isPrayer);
    return p.length === 5 && p.every((t) => r.completions[t.id]);
  });
  if (bestPrayer >= 7) unlocked.add("salah_strong");

  const bestTrade = bestStreak(state, (r, tasks) => {
    const tr = tasks.filter((t) => t.category === "trade" && !t.isCustom);
    return tr.length > 0 && tr.every((t) => r.completions[t.id]);
  });
  if (bestTrade >= 7) unlocked.add("market_monk");

  // 8-day cycle twice = 16 days of workouts done
  const workoutDays = dates.filter((d) => {
    const r = state.records[d];
    const tasks = getTasksForDate(state, d);
    const w = tasks.find((t) => t.isWorkout);
    return w && r.completions[w.id];
  }).length;
  if (workoutDays >= 16) unlocked.add("built_different");

  // Comeback: a perfect day occurring after >=3 prior consecutive non-perfect days
  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const r = state.records[d];
    const tasks = getTasksForDate(state, d);
    if (calculateStatus(tasks, r.completions) !== "perfect") continue;
    let prior = 0;
    let cur = addDays(d, -1);
    while (true) {
      const pr = state.records[cur];
      if (!pr) break;
      const tt = getTasksForDate(state, cur);
      if (calculateStatus(tt, pr.completions) === "perfect") break;
      prior += 1;
      cur = addDays(cur, -1);
    }
    if (prior >= 3) {
      unlocked.add("comeback");
      break;
    }
  }

  return Array.from(unlocked);
}

/* ---------- Daily quests (mini RPG) ---------- */

export interface DailyQuest {
  id: string;
  title: string;
  xp: number;
  done: boolean;
  progress?: { done: number; total: number };
}

export function dailyQuests(state: AppState, date: string): DailyQuest[] {
  const r = state.records[date];
  const tasks = getTasksForDate(state, date);
  const completions = r?.completions ?? {};

  const status = r ? calculateStatus(tasks, completions) : "missed";
  const prayers = tasks.filter((t) => t.isPrayer);
  const prayersDone = prayers.filter((t) => completions[t.id]).length;
  const tradeT = tasks.filter((t) => t.category === "trade" && !t.isCustom);
  const tradeDone = tradeT.filter((t) => completions[t.id]).length;
  const workoutT = tasks.find((t) => t.isWorkout);
  const workoutDone = !!workoutT && !!completions[workoutT.id];

  return [
    {
      id: "q_perfect",
      title: "Achieve a perfect day (all tasks)",
      xp: 50,
      done: status === "perfect",
    },
    {
      id: "q_prayers",
      title: "Complete all 5 daily prayers",
      xp: 25,
      done: prayers.length === 5 && prayersDone === 5,
      progress: { done: prayersDone, total: prayers.length },
    },
    {
      id: "q_trade",
      title: `Hit all ${tradeT.length} trading discipline tasks`,
      xp: 25,
      done: tradeT.length > 0 && tradeDone === tradeT.length,
      progress: { done: tradeDone, total: tradeT.length },
    },
    {
      id: "q_workout",
      title: workoutT ? `Complete ${workoutForDateOrLabel(state, date)}` : "Complete today's workout",
      xp: 15,
      done: workoutDone,
    },
  ];
}

export function workoutForDateOrLabel(state: AppState, date: string) {
  const w = workoutForDate(state, date);
  return w.rest ? "Rest Day" : w.title;
}

/* ---------- Stat sheet (player-style) ---------- */

export interface StatSheet {
  STR: number; // Body
  VIT: number; // Consistency / streaks
  AGI: number; // Trading discipline
  INT: number; // Mind / learning
  FTH: number; // Faith / prayers
  WIL: number; // Discipline / perfect days
}

export function calculateStatSheet(state: AppState): StatSheet {
  const cap = 200;
  const dates = Object.keys(state.records);
  let workoutCount = 0;
  let perfectCount = 0;
  let mindCount = 0;
  let faithCount = 0;
  let tradeCount = 0;
  for (const d of dates) {
    const r = state.records[d];
    const tasks = getTasksForDate(state, d);
    const w = tasks.find((t) => t.isWorkout);
    if (w && r.completions[w.id]) workoutCount += 1;

    const prayers = tasks.filter((t) => t.isPrayer);
    if (prayers.length === 5 && prayers.every((t) => r.completions[t.id])) faithCount += 1;

    const mind = tasks.filter((t) => t.category === "mind");
    mindCount += mind.filter((t) => r.completions[t.id]).length;

    const trade = tasks.filter((t) => t.category === "trade" && !t.isCustom);
    if (trade.length > 0 && trade.every((t) => r.completions[t.id])) tradeCount += 1;

    if (calculateStatus(tasks, r.completions) === "perfect") perfectCount += 1;
  }
  const consistency = streakBack(state, (r, tasks) => {
    const status = calculateStatus(tasks, r.completions);
    return status !== "missed" && status !== "none";
  });
  return {
    STR: Math.min(cap, workoutCount * 8),
    VIT: Math.min(cap, consistency * 6),
    AGI: Math.min(cap, tradeCount * 10),
    INT: Math.min(cap, mindCount * 3),
    FTH: Math.min(cap, faithCount * 10),
    WIL: Math.min(cap, perfectCount * 12),
  };
}

export function statTotal(s: StatSheet) {
  return s.STR + s.VIT + s.AGI + s.INT + s.FTH + s.WIL;
}

export const STAT_CAP = 200;

export const ACHIEVEMENT_BY_ID = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

export const CAT_LABEL = (k: CategoryKey) => CATEGORIES[k].label;
