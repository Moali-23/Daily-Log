import { Dumbbell, Flame, Zap } from "lucide-react";
import { useMemo } from "react";
import {
  addDays,
  bestStreak,
  getTasksForDate,
  prettyDate,
  streakGym,
  todayISO,
  workoutForDate,
} from "../helpers";
import { useAppState } from "../state";
import { Btn, Card, Meter, SectionHeader, StreakChip } from "../components/UI";

export function GymLogPage({ api }: { api: ReturnType<typeof useAppState> }) {
  const { state, toggleTask, updateUser } = api;
  const today = todayISO();
  const cycle = state.workoutCycle;
  const todayWorkout = workoutForDate(state, today);

  const sGym = streakGym(state);
  const bGym = bestStreak(state, (r, tasks) => {
    const w = tasks.find((t) => t.isWorkout);
    return !!w && !!r.completions[w.id];
  });

  const tasks = getTasksForDate(state, today);
  const workoutTask = tasks.find((t) => t.isWorkout);
  const workoutDone = workoutTask
    ? !!state.records[today]?.completions[workoutTask.id]
    : false;

  // Build last 14 days of workouts and which are done
  const last14 = useMemo(() => {
    const arr: { date: string; workout: ReturnType<typeof workoutForDate>; done: boolean }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = addDays(today, -i);
      const w = workoutForDate(state, d);
      const ts = getTasksForDate(state, d);
      const wt = ts.find((t) => t.isWorkout);
      const done = wt ? !!state.records[d]?.completions[wt.id] : false;
      arr.push({ date: d, workout: w, done });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.records]);

  return (
    <>
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-4 mb-5">
        <Card className="p-5 sm:p-6 relative overflow-hidden">
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(52,211,153,0.5), transparent)" }}
          />
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Today's lift
          </div>
          <h2 className="mt-1 text-2xl font-bold text-zinc-100">
            {todayWorkout.title}
          </h2>
          <div className="text-sm text-zinc-400 mt-1">{todayWorkout.muscles}</div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {sGym > 0 && <StreakChip days={sGym} label="gym" />}
            <span className="text-[11px] text-zinc-500">Best · {bGym}</span>
            <span className="text-[11px] tabular text-amber-300 ml-auto">
              +15 XP
            </span>
          </div>
          {!todayWorkout.rest && workoutTask && (
            <div className="mt-5">
              <Btn
                variant={workoutDone ? "ghost" : "primary"}
                onClick={() => toggleTask(today, workoutTask.id)}
                icon={<Zap size={14} />}
              >
                {workoutDone ? "Marked complete · undo" : "Mark workout complete"}
              </Btn>
            </div>
          )}
          {todayWorkout.rest && (
            <div className="mt-5 text-sm text-zinc-400">
              Rest day. Hydrate, sleep, mobilise. Recovery <em>is</em> the work.
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionHeader title="Cycle" hint={`${cycle.length}-day rotation`} />
          <div className="space-y-2">
            {cycle.map((d) => {
              const isToday = d.index === todayWorkout.index;
              return (
                <div
                  key={d.index}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${
                    isToday
                      ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_18px_-6px_rgba(52,211,153,0.4)]"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-md grid place-items-center text-[11px] font-bold ${
                      isToday
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-white/5 text-zinc-400 border border-white/5"
                    }`}
                  >
                    D{d.index}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold leading-tight ${d.rest ? "text-zinc-400" : "text-zinc-100"}`}>
                      {d.title}
                    </div>
                    <div className="text-[11px] text-zinc-500">{d.muscles}</div>
                  </div>
                  {isToday && (
                    <span className="text-[10px] uppercase tracking-widest text-emerald-300 font-semibold">
                      Active
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="text-[11px] text-zinc-500">Cycle starts:</div>
            <input
              type="date"
              value={state.user.cycleStartDate}
              onChange={(e) => updateUser({ cycleStartDate: e.target.value })}
              className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1 text-[12px] text-zinc-200"
            />
          </div>
        </Card>
      </div>

      <SectionHeader icon={<Flame size={14} />} title="Last 14 days" />
      <Card className="p-4 mb-5">
        <div className="grid grid-cols-7 gap-2">
          {last14.map((d) => (
            <div
              key={d.date}
              className={`relative rounded-xl p-2 border text-center ${
                d.workout.rest
                  ? "bg-white/[0.02] border-white/5"
                  : d.done
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-rose-500/5 border-rose-500/15"
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                D{d.workout.index}
              </div>
              <div className="text-[11px] font-semibold text-zinc-100 truncate mt-0.5">
                {d.workout.rest ? "Rest" : d.workout.title.split(" & ")[0]}
              </div>
              <div className={`text-[10px] mt-1 ${d.done ? "text-emerald-300" : "text-zinc-500"}`}>
                {d.workout.rest ? "—" : d.done ? "Done" : "Open"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <SectionHeader icon={<Dumbbell size={14} />} title="Volume snapshot" />
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(() => {
            const days = Object.keys(state.records);
            const workoutsLogged = days.filter((d) => {
              const ts = getTasksForDate(state, d);
              const w = ts.find((t) => t.isWorkout);
              return w && state.records[d].completions[w.id];
            }).length;
            const cyclesCompleted = Math.floor(workoutsLogged / 6); // 6 lift days per 8-day cycle
            const stat = [
              { label: "Workouts", value: workoutsLogged },
              { label: "Cycles done", value: cyclesCompleted },
              { label: "Current streak", value: sGym },
              { label: "Best streak", value: bGym },
            ];
            return stat.map((s) => (
              <div key={s.label}>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                  {s.label}
                </div>
                <div className="text-2xl font-bold tabular text-emerald-300 mt-1">
                  {s.value}
                </div>
              </div>
            ));
          })()}
        </div>
      </Card>
    </>
  );
}
