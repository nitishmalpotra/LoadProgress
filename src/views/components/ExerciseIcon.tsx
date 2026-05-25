import {
  Activity,
  ArrowUpCircle,
  Award,
  CircleDot,
  Dumbbell,
  Flame,
  Heart,
  Shield,
  Sparkles,
  Target,
  Zap,
  type LucideIcon
} from 'lucide-react';
import type { MuscleGroup } from '@/models';

const muscleIconMap: Record<MuscleGroup, LucideIcon> = {
  Chest: Heart,
  Back: ArrowUpCircle,
  Legs: Zap,
  Shoulders: Target,
  Arms: Flame,
  Core: Shield,
  'Full Body': Sparkles,
  Forearms: Dumbbell,
  Glutes: Activity,
  'Upper Back': ArrowUpCircle,
  'Lower Back': CircleDot
};

type ExerciseIconProps = {
  muscleGroup: MuscleGroup;
  iconName?: string;
  className?: string;
  size?: number;
};

export function getExerciseIcon(muscleGroup: MuscleGroup): LucideIcon {
  return muscleIconMap[muscleGroup] ?? Award;
}

export function ExerciseIcon({ muscleGroup, iconName, className, size = 20 }: ExerciseIconProps) {
  const Icon = getExerciseIcon(muscleGroup);

  return (
    <span
      aria-label={`${muscleGroup} icon`}
      className={className}
      data-exercise-icon={iconName}
      data-muscle-group={muscleGroup}
      role="img"
    >
      <Icon aria-hidden="true" size={size} strokeWidth={2.3} />
    </span>
  );
}
