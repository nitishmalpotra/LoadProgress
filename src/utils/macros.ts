import type { ActivityLevel, Goal, Profile, Sex } from '@/models';

export interface MacroPlan {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

const ACTIVITY: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
};

const GOAL_DELTA: Record<Goal, number> = {
  lose: -500,
  recomposition: -250,
  gain: 200,
};

function mifflin(sex: Sex, weight: number, height: number, age: number): number {
  return Math.round(10 * weight + 6.25 * height - 5 * age + (sex === 'male' ? 5 : -161));
}

export function computeMacros(
  profile: Pick<Profile, 'sex' | 'weight' | 'height' | 'age' | 'activityLevel' | 'goal'>
): MacroPlan {
  const bmr = mifflin(profile.sex, profile.weight, profile.height, profile.age);
  const tdee = Math.round(bmr * ACTIVITY[profile.activityLevel]);
  const calorieTarget = Math.round(tdee + GOAL_DELTA[profile.goal]);
  const proteinG = Math.round(2.0 * profile.weight);
  const fatFromRatio = Math.round((calorieTarget * 0.25) / 9);
  const fatFromWeight = Math.round(0.9 * profile.weight);
  const fatG = Math.max(fatFromWeight, fatFromRatio);
  const carbsG = Math.max(0, Math.round((calorieTarget - proteinG * 4 - fatG * 9) / 4));
  return { bmr, tdee, calorieTarget, proteinG, fatG, carbsG };
}
