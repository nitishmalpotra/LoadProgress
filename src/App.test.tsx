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

  it('renders the LoadProgress placeholder with icons', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('Set List')).toBeInTheDocument();
    expect(screen.getByText('Quick Stats')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Workout Log' })).toHaveAttribute('href', '/');
  });

  it('renders the style guide route', () => {
    render(
      <MemoryRouter initialEntries={['/styleguide']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'iOS 26 Theme' })).toBeInTheDocument();
  });
});
