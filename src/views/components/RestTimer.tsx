import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import styles from '@/views/styles/RestTimer.module.css';

type RestTimerProps = {
  initialDurationSeconds?: number;
  onComplete?: () => void;
};

type TimerStyle = CSSProperties & {
  '--rest-progress': number;
  '--rest-circumference': string;
};

const presets = [
  { label: '30s', seconds: 30 },
  { label: '60s', seconds: 60 },
  { label: '90s', seconds: 90 },
  { label: '2m', seconds: 120 },
  { label: '3m', seconds: 180 },
  { label: '5m', seconds: 300 }
];

const tickRateMs = 250;
const ringRadius = 54;
const ringCircumference = 2 * Math.PI * ringRadius;

function formatRemaining(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function RestTimer({ initialDurationSeconds = 90, onComplete }: RestTimerProps) {
  const [durationSeconds, setDurationSeconds] = useState(initialDurationSeconds);
  const [remainingMs, setRemainingMs] = useState(initialDurationSeconds * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const endTimestampRef = useRef<number | null>(null);
  const completeRef = useRef(onComplete);

  useEffect(() => {
    completeRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const updateRemaining = () => {
      const endTimestamp = endTimestampRef.current;

      if (!endTimestamp) {
        return;
      }

      const nextRemainingMs = Math.max(0, endTimestamp - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0) {
        setIsRunning(false);
        endTimestampRef.current = null;
        completeRef.current?.();

        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    };

    updateRemaining();
    const intervalId = window.setInterval(updateRemaining, tickRateMs);
    window.addEventListener('focus', updateRemaining);
    document.addEventListener('visibilitychange', updateRemaining);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', updateRemaining);
      document.removeEventListener('visibilitychange', updateRemaining);
    };
  }, [isRunning]);

  const progress = useMemo(() => {
    if (durationSeconds <= 0) {
      return 0;
    }

    return Math.max(0, Math.min(1, remainingMs / (durationSeconds * 1000)));
  }, [durationSeconds, remainingMs]);

  const startTimer = () => {
    const nextRemainingMs = remainingMs > 0 ? remainingMs : durationSeconds * 1000;
    endTimestampRef.current = Date.now() + nextRemainingMs;
    setRemainingMs(nextRemainingMs);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    if (endTimestampRef.current) {
      setRemainingMs(Math.max(0, endTimestampRef.current - Date.now()));
    }

    endTimestampRef.current = null;
    setIsRunning(false);
  };

  const resetTimer = () => {
    endTimestampRef.current = null;
    setIsRunning(false);
    setRemainingMs(durationSeconds * 1000);
  };

  const selectPreset = (seconds: number) => {
    endTimestampRef.current = null;
    setIsRunning(false);
    setDurationSeconds(seconds);
    setRemainingMs(seconds * 1000);
  };

  const timerStyle: TimerStyle = {
    '--rest-progress': progress,
    '--rest-circumference': `${ringCircumference}px`
  };

  return (
    <section className={styles.timerCard} aria-label="Rest timer">
      <div className={styles.ringWrap} style={timerStyle}>
        <svg className={styles.progressRing} viewBox="0 0 128 128" aria-hidden="true">
          <circle className={styles.ringTrack} cx="64" cy="64" r={ringRadius} />
          <circle className={styles.ringProgress} cx="64" cy="64" r={ringRadius} />
        </svg>
        <div className={styles.timeDisplay} aria-live="polite">
          {formatRemaining(remainingMs)}
        </div>
      </div>

      <div className={styles.controls} aria-label="Timer controls">
        <button
          className={styles.controlButton}
          type="button"
          aria-label={isRunning ? 'Pause timer' : 'Start timer'}
          onClick={isRunning ? pauseTimer : startTimer}
        >
          {isRunning ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button
          className={styles.controlButton}
          type="button"
          aria-label="Reset timer"
          onClick={resetTimer}
        >
          <RotateCcw size={19} />
        </button>
      </div>

      <div className={styles.presets} aria-label="Timer presets">
        {presets.map((preset) => (
          <button
            className={durationSeconds === preset.seconds ? styles.presetSelected : styles.preset}
            key={preset.seconds}
            type="button"
            aria-pressed={durationSeconds === preset.seconds}
            onClick={() => selectPreset(preset.seconds)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </section>
  );
}
