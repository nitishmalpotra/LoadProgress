import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RestTimer } from '@/views/components/RestTimer';

describe('RestTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-24T10:00:00Z'));
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vi.fn()
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down from 10 seconds using elapsed timestamps', () => {
    render(<RestTimer initialDurationSeconds={10} />);

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByText('00:05')).toBeInTheDocument();
  });

  it('runs the completion callback and vibration pulse when the timer finishes', () => {
    const handleComplete = vi.fn();

    render(<RestTimer initialDurationSeconds={10} onComplete={handleComplete} />);

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }));

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(handleComplete).toHaveBeenCalledTimes(1);
    expect(navigator.vibrate).toHaveBeenCalledWith([100, 50, 100]);
  });

  it('jumps to elapsed time after a delayed background-style tick', () => {
    render(<RestTimer initialDurationSeconds={10} />);

    fireEvent.click(screen.getByRole('button', { name: 'Start timer' }));

    act(() => {
      vi.advanceTimersByTime(7000);
      window.dispatchEvent(new Event('focus'));
    });

    expect(screen.getByText('00:03')).toBeInTheDocument();
  });
});
