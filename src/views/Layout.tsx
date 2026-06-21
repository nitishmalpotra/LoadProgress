import { Suspense, useEffect, useRef } from 'react';
import { BookOpen, CalendarDays, Download, Dumbbell, TrendingUp, Upload, User } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { downloadBackupFile, importBackupFile } from '@/db/backup';
import { ServiceWorkerUpdateToast } from '@/views/components/ServiceWorkerUpdateToast';
import { useServiceWorkerUpdate } from '@/views/hooks/useServiceWorkerUpdate';
import styles from '@/views/styles/Layout.module.css';
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useProfileStore } from '@/store/useProfileStore';

const navigationItems = [
  { label: 'Today', path: '/', icon: Dumbbell, end: true },
  { label: 'Plan', path: '/plan', icon: CalendarDays },
  { label: 'Progress', path: '/progress', icon: TrendingUp },
  { label: 'Library', path: '/exercises', icon: BookOpen },
  { label: 'Profile', path: '/profile', icon: User }
];

function NavigationLinks() {
  return (
    <>
      {navigationItems.map(({ label, path, icon: Icon, end }) => (
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
          <span>{label}</span>
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
  const profile = useProfileStore((s) => s.profile);
  const profileIsLoading = useProfileStore((s) => s.isLoading);
  const loadProfile = useProfileStore((s) => s.loadProfile);
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profileIsLoading && !hasChecked.current) {
      hasChecked.current = true;
      if (profile === null) {
        navigate('/profile');
      }
    }
  }, [profileIsLoading, profile, navigate]);

  return (
    <div className={styles.layoutRoot}>
      <div className={styles.layoutFrame}>
        <main className={styles.mainContent}>
          <BackupControls />
          <Suspense fallback={null}>
            <Outlet />
          </Suspense>
        </main>
        <TabBar />
      </div>
      <ServiceWorkerUpdateToast open={needsRefresh} onUpdate={update} />
    </div>
  );
}
