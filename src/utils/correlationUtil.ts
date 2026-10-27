import axios from 'axios';

/**
 * Global Frontend Correlation ID Interceptor
 * Implements EXEC-02:
 * Injects a unique X-Correlation-ID header into every outgoing HTTP request,
 * allowing end-to-end tracing from the browser DevTools to server log files.
 */

axios.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {} as any;
  }
  if (!config.headers['X-Correlation-ID']) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'cid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    config.headers['X-Correlation-ID'] = id;
  }
  if (!config.headers['Authorization']) {
    try {
      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('token')
          : null;
      if (token && token !== 'null' && token !== 'undefined') {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore storage access errors
    }
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const correlationId =
      error.response?.headers?.['x-correlation-id'] ||
      error.config?.headers?.['X-Correlation-ID'];
    if (correlationId) {
      error.correlationId = correlationId;
    }
    return Promise.reject(error);
  }
);
