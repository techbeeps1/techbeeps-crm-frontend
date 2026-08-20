import React, { useState, useContext } from 'react';
import CompanySettings from './CompanyDetail';
import MoneyFormatSettings from './CurrencySetting';
import LogoUploadForm from './Logo';
import Header from './Header';
import RoleSettings from './RoleSetting';
import { UserContext } from '../../UserContext';
import { toast } from 'react-toastify';
import {
  MdOutlineTune,
  MdOutlineBusiness,
  MdOutlinePayments,
  MdOutlineImage,
  MdOutlineAdminPanelSettings,
  MdLanguage,
  MdPublic,
  MdEmail,
  MdAccessTime,
  MdSave,
  MdCheckCircle,
  MdChevronRight
} from 'react-icons/md';

const AppSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { userData } = useContext(UserContext) || {};

  const [generalSettings, setGeneralSettings] = useState({
    language: 'US English',
    country: 'IN India',
    email: userData?.email || '',
    timezone: 'UTC +05:30 (Asia/Kolkata)',
    autoSave: true,
  });
  const [savingGeneral, setSavingGeneral] = useState(false);

  const handleGeneralSubmit = (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    setTimeout(() => {
      setSavingGeneral(false);
      toast.success('General settings saved successfully!', { autoClose: 2000 });
    }, 600);
  };

  const navItems = [
    {
      id: 0,
      title: 'General Settings',
      shortTitle: 'General',
      icon: MdOutlineTune,
      desc: 'System preferences & language',
    },
    {
      id: 1,
      title: 'Company Profile',
      shortTitle: 'Company',
      icon: MdOutlineBusiness,
      desc: 'Address, legal & contact info',
    },
    {
      id: 2,
      title: 'Currency & Format',
      shortTitle: 'Currency',
      icon: MdOutlinePayments,
      desc: 'Default currency & symbols',
    },
    {
      id: 3,
      title: 'Company Logo & Branding',
      shortTitle: 'Branding',
      icon: MdOutlineImage,
      desc: 'Official logo & visual identity',
    },
    {
      id: 4,
      title: 'User Roles & Access',
      shortTitle: 'Roles',
      icon: MdOutlineAdminPanelSettings,
      desc: 'Permissions & staff privileges',
    },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      {/* Header info */}
      <div className="border-b border-stroke dark:border-strokedark pb-4">
        <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
          <MdOutlineTune className="text-primary text-2xl" />
          General System Preferences
        </h3>
        <p className="text-sm text-body dark:text-bodydark mt-1">
          Configure default regional parameters, system language and account communications.
        </p>
      </div>

      <form onSubmit={handleGeneralSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Language Selection */}
          <div className="bg-gray-2 dark:bg-meta-4/40 p-4 rounded-xl border border-stroke dark:border-strokedark">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <MdLanguage className="text-primary text-base" />
              Default Language
            </label>
            <select
              value={generalSettings.language}
              onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              <option value="US English">English (United States)</option>
              <option value="UK English">English (United Kingdom)</option>
              <option value="DE German">German (Deutsch)</option>
              <option value="FR French">French (Français)</option>
              <option value="ES Spanish">Spanish (Español)</option>
            </select>
            <span className="text-[11px] text-body dark:text-bodydark mt-1.5 block">
              Applied across all client portals and exported documents
            </span>
          </div>

          {/* Country Selection */}
          <div className="bg-gray-2 dark:bg-meta-4/40 p-4 rounded-xl border border-stroke dark:border-strokedark">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <MdPublic className="text-primary text-base" />
              Country & Region
            </label>
            <select
              value={generalSettings.country}
              onChange={(e) => setGeneralSettings({ ...generalSettings, country: e.target.value })}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              <option value="IN India">India (IN)</option>
              <option value="US United States">United States (US)</option>
              <option value="UK United Kingdom">United Kingdom (UK)</option>
              <option value="CA Canada">Canada (CA)</option>
              <option value="AU Australia">Australia (AU)</option>
              <option value="DE Germany">Germany (DE)</option>
              <option value="AE United Arab Emirates">United Arab Emirates (UAE)</option>
            </select>
            <span className="text-[11px] text-body dark:text-bodydark mt-1.5 block">
              Determines regional formats and tax defaults
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Notification Email */}
          <div className="bg-gray-2 dark:bg-meta-4/40 p-4 rounded-xl border border-stroke dark:border-strokedark">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <MdEmail className="text-primary text-base" />
              Admin Notification Email
            </label>
            <input
              type="email"
              value={generalSettings.email || userData?.email || ''}
              onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
              placeholder="admin@techbeeps.com"
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
            <span className="text-[11px] text-body dark:text-bodydark mt-1.5 block">
              Receives crucial system alerts, backups & security logs
            </span>
          </div>

          {/* Timezone */}
          <div className="bg-gray-2 dark:bg-meta-4/40 p-4 rounded-xl border border-stroke dark:border-strokedark">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <MdAccessTime className="text-primary text-base" />
              System Timezone
            </label>
            <select
              value={generalSettings.timezone}
              onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              <option value="UTC +05:30 (Asia/Kolkata)">UTC +05:30 (Asia/Kolkata - IST)</option>
              <option value="UTC +00:00 (GMT/UTC)">UTC +00:00 (London, GMT)</option>
              <option value="UTC -05:00 (America/New_York)">UTC -05:00 (Eastern Time - US)</option>
              <option value="UTC -08:00 (America/Los_Angeles)">UTC -08:00 (Pacific Time - US)</option>
              <option value="UTC +04:00 (Asia/Dubai)">UTC +04:00 (Dubai, GST)</option>
              <option value="UTC +08:00 (Asia/Singapore)">UTC +08:00 (Singapore, SGT)</option>
            </select>
            <span className="text-[11px] text-body dark:text-bodydark mt-1.5 block">
              Used for appointment bookings, calendar & chat timestamps
            </span>
          </div>
        </div>

        {/* Feature quick flags card */}
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center text-xl shrink-0">
              <MdCheckCircle />
            </div>
            <div>
              <p className="text-sm font-bold text-black dark:text-white">
                Live Data Synchronisation
              </p>
              <p className="text-xs text-body dark:text-bodydark">
                Automatically keep company settings in sync with multi-user sessions
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-success/15 text-success">
            Active
          </span>
        </div>

        {/* Action Button */}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={savingGeneral}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <MdSave className="text-lg" />
            {savingGeneral ? 'Saving Settings...' : 'Save General Settings'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return renderGeneralSettings();
      case 1:
        return <CompanySettings />;
      case 2:
        return <MoneyFormatSettings />;
      case 3:
        return (
          <div className="space-y-6">
            <div className="border-b border-stroke dark:border-strokedark pb-4">
              <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
                <MdOutlineImage className="text-primary text-2xl" />
                Company Branding & Logo
              </h3>
              <p className="text-sm text-body dark:text-bodydark mt-1">
                Customize your organization logo displayed on invoices, quotations, and emails.
              </p>
            </div>
            <LogoUploadForm />
          </div>
        );
      case 4:
        return <RoleSettings />;
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
              Account Categories
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
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all cursor-pointer group ${isActive
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.01]'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-strokedark/60'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 transition-colors ${isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-meta-4 text-primary group-hover:bg-primary group-hover:text-white shadow-xs'
                        }`}
                    >
                      <Icon />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <p
                        className={`text-[11px] truncate ${isActive ? 'text-white/80' : 'text-body dark:text-bodydark'
                          }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <MdChevronRight
                    className={`text-lg shrink-0 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                      }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Quick Info Box at bottom */}
          <div className="mt-8 hidden md:block p-4 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/15 text-xs text-body dark:text-bodydark">
            <p className="font-bold text-black dark:text-white text-xs mb-1">
              Need Assistance?
            </p>
            <p className="text-[11px] leading-relaxed">
              Updates to legal company details will immediately reflect on newly generated quotes and invoices.
            </p>
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

export default AppSettings;

