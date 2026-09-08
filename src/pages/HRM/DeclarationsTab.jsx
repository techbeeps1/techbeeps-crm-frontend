import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import ApplyDeclarationModal from './ApplyDeclarationModal';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';
import {
  Dialog,
  IconButton,
} from '@mui/material';
import {
  FiFileText,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiUser,
  FiDownload,
  FiRefreshCw,
  FiPlus,
  FiEye,
  FiCheck,
  FiX,
  FiTrash2,
  FiEdit2,
  FiExternalLink,
  FiNavigation,
  FiPaperclip,
  FiDroplet,
  FiCoffee,
  FiPackage,
  FiTool,
  FiHome,
  FiMapPin,
  FiRotateCcw,
  FiSliders,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

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

const CATEGORIES = [
  'All',
  'Travel & Mileage',
  'Fuel & Gas',
  'Parking & Tolls',
  'Meals & Subsistence',
  'Materials & Supplies',
  'Equipment & Rental',
  'Accommodation',
  'Other Out-of-Pocket',
];

const getCategoryBadge = (type = '') => {
  switch (type) {
    case 'Travel & Mileage':
      return {
        bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: FiNavigation,
      };
    case 'Fuel & Gas':
      return {
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: FiDroplet,
      };
    case 'Parking & Tolls':
      return {
        bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: FiMapPin,
      };
    case 'Meals & Subsistence':
      return {
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: FiCoffee,
      };
    case 'Materials & Supplies':
      return {
        bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: FiPackage,
      };
    case 'Equipment & Rental':
      return {
        bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        icon: FiTool,
      };
    case 'Accommodation':
      return {
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: FiHome,
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: FiFileText,
      };
  }
};

const getStatusBadge = (status = '') => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Paid':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    case 'Pending':
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
};

const DeclarationsTab = () => {
  const { symbol: currencySymbol } = useCurrency();
  const { userData, isAdmin, role } = useContext(UserContext) || {};
  const isManager = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const [declarations, setDeclarations] = useState([]);
  const [summary, setSummary] = useState({
    totalDeclaredAmount: 0,
    totalCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    approvedAmount: 0,
    approvedCount: 0,
    paidAmount: 0,
    paidCount: 0,
    rejectedAmount: 0,
    rejectedCount: 0,
  });
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [datePreset, setDatePreset] = useState('this-month'); // 'today' | 'this-week' | 'this-month' | 'this-year' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedDeclarationForEdit, setSelectedDeclarationForEdit] = useState(null);

  // Status Action Modal (Approve, Reject, Pay)
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState('Approve'); // 'Approve' | 'Reject' | 'Paid'
  const [targetDeclaration, setTargetDeclaration] = useState(null);
  const [actionComment, setActionComment] = useState('');
  const [approvedAmountInput, setApprovedAmountInput] = useState('');
  const [paymentReferenceInput, setPaymentReferenceInput] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  // Receipt Preview Modal
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState('');
  const [activeReceiptTitle, setActiveReceiptTitle] = useState('');

  // Fetch Employees List
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${apiPath}/user/all`, { headers });
        const list = Array.isArray(res.data) ? res.data : res.data?.users || res.data?.data || [];
        setEmployeesList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error fetching staff list:', err);
      }
    };
    fetchStaff();
  }, []);

  // Compute Date Bounds
  const dateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === 'today') {
      const s = new Date(now);
      s.setHours(0, 0, 0, 0);
      const e = new Date(now);
      e.setHours(23, 59, 59, 999);
      return { start: s.toISOString(), end: e.toISOString() };
    }
    if (datePreset === 'this-week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      return { start: monday.toISOString(), end: sunday.toISOString() };
    }
    if (datePreset === 'this-month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start: s.toISOString(), end: e.toISOString() };
    }
    if (datePreset === 'this-year') {
      const s = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      const e = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { start: s.toISOString(), end: e.toISOString() };
    }
    if (datePreset === 'custom' && customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate).toISOString(),
        end: new Date(customEndDate).toISOString(),
      };
    }
    return {};
  }, [datePreset, customStartDate, customEndDate]);

  // Fetch Declarations
  const fetchDeclarations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = {};
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }
      if (selectedEmployee && selectedEmployee !== 'all') {
        params.employeeId = selectedEmployee;
      }
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (categoryFilter && categoryFilter !== 'All') {
        params.declarationType = categoryFilter;
      }
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await axios.get(`${apiPath}/api/declarations`, { headers, params });

      if (res.data?.success) {
        setDeclarations(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching declarations:', err);
      toast.error('Failed to load declarations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeclarations();
  }, [dateRange, selectedEmployee, statusFilter, categoryFilter, searchTerm]);

  // Open Status Action Dialog
  const openActionModal = (decl, targetStatus = null) => {
    setTargetDeclaration(decl);
    setActionType(targetStatus || decl.status || 'Pending');
    setActionComment(decl.reviewerComment || '');
    setApprovedAmountInput(decl.amount !== undefined ? String(decl.amount) : '');
    setPaymentReferenceInput(
      decl.paymentReference || `BANK-${new Date().getFullYear()}-${decl.jobIndex || 'EXP'}`
    );
    setActionModalOpen(true);
  };

  // Submit Status Change (Approve / Reject / Paid / Pending / Cancelled)
  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!targetDeclaration) return;

    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        status: actionType,
        reviewerComment: actionComment.trim(),
      };

      if (actionType === 'Approved' && approvedAmountInput) {
        payload.approvedAmount = parseFloat(approvedAmountInput);
      }
      if (actionType === 'Paid') {
        payload.paymentReference = paymentReferenceInput.trim();
      }

      const res = await axios.put(
        `${apiPath}/api/declarations/${targetDeclaration._id}/status`,
        payload,
        { headers }
      );

      if (res.data?.success) {
        toast.success(`Declaration status updated to ${actionType}`);
        setActionModalOpen(false);
        fetchDeclarations();
      }
    } catch (err) {
      console.error('Error updating declaration status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessingAction(false);
    }
  };

  // Delete Declaration
  const handleDeleteDeclaration = async (id) => {
    if (!window.confirm('Are you sure you want to delete this declaration?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.delete(`${apiPath}/api/declarations/${id}`, { headers });
      if (res.data?.success) {
        toast.success('Declaration deleted');
        fetchDeclarations();
      }
    } catch (err) {
      console.error('Error deleting declaration:', err);
      toast.error('Failed to delete declaration');
    }
  };

  // Helper to detect PDF format
  const isPdfUrl = (url = '') => {
    if (!url) return false;
    const str = String(url).toLowerCase();
    return (
      str.startsWith('data:application/pdf') ||
      str.includes('application/pdf') ||
      str.endsWith('.pdf') ||
      str.includes('.pdf?') ||
      str.startsWith('jvberiox')
    );
  };

  // Helper to open / download receipt
  const handleOpenReceiptInNewTab = (url, title = 'receipt') => {
    if (!url) return;
    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  // View Receipt
  const openReceiptViewer = (url, title) => {
    // If raw base64 without prefix
    let finalUrl = url;
    if (url && !url.startsWith('http') && !url.startsWith('data:')) {
      finalUrl = `data:application/pdf;base64,${url}`;
    }
    setActiveReceiptUrl(finalUrl);
    setActiveReceiptTitle(title);
    setReceiptViewerOpen(true);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (declarations.length === 0) {
      toast.error('No declarations to export');
      return;
    }

    const headers = [
      'Date',
      'Employee Name',
      'Employee Role',
      'Category',
      'Title',
      'Amount (EUR)',
      'Distance (Km)',
      'Job Number',
      'Status',
      'Receipt Attached',
      'Reviewer',
      'Review Notes',
      'Payment Reference',
    ];

    const rows = declarations.map((d) => [
      `"${formatDate(d.date)}"`,
      `"${d.employeeName || ''}"`,
      `"${d.employeeRole || ''}"`,
      `"${d.declarationType || ''}"`,
      `"${(d.title || '').replace(/"/g, '""')}"`,
      d.amount || 0,
      d.distanceKm || 0,
      `"${d.jobIndex || 'N/A'}"`,
      `"${d.status}"`,
      d.receiptUrl ? 'Yes' : 'No',
      `"${d.reviewerName || ''}"`,
      `"${(d.reviewerComment || '').replace(/"/g, '""')}"`,
      `"${(d.paymentReference || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Declarations_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Declarations exported to CSV');
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. TOP KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Declared */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center text-xl shrink-0">
            <FiDollarSign />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Declared
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(summary.totalDeclaredAmount)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              {summary.totalCount} Total Claims
            </span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            <FiClock />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(summary.pendingAmount)}
              </span>
            </div>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 font-bold">
              {summary.pendingCount} Claims Awaiting Review
            </span>
          </div>
        </div>

        {/* Approved Claims */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <FiCheckCircle />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Approved Claims
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(summary.approvedAmount)}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 font-bold">
              {summary.approvedCount} Claims Approved
            </span>
          </div>
        </div>

        {/* Paid / Reimbursed */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shrink-0">
            <FiCreditCard />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Paid / Reimbursed
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {formatCurrency(summary.paidAmount)}
              </span>
            </div>
            <span className="text-[11px] text-purple-600/80 dark:text-purple-400/80 font-bold">
              {summary.paidCount} Claims Settled
            </span>
          </div>
        </div>
      </div>

      {/* 2. FILTER & ACTION TOOLBAR */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            {[
              { id: 'today', label: 'Today' },
              { id: 'this-week', label: 'This Week' },
              { id: 'this-month', label: 'This Month' },
              { id: 'this-year', label: 'This Year' },
              { id: 'custom', label: 'Custom' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  datePreset === p.id
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Pending', 'Approved', 'Paid', 'Rejected'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <FiDownload />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDeclarationForEdit(null);
                setApplyModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer"
            >
              <FiPlus className="text-sm" />
              <span>New Declaration</span>
            </button>
          </div>
        </div>

        {/* Custom Date Pickers (if Custom Selected) */}
        {datePreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">From:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">To:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>
        )}

        {/* Search, Category, and Employee Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Search Bar */}
          <div className="sm:col-span-6 relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by staff name, claim title, job number, or notes..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Employee Dropdown */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:border-primary cursor-pointer"
            >
              <option value="all">All Colleagues</option>
              {employeesList.map((emp) => (
                <option key={emp._id || emp.id} value={emp._id || emp.id}>
                  {emp.username || emp.name || emp.email || 'Colleague'} ({emp.role || 'Staff'})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchDeclarations}
              className="p-2 rounded-xl text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Refresh"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. DECLARATIONS TABLE */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FiFileText className="text-primary text-base" />
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Employee Expense & Allowance Declarations ({declarations.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Staff claims, vouchers, and reimbursement tracker
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <FiRefreshCw className="animate-spin text-2xl mx-auto mb-2 text-primary" />
            <p>Loading declarations records...</p>
          </div>
        ) : declarations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiFileText className="text-3xl mx-auto mb-2 opacity-40 text-primary" />
            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-1">
              No Declarations Found
            </h4>
            <p className="text-xs max-w-sm mx-auto">
              There are no declarations submitted matching your selected period and filter parameters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Colleague</th>
                  <th className="py-3 px-3">Category & Title</th>
                  <th className="py-3 px-3">Date & Job</th>
                  <th className="py-3 px-3">Details / Distance</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {declarations.map((decl) => {
                  const catBadge = getCategoryBadge(decl.declarationType);
                  return (
                    <tr
                      key={decl._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Colleague Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {decl.employeeId?.photo ? (
                            <img
                              src={decl.employeeId.photo}
                              alt={decl.employeeName}
                              className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {(decl.employeeName || 'S').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {decl.employeeName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {decl.employeeRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Category & Title */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1 max-w-[220px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(() => {
                              const CatIcon = catBadge.icon;
                              return (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold border ${catBadge.bg}`}
                                >
                                  <CatIcon className="text-xs shrink-0" />
                                  <span className="truncate">{decl.declarationType}</span>
                                </span>
                              );
                            })()}
                            {decl.items && decl.items.length > 1 && (
                              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900/60">
                                {decl.items.length} items
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate" title={decl.title}>
                            {decl.title}
                          </p>
                          {decl.description && (
                            <p className="text-[11px] text-slate-400 truncate" title={decl.description}>
                              {decl.description}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 3. Date & Job */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {formatDate(decl.date)}
                        </span>
                        {decl.jobIndex ? (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                            Job: {decl.jobIndex}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">General Claim</span>
                        )}
                      </td>

                      {/* 4. Details / Distance */}
                      <td className="py-3.5 px-3">
                        {decl.declarationType === 'Travel & Mileage' && decl.distanceKm > 0 ? (
                          <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              {decl.distanceKm} km
                            </span>
                            {decl.startLocation && decl.destinationLocation && (
                              <span className="text-[10px] text-slate-400 truncate block max-w-[180px]">
                                {decl.startLocation} → {decl.destinationLocation}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Direct Receipt</span>
                        )}
                      </td>

                      {/* 5. Amount */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(decl.amount || 0)}
                        </span>
                      </td>

                      {/* 6. Receipt Preview */}
                      <td className="py-3.5 px-3 text-center">
                        {decl.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => openReceiptViewer(decl.receiptUrl, decl.title)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                            title="Preview receipt attachment"
                          >
                            <FiPaperclip className="text-xs" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* 7. Status Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => openActionModal(decl, decl.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer hover:ring-2 hover:ring-primary/30 hover:scale-105 transition-all shadow-xs ${getStatusBadge(
                            decl.status
                          )}`}
                          title="Click to manage / change status"
                        >
                          <span>{decl.status}</span>
                          <FiEdit2 className="text-[9px] opacity-70" />
                        </button>
                        {decl.reviewedBy && decl.status !== 'Pending' && (
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            by {decl.reviewerName || 'Manager'}
                          </span>
                        )}
                      </td>

                      {/* 8. Manager Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Quick Approve (If Pending) */}
                          {decl.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => openActionModal(decl, 'Approved')}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 transition-colors cursor-pointer"
                              title="Approve Claim"
                            >
                              <FiCheck className="text-sm" />
                            </button>
                          )}

                          {/* Quick Reject (If Pending) */}
                          {decl.status === 'Pending' && (
                            <button
                              type="button"
                              onClick={() => openActionModal(decl, 'Rejected')}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 transition-colors cursor-pointer"
                              title="Reject Claim"
                            >
                              <FiX className="text-sm" />
                            </button>
                          )}

                          {/* Mark as Paid (If Approved) */}
                          {decl.status === 'Approved' && (
                            <button
                              type="button"
                              onClick={() => openActionModal(decl, 'Paid')}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 dark:text-blue-300 transition-colors cursor-pointer"
                              title="Mark as Reimbursed / Paid"
                            >
                              <FiCreditCard className="text-sm" />
                            </button>
                          )}

                          {/* Edit / Inspect */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDeclarationForEdit(decl);
                              setApplyModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title={
                              decl.status === 'Pending'
                                ? 'Edit Declaration'
                                : `View Declaration Details (${decl.status} - Read Only)`
                            }
                          >
                            {decl.status === 'Pending' ? (
                              <FiEdit2 className="text-xs" />
                            ) : (
                              <FiEye className="text-xs text-slate-400 hover:text-primary" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteDeclaration(decl._id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Declaration"
                          >
                            <FiTrash2 className="text-xs" />
                          </button>
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

      {/* MODAL 1: Create / Edit Declaration */}
      <ApplyDeclarationModal
        open={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedDeclarationForEdit(null);
        }}
        onSuccess={() => {
          fetchDeclarations();
        }}
        initialData={selectedDeclarationForEdit}
      />

      {/* MODAL 2: Action Modal (Full Status Management: Pending, Approved, Paid, Rejected, Cancelled) */}
      <Dialog
        open={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '24px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <FiSliders className="text-primary text-lg" />
                <span>Manage Declaration Status</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Change status, approve, reimburse, or reset claim back to Pending
              </p>
            </div>
            <IconButton size="small" onClick={() => setActionModalOpen(false)}>
              <FiX className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </IconButton>
          </div>

          <form onSubmit={handleExecuteAction} className="space-y-5">
            {/* Declaration Summary Preview */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {targetDeclaration?.jobIndex
                      ? `Job: ${targetDeclaration?.jobIndex}`
                      : `Ref: ${targetDeclaration?._id?.slice(-6)?.toUpperCase() || 'EXP'}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {targetDeclaration?.employeeName || 'Staff'}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {targetDeclaration?.title || 'Declaration'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {formatDate(targetDeclaration?.expenseDate)} · {targetDeclaration?.declarationType}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-slate-400 block font-medium">Claim Amount</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(targetDeclaration?.amount || 0)}
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                      targetDeclaration?.status
                    )}`}
                  >
                    Current: {targetDeclaration?.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Selector Grid (5 Statuses) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Target Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {/* 1. Pending */}
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Pending');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    actionType === 'Pending'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FiClock
                    className={`text-base ${
                      actionType === 'Pending' ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs">Pending</span>
                  <span className="text-[9px] opacity-75">Revert / Reset</span>
                </button>

                {/* 2. Approved */}
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Approved');
                    if (!approvedAmountInput && targetDeclaration?.amount) {
                      setApprovedAmountInput(String(targetDeclaration.amount));
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    actionType === 'Approved'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FiCheckCircle
                    className={`text-base ${
                      actionType === 'Approved' ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs">Approved</span>
                  <span className="text-[9px] opacity-75">Accept Claim</span>
                </button>

                {/* 3. Paid */}
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Paid');
                    if (!paymentReferenceInput) {
                      setPaymentReferenceInput(
                        targetDeclaration?.paymentReference ||
                          `BANK-${new Date().getFullYear()}-${targetDeclaration?.jobIndex || 'EXP'}`
                      );
                    }
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    actionType === 'Paid'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FiCreditCard
                    className={`text-base ${
                      actionType === 'Paid' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs">Paid</span>
                  <span className="text-[9px] opacity-75">Reimbursed</span>
                </button>

                {/* 4. Rejected */}
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Rejected');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    actionType === 'Rejected'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FiXCircle
                    className={`text-base ${
                      actionType === 'Rejected' ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs">Rejected</span>
                  <span className="text-[9px] opacity-75">Decline Claim</span>
                </button>

                {/* 5. Cancelled */}
                <button
                  type="button"
                  onClick={() => {
                    setActionType('Cancelled');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    actionType === 'Cancelled'
                      ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-2 ring-slate-500/30 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <FiX
                    className={`text-base ${
                      actionType === 'Cancelled'
                        ? 'text-slate-600 dark:text-slate-300'
                        : 'text-slate-400'
                    }`}
                  />
                  <span className="text-xs">Cancelled</span>
                  <span className="text-[9px] opacity-75">Void Claim</span>
                </button>
              </div>
            </div>

            {/* Context Notice / Extra Fields */}
            {actionType === 'Pending' && (
              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <FiRotateCcw className="text-amber-600 shrink-0 mt-0.5 text-sm" />
                <div>
                  <p className="font-bold">Revert / Reset to Pending</p>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    This will clear previous reviewer and payment records. The claim will return to the active pending queue and can be re-edited or re-evaluated.
                  </p>
                </div>
              </div>
            )}

            {actionType === 'Approved' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Approved Amount ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={approvedAmountInput}
                  onChange={(e) => setApprovedAmountInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Adjust if only partial amount was approved for reimbursement.
                </p>
              </div>
            )}

            {actionType === 'Paid' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Reference / Transfer ID
                </label>
                <input
                  type="text"
                  value={paymentReferenceInput}
                  onChange={(e) => setPaymentReferenceInput(e.target.value)}
                  placeholder="e.g. SEPA-TXN-129402 / Bank Transfer"
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary"
                  required
                />
              </div>
            )}

            {actionType === 'Rejected' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder="State the specific reason for rejecting this claim..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary resize-none"
                  required
                />
              </div>
            )}

            {actionType !== 'Rejected' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Reviewer Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={actionComment}
                  onChange={(e) => setActionComment(e.target.value)}
                  placeholder="Add internal notes or memo for records..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary resize-none"
                />
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingAction}
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all ${
                  actionType === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : actionType === 'Paid'
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    : actionType === 'Rejected'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : actionType === 'Pending'
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                    : 'bg-slate-700 hover:bg-slate-800 shadow-slate-700/20'
                }`}
              >
                {processingAction ? (
                  <>
                    <FiRefreshCw className="animate-spin text-xs" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {actionType === 'Pending' && <FiRotateCcw className="text-xs" />}
                    {actionType === 'Approved' && <FiCheck className="text-xs" />}
                    {actionType === 'Paid' && <FiCreditCard className="text-xs" />}
                    {actionType === 'Rejected' && <FiX className="text-xs" />}
                    {actionType === 'Cancelled' && <FiX className="text-xs" />}
                    <span>Set Status to {actionType}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* MODAL 3: Receipt Attachment Preview Modal */}
      <Dialog
        open={receiptViewerOpen}
        onClose={() => setReceiptViewerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: '24px',
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <FiPaperclip className="text-primary text-base" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-sm">
                Receipt: {activeReceiptTitle}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenReceiptInNewTab(activeReceiptUrl, activeReceiptTitle)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 hover:text-primary text-xs font-bold transition-colors cursor-pointer"
                title="Open in new tab / Download"
              >
                <FiExternalLink />
                <span>Open / Download</span>
              </button>
              <IconButton size="small" onClick={() => setReceiptViewerOpen(false)}>
                <FiX className="text-slate-400" />
              </IconButton>
            </div>
          </div>

          <div className="p-4 overflow-y-auto flex items-center justify-center min-h-[450px] bg-slate-100/50 dark:bg-slate-900/50">
            {isPdfUrl(activeReceiptUrl) ? (
              <iframe
                src={activeReceiptUrl}
                title="Receipt PDF"
                className="w-full h-[600px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white"
              />
            ) : (
              <img
                src={activeReceiptUrl}
                alt="Receipt Voucher"
                className="max-h-[600px] max-w-full rounded-2xl object-contain shadow-md border border-slate-200 dark:border-slate-700"
              />
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default DeclarationsTab;
