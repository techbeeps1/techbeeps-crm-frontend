import React, { useState, useEffect, useMemo, useContext } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiTruck,
  FiFileText,
  FiEdit2,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiDownload,
  FiLayers,
  FiDollarSign,
  FiCoffee,
} from 'react-icons/fi';
import { Dialog } from '@mui/material';
import toast from 'react-hot-toast';

// Generates half-hour slots for pickers
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2).toString().padStart(2, '0');
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour}:${minute}`;
});

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

const ApproveHoursTab = () => {
  const { userData, isAdmin, role } = useContext(UserContext) || {};
  const isManager = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const [shifts, setShifts] = useState([]);
  const [summary, setSummary] = useState({
    totalShifts: 0,
    totalLoggedHours: 0,
    pendingHours: 0,
    pendingCount: 0,
    approvedHours: 0,
    approvedCount: 0,
    rejectedHours: 0,
    rejectedCount: 0,
    overtimeHours: 0,
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [datePreset, setDatePreset] = useState('this-month'); // 'today' | 'this-week' | 'this-month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Pending' | 'Approved' | 'Rejected'
  const [searchTerm, setSearchTerm] = useState('');

  // Bulk Selection
  const [selectedShiftKeys, setSelectedShiftKeys] = useState([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Modal: Adjust Hours
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedShiftForAdjust, setSelectedShiftForAdjust] = useState(null);
  const [adjustStartTime, setAdjustStartTime] = useState('08:00');
  const [adjustEndTime, setAdjustEndTime] = useState('17:00');
  const [adjustBreakMinutes, setAdjustBreakMinutes] = useState(0);
  const [adjustOvertimeHours, setAdjustOvertimeHours] = useState(0);
  const [adjustNotes, setAdjustNotes] = useState('');
  const [savingAdjustment, setSavingAdjustment] = useState(false);

  // Modal: Reject Shift
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedShiftForReject, setSelectedShiftForReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingShift, setRejectingShift] = useState(false);

  // Calculate Date Range based on Preset
  const computedDateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === 'today') {
      const todayStr = now.toISOString().split('T')[0];
      return { start: todayStr, end: todayStr };
    }
    if (datePreset === 'this-week') {
      const current = new Date(now);
      const first = current.getDate() - current.getDay() + 1; // Monday
      const last = first + 6; // Sunday
      const firstDay = new Date(current.setDate(first));
      const lastDay = new Date(current.setDate(last));
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
      };
    }
    if (datePreset === 'this-month') {
      const y = now.getFullYear();
      const m = now.getMonth();
      const firstDay = new Date(y, m, 1);
      const lastDay = new Date(y, m + 1, 0);
      return {
        start: firstDay.toISOString().split('T')[0],
        end: lastDay.toISOString().split('T')[0],
      };
    }
    return { start: customStartDate, end: customEndDate };
  }, [datePreset, customStartDate, customEndDate]);

  // Fetch Employees List for filter dropdown
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${apiPath}/user/all`, { headers });
      const list = Array.isArray(res.data) ? res.data : res.data?.users || res.data?.data || [];
      setEmployeesList(list);
    } catch (err) {
      console.error('Error fetching employees list:', err);
    }
  };

  // Fetch Shifts for Approval
  const fetchShifts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = {
        startDate: computedDateRange.start || undefined,
        endDate: computedDateRange.end || undefined,
        employeeId: selectedEmployee !== 'all' ? selectedEmployee : undefined,
        status: statusFilter,
        search: searchTerm.trim() || undefined,
      };

      const res = await axios.get(`${apiPath}/api/hours/shifts`, { headers, params });

      if (res.data?.success) {
        setShifts(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching shifts for approval:', err);
      toast.error('Failed to load shifts for approval');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [datePreset, customStartDate, customEndDate, selectedEmployee, statusFilter, searchTerm]);

  // Quick Approve Single Shift
  const handleQuickApprove = async (shift) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        shifts: [
          {
            appointmentId: shift.appointmentId,
            employabilityId: shift.employabilityId,
            jobId: shift.jobId,
            employeeId: shift.employeeId,
            employeeName: shift.employeeName,
            workType: shift.workType,
            date: shift.date,
            scheduledStartTime: shift.scheduledStartTime,
            scheduledEndTime: shift.scheduledEndTime,
            scheduledHours: shift.scheduledHours,
            actualStartTime: shift.actualStartTime,
            actualEndTime: shift.actualEndTime,
            breakMinutes: shift.breakMinutes,
            approvedHours: shift.approvedHours,
            overtimeHours: shift.overtimeHours,
            notes: shift.notes,
          },
        ],
      };

      const res = await axios.post(`${apiPath}/api/hours/approve`, payload, { headers });
      if (res.data?.success) {
        toast.success(`Hours approved for ${shift.employeeName}!`);
        fetchShifts();
      }
    } catch (err) {
      console.error('Error approving shift:', err);
      toast.error('Failed to approve shift');
    }
  };

  // Bulk Approve Selected Shifts
  const handleBulkApprove = async () => {
    if (selectedShiftKeys.length === 0) {
      toast.error('Please select at least one shift to approve');
      return;
    }

    const selectedShiftsData = shifts.filter((s) =>
      selectedShiftKeys.includes(`${s.appointmentId}_${s.employabilityId}`)
    );

    setBulkProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        shifts: selectedShiftsData.map((shift) => ({
          appointmentId: shift.appointmentId,
          employabilityId: shift.employabilityId,
          jobId: shift.jobId,
          employeeId: shift.employeeId,
          employeeName: shift.employeeName,
          workType: shift.workType,
          date: shift.date,
          scheduledStartTime: shift.scheduledStartTime,
          scheduledEndTime: shift.scheduledEndTime,
          scheduledHours: shift.scheduledHours,
          actualStartTime: shift.actualStartTime,
          actualEndTime: shift.actualEndTime,
          breakMinutes: shift.breakMinutes,
          approvedHours: shift.approvedHours,
          overtimeHours: shift.overtimeHours,
          notes: shift.notes,
        })),
      };

      const res = await axios.post(`${apiPath}/api/hours/approve`, payload, { headers });
      if (res.data?.success) {
        toast.success(`Successfully approved ${selectedShiftsData.length} shifts!`);
        setSelectedShiftKeys([]);
        fetchShifts();
      }
    } catch (err) {
      console.error('Error bulk approving shifts:', err);
      toast.error('Bulk approval failed');
    } finally {
      setBulkProcessing(false);
    }
  };

  // Open Adjust Hours Modal
  const openAdjustModal = (shift) => {
    setSelectedShiftForAdjust(shift);
    setAdjustStartTime(formatTimeOnly(shift.actualStartTime || shift.scheduledStartTime));
    setAdjustEndTime(formatTimeOnly(shift.actualEndTime || shift.scheduledEndTime));
    setAdjustBreakMinutes(shift.breakMinutes || 0);
    setAdjustOvertimeHours(shift.overtimeHours || 0);
    setAdjustNotes(shift.notes || '');
    setAdjustModalOpen(true);
  };

  // Save Adjusted Hours
  const handleSaveAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedShiftForAdjust) return;

    setSavingAdjustment(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const baseDate = new Date(selectedShiftForAdjust.date || new Date());
      const [sh, sm] = adjustStartTime.split(':').map(Number);
      const [eh, em] = adjustEndTime.split(':').map(Number);

      const actualStart = new Date(baseDate);
      actualStart.setHours(sh, sm, 0, 0);

      const actualEnd = new Date(baseDate);
      actualEnd.setHours(eh, em, 0, 0);

      const rawDuration = Math.max(0, (actualEnd - actualStart) / (1000 * 60 * 60));
      const calculatedApproved = Math.max(0, Number((rawDuration - (Number(adjustBreakMinutes) || 0) / 60).toFixed(2)));

      const payload = {
        appointmentId: selectedShiftForAdjust.appointmentId,
        employabilityId: selectedShiftForAdjust.employabilityId,
        jobId: selectedShiftForAdjust.jobId,
        employeeId: selectedShiftForAdjust.employeeId,
        employeeName: selectedShiftForAdjust.employeeName,
        workType: selectedShiftForAdjust.workType,
        date: selectedShiftForAdjust.date,
        actualStartTime: actualStart,
        actualEndTime: actualEnd,
        breakMinutes: Number(adjustBreakMinutes) || 0,
        approvedHours: calculatedApproved,
        overtimeHours: Number(adjustOvertimeHours) || 0,
        notes: adjustNotes.trim(),
        status: 'Approved',
      };

      const res = await axios.put(`${apiPath}/api/hours/adjust`, payload, { headers });
      if (res.data?.success) {
        toast.success('Shift hours adjusted and approved!');
        setAdjustModalOpen(false);
        fetchShifts();
      }
    } catch (err) {
      console.error('Error saving adjustment:', err);
      toast.error('Failed to adjust shift hours');
    } finally {
      setSavingAdjustment(false);
    }
  };

  // Open Reject Modal
  const openRejectModal = (shift) => {
    setSelectedShiftForReject(shift);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  // Confirm Rejection
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedShiftForReject) return;

    setRejectingShift(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        appointmentId: selectedShiftForReject.appointmentId,
        employabilityId: selectedShiftForReject.employabilityId,
        employeeId: selectedShiftForReject.employeeId,
        rejectionReason: rejectionReason.trim() || 'Rejected by supervisor',
      };

      const res = await axios.post(`${apiPath}/api/hours/reject`, payload, { headers });
      if (res.data?.success) {
        toast.success('Shift marked as rejected');
        setRejectModalOpen(false);
        fetchShifts();
      }
    } catch (err) {
      console.error('Error rejecting shift:', err);
      toast.error('Failed to reject shift');
    } finally {
      setRejectingShift(false);
    }
  };

  // Multi-select toggle
  const toggleSelectAll = () => {
    const pendingShifts = shifts.filter((s) => s.status !== 'Approved');
    if (selectedShiftKeys.length === pendingShifts.length) {
      setSelectedShiftKeys([]);
    } else {
      setSelectedShiftKeys(pendingShifts.map((s) => `${s.appointmentId}_${s.employabilityId}`));
    }
  };

  const toggleSelectShift = (key) => {
    if (selectedShiftKeys.includes(key)) {
      setSelectedShiftKeys(selectedShiftKeys.filter((k) => k !== key));
    } else {
      setSelectedShiftKeys([...selectedShiftKeys, key]);
    }
  };

  const pendingShiftsList = useMemo(() => shifts.filter((s) => s.status !== 'Approved'), [shifts]);

  return (
    <div className="space-y-5 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. TOP KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Logged Hours */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center text-xl shrink-0">
            <FiClock />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Logged Hours
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {summary.totalLoggedHours.toFixed(1)}
              </h3>
              <span className="text-xs font-semibold text-slate-500">hrs</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {summary.totalShifts} Total Shift Appointments
            </span>
          </div>
        </div>

        {/* Metric 2: Pending Approval */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-amber-200/80 dark:border-amber-900/50 bg-gradient-to-br from-white to-amber-50/40 dark:from-boxdark dark:to-amber-950/20 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-xs">
            <FiAlertCircle />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                {summary.pendingHours.toFixed(1)}
              </h3>
              <span className="text-xs font-semibold text-amber-700/80 dark:text-amber-400/80">hrs</span>
            </div>
            <span className="text-[10px] text-amber-600/90 dark:text-amber-400/90 font-bold">
              {summary.pendingCount} Shifts Needing Review
            </span>
          </div>
        </div>

        {/* Metric 3: Approved Hours */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <FiCheckCircle />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Approved Hours
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {summary.approvedHours.toFixed(1)}
              </h3>
              <span className="text-xs font-semibold text-slate-500">hrs</span>
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              {summary.approvedCount} Shifts Approved
            </span>
          </div>
        </div>

        {/* Metric 4: Overtime Hours */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
            <FiLayers />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Overtime Hours
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <h3 className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                {summary.overtimeHours.toFixed(1)}
              </h3>
              <span className="text-xs font-semibold text-slate-500">hrs</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Overtime tracked
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & ACTION BAR */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this-week', label: 'This Week' },
              { id: 'this-month', label: 'This Month' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePreset(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  datePreset === p.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}

            {datePreset === 'custom' && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
                <span className="text-slate-400 text-xs font-bold">—</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden"
                />
              </div>
            )}
          </div>

          {/* Status Pills & Bulk Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {['All', 'Pending', 'Approved', 'Rejected'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {selectedShiftKeys.length > 0 && (
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={bulkProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <FiCheckCircle />
                <span>Approve Selected ({selectedShiftKeys.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Employee Dropdown & Search Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by staff name, job number (e.g. 2026/0001), or client..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FiUser className="text-slate-400 text-sm hidden sm:block" />
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full sm:w-56 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer"
            >
              <option value="all">All Colleagues</option>
              {employeesList.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.username || emp.email} ({emp.role || 'Staff'})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchShifts}
              className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Refresh Shifts"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SHIFTS APPROVAL TABLE */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FiClock className="text-primary text-base" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Appointment Work Shifts ({shifts.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Hours for completed jobs only
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-primary" />
            <p>Loading appointment shifts...</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiClock className="text-3xl mx-auto mb-2 opacity-40 text-primary" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">
              No Completed Job Shifts Found
            </h4>
            <p className="text-xs max-w-sm mx-auto">
              Shifts only appear here once their respective job status is marked as <strong>Completed</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        pendingShiftsList.length > 0 &&
                        selectedShiftKeys.length === pendingShiftsList.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Colleague</th>
                  <th className="py-3 px-4">Date & Role</th>
                  <th className="py-3 px-4">Job / Customer</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4 text-center">Break</th>
                  <th className="py-3 px-4 text-center">Approved Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {shifts.map((shift) => {
                  const shiftKey = `${shift.appointmentId}_${shift.employabilityId}`;
                  const isSelected = selectedShiftKeys.includes(shiftKey);

                  return (
                    <tr
                      key={shiftKey}
                      className={`hover:bg-primary/5 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        {shift.status !== 'Approved' ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectShift(shiftKey)}
                            className="rounded text-primary focus:ring-0 cursor-pointer"
                          />
                        ) : (
                          <span className="text-emerald-500 font-bold">✓</span>
                        )}
                      </td>

                      {/* Colleague */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                            {shift.employeeName?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {shift.employeeName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                              {shift.employeeRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date & Work Type */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {formatDate(shift.date)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {shift.workType}
                          </span>
                          {shift.vehicle && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <FiTruck />
                              {shift.vehicle.name || shift.vehicle.licensePlate}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Job / Customer */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-primary text-[11px] bg-primary/10 px-1.5 py-0.5 rounded-md">
                            {shift.jobIndex}
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {shift.customerName}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                          {shift.workLocation}
                        </span>
                      </td>

                      {/* Time Window */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {formatTimeOnly(shift.actualStartTime || shift.scheduledStartTime)} —{' '}
                          {formatTimeOnly(shift.actualEndTime || shift.scheduledEndTime)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Sched: {shift.scheduledHours?.toFixed(1)} hrs
                        </span>
                      </td>

                      {/* Break */}
                      <td className="py-3.5 px-4 text-center">
                        {shift.breakMinutes > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <FiCoffee className="text-[10px]" />
                            {shift.breakMinutes}m
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">—</span>
                        )}
                      </td>

                      {/* Approved Hours */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-extrabold text-xs ${
                            shift.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          }`}
                        >
                          {shift.approvedHours?.toFixed(1)} hrs
                        </span>
                        {shift.overtimeHours > 0 && (
                          <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                            +{shift.overtimeHours}h OT
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            shift.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : shift.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {shift.status === 'Approved' && <FiCheckCircle className="text-xs" />}
                          {shift.status === 'Rejected' && <FiXCircle className="text-xs" />}
                          {shift.status === 'Pending' && <FiClock className="text-xs" />}
                          <span>{shift.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick Approve button */}
                          {shift.status !== 'Approved' && (
                            <button
                              type="button"
                              onClick={() => handleQuickApprove(shift)}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                              title="Approve Shift"
                            >
                              <FiCheck className="text-base font-bold" />
                            </button>
                          )}

                          {/* Adjust / Edit button */}
                          <button
                            type="button"
                            onClick={() => openAdjustModal(shift)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Adjust Shift Hours"
                          >
                            <FiEdit2 className="text-sm" />
                          </button>

                          {/* Reject button */}
                          {shift.status !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => openRejectModal(shift)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Reject Shift"
                            >
                              <FiX className="text-base" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ADJUST SHIFT HOURS */}
      <Dialog
        open={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', padding: 0, overflow: 'hidden' },
        }}
      >
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FiEdit2 className="text-primary text-base font-bold" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Adjust Shift Hours
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setAdjustModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {selectedShiftForAdjust && (
            <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs">
              {/* Info Snippet */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Staff:</span>
                  <span className="text-slate-900 dark:text-white font-bold">
                    {selectedShiftForAdjust.employeeName}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-400">Date & Job:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {formatDate(selectedShiftForAdjust.date)} • {selectedShiftForAdjust.jobIndex}
                  </span>
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Start Time
                  </label>
                  <select
                    value={adjustStartTime}
                    onChange={(e) => setAdjustStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Actual End Time
                  </label>
                  <select
                    value={adjustEndTime}
                    onChange={(e) => setAdjustEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Break & Overtime */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Break Duration (mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={adjustBreakMinutes}
                    onChange={(e) => setAdjustBreakMinutes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Overtime Hours
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={adjustOvertimeHours}
                    onChange={(e) => setAdjustOvertimeHours(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Manager Notes / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g., Traveled extra distance, 30m break deducted"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjustment}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiCheck />
                  <span>{savingAdjustment ? 'Saving...' : 'Save & Approve'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Dialog>

      {/* MODAL 2: REJECT SHIFT */}
      <Dialog
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', padding: 0, overflow: 'hidden' },
        }}
      >
        <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-rose-600">
              <FiXCircle className="text-base font-bold" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Reject Shift Hours
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {selectedShiftForReject && (
            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                Are you sure you want to reject the logged hours for{' '}
                <strong className="text-slate-800 dark:text-slate-200 font-bold">
                  {selectedShiftForReject.employeeName}
                </strong>{' '}
                on {formatDate(selectedShiftForReject.date)}?
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  required
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g., Staff was on leave, hours already adjusted in separate appointment"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-rose-500"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectingShift}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <FiXCircle />
                  <span>{rejectingShift ? 'Rejecting...' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default ApproveHoursTab;
