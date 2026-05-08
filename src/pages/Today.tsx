import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Moon,
  Plus,
  Quote,
  Sparkles,
  Sunrise,
  Target as TargetIcon,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, CATEGORY_ORDER } from "../constants";
import {
  calculateCompletion,
  calculateLevel,
  calculateStatus,
  calculateXPForDate,
  dailyQuests,
  getRank,
  getTasksForDate,
  nonPerfectRunBack,
  prettyDate,
  quoteOfDay,
  streakPerfect,
  todayISO,
  totalXP,
  workoutForDate,
} from "../helpers";
import { useAppState } from "../state";
import type { CategoryKey } from "../types";
import { EditRecordModal, AchievementToast } from "../components/Modals";
import {
  Btn,
  Card,
  Checkbox,
  ProgressRing,
  SectionHeader,
  StatusBadge,
  StreakChip,
  Tag,
  XPBar,
} from "../components/UI";
import { TaskCard } from "../components/TaskCard";
import confetti from "canvas-confetti";
import { ACHIEVEMENT_BY_ID } from "../helpers";

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;

export function TodayPage({ api }: { api: ReturnType<typeof useAppState> }) {
  const { state, toggleTask } = api;
  const today = todayISO();
  const tasks = getTasksForDate(state, today);
  const record = state.records[today];
  const completions = record?.completions ?? {};

  const { done, total, pct } = calculateCompletion(tasks, completions);
  const status = record ? calculateStatus(tasks, completions) : "missed";
  const xpEarned = record ? calculateXPForDate(tasks, completions) : 0;
  const xp = totalXP(state);
  const { level, intoLevel, perLevel } = calculateLevel(xp);
  const rank = getRank(level);
  const streak = streakPerfect(state);
  const quote = quoteOfDay(today);
  const nonPerfect = nonPerfectRunBack(state);
  const todayWorkout = workoutForDate(state, today);

  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const [knownUnlocked, setKnownUnlocked] = useState<string[]>(state.unlocked);

  // Detect new achievements & confetti for perfect day
  useEffect(() => {
    const fresh = state.unlocked.filter((id) => !knownUnlocked.includes(id));
    if (fresh.length > 0) {
      const a = ACHIEVEMENT_BY_ID[fresh[0]];
      if (a) {
        setToast({ title: a.title, desc: a.desc });
        if (!state.user.reducedMotion) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.7 },
            colors: ["#22d3ee", "#a78bfa", "#34d399", "#f59e0b"],
          });
        }
      }
      setKnownUnlocked(state.unlocked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.unlocked]);

  // Confetti when status flips to perfect
  const [wasPerfect, setWasPerfect] = useState(status === "perfect");
  useEffect(() => {
    if (status === "perfect" && !wasPerfect && !state.user.reducedMotion) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#22d3ee", "#a78bfa", "#34d399", "#f59e0b", "#fb7185"],
      });
    }
    setWasPerfect(status === "perfect");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Group tasks by category
  const grouped = useMemo(() => {
    const m: Record<CategoryKey, typeof tasks> = {
      faith: [],
      work: [],
      trade: [],
      body: [],
      mind: [],
      review: [],
    };
    for (const t of tasks) m[t.category].push(t);
    return m;
  }, [tasks]);

  const quests = dailyQuests(state, today);
  const questsDone = quests.filter((q) => q.done).length;

  return (
    <>
      {/* Hero */}
      <div className="grid md:grid-cols-[1.3fr_1fr] gap-4 mb-5">
        <Card className="relative overflow-hidden p-5 sm:p-6 glass-lift">
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--accent) / 0.55), transparent)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-12 w-56 h-56 rounded-full opacity-30 blur-3xl"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--accent-2) / 0.45), transparent)",
            }}
          />
          <div className="flex items-center gap-2 text-[10px] tracking-widest text-zinc-500 uppercase">
            <CalendarDays size={12} /> {prettyDate(today)}
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">
            Hey {state.user.displayName.split(" ")[0]} —{" "}
            <span className="text-gradient">
              {pct === 100
                ? "perfect day."
                : pct >= 70
                  ? "you're locked in."
                  : pct >= 30
                    ? "keep stacking wins."
                    : "let's get to work."}
            </span>
          </h1>
          <div className="mt-4 grid grid-cols-[auto_1fr] gap-5 items-center">
            <ProgressRing
              value={pct}
              size={108}
              stroke={9}
              color={
                status === "perfect"
                  ? "#10b981"
                  : status === "strong"
                    ? "#84cc16"
                    : status === "partial"
                      ? "#fb923c"
                      : "#fb7185"
              }
              label={<span className="text-xl">{pct}%</span>}
              sublabel="Today"
            />
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={status} />
                {streak > 0 && <StreakChip days={streak} label="perfect" />}
                <span className="text-[11px] tabular text-zinc-400">
                  {done}/{total} tasks
                </span>
              </div>
              <XPBar value={intoLevel} max={perLevel} level={level} />
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>
                  {rank.code} · <span className="text-accent">{rank.title}</span>
                </span>
                <span className="tabular text-amber-300">+{xpEarned} XP today</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Daily quests */}
        <Card className="p-5 glass-lift">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-accent">
                <Sparkles size={14} />
              </span>
              <h3 className="text-[11px] tracking-[0.18em] uppercase text-zinc-400 font-semibold">
                Daily Quests
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] tabular font-semibold text-accent bg-accent-soft border border-accent-soft rounded-full px-2 py-0.5">
              {questsDone}/{quests.length}
            </span>
          </div>
          <div className="space-y-2">
            {quests.map((q) => (
              <motion.div
                key={q.id}
                whileHover={{ x: 2 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition ${
                  q.done
                    ? "bg-emerald-500/8 border-emerald-500/25 shadow-[0_0_18px_-8px_rgba(16,185,129,0.5)]"
                    : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <span
                  className={
                    q.done ? "text-emerald-400" : "text-zinc-600"
                  }
                >
                  <CheckCircle2 size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm leading-tight ${q.done ? "text-emerald-100" : "text-zinc-100"}`}>
                    {q.title}
                  </div>
                  {q.progress && (
                    <div className="text-[11px] text-zinc-500 tabular">
                      {q.progress.done}/{q.progress.total}
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-semibold text-amber-300 tabular">
                  +{q.xp} XP
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recovery banner */}
      {nonPerfect >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <Card className="p-4 border-rose-500/25 bg-gradient-to-r from-rose-500/10 to-transparent flex items-start gap-3">
            <span className="mt-0.5 text-rose-300">
              <AlertTriangle size={18} />
            </span>
            <div className="flex-1">
              <div className="text-rose-200 font-semibold tracking-wide uppercase text-[12px]">
                Recovery Mode · {nonPerfect} non-perfect days
              </div>
              <div className="text-sm text-zinc-300 mt-0.5">
                Lock in a perfect day to reset the run. Focus on prayers, the
                workout and trading discipline — those are your minimum viable
                wins.
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quote */}
      <Card className="p-5 mb-5 bg-zinc-900/40 border-amber-500/15 relative overflow-hidden">
        <Quote className="absolute -top-2 -left-2 text-amber-500/15" size={56} />
        <div className="text-base sm:text-lg text-zinc-200 italic">
          "{quote.text}"
        </div>
        <div className="text-[11px] uppercase tracking-widest text-amber-300/80 mt-2">
          — {quote.by}
        </div>
      </Card>

      {/* Prayer tracker */}
      <SectionHeader
        icon={<Moon size={14} />}
        title="Prayers"
        hint="Tap to mark complete"
      />
      <Card className="p-3 sm:p-4 mb-5">
        <PrayerTracker
          completions={completions}
          onToggle={(id) => toggleTask(today, id)}
        />
      </Card>

      {/* Workout strip */}
      <SectionHeader
        icon={<Zap size={14} />}
        title="Today's Lift"
        hint={todayWorkout.muscles}
      />
      <Card className="p-4 mb-5 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl grid place-items-center ${
            todayWorkout.rest
              ? "bg-zinc-800/60 text-zinc-400"
              : "bg-emerald-500/15 text-emerald-300"
          }`}
        >
          <Zap size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-zinc-100">
            {todayWorkout.title}
          </div>
          <div className="text-[11px] text-zinc-400">{todayWorkout.muscles}</div>
        </div>
        {!todayWorkout.rest && (
          <WorkoutToggle
            checked={
              !!completions[
                tasks.find((t) => t.isWorkout)?.id ?? ""
              ]
            }
            onToggle={() => {
              const w = tasks.find((t) => t.isWorkout);
              if (w) toggleTask(today, w.id);
            }}
          />
        )}
      </Card>

      {/* Sections */}
      {CATEGORY_ORDER.map((k) => {
        const list = grouped[k].filter((t) => !t.isPrayer && !t.isWorkout);
        if (list.length === 0) return null;
        const cat = CATEGORIES[k];
        return (
          <div key={k} className="mb-5">
            <SectionHeader
              icon={<span>{cat.emoji}</span>}
              title={cat.label}
              hint={`${list.filter((t) => completions[t.id]).length}/${list.length}`}
              right={
                k === "review" ? (
                  <Btn
                    onClick={() => setEditOpen(true)}
                    variant="ghost"
                    className="text-xs px-2 py-1"
                  >
                    Open Review
                  </Btn>
                ) : null
              }
            />
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {list.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    checked={!!completions[t.id]}
                    onToggle={() => toggleTask(today, t.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        );
      })}

      <Card className="p-4 mb-2 flex items-center gap-3 glass-lift">
        <div className="w-10 h-10 rounded-xl bg-accent-soft border border-accent-soft grid place-items-center text-accent shadow-accent">
          <TargetIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-widest text-zinc-500">
            Mission
          </div>
          <div className="text-sm text-zinc-200 leading-snug">
            {state.user.mainGoal}
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-end mt-4">
        <Btn variant="ghost" icon={<Plus size={14} />} onClick={() => setEditOpen(true)}>
          Edit / add task
        </Btn>
      </div>

      <EditRecordModal
        date={today}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        api={api}
      />
      <AchievementToast
        open={!!toast}
        title={toast?.title ?? ""}
        desc={toast?.desc ?? ""}
        onClose={() => setToast(null)}
      />
    </>
  );
}

/* ---------------- Prayer Tracker ---------------- */
function PrayerTracker({
  completions,
  onToggle,
}: {
  completions: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const items = PRAYER_ORDER.map((p) => ({
    id: `prayer_${p}`,
    name: p[0].toUpperCase() + p.slice(1),
  }));
  const done = items.filter((i) => completions[i.id]).length;
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="text-sm">
          <span className="text-amber-300 font-semibold tabular">{done}</span>
          <span className="text-zinc-500 tabular"> / {items.length}</span>
          <span className="text-zinc-500 ml-2">complete</span>
        </div>
        <Tag accent="amber">5 daily</Tag>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {items.map((p) => {
          const checked = !!completions[p.id];
          return (
            <button
              key={p.id}
              onClick={() => onToggle(p.id)}
              className={`group relative flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition active:scale-95 ${
                checked
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-[0_0_20px_-6px_rgba(245,158,11,0.5)]"
                  : "bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/[0.05]"
              }`}
            >
              <Sunrise
                size={16}
                className={
                  checked ? "text-amber-300" : "text-zinc-500 group-hover:text-zinc-300"
                }
              />
              <span className="text-[11px] font-semibold uppercase tracking-wider">
                {p.name}
              </span>
              {checked && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 text-amber-300"
                >
                  <CheckCircle2 size={12} />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl bg-amber-500/5 border border-amber-500/15 px-3.5 py-3 text-center">
        <div className="text-amber-200 text-base sm:text-lg font-semibold" dir="rtl" lang="ar">
          إِنَّ اللّٰهَ مَعَ الصَّابِرِينَ
        </div>
        <div className="text-[11px] uppercase tracking-widest text-amber-300/80 mt-1">
          "Indeed, Allah is with the patient." — Qur'an 2:153
        </div>
      </div>
    </div>
  );
}

function WorkoutToggle({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-xl text-[11px] uppercase tracking-wider font-semibold border transition ${
        checked
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
          : "bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10"
      }`}
    >
      {checked ? "Logged" : "Mark done"}
    </button>
  );
}
