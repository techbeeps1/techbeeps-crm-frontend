import { createContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { chatApiPath } from "../apiPath.tsx";

interface UserContextType {
  userData: any;
  username: string | null;
  setUsername: (username: string | null) => void;
  id: string | null;
  setId: (id: string | null) => void;
  role: string | null;
  fetchProfile: any;
  ws:any;
  connectToWs:any;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserContextProviderProps {
  children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [id, setId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const token = localStorage.getItem('token');

  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  const fetchProfile = async () => {
    try {
      let response = await axios.get(`${chatApiPath}/profile`, { withCredentials: true })
      if (response.status === 200) {
        setId(response.data._id);
        setUsername(response.data.username);
        setRole(response.data.role);
        setUserData(response.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
  }

  const connectToWs = () => {
    const ws = new WebSocket(
      `wss://chat-backend-t73x.onrender.com?token=${token}`,
    );
    // const ws = new WebSocket(`ws://localhost:4040?token=${token}`);
    ws.onopen = () => console.log('WebSocket connected');
    setWs(ws);
    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.reason);
      setTimeout(connectToWs, 1000); 
    };
    ws.onerror = (error) => console.error('WebSocket error:', error);
  };

  useEffect(() => {
    if (token != null) {
      fetchProfile()
    }
  }, [token]);

  useEffect(() => {
    if (token != null) {
      connectToWs();
    }
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [token]);

  return (
    <UserContext.Provider value={{ws,connectToWs, userData, fetchProfile, username, setUsername, id, setId, role }}>
      {children}
    </UserContext.Provider>
  );
}
