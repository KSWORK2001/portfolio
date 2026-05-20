import type { Metadata } from "next";
import { Space_Grotesk, Sora } from "next/font/google";
import type { ReactNode } from "react";
import { AchievementHooks } from "@/components/achievements/AchievementHooks";
import { AchievementToasts } from "@/components/achievements/AchievementToasts";
import { AchievementsPanel } from "@/components/achievements/AchievementsPanel";
import { AchievementsProvider } from "@/components/achievements/AchievementsContext";
import { ConsoleEgg } from "@/components/ui/ConsoleEgg";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { KonamiEgg } from "@/components/ui/KonamiEgg";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VisitTracker } from "@/components/ui/VisitTracker";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "Karan Shrivastava | AI Engineer",
  description:
    "Portfolio profile for Karan Shrivastava, Machine Learning Engineer and Software Developer."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${sora.variable}`}>
        <AchievementsProvider>
          <ScrollProgress />
          <StatusBadge />
          <VisitTracker />
          <CursorGlow />
          <KonamiEgg />
          <ConsoleEgg />
          <AchievementHooks />
          {children}
          <AchievementToasts />
          <AchievementsPanel />
        </AchievementsProvider>
      </body>
    </html>
  );
}
