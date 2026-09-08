import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DemoChat from '../DemoChat';
import NewsItems from './communicationModule/newsItems';
import { EmailContext } from '../EmailProvider/EmailContext';
import { 
  MdChatBubbleOutline, 
  MdArticle,
  MdForum
} from 'react-icons/md';

const Communication: React.FC = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('EmailContext must be used within an EmailProvider');
  }

  const location = useLocation();
  const navigate = useNavigate();

  const getActiveTab = (): number => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('news') === 'true') return 1;
    return 0; // Default to Chat
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabIndex: number): void => {
    if (tabIndex === 0) navigate('?chat=true');
    if (tabIndex === 1) navigate('?news=true');
  };

  const tabs = [
    {
      id: 0,
      label: 'Team Chat',
      shortLabel: 'Chat',
      icon: MdChatBubbleOutline,
      desc: 'Real-time team messaging',
    },
    {
      id: 1,
      label: 'News Items',
      shortLabel: 'News',
      icon: MdArticle,
      desc: 'Company announcements',
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden gap-2.5">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white rounded-2xl py-2.5 px-4 sm:px-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-md shadow-primary/20 text-xl shrink-0">
            <MdForum />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight">
              Communication Center
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Manage team discussions & internal news announcements
            </p>
          </div>
        </div>

        {/* Modern Tab Pills */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-xs scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`text-sm ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View Content Container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 0 && <DemoChat />}
        {activeTab === 1 && (
          <div className="h-full overflow-y-auto">
            <NewsItems />
          </div>
        )}
      </div>
    </div>
  );
};

export default Communication;
