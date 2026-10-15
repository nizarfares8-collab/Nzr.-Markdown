import React, { useState } from 'react';
import { WifiOff, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface OfflineNotificationProps {
  needRefresh: boolean;
  onRefresh: () => void;
  offlineReady: boolean;
}

export const OfflineNotification: React.FC<OfflineNotificationProps> = ({
  needRefresh,
  onRefresh,
  offlineReady,
}) => {
  const isOnline = useOnlineStatus();
  const [dismissOfflineReady, setDismissOfflineReady] = useState(false);

  return (
    <>
      {/* Offline Banner when device loses internet */}
      {!isOnline && (
        <aside
          aria-label="Offline Mode Notification"
          id="offline-status-banner"
          className="bg-amber-500 text-neutral-950 px-4 py-1.5 text-xs flex items-center justify-center gap-2 font-medium shrink-0 shadow-xs z-30"
        >
          <WifiOff className="w-3.5 h-3.5 shrink-0" />
          <span>You are offline. Full editing, live preview, and HTML export remain operational.</span>
        </aside>
      )}

      {/* Offline Ready Toast when Service Worker has precached all assets */}
      {offlineReady && !dismissOfflineReady && (
        <aside
          aria-label="Offline Ready Toast"
          id="offline-ready-toast"
          className="fixed bottom-10 right-4 z-50 bg-neutral-900 text-white px-3.5 py-2.5 rounded-xl shadow-lg border border-neutral-700 flex items-center gap-3 text-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>App cached for offline use.</span>
          <button
            type="button"
            aria-label="Dismiss offline ready message"
            onClick={() => setDismissOfflineReady(true)}
            className="text-neutral-400 hover:text-white transition-colors ml-1 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Service Worker Update Prompt */}
      {needRefresh && (
        <aside
          aria-label="App Update Available"
          id="sw-update-prompt"
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-indigo-950 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-indigo-700/80 flex items-center gap-3 text-xs"
        >
          <span>An updated version of the app is available.</span>
          <button
            type="button"
            id="sw-reload-btn"
            onClick={onRefresh}
            className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-400 text-white px-2.5 py-1 rounded-md font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            Reload
          </button>
        </aside>
      )}
    </>
  );
};
