import React, { useState, useContext, useEffect } from 'react';
import CompanySettings from './CompanyDetail';
import MoneyFormatSettings from './CurrencySetting';
import LogoUploadForm from './Logo';
import Header from './Header';
import { UserContext } from '../../UserContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  TIMEZONE_OPTIONS,
  parseIanaTimezone,
  setSystemTimezone,
  getSystemTimezoneLabel,
} from '../../utils/timezoneUtil';
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
  MdChevronRight,
  MdSend,
  MdSchedule,
} from 'react-icons/md';

const AppSettings = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { userData } = useContext(UserContext) || {};

  const [generalSettings, setGeneralSettings] = useState({
    language: 'US English',
    country: 'IN India',
    email: userData?.email || '',
    timezone: getSystemTimezoneLabel() || 'UTC +05:30 (Asia/Kolkata)',
  });
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [liveTimeStr, setLiveTimeStr] = useState('');

  // Fetch saved settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${apiPath}/api/available-settings`);
        if (response.status === 200 && response.data) {
          const d = response.data;
          const loadedEmail = d.adminNotificationEmail || userData?.email || '';
          const loadedTimezone = d.timezone || getSystemTimezoneLabel() || 'UTC +05:30 (Asia/Kolkata)';
          setGeneralSettings({
            language: d.language || 'US English',
            country: d.country || 'IN India',
            email: loadedEmail,
            timezone: loadedTimezone,
          });
          if (loadedTimezone) {
            setSystemTimezone(loadedTimezone);
          }
        }
      } catch (err) {
        console.error('Failed to load available settings:', err);
      }
    };
    fetchSettings();
  }, [userData]);

  // Live clock preview for selected timezone
  useEffect(() => {
    const updateLiveTime = () => {
      try {
        const iana = parseIanaTimezone(generalSettings.timezone);
        const str = new Date().toLocaleTimeString('en-GB', {
          timeZone: iana,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        setLiveTimeStr(str);
      } catch (e) {
        setLiveTimeStr('');
      }
    };
    updateLiveTime();
    const interval = setInterval(updateLiveTime, 1000);
    return () => clearInterval(interval);
  }, [generalSettings.timezone]);

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setSavingGeneral(true);
    try {
      const payload = {
        language: generalSettings.language,
        country: generalSettings.country,
        adminNotificationEmail: (generalSettings.email || '').trim(),
        email: (generalSettings.email || '').trim(),
        timezone: generalSettings.timezone,
        timezoneName: parseIanaTimezone(generalSettings.timezone),
      };

      await axios.post(`${apiPath}/api/save-settings`, payload);
      setSystemTimezone(generalSettings.timezone);
      toast.success('General settings saved successfully!', { autoClose: 2000 });
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save general settings: ' + (err?.response?.data?.error || err.message));
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSendTestEmail = async () => {
    const targetEmail = (generalSettings.email || '').trim();
    if (!targetEmail) {
      toast.error('Please enter an Admin Notification Email first.');
      return;
    }
    setTestingEmail(true);
    try {
      const res = await axios.post(`${apiPath}/api/send-admin-test-email`, {
        email: targetEmail,
      });
      toast.success(res.data?.message || 'Test notification sent! Check inbox.');
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || 'Failed to dispatch test notification.');
    } finally {
      setTestingEmail(false);
    }
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
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <MdEmail className="text-primary text-base" />
                Admin Notification Email
              </label>
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={testingEmail || !generalSettings.email}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                title="Send test alert to verify this email works"
              >
                <MdSend className="text-xs" />
                <span>{testingEmail ? 'Sending...' : 'Send Test Alert'}</span>
              </button>
            </div>
            <input
              type="email"
              value={generalSettings.email}
              onChange={(e) => setGeneralSettings({ ...generalSettings, email: e.target.value })}
              placeholder="admin@techbeeps.com"
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            />
            <span className="text-[11px] text-body dark:text-bodydark mt-1.5 block">
              Receives crucial system alerts, staff leaves, backups & security logs
            </span>
          </div>

          {/* Timezone */}
          <div className="bg-gray-2 dark:bg-meta-4/40 p-4 rounded-xl border border-stroke dark:border-strokedark">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <MdAccessTime className="text-primary text-base" />
                System Timezone
              </label>
              {liveTimeStr && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                  <MdSchedule className="text-xs" />
                  <span>{liveTimeStr}</span>
                </span>
              )}
            </div>
            <select
              value={generalSettings.timezone}
              onChange={(e) => {
                setGeneralSettings({ ...generalSettings, timezone: e.target.value });
                setSystemTimezone(e.target.value);
              }}
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.iana} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-body dark:text-bodydark mt-1.5 block">
              Active across all appointments, calendar, chat timestamps, and logs
            </span>
          </div>
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

