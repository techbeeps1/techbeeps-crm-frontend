import React from 'react';
import { MdOutlineChat } from 'react-icons/md';

export default function Logo() {
  return (
    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg">
          <MdOutlineChat />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">Direct Messages</h3>
          <p className="text-[11px] text-slate-400 font-medium">Internal Team Chat</p>
        </div>
      </div>
    </div>
  );
}