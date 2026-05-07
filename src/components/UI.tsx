import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORIES, STATUS_META } from "../constants";
import type { CategoryKey, Status } from "../types";

/* ---------------- Card ---------------- */
export function Card({
  className = "",
  children,
  as: As = "div",
  ...rest
}: any) {
  return (
    <As
      className={`glass rounded-2xl shadow-card ${className}`}
      {...rest}
    >
      {children}
    </As>
  );
}

/* ---------------- Section header ---------------- */
export function SectionHeader({
  icon,
  title,
  hint,
  right,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3 px-1">
      <div className="flex items-center gap-2 min-w-0">
        {icon && <span className="text-zinc-400 shrink-0">{icon}</span>}
        <h3 className="text-[11px] tracking-[0.18em] uppercase text-zinc-400 font-semibold">
          {title}
        </h3>
        {hint && (
          <span className="text-[11px] text-zinc-500 truncate">· {hint}</span>
        )}
      </div>
      {right}
    </div>
  );
}

/* ---------------- StatusBadge ---------------- */
export function StatusBadge({ status, dense = false }: { status: Status; dense?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${m.bg} ${m.text} ${m.border} border rounded-full ${
        dense ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"
      } font-semibold tracking-wider uppercase`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

/* ---------------- CategoryBadge ---------------- */
export function CategoryBadge({ k, dense }: { k: CategoryKey; dense?: boolean }) {
  const c = CATEGORIES[k];
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full ${c.chip} ${
        dense ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]"
      } uppercase tracking-wider font-medium`}
    >
      <span aria-hidden>{c.emoji}</span>
      {c.label}
    </span>
  );
}

/* ---------------- ProgressRing ---------------- */
export function ProgressRing({
  value,
  size = 64,
  stroke = 6,
  color = "#22d3ee",
  trackColor = "rgba(255,255,255,0.06)",
  label,
  sublabel,
}: {
  value: number; // 0..100
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: ReactNode;
  sublabel?: ReactNode;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * circumference;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Progress ${value}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && <div className="text-base font-bold tabular text-white leading-none">{label}</div>}
        {sublabel && <div className="text-[10px] text-zinc-500 mt-0.5 tracking-widest uppercase">{sublabel}</div>}
      </div>
    </div>
  );
}

/* ---------------- XPBar ---------------- */
export function XPBar({
  value,
  max,
  level,
  className = "",
}: {
  value: number;
  max: number;
  level: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5 text-[11px]">
        <span className="font-semibold text-zinc-300 tracking-wider uppercase">
          LVL {level}
        </span>
        <span className="text-zinc-500 tabular">
          {value} / {max} XP
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

/* ---------------- Linear meter ---------------- */
export function Meter({
  value,
  max = 100,
  color = "from-cyan-400 to-sky-500",
  className = "",
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={`h-1.5 w-full rounded-full bg-white/5 overflow-hidden ${className}`}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      />
    </div>
  );
}

/* ---------------- Stat tile ---------------- */
export function StatTile({
  label,
  value,
  hint,
  icon,
  accent = "cyan",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  accent?: "cyan" | "violet" | "emerald" | "amber" | "rose";
}) {
  const map: Record<string, string> = {
    cyan: "text-cyan-300",
    violet: "text-violet-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    rose: "text-rose-300",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500">
        <span>{label}</span>
        {icon && <span className={map[accent]}>{icon}</span>}
      </div>
      <div className={`mt-2 text-2xl font-bold tabular ${map[accent]}`}>{value}</div>
      {hint && <div className="text-[11px] text-zinc-500 mt-0.5">{hint}</div>}
    </Card>
  );
}

/* ---------------- Checkbox ---------------- */
export function Checkbox({
  checked,
  onChange,
  size = 22,
  color = "#22d3ee",
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  size?: number;
  color?: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label ?? "Toggle task"}
      onClick={() => onChange(!checked)}
      className="relative inline-flex items-center justify-center rounded-full transition-transform active:scale-95"
      style={{ width: size, height: size }}
    >
      {checked ? (
        <motion.span
          key="checked"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          className="block"
        >
          <CheckCircle2 size={size} color={color} strokeWidth={2.4} />
        </motion.span>
      ) : (
        <Circle
          size={size}
          className="text-zinc-600 hover:text-zinc-400 transition-colors"
          strokeWidth={1.6}
        />
      )}
    </button>
  );
}

/* ---------------- Empty state ---------------- */
export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon?: ReactNode;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-8 text-center flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
        {icon ?? <Sparkles size={20} />}
      </div>
      <div>
        <div className="font-semibold text-zinc-200">{title}</div>
        {desc && <div className="text-sm text-zinc-500 mt-1">{desc}</div>}
      </div>
      {action}
    </Card>
  );
}

/* ---------------- Streak chip ---------------- */
export function StreakChip({ days, label = "streak" }: { days: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider px-2 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300">
      <Flame size={12} />
      <span className="tabular font-semibold">{days}</span>
      <span className="text-orange-300/80">{label}</span>
    </span>
  );
}

/* ---------------- Tag ---------------- */
export function Tag({ children, accent = "zinc" }: { children: ReactNode; accent?: string }) {
  const m: Record<string, string> = {
    zinc: "bg-white/5 text-zinc-300 border-white/10",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded-md border ${
        m[accent] ?? m.zinc
      }`}
    >
      {children}
    </span>
  );
}

/* ---------------- Soft button ---------------- */
export function Btn({
  children,
  onClick,
  variant = "ghost",
  className = "",
  type = "button",
  icon,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "danger";
  className?: string;
  type?: "button" | "submit";
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";
  const styles: Record<string, string> = {
    ghost:
      "bg-white/5 hover:bg-white/10 text-zinc-100 border border-white/10",
    primary:
      "bg-gradient-to-r from-cyan-400/90 to-sky-500/90 hover:from-cyan-300 hover:to-sky-400 text-zinc-950 border border-cyan-300/40 shadow-glow font-semibold",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 border border-rose-500/30",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ---------------- KV row ---------------- */
export function KV({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="text-sm font-semibold tabular text-zinc-100">{value}</div>
    </div>
  );
}

/* ---------------- Trend pill ---------------- */
export function TrendPill({ delta }: { delta: number }) {
  const positive = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
        positive
          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
      }`}
    >
      <TrendingUp size={11} className={positive ? "" : "rotate-180"} />
      {positive ? "+" : ""}
      {delta}%
    </span>
  );
}
