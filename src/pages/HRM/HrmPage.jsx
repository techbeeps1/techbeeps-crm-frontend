import React, { useState } from "react";
import {
  AiOutlineFileSearch,
  AiOutlineClockCircle,
  AiOutlineSetting,
  AiOutlineSchedule,
} from "react-icons/ai";
import {
  MdAttachMoney,
  MdInsertInvitation,
  MdPeopleOutline,
  MdGroups,
} from "react-icons/md";
import { FiCheckCircle, FiClock, FiCalendar, FiFileText } from "react-icons/fi";
import Agentslist from "../../agents/Agentslist";
import Team from "./Team";
import LeaveRequestsTab from "./LeaveRequestsTab";
import LeaveCardsTab from "./LeaveCardsTab";

const HrmPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: "Staff", icon: <MdPeopleOutline className="text-xl" />, badge: null },
    { id: 1, label: "Teams for tasks", icon: <MdGroups className="text-xl" />, badge: null },
    { id: 2, label: "Approve hours", icon: <AiOutlineFileSearch className="text-xl" />, badge: "Beta" },
    { id: 3, label: "Hours overview", icon: <AiOutlineClockCircle className="text-xl" />, badge: null },
    { id: 4, label: "Leave requests", icon: <MdAttachMoney className="text-xl" />, badge: null },
    { id: 5, label: "Leave Quota", icon: <MdInsertInvitation className="text-xl" />, badge: null },
    { id: 6, label: "Declarations", icon: <AiOutlineSetting className="text-xl" />, badge: null },
  ];

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Top Header & Modern Navigation Bar */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-2 sm:p-3 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary"
                      }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Section */}
      <div className="w-full">
        {activeTab === 0 && <Agentslist />}
        {activeTab === 1 && <Team />}

        {activeTab === 2 && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-8 sm:p-12 shadow-xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center mx-auto mb-4 text-3xl">
              <AiOutlineFileSearch />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Approve Hours</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Review, adjust, and approve submitted work hours and overtime records for all staff members.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
              <FiClock className="text-primary" />
              <span>Timesheet synchronization active</span>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-8 sm:p-12 shadow-xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              <AiOutlineClockCircle />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Hours Overview</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Detailed breakdown of productive hours, billable time, and resource allocation across projects.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold border border-emerald-100 dark:border-emerald-900">
              <FiCheckCircle />
              <span>Analytics engine connected</span>
            </div>
          </div>
        )}

        {activeTab === 4 && <LeaveRequestsTab />}
        {activeTab === 5 && <LeaveCardsTab />}

        {activeTab === 6 && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-8 sm:p-12 shadow-xs text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center mx-auto mb-4 text-3xl">
              <AiOutlineSetting />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Declarations</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              Expense claims, travel allowance declarations, and reimbursable receipts management.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-semibold border border-rose-100 dark:border-rose-900">
              <AiOutlineSchedule />
              <span>Expense rules configured</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HrmPage;
