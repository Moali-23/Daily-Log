export type CategoryKey =
  | "faith"
  | "trade"
  | "body"
  | "mind"
  | "work"
  | "review";

export type Status = "perfect" | "strong" | "partial" | "missed" | "none";

export type Priority = "low" | "med" | "high";

export type PrayerName = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: CategoryKey;
  xp: number;
  priority: Priority;
  time?: string;
  tag?: string;
  isCustom?: boolean;
  isPrayer?: boolean;
  prayerName?: PrayerName;
  isWorkout?: boolean;
}

export interface DailyReview {
  wentWell?: string;
  needsImprovement?: string;
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
  energy?: 1 | 2 | 3 | 4 | 5;
  focus?: 1 | 2 | 3 | 4 | 5;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  completions: Record<string, boolean>; // taskId -> done
  customTasks?: Task[];
  review?: DailyReview;
}

export interface Goal {
  id: string;
  title: string;
  metric: string;
  targetDate: string;
  category: string;
  notes?: string;
  accent?: "violet" | "amber" | "emerald" | "cyan" | "rose";
}

export interface WorkoutDay {
  index: number; // 1..N
  title: string;
  muscles: string;
  rest?: boolean;
}

export interface UserProfile {
  displayName: string;
  mainGoal: string;
  reducedMotion: boolean;
  accent: "cyan" | "violet" | "emerald" | "amber" | "rose";
  cycleStartDate: string; // ISO date for D1 of workout cycle
}

export interface AppState {
  user: UserProfile;
  defaultTasks: Task[];
  records: Record<string, DailyRecord>;
  goals: Goal[];
  workoutCycle: WorkoutDay[];
  unlocked: string[]; // achievement ids
  schemaVersion: number;
}
