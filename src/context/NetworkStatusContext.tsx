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

  // Monitor browser online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Quick probe to verify server connectivity
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
        // Successful response proves connectivity
        if (!isServerReachable) {
          setIsServerReachable(true);
        }
        return response;
      },
      (error) => {
        if (
          !navigator.onLine ||
          error.code === 'ERR_NETWORK' ||
          error.message === 'Network Error' ||
          error.code === 'ECONNABORTED'
        ) {
          setIsServerReachable(false);
          if (!lastDisconnected) {
            setLastDisconnected(new Date());
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isServerReachable, lastDisconnected]);

  const probeServer = async (): Promise<boolean> => {
    try {
      // Light ping to server root or health probe with 4s timeout
      await axios.get(`${apiPath}/health`, { timeout: 4000 }).catch(() => {
        // If /health doesn't exist, try simple head/get to apiPath
        return axios.get(`${apiPath}`, { timeout: 4000 });
      });
      return true;
    } catch (err: any) {
      // If server responded with 404 or 401, server IS reachable (HTTP layer is up!)
      if (err.response && err.response.status) {
        return true;
      }
      return false;
    }
  };

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
        // Broadcast custom event so active pages can re-trigger their fetchers
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
