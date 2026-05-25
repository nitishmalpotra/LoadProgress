import { useRef } from 'react';
import { BarChart3, BookOpen, Download, Dumbbell, LineChart, Trophy, Upload } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { downloadBackupFile, importBackupFile } from '@/db/backup';
import { ServiceWorkerUpdateToast } from '@/views/components/ServiceWorkerUpdateToast';
import { useServiceWorkerUpdate } from '@/views/hooks/useServiceWorkerUpdate';
import styles from '@/views/styles/Layout.module.css';
import { useWorkoutStore } from '@/store/useWorkoutStore';

const navigationItems = [
  { label: 'Workout Log', shortLabel: 'Workout', path: '/', icon: Dumbbell, end: true },
  { label: 'PRs', shortLabel: 'PRs', path: '/records', icon: Trophy },
  { label: 'Volume', shortLabel: 'Volume', path: '/analytics', icon: BarChart3 },
  { label: 'Library', shortLabel: 'Library', path: '/exercises', icon: BookOpen },
  { label: 'Trends', shortLabel: 'Trends', path: '/progress', icon: LineChart }
];

function NavigationLinks() {
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
          <Icon aria-hidden="true" size={20} strokeWidth={2.4} />
          <span>{shortLabel}</span>
        </NavLink>
      ))}
    </>
  );
}

function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadWorkoutData = useWorkoutStore((state) => state.loadWorkoutData);

  const handleImport = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    try {
      await importBackupFile(file);
      await loadWorkoutData();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Backup file could not be imported.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={styles.backupControls} aria-label="Backup and restore controls">
      <button
        className={styles.backupButton}
        onClick={() => void downloadBackupFile()}
        type="button"
      >
        <Download aria-hidden="true" size={17} strokeWidth={2.4} />
        <span>Export</span>
      </button>
      <button
        className={styles.backupButton}
        onClick={() => fileInputRef.current?.click()}
        type="button"
      >
        <Upload aria-hidden="true" size={17} strokeWidth={2.4} />
        <span>Import</span>
      </button>
      <input
        accept="application/json"
        className={styles.fileInput}
        onChange={(event) => void handleImport(event.currentTarget.files?.[0])}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}

function TabBar() {
  return (
    <nav aria-label="Bottom tab navigation" className={styles.mobileTabBar}>
      <NavigationLinks />
    </nav>
  );
}

export function Layout() {
  const { needsRefresh, update } = useServiceWorkerUpdate();

  return (
    <div className={styles.layoutRoot}>
      <div className={styles.layoutFrame}>
        <main className={styles.mainContent}>
          <BackupControls />
          <Outlet />
        </main>
        <TabBar />
      </div>
      <ServiceWorkerUpdateToast open={needsRefresh} onUpdate={update} />
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
