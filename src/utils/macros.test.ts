import { describe, expect, it } from 'vitest';
import { computeMacros } from './macros';

const base = {
  sex: 'male',
  weight: 80,
  height: 175,
  age: 30,
  activityLevel: 'moderate',
  goal: 'recomposition'
} as const;

describe('computeMacros', () => {
  it('BMR uses Mifflin-St Jeor for male', () => {
    // 10*80 + 6.25*175 - 5*30 + 5 = 1748.75 → 1749
    expect(computeMacros(base).bmr).toBe(1749);
  });

  it('female BMR is 166 less than male', () => {
    const diff = computeMacros(base).bmr - computeMacros({ ...base, sex: 'female' }).bmr;
    expect(diff).toBe(166);
  });

  it('TDEE = round(BMR × 1.55) for moderate', () => {
    const { bmr, tdee } = computeMacros(base);
    expect(tdee).toBe(Math.round(bmr * 1.55));
  });

  it('recomp calorie target = TDEE - 250', () => {
    const { tdee, calorieTarget } = computeMacros(base);
    expect(calorieTarget).toBe(tdee - 250);
  });

  it('lose calorie target = TDEE - 500', () => {
    const { tdee, calorieTarget } = computeMacros({ ...base, goal: 'lose' });
    expect(calorieTarget).toBe(tdee - 500);
  });

  it('gain calorie target = TDEE + 200', () => {
    const { tdee, calorieTarget } = computeMacros({ ...base, goal: 'gain' });
    expect(calorieTarget).toBe(tdee + 200);
  });

  it('protein = 2g/kg', () => {
    expect(computeMacros(base).proteinG).toBe(160);
  });

  it('macro kcal sum within ±5% of calorie target', () => {
    const { calorieTarget, proteinG, fatG, carbsG } = computeMacros(base);
    const total = proteinG * 4 + fatG * 9 + carbsG * 4;
    expect(Math.abs(total - calorieTarget)).toBeLessThanOrEqual(calorieTarget * 0.05);
  });

  it('fat floor kicks in for low body weight', () => {
    // 0.9 * 40 = 36g; 25% of ~1500 kcal / 9 = ~42g; fat should be floored up
    const { calorieTarget, fatG } = computeMacros({ ...base, weight: 40 });
    expect(fatG).toBeGreaterThanOrEqual(Math.round((calorieTarget * 0.25) / 9));
  });

  it('carbs are non-negative', () => {
    expect(computeMacros(base).carbsG).toBeGreaterThanOrEqual(0);
  });
});
