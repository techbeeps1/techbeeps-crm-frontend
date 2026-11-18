import axios from 'axios';

/**
 * Determines whether a given request URL targets an internal CRM backend service.
 * Returns true for relative URLs, same-origin calls, and configured CRM API hosts.
 * Returns false for external third-party domains (e.g. OpenStreetMap, OSRM, external CDNs).
 */
export function isInternalBackendUrl(rawUrl?: string): boolean {
  if (!rawUrl) return true;

  const trimmed = rawUrl.trim();
  if (!trimmed) return true;

  // 1. Relative URLs (e.g., '/api/...', 'user/all', './something') are internal
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('//')) {
    return true;
  }

  try {
    const base = typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost';
    const parsed = new URL(trimmed, base);
    const hostname = parsed.hostname.toLowerCase();

    // 2. Same host as current browser location
    if (typeof window !== 'undefined' && window.location && hostname === window.location.hostname.toLowerCase()) {
      return true;
    }

    // 3. Localhost and loopback IPs
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return true;
    }

    // 4. Known CRM Backend and Chat Backend hosts
    const allowedHosts = [
      'techbeeps-crm-backend-9i4i.vercel.app',
      'chat-backend-t73x.onrender.com',
    ];

    if (allowedHosts.includes(hostname)) {
      return true;
    }

    // 5. Subdomains of vercel.app or onrender.com specifically deployed for this CRM
    if (hostname.endsWith('.vercel.app') && (hostname.includes('techbeeps-crm') || hostname.includes('universal-movers'))) {
      return true;
    }

    // 6. Official custom domain (e.g., universal-movers.nl)
    if (hostname === 'universal-movers.nl' || hostname.endsWith('.universal-movers.nl')) {
      return true;
    }
  } catch (err) {
    // If parsing fails, fall back to safe conservative check (treat as external)
    return false;
  }

  return false;
}

/**
 * Global Frontend Interceptor
 * Implements:
 * 1. EXEC-02: Injects a unique X-Correlation-ID header into internal outgoing HTTP requests.
 * 2. UM3-023: Strips Bearer tokens on third-party requests (e.g. Nominatim, OSRM, external CDNs)
 *    to prevent sensitive CRM session token leakage.
 */
axios.interceptors.request.use((config) => {
  if (!config.headers) {
    config.headers = {} as any;
  }

  const isInternal = isInternalBackendUrl(config.url);

  if (!isInternal) {
    // Strip sensitive authentication tokens & correlation headers for third-party endpoints
    // This prevents JWT token leakage to OpenStreetMap, OSRM, external CDNs, etc.
    delete config.headers['Authorization'];
    delete config.headers['authorization'];
    delete config.headers['X-Correlation-ID'];
    delete config.headers['x-correlation-id'];

    if (typeof (config.headers as any).delete === 'function') {
      (config.headers as any).delete('Authorization');
      (config.headers as any).delete('authorization');
      (config.headers as any).delete('X-Correlation-ID');
      (config.headers as any).delete('x-correlation-id');
    }

    return config;
  }

  // Internal CRM requests: Inject X-Correlation-ID for end-to-end tracing
  if (!config.headers['X-Correlation-ID']) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'cid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
    config.headers['X-Correlation-ID'] = id;
  }

  // Internal CRM requests: Inject Bearer token if not already set
  if (!config.headers['Authorization'] && !config.headers['authorization']) {
    try {
      const token =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('token')
          : typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('token')
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
