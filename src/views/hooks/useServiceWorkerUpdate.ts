import { useEffect, useRef, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function useServiceWorkerUpdate() {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const updateServiceWorkerRef = useRef<ReturnType<typeof registerSW> | undefined>(undefined);

  useEffect(() => {
    updateServiceWorkerRef.current = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedsRefresh(true);
      },
      onRegisterError(error) {
        console.error('Service worker registration failed', error);
      }
    });
  }, []);

  const update = () => {
    updateServiceWorkerRef.current?.(true);
  };

  return { needsRefresh, update };
}
