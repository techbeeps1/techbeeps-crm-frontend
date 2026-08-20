import React from 'react';
import Avatar from './Avatar';

export default function Contact({ id, username, onClick, selected, online, unreadMessages }: any) {
  return (
    <div
      key={id}
      onClick={() => onClick(id)}
      className={`px-3.5 py-3 flex items-center justify-between gap-3 border-b border-slate-100 transition-all cursor-pointer select-none ${
        selected
          ? 'bg-primary/5 border-l-4 border-l-primary shadow-2xs'
          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Avatar online={online} username={username} userId={id} size="md" />
        <div className="min-w-0">
          <div className={`text-sm font-bold truncate transition-colors ${
            selected ? 'text-primary' : 'text-slate-800'
          }`}>
            {username || 'Unknown User'}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className={`text-[11px] font-medium ${online ? 'text-emerald-600' : 'text-slate-400'}`}>
              {online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {unreadMessages > 0 && (
        <span className="shrink-0 px-2 py-0.5 bg-primary text-white text-[11px] font-bold rounded-full shadow-xs animate-pulse">
          {unreadMessages}
        </span>
      )}
    </div>
  );
}