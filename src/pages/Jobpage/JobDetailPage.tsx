import React, { useContext, useEffect, useState, useMemo } from 'react';
import { UserContext } from '../../UserContext';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Button,
  Modal,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import NewJob from './NewJob';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Jobslider from './Jobslider';
import Loader from '../../common/Loader';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Address {
  city: string;
  postcode: string;
  country: string;
}

interface JobData {
  _id: string;
  date: string;
  customer: Customer;
  load: Address;
  unload: Address;
  status: string;
  index: string;
}

const JobDetailPage: React.FC<any> = ({ customerId, offer, invoice }) => {
  const [data, setData] = useState<JobData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<JobData | null>(null);
  const { role, userData, isAdmin } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';
  const params = new URLSearchParams(window.location.search);
  const value = [...params.keys()][0];

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });

  const handleAllJob = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${apiPath}/api/jobList?customer=${customerId || ''}&offer=${offer || ''}&invoice=${invoice || ''}`
      );
      setData(response.data?.jobList || []);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (selectedStaff) {
      try {
        const response = await axios.delete(
          `${apiPath}/api/job-schedule/${selectedStaff._id}`
        );
        if (response.status === 200) {
          handleAllJob();
          setSelectedStaff(null);
        }
      } catch (err) {
        console.error('Failed to delete job:', err);
      } finally {
        closeDeleteModal();
      }
    }
  };

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      const response = await axios.put(`${apiPath}/api/job-schedule/${jobId}`, {
        status: newStatus,
      });
      if (response.status === 200) {
        toast.success(`Job status updated to ${newStatus}`);
        handleAllJob();
        if (selectedStaff && selectedStaff._id === jobId) {
          setSelectedStaff((prev: any) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err: any) {
      console.error('Failed to update job status:', err);
      toast.error(err?.response?.data?.message || 'Failed to update job status');
    }
  };

  const getJobDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/jobs/${id}`);
      if (response.status === 200) {
        setSelectedStaff(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch job detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (value) {
      getJobDetail(value);
    }
  }, []);

  useEffect(() => {
    handleAllJob();
  }, [customerId, offer, invoice]);

  // Stat Metrics Calculations
  const stats = useMemo(() => {
    const totalJobs = data.length;
    const processingCount = data.filter(
      (item) =>
        (item.status || '').toLowerCase() === 'processing' ||
        (item.status || '').toLowerCase() === 'first contact'
    ).length;
    const executionCount = data.filter(
      (item) =>
        (item.status || '').toLowerCase() === 'execution' ||
        (item.status || '').toLowerCase() === 'in progress'
    ).length;
    const completedCount = data.filter(
      (item) => (item.status || '').toLowerCase() === 'completed'
    ).length;

    return { totalJobs, processingCount, executionCount, completedCount };
  }, [data]);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const clientName = `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.toLowerCase();
      const jobIndex = `${item.index || ''}`.toLowerCase();
      const status = (item.status || '').toLowerCase();
      const loadLoc = `${item.load?.city || ''} ${item.load?.country || ''}`.toLowerCase();
      const unloadLoc = `${item.unload?.city || ''} ${item.unload?.country || ''}`.toLowerCase();

      const matchesSearch =
        clientName.includes(searchTerm.toLowerCase()) ||
        jobIndex.includes(searchTerm.toLowerCase()) ||
        status.includes(searchTerm.toLowerCase()) ||
        loadLoc.includes(searchTerm.toLowerCase()) ||
        unloadLoc.includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || status.includes(statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal: any = a[sortConfig.key as keyof JobData];
        let bVal: any = b[sortConfig.key as keyof JobData];

        if (sortConfig.key === 'customer') {
          aVal = `${a.customer?.firstName || ''} ${a.customer?.lastName || ''}`;
          bVal = `${b.customer?.firstName || ''} ${b.customer?.lastName || ''}`;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return sortedData.slice(start, start + entriesPerPage);
  }, [sortedData, currentPage, entriesPerPage]);

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status = '') => {
    const s = status.toUpperCase();
    if (s === 'PENDING') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f59e0b' }}></span>
          PENDING
        </span>
      );
    }
    if (s === 'PROCESSING' || s === 'FIRST CONTACT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#8b5cf6' }}></span>
          PROCESSING
        </span>
      );
    }
    if (s === 'EXECUTION' || s === 'IN PROGRESS') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          EXECUTION
        </span>
      );
    }
    if (s === 'COMPLETED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] text-[#1d4ed8] dark:bg-blue/15 dark:text-blue border border-[#bfdbfe] dark:border-blue/30 shadow-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span>
          COMPLETED
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f43f5e' }}></span>
          CANCELLED
        </span>
      );
    }
    if (s === 'DRAFT') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#94a3b8' }}></span>
          DRAFT
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {s || 'PENDING'}
      </span>
    );
  };

  if (error) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/40">
        {error}
      </div>
    );
  }

  return (
    <div className="relative font-sans text-slate-800 dark:text-white w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 transition-colors">
      {loading && <Loader />}

      {!selectedStaff?._id ? (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
          {/* Header Banner & New Job Button */}
          {!customerId && !offer && !invoice && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-boxdark p-6 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
                  <LocalShippingIcon className="text-primary" />
                  Logistics & Freight Jobs
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Monitor transport schedules, load/unload locations, and execution statuses
                </p>
              </div>

              {/* Keeps NewJob component popup unchanged */}
              {isUserAdmin && (
                <div>
                  <NewJob handler={handleAllJob} />
                </div>
              )}
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-primary flex items-center justify-center font-bold">
                <WorkIcon />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Jobs
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {stats.totalJobs}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <HourglassEmptyIcon />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Processing Jobs
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {stats.processingCount}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <LocalShippingIcon />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  In Execution
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {stats.executionCount}
                </h3>
              </div>
            </div>

            <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircleOutlineIcon />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Completed Jobs
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {stats.completedCount}
                </h3>
              </div>
            </div>
          </div>

          {/* Main Table Card Container */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden">
            {/* Control Bar: Search & Status Filters */}
            <div className="p-4 md:p-5 border-b border-slate-200 dark:border-strokedark flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-meta-4/30">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fontSize="small" />
                <input
                  type="text"
                  placeholder="Search by client, city, country, or status..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {['ALL', 'PENDING', 'PROCESSING', 'EXECUTION', 'COMPLETED', 'CANCELLED', 'DRAFT'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      setCurrentPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-strokedark hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-strokedark bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                    <th
                      onClick={() => handleSort('customer')}
                      className="py-3.5 px-5 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Client Name</span>
                        <UnfoldMoreIcon fontSize="inherit" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('date')}
                      className="py-3.5 px-5 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Date</span>
                        <UnfoldMoreIcon fontSize="inherit" />
                      </div>
                    </th>
                    <th className="py-3.5 px-5">From / To Route</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-strokedark text-sm font-medium">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => {
                      const clientFullName = `${item.customer?.firstName || 'Unknown'} ${item.customer?.lastName || ''}`.trim();
                      const initials = clientFullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2) || 'J';

                      const dateStr = item?.date
                        ? new Date(item.date).toISOString().split('T')[0]
                        : 'N/A';

                      return (
                        <tr
                          key={item._id}
                          onClick={() => getJobDetail(item._id)}
                          className="hover:bg-slate-50/80 dark:hover:bg-meta-4/30 transition-colors group cursor-pointer"
                        >
                          {/* Client & Avatar */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                                {initials}
                              </div>
                              <div>
                                <span className="block font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                  {clientFullName}
                                </span>
                                {item.index && (
                                  <span className="inline-block text-[11px] font-mono text-slate-400 font-semibold mt-0.5">
                                    #{item.index}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-5 text-slate-600 dark:text-slate-300 font-mono text-xs">
                            {dateStr}
                          </td>

                          {/* From / To Route */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <LocationOnIcon style={{ fontSize: 13 }} className="text-slate-400" />
                                {item?.load?.city || 'N/A'} {item?.load?.country || ''}
                              </span>
                              <ArrowForwardIcon style={{ fontSize: 15 }} className="text-slate-400" />
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                <LocationOnIcon style={{ fontSize: 13 }} className="text-slate-400" />
                                {item?.unload?.city || 'N/A'} {item?.unload?.country || ''}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-5">
                            {getStatusBadge(item.status)}
                          </td>

                          {/* Action */}
                          <td className="py-4 px-5 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                getJobDetail(item._id);
                              }}
                              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-all"
                            >
                              <span>View Job</span>
                              <ArrowForwardIcon style={{ fontSize: 14 }} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 dark:text-slate-500">
                        <p className="text-base font-semibold">No jobs found matching criteria</p>
                        <p className="text-xs mt-1">Try clearing your search query or filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer / Pagination */}
            <div className="p-4 border-t border-slate-200 dark:border-strokedark flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-meta-4/30">
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>Show</span>
                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark rounded-lg px-2 py-1 font-semibold focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries per page (Total {sortedData.length})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <KeyboardArrowLeftIcon fontSize="small" />
                </button>
                <span className="text-xs font-bold px-3 text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  <KeyboardArrowRightIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-boxdark p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-strokedark w-full max-w-md focus:outline-none">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <DeleteIcon fontSize="small" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Confirm Delete Job
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <IconButton onClick={closeDeleteModal} size="small" className="text-slate-400">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>

              <div className="py-4 text-sm text-slate-600 dark:text-slate-300">
                Are you sure you want to delete job for client{' '}
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedStaff?.customer?.firstName} {selectedStaff?.customer?.lastName}
                </span>
                ?
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
                >
                  Delete Job
                </button>
              </div>
            </Box>
          </Modal>
        </div>
      ) : (
        /* Job Detail Drawer (Jobslider) Overlay */
        <div className="relative h-full w-full bg-white dark:bg-boxdark overflow-auto">
          <Jobslider
            handler={handleAllJob}
            Ondelete={openDeleteModal}
            job={selectedStaff}
            onClose={() => setSelectedStaff(null)}
          />
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
