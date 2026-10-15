import React, { useState } from 'react';
import { Download, Check, Share2, PlusSquare, X, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already installed in standalone window mode, don't clutter the header
  if (isInstalled && !justInstalled) {
    return (
      <div
        id="pwa-installed-badge"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg"
        title="App is installed and runs offline via Service Worker"
      >
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden lg:inline">Offline Ready</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      const success = await installApp();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 4000);
      }
    } else {
      // Fallback guide if browser doesn't trigger beforeinstallprompt (e.g. desktop Chrome already promptable via omnibox or inside iframe)
      setShowIOSModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        id="pwa-install-header-btn"
        onClick={handleInstallClick}
        title="Install app to desktop or mobile for offline editing"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-medium transition-colors cursor-pointer"
      >
        <Monitor className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* iOS or Manual Installation Guide Modal */}
      {showIOSModal && (
        <div
          id="pwa-install-modal-overlay"
          className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            id="pwa-install-modal"
            className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 text-neutral-800 border border-neutral-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              id="pwa-install-modal-close"
              aria-label="Close"
              onClick={() => setShowIOSModal(false)}
              className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm">
                  Install Markdown to HTML
                </h3>
                <p className="text-xs text-neutral-500">
                  Runs offline • Standalone window
                </p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
              Install this application directly to your home screen or desktop to open in a dedicated, distraction-free window with offline service worker support.
            </p>

            <div className="space-y-2.5 bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs text-neutral-700 mb-4">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  Tap the browser <span className="font-semibold">Share</span> icon <Share2 className="inline w-3 h-3 text-neutral-600 mx-0.5" /> or Chrome menu <span className="font-semibold">(⋮)</span>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  Select <span className="font-semibold">Add to Home Screen</span> <PlusSquare className="inline w-3 h-3 text-neutral-600 mx-0.5" /> or <span className="font-semibold">Install App</span>.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  Launch from your home screen or dock anytime—even without internet.
                </div>
              </div>
            </div>

            <button
              type="button"
              id="pwa-install-modal-dismiss"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
