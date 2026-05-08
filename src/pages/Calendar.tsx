import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { STATUS_META } from "../constants";
import {
  calculateStatus,
  getTasksForDate,
  todayISO,
} from "../helpers";
import { useAppState } from "../state";
import type { Status } from "../types";
import {
  DailySummaryModal,
  EditRecordModal,
} from "../components/Modals";
import { Card } from "../components/UI";

export function CalendarPage({ api }: { api: ReturnType<typeof useAppState> }) {
  const { state } = api;
  const today = todayISO();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [edit, setEdit] = useState<string | null>(null);

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => {
    const first = new Date(cursor.year, cursor.month, 1);
    const last = new Date(cursor.year, cursor.month + 1, 0);
    // Use Monday as first day of week
    const offset = (first.getDay() + 6) % 7;
    const arr: { iso?: string; pct: number; status: Status }[] = [];
    for (let i = 0; i < offset; i++) arr.push({ pct: 0, status: "none" });
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(cursor.year, cursor.month, d);
      const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const r = state.records[iso];
      const tasks = getTasksForDate(state, iso);
      const total = tasks.length;
      const done = tasks.filter((t) => r?.completions[t.id]).length;
      const pct = total === 0 ? 0 : Math.round((done / total) * 100);
      const status: Status = r ? calculateStatus(tasks, r.completions) : "none";
      arr.push({ iso, pct, status });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, state.records]);

  function shift(delta: number) {
    setCursor((c) => {
      const nm = new Date(c.year, c.month + delta, 1);
      return { year: nm.getFullYear(), month: nm.getMonth() };
    });
  }
  function reset() {
    const d = new Date();
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  }

  return (
    <>
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">
              Calendar
            </div>
            <h2 className="mt-1 text-2xl font-bold text-zinc-100">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => shift(-1)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 grid place-items-center text-zinc-300"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={reset}
              className="px-3 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] uppercase tracking-widest text-zinc-300"
              aria-label="Today"
            >
              Today
            </button>
            <button
              onClick={() => shift(1)}
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 grid place-items-center text-zinc-300"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {days.map((d, idx) =>
            d.iso ? (
              <button
                key={idx}
                onClick={() => setSelected(d.iso!)}
                className={`relative aspect-square rounded-xl border px-1 py-1 sm:py-2 flex flex-col items-center justify-center transition active:scale-95 hover:bg-white/[0.04] ${
                  d.iso === today
                    ? "border-accent-strong shadow-accent"
                    : "border-white/5"
                } ${
                  d.status === "perfect"
                    ? "bg-emerald-500/15"
                    : d.status === "strong"
                      ? "bg-lime-500/12"
                      : d.status === "partial"
                        ? "bg-orange-500/12"
                        : d.status === "missed"
                          ? "bg-rose-500/12"
                          : "bg-white/[0.02]"
                }`}
                aria-label={`Open ${d.iso}`}
              >
                <span
                  className={`text-sm font-semibold tabular ${
                    d.iso === today
                      ? "text-cyan-300"
                      : d.status === "none"
                        ? "text-zinc-500"
                        : "text-zinc-100"
                  }`}
                >
                  {parseInt(d.iso.split("-")[2])}
                </span>
                {d.status !== "none" && (
                  <span
                    className={`mt-0.5 w-1.5 h-1.5 rounded-full ${STATUS_META[d.status].dot}`}
                  />
                )}
              </button>
            ) : (
              <div key={idx} className="aspect-square" />
            )
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
          <Legend status="perfect" label="Perfect" />
          <Legend status="strong" label="Strong" />
          <Legend status="partial" label="Partial" />
          <Legend status="missed" label="Missed" />
          <Legend status="none" label="No record" />
        </div>
      </Card>

      <DailySummaryModal
        date={selected ?? today}
        open={!!selected}
        onClose={() => setSelected(null)}
        api={api}
        onEdit={() => {
          setEdit(selected);
          setSelected(null);
        }}
      />
      <EditRecordModal
        date={edit ?? today}
        open={!!edit}
        onClose={() => setEdit(null)}
        api={api}
      />
    </>
  );
}

function Legend({ status, label }: { status: Status; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full ${STATUS_META[status].dot}`} />
      {label}
    </span>
  );
}
