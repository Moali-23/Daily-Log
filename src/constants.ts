import type { CategoryKey, Status } from "./types";

export const APP_NAME = "Ascend";
export const APP_TAGLINE = "Discipline Operating System";

export const XP_PER_LEVEL = 250;

export const RANKS: { code: string; title: string; minLevel: number }[] = [
  { code: "E", title: "Beginner", minLevel: 1 },
  { code: "D", title: "Awakened", minLevel: 5 },
  { code: "C", title: "Disciplined", minLevel: 15 },
  { code: "B", title: "Relentless", minLevel: 30 },
  { code: "A", title: "Elite", minLevel: 50 },
  { code: "S", title: "Operator", minLevel: 75 },
  { code: "SS", title: "Mastery", minLevel: 100 },
];

type CatMeta = {
  key: CategoryKey;
  label: string;
  short: string;
  emoji: string;
  hex: string;
  ring: string;
  text: string;
  bg: string;
  border: string;
  chip: string;
};

export const CATEGORIES: Record<CategoryKey, CatMeta> = {
  faith: {
    key: "faith",
    label: "Faith",
    short: "Deen",
    emoji: "🕌",
    hex: "#f59e0b",
    ring: "ring-amber-500/30",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/20",
  },
  trade: {
    key: "trade",
    label: "Trade",
    short: "Trade",
    emoji: "📈",
    hex: "#a78bfa",
    ring: "ring-violet-500/30",
    text: "text-violet-300",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    chip: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  },
  body: {
    key: "body",
    label: "Body",
    short: "Body",
    emoji: "🏋️",
    hex: "#34d399",
    ring: "ring-emerald-500/30",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  },
  mind: {
    key: "mind",
    label: "Mind",
    short: "Mind",
    emoji: "🧠",
    hex: "#38bdf8",
    ring: "ring-sky-500/30",
    text: "text-sky-300",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    chip: "bg-sky-500/15 text-sky-300 border-sky-500/20",
  },
  work: {
    key: "work",
    label: "Work",
    short: "Work",
    emoji: "💼",
    hex: "#22d3ee",
    ring: "ring-cyan-500/30",
    text: "text-cyan-300",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/20",
  },
  review: {
    key: "review",
    label: "Review",
    short: "Wrap",
    emoji: "🌙",
    hex: "#fb7185",
    ring: "ring-rose-500/30",
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/20",
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "faith",
  "work",
  "trade",
  "body",
  "mind",
  "review",
];

export const STATUS_META: Record<
  Status,
  { label: string; text: string; bg: string; border: string; dot: string; hex: string }
> = {
  perfect: {
    label: "Perfect",
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    dot: "bg-emerald-400",
    hex: "#10b981",
  },
  strong: {
    label: "Strong",
    text: "text-lime-300",
    bg: "bg-lime-500/15",
    border: "border-lime-500/30",
    dot: "bg-lime-400",
    hex: "#84cc16",
  },
  partial: {
    label: "Partial",
    text: "text-orange-300",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
    hex: "#fb923c",
  },
  missed: {
    label: "Missed",
    text: "text-rose-300",
    bg: "bg-rose-500/15",
    border: "border-rose-500/30",
    dot: "bg-rose-400",
    hex: "#fb7185",
  },
  none: {
    label: "—",
    text: "text-zinc-500",
    bg: "bg-zinc-800/40",
    border: "border-zinc-800",
    dot: "bg-zinc-700",
    hex: "#3f3f46",
  },
};

export const QUOTES: { text: string; by: string }[] = [
  { text: "Discipline equals freedom.", by: "Jocko Willink" },
  { text: "Indeed, Allah is with the patient.", by: "Qur'an 2:153" },
  { text: "Persistence guarantees that results are inevitable.", by: "Paramahansa Yogananda" },
  { text: "We are what we repeatedly do.", by: "Will Durant" },
  { text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.", by: "John C. Maxwell" },
  { text: "The successful warrior is the average man, with laser-like focus.", by: "Bruce Lee" },
  { text: "He who has a why to live for can bear almost any how.", by: "Friedrich Nietzsche" },
  { text: "Mountains do not rise without earthquakes.", by: "Katherine MacKenett" },
];

export const ACHIEVEMENTS: {
  id: string;
  title: string;
  desc: string;
  icon: string;
}[] = [
  { id: "first_blood", title: "First Blood", desc: "Your first perfect day", icon: "droplet" },
  { id: "momentum", title: "Momentum", desc: "3 perfect days in a row", icon: "mountain" },
  { id: "locked_in", title: "Locked In", desc: "7 perfect days in a row", icon: "lock" },
  { id: "discipline", title: "Discipline", desc: "14 consecutive perfect days", icon: "shield" },
  { id: "iron_will", title: "Iron Will", desc: "30 perfect days total", icon: "swords" },
  { id: "salah_strong", title: "Salah Strong", desc: "All prayers complete for 7 days", icon: "moon" },
  { id: "market_monk", title: "Market Monk", desc: "All trading tasks for 7 days", icon: "trending-up" },
  { id: "built_different", title: "Built Different", desc: "Complete the 8-day gym cycle twice", icon: "dumbbell" },
  { id: "comeback", title: "Comeback", desc: "Perfect day after 3 missed days", icon: "rotate-ccw" },
];
