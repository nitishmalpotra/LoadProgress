import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from '@/App';

function DummyComponent() {
  return <div>Vitest can render React</div>;
}

describe('environment sanity', () => {
  it('evaluates arithmetic', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a dummy React component', () => {
    render(<DummyComponent />);

    expect(screen.getByText('Vitest can render React')).toBeInTheDocument();
  });

  it('renders the LoadProgress placeholder with icons', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'LoadProgress' })).toBeInTheDocument();
    expect(screen.getByText('Workout logging')).toBeInTheDocument();
    expect(screen.getByText('Personal records')).toBeInTheDocument();
  });
});
