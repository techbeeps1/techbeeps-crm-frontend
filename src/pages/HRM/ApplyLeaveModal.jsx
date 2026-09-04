import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import {
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import toast from 'react-hot-toast';

const LEAVE_TYPES = [
  { id: 'Annual / Vacation', label: 'Annual Leave', icon: <BeachAccessIcon style={{ fontSize: 15 }} className="text-blue-500" /> },
  { id: 'Sick Leave', label: 'Sick Leave', icon: <LocalHospitalIcon style={{ fontSize: 15 }} className="text-emerald-500" /> },
  { id: 'Casual Leave', label: 'Casual Leave', icon: <FlashOnIcon style={{ fontSize: 15 }} className="text-amber-500" /> },
  { id: 'Emergency / Personal', label: 'Emergency', icon: <WarningAmberIcon style={{ fontSize: 15 }} className="text-rose-500" /> },
  { id: 'Unpaid Leave', label: 'Unpaid', icon: <MoneyOffIcon style={{ fontSize: 15 }} className="text-slate-400" /> },
  { id: 'Maternity / Paternity', label: 'Parental', icon: <ChildFriendlyIcon style={{ fontSize: 15 }} className="text-purple-500" /> },
];

const DURATION_TYPES = [
  { id: 'Full Day', label: 'Full Day (1d)' },
  { id: 'Half Day - First Half', label: 'First Half (0.5d)' },
  { id: 'Half Day - Second Half', label: 'Second Half (0.5d)' },
  { id: 'Multiple Days', label: 'Multiple Days' },
];

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const ApplyLeaveModal = ({ open, onClose, onSuccess, employeesList = [] }) => {
  const { userData, username, id, isAdmin, role } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const todayStr = getTodayStr();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(id || '');
  const [leaveType, setLeaveType] = useState('Annual / Vacation');
  const [durationType, setDurationType] = useState('Full Day');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [existingRequests, setExistingRequests] = useState([]);

  // Load balance and existing requests for current or selected employee
  useEffect(() => {
    const empId = selectedEmployeeId || id;
    if (!empId) return;

    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. Fetch balance
    axios
      .get(`${apiPath}/api/leave/balances?year=${new Date().getFullYear()}`, { headers })
      .then((res) => {
        const list = res.data?.data || [];
        const found = list.find((b) => String(b.employeeId?._id || b.employeeId) === String(empId));
        if (found) setUserBalance(found);
      })
      .catch((err) => console.error('Error fetching balance preview:', err));

    // 2. Fetch existing requests to check for overlapping / duplicate dates
    axios
      .get(`${apiPath}/api/leave/requests?employeeId=${empId}`, { headers })
      .then((res) => {
        setExistingRequests(res.data?.data || []);
      })
      .catch((err) => console.error('Error fetching existing requests:', err));
  }, [selectedEmployeeId, id]);

  // Calculate total days (inclusive calendar days)
  const calculateDays = () => {
    if (durationType === 'Half Day - First Half' || durationType === 'Half Day - Second Half') {
      return 0.5;
    }
    if (durationType === 'Full Day') {
      return 1.0;
    }
    if (!startDate || !endDate) return 1.0;

    const [sY, sM, sD] = startDate.split('-').map(Number);
    const [eY, eM, eD] = endDate.split('-').map(Number);
    if (!sY || !eY) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      return Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }

    const startUTC = Date.UTC(sY, sM - 1, sD);
    const endUTC = Date.UTC(eY, eM - 1, eD);

    if (endUTC < startUTC) return 1.0;

    const diffDays = Math.round((endUTC - startUTC) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  };

  const calculatedTotalDays = calculateDays();

  // Check for duplicate / overlapping leave applications
  const hasDateConflict = useMemo(() => {
    if (!startDate) return null;
    const targetEndDate = durationType === 'Multiple Days' ? (endDate || startDate) : startDate;

    const sTime = new Date(startDate).setHours(0, 0, 0, 0);
    const eTime = new Date(targetEndDate).setHours(23, 59, 59, 999);

    const conflict = existingRequests.find((r) => {
      if (['Rejected', 'Cancelled'].includes(r.status)) return false;
      const rStart = new Date(r.startDate).setHours(0, 0, 0, 0);
      const rEnd = new Date(r.endDate || r.startDate).setHours(23, 59, 59, 999);
      return sTime <= rEnd && eTime >= rStart;
    });

    return conflict || null;
  }, [startDate, endDate, durationType, existingRequests]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Please enter a reason for your leave.');
      return;
    }

    // 1. Past date check
    if (startDate < todayStr) {
      toast.error('Cannot apply leave for past dates. Please choose today or a future date.');
      return;
    }

    // 2. Duplicate / overlap check
    if (hasDateConflict) {
      const cStart = new Date(hasDateConflict.startDate).toLocaleDateString('en-GB');
      const cEnd = new Date(hasDateConflict.endDate).toLocaleDateString('en-GB');
      toast.error(
        `Leave already exists on ${cStart}${cEnd !== cStart ? ` to ${cEnd}` : ''} (${hasDateConflict.status}). Cannot apply twice for the same date.`
      );
      return;
    }

    if (durationType === 'Multiple Days' && new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be earlier than start date.');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        leaveType,
        durationType,
        startDate,
        endDate: durationType === 'Multiple Days' ? endDate : startDate,
        totalDays: calculatedTotalDays,
        reason: reason.trim(),
      };

      if (isUserAdmin && selectedEmployeeId) {
        payload.requestedEmployeeId = selectedEmployeeId;
      }

      await axios.post(`${apiPath}/api/leave/requests`, payload, { headers });

      toast.success('Leave application submitted!');
      setReason('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error submitting leave:', err);
      toast.error(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const remainingDays = userBalance
    ? Math.max(0, (userBalance.annualEntitlement || 12) - (userBalance.usedDays || 0))
    : 12;
  const usedDays = userBalance?.usedDays || 0;
  const totalEnt = userBalance?.annualEntitlement || 12;

  // Automatic Paid vs Non-Paid Split
  let autoPaidDays = 0;
  let autoUnpaidDays = 0;
  if (leaveType === 'Unpaid Leave') {
    autoUnpaidDays = calculatedTotalDays;
  } else {
    if (remainingDays >= calculatedTotalDays) {
      autoPaidDays = calculatedTotalDays;
      autoUnpaidDays = 0;
    } else if (remainingDays > 0) {
      autoPaidDays = remainingDays;
      autoUnpaidDays = calculatedTotalDays - remainingDays;
    } else {
      autoPaidDays = 0;
      autoUnpaidDays = calculatedTotalDays;
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '20px',
          overflow: 'hidden',
        },
      }}
    >
      {/* Lightweight Header */}
      <div className="relative bg-gradient-to-r from-primary to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
            <CalendarMonthIcon style={{ fontSize: 18 }} />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">Apply for Leave</h2>
            <p className="text-[11px] text-indigo-200">
              Balance: <strong className="text-white">{remainingDays} Days Left</strong> (Used: {usedDays}/{totalEnt})
            </p>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          size="small"
          style={{
            color: 'white',
            backgroundColor: 'rgba(255,255,255,0.15)',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
        {/* Admin only: Select employee */}
        {isUserAdmin && employeesList.length > 0 && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <label className="text-[11px] font-bold text-slate-500 uppercase flex-shrink-0">
              Employee:
            </label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="w-full bg-transparent font-semibold text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {employeesList.map((emp) => (
                <option key={emp._id} value={emp._id} className="dark:bg-boxdark">
                  {emp.username} ({emp.role}) — {emp.email}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 1. Leave Type Pills */}
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
            Leave Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {LEAVE_TYPES.map((lt) => {
              const isSelected = leaveType === lt.id;
              return (
                <button
                  type="button"
                  key={lt.id}
                  onClick={() => setLeaveType(lt.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-semibold transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex-shrink-0">{lt.icon}</span>
                  <span className="truncate">{lt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Duration Segmented Bar */}
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1.5">
            Duration
          </label>
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700">
            {DURATION_TYPES.map((d) => {
              const isSelected = durationType === d.id;
              return (
                <button
                  type="button"
                  key={d.id}
                  onClick={() => setDurationType(d.id)}
                  className={`py-1.5 px-2 rounded-lg text-xs text-center font-bold transition cursor-pointer truncate ${
                    isSelected
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Dates & Total Days Pill */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-end gap-3">
            {durationType === 'Multiple Days' ? (
              <>
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStartDate(val);
                      if (endDate < val) setEndDate(val);
                    }}
                    min={todayStr}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || todayStr}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
              </>
            ) : (
              <div className="flex-1">
                <label className="text-[11px] font-bold text-slate-500 block mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={todayStr}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Days Badge */}
            <div className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-xs flex-shrink-0 whitespace-nowrap h-[38px] flex items-center justify-center">
              {calculatedTotalDays} {calculatedTotalDays === 1 ? 'Day' : 'Days'}
            </div>
          </div>

          {/* Conflict Warning if overlapping leave exists */}
          {hasDateConflict && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1.5">
              <span>⚠️</span>
              <span>
                Leave already exists on {new Date(hasDateConflict.startDate).toLocaleDateString('en-GB')}
                {hasDateConflict.endDate && hasDateConflict.endDate !== hasDateConflict.startDate
                  ? ` — ${new Date(hasDateConflict.endDate).toLocaleDateString('en-GB')}`
                  : ''}{' '}
                ({hasDateConflict.status}). Please choose another date.
              </span>
            </div>
          )}
        </div>

        {/* 4. Reason Textarea */}
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Reason *
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Brief reason for your leave..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
            required
          />
        </div>

        {/* Modal Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/25 transition cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Dialog>
  );
};

export default ApplyLeaveModal;
