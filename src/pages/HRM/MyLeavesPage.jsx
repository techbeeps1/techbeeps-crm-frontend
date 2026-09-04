import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import ApplyLeaveModal from './ApplyLeaveModal';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import VisibilityIcon from '@mui/icons-material/Visibility';
import NotesIcon from '@mui/icons-material/Notes';
import {
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPlus,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import Loader from '../../common/Loader';
import toast from 'react-hot-toast';

const getLeaveTypeBadge = (type = '') => {
  const t = type.toLowerCase();
  if (t.includes('sick')) {
    return {
      label: 'Sick Leave',
      bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: <LocalHospitalIcon style={{ fontSize: 13 }} />,
    };
  }
  if (t.includes('casual')) {
    return {
      label: 'Casual Leave',
      bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: <FlashOnIcon style={{ fontSize: 13 }} />,
    };
  }
  if (t.includes('emergency') || t.includes('personal')) {
    return {
      label: 'Emergency / Personal',
      bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: <WarningAmberIcon style={{ fontSize: 13 }} />,
    };
  }
  if (t.includes('unpaid')) {
    return {
      label: 'Unpaid Leave',
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      icon: <MoneyOffIcon style={{ fontSize: 13 }} />,
    };
  }
  if (t.includes('maternity') || t.includes('paternity')) {
    return {
      label: 'Parental Leave',
      bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: <ChildFriendlyIcon style={{ fontSize: 13 }} />,
    };
  }
  return {
    label: 'Annual / Vacation',
    bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: <BeachAccessIcon style={{ fontSize: 13 }} />,
  };
};

const getStatusBadge = (status = '') => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    case 'Pending':
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
};

const MyLeavesPage = () => {
  const { userData, username, id, role } = useContext(UserContext) || {};
  const currentUserId = id || userData?._id;

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [requests, setRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Fetch only this employee's leave data
  const fetchMyLeaves = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [reqRes, balRes] = await Promise.all([
        axios.get(`${apiPath}/api/leave/requests?employeeId=${currentUserId}&year=${selectedYear}`, { headers }),
        axios.get(`${apiPath}/api/leave/balances?employeeId=${currentUserId}&year=${selectedYear}`, { headers }),
      ]);

      const reqList = reqRes.data?.data || [];
      // Ensure only my requests are shown
      const myReqs = reqList.filter((r) => String(r.employeeId?._id || r.employeeId) === String(currentUserId));
      setRequests(myReqs);

      const balList = balRes.data?.data || [];
      const myBal = balList.find((b) => String(b.employeeId?._id || b.employeeId) === String(currentUserId)) || balList[0];
      setBalance(myBal || null);
    } catch (err) {
      console.error('Error fetching my leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, [currentUserId, selectedYear]);

  // Cancel own pending request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${apiPath}/api/leave/request/${requestId}`, { headers });
      toast.success('Leave request cancelled successfully');
      fetchMyLeaves();
    } catch (err) {
      console.error('Error cancelling leave:', err);
      toast.error(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status.toLowerCase() === statusFilter.toLowerCase();
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (r.leaveType || '').toLowerCase().includes(q) ||
        (r.reason || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [requests, statusFilter, searchTerm]);

  // Balance Metrics
  const annualQuota = balance?.annualEntitlement !== undefined ? balance.annualEntitlement : 12;
  const usedPaidDays = balance?.usedDays || 0;
  const remainingPaidDays = Math.max(0, annualQuota - usedPaidDays);
  const unpaidDaysTaken = balance?.unpaidDays || balance?.usedBreakdown?.unpaid || 0;

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === 'Pending').length,
    approved: requests.filter((r) => r.status === 'Approved').length,
    rejected: requests.filter((r) => r.status === 'Rejected').length,
  };

  return (
    <div className="w-full space-y-6 font-sans">
      {loading && <Loader />}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20">
              <CalendarMonthIcon style={{ fontSize: 22 }} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                My Leaves & Balances
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your paid vacation days, submit new requests, and view approval status
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-transparent text-slate-800 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Apply Leave Button */}
          <button
            onClick={() => setApplyModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 active:scale-[0.98] transition cursor-pointer"
          >
            <FiPlus className="text-base" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* 4 Personal Balance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Paid Quota */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
            <span>Annual Paid Quota</span>
            <FiAward className="text-primary text-base" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {annualQuota} <span className="text-xs font-medium text-slate-400">Days</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Default: 12.0 Days</span>
        </div>

        {/* Paid Leaves Used */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
            <span>Paid Leaves Used</span>
            <FiClock className="text-amber-500 text-base" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {usedPaidDays} <span className="text-xs font-medium text-slate-400">Days</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Approved PTO</span>
        </div>

        {/* Remaining Paid Leaves */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
            <span>Remaining Paid Leaves</span>
            <FiCheckCircle className="text-emerald-500 text-base" />
          </div>
          <div
            className={`text-2xl font-extrabold mt-1 ${
              remainingPaidDays > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {remainingPaidDays} <span className="text-xs font-medium text-slate-400">Days</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {remainingPaidDays > 0 ? 'Available Quota' : 'Quota Exhausted'}
          </span>
        </div>

        {/* Non-Paid Leaves Taken */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
            <span>Non-Paid Leaves</span>
            <FiDollarSign className="text-purple-500 text-base" />
          </div>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
            {unpaidDaysTaken} <span className="text-xs font-medium text-slate-400">Days</span>
          </div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 block font-semibold">
            Auto Unpaid Absences
          </span>
        </div>
      </div>

      {/* Requests Table Container */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs space-y-4">
        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700 w-fit overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Requests', count: counts.all },
              { id: 'pending', label: 'Pending', count: counts.pending },
              { id: 'approved', label: 'Approved', count: counts.approved },
              { id: 'rejected', label: 'Rejected', count: counts.rejected },
            ].map((st) => {
              const active = statusFilter === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      active ? 'bg-primary/10 text-primary' : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500'
                    }`}
                  >
                    {st.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <SearchIcon style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by type or reason..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-3">Leave Type</th>
                <th className="py-2.5 px-3">Duration & Dates</th>
                <th className="py-2.5 px-3">Total Days</th>
                <th className="py-2.5 px-3">Pay Type</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Admin Note</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading your leave records...
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const typeBadge = getLeaveTypeBadge(req.leaveType);
                  const statusBadgeClass = getStatusBadge(req.status);
                  const startStr = new Date(req.startDate).toLocaleDateString('en-GB');
                  const endStr = new Date(req.endDate).toLocaleDateString('en-GB');
                  const isMulti = req.durationType === 'Multiple Days';

                  let paid = req.paidDays !== undefined ? req.paidDays : 0;
                  let unpaid = req.unpaidDays !== undefined ? req.unpaidDays : 0;
                  if (paid === 0 && unpaid === 0 && req.totalDays > 0) {
                    if (req.leaveType === 'Unpaid Leave') {
                      unpaid = req.totalDays;
                    } else {
                      paid = req.totalDays;
                    }
                  }

                  return (
                    <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Leave Type */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${typeBadge.bg}`}>
                          {typeBadge.icon}
                          <span>{req.leaveType}</span>
                        </span>
                      </td>

                      {/* Duration & Dates */}
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {isMulti ? `${startStr} — ${endStr}` : startStr}
                          </p>
                          <p className="text-[10px] text-slate-400">{req.durationType}</p>
                        </div>
                      </td>

                      {/* Total Days */}
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-xs text-slate-800 dark:text-white">
                          {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'}
                        </span>
                      </td>

                      {/* Pay Type */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 flex-wrap">
                          {paid > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              {paid} Paid
                            </span>
                          )}
                          {unpaid > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                              {unpaid} Non-Paid
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="py-3 px-3 max-w-[180px] truncate text-slate-600 dark:text-slate-300" title={req.reason}>
                        {req.reason}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusBadgeClass}`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Admin Note */}
                      <td className="py-3 px-3 max-w-[160px] truncate text-slate-500 text-[11px]" title={req.reviewerComment || ''}>
                        {req.reviewerComment ? (
                          <span>{req.reviewerComment}</span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === 'Pending' && (
                            <button
                              onClick={() => handleCancelRequest(req._id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                              title="Cancel Pending Request"
                            >
                              Cancel
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="View Full Details"
                          >
                            <VisibilityIcon style={{ fontSize: 16 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400 italic">
                    <FiCalendar className="mx-auto text-2xl mb-1.5 opacity-50" />
                    <p className="font-semibold text-xs">No leave requests found.</p>
                    <p className="text-[11px] mt-0.5">Click "+ Apply for Leave" to submit a new application.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {applyModalOpen && (
        <ApplyLeaveModal
          open={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={fetchMyLeaves}
          employeesList={[]}
        />
      )}

      {/* Inspect Leave Details Modal */}
      {selectedRequest && (
        <Dialog
          open={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            className: 'rounded-2xl dark:bg-boxdark overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl',
          }}
        >
          <div className="relative bg-gradient-to-r from-primary to-blue-600 p-5 text-white flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-blue-100 mb-0.5">
                <CalendarMonthIcon style={{ fontSize: 16 }} />
                <span>My Leave Record</span>
              </div>
              <h3 className="text-lg font-bold">{selectedRequest.leaveType}</h3>
            </div>

            <IconButton
              onClick={() => setSelectedRequest(null)}
              style={{ color: 'white', backgroundColor: 'rgba(255,255,255,0.15)' }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <div className="p-5 space-y-3 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
            {/* Status & Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Dates</span>
                <span className="font-bold text-sm text-slate-800 dark:text-white mt-0.5 block">
                  {new Date(selectedRequest.startDate).toLocaleDateString('en-GB')}
                  {selectedRequest.durationType === 'Multiple Days' &&
                    ` — ${new Date(selectedRequest.endDate).toLocaleDateString('en-GB')}`}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Status</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-extrabold uppercase border ${getStatusBadge(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {/* Pay Type Split */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pay Type Breakdown</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {(selectedRequest.paidDays > 0 || (!selectedRequest.paidDays && !selectedRequest.unpaidDays && selectedRequest.leaveType !== 'Unpaid Leave')) && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                    {selectedRequest.paidDays !== undefined ? selectedRequest.paidDays : selectedRequest.totalDays} Paid Days
                  </span>
                )}
                {(selectedRequest.unpaidDays > 0 || (!selectedRequest.paidDays && !selectedRequest.unpaidDays && selectedRequest.leaveType === 'Unpaid Leave')) && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200">
                    {selectedRequest.unpaidDays !== undefined ? selectedRequest.unpaidDays : selectedRequest.totalDays} Non-Paid Days
                  </span>
                )}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400">Reason</span>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 leading-relaxed font-medium">
                {selectedRequest.reason}
              </p>
            </div>

            {/* Reviewer Comment */}
            {selectedRequest.reviewerComment && (
              <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wide block">
                  Admin Note
                </span>
                <p className="text-slate-800 dark:text-slate-200">
                  {selectedRequest.reviewerComment}
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default MyLeavesPage;
