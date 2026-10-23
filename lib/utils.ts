import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LevelInfo {
  level: number;
  minXp: number;
  maxXp: number;
  progressPercent: number;
  label: string;
}

export function getLevelInfo(xp: number): LevelInfo {
  if (xp < 500) {
    return {
      level: 1,
      minXp: 0,
      maxXp: 500,
      progressPercent: (xp / 500) * 100,
      label: "Level 1"
    };
  } else if (xp < 1000) {
    return {
      level: 2,
      minXp: 500,
      maxXp: 1000,
      progressPercent: ((xp - 500) / 500) * 100,
      label: "Level 2"
    };
  } else if (xp < 1750) {
    return {
      level: 3,
      minXp: 1000,
      maxXp: 1750,
      progressPercent: ((xp - 1000) / 750) * 100,
      label: "Level 3"
    };
  } else if (xp < 2500) {
    return {
      level: 4,
      minXp: 1750,
      maxXp: 2500,
      progressPercent: ((xp - 1750) / 750) * 100,
      label: "Level 4"
    };
  } else {
    return {
      level: 5,
      minXp: 2500,
      maxXp: 5000,
      progressPercent: Math.min(100, ((xp - 2500) / 2500) * 100),
      label: "Level 5"
    };
  }
}
