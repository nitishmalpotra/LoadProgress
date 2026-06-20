import { NavLink, Outlet } from 'react-router-dom';
import { useProfileStore } from '@/store/useProfileStore';
import { shouldShowCycleTab } from '@/store/useCycleStore';
import styles from '@/views/styles/Layout.module.css';

const BASE_TABS = [
  { label: 'Calories', path: '/plan/calories' },
  { label: 'Training', path: '/plan/training' },
  { label: 'Nutrition', path: '/plan/nutrition' },
  { label: 'Guide', path: '/plan/guide' },
];

const CYCLE_TAB = { label: 'Cycle', path: '/plan/cycle' };

export function PlanHub() {
  const profile = useProfileStore((s) => s.profile);
  const subTabs = shouldShowCycleTab(profile) ? [...BASE_TABS, CYCLE_TAB] : BASE_TABS;

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
