import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { EmailContext } from '../EmailProvider/EmailContext';
import axios from 'axios';
import { chatApiPath } from '../../apiPath';
import {
  MdNotifications,
  MdNotificationsNone,
  MdDoneAll,
  MdClose,
  MdChatBubbleOutline,
  MdArrowForward,
  MdSearch,
  MdRefresh,
  MdForum,
  MdAccessTime,
  MdCheckCircleOutline,
} from 'react-icons/md';

interface NotificationPageProps {
  display?: string;
}

const NotificationPage: React.FC<NotificationPageProps> = ({ display }) => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('EmailContext must be used within an EmailProvider');
  }

  const { notification, setNotification, fetchUnreadMessages } = context;
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Format date helper
  const formatDate = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      };
      return date.toLocaleDateString('en-GB', options).replace(',', ' at');
    } catch {
      return '';
    }
  };

  // Relative time helper
  const formatTimeAgo = (isoDate: string): string => {
    try {
      const date = new Date(isoDate);
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

  // Initials generator
  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Gradient generator for avatar
  const getAvatarColor = (name?: string): string => {
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

  // Mark a single message as read
  const markAsRead = async (messageId: string): Promise<void> => {
    try {
      await axios.put(
        `${chatApiPath}/messages/${messageId}/markAsRead`,
        {},
        { withCredentials: true }
      );
      setNotification((prev) => prev.filter((m: any) => m._id !== messageId));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      await Promise.all(
        notification.map((msg: any) =>
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

  // Open sender chat conversation
  const handleOpenConversation = (item: any) => {
    const senderId =
      (typeof item.sender === 'object'
        ? item.sender?._id || item.sender?.userId || item.sender?.id
        : item.sender) || '';

    markAsRead(item._id);

    if (senderId) {
      navigate(`/communication?chat=true&sender=${senderId}`);
    } else {
      navigate('/communication?chat=true');
    }
  };

  // Refresh notifications
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUnreadMessages();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // Filter list by search term
  const filteredNotifications = notification.filter((item: any) => {
    const senderName = item.sender?.username || '';
    const text = item.text || '';
    const q = searchTerm.toLowerCase();
    return (
      senderName.toLowerCase().includes(q) || text.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb */}
      <div style={{ display: display }}>
        <Breadcrumb pageName="Notifications" />
      </div>

      {/* Main Top Header Banner */}
      <div className="bg-white dark:bg-boxdark rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-strokedark shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-md shadow-primary/20 text-2xl shrink-0">
            <MdNotifications />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                Notification Center
              </h2>
              {notification.length > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  {notification.length} Unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time message alerts and internal communication notifications
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            title="Refresh notifications"
          >
            <MdRefresh className={`text-base ${refreshing ? 'animate-spin text-primary' : ''}`} />
            <span>Refresh</span>
          </button>

          {notification.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary/10 hover:bg-primary/15 text-primary transition-all cursor-pointer"
            >
              <MdDoneAll className="text-base" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate('/communication?chat=true')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white transition-all cursor-pointer shadow-sm shadow-primary/25"
          >
            <MdForum className="text-base" />
            <span>Team Chat</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-boxdark rounded-2xl p-4 border border-slate-200/80 dark:border-strokedark shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <MdSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-strokedark rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <MdClose className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-primary text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70'
            }`}
          >
            All Alerts ({notification.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('unread')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterType === 'unread'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Unread ({notification.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications List Container */}
      <div className="space-y-2">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((item: any) => {
            const senderName = item.sender?.username || 'Team Member';
            return (
              <div
                key={item._id}
                onClick={() => handleOpenConversation(item)}
                className="group relative bg-white dark:bg-boxdark hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border border-slate-200/80 dark:border-strokedark hover:border-primary/40 rounded-xl px-4 py-2.5 sm:py-3 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                {/* Left Side: Avatar + Compact Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Colorful Initial Avatar */}
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                      senderName
                    )} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}
                  >
                    {getInitials(senderName)}
                  </div>

                  {/* Text Details (2 clean lines) */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white truncate">
                        {senderName}
                      </h4>
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-md bg-primary/10 text-primary shrink-0">
                        Chat
                      </span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                        <MdAccessTime className="w-3 h-3" />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                        <span className="hidden md:inline text-slate-300 dark:text-slate-600">•</span>
                        <span className="hidden md:inline">{formatDate(item.createdAt)}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                      {item.text || 'Sent an attachment'}
                    </p>
                  </div>
                </div>

                {/* Right Side: Quick Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenConversation(item);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                  >
                    <MdChatBubbleOutline className="text-xs" />
                    <span>Open Chat</span>
                    <MdArrowForward className="text-[10px] transition-transform group-hover:translate-x-0.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item._id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer"
                    title="Mark as read"
                  >
                    <MdCheckCircleOutline className="w-4.5 h-4.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(item._id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                    title="Dismiss"
                  >
                    <MdClose className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-12 text-center shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center text-3xl mb-3 shadow-xs">
              <MdNotificationsNone />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {searchTerm ? 'No matching notifications found' : 'All caught up! 🎉'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No notifications found matching "${searchTerm}". Try a different keyword.`
                : 'You have no unread notifications or messages waiting for review.'}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-all"
                >
                  Clear search
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/communication?chat=true')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary-dark text-white shadow-sm shadow-primary/25 transition-all"
              >
                Go to Team Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
