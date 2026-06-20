import { Link } from 'react-router-dom';
import styles from '@/views/styles/Profile.module.css';

export function NoProfileEmptyState() {
  return (
    <div className={styles.noProfileState}>
      <p>Add your stats to unlock this feature.</p>
      <Link className={styles.noProfileLink} to="/profile">
        Add your stats →
      </Link>
    </div>
  );
}
