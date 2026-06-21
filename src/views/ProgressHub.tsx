import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from '@/views/styles/Layout.module.css';

const subTabs = [
  { label: 'Trends', path: '/progress/trends' },
  { label: 'Volume', path: '/progress/volume' },
  { label: 'PRs', path: '/progress/records' },
  { label: 'Body', path: '/progress/body' }
];

export function ProgressHub() {
  return (
    <>
      <nav aria-label="Progress sub-tabs" className={styles.subTabStrip}>
        {subTabs.map(({ label, path }) => (
          <NavLink
            className={({ isActive }) =>
              isActive ? `${styles.subTabLink} ${styles.subTabLinkActive}` : styles.subTabLink
            }
            key={path}
            to={path}
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </>
  );
}
