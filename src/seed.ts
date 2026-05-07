import type { AppState, Goal, Task, WorkoutDay } from "./types";

export const DEFAULT_TASKS: Task[] = [
  // FAITH
  { id: "prayer_fajr", title: "Fajr", category: "faith", xp: 5, priority: "high", isPrayer: true, prayerName: "fajr", time: "Pre-dawn" },
  { id: "prayer_dhuhr", title: "Dhuhr", category: "faith", xp: 5, priority: "high", isPrayer: true, prayerName: "dhuhr", time: "Midday" },
  { id: "prayer_asr", title: "Asr", category: "faith", xp: 5, priority: "high", isPrayer: true, prayerName: "asr", time: "Afternoon" },
  { id: "prayer_maghrib", title: "Maghrib", category: "faith", xp: 5, priority: "high", isPrayer: true, prayerName: "maghrib", time: "Sunset" },
  { id: "prayer_isha", title: "Isha", category: "faith", xp: 5, priority: "high", isPrayer: true, prayerName: "isha", time: "Night" },
  { id: "quran_read", title: "Qur'an reading", description: "10 mins minimum, with reflection", category: "faith", xp: 10, priority: "med", tag: "Daily" },

  // WORK
  { id: "work_shift", title: "Work Shift", description: "8am – 12pm · Monday to Friday", category: "work", xp: 10, priority: "high", time: "8:00 AM" },
  { id: "deep_work", title: "Deep Work Session", description: "60 min uninterrupted focus block", category: "work", xp: 10, priority: "high" },

  // TRADE
  { id: "premarket_plan", title: "Pre-market plan", description: "Bias · Key levels · Triggers", category: "trade", xp: 10, priority: "high", time: "Pre-open" },
  { id: "trading_rules", title: "Trading rules followed", description: "Plan executed · No-trade days count", category: "trade", xp: 10, priority: "high", tag: "1–2 trades · 1% risk" },
  { id: "deep_backtesting", title: "Deep Backtesting", description: "4 weeks of data · outlooks + trades logged", category: "trade", xp: 10, priority: "med" },
  { id: "trade_log_review", title: "Trade Log Review", description: "Review all live executions today", category: "trade", xp: 5, priority: "med" },
  { id: "tomorrow_outlook", title: "Tomorrow's Outlook", description: "Chart prep · Key levels · Bias", category: "trade", xp: 5, priority: "med" },

  // BODY
  { id: "workout", title: "Complete workout", description: "Cycle day workout · log key sets", category: "body", xp: 15, priority: "high", isWorkout: true },
  { id: "steps", title: "8,000 steps", category: "body", xp: 5, priority: "low", tag: "Movement" },
  { id: "water", title: "Water intake (3L)", category: "body", xp: 5, priority: "low" },
  { id: "recovery", title: "Sauna / recovery", description: "Optional · sauna, steam, mobility", category: "body", xp: 5, priority: "low" },

  // MIND
  { id: "read_pages", title: "Read 10 pages", category: "mind", xp: 5, priority: "med" },
  { id: "journal", title: "Journal reflection", description: "Wins, losses, lessons", category: "mind", xp: 5, priority: "med" },

  // REVIEW
  { id: "evening_wrap", title: "Evening Wrap", description: "Mood · Energy · Focus · Notes", category: "review", xp: 10, priority: "med", time: "9:00 PM" },
];

export const DEFAULT_WORKOUT_CYCLE: WorkoutDay[] = [
  { index: 1, title: "Chest & Triceps", muscles: "Chest · Triceps" },
  { index: 2, title: "Back & Biceps", muscles: "Back · Biceps" },
  { index: 3, title: "Legs & Shoulders", muscles: "Legs · Shoulders · Sauna · Steam" },
  { index: 4, title: "Rest Day", muscles: "Recovery · Mobility", rest: true },
  { index: 5, title: "Chest & Back", muscles: "Chest · Back" },
  { index: 6, title: "Biceps & Triceps", muscles: "Biceps · Triceps" },
  { index: 7, title: "Legs & Shoulders", muscles: "Legs · Shoulders" },
  { index: 8, title: "Rest Day", muscles: "Recovery · Mobility", rest: true },
];

export const DEFAULT_GOALS: Goal[] = [
  {
    id: "g_2026",
    title: "Funded Trading Income",
    metric: "£10,000 / month",
    targetDate: "2026-12-31",
    category: "Trading",
    notes: "Funded accounts at scale. Risk respected. No revenge trades.",
    accent: "violet",
  },
  {
    id: "g_2028",
    title: "Full-time Independence",
    metric: "£200,000 / month",
    targetDate: "2028-12-31",
    category: "Lifestyle",
    notes: "Operate from anywhere. Time freedom. Compounding skill.",
    accent: "amber",
  },
];

export function buildInitialState(): AppState {
  return {
    user: {
      displayName: "Operator",
      mainGoal: "Build a fully-funded trading career while staying disciplined in faith, body and mind.",
      reducedMotion: false,
      accent: "cyan",
      cycleStartDate: new Date().toISOString().slice(0, 10),
    },
    defaultTasks: DEFAULT_TASKS,
    records: {},
    goals: DEFAULT_GOALS,
    workoutCycle: DEFAULT_WORKOUT_CYCLE,
    unlocked: [],
    schemaVersion: 1,
  };
}
