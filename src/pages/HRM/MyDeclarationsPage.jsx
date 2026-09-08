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
  FiCreditCard,
  FiPlus,
  FiRefreshCw,
  FiPaperclip,
  FiExternalLink,
  FiX,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiInfo,
  FiAlertCircle,
  FiNavigation,
  FiDroplet,
  FiCoffee,
  FiPackage,
  FiTool,
  FiHome,
  FiMapPin,
  FiEye,
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

const MyDeclarationsPage = () => {
  const { symbol: currencySymbol } = useCurrency();
  const { userData, id, username, role } = useContext(UserContext) || {};
  const currentUserId = userData?.userId || userData?._id || id;

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
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedDeclarationForEdit, setSelectedDeclarationForEdit] = useState(null);
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState('');
  const [activeReceiptTitle, setActiveReceiptTitle] = useState('');

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

  // Fetch logged in user's declarations
  const fetchMyDeclarations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = {};
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
      console.error('Error fetching my declarations:', err);
      toast.error('Failed to load your declarations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDeclarations();
  }, [statusFilter, categoryFilter, searchTerm]);

  // Cancel/Delete personal pending claim
  const handleDeletePersonalClaim = async (claimId) => {
    if (!window.confirm('Are you sure you want to cancel this pending declaration?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.delete(`${apiPath}/api/declarations/${claimId}`, { headers });
      if (res.data?.success) {
        toast.success('Declaration cancelled successfully');
        fetchMyDeclarations();
      }
    } catch (err) {
      console.error('Error deleting declaration:', err);
      toast.error(err.response?.data?.message || 'Failed to delete declaration');
    }
  };

  return (
    <div className="w-full space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center text-2xl shadow-md shadow-primary/25">
            <FiFileText />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              My Declarations & Expense Claims
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Submit expense receipts, mileage declarations, and track reimbursement status.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedDeclarationForEdit(null);
            setApplyModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer shrink-0"
        >
          <FiPlus className="text-sm" />
          <span>New Declaration</span>
        </button>
      </div>

      {/* 2. PERSONAL KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Submitted */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Submitted
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-primary flex items-center justify-center text-lg">
              <FiDollarSign />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(summary.totalDeclaredAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{summary.totalCount} Total Claims Lodged</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <FiClock />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(summary.pendingAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-600/80 dark:text-amber-400/80 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{summary.pendingCount} Claims Awaiting Approval</span>
          </div>
        </div>

        {/* Approved Claims */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <FiCheckCircle />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.approvedAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600/80 dark:text-emerald-400/80 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{summary.approvedCount} Claims Approved</span>
          </div>
        </div>

        {/* Paid / Reimbursed */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Reimbursed / Paid
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              <FiCreditCard />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(summary.paidAmount)}
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-600/80 dark:text-purple-400/80 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <span>{summary.paidCount} Claims Settled</span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR & CONTROLS */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Status Filters */}
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

        {/* Search & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search my claims..."
            className="w-full sm:w-60 px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
          />

          <button
            type="button"
            onClick={fetchMyDeclarations}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
            title="Refresh"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4. DECLARATIONS LIST TABLE */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            My Declaration History ({declarations.length})
          </h3>
          <span className="text-xs text-slate-400">Personal expense logs</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <FiRefreshCw className="animate-spin text-2xl text-primary" />
            <p className="text-xs font-medium">Loading your declarations...</p>
          </div>
        ) : declarations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiFileText className="text-4xl mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No declaration claims found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You have not submitted any declarations matching the selected filter. Click "+ New Declaration" to submit a claim.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-3">Category & Claim Title</th>
                  <th className="py-3 px-3">Associated Job</th>
                  <th className="py-3 px-3">Details / Distance</th>
                  <th className="py-3 px-3 text-right">Claim Amount</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {declarations.map((decl) => {
                  const catBadge = getCategoryBadge(decl.declarationType);
                  return (
                    <tr
                      key={decl._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        {formatDate(decl.date)}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="space-y-1 max-w-[240px]">
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
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                            {decl.title}
                          </p>
                          {decl.description && (
                            <p className="text-[11px] text-slate-400 truncate" title={decl.description}>
                              {decl.description}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {decl.jobIndex ? (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block">
                            Job: {decl.jobIndex}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">General Claim</span>
                        )}
                      </td>

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
                          <span className="text-[11px] text-slate-400 italic">Direct Expense</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(decl.amount || 0)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        {decl.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReceiptUrl(decl.receiptUrl);
                              setActiveReceiptTitle(decl.title);
                              setReceiptViewerOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-700 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <FiPaperclip className="text-xs" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                            decl.status
                          )}`}
                        >
                          {decl.status}
                        </span>
                        {decl.reviewerComment && (
                          <span
                            className="text-[9px] text-slate-400 block mt-0.5 truncate max-w-[130px]"
                            title={decl.reviewerComment}
                          >
                            {decl.reviewerComment}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {decl.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDeclarationForEdit(decl);
                                setApplyModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                              title="Edit Claim"
                            >
                              <FiEdit2 className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePersonalClaim(decl._id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Cancel Request"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDeclarationForEdit(decl);
                                setApplyModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-primary transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                              title={`View Details (${decl.status} - Read Only)`}
                            >
                              <FiEye className="text-xs" />
                              <span className="text-[10px] text-slate-400">View</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Submit / Edit Modal */}
      <ApplyDeclarationModal
        open={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setSelectedDeclarationForEdit(null);
        }}
        onSuccess={() => {
          fetchMyDeclarations();
        }}
        defaultEmployeeId={currentUserId}
        initialData={selectedDeclarationForEdit}
      />

      {/* MODAL 2: Receipt Preview Modal */}
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

export default MyDeclarationsPage;
