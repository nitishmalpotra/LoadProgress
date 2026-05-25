import {
  Activity,
  ArrowUpCircle,
  Award,
  Dumbbell,
  Flame,
  Heart,
  Shield,
  Sparkles,
  Target,
  Zap,
  type LucideIcon
} from 'lucide-react';

const exerciseIconMap: Record<string, LucideIcon> = {
  benchPress: Dumbbell,
  inclineBench: Dumbbell,
  dumbbellFly: Dumbbell,
  chestPress: Dumbbell,
  cableCrossover: Dumbbell,
  pushUp: Flame,
  dips: Flame,
  pullUp: ArrowUpCircle,
  chinUp: ArrowUpCircle,
  deadlift: Activity,
  bentOverRow: Activity,
  seatedCableRow: Activity,
  latPulldown: ArrowUpCircle,
  facePull: Activity,
  backExtension: Activity,
  squat: Zap,
  frontSquat: Zap,
  romanianDeadlift: Zap,
  walkingLunge: Zap,
  legPress: Zap,
  legExtension: Zap,
  legCurl: Zap,
  calfRaise: Zap,
  hipThrust: Zap,
  gluteBridge: Zap,
  overheadPress: Target,
  arnoldPress: Target,
  lateralRaise: Target,
  frontRaise: Target,
  rearDeltFly: Target,
  bicepCurl: Flame,
  hammerCurl: Flame,
  tricepExtension: Flame,
  tricepPushdown: Flame,
  skullCrusher: Flame,
  forearmCurl: Flame,
  plank: Shield,
  sidePlank: Shield,
  russianTwist: Shield,
  legRaise: Shield,
  crunch: Shield,
  cableCrunch: Shield,
  abWheel: Shield,
  burpee: Sparkles,
  mountainClimber: Heart,
  turkishGetUp: Sparkles,
  cleanAndJerk: Sparkles,
  kettlebellSwing: Heart,
  thruster: Sparkles,
  custom: Dumbbell
};

type ExerciseIconProps = {
  iconName: string;
  className?: string;
  size?: number;
};

export function getExerciseIcon(iconName: string): LucideIcon {
  return exerciseIconMap[iconName] ?? Award;
}

export function ExerciseIcon({ iconName, className, size = 20 }: ExerciseIconProps) {
  const Icon = getExerciseIcon(iconName);

  return (
    <span
      aria-label={`${iconName} icon`}
      className={className}
      data-exercise-icon={iconName}
      role="img"
    >
      <Icon aria-hidden="true" size={size} strokeWidth={2.3} />
    </span>
  );
}
