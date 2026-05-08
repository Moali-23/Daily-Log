import { Check, CheckCircle2, Cloud, CloudOff, Download, ListChecks, LogOut, RefreshCw, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "../state";
import { Btn, Card, SectionHeader } from "../components/UI";
import { ConfirmDialog } from "../components/Modals";
import type { AuthApi } from "../auth";
import { ACCENTS as ACCENT_THEME } from "../theme";
import type { AccentKey } from "../theme";

const ACCENT_LIST: { key: AccentKey; label: string; color: string }[] = (
  Object.keys(ACCENT_THEME) as AccentKey[]
).map((k) => ({
  key: k,
  label: ACCENT_THEME[k].label,
  color: ACCENT_THEME[k].hex,
}));

export function SettingsPage({
  api,
  authApi,
}: {
  api: ReturnType<typeof useAppState>;
  authApi: AuthApi;
}) {
  const {
    state,
    updateUser,
    resetDemo,
    exportJSON,
    importJSON,
    syncing,
    disableDefaultTask,
    restoreDefaultTask,
  } = api;
  const disabledIds = new Set(state.user.disabledDefaultTaskIds ?? []);
  const [importMsg, setImportMsg] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.reduceMotion = state.user.reducedMotion ? "true" : "false";
  }, [state.user.reducedMotion]);

  function download() {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ascend-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJSON(String(reader.result));
      setImportMsg(ok ? "Import successful." : "Import failed — invalid file.");
      setTimeout(() => setImportMsg(""), 3000);
    };
    reader.readAsText(f);
  }

  const user = authApi.user;

  return (
    <>
      <div className="mb-5">
        <div className="text-[10px] uppercase tracking-widest text-zinc-500">
          Settings
        </div>
        <h2 className="mt-1 text-2xl font-bold text-zinc-100">Operator profile</h2>
      </div>

      <SectionHeader title="Account" />
      <Card className="p-5 mb-5">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "Avatar"}
              className="w-12 h-12 rounded-full border border-white/10"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 grid place-items-center text-zinc-950 font-bold">
              {(user?.displayName ?? user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-zinc-100 truncate">
              {user?.displayName ?? "Operator"}
            </div>
            <div className="text-[12px] text-zinc-500 truncate">
              {user?.email ?? "—"}
            </div>
          </div>
          <Btn variant="ghost" icon={<LogOut size={14} />} onClick={authApi.signOut}>
            Sign out
          </Btn>
        </div>
        <div className="mt-4 flex items-center gap-2 text-[11px]">
          {syncing ? (
            <span className="inline-flex items-center gap-1.5 text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-2 py-0.5">
              <Cloud size={11} className="animate-pulseSoft" /> Syncing…
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
              <CheckCircle2 size={11} /> Cloud synced
            </span>
          )}
          {!authApi.isFirebaseConfigured && (
            <span className="inline-flex items-center gap-1.5 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
              <CloudOff size={11} /> Local-only (Firebase not configured)
            </span>
          )}
        </div>
      </Card>

      <SectionHeader title="Profile" />
      <Card className="p-5 mb-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Display name">
            <input
              value={state.user.displayName}
              onChange={(e) => updateUser({ displayName: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Main goal">
            <input
              value={state.user.mainGoal}
              onChange={(e) => updateUser({ mainGoal: e.target.value })}
              className="input"
            />
          </Field>
        </div>
      </Card>

      <SectionHeader title="Appearance" />
      <Card className="p-5 mb-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Accent colour">
            <div className="flex flex-wrap gap-2">
              {ACCENT_LIST.map((a) => {
                const active = state.user.accent === a.key;
                return (
                  <button
                    key={a.key}
                    onClick={() => updateUser({ accent: a.key })}
                    className={`relative w-11 h-11 rounded-xl border transition active:scale-95 group ${
                      active
                        ? "border-white/50 shadow-accent-strong"
                        : "border-white/10 hover:border-white/25"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${a.color}40, ${a.color}10)`,
                    }}
                    aria-label={`${a.label} accent`}
                    aria-pressed={active}
                  >
                    <span
                      className="absolute inset-1 rounded-lg"
                      style={{ background: a.color }}
                    />
                    {active && (
                      <span className="absolute inset-0 grid place-items-center text-zinc-950">
                        <Check size={16} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] text-zinc-500 mt-2">
              Accent updates the entire app instantly — buttons, navigation, glows
              and gradients all follow it.
            </div>
          </Field>
          <Field label="Reduce motion">
            <button
              type="button"
              role="switch"
              aria-checked={state.user.reducedMotion}
              onClick={() =>
                updateUser({ reducedMotion: !state.user.reducedMotion })
              }
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <span
                className={`relative w-11 h-6 rounded-full transition ${
                  state.user.reducedMotion ? "bg-accent-soft border border-accent-soft" : "bg-white/10 border border-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 transition-all w-5 h-5 rounded-full ${
                    state.user.reducedMotion
                      ? "left-5 bg-accent shadow-accent"
                      : "left-0.5 bg-white"
                  }`}
                />
              </span>
              <span className="text-sm text-zinc-300">
                {state.user.reducedMotion
                  ? "Reduced motion · animations minimised"
                  : "Smooth animations · on"}
              </span>
            </button>
          </Field>
        </div>
      </Card>

      <SectionHeader title="Routine" />
      <Card className="p-5 mb-5">
        <div className="text-[11px] text-zinc-500 mb-4 leading-relaxed">
          Toggle any default task off to remove it from your routine going
          forward. Past records keep their original tasks intact. Prayer tasks
          can be turned off here, but the prayer tracker still expects 5 daily
          prayers for streaks and quests.
        </div>
        <div className="space-y-1.5">
          {state.defaultTasks.map((t) => {
            const isOff = disabledIds.has(t.id);
            return (
              <div
                key={t.id}
                className={`flex items-center justify-between rounded-xl border px-3 py-2 transition ${
                  isOff
                    ? "border-white/5 bg-white/[0.015] opacity-60"
                    : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-zinc-200 truncate">
                    {t.title}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {t.category} · +{t.xp} XP
                    {isOff && <span className="text-rose-300"> · disabled</span>}
                  </div>
                </div>
                {isOff ? (
                  <button
                    onClick={() => restoreDefaultTask(t.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-accent-soft border border-accent-soft text-accent hover:brightness-110 transition active:scale-95"
                  >
                    <RotateCcw size={11} />
                    Restore
                  </button>
                ) : (
                  <button
                    onClick={() => disableDefaultTask(t.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/40 text-zinc-300 hover:text-rose-300 transition active:scale-95"
                  >
                    Disable
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
          <ListChecks size={11} />
          {state.defaultTasks.length - disabledIds.size} of{" "}
          {state.defaultTasks.length} routine tasks active
        </div>
      </Card>

      <SectionHeader title="Data" />
      <Card className="p-5 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="ghost" icon={<Download size={14} />} onClick={download}>
            Export JSON
          </Btn>
          <Btn variant="ghost" icon={<Upload size={14} />} onClick={() => fileRef.current?.click()}>
            Import JSON
          </Btn>
          <input
            type="file"
            accept="application/json"
            ref={fileRef}
            onChange={onFile}
            className="hidden"
          />
          <Btn
            variant="danger"
            icon={<RefreshCw size={14} />}
            onClick={() => setConfirmReset(true)}
          >
            Reset data
          </Btn>
        </div>
        {importMsg && <div className="text-[11px] text-zinc-400 mt-3">{importMsg}</div>}
        <div className="text-[11px] text-zinc-500 mt-3">
          Authenticated data is stored in Firestore under your user ID. Local cache also writes
          to LocalStorage so the app paints instantly.
        </div>
      </Card>

      <SectionHeader title="About" />
      <Card className="p-5">
        <div className="text-sm text-zinc-300">
          <strong>Ascend</strong> is a discipline operating system inspired by RPG progression,
          fitness trackers, and high-end fintech UIs. It tracks faith, work, trade, body, mind,
          and review across a single day, awards XP, builds streaks, unlocks ranks, and shows
          your trajectory in a way that's easy to look at every morning.
        </div>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset all data?"
        message={
          <>
            This wipes your records, custom tasks, goals, achievements and
            streaks. <span className="text-rose-300">It cannot be undone.</span>{" "}
            Consider exporting JSON first.
          </>
        }
        confirmLabel="Reset everything"
        variant="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          resetDemo();
          setConfirmReset(false);
        }}
      />

      <style>{`.input{width:100%;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.5rem 0.75rem;color:#e5e7eb;font-size:0.875rem;outline:none}.input:focus{border-color:rgb(var(--accent) / 0.5)}`}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}
