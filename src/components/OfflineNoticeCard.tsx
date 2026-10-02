import React, { useState } from 'react';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';
import { useNetworkStatus } from '../context/NetworkStatusContext';

interface OfflineNoticeCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void | Promise<any>;
  hasCachedData?: boolean;
}

/**
 * In-Page or Full-Page Offline & Connection Error Card
 */
export const OfflineNoticeCard: React.FC<OfflineNoticeCardProps> = ({
  title = "You're in Offline Mode",
  message = "Your device appears to be disconnected or the CRM server is unreachable. Please check your internet connection.",
  onRetry,
  hasCachedData = false,
}) => {
  const { isRetrying, retryConnection } = useNetworkStatus();
  const [localRetrying, setLocalRetrying] = useState(false);

  const handleRetry = async () => {
    setLocalRetrying(true);
    try {
      if (onRetry) {
        await onRetry();
      }
      await retryConnection();
    } finally {
      setLocalRetrying(false);
    }
  };

  const isBusy = isRetrying || localRetrying;

  return (
    <div className="w-full max-w-xl mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-boxdark rounded-3xl border border-slate-200/80 dark:border-strokedark shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
      {/* Icon with pulsing ring */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-rose-500/10 dark:bg-rose-500/20 animate-ping opacity-75" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
          <WifiOffIcon style={{ fontSize: 32 }} />
        </div>
      </div>

      {/* Header and status badge */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Offline Mode • No Connection
        </div>
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
          {message}
        </p>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          disabled={isBusy}
          onClick={handleRetry}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshIcon
            className={isBusy ? 'animate-spin' : ''}
            style={{ fontSize: 18 }}
          />
          <span>{isBusy ? 'Testing Connection...' : 'Retry Connection'}</span>
        </button>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <span>Reload Page</span>
        </button>
      </div>

      {hasCachedData && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Note: You are currently viewing cached data from your previous session.
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Persistent Top Alert Bar for Layouts
 */
export const OfflineBanner: React.FC = () => {
  const { isOnline, isServerReachable, isRetrying, retryConnection } = useNetworkStatus();

  // If online and server is reachable, do not render banner
  if (isOnline && isServerReachable) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white shadow-md animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-1 rounded-lg bg-white/20 backdrop-blur-md flex-shrink-0">
            <WifiOffIcon style={{ fontSize: 16 }} />
          </span>
          <span className="truncate">
            {!isOnline
              ? 'You are currently offline. Check your internet connection.'
              : 'Server connection interrupted. Attempting to reconnect...'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            disabled={isRetrying}
            onClick={() => retryConnection()}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-slate-900 font-bold text-xs shadow-xs hover:bg-white/90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <RefreshIcon
              className={isRetrying ? 'animate-spin' : ''}
              style={{ fontSize: 14 }}
            />
            <span>{isRetrying ? 'Reconnecting...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineNoticeCard;
