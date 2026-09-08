import React, { useState, useEffect, useMemo } from 'react';
import {
  FiClock,
  FiCalendar,
  FiPlus,
  FiCheckCircle,
  FiTrash2,
  FiSave,
  FiRefreshCw,
  FiSun,
  FiMoon,
  FiAlertCircle,
  FiSliders,
  FiUser,
  FiX,
  FiCheck,
  FiCopy,
  FiLayers,
} from 'react-icons/fi';
import { Dialog } from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiPath } from '../../apiPath';

// Standard 7-Day Order
const DAYS_ORDER = [
  { key: 'monday', label: 'Monday', short: 'Mon', sub: 'Maandag (Ma)' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', sub: 'Dinsdag (Di)' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', sub: 'Woensdag (Wo)' },
  { key: 'thursday', label: 'Thursday', short: 'Thu', sub: 'Donderdag (Do)' },
  { key: 'friday', label: 'Friday', short: 'Fri', sub: 'Vrijdag (Vr)' },
  { key: 'saturday', label: 'Saturday', short: 'Sat', sub: 'Zaterdag (Za)' },
  { key: 'sunday', label: 'Sunday', short: 'Sun', sub: 'Zondag (Zo)' },
];

const DEFAULT_SCHEDULE = {
  monday: { enabled: true, startTime: '08:00', endTime: '17:00' },
  tuesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
  wednesday: { enabled: true, startTime: '08:00', endTime: '17:00' },
  thursday: { enabled: true, startTime: '08:00', endTime: '17:00' },
  friday: { enabled: true, startTime: '08:00', endTime: '17:00' },
  saturday: { enabled: false, startTime: '08:00', endTime: '17:00' },
  sunday: { enabled: false, startTime: '08:00', endTime: '17:00' },
};

// Generates half-hour slots for pickers
const TIME_SLOT_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (endMins <= startMins) return 0;
  return (endMins - startMins) / 60;
}

const AvailabilityComponent = ({ selectedStaff }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('weekly'); // 'weekly' | 'sporadic'

  // Core Schedule States
  const [weeklySchedule, setWeeklySchedule] = useState(DEFAULT_SCHEDULE);
  const [isBiWeeklyEnabled, setIsBiWeeklyEnabled] = useState(false);
  const [evenWeekSchedule, setEvenWeekSchedule] = useState(DEFAULT_SCHEDULE);
  const [oddWeekSchedule, setOddWeekSchedule] = useState(DEFAULT_SCHEDULE);
  const [sporadicExceptions, setSporadicExceptions] = useState([]);
  const [notes, setNotes] = useState('');

  // Sporadic Modal State
  const [isSporadicModalOpen, setIsSporadicModalOpen] = useState(false);
  const [sporadicDate, setSporadicDate] = useState('');
  const [sporadicType, setSporadicType] = useState('available'); // 'available' | 'unavailable'
  const [sporadicStartTime, setSporadicStartTime] = useState('08:00');
  const [sporadicEndTime, setSporadicEndTime] = useState('17:00');
  const [sporadicReason, setSporadicReason] = useState('');
  const [savingSporadic, setSavingSporadic] = useState(false);

  // Fetch Availability from API
  const fetchAvailability = async () => {
    if (!selectedStaff?._id) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(
        `${apiPath}/api/availability/employee/${selectedStaff._id}`,
        { headers }
      );

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setWeeklySchedule(data.weeklySchedule || DEFAULT_SCHEDULE);
        setIsBiWeeklyEnabled(!!data.isBiWeeklyEnabled);
        setEvenWeekSchedule(data.evenWeekSchedule || DEFAULT_SCHEDULE);
        setOddWeekSchedule(data.oddWeekSchedule || DEFAULT_SCHEDULE);
        setSporadicExceptions(data.sporadicExceptions || []);
        setNotes(data.notes || '');
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load employee availability');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStaff?._id) {
      fetchAvailability();
    }
  }, [selectedStaff?._id]);

  // Save Full Availability to API
  const handleSave = async () => {
    if (!selectedStaff?._id) {
      toast.error('No employee selected');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        weeklySchedule,
        isBiWeeklyEnabled,
        evenWeekSchedule,
        oddWeekSchedule,
        sporadicExceptions,
        notes,
      };

      const response = await axios.put(
        `${apiPath}/api/availability/employee/${selectedStaff._id}`,
        payload,
        { headers }
      );

      if (response.data?.success) {
        toast.success('Availability schedule saved successfully!');
      } else {
        toast.success('Availability updated!');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error(error.response?.data?.message || 'Error saving availability');
    } finally {
      setSaving(false);
    }
  };

  // Day Schedule Handlers (Standard Weekly)
  const handleWeeklyDayToggle = (dayKey) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey]?.enabled,
      },
    }));
  };

  const handleWeeklyTimeChange = (dayKey, field, value) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
  };

  // Even/Odd Schedule Handlers
  const handleBiWeeklyTimeChange = (weekType, dayKey, field, value) => {
    if (weekType === 'even') {
      setEvenWeekSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [field]: value,
        },
      }));
    } else {
      setOddWeekSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          [field]: value,
        },
      }));
    }
  };

  const handleBiWeeklyDayToggle = (weekType, dayKey) => {
    if (weekType === 'even') {
      setEvenWeekSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          enabled: !prev[dayKey]?.enabled,
        },
      }));
    } else {
      setOddWeekSchedule((prev) => ({
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          enabled: !prev[dayKey]?.enabled,
        },
      }));
    }
  };

  // Copy schedule helpers
  const handleCopySchedule = (from, to) => {
    if (from === 'standard' && to === 'both') {
      setEvenWeekSchedule(JSON.parse(JSON.stringify(weeklySchedule)));
      setOddWeekSchedule(JSON.parse(JSON.stringify(weeklySchedule)));
      toast.success('Standard schedule copied to Even & Odd weeks!');
    } else if (from === 'even' && to === 'odd') {
      setOddWeekSchedule(JSON.parse(JSON.stringify(evenWeekSchedule)));
      toast.success('Even week schedule copied to Odd week!');
    } else if (from === 'odd' && to === 'even') {
      setEvenWeekSchedule(JSON.parse(JSON.stringify(oddWeekSchedule)));
      toast.success('Odd week schedule copied to Even week!');
    }
  };

  // Total Hours Calculations
  const totalWeeklyHours = useMemo(() => {
    let total = 0;
    DAYS_ORDER.forEach(({ key }) => {
      const day = weeklySchedule[key];
      if (day?.enabled) {
        total += calculateHours(day.startTime, day.endTime);
      }
    });
    return total;
  }, [weeklySchedule]);

  const activeDaysCount = useMemo(() => {
    return DAYS_ORDER.filter(({ key }) => weeklySchedule[key]?.enabled).length;
  }, [weeklySchedule]);

  const evenTotalHours = useMemo(() => {
    let total = 0;
    DAYS_ORDER.forEach(({ key }) => {
      const day = evenWeekSchedule[key];
      if (day?.enabled) {
        total += calculateHours(day.startTime, day.endTime);
      }
    });
    return total;
  }, [evenWeekSchedule]);

  const evenActiveDaysCount = useMemo(() => {
    return DAYS_ORDER.filter(({ key }) => evenWeekSchedule[key]?.enabled).length;
  }, [evenWeekSchedule]);

  const oddTotalHours = useMemo(() => {
    let total = 0;
    DAYS_ORDER.forEach(({ key }) => {
      const day = oddWeekSchedule[key];
      if (day?.enabled) {
        total += calculateHours(day.startTime, day.endTime);
      }
    });
    return total;
  }, [oddWeekSchedule]);

  const oddActiveDaysCount = useMemo(() => {
    return DAYS_ORDER.filter(({ key }) => oddWeekSchedule[key]?.enabled).length;
  }, [oddWeekSchedule]);

  // Sporadic Handlers
  const handleAddSporadic = async (e) => {
    e.preventDefault();
    if (!sporadicDate) {
      toast.error('Please pick a date for sporadic availability');
      return;
    }

    if (sporadicType === 'available' && sporadicStartTime >= sporadicEndTime) {
      toast.error('End time must be after start time');
      return;
    }

    setSavingSporadic(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        date: sporadicDate,
        type: sporadicType,
        startTime: sporadicStartTime,
        endTime: sporadicEndTime,
        reason: sporadicReason,
      };

      const response = await axios.post(
        `${apiPath}/api/availability/employee/${selectedStaff._id}/sporadic`,
        payload,
        { headers }
      );

      if (response.data?.success) {
        setSporadicExceptions(response.data.data?.sporadicExceptions || []);
        toast.success('Sporadic availability override added!');
        setIsSporadicModalOpen(false);
        setSporadicDate('');
        setSporadicReason('');
      }
    } catch (error) {
      console.error('Error adding sporadic availability:', error);
      toast.error(error.response?.data?.message || 'Failed to add sporadic availability');
    } finally {
      setSavingSporadic(false);
    }
  };

  const handleDeleteSporadic = async (exceptionId) => {
    if (!window.confirm('Are you sure you want to remove this sporadic override?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.delete(
        `${apiPath}/api/availability/employee/${selectedStaff._id}/sporadic/${exceptionId}`,
        { headers }
      );

      if (response.data?.success) {
        setSporadicExceptions(response.data.data?.sporadicExceptions || []);
        toast.success('Sporadic override removed');
      }
    } catch (error) {
      console.error('Error deleting sporadic availability:', error);
      toast.error('Failed to remove sporadic override');
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 dark:text-slate-100">
      {/* Top Clean Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'weekly'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FiClock className="text-sm" />
            <span>Weekly Schedule</span>
            {isBiWeeklyEnabled && (
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-500 text-white uppercase">
                Even / Odd Active
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sporadic')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSubTab === 'sporadic'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
          >
            <FiSliders className="text-sm" />
            <span>Sporadic Overrides</span>
            {sporadicExceptions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white">
                {sporadicExceptions.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 pr-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
          {!isBiWeeklyEnabled ? (
            <>
              <span>
                Active: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{activeDaysCount} Days</strong>
              </span>
              <span>•</span>
              <span>
                Weekly Total: <strong className="text-primary font-bold">{totalWeeklyHours.toFixed(1)} hrs</strong>
              </span>
            </>
          ) : (
            <>
              <span>
                Even: <strong className="text-blue-600 dark:text-blue-400 font-bold">{evenTotalHours.toFixed(1)}h</strong>
              </span>
              <span>•</span>
              <span>
                Odd: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{oddTotalHours.toFixed(1)}h</strong>
              </span>
              <span>•</span>
              <span>
                Avg: <strong className="text-primary font-bold">{((evenTotalHours + oddTotalHours) / 2).toFixed(1)} hrs/wk</strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* SUB-TAB 1: WORK SCHEDULE (STANDARD OR EVEN/ODD) */}
      {activeSubTab === 'weekly' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Top Control Header with Even/Odd Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FiClock className="text-primary text-base" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {isBiWeeklyEnabled ? 'Bi-Weekly Schedule (Even / Odd Calendar Weeks)' : 'Standard Weekly Work Schedule'}
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBiWeeklyEnabled
                  ? 'Configure alternate working hours for Even (2, 4, 6...) and Odd (1, 3, 5...) calendar weeks.'
                  : 'Configure standard working days and daily shift hours (applied every week).'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Even / Odd Enabled Toggle Button */}
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Even / Odd Weeks:
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isBiWeeklyEnabled}
                  onClick={() => {
                    const nextVal = !isBiWeeklyEnabled;
                    setIsBiWeeklyEnabled(nextVal);
                    if (nextVal) {
                      toast.success('Even / Odd weeks enabled! 2 columns are now active.', {
                        icon: '📅',
                      });
                    } else {
                      toast('Standard weekly schedule restored.', { icon: 'ℹ️' });
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isBiWeeklyEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isBiWeeklyEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
                <span className={`text-[11px] font-extrabold ${isBiWeeklyEnabled ? 'text-primary' : 'text-slate-400'}`}>
                  {isBiWeeklyEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <FiSave className={saving ? 'animate-spin text-sm' : 'text-sm'} />
                <span>{saving ? 'Saving...' : 'Save Availability'}</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: STANDARD WEEKLY SCHEDULE (WHEN EVEN/ODD IS DISABLED - 1 COLUMN FULL WIDTH) */}
          {!isBiWeeklyEnabled && (
            <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-2">
              <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                {DAYS_ORDER.map(({ key, label, short, sub }) => {
                  const day = weeklySchedule[key] || { enabled: false, startTime: '08:00', endTime: '17:00' };
                  const isEnabled = !!day.enabled;
                  const hours = isEnabled ? calculateHours(day.startTime, day.endTime) : 0;

                  return (
                    <div key={key} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 w-56">
                        <button
                          type="button"
                          onClick={() => handleWeeklyDayToggle(key)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${isEnabled
                              ? 'bg-primary text-white shadow-xs'
                              : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                        >
                          {isEnabled && <FiCheck />}
                        </button>
                        <div>
                          <span className={`text-xs font-extrabold block ${isEnabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                            {label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {sub}
                          </span>
                        </div>
                      </div>

                      {isEnabled ? (
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={day.startTime || '08:00'}
                              onChange={(e) => handleWeeklyTimeChange(key, 'startTime', e.target.value)}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                            >
                              {TIME_SLOT_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <span className="text-slate-400 text-xs font-bold">—</span>
                            <select
                              value={day.endTime || '17:00'}
                              onChange={(e) => handleWeeklyTimeChange(key, 'endTime', e.target.value)}
                              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                            >
                              {TIME_SLOT_OPTIONS.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/15 min-w-[65px] text-center">
                            {hours.toFixed(1)} hrs
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200/60 dark:border-slate-700">
                          Day Off
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW 2: BI-WEEKLY SCHEDULE (WHEN EVEN/ODD IS ENABLED - 2 COLUMNS SIDE-BY-SIDE) */}
          {isBiWeeklyEnabled && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
              {/* COLUMN 1: EVEN WEEKS */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        Even Weeks (Week 2, 4, 6...)
                      </h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Active: <strong className="text-blue-600 dark:text-blue-400">{evenActiveDaysCount} Days</strong> • Total: <strong className="text-blue-600 dark:text-blue-400">{evenTotalHours.toFixed(1)} hrs</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySchedule('even', 'odd')}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 transition-all cursor-pointer flex items-center gap-1"
                    title="Copy Even week schedule to Odd week"
                  >
                    <FiCopy className="text-xs" />
                    <span>Copy to Odd</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {DAYS_ORDER.map(({ key, label, short, sub }) => {
                    const day = evenWeekSchedule[key] || { enabled: false, startTime: '08:00', endTime: '17:00' };
                    const isEnabled = !!day.enabled;
                    const hours = isEnabled ? calculateHours(day.startTime, day.endTime) : 0;

                    return (
                      <div key={key} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-[120px] sm:min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => handleBiWeeklyDayToggle('even', key)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${isEnabled ? 'bg-blue-600 text-white shadow-xs' : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                          >
                            {isEnabled && <FiCheck />}
                          </button>
                          <div>
                            <span className={`text-xs font-bold block ${isEnabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                              {label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {sub}
                            </span>
                          </div>
                        </div>

                        {isEnabled ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={day.startTime || '08:00'}
                                onChange={(e) => handleBiWeeklyTimeChange('even', key, 'startTime', e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                              >
                                {TIME_SLOT_OPTIONS.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                              <span className="text-slate-400 text-xs font-bold">—</span>
                              <select
                                value={day.endTime || '17:00'}
                                onChange={(e) => handleBiWeeklyTimeChange('even', key, 'endTime', e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                              >
                                {TIME_SLOT_OPTIONS.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>

                            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 min-w-[55px] text-center">
                              {hours.toFixed(1)}h
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                            Day Off
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COLUMN 2: ODD WEEKS */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm"></span>
                    <div>
                      <h5 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                        Odd Weeks (Week 1, 3, 5...)
                      </h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        Active: <strong className="text-indigo-600 dark:text-indigo-400">{oddActiveDaysCount} Days</strong> • Total: <strong className="text-indigo-600 dark:text-indigo-400">{oddTotalHours.toFixed(1)} hrs</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySchedule('odd', 'even')}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-all cursor-pointer flex items-center gap-1"
                    title="Copy Odd week schedule to Even week"
                  >
                    <FiCopy className="text-xs" />
                    <span>Copy to Even</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {DAYS_ORDER.map(({ key, label, short, sub }) => {
                    const day = oddWeekSchedule[key] || { enabled: false, startTime: '08:00', endTime: '17:00' };
                    const isEnabled = !!day.enabled;
                    const hours = isEnabled ? calculateHours(day.startTime, day.endTime) : 0;

                    return (
                      <div key={key} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-[120px] sm:min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => handleBiWeeklyDayToggle('odd', key)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${isEnabled ? 'bg-indigo-600 text-white shadow-xs' : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                          >
                            {isEnabled && <FiCheck />}
                          </button>
                          <div>
                            <span className={`text-xs font-bold block ${isEnabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 line-through'}`}>
                              {label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {sub}
                            </span>
                          </div>
                        </div>

                        {isEnabled ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <select
                                value={day.startTime || '08:00'}
                                onChange={(e) => handleBiWeeklyTimeChange('odd', key, 'startTime', e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                              >
                                {TIME_SLOT_OPTIONS.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                              <span className="text-slate-400 text-xs font-bold">—</span>
                              <select
                                value={day.endTime || '17:00'}
                                onChange={(e) => handleBiWeeklyTimeChange('odd', key, 'endTime', e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                              >
                                {TIME_SLOT_OPTIONS.map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>

                            <span className="px-2 py-0.5 rounded-md text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 min-w-[55px] text-center">
                              {hours.toFixed(1)}h
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                            Day Off
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


        </div>
      )}

      {/* SUB-TAB 2: SPORADIC OVERRIDES */}
      {activeSubTab === 'sporadic' && (
        <div className="space-y-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <FiSliders className="text-primary text-base" />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Sporadic Availability & Specific Date Overrides
                </h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Add one-time exceptions for specific dates (e.g. extra weekend shift, or unavailable due to private appointment).
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSporadicDate('');
                setSporadicType('available');
                setSporadicStartTime('08:00');
                setSporadicEndTime('17:00');
                setSporadicReason('');
                setIsSporadicModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
            >
              <FiPlus className="text-sm" />
              <span>Add Sporadic Override</span>
            </button>
          </div>

          {/* Exceptions Table / List */}
          {sporadicExceptions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FiSliders className="text-3xl mx-auto mb-2 opacity-40 text-primary" />
              <h5 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 mb-1">
                No Sporadic Overrides Configured
              </h5>
              <p className="text-xs max-w-sm mx-auto mb-4">
                This colleague follows standard weekly working hours without any single-date exceptions.
              </p>
              <button
                type="button"
                onClick={() => setIsSporadicModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all cursor-pointer"
              >
                <FiPlus />
                <span>Add First Date Override</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Time Window</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800">
                  {sporadicExceptions.map((item, idx) => (
                    <tr key={item._id || idx} className="hover:bg-primary/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {item.date}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.type === 'available'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                        >
                          {item.type === 'available' ? 'Available (Custom Hours)' : 'Unavailable (Day Off)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.type === 'available' ? `${item.startTime || '08:00'} — ${item.endTime || '17:00'}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                        {item.reason || '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteSporadic(item._id || item.date)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete override"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD SPORADIC AVAILABILITY */}
      <Dialog
        open={isSporadicModalOpen}
        onClose={() => setIsSporadicModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: 0,
            overflow: 'hidden',
          },
        }}
      >
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FiPlus className="text-primary text-base font-bold" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Add Sporadic Override
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSporadicModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          <form onSubmit={handleAddSporadic} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Target Date *
              </label>
              <input
                type="date"
                required
                value={sporadicDate}
                onChange={(e) => setSporadicDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Override Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSporadicType('available')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${sporadicType === 'available'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  Custom Hours
                </button>
                <button
                  type="button"
                  onClick={() => setSporadicType('unavailable')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${sporadicType === 'unavailable'
                      ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  Mark Unavailable (Off)
                </button>
              </div>
            </div>

            {sporadicType === 'available' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Start Time
                  </label>
                  <select
                    value={sporadicStartTime}
                    onChange={(e) => setSporadicStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    {TIME_SLOT_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    End Time
                  </label>
                  <select
                    value={sporadicEndTime}
                    onChange={(e) => setSporadicEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden"
                  >
                    {TIME_SLOT_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Reason / Note (Optional)
              </label>
              <input
                type="text"
                value={sporadicReason}
                onChange={(e) => setSporadicReason(e.target.value)}
                placeholder="e.g., Doctor appointment, Emergency shift"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsSporadicModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSporadic}
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingSporadic ? 'Saving...' : 'Add Override'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default AvailabilityComponent;
