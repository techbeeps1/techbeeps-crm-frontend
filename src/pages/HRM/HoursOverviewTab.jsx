import React, { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import {
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiTrendingUp,
  FiUsers,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiChevronRight,
  FiFileText,
  FiX,
  FiRefreshCw,
  FiCoffee,
  FiAward,
  FiUser,
} from 'react-icons/fi';
import { Dialog } from '@mui/material';
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

const HoursOverviewTab = () => {
  const { userData, isAdmin, role, id } = useContext(UserContext) || {};
  const isManager = isAdmin || role === 'Admin';
  const currentUserId = userData?.userId || userData?._id || userData?.id || id;

  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({
    activeStaffCount: 0,
    totalJobsCount: 0,
    totalWorkHours: 0,
    totalApprovedHours: 0,
    totalPendingHours: 0,
    totalOvertimeHours: 0,
    avgHoursPerStaff: 0,
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Period / Filter states
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString()); // 'all' or '0'..'11'
  const [useCustomRange, setUseCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(isManager ? 'all' : (currentUserId || 'all'));
  const [searchTerm, setSearchTerm] = useState('');

  // Timesheet Modal for specific employee (manager view)
  const [selectedEmployeeForTimesheet, setSelectedEmployeeForTimesheet] = useState(null);
  const [timesheetModalOpen, setTimesheetModalOpen] = useState(false);

  // Fetch employees for dropdown (manager only)
  const fetchEmployeesList = async () => {
    if (!isManager) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${apiPath}/user/all`, { headers });
      const list = Array.isArray(res.data) ? res.data : res.data?.users || res.data?.data || [];
      setEmployeesList(list);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch overview data
  const fetchOverview = async () => {
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

      // If not manager, enforce their own employeeId
      if (!isManager && currentUserId) {
        params.employeeId = currentUserId;
      } else if (selectedEmployee !== 'all') {
        params.employeeId = selectedEmployee;
      }

      const res = await axios.get(`${apiPath}/api/hours/overview`, { headers, params });

      if (res.data?.success) {
        setData(res.data.data || []);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err) {
      console.error('Error fetching hours overview:', err);
      toast.error('Failed to load hours overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, [isManager]);

  useEffect(() => {
    fetchOverview();
  }, [selectedYear, selectedMonth, useCustomRange, customStartDate, customEndDate, selectedEmployee, isManager, currentUserId]);

  // Client-side search filtering for manager view
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(
      (e) =>
        e.employeeName?.toLowerCase().includes(q) ||
        e.employeeEmail?.toLowerCase().includes(q) ||
        e.employeeRole?.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  // For individual staff member:
  const staffRecord = useMemo(() => {
    if (!isManager && data.length > 0) {
      return data[0];
    }
    return null;
  }, [isManager, data]);

  // CSV Export for Overview Summary
  const handleExportSummaryCSV = () => {
    if (!data.length) {
      toast.error('No data available to export');
      return;
    }

    const headers = [
      'Staff Name',
      'Role',
      'Email',
      'Total Jobs',
      'Scheduled Hours',
      'Approved Hours',
      'Overtime Hours',
      'Pending Hours',
      'Rejected Hours',
      'Net Approved Hours',
      'Approval Rate (%)',
    ];

    const rows = filteredEmployees.map((emp) => {
      const approvalRate =
        emp.totalScheduledHours > 0
          ? ((emp.approvedHours / emp.totalScheduledHours) * 100).toFixed(1)
          : '0.0';

      return [
        `"${emp.employeeName}"`,
        `"${emp.employeeRole}"`,
        `"${emp.employeeEmail || ''}"`,
        emp.totalJobs,
        emp.totalScheduledHours,
        emp.approvedHours,
        emp.overtimeHours,
        emp.pendingHours,
        emp.rejectedHours,
        emp.totalNetApprovedHours,
        `${approvalRate}%`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const periodName = useCustomRange
      ? `${customStartDate}_to_${customEndDate}`
      : selectedMonth === 'all'
      ? `Year_${selectedYear}`
      : `${MONTH_NAMES[parseInt(selectedMonth)]}_${selectedYear}`;
    link.setAttribute('download', `HRM_Hours_Overview_${periodName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Summary CSV exported successfully');
  };

  // CSV Export for Individual Employee Timesheet
  const handleExportIndividualTimesheet = (emp) => {
    const target = emp || staffRecord;
    if (!target || !target.shifts || target.shifts.length === 0) {
      toast.error('No shift details to export');
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

    const rows = target.shifts.map((s) => [
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
    const cleanName = (target.employeeName || 'My_Timesheet').replace(/\s+/g, '_');
    link.setAttribute('download', `Timesheet_${cleanName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Timesheet exported successfully`);
  };

  const openEmployeeTimesheet = (emp) => {
    setSelectedEmployeeForTimesheet(emp);
    setTimesheetModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* FILTER & CONTROLS TOOLBAR */}
      <div className="bg-white dark:bg-boxdark rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-strokedark shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Period Selectors */}
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

            {/* Employee Filter (Manager Only) */}
            {isManager && (
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              >
                <option value="all">All Staff Members</option>
                {employeesList.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.username || emp.name} ({emp.role || 'Staff'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {/* Refresh */}
            <button
              type="button"
              onClick={fetchOverview}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
              title="Refresh Overview"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>

            {/* CSV Export */}
            <button
              type="button"
              onClick={isManager ? handleExportSummaryCSV : () => handleExportIndividualTimesheet(staffRecord)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white shadow-xs transition-all cursor-pointer"
            >
              <FiDownload />
              <span>{isManager ? 'Export Summary CSV' : 'Export Timesheet'}</span>
            </button>
          </div>
        </div>

        {/* Search input bar (Manager view only) */}
        {isManager && (
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Filter staff by name, role, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* MANAGER OVERVIEW TABLE */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Staff Working Hours Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Cumulative scheduled, approved, overtime, and pending hours for completed jobs
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
              {filteredEmployees.length} Staff Listed
            </span>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <FiRefreshCw className="animate-spin text-2xl text-primary" />
              <p className="text-xs font-medium">Calculating timesheet statistics...</p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FiAward className="text-4xl mx-auto mb-2 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No staff work hours found
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                There are no appointment shifts for completed jobs in the selected date range or employee filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3 text-center">Shifts</th>
                    <th className="py-3 px-3 text-right">Scheduled</th>
                    <th className="py-3 px-3 text-right">Approved</th>
                    <th className="py-3 px-3 text-right">Overtime</th>
                    <th className="py-3 px-3 text-right">Pending</th>
                    <th className="py-3 px-3 text-right">Net Approved</th>
                    <th className="py-3 px-4 text-center min-w-[140px]">Approval Rate</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredEmployees.map((emp) => {
                    const rate =
                      emp.totalScheduledHours > 0
                        ? Math.min(100, (emp.approvedHours / emp.totalScheduledHours) * 100)
                        : 0;

                    return (
                      <tr
                        key={emp.employeeId}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Staff Member Info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {emp.employeePhoto ? (
                              <img
                                src={emp.employeePhoto}
                                alt={emp.employeeName}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                                {(emp.employeeName || 'S').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                                {emp.employeeName}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {emp.employeeRole}
                                </span>
                                {emp.employeeEmail && (
                                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                    {emp.employeeEmail}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Total Shifts */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-xs">
                            {emp.totalJobs}
                          </span>
                        </td>

                        {/* Scheduled */}
                        <td className="py-3.5 px-3 text-right font-semibold text-slate-600 dark:text-slate-300">
                          {emp.totalScheduledHours}h
                        </td>

                        {/* Approved */}
                        <td className="py-3.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {emp.approvedHours}h
                        </td>

                        {/* Overtime */}
                        <td className="py-3.5 px-3 text-right">
                          {emp.overtimeHours > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[11px]">
                              +{emp.overtimeHours}h
                            </span>
                          ) : (
                            <span className="text-slate-400">0h</span>
                          )}
                        </td>

                        {/* Pending */}
                        <td className="py-3.5 px-3 text-right">
                          {emp.pendingHours > 0 ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[11px]">
                              {emp.pendingHours}h
                            </span>
                          ) : (
                            <span className="text-slate-400">0h</span>
                          )}
                        </td>

                        {/* Net Approved */}
                        <td className="py-3.5 px-3 text-right font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                          {emp.totalNetApprovedHours}h
                        </td>

                        {/* Progress Bar Rate */}
                        <td className="py-3.5 px-4">
                          <div className="w-full max-w-[130px] mx-auto space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span
                                className={
                                  rate >= 100
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : rate >= 50
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-amber-600 dark:text-amber-400'
                                }
                              >
                                {rate.toFixed(0)}%
                              </span>
                              <span className="text-slate-400 text-[9px]">approved</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  rate >= 100
                                    ? 'bg-emerald-500'
                                    : rate >= 50
                                    ? 'bg-primary'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${rate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => openEmployeeTimesheet(emp)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer group/btn"
                          >
                            <span>Timesheet</span>
                            <FiChevronRight className="group-hover/btn:translate-x-0.5 transition-transform" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {/* DETAILED TIMESHEET DIALOG MODAL (FOR MANAGERS) */}
      <Dialog
        open={timesheetModalOpen}
        onClose={() => setTimesheetModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '20px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              {selectedEmployeeForTimesheet?.employeePhoto ? (
                <img
                  src={selectedEmployeeForTimesheet.employeePhoto}
                  alt={selectedEmployeeForTimesheet.employeeName}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                  {(selectedEmployeeForTimesheet?.employeeName || 'S').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedEmployeeForTimesheet?.employeeName}'s Timesheet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedEmployeeForTimesheet?.employeeRole} &bull; {selectedEmployeeForTimesheet?.employeeEmail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleExportIndividualTimesheet(selectedEmployeeForTimesheet)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                <FiDownload />
                <span>Export Shifts</span>
              </button>
              <button
                type="button"
                onClick={() => setTimesheetModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all cursor-pointer"
              >
                <FiX />
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Total Shifts</span>
              <div className="text-base font-bold text-slate-800 dark:text-white">
                {selectedEmployeeForTimesheet?.totalJobs || 0}
              </div>
            </div>
            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Scheduled Hours</span>
              <div className="text-base font-bold text-slate-800 dark:text-white">
                {selectedEmployeeForTimesheet?.totalScheduledHours || 0}h
              </div>
            </div>
            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Approved Hours</span>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {selectedEmployeeForTimesheet?.approvedHours || 0}h
              </div>
            </div>
            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Net with Overtime</span>
              <div className="text-base font-bold text-purple-600 dark:text-purple-400">
                {selectedEmployeeForTimesheet?.totalNetApprovedHours || 0}h
              </div>
            </div>
          </div>

          {/* Shifts Table */}
          <div className="overflow-y-auto flex-1 p-4">
            {(!selectedEmployeeForTimesheet?.shifts ||
              selectedEmployeeForTimesheet.shifts.length === 0) ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No shift records recorded for this staff member in this period.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Job / Client</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3 text-center">Scheduled</th>
                    <th className="py-2.5 px-3 text-center">Break</th>
                    <th className="py-2.5 px-3 text-center">Approved</th>
                    <th className="py-2.5 px-3 text-center">Overtime</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {selectedEmployeeForTimesheet.shifts.map((s, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                        {formatDate(s.date)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          Job #{s.jobIndex || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
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
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
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
                      <td className="py-3 px-3 text-slate-500 text-[11px] max-w-[160px] truncate">
                        {s.notes || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50/50 dark:bg-slate-800/40">
            <button
              type="button"
              onClick={() => setTimesheetModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default HoursOverviewTab;
