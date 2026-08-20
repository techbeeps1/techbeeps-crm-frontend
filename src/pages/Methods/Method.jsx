import React, { useState } from 'react';
import Header from '../Admin/Header';
import Packages from './Package';
import Salesgroup from './Salegroup/Salesgroup';
import Reporting from './Reporting/Reporting';
import EmailTemplateList from './EmailTemplates/EmailTemplateList';
import {
  MdInventory2,
  MdSummarize,
  MdDescription,
  MdGroups,
  MdChevronRight
} from 'react-icons/md';

const Method = () => {
  const [activeTab, setActiveTab] = useState(0);

  const navItems = [
    {
      id: 0,
      title: 'Packages & Bundles',
      shortTitle: 'Packages',
      icon: MdInventory2,
      desc: 'Preconfigured service bundles',
    },
    {
      id: 1,
      title: 'Customer Reporting',
      shortTitle: 'Reporting',
      icon: MdSummarize,
      desc: 'Audit & activity summaries',
    },
    {
      id: 2,
      title: 'Document & Email Templates',
      shortTitle: 'Templates',
      icon: MdDescription,
      desc: 'Quotation and notice layouts',
    },
    {
      id: 3,
      title: 'Sales Groups & Units',
      shortTitle: 'Sales Groups',
      icon: MdGroups,
      desc: 'Agent distribution & teams',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <Packages />;
      case 1:
        return <Reporting />;
      case 2:
        return <EmailTemplateList />;
      case 3:
        return <Salesgroup />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <Header />

      {/* Main Container Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        {/* Left Vertical Navigation */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-stroke dark:border-strokedark bg-gray-2/40 dark:bg-boxdark-2/40 p-3 sm:p-4 shrink-0">
          <div className="mb-3 px-3 py-2">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workflows & Rules
            </p>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${
                    isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-strokedark/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-colors ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-meta-4 text-primary group-hover:bg-primary group-hover:text-white shadow-xs'
                      }`}
                    >
                      <Icon />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <p
                        className={`text-[11px] truncate ${
                          isActive ? 'text-white/80' : 'text-body dark:text-bodydark'
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <MdChevronRight
                    className={`text-lg shrink-0 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Viewport */}
        <div className="flex-1 p-5 sm:p-7 md:p-8 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Method;

