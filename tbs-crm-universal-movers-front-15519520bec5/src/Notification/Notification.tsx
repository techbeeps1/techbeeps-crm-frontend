import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { chatApiPath } from '../../apiPath';
import { Link } from 'react-router-dom';
import { EmailContext } from '../EmailProvider/EmailContext'; 

const Notifications: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    
    const token = localStorage.getItem('token');
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    const trigger = useRef<HTMLAnchorElement | null>(null);
    const dropdown = useRef<HTMLDivElement | null>(null);
    
    const context = useContext(EmailContext);
    if (!context) {
        throw new Error("EmailContext must be used within an EmailProvider");
    }
    const { notification, setNotification } = context; 

    useEffect(() => {
        const clickHandler = (event: MouseEvent) => {
            if (!dropdown.current || !trigger.current) return;
            if (
                dropdownOpen &&
                !dropdown.current.contains(event.target as Node) &&
                !trigger.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
    }, [dropdownOpen]);

    useEffect(() => {
        const keyHandler = (event: KeyboardEvent) => {
            if (dropdownOpen && event.key === 'Escape') {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('keydown', keyHandler);
        return () => document.removeEventListener('keydown', keyHandler);
    }, [dropdownOpen]);

    // Mark a message as read when the user views it
    const markAsRead = async (messageId: string) => {
        try {
            await axios.put(`${chatApiPath}/messages/${messageId}/markAsRead`, {}, { withCredentials: true });
            setNotification((prevNotifications) => 
                prevNotifications.filter((message) => message._id !== messageId)
            );
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    return (
        <li className="relative">
            <Link
                ref={trigger}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                to="#"
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
                {notification.length > 0 ?  <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1">
                    <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
                </span> :''}
                <svg
                    className="fill-current duration-300 ease-in-out"
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
                    />
                </svg>
            </Link>
            <div
                ref={dropdown}
                className={`absolute left-0 mt-2.5 flex flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:w-100 ${dropdownOpen ? 'block' : 'hidden'}`}
            >
                <div className="px-4.5 py-3">
                    <h3 className="text-medium font-medium text-bodydark2"> 🔔 Notifications</h3>
                </div>

                <ul className="flex h-auto flex-col overflow-y-auto">
                    {notification.length > 0 ? (
                        notification.map((message) => (
                            <div key={message._id}>
                                <li>
                                    <a
                                        className="flex flex-col gap-2.5 border-t border-stroke px-4.5 pt-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                                        onClick={() => markAsRead(message._id)}
                                    >
                                        <p className="text-sm">
                                            <span className="text-black dark:text-white">Hey {message.sender.username}!</span> {message.text}
                                        </p>
                                        <p className="text-xs">{new Date(message.createdAt).toLocaleString()}</p>
                                        <p className="text-sm">
                                            Got a fresh message from {message.sender.username}.
                                        </p>
                                    </a>
                                </li>
                                <div className="px-4.5 py-3 border-stroke">
                                    <Link
                                        to={`/communication?sender=${message.sender._id}`} // Adjust this path to your conversation route
                                        className="inline-block w-full text-center rounded bg-primary py-2 text-white hover:bg-primary-dark transition duration-200"
                                    >
                                        Open Conversation
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <li className="px-4.5 py-3 text-sm text-bodydark2">No new notifications</li>
                    )}
                </ul>
            </div>
        </li>
    );
};

export default Notifications;
