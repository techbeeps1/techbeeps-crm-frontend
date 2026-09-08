import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import { chatApiPath } from '../../apiPath';
import { Link, useNavigate } from 'react-router-dom';
import { EmailContext } from '../EmailProvider/EmailContext';
import {
  MdNotificationsNone,
  MdDoneAll,
  MdClose,
  MdArrowForward,
  MdChatBubbleOutline,
} from 'react-icons/md';

const Notifications: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const trigger = useRef<HTMLButtonElement | null>(null);
  const dropdown = useRef<HTMLDivElement | null>(null);

  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('EmailContext must be used within an EmailProvider');
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

  // Mark a single message as read
  const markAsRead = async (messageId: string) => {
    try {
      await axios.put(
        `${chatApiPath}/messages/${messageId}/markAsRead`,
        {},
        { withCredentials: true }
      );
      setNotification((prev) => prev.filter((m) => m._id !== messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all unread messages as read
  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notification.map((msg) =>
          axios.put(
            `${chatApiPath}/messages/${msg._id}/markAsRead`,
            {},
            { withCredentials: true }
          )
        )
      );
      setNotification([]);
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const handleNotificationClick = (message: any) => {
    const senderId =
      (typeof message.sender === 'object'
        ? message.sender?._id || message.sender?.userId || message.sender?.id
        : message.sender) || '';

    markAsRead(message._id);
    setDropdownOpen(false);

    if (senderId) {
      navigate(`/communication?chat=true&sender=${senderId}`);
    } else {
      navigate('/communication?chat=true');
    }
  };

  // Helper for friendly relative time
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Sender initials
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Color generator for avatar background
  const getAvatarColor = (name?: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-violet-500 to-purple-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600',
    ];
    if (!name) return colors[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <li className="relative list-none">
      {/* Trigger Bell Button */}
      <button
        ref={trigger}
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/90 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 hover:text-primary dark:text-slate-300 dark:hover:text-white transition-all duration-200 focus:outline-none cursor-pointer shadow-2xs group"
        aria-label="Notifications"
      >
        {notification.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white dark:ring-boxdark shadow-xs">
            {notification.length > 9 ? '9+' : notification.length}
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-60"></span>
          </span>
        )}
        <MdNotificationsNone className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
      </button>

      {/* Dropdown Card (Increased Width with Rich Details) */}
      <div
        ref={dropdown}
        className={`absolute right-0 mt-2.5 w-88 sm:w-[410px] rounded-2xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark shadow-2xl shadow-slate-900/15 z-50 overflow-hidden transition-all duration-150 ${
          dropdownOpen
            ? 'block opacity-100 translate-y-0'
            : 'hidden opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        {/* Dropdown Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-strokedark bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-white">
              Notifications
            </span>
            {notification.length > 0 && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                {notification.length} new
              </span>
            )}
          </div>

          {notification.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-primary/10 transition-all cursor-pointer whitespace-nowrap"
              title="Mark all as read"
            >
              <MdDoneAll className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List (Spacious with full details) */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-strokedark/60 no-scrollbar">
          {notification.length > 0 ? (
            notification.map((message) => (
              <div
                key={message._id}
                onClick={() => handleNotificationClick(message)}
                className="group flex items-start gap-3 p-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                {/* Sender Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                    message.sender?.username
                  )} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
                >
                  {getInitials(message.sender?.username)}
                </div>

                {/* Content & Details */}
                <div className="flex-1 min-w-0">
                  {/* Top line: Name + Tag + Time */}
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                        {message.sender?.username || 'Team Member'}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded shrink-0">
                        Chat
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-medium">
                      {formatTimeAgo(message.createdAt)}
                    </span>
                  </div>

                  {/* Message Bubble Snippet */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 border border-slate-100 dark:border-strokedark/50 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed break-words">
                      {message.text || 'Sent an attachment'}
                    </p>
                  </div>

                  {/* Quick Action Hints on Hover */}
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <MdChatBubbleOutline className="w-3 h-3" />
                      <span>Reply in Chat</span>
                      <MdArrowForward className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(message._id);
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                      title="Dismiss notification"
                    >
                      <MdClose className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Unread indicator dot */}
                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
              </div>
            ))
          ) : (
            <div className="py-10 px-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center text-xl mb-2 shadow-2xs">
                <MdNotificationsNone />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                All caught up!
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                No unread notifications right now
              </p>
            </div>
          )}
        </div>

        {/* Dropdown Footer */}
        <div className="p-2.5 border-t border-slate-100 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/20 text-center">
          <Link
            to="/dropdownNotification"
            onClick={() => setDropdownOpen(false)}
            className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors inline-flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
          >
            <span>View All Notifications</span>
            <MdArrowForward className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </li>
  );
};

export default Notifications;
