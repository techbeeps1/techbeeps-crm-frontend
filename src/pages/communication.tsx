import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DemoChat from '../DemoChat';
import NewsItems from './communicationModule/newsItems';
import EmailComponent from './Emailpage/EmailComponent';
import { EmailContext } from '../EmailProvider/EmailContext';
import { 
  MdChatBubbleOutline, 
  MdMailOutline, 
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
    if (queryParams.get('email') === 'true') return 1;
    if (queryParams.get('news') === 'true') return 2;
    return 0; // Default to Chat
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tabIndex: number): void => {
    if (tabIndex === 0) navigate('?chat=true');
    if (tabIndex === 1) navigate('?email=true');
    if (tabIndex === 2) navigate('?news=true');
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
      label: 'Email Messages',
      shortLabel: 'Email',
      icon: MdMailOutline,
      desc: 'Customer correspondence',
    },
    {
      id: 2,
      label: 'News Items',
      shortLabel: 'News',
      icon: MdArticle,
      desc: 'Company announcements',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-md shadow-primary/20 text-2xl shrink-0">
            <MdForum />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              Communication Center
            </h2>
            <p className="text-xs text-slate-500">
              Manage team discussions, client email exchanges & internal news announcements
            </p>
          </div>
        </div>

        {/* Modern Tab Pills */}
        <div className="flex items-center bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 self-start md:self-auto overflow-x-auto max-w-full no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className={`text-base ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View Content Container */}
      <div className="transition-all duration-200">
        {activeTab === 0 && <DemoChat />}
        {activeTab === 1 && <EmailComponent />}
        {activeTab === 2 && <NewsItems />}
      </div>
    </div>
  );
};

export default Communication;

