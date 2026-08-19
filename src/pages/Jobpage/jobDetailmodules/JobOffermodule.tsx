import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EmailIcon from '@mui/icons-material/Email';
import PublicIcon from '@mui/icons-material/Public';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../../apiPath';

interface JobOffermoduleProps {
  job: any;
  type: 'offer' | 'invoice' | string;
  onRefresh?: () => void;
}

const avatarColors = [
  'bg-purple-600 text-white',
  'bg-emerald-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-blue-600 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
];

const getAvatarBg = (index: number) => avatarColors[index % avatarColors.length];

const getInitials = (first?: string, last?: string, fallback?: string) => {
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (fallback) return String(fallback).slice(0, 2).toUpperCase();
  return 'CU';
};

const JobOffermodule: React.FC<JobOffermoduleProps> = ({ type, job, onRefresh }) => {
  const [offerData, setOfferData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc',
  });

  // Delete modal state
  const [selectedItemToDelete, setSelectedItemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (type === 'offer') {
      setOfferData(job?.offer || []);
    }
    if (type === 'invoice') {
      setOfferData(job?.invoice || []);
    }
  }, [job, type]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return String(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(date);
    }
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filtered & Sorted items
  const filteredData = useMemo(() => {
    if (!offerData || !Array.isArray(offerData)) return [];
    return offerData.filter((item) => {
      const num = String(item?.index || item?.invoiceNumber || item?._id || '').toLowerCase();
      const customerName = `${item?.customer?.firstName || job?.customer?.firstName || ''} ${item?.customer?.lastName || job?.customer?.lastName || ''
        }`.toLowerCase();
      const email = (item?.customer?.email || job?.customer?.email || '').toLowerCase();
      const status = (item?.Status || item?.status || '').toLowerCase();
      const total = String(item?.total ?? '').toLowerCase();
      const query = searchTerm.toLowerCase().trim();

      if (!query) return true;

      return (
        num.includes(query) ||
        customerName.includes(query) ||
        email.includes(query) ||
        status.includes(query) ||
        total.includes(query)
      );
    });
  }, [offerData, searchTerm, job]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'customer') {
        aVal = `${a?.customer?.firstName || job?.customer?.firstName || ''} ${a?.customer?.lastName || job?.customer?.lastName || ''
          }`;
        bVal = `${b?.customer?.firstName || job?.customer?.firstName || ''} ${b?.customer?.lastName || job?.customer?.lastName || ''
          }`;
      }

      if (sortConfig.key === 'index') {
        aVal = a?.index || a?._id || '';
        bVal = b?.index || b?._id || '';
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortConfig, job]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return sortedData.slice(start, start + entriesPerPage);
  }, [sortedData, currentPage, entriesPerPage]);

  // Delete Action
  const confirmDelete = async () => {
    if (!selectedItemToDelete?._id) return;
    setIsDeleting(true);
    try {
      if (type === 'invoice') {
        await axios.delete(`${apiPath}/invoice/deleteInvoice/${selectedItemToDelete._id}`);
      } else {
        await axios.delete(`${apiPath}/finance/deleteFinance/${selectedItemToDelete._id}`);
      }
      toast.success(`${type === 'offer' ? 'Quote' : 'Invoice'} deleted successfully!`);
      setOfferData((prev) => prev.filter((x) => x._id !== selectedItemToDelete._id));
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      toast.error(err.response?.data?.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
      setSelectedItemToDelete(null);
    }
  };

  const isOffer = type === 'offer';
  const title = isOffer ? 'Quotes & Proposals' : 'Invoices & Billing';




  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-6 font-sans text-slate-800 dark:text-white">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-strokedark">
        {/* Title and Icon */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs border border-emerald-100 dark:border-emerald-900/30">
            <ReceiptIcon fontSize="medium" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>

          </div>
        </div>

        {/* Right Search Bar & New Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative min-w-[220px] sm:min-w-[260px]">
            <SearchIcon
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 18 }}
            />
            <input
              type="text"
              placeholder={`Search ${isOffer ? 'quotes' : 'invoices'}, clients...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/70 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            />
          </div>


        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          {/* Table Head */}
          <thead className="bg-slate-50/90 dark:bg-slate-800/70 text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark tracking-wider">
            <tr>
              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-white transition-colors"
                onClick={() => handleSort('index')}
              >
                <div className="flex items-center gap-1">
                  <span>NUMBER</span>
                  <UnfoldMoreIcon style={{ fontSize: 14 }} />
                </div>
              </th>

              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-white transition-colors"
                onClick={() => handleSort('customer')}
              >
                <div className="flex items-center gap-1">
                  <span>NAME</span>
                  <UnfoldMoreIcon style={{ fontSize: 14 }} />
                </div>
              </th>

              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-white transition-colors"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center gap-1">
                  <span>EMAIL / DATE</span>
                  <UnfoldMoreIcon style={{ fontSize: 14 }} />
                </div>
              </th>

              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-white transition-colors"
                onClick={() => handleSort('total')}
              >
                <div className="flex items-center gap-1">
                  <span>CONTACT / AMOUNT</span>
                  <UnfoldMoreIcon style={{ fontSize: 14 }} />
                </div>
              </th>

              <th
                className="py-3.5 px-4 cursor-pointer select-none hover:text-slate-700 dark:hover:text-white transition-colors"
                onClick={() => handleSort('Status')}
              >
                <div className="flex items-center gap-1">
                  <span>COUNTRY / STATUS</span>
                  <UnfoldMoreIcon style={{ fontSize: 14 }} />
                </div>
              </th>

              <th className="py-3.5 px-4 text-center">ACTION</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, index) => {
                const customerObj = item?.customer || job?.customer || {};
                const firstName = customerObj.firstName || 'Customer';
                const lastName = customerObj.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const initials = getInitials(firstName, lastName, item?.index);
                const avatarBg = getAvatarBg(index);
                const formattedDate = formatDate(item?.createdAt || item?.date);
                const amount = item?.total !== undefined ? Number(item.total).toFixed(2) : '0.00';
                const statusText = item?.Status || item?.status || 'Draft';

                return (
                  <tr
                    key={item._id || index}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* NUMBER */}
                    <td className="py-4 px-4 font-black text-slate-800 dark:text-white whitespace-nowrap">
                      {item?.index ? `#${item.index}` : `#${String(item?._id || '').slice(-6).toUpperCase()}`}
                    </td>

                    {/* NAME with Initials Avatar */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-xs ${avatarBg}`}
                        >
                          {initials}
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white capitalize">
                          {fullName}
                        </span>
                      </div>
                    </td>

                    {/* EMAIL / DATE */}
                    <td className="py-4 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <EmailIcon style={{ fontSize: 16 }} className="text-slate-400" />
                        <span className="font-medium text-xs text-slate-600 dark:text-slate-300">
                          {formattedDate}
                        </span>
                      </div>
                    </td>

                    {/* CONTACT / AMOUNT */}
                    <td className="py-4 px-4 whitespace-nowrap font-black text-emerald-600 dark:text-emerald-400">
                      <span className="text-xs">€ {amount}</span>
                    </td>

                    {/* COUNTRY / STATUS */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-2xs">
                        <PublicIcon style={{ fontSize: 13 }} className="text-slate-400" />
                        <span>{statusText}</span>
                      </div>
                    </td>

                    {/* ACTION */}
                    <td className="py-4 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() =>
                            isOffer
                              ? navigate(`/offer-detail/${item?._id}`)
                              : navigate(`/invoice-detail/${item?._id}`)
                          }
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shadow-2xs"
                          title={`View ${isOffer ? 'Quote' : 'Invoice'} Details`}
                        >
                          <RemoveRedEyeIcon style={{ fontSize: 16 }} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedItemToDelete(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 transition-all cursor-pointer shadow-2xs"
                          title={`Delete ${isOffer ? 'Quote' : 'Invoice'}`}
                        >
                          <DeleteOutlineIcon style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <ReceiptIcon className="text-slate-300 dark:text-slate-600" style={{ fontSize: 36 }} />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      No {isOffer ? 'quotes' : 'invoices'} found
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {searchTerm
                        ? 'Try modifying your search query.'
                        : `No ${isOffer ? 'quotations' : 'invoices'} have been generated for this job yet.`}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-2">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.min((currentPage - 1) * entriesPerPage + 1, sortedData.length)}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * entriesPerPage, sortedData.length)}
            </span>{' '}
            of{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {sortedData.length}
            </span>{' '}
            entries
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-strokedark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <KeyboardArrowLeftIcon fontSize="small" />
            </button>
            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-strokedark text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <KeyboardArrowRightIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!selectedItemToDelete}
        onClose={() => setSelectedItemToDelete(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className:
            'rounded-2xl dark:bg-boxdark border border-slate-200 dark:border-strokedark shadow-2xl p-2',
        }}
      >
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-strokedark">
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white p-0">
              Delete {isOffer ? 'Quotation' : 'Invoice'}
            </DialogTitle>
            <IconButton
              size="small"
              onClick={() => setSelectedItemToDelete(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          <DialogContent className="p-0 text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to delete {isOffer ? 'quote' : 'invoice'}{' '}
            <strong className="text-slate-900 dark:text-white">
              #{selectedItemToDelete?.index || selectedItemToDelete?._id?.slice(-6)}
            </strong>
            ? This action cannot be undone.
          </DialogContent>

          <DialogActions className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-strokedark p-0">
            <button
              type="button"
              onClick={() => setSelectedItemToDelete(null)}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={confirmDelete}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </DialogActions>
        </div>
      </Dialog>
    </div>
  );
};

export default JobOffermodule;
