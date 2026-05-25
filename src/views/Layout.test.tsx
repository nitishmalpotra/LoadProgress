import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import App from '@/App';

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

  it('renders sidebar navigation at 1200px', () => {
    setViewportWidth(1200);
    renderRoutedApp();

    expect(screen.getByLabelText('Primary navigation drawer')).toBeInTheDocument();
    expect(screen.queryByLabelText('Bottom tab navigation')).not.toBeInTheDocument();
  });

  it('switches navigation shells when the viewport is resized', () => {
    setViewportWidth(375);
    renderRoutedApp();

    expect(screen.getByLabelText('Bottom tab navigation')).toBeInTheDocument();

    setViewportWidth(1200);

    expect(screen.getByLabelText('Primary navigation drawer')).toBeInTheDocument();
    expect(screen.queryByLabelText('Bottom tab navigation')).not.toBeInTheDocument();
  });

  it('updates browser history when navigation elements are clicked', () => {
    setViewportWidth(375);
    renderRoutedApp();

    fireEvent.click(screen.getByRole('link', { name: 'PRs' }));

    expect(window.location.pathname).toBe('/records');
    expect(screen.getByRole('heading', { name: 'PRs' })).toBeInTheDocument();
  });

  it('traps keyboard focus inside the desktop drawer links', () => {
    setViewportWidth(1200);
    renderRoutedApp();

    const drawer = screen.getByLabelText('Primary navigation drawer');
    const firstLink = screen.getByRole('link', { name: 'Workout Log' });
    const lastControl = screen.getByRole('button', { name: /import/i });

    lastControl.focus();
    fireEvent.keyDown(drawer, { key: 'Tab' });

    expect(firstLink).toHaveFocus();

    fireEvent.keyDown(drawer, { key: 'Tab', shiftKey: true });

    expect(lastControl).toHaveFocus();
  });
});
