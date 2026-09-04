import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import ApplyLeaveModal from './ApplyLeaveModal';
import {
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NotesIcon from '@mui/icons-material/Notes';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ChildFriendlyIcon from '@mui/icons-material/ChildFriendly';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

const LeaveRequestsTab = () => {
  const { userData, username, id, isAdmin, role } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState({
    pendingCount: 0,
    approvedThisMonth: 0,
    onLeaveToday: 0,
    totalRequests: 0,
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Review Action Dialog (Approve / Reject)
  const [reviewActionData, setReviewActionData] = useState(null);
  const [actionProcessing, setActionProcessing] = useState(false);

  // Fetch Requests & Summary
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [reqRes, sumRes, empRes] = await Promise.all([
        axios.get(`${apiPath}/api/leave/requests`, { headers }).catch(() => ({ data: { data: [] } })),
        axios.get(`${apiPath}/api/leave/summary`, { headers }).catch(() => ({ data: {} })),
        isUserAdmin
          ? axios.get(`${apiPath}/user/all`, { headers }).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
      ]);

      const reqList = reqRes.data?.data || [];
      setRequests(reqList);

      if (sumRes.data) {
        setSummary(sumRes.data);
      }

      const emps = Array.isArray(empRes.data)
        ? empRes.data
        : empRes.data?.users || empRes.data?.data || [];
      setEmployeesList(emps);
    } catch (err) {
      console.error('Error fetching leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const empName = (r.employeeName || '').toLowerCase();
        const type = (r.leaveType || '').toLowerCase();
        const reason = (r.reason || '').toLowerCase();
        return empName.includes(q) || type.includes(q) || reason.includes(q);
      }

      return true;
    });
  }, [requests, statusFilter, searchTerm]);

  // Submit Approval / Rejection
  const handleConfirmReview = async () => {
    if (!reviewActionData) return;
    const { request, status, comment } = reviewActionData;

    if (status === 'Rejected' && !comment.trim()) {
      toast.error('Rejection reason is mandatory when rejecting a leave request.');
      return;
    }

    setActionProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${apiPath}/api/leave/request/${request._id}/status`,
        {
          status,
          reviewerComment: comment.trim(),
        },
        { headers }
      );

      toast.success(`Leave request ${status.toLowerCase()} successfully!`);
      setReviewActionData(null);
      fetchData();
    } catch (err) {
      console.error('Error reviewing leave:', err);
      toast.error(err.response?.data?.error || 'Failed to update leave status');
    } finally {
      setActionProcessing(false);
    }
  };

  // Cancel own request
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this leave application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${apiPath}/api/leave/request/${requestId}`, { headers });
      toast.success('Leave request cancelled successfully');
      fetchData();
    } catch (err) {
      console.error('Error cancelling request:', err);
      toast.error(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || 'LR';
  };

  return (
    <div className="space-y-6 font-sans">
      {loading && <Loader />}

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending Approvals */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Pending Approvals
              </p>
              <h4 className="text-2xl font-bold text-amber-500 mt-1">
                {summary.pendingCount || 0}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shadow-inner">
              <HourglassEmptyIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>Awaiting Admin decision</span>
          </div>
        </div>

        {/* On Leave Today */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                On Leave Today
              </p>
              <h4 className="text-2xl font-bold text-blue-600 mt-1">
                {summary.onLeaveToday || 0}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shadow-inner">
              <CalendarMonthIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>Active absences today</span>
          </div>
        </div>

        {/* Approved This Month */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Approved This Month
              </p>
              <h4 className="text-2xl font-bold text-emerald-600 mt-1">
                {summary.approvedThisMonth || 0}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircleIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>Current calendar month</span>
          </div>
        </div>

        {/* Total Applications */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Requests
              </p>
              <h4 className="text-2xl font-bold text-purple-600 mt-1">
                {summary.totalRequests || requests.length}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center shadow-inner">
              <AccessTimeIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            <span>All recorded leave records</span>
          </div>
        </div>
      </div>

      {/* Main Leave Requests Table Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-4">
        {/* Actions Bar: Status filter pills, Search input, "+ Apply for Leave" button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-strokedark pb-4">
          {/* Status Tabs */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-semibold overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Requests', count: requests.length },
              { id: 'Pending', label: 'Pending', count: requests.filter((r) => r.status === 'Pending').length },
              { id: 'Approved', label: 'Approved', count: requests.filter((r) => r.status === 'Approved').length },
              { id: 'Rejected', label: 'Rejected', count: requests.filter((r) => r.status === 'Rejected').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-boxdark text-primary shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.id ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search and New Application Button */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <SearchIcon
                style={{ fontSize: 18 }}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff, leave type..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <button
              onClick={() => setApplyModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <AddIcon style={{ fontSize: 16 }} />
              <span>Apply for Leave</span>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Leave Type</th>
                <th className="py-2.5 px-3">Duration & Dates</th>
                <th className="py-2.5 px-3">Total Days</th>
                <th className="py-2.5 px-3">Pay Type</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reviewer Notes</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading leave applications...
                  </td>
                </tr>
              ) : filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const typeBadge = getLeaveTypeBadge(req.leaveType);
                  const statusBadgeClass = getStatusBadge(req.status);
                  const startStr = new Date(req.startDate).toLocaleDateString('en-GB');
                  const endStr = new Date(req.endDate).toLocaleDateString('en-GB');
                  const isMulti = req.durationType === 'Multiple Days';

                  const canCancel =
                    req.status === 'Pending' &&
                    (isUserAdmin || String(req.employeeId?._id || req.employeeId) === String(id));

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
                    <tr
                      key={req._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Employee */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                            {getInitials(req.employeeName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100">
                              {req.employeeName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {req.employeeId?.role || 'Staff Member'}
                            </p>
                          </div>
                        </div>
                      </td>

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

                      {/* Paid / Non-Paid Pay Type */}
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

                      {/* Reviewer Notes */}
                      <td className="py-3 px-3 max-w-[150px] truncate text-slate-500 text-[11px]" title={req.reviewerComment || ''}>
                        {req.reviewerComment ? (
                          <span>
                            <strong>{req.reviewerName ? `${req.reviewerName}: ` : ''}</strong>
                            {req.reviewerComment}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admin: Approve / Reject for Pending */}
                          {isUserAdmin && req.status === 'Pending' && (
                            <>
                              <button
                                onClick={() =>
                                  setReviewActionData({
                                    request: req,
                                    status: 'Approved',
                                    comment: 'Approved by Administrator',
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                                title="Approve Leave"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setReviewActionData({
                                    request: req,
                                    status: 'Rejected',
                                    comment: '',
                                  })
                                }
                                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                                title="Reject Leave"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {/* Staff: Cancel own pending request */}
                          {canCancel && !isUserAdmin && (
                            <button
                              onClick={() => handleCancelRequest(req._id)}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                              title="Cancel Request"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Inspect details */}
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
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
                  <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                    No leave requests found for this filter.
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
          onSuccess={fetchData}
          employeesList={employeesList}
        />
      )}

      {/* Review Action Dialog (Approve / Reject with Reason) */}
      {reviewActionData && (
        <Dialog
          open={Boolean(reviewActionData)}
          onClose={() => setReviewActionData(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: '24px',
              overflow: 'hidden',
            },
          }}
        >
          <div className={`p-6 text-white ${
            reviewActionData.status === 'Approved'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
              : 'bg-gradient-to-r from-rose-600 to-red-700'
          }`}>
            <h3 className="text-lg font-bold">
              {reviewActionData.status === 'Approved' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>
            <p className="text-xs opacity-90 mt-1">
              Applicant: <strong>{reviewActionData.request.employeeName}</strong> (
              {reviewActionData.request.totalDays} Days)
            </p>
          </div>

          <div className="p-6 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200">
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-400 uppercase text-[10px]">Leave Summary:</span>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                {reviewActionData.request.leaveType} ({reviewActionData.request.durationType})
              </p>
              <p className="text-slate-500 italic bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                "{reviewActionData.request.reason}"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                {reviewActionData.status === 'Approved' ? 'Approval Remarks (Optional)' : 'Rejection Reason (Required) *'}
              </label>
              <textarea
                rows={3}
                value={reviewActionData.comment}
                onChange={(e) =>
                  setReviewActionData({
                    ...reviewActionData,
                    comment: e.target.value,
                  })
                }
                placeholder={
                  reviewActionData.status === 'Approved'
                    ? 'Enter approval notes or instructions for the employee...'
                    : 'Provide the specific reason why this leave application is rejected...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:outline-none"
                required={reviewActionData.status === 'Rejected'}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewActionData(null)}
                disabled={actionProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={actionProcessing}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition ${
                  reviewActionData.status === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25'
                }`}
              >
                {actionProcessing ? 'Processing...' : `Confirm ${reviewActionData.status}`}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Inspect Leave Details Modal */}
      {selectedRequest && (
        <Dialog
          open={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            style: {
              borderRadius: '24px',
              overflow: 'hidden',
            },
          }}
        >
          <div className="relative bg-gradient-to-r from-primary via-indigo-700 to-purple-800 p-6 text-white">
            <IconButton
              onClick={() => setSelectedRequest(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.15)',
              }}
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>

            <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-indigo-200 mb-1">
              <CalendarMonthIcon style={{ fontSize: 16 }} />
              <span>Leave Application Record</span>
            </div>
            <h2 className="text-xl font-extrabold pr-8">{selectedRequest.leaveType}</h2>
          </div>

          <div className="p-6 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
            {/* Applicant Details */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
                  {getInitials(selectedRequest.employeeName)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                    {selectedRequest.employeeName}
                  </h4>
                  <p className="text-slate-400 text-[10px]">
                    {selectedRequest.employeeId?.email || 'Staff Applicant'}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(selectedRequest.status)}`}>
                {selectedRequest.status}
              </span>
            </div>

            {/* Dates and Duration */}
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
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Duration</span>
                <span className="font-bold text-sm text-primary mt-0.5 block">
                  {selectedRequest.totalDays} {selectedRequest.totalDays === 1 ? 'Working Day' : 'Working Days'}
                </span>
              </div>
            </div>

            {/* Paid vs Non-Paid Breakdown */}
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
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <NotesIcon style={{ fontSize: 14 }} />
                <span>Reason For Leave</span>
              </span>
              <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 leading-relaxed font-medium">
                {selectedRequest.reason}
              </p>
            </div>

            {/* Reviewer Details */}
            {selectedRequest.reviewedBy && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                <span className="text-[10px] font-bold uppercase text-primary tracking-wide block">
                  Reviewer Decision ({selectedRequest.status})
                </span>
                <p className="text-slate-800 dark:text-slate-200">
                  Reviewed by <strong>{selectedRequest.reviewerName || 'Administrator'}</strong> on{' '}
                  {selectedRequest.reviewedAt
                    ? new Date(selectedRequest.reviewedAt).toLocaleDateString('en-GB')
                    : 'N/A'}
                </p>
                {selectedRequest.reviewerComment && (
                  <p className="text-slate-600 dark:text-slate-300 italic pt-1 border-t border-indigo-100 dark:border-indigo-900/40">
                    "{selectedRequest.reviewerComment}"
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              onClick={() => setSelectedRequest(null)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default LeaveRequestsTab;
