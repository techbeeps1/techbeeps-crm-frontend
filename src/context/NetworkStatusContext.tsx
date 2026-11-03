import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { apiPath } from '../../apiPath';

interface NetworkStatusContextType {
  isOnline: boolean;
  isServerReachable: boolean;
  isRetrying: boolean;
  lastDisconnected: Date | null;
  retryConnection: () => Promise<boolean>;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  isServerReachable: true,
  isRetrying: false,
  lastDisconnected: null,
  retryConnection: async () => true,
});

export const NetworkStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isServerReachable, setIsServerReachable] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [lastDisconnected, setLastDisconnected] = useState<Date | null>(null);

  /**
   * Lightweight probe directly hitting server health endpoint using native fetch.
   * Does NOT trigger global Axios interceptors.
   */
  const probeServer = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${apiPath}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      return res.status >= 200 && res.status < 500;
    } catch {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${apiPath}`, {
          method: 'GET',
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeoutId);
        return res.status >= 200 && res.status < 500;
      } catch {
        return false;
      }
    }
  };

  // Monitor browser online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      probeServer().then((reachable) => {
        if (reachable) {
          setIsServerReachable(true);
          toast.success('Internet connection restored!');
          window.dispatchEvent(new CustomEvent('app:network-reconnected'));
        }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsServerReachable(false);
      setLastDisconnected(new Date());
      toast.warn('You are now offline. Some features may be unavailable.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Axios interceptor for detecting network drops
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        // Any successful response from server proves connectivity
        if (!isServerReachable) {
          setIsServerReachable(true);
          setLastDisconnected(null);
        }
        return response;
      },
      (error) => {
        // Ignore aborted / cancelled requests (e.g. user navigated or debounced typing)
        if (
          axios.isCancel(error) ||
          error.name === 'CanceledError' ||
          error.code === 'ERR_CANCELED'
        ) {
          return Promise.reject(error);
        }

        // Only monitor calls to our CRM backend (ignore 3rd party services like map tiles or chat)
        const reqUrl = String(error.config?.url || '');
        const isCrmRequest = !reqUrl.startsWith('http') || reqUrl.startsWith(apiPath);
        if (!isCrmRequest) {
          return Promise.reject(error);
        }

        // If browser is physically offline:
        if (!navigator.onLine) {
          setIsOnline(false);
          setIsServerReachable(false);
          if (!lastDisconnected) setLastDisconnected(new Date());
          return Promise.reject(error);
        }

        // For suspected network errors, do NOT immediately show the red banner!
        // Run a lightweight probe to confirm whether the server is ACTUALLY down.
        if (
          error.code === 'ERR_NETWORK' ||
          error.message === 'Network Error' ||
          error.code === 'ECONNABORTED'
        ) {
          probeServer().then((reachable) => {
            if (!reachable) {
              setIsServerReachable(false);
              if (!lastDisconnected) {
                setLastDisconnected(new Date());
              }
            } else {
              // Server is alive! The individual request was just an isolated glitch/timeout.
              setIsServerReachable(true);
            }
          });
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isServerReachable, lastDisconnected]);

  // Automated background reconnection polling: periodically test /health when disconnected
  useEffect(() => {
    if (!isServerReachable && navigator.onLine) {
      const pollInterval = setInterval(async () => {
        const reachable = await probeServer();
        if (reachable) {
          setIsServerReachable(true);
          setLastDisconnected(null);
          toast.success('Server connection restored!');
          window.dispatchEvent(new CustomEvent('app:network-reconnected'));
        }
      }, 4000);

      return () => clearInterval(pollInterval);
    }
  }, [isServerReachable]);

  const retryConnection = useCallback(async (): Promise<boolean> => {
    setIsRetrying(true);
    try {
      if (!navigator.onLine) {
        toast.warn('Device is still offline. Please check your WiFi or network cable.');
        setIsRetrying(false);
        return false;
      }

      const reachable = await probeServer();
      if (reachable) {
        setIsServerReachable(true);
        setIsOnline(true);
        setLastDisconnected(null);
        toast.success('Connection successfully restored!');
        window.dispatchEvent(new CustomEvent('app:network-reconnected'));
        return true;
      } else {
        setIsServerReachable(false);
        toast.error('Unable to reach CRM server. Retrying...');
        return false;
      }
    } catch {
      setIsServerReachable(false);
      toast.error('Connection probe failed.');
      return false;
    } finally {
      setIsRetrying(false);
    }
  }, []);

  return (
    <NetworkStatusContext.Provider
      value={{
        isOnline,
        isServerReachable,
        isRetrying,
        lastDisconnected,
        retryConnection,
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => useContext(NetworkStatusContext);
