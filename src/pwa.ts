import { registerSW } from 'virtual:pwa-register';

export function initPWA(
  onNeedRefresh?: (reload: (reloadPage?: boolean) => Promise<void>) => void,
  onOfflineReady?: () => void
) {
  const updateSW = registerSW({
    onNeedRefresh() {
      if (onNeedRefresh) {
        onNeedRefresh(updateSW);
      } else {
        // Auto update by default
        updateSW(true);
      }
    },
    onOfflineReady() {
      if (onOfflineReady) {
        onOfflineReady();
      }
      console.log('App ready to work offline with service worker.');
    },
  });

  return updateSW;
}
