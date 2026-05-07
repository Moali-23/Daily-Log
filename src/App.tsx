import { useEffect, useState } from "react";
import { AppShell, type PageKey } from "./components/Layout";
import { useAppState } from "./state";
import { useAuth } from "./auth";
import { TodayPage } from "./pages/Today";
import { StatusPage } from "./pages/Status";
import { GymLogPage } from "./pages/GymLog";
import { CalendarPage } from "./pages/Calendar";
import { TargetsPage } from "./pages/Targets";
import { SettingsPage } from "./pages/Settings";
import { LoginPage } from "./pages/Login";
import { Zap } from "lucide-react";

const ROUTE_KEY = "ascend.route";

export default function App() {
  const authApi = useAuth();
  const uid = authApi.user?.uid ?? null;
  const api = useAppState(uid);

  const [page, setPage] = useState<PageKey>(() => {
    if (typeof window === "undefined") return "today";
    return ((localStorage.getItem(ROUTE_KEY) as PageKey | null) ?? "today");
  });

  useEffect(() => {
    try {
      localStorage.setItem(ROUTE_KEY, page);
    } catch {}
  }, [page]);

  // Apply reduced-motion preference on mount
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = api.state.user.reducedMotion ? "true" : "false";
  }, [api.state.user.reducedMotion]);

  // 1) Auth still loading — splash
  if (authApi.isFirebaseConfigured && authApi.loading) {
    return <Splash />;
  }

  // 2) Not authenticated (or Firebase not configured) — Login page
  if (!authApi.user) {
    return <LoginPage auth={authApi} />;
  }

  // 3) Authenticated — full app
  return (
    <AppShell active={page} onNavigate={setPage} api={api}>
      {page === "today" && <TodayPage api={api} />}
      {page === "status" && <StatusPage api={api} />}
      {page === "gym" && <GymLogPage api={api} />}
      {page === "calendar" && <CalendarPage api={api} />}
      {page === "targets" && <TargetsPage api={api} />}
      {page === "settings" && <SettingsPage api={api} authApi={authApi} />}
    </AppShell>
  );
}

function Splash() {
  return (
    <div className="min-h-screen app-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 grid place-items-center text-zinc-950 animate-pulseSoft">
          <Zap size={22} strokeWidth={2.5} />
        </div>
        <div className="text-[11px] uppercase tracking-widest text-zinc-500">
          Booting Ascend…
        </div>
      </div>
    </div>
  );
}
