"use client";

import {
  Activity, Apple, Bell, Dumbbell, Flame, Home, Lightbulb, Medal,
  Settings, Target, Trophy, Utensils, Droplet, BarChart3, BicepsFlexed
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const icons = {
  home: Home,
  dumbbell: Dumbbell,
  chart: BarChart3,
  settings: Settings,
  utensils: Utensils,
  water: Droplet,
  target: Target,
  apple: Apple,
  trophy: Trophy,
  medal: Medal,
  flame: Flame,
  lightbulb: Lightbulb,
  bell: Bell,
  muscle: BicepsFlexed,
} satisfies Record<string, LucideIcon>;

export type ClayIconName = keyof typeof icons;

export default function ClayIcon({
  name,
  tone = "green",
  size = 19,
  className = "",
}: {
  name: ClayIconName;
  tone?: "green" | "orange" | "neutral" | "blue" | "gold";
  size?: number;
  className?: string;
}) {
  const Icon = icons[name];
  return (
    <span className={`nf-clay-icon nf-clay-icon--${tone} ${className}`} aria-hidden="true">
      <Icon size={size} strokeWidth={2.25} />
    </span>
  );
}
