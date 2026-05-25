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

  it('updates browser history when navigation elements are clicked', () => {
    setViewportWidth(375);
    renderRoutedApp();

    fireEvent.click(screen.getByRole('link', { name: 'PRs' }));

    expect(window.location.pathname).toBe('/records');
    expect(screen.getByRole('heading', { name: 'PRs' })).toBeInTheDocument();
  });

  it('keeps backup controls in the phone shell on desktop', () => {
    setViewportWidth(1200);
    renderRoutedApp();

    expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /import/i })).toBeInTheDocument();
  });
});
