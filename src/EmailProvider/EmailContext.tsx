import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { chatApiPath, apiPath } from '../../apiPath';

interface Notification {
    _id: string;
    message: string;
    unread: boolean;
    text: string;
    createdAt: string;
    sender: {
        _id: string;
        username: string;
    };
}
interface EmailContextType {
    settings: any;
    notification: Notification[];
    setNotification: React.Dispatch<React.SetStateAction<Notification[]>>;
    fetchUnreadMessages: () => Promise<void>;
    fetchTemplates: () => Promise<void>;
}

export const EmailContext = createContext<EmailContextType | null>(null);

interface EmailProviderProps {
    children: ReactNode;
}
export const EmailProvider: React.FC<EmailProviderProps> = ({ children }) => {
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const [notification, setNotification] = useState<Notification[]>([]);
    const [settings, setSettings] = useState<any>(null);


    const fetchUnreadMessages = async () => {
        try {
            const response = await axios.get(`${chatApiPath}/notifications`, { withCredentials: true });
            const fetchedNotifications: Notification[] = response.data;
            setNotification(fetchedNotifications);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };
    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/available-settings`);
            setSettings(response.data);
            console.log(response.data);
        } catch (error: any) {
            console.log(error.message);
        }
    }

    useEffect(() => {
        if (token) {
            fetchUnreadMessages();
            fetchTemplates();
        }
    }, [token]);

    return (
        <EmailContext.Provider value={{ settings,fetchTemplates, notification, setNotification, fetchUnreadMessages }}>
            {children}
        </EmailContext.Provider>
    );
};
