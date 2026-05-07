import { CheckCircle2, Cloud, CloudOff, Download, LogOut, RefreshCw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "../state";
import { Btn, Card, SectionHeader } from "../components/UI";
import type { AuthApi } from "../auth";

const ACCENTS: { key: any; label: string; color: string }[] = [
  { key: "cyan", label: "Cyan", color: "#22d3ee" },
  { key: "violet", label: "Violet", color: "#a78bfa" },
  { key: "emerald", label: "Emerald", color: "#34d399" },
  { key: "amber", label: "Amber", color: "#f59e0b" },
  { key: "rose", label: "Rose", color: "#fb7185" },
];

export function SettingsPage({
  api,
  authApi,
}: {
  api: ReturnType<typeof useAppState>;
  authApi: AuthApi;
}) {
  const { state, updateUser, resetDemo, exportJSON, importJSON, syncing } = api;
  const [importMsg, setImportMsg] = useState("");
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
            <div className="flex gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.key}
                  onClick={() => updateUser({ accent: a.key })}
                  className={`w-9 h-9 rounded-xl border transition active:scale-95 ${
                    state.user.accent === a.key ? "border-white/40 ring-2 ring-white/10" : "border-white/10"
                  }`}
                  style={{ background: `${a.color}30` }}
                  aria-label={a.label}
                >
                  <span className="block w-full h-full rounded-[10px]" style={{ background: a.color }} />
                </button>
              ))}
            </div>
            <div className="text-[11px] text-zinc-500 mt-2">
              The accent is used on key UI highlights.
            </div>
          </Field>
          <Field label="Reduce motion">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <span
                onClick={() => updateUser({ reducedMotion: !state.user.reducedMotion })}
                className={`relative w-11 h-6 rounded-full transition ${
                  state.user.reducedMotion ? "bg-cyan-500/40" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 ${
                    state.user.reducedMotion ? "left-5" : "left-0.5"
                  } w-5 h-5 rounded-full bg-white transition-all`}
                />
              </span>
              <span className="text-sm text-zinc-300">
                {state.user.reducedMotion ? "Animations reduced" : "Smooth animations on"}
              </span>
            </label>
          </Field>
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
          <Btn variant="danger" icon={<RefreshCw size={14} />} onClick={() => {
            if (window.confirm("Reset all data? This cannot be undone.")) resetDemo();
          }}>
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

      <style>{`.input{width:100%;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.5rem 0.75rem;color:#e5e7eb;font-size:0.875rem;outline:none}.input:focus{border-color:rgba(34,211,238,0.4)}`}</style>
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
