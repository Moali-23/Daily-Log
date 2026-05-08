import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Copy,
  Edit3,
  Quote,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CATEGORIES, CATEGORY_ORDER, STATUS_META } from "../constants";
import {
  calculateCompletion,
  calculateLevel,
  calculateStatus,
  calculateXPForDate,
  categoryStats,
  getRank,
  getTasksForDate,
  isCustomTask,
  prettyDate,
  quoteOfDay,
  totalXP,
} from "../helpers";
import { useAppState } from "../state";
import type { CategoryKey, Task } from "../types";
import { Btn, Card, Meter, ProgressRing, StatusBadge, StreakChip, Tag } from "./UI";
import { TaskCard } from "./TaskCard";
import { accentHex } from "../theme";

/* ---------------- Modal frame ---------------- */
export function Modal({
  open,
  onClose,
  children,
  title,
  size = "md",
  hideHeader = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  hideHeader?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const widths: Record<string, string> = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
    xl: "max-w-3xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className={`relative w-full ${widths[size]} max-h-[92vh] overflow-y-auto bg-ink-900 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl`}
          >
            {!hideHeader && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-ink-900/95 backdrop-blur">
                <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className={hideHeader ? "" : "p-5"}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Confirm Dialog ---------------- */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} hideHeader size="sm">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl grid place-items-center ${
              variant === "danger"
                ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                : "bg-accent-soft text-accent border border-accent-soft"
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-zinc-100 leading-tight">
              {title}
            </h3>
            <div className="mt-1.5 text-sm text-zinc-400 leading-snug">
              {message}
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Btn variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Btn>
          <Btn variant={variant === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Build a shareable text summary ---------------- */
export function buildShareSummary(args: {
  date: string;
  status: string;
  pct: number;
  done: number;
  total: number;
  xpToday: number;
  level: number;
  rank: string;
  streak?: number;
  cats: { label: string; done: number; total: number }[];
  quote: { text: string; by: string };
  displayName: string;
}) {
  const lines = [
    `Ascend · ${prettyDate(args.date)}`,
    `${args.status.toUpperCase()} · ${args.done}/${args.total} tasks · ${args.pct}%`,
    `+${args.xpToday} XP · LVL ${args.level} · ${args.rank}`,
  ];
  if (args.streak && args.streak > 0) lines.push(`Streak: ${args.streak} perfect days`);
  lines.push("");
  for (const c of args.cats) {
    if (c.total > 0) lines.push(`  • ${c.label}: ${c.done}/${c.total}`);
  }
  lines.push("");
  lines.push(`"${args.quote.text}"`);
  lines.push(`— ${args.quote.by}`);
  lines.push("");
  lines.push(`— ${args.displayName}`);
  return lines.join("\n");
}

/* ---------------- Daily Summary / Share Card ---------------- */
export function DailySummaryModal({
  date,
  open,
  onClose,
  api,
  onEdit,
}: {
  date: string;
  open: boolean;
  onClose: () => void;
  api: ReturnType<typeof useAppState>;
  onEdit: () => void;
}) {
  const { state } = api;
  const tasks = getTasksForDate(state, date);
  const record = state.records[date];
  const completions = record?.completions ?? {};
  const { done, total, pct } = calculateCompletion(tasks, completions);
  const status = record ? calculateStatus(tasks, completions) : "missed";
  const xpEarned = record ? calculateXPForDate(tasks, completions) : 0;
  const cats = categoryStats(state, date);
  const quote = quoteOfDay(date);
  const meta = STATUS_META[status];

  const xp = totalXP(state);
  const { level } = calculateLevel(xp);
  const rank = getRank(level);

  const accent = state.user.accent;
  const ringHex = status === "perfect" ? "#10b981"
    : status === "strong" ? "#84cc16"
    : status === "partial" ? "#fb923c"
    : status === "missed" ? "#fb7185"
    : accentHex(accent);

  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = buildShareSummary({
      date,
      status,
      pct,
      done,
      total,
      xpToday: xpEarned,
      level,
      rank: `${rank.code} · ${rank.title}`,
      cats: CATEGORY_ORDER.map((k) => ({
        label: CATEGORIES[k].label,
        done: cats[k].done,
        total: cats[k].total,
      })),
      quote,
      displayName: state.user.displayName,
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    const text = buildShareSummary({
      date,
      status,
      pct,
      done,
      total,
      xpToday: xpEarned,
      level,
      rank: `${rank.code} · ${rank.title}`,
      cats: CATEGORY_ORDER.map((k) => ({
        label: CATEGORIES[k].label,
        done: cats[k].done,
        total: cats[k].total,
      })),
      quote,
      displayName: state.user.displayName,
    });
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `Ascend · ${prettyDate(date)}`,
          text,
        });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    handleCopy();
  }

  const dateObj = new Date(date + "T00:00:00");
  const dayName = dateObj.toLocaleDateString(undefined, { weekday: "long" });
  const dayDate = dateObj.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Modal open={open} onClose={onClose} hideHeader size="lg">
      {/* Animated gradient border */}
      <div className="gradient-border m-3 sm:m-4">
        <div className="rounded-[22px] bg-gradient-to-b from-ink-900 via-ink-900 to-ink-900/95 overflow-hidden relative">
          {/* close button floats top-right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur text-zinc-300 hover:text-zinc-100 border border-white/10"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Floating orbs */}
          <div
            className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full blur-3xl opacity-50"
            style={{ background: `radial-gradient(closest-side, ${meta.hex}55, transparent)` }}
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 w-72 h-72 rounded-full blur-3xl opacity-40"
            style={{ background: `radial-gradient(closest-side, ${ringHex}40, transparent)` }}
          />

          {/* Header */}
          <div className="relative px-5 sm:px-7 pt-7">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em]">
              <span className="text-zinc-400 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent live-dot" />
                Today's Dispatch
              </span>
              <span className="text-zinc-500">
                {dayName} · {dayDate}
              </span>
            </div>

            {/* Hero */}
            <div className="mt-5 grid grid-cols-[auto_1fr] gap-5 items-center">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-full blur-2xl opacity-50"
                  style={{ background: `radial-gradient(closest-side, ${ringHex}66, transparent 70%)` }}
                />
                <ProgressRing
                  value={pct}
                  size={140}
                  stroke={11}
                  color={ringHex}
                  label={
                    <span className="text-3xl sm:text-4xl font-bold text-gradient">
                      {pct}%
                    </span>
                  }
                  sublabel={meta.label}
                />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {state.user.displayName}
                </div>
                <h2 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100 leading-[1.05]">
                  {pct === 100
                    ? "Perfect run."
                    : pct >= 70
                      ? "Locked in."
                      : pct >= 30
                        ? "Stacking wins."
                        : "Recovery mode."}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge status={status} />
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                    +{xpEarned} XP
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent bg-accent-soft border border-accent-soft rounded-full px-2 py-0.5">
                    {rank.code} · {rank.title}
                  </span>
                  <span className="text-[11px] text-zinc-400 tabular">
                    LVL {level}
                  </span>
                </div>
                <div className="mt-2 text-[12px] text-zinc-500 tabular">
                  {done}/{total} tasks complete
                </div>
              </div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="relative px-5 sm:px-7 mt-6">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-3">
              Category breakdown
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORY_ORDER.map((k) => {
                const c = CATEGORIES[k];
                const s = cats[k];
                const p = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
                return (
                  <div
                    key={k}
                    className="rounded-xl border px-3 py-2.5"
                    style={{
                      background: `linear-gradient(135deg, ${c.hex}10, transparent)`,
                      borderColor: `${c.hex}33`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] uppercase tracking-wider font-semibold`} style={{ color: c.hex }}>
                        {c.emoji} {c.label}
                      </span>
                      <span className="text-[11px] tabular text-zinc-300">
                        {s.done}/{s.total}
                      </span>
                    </div>
                    <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${p}%` }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: c.hex }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quote */}
          <div className="relative mx-5 sm:mx-7 mt-5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/8 to-transparent p-4 overflow-hidden">
            <Quote className="absolute -top-1 -left-1 text-amber-500/15" size={48} />
            <div className="relative text-sm sm:text-base text-zinc-200 italic leading-snug">
              "{quote.text}"
            </div>
            <div className="relative text-[11px] uppercase tracking-widest text-amber-300/80 mt-2">
              — {quote.by}
            </div>
          </div>

          {/* Footer brand */}
          <div className="relative px-5 sm:px-7 mt-5 mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
            <span className="text-zinc-500">Ascend · Discipline OS</span>
            <span className="text-zinc-600">v0.1</span>
          </div>

          {/* Actions */}
          <div className="relative px-5 sm:px-7 pb-6 mt-3 flex flex-wrap items-center gap-2 justify-end">
            <Btn variant="ghost" onClick={handleCopy} icon={copied ? <Check size={14} /> : <Copy size={14} />}>
              {copied ? "Copied" : "Copy summary"}
            </Btn>
            <Btn variant="ghost" onClick={handleShare} icon={<Share2 size={14} />}>
              Share
            </Btn>
            <Btn variant="primary" onClick={onEdit} icon={<Edit3 size={14} />}>
              Edit record
            </Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Edit Record Modal ---------------- */
export function EditRecordModal({
  date,
  open,
  onClose,
  api,
}: {
  date: string;
  open: boolean;
  onClose: () => void;
  api: ReturnType<typeof useAppState>;
}) {
  const { state, toggleTask, removeCustomTask, updateReview, addCustomTask } = api;
  const record = state.records[date];
  const allTasks = getTasksForDate(state, date);
  const defaults = state.defaultTasks;
  const customTasks = allTasks.filter((t) => isCustomTask(t, defaults));
  const routineTasks = allTasks.filter((t) => !isCustomTask(t, defaults));
  const review = record?.review ?? {};
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title={`Edit · ${prettyDate(date)}`} size="lg">
      {/* Routine */}
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-[11px] tracking-[0.18em] uppercase text-zinc-400 font-semibold">
          Routine
        </h3>
        <span className="text-[11px] tabular text-zinc-500">
          {routineTasks.filter((t) => record?.completions[t.id]).length}/
          {routineTasks.length} done
        </span>
      </div>
      <div className="space-y-2">
        {routineTasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            checked={!!record?.completions[t.id]}
            onToggle={() => toggleTask(date, t.id)}
            // No onRemove → core routine tasks cannot be deleted
          />
        ))}
      </div>

      {/* Custom tasks */}
      <div className="flex items-center justify-between mt-6 mb-2 px-1">
        <h3 className="text-[11px] tracking-[0.18em] uppercase text-zinc-400 font-semibold inline-flex items-center gap-2">
          <Sparkles size={12} className="text-accent" />
          Your custom tasks
        </h3>
        <span className="text-[11px] tabular text-zinc-500">
          {customTasks.length}
        </span>
      </div>

      {customTasks.length > 0 ? (
        <div className="space-y-2">
          {customTasks.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              isCustom
              checked={!!record?.completions[t.id]}
              onToggle={() => toggleTask(date, t.id)}
              onRemove={() => removeCustomTask(date, t.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.015] px-4 py-5 text-center">
          <div className="text-sm text-zinc-300">
            No custom tasks yet for this day.
          </div>
          <div className="text-[12px] text-zinc-500 mt-1">
            Add one below — anything you add will show a remove button next to
            it.
          </div>
        </div>
      )}

      <div className="mt-4">
        {showAdd ? (
          <AddCustomTaskInline
            onAdd={(task) => {
              addCustomTask(date, task);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        ) : (
          <Btn variant="ghost" onClick={() => setShowAdd(true)}>
            + Add custom task
          </Btn>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <RatingInput
          label="Mood"
          value={review.mood ?? 0}
          onChange={(v) => updateReview(date, { mood: v as any })}
        />
        <RatingInput
          label="Energy"
          value={review.energy ?? 0}
          onChange={(v) => updateReview(date, { energy: v as any })}
        />
        <RatingInput
          label="Focus"
          value={review.focus ?? 0}
          onChange={(v) => updateReview(date, { focus: v as any })}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ReviewField
          label="What went well today?"
          value={review.wentWell ?? ""}
          onChange={(v) => updateReview(date, { wentWell: v })}
        />
        <ReviewField
          label="What needs improvement?"
          value={review.needsImprovement ?? ""}
          onChange={(v) => updateReview(date, { needsImprovement: v })}
        />
      </div>

      <div className="mt-3">
        <ReviewField
          label="Notes"
          rows={3}
          value={review.notes ?? ""}
          onChange={(v) => updateReview(date, { notes: v })}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <Btn onClick={onClose} variant="primary">
          Save & close
        </Btn>
      </div>
    </Modal>
  );
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className={`flex-1 py-2 rounded-lg border text-sm font-semibold tabular transition active:scale-95 ${
              value >= n
                ? "bg-accent-soft text-accent border-accent-soft"
                : "bg-white/[0.02] text-zinc-500 border-white/5 hover:bg-white/5"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl bg-white/[0.03] border border-white/10 focus:border-accent-strong focus:outline-none px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
        placeholder="Type here…"
      />
    </label>
  );
}

function AddCustomTaskInline({
  onAdd,
  onCancel,
}: {
  onAdd: (t: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryKey>("work");
  const [xp, setXp] = useState(5);
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [time, setTime] = useState("");

  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 30 min mobility"
            className="input"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
            className="input"
          >
            {CATEGORY_ORDER.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="XP value">
          <input
            type="number"
            min={1}
            max={50}
            value={xp}
            onChange={(e) => setXp(parseInt(e.target.value || "5"))}
            className="input"
          />
        </Field>
        <Field label="Priority">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="input"
          >
            <option value="low">Low</option>
            <option value="med">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Time (optional)">
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 7:00 PM"
            className="input"
          />
        </Field>
        <Field label="Description (optional)">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Btn variant="ghost" onClick={onCancel}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          onClick={() => {
            if (!title.trim()) return;
            onAdd({
              id: `c_${Date.now()}`,
              title: title.trim(),
              description: description.trim() || undefined,
              category,
              xp,
              priority,
              time: time.trim() || undefined,
              isCustom: true,
            });
          }}
        >
          Add task
        </Btn>
      </div>
      <style>{`.input{width:100%;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.5rem 0.75rem;color:#e5e7eb;font-size:0.875rem;outline:none}.input:focus{border-color:rgb(var(--accent) / 0.5)}`}</style>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

/* ---------------- Achievement Toast ---------------- */
export function AchievementToast({
  open,
  title,
  desc,
  onClose,
}: {
  open: boolean;
  title: string;
  desc: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <Card className="px-4 py-3 flex items-center gap-3 border-amber-500/30">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 grid place-items-center text-amber-300">
              <Sparkles size={16} />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300">
                Achievement unlocked
              </div>
              <div className="font-semibold text-zinc-100">{title}</div>
              <div className="text-[11px] text-zinc-400">{desc}</div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
