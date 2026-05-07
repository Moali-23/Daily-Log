import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { APP_NAME, APP_TAGLINE } from "../constants";
import type { AuthApi } from "../auth";
import { Card } from "../components/UI";

export function LoginPage({ auth }: { auth: AuthApi }) {
  const { signIn, isFirebaseConfigured, error, loading } = auth;

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Ambient orbs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.4, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.1 }}
        className="pointer-events-none absolute -bottom-32 -left-32 w-[380px] h-[380px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(168,85,247,0.35), transparent)" }}
      />

      <div className="relative w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-6 items-center">
        {/* Pitch panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block px-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 grid place-items-center text-zinc-950 shadow-glow">
              <Zap size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.22em] uppercase text-zinc-500">
                {APP_NAME}
              </div>
              <div className="text-zinc-300 text-sm font-medium">
                {APP_TAGLINE}
              </div>
            </div>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.05]">
            Track the day.{" "}
            <span className="text-gradient">Compound the year.</span>
          </h1>
          <p className="mt-4 text-zinc-400 max-w-md leading-relaxed">
            A premium discipline operating system for your faith, work, trade,
            body and mind. Earn XP, build streaks, climb ranks — and keep every
            record synced to your account.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-2.5 max-w-md">
            <Feature
              icon={<Sparkles size={14} />}
              title="Daily quests + XP"
              desc="Mini-RPG layer over your real routines"
            />
            <Feature
              icon={<Flame size={14} />}
              title="Streaks & ranks"
              desc="From E · Beginner to SS · Mastery"
            />
            <Feature
              icon={<Trophy size={14} />}
              title="Achievements"
              desc="Locked, unlockable, and very satisfying"
            />
            <Feature
              icon={<Shield size={14} />}
              title="Your data, your account"
              desc="Synced via Firebase — safe across devices"
            />
          </div>
        </motion.div>

        {/* Login card */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <Card className="p-6 sm:p-8 relative">
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 grid place-items-center text-zinc-950 shadow-glow">
                <Zap size={20} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-[10px] tracking-[0.22em] uppercase text-zinc-500">
                  {APP_NAME}
                </div>
                <div className="text-zinc-300 text-sm font-medium">
                  {APP_TAGLINE}
                </div>
              </div>
            </div>

            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Sign in
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-zinc-100">
              Welcome back, Operator.
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-sm">
              Sign in with Google. Your records, XP, achievements and streaks
              will follow you across every device.
            </p>

            <div className="mt-6">
              <button
                onClick={signIn}
                disabled={!isFirebaseConfigured || loading}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-zinc-900 font-semibold hover:bg-zinc-50 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-glow"
              >
                <GoogleIcon />
                {loading ? "Signing you in…" : "Continue with Google"}
              </button>
              {error && (
                <div className="mt-3 text-[12px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}
            </div>

            {!isFirebaseConfigured && (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                  <AlertTriangle size={14} /> Firebase not configured
                </div>
                <p className="text-[12px] text-zinc-400 mt-2">
                  Add the Firebase env vars to Vercel (Settings → Environment
                  Variables) and redeploy. The setup checklist is in the README.
                </p>
              </div>
            )}

            <div className="mt-7 pt-5 border-t border-white/5 text-[11px] text-zinc-500 leading-relaxed">
              By continuing you agree to keep showing up. We only store the
              records you log — no tracking, no ads.
            </div>

            <div className="absolute -bottom-3 right-6 hidden sm:flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-600">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulseSoft" />
              v0.1 · cloud-synced
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-start gap-3 px-3.5 py-3 rounded-xl glass">
      <span className="mt-0.5 w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-300 grid place-items-center">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
          {title}
          <CheckCircle2 size={12} className="text-emerald-400" />
        </div>
        <div className="text-[12px] text-zinc-500">{desc}</div>
      </div>
      <ChevronRight size={14} className="text-zinc-600 ml-auto self-center" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8L6.3 33.6C9.6 39.9 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2c-.4.4 6.6-4.8 6.6-14.8 0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
