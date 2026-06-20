import { NavLink, Outlet } from 'react-router-dom';
import styles from '@/views/styles/Layout.module.css';

const subTabs = [
  { label: 'Calories', path: '/plan/calories' },
  { label: 'Training', path: '/plan/training' },
];

export function PlanHub() {
  return (
    <>
      <nav aria-label="Plan sub-tabs" className={styles.subTabStrip}>
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
      <Outlet />
    </>
  );
}
