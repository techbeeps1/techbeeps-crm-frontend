import React, { useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Modal,
  Box,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import { UserContext } from '../../UserContext';
import { useCurrency } from '../../utils/currencyUtil';

const QuoteList = ({ customerId }) => {
  const { symbol: currencySymbol, formatCurrency } = useCurrency();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'index', direction: 'desc' });

  const navigate = useNavigate();
  const { role, userData, isAdmin } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const handleAllInvoice = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${apiPath}/finance/financeList?customer=${customerId || ''}`
      );
      setData(response.data?.financeData || []);
    } catch (err) {
      setError('Failed to fetch offers. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAllInvoice();
  }, [customerId]);

  const handleClick = (event, item) => {
    event.stopPropagation();
    setSelectedAgent(item);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedAgent(null);
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedAgent) return;
    try {
      const response = await axios.delete(
        `${apiPath}/finance/deleteFinance/${selectedAgent._id}`
      );
      if (response.status === 200) {
        toast.success('Offer deleted successfully!');
        handleAllInvoice();
      }
    } catch (err) {
      console.error('Failed to delete offer:', err);
      toast.error('Failed to delete offer');
    } finally {
      closeDeleteModal();
    }
  };

  // Stat metrics computation
  const stats = useMemo(() => {
    const totalOffers = data.length;
    const acceptedCount = data.filter(
      (item) => (item.Status || '').toLowerCase() === 'accepted'
    ).length;
    const draftCount = data.filter(
      (item) => (item.Status || '').toLowerCase() === 'draft' || (item.Status || '').toLowerCase() === 'pending'
    ).length;
    const totalValue = data.reduce((acc, item) => acc + (parseFloat(item.total) || 0), 0);

    return { totalOffers, acceptedCount, draftCount, totalValue };
  }, [data]);

  // Filtering & Sorting
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const clientName = `${item.customer?.firstName || ''} ${item.customer?.lastName || ''}`.toLowerCase();
      const offerIndex = `${item.index || ''}`.toLowerCase();
      const status = (item.Status || '').toLowerCase();
      const totalStr = `${item.total || ''}`;

      const matchesSearch =
        clientName.includes(searchTerm.toLowerCase()) ||
        offerIndex.includes(searchTerm.toLowerCase()) ||
        status.includes(searchTerm.toLowerCase()) ||
        totalStr.includes(searchTerm);

      const matchesStatus =
        statusFilter === 'ALL' || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

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

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getStatusBadge = (status = '') => {
    const s = status.toLowerCase();
    if (s === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Accepted
        </span>
      );
    }
    if (s === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/80 dark:border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          Sent
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/80 dark:border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Pending
        </span>
      );
    }
    if (s === 'declined') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/80 dark:border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Declined
        </span>
      );
    }
    // Draft or default
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {status || 'Draft'}
      </span>
    );
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="p-6 text-center text-rose-500 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-200 dark:border-rose-900/40">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & New Offer Action */}
      {!customerId && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-boxdark p-6 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RequestQuoteIcon className="text-primary" />
              Offers & Quotations
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage, send, and track customer quotation proposals
            </p>
          </div>
          {isUserAdmin && (
            <button
              onClick={() => navigate('/new_offer')}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <AddIcon fontSize="small" />
              <span>New Offer</span>
            </button>
          )}
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-primary flex items-center justify-center font-bold">
            <RequestQuoteIcon />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Offers
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.totalOffers}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
            {currencySymbol || <AttachMoneyIcon />}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Proposals Value
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(stats.totalValue)}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircleOutlineIcon />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Accepted Proposals
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.acceptedCount}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <HourglassEmptyIcon />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Draft / Pending
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {stats.draftCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Table Card Container */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden">
        {/* Controls Bar: Search & Status Filter */}
        <div className="p-4 md:p-5 border-b border-slate-200 dark:border-strokedark flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-50/50 dark:bg-meta-4/30">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" fontSize="small" />
            <input
              type="text"
              placeholder="Search by offer #, client, or status..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          {/* Status Filter Tabs / Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['ALL', 'DRAFT', 'PENDING', 'SENT', 'ACCEPTED', 'DECLINED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
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

        {/* Offers Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-strokedark bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('index')}
                  className="py-3.5 px-5 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Offer #</span>
                    <UnfoldMoreIcon fontSize="inherit" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('customer')}
                  className="py-3.5 px-5 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Client</span>
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
                <th
                  onClick={() => handleSort('total')}
                  className="py-3.5 px-5 cursor-pointer hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Total Amount</span>
                    <UnfoldMoreIcon fontSize="inherit" />
                  </div>
                </th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-strokedark text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((item) => {
                  const clientFullName = `${item.customer?.firstName || 'Unknown'} ${item.customer?.lastName || ''}`.trim();
                  const initials = clientFullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'C';

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-meta-4/30 transition-colors group cursor-pointer"
                      onClick={() => navigate(`/offer-detail/${item._id}`)}
                    >
                      {/* Number */}
                      <td className="py-4 px-5 font-mono font-bold text-primary dark:text-blue-400 group-hover:underline">
                        # {item.index || 'N/A'}
                      </td>

                      {/* Client */}
                      <td className="py-4 px-5 font-medium text-slate-900 dark:text-white capitalize">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary dark:bg-primary/20 flex items-center justify-center text-xs font-bold">
                            {initials}
                          </div>
                          <div>
                            <span className="block font-semibold">{clientFullName}</span>
                            {item.customer?.email && (
                              <span className="block text-xs text-slate-400 font-normal">
                                {item.customer.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                        {item.date ? new Date(item.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Total */}
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(item.total || 0)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        {getStatusBadge(item.Status)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 px-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          size="small"
                          onClick={(e) => handleClick(e, item)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <p className="text-base font-medium">No offers found matching your criteria</p>
                    <p className="text-xs mt-1">Try clearing your search terms or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Action Menu Popover */}
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 3,
            className: 'rounded-xl shadow-lg border border-slate-200 dark:border-strokedark dark:bg-boxdark py-1 min-w-[150px]'
          }}
        >
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (selectedAgent) navigate(`/offer-detail/${selectedAgent._id}`);
              handleClose();
            }}
            className="text-sm font-medium gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-meta-4"
          >
            <VisibilityIcon fontSize="small" className="text-blue-500" /> View Details
          </MenuItem>
          {isUserAdmin && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (selectedAgent) navigate(`/offer/${selectedAgent._id}`);
                handleClose();
              }}
              className="text-sm font-medium gap-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-meta-4"
            >
              <EditIcon fontSize="small" className="text-amber-500" /> Edit Offer
            </MenuItem>
          )}
          {isUserAdmin && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
                openDeleteModal();
              }}
              className="text-sm font-medium gap-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <DeleteIcon fontSize="small" /> Delete
            </MenuItem>
          )}
        </Menu>

        {/* Table Footer: Entries per page & Pagination Controls */}
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
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </button>
            <span className="text-xs font-semibold px-3 text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </button>
          </div>
        </div>
      </div>

      {/* Modern Delete Confirmation Dialog */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-boxdark p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-strokedark w-full max-w-md focus:outline-none">
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <DeleteIcon fontSize="small" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete Offer Proposal
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

          <div className="py-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to permanently delete offer proposal{' '}
              <span className="font-bold text-slate-900 dark:text-white">
                #{selectedAgent?.index}
              </span>
              {selectedAgent?.customer && (
                <> for client <span className="font-semibold">{selectedAgent.customer.firstName} {selectedAgent.customer.lastName}</span></>
              )}?
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="px-4 py-2 text-sm font-medium rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all"
            >
              Delete Offer
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default QuoteList;
