import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Activity, BarChart3, BookOpen, Dumbbell, LineChart, Trophy } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '@/views/styles/Layout.module.css';

const desktopBreakpoint = 768;

const navigationItems = [
  { label: 'Workout Log', shortLabel: 'Workout', path: '/', icon: Dumbbell, end: true },
  { label: 'PRs', shortLabel: 'PRs', path: '/records', icon: Trophy },
  { label: 'Volume', shortLabel: 'Volume', path: '/analytics', icon: BarChart3 },
  { label: 'Library', shortLabel: 'Library', path: '/exercises', icon: BookOpen },
  { label: 'Trends', shortLabel: 'Trends', path: '/progress', icon: LineChart }
];

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.innerWidth >= desktopBreakpoint
  );

  useEffect(() => {
    const updateViewport = () => setIsDesktop(window.innerWidth >= desktopBreakpoint);

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return isDesktop;
}

function NavigationLinks({ compact = false }: { compact?: boolean }) {
  return (
    <>
      {navigationItems.map(({ label, shortLabel, path, icon: Icon, end }) => (
        <NavLink
          aria-label={label}
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
          end={end}
          key={path}
          to={path}
        >
          <Icon aria-hidden="true" size={compact ? 20 : 19} strokeWidth={2.4} />
          <span>{compact ? shortLabel : label}</span>
        </NavLink>
      ))}
    </>
  );
}

function DesktopSidebar() {
  const drawerRef = useRef<HTMLElement>(null);
  const focusableSelectors = useMemo(
    () => 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    []
  );

  const handleDrawerKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') {
      return;
    }

    const focusableItems = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>(focusableSelectors) ?? []
    );

    if (focusableItems.length === 0) {
      return;
    }

    const firstItem = focusableItems[0];
    const lastItem = focusableItems[focusableItems.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  };

  return (
    <aside
      aria-label="Primary navigation drawer"
      className={styles.desktopSidebar}
      onKeyDown={handleDrawerKeyDown}
      ref={drawerRef}
    >
      <div className={styles.brand}>
        <span className={styles.brandIcon} aria-hidden="true">
          <Activity size={22} strokeWidth={2.5} />
        </span>
        <span>LoadProgress</span>
      </div>
      <nav aria-label="Primary navigation" className={styles.desktopNav}>
        <NavigationLinks />
      </nav>
    </aside>
  );
}

function MobileTabBar() {
  return (
    <nav aria-label="Bottom tab navigation" className={styles.mobileTabBar}>
      <NavigationLinks compact />
    </nav>
  );
}

export function Layout() {
  const isDesktop = useIsDesktop();

  return (
    <div className={styles.layoutRoot}>
      <div className={styles.layoutFrame}>
        {isDesktop ? <DesktopSidebar /> : <MobileTabBar />}
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

type DashboardViewProps = {
  eyebrow: string;
  title: string;
  summary: string;
  panels: Array<{ title: string; body: string }>;
};

export function DashboardView({ eyebrow, title, summary, panels }: DashboardViewProps) {
  return (
    <section className={styles.contentGrid} aria-labelledby="page-title">
      <header className={styles.dashboardHeader}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h1 className={styles.title} id="page-title">
          {title}
        </h1>
        <p className={styles.summary}>{summary}</p>
      </header>
      <div className={styles.panelGrid}>
        {panels.map((panel) => (
          <article className={styles.panel} key={panel.title}>
            <h2>{panel.title}</h2>
            <p>{panel.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
