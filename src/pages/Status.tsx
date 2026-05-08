import { Award, Flame, Lock, Trophy } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ACHIEVEMENTS, CATEGORIES, CATEGORY_ORDER, RANKS } from "../constants";
import {
  bestStreak,
  calculateLevel,
  calculateStatus,
  calculateStatSheet,
  getNextRank,
  getRank,
  getTasksForDate,
  lastNDays,
  shortDate,
  STAT_CAP,
  statTotal,
  streakGym,
  streakPerfect,
  streakPrayer,
  todayISO,
  totalXP,
} from "../helpers";
import { useAppState } from "../state";
import {
  Card,
  Meter,
  SectionHeader,
  StreakChip,
  XPBar,
} from "../components/UI";
import { accentHex } from "../theme";

const STAT_LABELS: { key: keyof ReturnType<typeof calculateStatSheet>; label: string; color: string }[] = [
  { key: "STR", label: "STR", color: "from-rose-400 to-rose-500" },
  { key: "VIT", label: "VIT", color: "from-emerald-400 to-emerald-500" },
  { key: "AGI", label: "AGI", color: "from-cyan-400 to-sky-500" },
  { key: "INT", label: "INT", color: "from-violet-400 to-purple-500" },
  { key: "FTH", label: "FTH", color: "from-amber-400 to-orange-500" },
  { key: "WIL", label: "WIL", color: "from-zinc-200 to-zinc-400" },
];

export function StatusPage({ api }: { api: ReturnType<typeof useAppState> }) {
  const { state } = api;
  const xp = totalXP(state);
  const { level, intoLevel, perLevel } = calculateLevel(xp);
  const rank = getRank(level);
  const nextRank = getNextRank(level);

  const stats = calculateStatSheet(state);
  const total = statTotal(stats);

  const sPerfect = streakPerfect(state);
  const bPerfect = bestStreak(
    state,
    (r, tasks) => calculateStatus(tasks, r.completions) === "perfect"
  );
  const sGym = streakGym(state);
  const bGym = bestStreak(state, (r, tasks) => {
    const w = tasks.find((t) => t.isWorkout);
    return !!w && !!r.completions[w.id];
  });
  const sPrayer = streakPrayer(state);
  const bPrayer = bestStreak(state, (r, tasks) => {
    const p = tasks.filter((t) => t.isPrayer);
    return p.length === 5 && p.every((t) => r.completions[t.id]);
  });

  const last14 = lastNDays(state, 14);
  const allTimePerfect = Object.keys(state.records).filter((d) => {
    const r = state.records[d];
    const tasks = getTasksForDate(state, d);
    return calculateStatus(tasks, r.completions) === "perfect";
  }).length;

  const last7 = lastNDays(state, 7);
  const avg7 =
    last7.reduce((s, d) => s + d.pct, 0) / Math.max(1, last7.length);

  const radarData = CATEGORY_ORDER.map((k) => {
    const days = lastNDays(state, 30);
    let done = 0;
    let total = 0;
    for (const d of days) {
      const r = state.records[d.date];
      if (!r) continue;
      const tasks = getTasksForDate(state, d.date).filter((t) => t.category === k);
      total += tasks.length;
      done += tasks.filter((t) => r.completions[t.id]).length;
    }
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { category: CATEGORIES[k].label, pct };
  });

  return (
    <>
      <div className="grid md:grid-cols-[1.1fr_1fr] gap-4 mb-5">
        <Card className="p-5 sm:p-6 relative overflow-hidden glass-lift">
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgb(var(--accent-2) / 0.5), transparent)" }}
          />
          <div
            className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgb(var(--accent) / 0.45), transparent)" }}
          />
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">Stat Sheet</div>
          <div className="mt-1 flex items-end gap-3">
            <div className="text-4xl font-bold tabular text-gradient">{total}</div>
            <div className="text-[11px] uppercase tracking-widest text-zinc-500 pb-1.5">
              total power
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-md bg-accent-soft text-accent border border-accent-soft text-[11px] font-semibold tracking-wider uppercase">
              {rank.code} · {rank.title}
            </span>
            {nextRank && (
              <span className="text-[11px] text-zinc-500">
                Next: {nextRank.code} · {nextRank.title} (LVL {nextRank.minLevel})
              </span>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {STAT_LABELS.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="w-10 text-[11px] uppercase tracking-wider font-bold text-zinc-300">
                  {s.label}
                </span>
                <div className="flex-1">
                  <Meter value={stats[s.key]} max={STAT_CAP} color={s.color} />
                </div>
                <span className="w-20 text-right text-[11px] tabular text-zinc-400">
                  {stats[s.key]} / {STAT_CAP}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <XPBar value={intoLevel} max={perLevel} level={level} />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Perfect Streak</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-3xl font-bold tabular text-emerald-300">{sPerfect}</div>
              <span className="text-[11px] text-zinc-500 pb-1.5">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Best · {bPerfect}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Gym Streak</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-3xl font-bold tabular text-rose-300">{sGym}</div>
              <span className="text-[11px] text-zinc-500 pb-1.5">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Best · {bGym}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">Prayer Streak</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-3xl font-bold tabular text-amber-300">{sPrayer}</div>
              <span className="text-[11px] text-zinc-500 pb-1.5">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">Best · {bPrayer}</div>
          </Card>
          <Card className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">All-time Perfect</div>
            <div className="mt-1 flex items-end gap-2">
              <div className="text-3xl font-bold tabular text-cyan-300">{allTimePerfect}</div>
              <span className="text-[11px] text-zinc-500 pb-1.5">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">7-day avg · {Math.round(avg7)}%</div>
          </Card>
        </div>
      </div>

      <SectionHeader icon={<Flame size={14} />} title="Last 14 days" hint="Completion %" />
      <Card className="p-4 mb-5">
        <div className="h-44 sm:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last14.map((d) => ({ name: shortDate(d.date), pct: d.pct, status: d.status }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                stroke="rgba(255,255,255,0.4)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,17,22,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} fill={accentHex(state.user.accent)} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionHeader title="Category balance" hint="last 30 days" />
      <Card className="p-4 mb-5">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="78%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="category" stroke="rgba(255,255,255,0.5)" fontSize={11} />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.15)" tick={false} domain={[0, 100]} />
              <Radar
                dataKey="pct"
                stroke={accentHex(state.user.accent)}
                strokeWidth={2}
                fill={accentHex(state.user.accent)}
                fillOpacity={0.22}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,17,22,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <SectionHeader icon={<Trophy size={14} />} title="Achievements" hint={`${state.unlocked.length}/${ACHIEVEMENTS.length} unlocked`} />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = state.unlocked.includes(a.id);
          return (
            <Card
              key={a.id}
              className={`p-4 text-center ${
                unlocked
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "opacity-70"
              }`}
            >
              <div className="w-9 h-9 mx-auto rounded-full grid place-items-center mb-2">
                {unlocked ? (
                  <Award className="text-amber-300" size={20} />
                ) : (
                  <Lock className="text-zinc-500" size={18} />
                )}
              </div>
              <div className={`text-[12px] uppercase tracking-widest font-bold ${unlocked ? "text-amber-300" : "text-zinc-400"}`}>
                {a.title}
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">{a.desc}</div>
            </Card>
          );
        })}
      </div>

      <SectionHeader title="Ranks" />
      <Card className="p-4 mb-2">
        <div className="grid sm:grid-cols-2 gap-2">
          {RANKS.map((r) => {
            const reached = level >= r.minLevel;
            return (
              <div
                key={r.code}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border transition ${
                  reached
                    ? "bg-accent-faint border-accent-soft shadow-glow"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-md grid place-items-center text-[11px] font-bold tracking-wider ${
                      reached
                        ? "bg-accent-soft text-accent border border-accent-soft"
                        : "bg-white/5 text-zinc-500 border border-white/5"
                    }`}
                  >
                    {r.code}
                  </span>
                  <span className={reached ? "text-zinc-100" : "text-zinc-400"}>
                    {r.title}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500 tabular">
                  LVL {r.minLevel}+
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
