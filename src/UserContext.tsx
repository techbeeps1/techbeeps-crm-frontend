import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { apiPath, chatApiPath } from "../apiPath.tsx";

interface UserContextType {
  userData: any;
  setUserData: (data: any) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
  id: string | null;
  setId: (id: string | null) => void;
  role: string | null;
  setRole: (role: string | null) => void;
  isAdmin: boolean;
  hasAccess: (moduleName?: string) => boolean;
  fetchProfile: () => Promise<void>;
  ws: any;
  connectToWs: any;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [username, setUsername] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved)?.username || JSON.parse(saved)?.name : null;
    } catch {
      return null;
    }
  });
  const [id, setId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved)?.userId || JSON.parse(saved)?.id : null;
    } catch {
      return null;
    }
  });
  const [role, setRole] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved)?.role : null;
    } catch {
      return null;
    }
  });
  const [userData, setUserData] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [ws, setWs] = useState<WebSocket | null>(null);

  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const isAdmin = role === 'Admin' || userData?.role === 'Admin';

  const hasAccess = (moduleName?: string): boolean => {
    if (!moduleName) return true;
    if (isAdmin) return true;
    const universalModules = ['Profile', 'Communication', 'Notifications', 'My Leaves', 'Leave', 'Leaves'];
    if (universalModules.includes(moduleName)) {
      return true;
    }
    const accessList = userData?.access || [];
    // Backwards compatibility for 'Jobs' / 'To do'
    if (moduleName === 'Jobs' || moduleName === 'To do') {
      return accessList.includes('Jobs') || accessList.includes('To do');
    }
    return accessList.includes(moduleName);
  };

  const fetchProfile = async () => {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) return;

    try {
      const response = await axios.get(`${apiPath}/user/profile`, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      if (response.status === 200 && response.data?.user) {
        const user = response.data.user;
        const uid = user.userId || user.id || user._id;
        const uname = user.username || user.name;
        setId(uid);
        setUsername(uname);
        setRole(user.role);
        setUserData(user);
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error: any) {
      console.error('Failed to fetch CRM user profile:', error?.message);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
  };

  const connectToWs = () => {
    if (!token) return;
    try {
      const socket = new WebSocket(
        `wss://chat-backend-t73x.onrender.com?token=${token}`,
      );
      socket.onopen = () => console.log('WebSocket connected');
      setWs(socket);
      socket.onclose = (event) => {
        console.log('WebSocket closed:', event.reason);
      };
      socket.onerror = (err) => {
        console.warn('WebSocket notification service optional/unavailable');
      };
    } catch (err) {
      console.warn('WebSocket connection skipped');
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      connectToWs();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        ws,
        connectToWs,
        userData,
        setUserData,
        fetchProfile,
        username,
        setUsername,
        id,
        setId,
        role,
        setRole,
        isAdmin,
        hasAccess,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
