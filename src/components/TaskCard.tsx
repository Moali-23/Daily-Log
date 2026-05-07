import { motion } from "framer-motion";
import { Clock, Trash2, Zap } from "lucide-react";
import { CATEGORIES } from "../constants";
import type { Task } from "../types";
import { Card, Checkbox, Tag } from "./UI";

export function TaskCard({
  task,
  checked,
  onToggle,
  onRemove,
}: {
  task: Task;
  checked: boolean;
  onToggle: (next: boolean) => void;
  onRemove?: () => void;
}) {
  const cat = CATEGORIES[task.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`relative p-3.5 sm:p-4 flex gap-3 items-start transition-colors group ${
          checked ? "bg-white/[0.04] " + cat.border : "hover:bg-white/[0.02]"
        }`}
      >
        {/* accent stripe */}
        <span
          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r ${
            checked ? "" : "opacity-40"
          }`}
          style={{ background: cat.hex }}
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
                  checked ? "text-zinc-300 line-through decoration-zinc-600/60" : "text-zinc-100"
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
              {task.priority === "high" && (
                <Tag accent="rose">High</Tag>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Tag accent={cat.key === "faith" ? "amber" : cat.key === "trade" ? "violet" : cat.key === "body" ? "emerald" : cat.key === "mind" ? "cyan" : cat.key === "review" ? "rose" : "cyan"}>
              {cat.emoji} {cat.label}
            </Tag>
            {task.tag && <Tag>{task.tag}</Tag>}
            {task.time && (
              <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                <Clock size={11} />
                {task.time}
              </span>
            )}
            {task.isCustom && onRemove && (
              <button
                onClick={onRemove}
                className="ml-auto inline-flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
                aria-label={`Remove ${task.title}`}
              >
                <Trash2 size={11} /> Remove
              </button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
