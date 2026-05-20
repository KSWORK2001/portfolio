"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type { ReactNode } from "react";

export type Achievement = {
  id: string;
  title: string;
  hint: string;
  icon: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-blood",
    title: "Welcome, Stranger",
    hint: "Land on the site.",
    icon: "👋"
  },
  {
    id: "stat-stalker",
    title: "Stat Stalker",
    hint: "Scroll through every impact number.",
    icon: "📊"
  },
  {
    id: "curious-mind",
    title: "Curious Mind",
    hint: "Open every FAQ.",
    icon: "🧠"
  },
  {
    id: "completionist",
    title: "Completionist",
    hint: "Scroll all the way to the bottom.",
    icon: "🏁"
  },
  {
    id: "inbox-slide",
    title: "Slid Into the Inbox",
    hint: "Click the Email Me button.",
    icon: "📬"
  },
  {
    id: "bat-signal",
    title: "Bat-Mode Unlocked",
    hint: "Type the Konami code. ↑↑↓↓←→←→BA",
    icon: "🦇"
  },
  {
    id: "dev-tools-lurker",
    title: "Dev-Tools Lurker",
    hint: "Open DevTools and read the greeting.",
    icon: "🔍"
  },
  {
    id: "star-struck",
    title: "Star Struck",
    hint: "Click the headshot a few times.",
    icon: "⭐"
  },
  {
    id: "patient-visitor",
    title: "Patient Visitor",
    hint: "Hang out for a minute. No rush.",
    icon: "⏳"
  }
];

const TOTAL = ACHIEVEMENTS.length;
const STORAGE_KEY = "karan.portfolio.achievements.v1";

type AchievementsContextValue = {
  unlocked: Set<string>;
  unlock: (id: string) => void;
  reset: () => void;
  total: number;
  toastQueue: Achievement[];
  dismissToast: (id: string) => void;
  panelOpen: boolean;
  setPanelOpen: (v: boolean) => void;
};

const AchievementsCtx = createContext<AchievementsContextValue | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [toastQueue, setToastQueue] = useState<Achievement[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const hydratedRef = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        setUnlocked(new Set(ids));
      }
    } catch {
      // ignore
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unlocked)));
    } catch {
      // ignore
    }
  }, [unlocked]);

  const unlock = useCallback((id: string) => {
    setUnlocked((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      const achievement = ACHIEVEMENTS.find((a) => a.id === id);
      if (achievement) {
        setToastQueue((q) => [...q, achievement]);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setUnlocked(new Set());
    setToastQueue([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToastQueue((q) => q.filter((a) => a.id !== id));
  }, []);

  const value = useMemo<AchievementsContextValue>(
    () => ({
      unlocked,
      unlock,
      reset,
      total: TOTAL,
      toastQueue,
      dismissToast,
      panelOpen,
      setPanelOpen
    }),
    [unlocked, unlock, reset, toastQueue, dismissToast, panelOpen]
  );

  return <AchievementsCtx.Provider value={value}>{children}</AchievementsCtx.Provider>;
}

export function useAchievements() {
  const ctx = useContext(AchievementsCtx);
  if (!ctx) {
    return {
      unlocked: new Set<string>(),
      unlock: () => {},
      reset: () => {},
      total: TOTAL,
      toastQueue: [] as Achievement[],
      dismissToast: () => {},
      panelOpen: false,
      setPanelOpen: () => {}
    } satisfies AchievementsContextValue;
  }
  return ctx;
}
