import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

  it('renders the LoadProgress placeholder with icons', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(await screen.findByText('No workouts for this date')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add workout set' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Workout Log' })).toHaveAttribute('href', '/');
  });

  it('renders the style guide route', () => {
    render(
      <MemoryRouter initialEntries={['/styleguide']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'LoadProgress Theme' })).toBeInTheDocument();
  });
});
