import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StyleGuide, buttonClasses, swatches } from '@/views/StyleGuide';
import styles from '@/views/styles/Theme.module.css';

describe('StyleGuide', () => {
  it('binds the light theme classes to display components', () => {
    const { container } = render(<StyleGuide />);

    expect(screen.getByRole('heading', { name: 'LoadProgress Theme' })).toBeInTheDocument();
    expect(container.querySelector(`.${styles.themeRoot}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.floatingCard}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.inputField}`)).toBeInTheDocument();

    buttonClasses.forEach(([label, className]) => {
      expect(screen.getByRole('button', { name: label })).toHaveClass(className);
    });

    swatches.forEach(([label, className]) => {
      expect(screen.getByText(label)).toHaveClass(styles.tokenSwatch, className);
    });
  });

  it('renders a three-layer surface stack for layer validation', () => {
    render(<StyleGuide />);

    const stack = screen.getByLabelText('Three stacked light surfaces');
    const layers = within(stack).getAllByRole('article');

    expect(layers).toHaveLength(3);
    layers.forEach((layer) => {
      expect(layer).toHaveClass(styles.glassCard, styles.stackLayer);
    });
  });
});
