import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiUser,
  FiAward,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDate(isoString) {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

function formatTimeOnly(isoOrTimeString) {
  if (!isoOrTimeString) return '--:--';
  if (typeof isoOrTimeString === 'string' && isoOrTimeString.length === 5 && isoOrTimeString.includes(':')) {
    return isoOrTimeString;
  }
  try {
    const d = new Date(isoOrTimeString);
    if (isNaN(d.getTime())) return String(isoOrTimeString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
}

const MyHoursPage = () => {
  const { userData, id, username, role } = useContext(UserContext) || {};
  const currentUserId = userData?.userId || userData?._id || userData?.id || id;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString()); // 'all' or '0'..'11'
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [hoursData, setHoursData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logged in staff member's hours
  const fetchMyHours = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = {};
      if (useCustomRange && customStartDate && customEndDate) {
        params.startDate = customStartDate;
        params.endDate = customEndDate;
      } else {
        params.year = selectedYear;
        params.month = selectedMonth;
      }

      if (currentUserId) {
        params.employeeId = currentUserId;
      }

      const res = await axios.get(`${apiPath}/api/hours/overview`, { headers, params });

      if (res.data?.success) {
        const myRecord = res.data.data?.[0] || null;
        setHoursData(myRecord);
      }
    } catch (err) {
      console.error('Error fetching my hours:', err);
      toast.error('Failed to load your working hours');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyHours();
  }, [selectedYear, selectedMonth, useCustomRange, customStartDate, customEndDate, currentUserId]);

  // CSV Export
  const handleExportTimesheet = () => {
    if (!hoursData?.shifts || hoursData.shifts.length === 0) {
      toast.error('No shift records found to export for this period');
      return;
    }

    const headers = [
      'Date',
      'Job Number',
      'Customer',
      'Work Type',
      'Scheduled Duration (hrs)',
      'Actual Start Time',
      'Actual End Time',
      'Break (mins)',
      'Approved Hours',
      'Overtime Hours',
      'Status',
      'Notes',
    ];

    const rows = hoursData.shifts.map((s) => [
      `"${formatDate(s.date)}"`,
      `"${s.jobIndex || 'N/A'}"`,
      `"${(s.customerName || 'Client').replace(/"/g, '""')}"`,
      `"${s.workType || 'Mover'}"`,
      s.scheduledHours,
      `"${formatTimeOnly(s.actualStartTime)}"`,
      `"${formatTimeOnly(s.actualEndTime)}"`,
      s.breakMinutes || 0,
      s.approvedHours,
      s.overtimeHours || 0,
      `"${s.status}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const cleanName = (username || userData?.username || 'Staff').replace(/\s+/g, '_');
    const periodStr = useCustomRange
      ? `${customStartDate}_to_${customEndDate}`
      : selectedMonth === 'all'
      ? `Year_${selectedYear}`
      : `${MONTH_NAMES[parseInt(selectedMonth)]}_${selectedYear}`;
    link.setAttribute('download', `Timesheet_${cleanName}_${periodStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Timesheet exported successfully');
  };

  const approvalRate =
    hoursData?.totalScheduledHours > 0
      ? ((hoursData.approvedHours / hoursData.totalScheduledHours) * 100).toFixed(0)
      : '0';

  return (
    <div className="w-full space-y-6 font-sans">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center text-2xl shadow-md shadow-primary/25">
            <FiClock />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              My Working Hours Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Review your scheduled appointment shifts, breaks, approved hours, and overtime records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            {role || 'Staff'} Account
          </span>
        </div>
      </div>

      {/* 2. FILTER & CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-boxdark rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-strokedark shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Range Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setUseCustomRange(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                !useCustomRange
                  ? 'bg-white dark:bg-boxdark text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Monthly / Yearly
            </button>
            <button
              type="button"
              onClick={() => setUseCustomRange(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                useCustomRange
                  ? 'bg-white dark:bg-boxdark text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Custom Range
            </button>
          </div>

          {!useCustomRange ? (
            <>
              {/* Year Select */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              >
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Month Select */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              >
                <option value="all">Full Year (All Months)</option>
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx.toString()}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto">
          {/* Refresh */}
          <button
            type="button"
            onClick={fetchMyHours}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
            title="Refresh my hours"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>

          {/* CSV Export */}
          <button
            type="button"
            onClick={handleExportTimesheet}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white shadow-xs transition-all cursor-pointer"
          >
            <FiDownload />
            <span>Export Timesheet</span>
          </button>
        </div>
      </div>

      {/* 3. PERSONAL KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scheduled */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Scheduled
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center text-lg">
              <FiClock />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {hoursData?.totalScheduledHours || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">hrs</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{hoursData?.totalJobs || 0} Total Shifts Logged</span>
          </div>
        </div>

        {/* Approved Hours */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Approved Hours
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <FiCheckCircle />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {hoursData?.approvedHours || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">hrs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>Approval Rate</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {approvalRate}%
            </span>
          </div>
        </div>

        {/* Overtime Logged */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Overtime Logged
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <FiTrendingUp />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {hoursData?.overtimeHours || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">hrs</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>Net Work + OT</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {hoursData?.totalNetApprovedHours || 0} hrs
            </span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <FiAlertCircle />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {hoursData?.pendingHours || 0}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">hrs</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>Awaiting supervisor approval</span>
          </div>
        </div>
      </div>

      {/* 4. DETAILED APPOINTMENT SHIFTS TABLE */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              My Appointment Shift Records
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Detailed breakdown of your scheduled appointments, recorded breaks, and approved hours for completed jobs
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
            {hoursData?.shifts?.length || 0} Shifts
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <FiRefreshCw className="animate-spin text-2xl text-primary" />
            <p className="text-xs font-medium">Loading your working hours...</p>
          </div>
        ) : !hoursData?.shifts || hoursData.shifts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiAward className="text-4xl mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No completed job shifts found for this period
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You do not have any appointment work shifts recorded for completed jobs in the selected date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Job / Client</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3 text-center">Scheduled</th>
                  <th className="py-3 px-3 text-center">Break</th>
                  <th className="py-3 px-3 text-center">Approved</th>
                  <th className="py-3 px-3 text-center">Overtime</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {hoursData.shifts.map((s, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatDate(s.date)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Job #{s.jobIndex || 'N/A'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {s.customerName}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {s.workType || 'Mover'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {s.scheduledHours}h
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {formatTimeOnly(s.actualStartTime)} - {formatTimeOnly(s.actualEndTime)}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500">
                      {s.breakMinutes ? `${s.breakMinutes}m` : '--'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {s.approvedHours}h
                    </td>
                    <td className="py-3 px-3 text-center">
                      {s.overtimeHours > 0 ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold">
                          +{s.overtimeHours}h
                        </span>
                      ) : (
                        <span className="text-slate-400">--</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          s.status === 'Approved'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : s.status === 'Rejected'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[180px] truncate">
                      {s.notes || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyHoursPage;
