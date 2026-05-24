import { RefreshCw } from 'lucide-react';
import styles from '@/views/styles/Layout.module.css';

interface ServiceWorkerUpdateToastProps {
  open: boolean;
  onUpdate: () => void;
}

export function ServiceWorkerUpdateToast({ open, onUpdate }: ServiceWorkerUpdateToastProps) {
  return (
    <button
      className={`${styles.updateToast} ${open ? styles.updateToastVisible : ''}`}
      onClick={onUpdate}
      type="button"
    >
      <RefreshCw aria-hidden="true" size={18} strokeWidth={2.5} />
      <span>New build ready. Tap to update.</span>
    </button>
  );
}
