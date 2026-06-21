import type { IconType } from 'react-icons';
import {
  GiBiceps,
  GiGymBag,
  GiLeg,
  GiMuscleFat,
  GiPull,
  GiPush,
  GiStomach,
  GiWeightLiftingUp
} from 'react-icons/gi';
import type { MuscleGroup } from '@/models';

const muscleIconMap: Record<MuscleGroup, IconType> = {
  Chest: GiPush,
  Back: GiPull,
  'Upper Back': GiPull,
  'Lower Back': GiPull,
  Legs: GiLeg,
  Shoulders: GiWeightLiftingUp,
  Arms: GiBiceps,
  Forearms: GiBiceps,
  Core: GiStomach,
  'Full Body': GiMuscleFat,
  Glutes: GiLeg
};

type ExerciseIconProps = {
  muscleGroup: MuscleGroup;
  iconName?: string;
  className?: string;
  size?: number;
};

export function getExerciseIcon(muscleGroup: MuscleGroup): IconType {
  return muscleIconMap[muscleGroup] ?? GiGymBag;
}

export function ExerciseIcon({ muscleGroup, className, size = 20 }: ExerciseIconProps) {
  const Icon = getExerciseIcon(muscleGroup);

  return (
    <span aria-label={`${muscleGroup} icon`} className={className} role="img">
      <Icon aria-hidden size={size} />
    </span>
  );
}
