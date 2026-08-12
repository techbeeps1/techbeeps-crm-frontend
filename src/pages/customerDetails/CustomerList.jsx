import React, { useEffect, useState, useMemo } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PublicIcon from '@mui/icons-material/Public';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { useNavigate } from 'react-router-dom';
import NewCustomer from './NewCustomer';
import toast from 'react-hot-toast';

const CustomerList = ({ data = [], fetchCustomer, type = "Customer" }) => {
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [open, setOpen] = useState(false);

  // Pure Tailwind Search, Sorting, and Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'customerIndex', direction: 'desc' });

  const navigate = useNavigate();

  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleClickOutside = (event) => {
    if (event.target.id === 'modalBackdrop') {
      closeRemoveModal();
    }
  };

  // Optional DataTable fallback cleanup
  useEffect(() => {
    if (window.$ && $.fn && $.fn.DataTable) {
      if ($.fn.DataTable.isDataTable(`#${type}`)) {
        $.fn.DataTable.isDataTable(`#${type}`) && $(`#${type}`).DataTable().destroy();
      }
    }
  }, [type]);

  const deleteCustomer = async (customerId) => {
    try {
      const response = await axios.delete(
        `${apiPath}/customer/deleteCustomer/${customerId}`,
      );
      if (response.data.status) {
        closeRemoveModal();
        fetchCustomer();
        toast.success('Customer deleted successfully!');
      } else {
        toast.error('Error deleting customer');
        console.error('Error deleting customer:', response.data.msg);
      }
    } catch (error) {
      toast.error('Error deleting customer');
      console.error('Error deleting customer:', error);
    }
  };

  // Dynamic statistics calculation
  const totalCustomers = data ? data.length : 0;
  const commercialCount = data ? data.filter(item => String(item?.typeOfCustomer || '').toLowerCase() === 'commerical' || String(item?.typeOfCustomer || '').toLowerCase() === 'commercial').length : 0;
  const individualCount = data ? data.filter(item => String(item?.typeOfCustomer || '').toLowerCase() === 'individual').length : 0;
  const countriesCount = useMemo(() => {
    if (!data) return 0;
    const countriesSet = new Set(
      data
        .map(item => item?.address?.[0]?.country)
        .filter(Boolean)
    );
    return countriesSet.size;
  }, [data]);

  // Filtered and Sorted Data computation using React useMemo
  const processedData = useMemo(() => {
    let result = Array.isArray(data) ? [...data] : [];

    // Search Filtering
    if (searchTerm && searchTerm.trim() !== '') {
      const query = String(searchTerm).toLowerCase().trim();
      result = result.filter((item) => {
        if (!item) return false;
        const fullName = `${item?.firstName || ''} ${item?.lastName || ''}`.toLowerCase();
        const email = String(item?.email || '').toLowerCase();
        const contact = String(item?.contact || '').toLowerCase();
        const country = String(item?.address?.[0]?.country || '').toLowerCase();
        const indexVal = String(item?.customerIndex || item?.leadIndex || '').toLowerCase();

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          contact.includes(query) ||
          country.includes(query) ||
          indexVal.includes(query)
        );
      });
    }

    // Sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (!a || !b) return 0;
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        if (sortConfig.key === 'name') {
          aVal = `${a?.firstName || ''} ${a?.lastName || ''}`.toLowerCase();
          bVal = `${b?.firstName || ''} ${b?.lastName || ''}`.toLowerCase();
        } else if (sortConfig.key === 'country') {
          aVal = String(a?.address?.[0]?.country || '').toLowerCase();
          bVal = String(b?.address?.[0]?.country || '').toLowerCase();
        } else if (sortConfig.key === 'customerIndex' || sortConfig.key === 'leadIndex') {
          aVal = Number(a?.customerIndex || a?.leadIndex || 0);
          bVal = Number(b?.customerIndex || b?.leadIndex || 0);
        } else {
          aVal = String(aVal || '').toLowerCase();
          bVal = String(bVal || '').toLowerCase();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig]);

  // Pagination calculation
  const totalPages = Math.ceil(processedData.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const validPage = Math.min(currentPage, totalPages);
    const start = Math.max(0, (validPage - 1) * entriesPerPage);
    return processedData.slice(start, start + entriesPerPage);
  }, [processedData, currentPage, entriesPerPage, totalPages]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Helper for Name initials
  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'C';
  };

  // Avatar colors palette
  const getAvatarBg = (index) => {
    const bgClasses = [
      'bg-blue-600 text-white',
      'bg-purple-600 text-white',
      'bg-emerald-600 text-white',
      'bg-indigo-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-cyan-600 text-white'
    ];
    return bgClasses[index % bgClasses.length];
  };

  return (
    <div className="w-full min-h-full bg-slate-50/50 dark:bg-boxdark-2 p-4 md:p-6 space-y-6 font-sans">
      {/* Hidden New Customer Modal Component */}
      <NewCustomer
        setOpen={setOpen}
        open={open}
        handler={fetchCustomer}
        type={type}
      />

      {/* Dynamic Executive Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers Card */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Customers
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {totalCustomers}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <PeopleIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Registered customer database</span>
          </div>
        </div>

        {/* Commercial Customers Card */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Commercial
              </p>
              <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {commercialCount}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
              <BusinessIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Business accounts</span>
          </div>
        </div>

        {/* Individual Customers Card */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Individual
              </p>
              <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {individualCount}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <PersonIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Personal accounts</span>
          </div>
        </div>

        {/* Countries Card */}
        <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Countries
              </p>
              <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {countriesCount}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <PublicIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Global customer reach</span>
          </div>
        </div>
      </div>

      {/* Main Table Card Section */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-5 md:p-6 space-y-5">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-strokedark">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white capitalize">
              Customers Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage, filter, and view all your dynamic CRM customer records in real-time.
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/25 cursor-pointer"
          >
            <AddIcon fontSize="small" />
            <span className="capitalize">New Customer</span>
          </button>
        </div>

        {/* Pure Tailwind Search & Entries Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Entries per page dropdown */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <SearchIcon style={{ fontSize: 18 }} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Data Table Container */}
        <div className="w-full overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-200 dark:border-strokedark select-none">
                <th
                  onClick={() => handleSort('customerIndex')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Number</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Name</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('email')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Email</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('contact')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Contact</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('country')}
                  className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Country</span>
                    <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr
                    key={item._id || index}
                    onClick={() => navigate(`/customers/${item._id}`)}
                    className="group hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    {/* Index / Number */}
                    <td className="py-3.5 px-4 font-semibold text-xs text-slate-500 dark:text-slate-400">
                      #{item?.customerIndex || item?.leadIndex || index + 1}
                    </td>

                    {/* Name with Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${getAvatarBg(index)}`}>
                          {getInitials(item?.firstName, item?.lastName)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors capitalize">
                            {item?.firstName} {item?.lastName}
                          </div>
                          <div className="text-xs text-slate-400 dark:text-slate-500 md:hidden">
                            {item?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item?.email ? (
                        <div className="flex items-center gap-2">
                          <EmailIcon style={{ fontSize: 16 }} className="text-slate-400" />
                          <span>{item.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No email</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {item?.contact ? (
                        <div className="flex items-center gap-2">
                          <PhoneIcon style={{ fontSize: 16 }} className="text-slate-400" />
                          <span>{item.contact}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">No contact</span>
                      )}
                    </td>

                    {/* Country Badge */}
                    <td className="py-3.5 px-4">
                      {item?.address?.[0]?.country ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
                          <PublicIcon style={{ fontSize: 14 }} className="text-slate-400" />
                          {item.address[0].country}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">N/A</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/customers/${item._id}`)}
                          title="View Details"
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <RemoveRedEyeIcon style={{ fontSize: 18 }} />
                        </button>

                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedCustomer(item);
                            setIsRemoveModalOpen(true);
                          }}
                          title="Delete Customer"
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all shadow-sm cursor-pointer"
                        >
                          <DeleteIcon style={{ fontSize: 18 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No customers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pure Tailwind Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing {processedData.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to{' '}
            {Math.min(currentPage * entriesPerPage, processedData.length)} of {processedData.length} entries
          </div>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <KeyboardArrowLeftIcon style={{ fontSize: 18 }} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-primary text-white shadow-md shadow-primary/25'
                    : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <KeyboardArrowRightIcon style={{ fontSize: 18 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Glassmorphism Remove Customer Dialog */}
      {isRemoveModalOpen && selectedCustomer && (
        <div
          id="modalBackdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all"
          onClick={handleClickOutside}
        >
          <div
            className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark p-6 max-w-md w-full animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto mb-4">
              <DeleteIcon style={{ fontSize: 30 }} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
              Delete Customer?
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {selectedCustomer.firstName} {selectedCustomer.lastName}
              </span>
              ? All associated information will be retained as anonymous data.
            </p>

            <div className="flex items-center gap-3">
              <button
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={closeRemoveModal}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
                onClick={() => deleteCustomer(selectedCustomer._id)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;

