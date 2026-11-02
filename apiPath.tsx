const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
   window.location.hostname === '127.0.0.1')
);

export const apiPath = isLocalhost
  ? "http://localhost:8080"
  : "https://techbeeps-crm-backend-9i4i.vercel.app";

export const imageUrl = isLocalhost
  ? "http://localhost:4040"
  : "https://chat-backend-t73x.onrender.com";

export const chatApiPath = isLocalhost
  ? "http://localhost:8080/chatBackend"
  : "https://techbeeps-crm-backend-9i4i.vercel.app/chatBackend";

// Dynamically derive WebSocket URL from imageUrl (http -> ws, https -> wss)
export const chatWsUrl = imageUrl.replace(/^http/, 'ws');
