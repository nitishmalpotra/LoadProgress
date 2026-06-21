import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { useProfileStore } from '@/store/useProfileStore';

// Seed a profile so Layout's "no profile -> redirect to /profile" effect does
// not race with route assertions. Without this, the async profile load can
// redirect away from the route under test.
beforeEach(() => {
  useProfileStore.setState({
    profile: {
      id: 'profile',
      unitSystem: 'metric',
      weight: 70,
      height: 175,
      age: 30,
      sex: 'male',
      goal: 'recomposition',
      activityLevel: 'moderate',
      dietStyle: 'standard',
      trainingDaysPerWeek: 4,
      trainingMinutesPerSession: 60,
      cycleTrackingOptIn: false
    },
    isLoading: false,
    loadProfile: async () => {}
  });
});

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width
  });
  fireEvent.resize(window);
}

function renderRoutedApp(path = '/') {
  window.history.pushState({}, '', path);

  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

afterEach(() => {
  window.history.pushState({}, '', '/');
});

describe('Layout', () => {
  it('renders bottom tab navigation at 375px', () => {
    setViewportWidth(375);
    renderRoutedApp();

    expect(screen.getByLabelText('Bottom tab navigation')).toBeInTheDocument();
    expect(screen.queryByLabelText('Primary navigation drawer')).not.toBeInTheDocument();
  });

  it('renders bottom tab navigation at 1200px', () => {
    setViewportWidth(1200);
    renderRoutedApp();

    expect(screen.getByLabelText('Bottom tab navigation')).toBeInTheDocument();
    expect(screen.queryByLabelText('Primary navigation drawer')).not.toBeInTheDocument();
  });

  it('keeps the same navigation shell when the viewport is resized', () => {
    setViewportWidth(375);
    renderRoutedApp();

    expect(screen.getByLabelText('Bottom tab navigation')).toBeInTheDocument();

    setViewportWidth(1200);

    expect(screen.getByLabelText('Bottom tab navigation')).toBeInTheDocument();
    expect(screen.queryByLabelText('Primary navigation drawer')).not.toBeInTheDocument();
  });

  it('shows five destinations: Today, Plan, Progress, Library, Profile', () => {
    setViewportWidth(375);
    renderRoutedApp();

    const nav = screen.getByLabelText('Bottom tab navigation');
    expect(nav.querySelectorAll('a')).toHaveLength(5);
    expect(screen.getByRole('link', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Plan' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Library' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument();
  });

  it('updates browser history when navigation elements are clicked', async () => {
    setViewportWidth(375);
    renderRoutedApp();

    fireEvent.click(screen.getByRole('link', { name: 'Profile' }));

    expect(window.location.pathname).toBe('/profile');
    expect(await screen.findByRole('heading', { name: 'Profile' })).toBeInTheDocument();
  });

  it('shows Progress sub-tabs (Trends, Volume, PRs) when navigating to /progress', async () => {
    renderRoutedApp('/progress/trends');

    const subNav = await screen.findByLabelText('Progress sub-tabs');
    expect(subNav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trends' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volume' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PRs' })).toBeInTheDocument();
  });

  it('keeps backup controls in the phone shell on desktop', () => {
    setViewportWidth(1200);
    renderRoutedApp();

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
  });
});
