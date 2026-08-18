import React, { useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Modal,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { UserContext } from '../../UserContext';
import { useNavigate } from 'react-router-dom';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import { 
  MdReceiptLong, 
  MdAdd, 
  MdWarningAmber,
} from 'react-icons/md';

const avatarColors = [
  'bg-purple-600 text-white',
  'bg-emerald-600 text-white',
  'bg-blue-600 text-white',
  'bg-amber-600 text-white',
  'bg-rose-600 text-white',
  'bg-teal-600 text-white',
  'bg-indigo-600 text-white',
];

const getAvatarBg = (index) => avatarColors[index % avatarColors.length];

const getInitials = (first, last, fallback) => {
  if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (fallback) return String(fallback).slice(0, 2).toUpperCase();
  return 'IN';
};

const InvoiceList = ({ customerId }) => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search, Sorting, and Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'index', direction: 'desc' });

  let navigate = useNavigate();
  const { id } = useContext(UserContext);

  const handleAllInvoice = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/invoice/invoiceList?customer=${customerId || ''}`,
      );
      const data = response['data']?.invoiceData || [];
      setInvoiceData(data);
    } catch (err) {
      setError('Failed to fetch invoices. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedAgent(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedAgent(null);
  };

  const confirmDelete = async () => {
    try {
      if (!selectedAgent || !selectedAgent._id) {
        console.error('No selected invoice to delete');
        return;
      }
      setIsDeleting(true);
      const response = await axios.delete(
        `${apiPath}/invoice/deleteInvoice/${selectedAgent._id}`,
      );
      if (response.status === 200) {
        toast.success('Invoice deleted successfully!');
        handleAllInvoice();
      }
    } catch (err) {
      console.error('Failed to delete invoice:', err);
      toast.error('Failed to delete invoice');
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  useEffect(() => {
    handleAllInvoice();
  }, [customerId]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filtered and Sorted Invoices
  const filteredData = useMemo(() => {
    if (!invoiceData || !Array.isArray(invoiceData)) return [];
    return invoiceData.filter((item) => {
      const num = String(item?.index || item?.invoiceNumber || '').toLowerCase();
      const clientName = `${item?.customer?.firstName || ''} ${item?.customer?.lastName || ''}`.toLowerCase();
      const email = (item?.customer?.email || '').toLowerCase();
      const contact = (item?.customer?.contact || item?.customer?.mobile || '').toLowerCase();
      const country = (item?.customer?.address?.[0]?.country || '').toLowerCase();
      const status = (item?.Status || '').toLowerCase();
      const total = String(item?.total || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      return (
        num.includes(query) ||
        clientName.includes(query) ||
        email.includes(query) ||
        contact.includes(query) ||
        country.includes(query) ||
        status.includes(query) ||
        total.includes(query)
      );
    });
  }, [invoiceData, searchTerm]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (!sortConfig.key) return sorted;

    sorted.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortConfig.key === 'index') {
        valA = a?.index || 0;
        valB = b?.index || 0;
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      } else if (sortConfig.key === 'name') {
        valA = a?.customer?.firstName ? `${a.customer.firstName} ${a.customer.lastName || ''}` : '';
        valB = b?.customer?.firstName ? `${b.customer.firstName} ${b.customer.lastName || ''}` : '';
      } else if (sortConfig.key === 'email') {
        valA = a?.customer?.email || '';
        valB = b?.customer?.email || '';
      } else if (sortConfig.key === 'contact') {
        valA = Number(a?.total || 0);
        valB = Number(b?.total || 0);
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      } else if (sortConfig.key === 'country') {
        valA = a?.customer?.address?.[0]?.country || a?.Status || '';
        valB = b?.customer?.address?.[0]?.country || b?.Status || '';
      }

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * entriesPerPage;
    return sortedData.slice(startIndex, startIndex + entriesPerPage);
  }, [sortedData, currentPage, entriesPerPage]);

  if (loading && invoiceData.length === 0) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto py-8 px-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 inline-block text-xs font-semibold">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-2 px-1 sm:px-2 space-y-6">
      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MdReceiptLong className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Invoices & Billing</h2>
              <p className="text-xs text-slate-500">Manage billing statements, invoices, and payments</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
              <input
                type="text"
                placeholder="Search invoices, clients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
              />
            </div>

            {!customerId && (
              <button
                onClick={() => navigate('/newinvoice')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <MdAdd className="w-4 h-4" />
                <span>New Invoice</span>
              </button>
            )}
          </div>
        </div>

        {/* Table View matching exact design */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 select-none">
                <th
                  onClick={() => handleSort('index')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>NUMBER</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>NAME</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>EMAIL</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('contact')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>CONTACT</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('country')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>COUNTRY</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => {
                  const initials = getInitials(
                    item?.customer?.firstName,
                    item?.customer?.lastName,
                    item?.index || 'INV'
                  );
                  const avatarBg = getAvatarBg(index);
                  const countryName = item?.customer?.address?.[0]?.country || 
                    item?.customer?.city || 
                    (item?.Status ? `${item.Status}` : 'India');

                  return (
                    <tr
                      key={item._id || index}
                      onClick={() => navigate(`/invoice-detail/${item._id}`)}
                      className="group hover:bg-indigo-50/40 transition-colors cursor-pointer"
                    >
                      {/* NUMBER */}
                      <td className="py-3.5 px-4 font-semibold text-xs text-slate-500">
                        #{item?.index || index + 1}
                      </td>

                      {/* NAME with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${avatarBg}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 group-hover:text-primary transition-colors capitalize">
                              {item.customer 
                                ? `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim() 
                                : `Invoice #${item?.index || ''}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {item?.customer?.email ? (
                          <div className="flex items-center gap-2">
                            <EmailIcon style={{ fontSize: 16 }} className="text-slate-400" />
                            <span className="truncate max-w-[180px]">{item.customer.email}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                            <EmailIcon style={{ fontSize: 16 }} className="text-slate-300" />
                            <span>{item?.date ? new Date(item.date).toLocaleDateString('en-GB') : 'No email'}</span>
                          </div>
                        )}
                      </td>

                      {/* CONTACT / AMOUNT */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {item?.customer?.contact || item?.customer?.mobile ? (
                          <div className="flex items-center gap-2">
                            <PhoneIcon style={{ fontSize: 16 }} className="text-slate-400" />
                            <span>{item?.customer?.contact || item?.customer?.mobile}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                            <AttachMoneyIcon style={{ fontSize: 16 }} className="text-emerald-500 -mr-1" />
                            <span>{Number(item.total || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </td>

                      {/* COUNTRY / STATUS */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          <PublicIcon style={{ fontSize: 14 }} className="text-slate-400" />
                          <span>{countryName}</span>
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/invoice-detail/${item._id}`)}
                            title="View Details"
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
                          >
                            <RemoveRedEyeIcon style={{ fontSize: 18 }} />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(item);
                            }}
                            title="Delete Invoice"
                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm cursor-pointer"
                          >
                            <DeleteIcon style={{ fontSize: 18 }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No invoices found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {sortedData.length > entriesPerPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, sortedData.length)} of {sortedData.length} entries
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <KeyboardArrowLeftIcon style={{ fontSize: 18 }} />
              </button>
              <span className="px-2.5 font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <KeyboardArrowRightIcon style={{ fontSize: 18 }} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Delete Confirmation Dialog */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDeleteModal}></div>

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 z-10">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <MdWarningAmber className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 text-center mb-1">
              Confirm Deletion
            </h3>
            <p className="text-xs text-slate-500 text-center mb-6">
              Are you sure you want to delete invoice <span className="font-bold text-slate-800">#{selectedAgent?.index}</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default InvoiceList;
