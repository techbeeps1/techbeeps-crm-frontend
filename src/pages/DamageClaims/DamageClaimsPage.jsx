import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  FiAlertTriangle,
  FiFileText,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiCreditCard,
  FiXCircle,
  FiPlus,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPaperclip,
  FiSliders,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import CreateClaimModal from './CreateClaimModal';
import ClaimDetailModal from './ClaimDetailModal';
import SettlementActionModal from './SettlementActionModal';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Reported':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Under Review':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Inspection Scheduled':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Approved':
    case 'Partially Approved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Settled':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Closed':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return 'N/A';
  }
};

export default function DamageClaimsPage() {
  const { symbol: currencySymbol } = useCurrency();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalClaimsCount: 0,
    totalClaimedAmount: 0,
    totalApprovedAmount: 0,
    totalSettledAmount: 0,
    activeReviewCount: 0,
    reportedCount: 0,
    underReviewCount: 0,
    approvedCount: 0,
    settledCount: 0,
    rejectedCount: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [datePreset, setDatePreset] = useState('this-month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedClaimForEdit, setSelectedClaimForEdit] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClaimForDetail, setSelectedClaimForDetail] = useState(null);

  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [selectedClaimForSettlement, setSelectedClaimForSettlement] = useState(null);

  // Date Range calculation
  const dateRange = useMemo(() => {
    const now = new Date();
    if (datePreset === 'today') {
      const s = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
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

  // Fetch Claims
  const fetchClaims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = {};
      if (dateRange.start && dateRange.end) {
        params.startDate = dateRange.start;
        params.endDate = dateRange.end;
      }
      if (statusFilter && statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (stageFilter && stageFilter !== 'All') {
        params.incidentStage = stageFilter;
      }
      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const res = await axios.get(`${apiPath}/api/damage-claims`, {
        headers,
        params,
      });

      if (res.data?.success) {
        setClaims(res.data.data || []);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching damage claims:', err);
      toast.error('Failed to load damage claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [dateRange, statusFilter, stageFilter, searchTerm]);

  // Delete Claim
  const handleDeleteClaim = async (id, claimNum) => {
    if (
      !window.confirm(
        `Are you sure you want to delete damage claim ${claimNum || ''}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`${apiPath}/api/damage-claims/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.data?.success) {
        toast.success(`Claim ${claimNum || ''} deleted`);
        fetchClaims();
      }
    } catch (err) {
      console.error('Error deleting claim:', err);
      toast.error(err.response?.data?.message || 'Failed to delete claim');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const token = localStorage.getItem('token');
    const url = `${apiPath}/api/damage-claims/export/csv${
      token ? `?token=${token}` : ''
    }`;
    window.open(url, '_blank');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* 1. TOP HEADER & KPI METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <FiAlertTriangle />
            </span>
            <span>Damage Claims & Settlement</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Investigate relocation damage reports, manage itemized valuations, and process claim settlements
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedClaimForEdit(null);
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all cursor-pointer active:scale-95"
          >
            <FiPlus className="text-sm" />
            <span>+ Report Damage Claim</span>
          </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Claims */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shrink-0">
            <FiFileText />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Claims
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {summary.totalClaimsCount}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {formatCurrency(summary.totalClaimedAmount)} Claimed
            </span>
          </div>
        </div>

        {/* Under Review */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl shrink-0">
            <FiClock />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Under Review / Active
            </span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">
              {summary.activeReviewCount}
            </span>
            <span className="text-[11px] text-amber-600/80 dark:text-amber-400/80 block mt-0.5 font-bold">
              Pending Assessment
            </span>
          </div>
        </div>

        {/* Approved Settlements */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shrink-0">
            <FiCheckCircle />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Approved Claims
            </span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary.totalApprovedAmount)}
            </span>
            <span className="text-[11px] text-emerald-600/80 block mt-0.5 font-bold">
              {summary.approvedCount} Claims Approved
            </span>
          </div>
        </div>

        {/* Settled / Disbursed */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center text-xl shrink-0">
            <FiCreditCard />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Settled & Paid
            </span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">
              {formatCurrency(summary.totalSettledAmount)}
            </span>
            <span className="text-[11px] text-teal-600/80 block mt-0.5 font-bold">
              {summary.settledCount} Settlements Paid
            </span>
          </div>
        </div>

        {/* Rejected Claims */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center text-xl shrink-0">
            <FiXCircle />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Declined / Rejected
            </span>
            <span className="text-xl font-black text-rose-600 dark:text-rose-400">
              {summary.rejectedCount}
            </span>
            <span className="text-[11px] text-rose-600/80 block mt-0.5 font-bold">
              Uncovered / Declined
            </span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR & FILTER CONTROLS */}
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
            {['All', 'Reported', 'Under Review', 'Approved', 'Settled', 'Rejected'].map(
              (st) => (
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
              )
            )}
          </div>
        </div>

        {/* Secondary Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Incident Stage Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
              Move Stage:
            </span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
            >
              <option value="All">All Move Stages</option>
              <option value="Pre-Move / Packing">Pre-Move / Packing</option>
              <option value="Loading / In-Transit">Loading / In-Transit</option>
              <option value="Unloading / Delivery">Unloading / Delivery</option>
              <option value="Storage / Warehouse">Storage / Warehouse</option>
              <option value="Assembly / Handyman">Assembly / Handyman</option>
            </select>
          </div>

          {/* Search Input & Refresh Button */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search claims, customer, job..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
              />
            </div>

            <button
              type="button"
              onClick={fetchClaims}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
              title="Refresh Claims"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. CLAIMS MASTER DATA TABLE */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Damage Claims Register ({claims.length})
          </h3>
          <span className="text-xs text-slate-400">Incident and Settlement logs</span>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <FiRefreshCw className="animate-spin text-2xl text-primary" />
            <p className="text-xs font-medium">Loading damage claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FiAlertTriangle className="text-4xl mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No damage claims found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              There are no claims matching your selected filters. Click "+ Report Damage Claim" to log a new incident.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Claim # & Date</th>
                  <th className="py-3 px-3">Customer & Contact</th>
                  <th className="py-3 px-3">Associated Job</th>
                  <th className="py-3 px-3">Stage & Location</th>
                  <th className="py-3 px-3">Damaged Items</th>
                  <th className="py-3 px-3 text-right">Claimed ({currencySymbol})</th>
                  <th className="py-3 px-3 text-right">Settlement ({currencySymbol})</th>
                  <th className="py-3 px-3 text-center">Photos</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {claims.map((claim) => {
                  const photoCount = (claim.items || []).reduce(
                    (count, it) => count + (it.evidencePhotos?.length || 0),
                    0
                  );

                  return (
                    <tr
                      key={claim._id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* 1. Claim # & Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 dark:text-white block">
                          {claim.claimNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDate(claim.incidentDate)}
                        </span>
                      </td>

                      {/* 2. Customer & Contact */}
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {claim.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                          {claim.customerPhone || claim.customerEmail || 'No contact'}
                        </span>
                      </td>

                      {/* 3. Job Reference */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {claim.jobIndex || claim.jobId?.index ? (
                          <span className="inline-block px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                            Job: {claim.jobIndex || claim.jobId?.index}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">General Move</span>
                        )}
                      </td>

                      {/* 4. Stage & Location */}
                      <td className="py-3.5 px-3">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-bold block">
                          {claim.incidentStage}
                        </span>
                        {claim.incidentLocation && (
                          <span className="text-[10px] text-slate-400 truncate block max-w-[140px]">
                            {claim.incidentLocation}
                          </span>
                        )}
                      </td>

                      {/* 5. Damaged Items */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-0.5 max-w-[180px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">
                            {claim.items?.[0]?.itemName || 'Damaged Item'}
                            {claim.items?.length > 1 && ` (+${claim.items.length - 1} more)`}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {claim.items?.length || 0} item(s) affected
                          </span>
                        </div>
                      </td>

                      {/* 6. Claimed Amount */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatCurrency(claim.totalClaimedAmount || 0)}
                        </span>
                      </td>

                      {/* 7. Approved Settlement Amount */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        {claim.totalApprovedAmount > 0 ? (
                          <div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                              {formatCurrency(claim.netSettlementAmount || claim.totalApprovedAmount)}
                            </span>
                            {claim.deductibleApplied > 0 && (
                              <span className="text-[9px] text-slate-400 block">
                                Deductible: {formatCurrency(claim.deductibleApplied)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Pending</span>
                        )}
                      </td>

                      {/* 8. Photos Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        {photoCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                            <FiPaperclip className="text-xs text-primary" />
                            <span>{photoCount}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* 9. Status Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClaimForSettlement(claim);
                            setSettlementModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border cursor-pointer hover:ring-2 hover:ring-primary/30 hover:scale-105 transition-all shadow-2xs ${getStatusBadge(
                            claim.status
                          )}`}
                          title="Click to manage status / settlement"
                        >
                          <span>{claim.status}</span>
                          <FiSliders className="text-[9px] opacity-70" />
                        </button>
                      </td>

                      {/* 10. Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Inspect / View */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimForDetail(claim);
                              setDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors cursor-pointer"
                            title="Inspect Claim Details"
                          >
                            <FiEye className="text-xs" />
                          </button>

                          {/* Settlement / Decision */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimForSettlement(claim);
                              setSettlementModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
                            title="Manage Settlement"
                          >
                            <FiSliders className="text-xs" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClaimForEdit(claim);
                              setCreateModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
                            title="Edit Claim"
                          >
                            <FiEdit2 className="text-xs" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteClaim(claim._id, claim.claimNumber)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Claim"
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

      {/* Modal 1: Create / Edit Claim Modal */}
      <CreateClaimModal
        open={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedClaimForEdit(null);
        }}
        onSuccess={fetchClaims}
        initialData={selectedClaimForEdit}
      />

      {/* Modal 2: Claim Detail Inspector Modal */}
      <ClaimDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedClaimForDetail(null);
        }}
        claim={selectedClaimForDetail}
        onOpenSettlementModal={(c) => {
          setSelectedClaimForSettlement(c);
          setSettlementModalOpen(true);
        }}
        onEditClaim={(c) => {
          setSelectedClaimForEdit(c);
          setCreateModalOpen(true);
        }}
      />

      {/* Modal 3: Status & Settlement Workflow Modal */}
      <SettlementActionModal
        open={settlementModalOpen}
        onClose={() => {
          setSettlementModalOpen(false);
          setSelectedClaimForSettlement(null);
        }}
        claim={selectedClaimForSettlement}
        onSuccess={fetchClaims}
      />
    </div>
  );
}
