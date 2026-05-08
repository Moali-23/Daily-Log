import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Trash2, X, Zap } from "lucide-react";
import { useState } from "react";
import { CATEGORIES } from "../constants";
import type { Task } from "../types";
import { Card, Checkbox, Tag } from "./UI";

export function TaskCard({
  task,
  checked,
  onToggle,
  onRemove,
  isCustom,
}: {
  task: Task;
  checked: boolean;
  onToggle: (next: boolean) => void;
  /**
   * If provided, a trash button is rendered. The parent decides whether this
   * task should be removable — TaskCard does not gate on `task.isCustom` itself,
   * because a task may have lost the flag during persistence.
   */
  onRemove?: () => void;
  /**
   * If true, the card gets a subtle "user-added" visual treatment (dashed
   * accent stripe + Custom badge). Independent of `onRemove`.
   */
  isCustom?: boolean;
}) {
  const cat = CATEGORIES[task.category];
  const [confirming, setConfirming] = useState(false);
  const treatAsCustom = isCustom ?? task.isCustom === true;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative p-3.5 sm:p-4 flex gap-3 items-start transition-colors ${
          checked
            ? "bg-white/[0.04] border-white/15 " + cat.border
            : "hover:bg-white/[0.03] hover:border-white/10"
        }`}
      >
        {/* accent stripe — dashed when custom */}
        <span
          aria-hidden
          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r transition-opacity ${
            checked ? "opacity-100" : "opacity-50"
          }`}
          style={{
            background: treatAsCustom
              ? `repeating-linear-gradient(180deg, ${cat.hex}, ${cat.hex} 4px, transparent 4px, transparent 8px)`
              : `linear-gradient(180deg, ${cat.hex}, ${cat.hex}55)`,
          }}
        />

        <div className="pt-0.5">
          <Checkbox
            checked={checked}
            onChange={onToggle}
            color={cat.hex}
            label={`Toggle ${task.title}`}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div
                className={`text-sm sm:text-base font-semibold leading-snug ${
                  checked
                    ? "text-zinc-300 line-through decoration-zinc-600/60"
                    : "text-zinc-100"
                }`}
              >
                {task.title}
              </div>
              {task.description && (
                <div className="text-[12px] text-zinc-400 mt-0.5 leading-snug">
                  {task.description}
                </div>
              )}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold tabular text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5">
                <Zap size={11} />+{task.xp} XP
              </span>
              {task.priority === "high" && <Tag accent="rose">High</Tag>}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag
              accent={
                cat.key === "faith"
                  ? "amber"
                  : cat.key === "trade"
                    ? "violet"
                    : cat.key === "body"
                      ? "emerald"
                      : cat.key === "mind"
                        ? "cyan"
                        : cat.key === "review"
                          ? "rose"
                          : "cyan"
              }
            >
              {cat.emoji} {cat.label}
            </Tag>
            {treatAsCustom && <Tag accent="cyan">Custom</Tag>}
            {task.tag && <Tag>{task.tag}</Tag>}
            {task.time && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                <Clock size={11} />
                {task.time}
              </span>
            )}
          </div>
        </div>

        {/* Always-visible remove control — parent controls visibility via `onRemove`. */}
        {onRemove && (
          <div className="shrink-0 self-stretch flex items-center">
            <AnimatePresence mode="wait" initial={false}>
              {confirming ? (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="flex flex-col sm:flex-row items-center gap-1.5"
                >
                  <button
                    onClick={() => {
                      onRemove();
                      setConfirming(false);
                    }}
                    className="w-9 h-9 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 grid place-items-center transition active:scale-95 shadow-[0_0_18px_-6px_rgba(244,63,94,0.6)]"
                    aria-label={`Confirm remove ${task.title}`}
                    title="Confirm delete"
                  >
                    <Check size={16} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10 grid place-items-center transition active:scale-95"
                    aria-label="Cancel remove"
                    title="Cancel"
                  >
                    <X size={16} strokeWidth={2.5} />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="trash"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setConfirming(true)}
                  className="group w-9 h-9 rounded-lg bg-white/[0.04] hover:bg-rose-500/15 text-zinc-300 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 grid place-items-center transition active:scale-95"
                  aria-label={`Remove ${task.title}`}
                  title="Remove task"
                >
                  <Trash2 size={15} strokeWidth={2} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
