import { Activity, Sparkles, Trophy } from 'lucide-react';
import styles from '@/views/styles/Theme.module.css';

const buttonClasses = [
  ['Primary', styles.buttonPrimary],
  ['Secondary', styles.buttonSecondary],
  ['Glass', styles.buttonGlass],
  ['Pill', styles.buttonPill]
] as const;

const swatches = [
  ['Accent', styles.accentSwatch],
  ['Teal', styles.tealSwatch],
  ['Indigo', styles.indigoSwatch],
  ['Success', styles.successSwatch],
  ['Warning', styles.warningSwatch],
  ['Error', styles.errorSwatch]
] as const;

export function StyleGuide() {
  return (
    <main className={`${styles.themeRoot} ${styles.styleGuide}`}>
      <section className={styles.intro} aria-labelledby="styleguide-title">
        <p className={styles.eyebrow}>Liquid Glass System</p>
        <h1 className={styles.title} id="styleguide-title">
          iOS 26 Theme
        </h1>
        <p className={styles.description}>
          Modular Vanilla CSS tokens for glass surfaces, floating depth, spring press states,
          semantic colors, and rounded system typography.
        </p>
      </section>

      <div className={styles.grid}>
        <section className={styles.section} aria-labelledby="buttons-title">
          <h2 className={styles.sectionTitle} id="buttons-title">
            Buttons
          </h2>
          <div className={styles.floatingCard}>
            <div className={styles.buttonRow}>
              {buttonClasses.map(([label, className]) => (
                <button className={className} key={label} type="button">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Cards</h2>
          <article className={styles.glassCard}>
            <Sparkles aria-hidden="true" size={22} />
            <h3>Thin material card</h3>
            <p>Blurred surface with specular border highlight and medium depth shadow.</p>
          </article>

          <h2 className={styles.sectionTitle}>Inputs</h2>
          <label className={styles.inputGroup}>
            <span className={styles.inputLabel}>Exercise search</span>
            <input className={styles.inputField} placeholder="Bench press" type="text" />
          </label>
        </section>

        <section className={styles.section} aria-labelledby="tokens-title">
          <h2 className={styles.sectionTitle} id="tokens-title">
            Tokens
          </h2>
          <div className={styles.tokenGrid}>
            {swatches.map(([label, className]) => (
              <div className={`${styles.tokenSwatch} ${className}`} key={label}>
                {label}
              </div>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>Stacked Blur</h2>
          <div className={styles.cardStack} aria-label="Three stacked glass layers">
            <article className={`${styles.glassCard} ${styles.stackLayer}`}>
              <Activity aria-hidden="true" />
              <h3>Layer one</h3>
              <p>Stable blur baseline.</p>
            </article>
            <article className={`${styles.glassCard} ${styles.stackLayer}`}>
              <Trophy aria-hidden="true" />
              <h3>Layer two</h3>
              <p>Same filter, isolated surface.</p>
            </article>
            <article className={`${styles.glassCard} ${styles.stackLayer}`}>
              <Sparkles aria-hidden="true" />
              <h3>Layer three</h3>
              <p>Three-deep stacking check.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}

export { buttonClasses, swatches };
