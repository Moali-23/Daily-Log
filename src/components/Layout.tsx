import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Dumbbell,
  Home,
  Settings as SettingsIcon,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";
import type { ReactNode } from "react";
import { APP_NAME } from "../constants";
import { useAppState } from "../state";
import {
  calculateLevel,
  getRank,
  totalXP,
  todayISO,
  calculateCompletion,
  calculateStatus,
  getTasksForDate,
} from "../helpers";
import { StatusBadge, XPBar } from "./UI";

export type PageKey =
  | "today"
  | "status"
  | "gym"
  | "calendar"
  | "targets"
  | "settings";

export const NAV_ITEMS: {
  key: PageKey;
  label: string;
  icon: ReactNode;
}[] = [
  { key: "today", label: "Today", icon: <Home size={18} /> },
  { key: "status", label: "Status", icon: <ShieldCheck size={18} /> },
  { key: "gym", label: "Gym Log", icon: <Dumbbell size={18} /> },
  { key: "calendar", label: "Calendar", icon: <CalendarIcon size={18} /> },
  { key: "targets", label: "Targets", icon: <Target size={18} /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon size={18} /> },
];

export function AppShell({
  active,
  onNavigate,
  children,
  api,
}: {
  active: PageKey;
  onNavigate: (k: PageKey) => void;
  children: ReactNode;
  api: ReturnType<typeof useAppState>;
}) {
  const { state } = api;
  const xp = totalXP(state);
  const { level, intoLevel, perLevel } = calculateLevel(xp);
  const rank = getRank(level);

  const today = todayISO();
  const todaysTasks = getTasksForDate(state, today);
  const todayRecord = state.records[today];
  const { done, total, pct } = calculateCompletion(
    todaysTasks,
    todayRecord?.completions ?? {}
  );
  const status = todayRecord
    ? calculateStatus(todaysTasks, todayRecord.completions)
    : "missed";

  return (
    <div className="app-bg min-h-screen text-zinc-100">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 fixed left-0 top-0 bottom-0 flex-col border-r border-white/5 bg-black/30 backdrop-blur-md p-4 z-30">
        <div className="px-2 mb-6 mt-1 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl gradient-accent grid place-items-center text-zinc-950 shadow-accent">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-bold tracking-tight text-zinc-100">
              {APP_NAME}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Discipline OS
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition border ${
                  isActive
                    ? "bg-white/[0.04] border-accent-soft text-zinc-100 shadow-glow"
                    : "border-transparent text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-xl gradient-accent-soft pointer-events-none"
                  />
                )}
                <span
                  className={`relative ${
                    isActive ? "text-accent" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className="font-medium relative">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-accent relative" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3 rounded-2xl glass-lift">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">
              {state.user.displayName}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-accent">
              {rank.code} · {rank.title}
            </span>
          </div>
          <XPBar value={intoLevel} max={perLevel} level={level} />
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Today</span>
            <span className="font-semibold tabular text-zinc-200">
              {done}/{total} · {pct}%
            </span>
          </div>
          <div className="mt-1.5">
            <StatusBadge status={status} />
          </div>
        </div>
      </aside>

      {/* Mobile top header */}
      <div className="md:hidden sticky top-0 z-30 bg-black/60 backdrop-blur-xl border-b border-white/5 pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-accent grid place-items-center text-zinc-950 shadow-accent">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-widest text-zinc-500 uppercase">
              {APP_NAME}
            </div>
            <div className="font-bold text-zinc-100 leading-tight truncate">
              {state.user.displayName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-widest text-accent uppercase">
              {rank.code} · {rank.title}
            </div>
            <div className="text-[11px] tabular text-zinc-300">
              LVL {level} · {intoLevel}/{perLevel}
            </div>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1.5">
            <StatusBadge status={status} dense />
            <div className="text-[11px] tabular text-zinc-400">
              {done}/{total} · {pct}%
            </div>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              key={pct}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full ${
                status === "perfect"
                  ? "bg-emerald-400"
                  : status === "strong"
                    ? "bg-lime-400"
                    : status === "partial"
                      ? "bg-orange-400"
                      : "bg-rose-400"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Page content */}
      <main className="md:pl-64 lg:pl-72">
        <div className="px-4 md:px-8 py-4 md:py-8 pb-28 md:pb-12 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-black/75 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-6">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                aria-label={item.label}
                className="relative flex flex-col items-center gap-0.5 py-2.5"
              >
                <span
                  className={
                    isActive ? "text-accent" : "text-zinc-500"
                  }
                >
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] tracking-wide ${
                    isActive ? "text-accent font-semibold" : "text-zinc-500"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-active"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full bg-accent shadow-accent"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
