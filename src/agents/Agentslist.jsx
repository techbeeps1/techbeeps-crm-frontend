import React, { useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../apiPath';
import {
  FiSearch,
  FiUserCheck,
  FiTrash2,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiX,
  FiUsers,
  FiTruck,
} from 'react-icons/fi';
import { UserContext } from '../UserContext';
import MultiStepPopup from './NewEmployee';
import StaffSlider from '../pages/HRM/Slider';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';

const Agentslist = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [countries, setCountries] = useState(null);
  const [licence, setLicence] = useState(null);
  const [skills, setSkills] = useState(null);

  // Filters & Table Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const notify = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message, { autoClose: 2000 });

  const handleAllAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiPath}/user/all`);
      setData(response.data || []);
      // If currently selected staff was updated, refresh reference
      if (selectedStaff) {
        const updated = response.data.find((item) => item._id === selectedStaff._id);
        if (updated) setSelectedStaff(updated);
      }
    } catch (err) {
      notifyError('Failed to fetch data. Please try again later.');
      setError('Failed to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedAgent(null);
  };

  const confirmDelete = async () => {
    if (!selectedAgent) return;
    setLoading(true);
    try {
      const response = await axios.post(`${apiPath}/user/deleteuser`, { id: selectedAgent._id });
      if (response.status === 200) {
        if (selectedStaff?._id === selectedAgent._id) {
          setSelectedStaff(null);
        }
        await handleAllAgents();
        notify('Staff deleted successfully');
      }
    } catch (err) {
      notifyError(`Failed to delete agent: ${err.message}`);
    } finally {
      closeDeleteModal();
      setLoading(false);
    }
  };

  const fetchInputs = async (type) => {
    try {
      const response = await axios.get(`${apiPath}/api/sale_group?type=${type}`);
      if (type === 'country') setCountries(response.data);
      if (type === 'Skill') setSkills(response.data);
      if (type === 'Licence') setLicence(response.data);
    } catch (err) {
      console.error(`Failed to fetch ${type}:`, err);
    }
  };

  useEffect(() => {
    fetchInputs('country');
    fetchInputs('Skill');
    fetchInputs('Licence');
    handleAllAgents();
  }, []);

  // Filter and Sort Data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const username = (item.username || '').toLowerCase();
      const email = (item.email || '').toLowerCase();
      const role = (item.role || '').toLowerCase();
      const matchesSearch =
        username.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        (item.drivingLicense &&
          item.drivingLicense.some((lic) => lic.toLowerCase().includes(searchTerm.toLowerCase())));

      const matchesRole = roleFilter === 'all' ? true : role === roleFilter.toLowerCase();
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, roleFilter]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      let valA = a[sortConfig.key] || '';
      let valB = b[sortConfig.key] || '';

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
    const start = (currentPage - 1) * entriesPerPage;
    return sortedData.slice(start, start + entriesPerPage);
  }, [sortedData, currentPage, entriesPerPage]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getRoleBadgeStyle = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
    if (r === 'agent') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  };

  if (loading && data.length === 0) {
    return <Loader />;
  }

  if (error && data.length === 0) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-2xl p-6 text-center border border-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full font-sans space-y-4">
      {selectedStaff ? (
        /* Full Width Staff Profile Details View */
        <div className="w-full space-y-4 animate-in fade-in duration-150">
          {/* Top Breadcrumb & Return Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-boxdark px-5 py-3 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
            <button
              onClick={() => setSelectedStaff(null)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              <FiChevronLeft className="text-base" />
              <span>Back to Staff Directory</span>
            </button>
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              Staff Directory <span className="mx-1.5">&gt;</span> <strong className="text-slate-800 dark:text-white font-bold">{selectedStaff?.username}</strong> ({selectedStaff?.role || 'Staff'})
            </div>
          </div>

          <div className="w-full bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden">
            <StaffSlider
              skills={skills}
              licenses={licence}
              countries={countries}
              handler={handleAllAgents}
              Ondelete={openDeleteModal}
              selectedStaff={selectedStaff}
              onClose={() => setSelectedStaff(null)}
            />
          </div>
        </div>
      ) : (
        /* Full Width Staff Table Panel */
        <div className="w-full bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden">
          {/* Action Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  <FiUsers />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Staff Directory
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {data.length} total registered {data.length === 1 ? 'employee' : 'employees'}
                  </p>
                </div>
              </div>

              {/* New Employee Modal Trigger */}
              <MultiStepPopup
                skills={skills}
                licenses={licence}
                countries={countries}
                handler={handleAllAgents}
              />
            </div>

            {/* Controls Bar: Filters & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
              {/* Role Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
                {['all', 'Staff', 'Agent', 'Admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setRoleFilter(role);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      roleFilter.toLowerCase() === role.toLowerCase()
                        ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {role === 'all' ? 'All Roles' : role}
                  </button>
                ))}
              </div>

              {/* Search & Page Size */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-60">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search name, license..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <FiX className="text-xs" />
                    </button>
                  )}
                </div>

                <select
                  value={entriesPerPage}
                  onChange={(e) => {
                    setEntriesPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <th
                    onClick={() => handleSort('username')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none"
                  >
                    Employee
                  </th>
                  <th
                    onClick={() => handleSort('role')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none"
                  >
                    Role
                  </th>
                  <th className="py-3 px-4">Driving License</th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="py-3 px-4 cursor-pointer hover:text-slate-800 dark:hover:text-slate-200 select-none"
                  >
                    Joining Date
                  </th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 text-xl">
                        <FiUsers />
                      </div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        No employees found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try changing your search filters or add a new employee
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const isSelected = selectedStaff?._id === item._id;
                    const initial = (item.username || 'U').charAt(0).toUpperCase();

                    return (
                      <tr
                        key={item._id || index}
                        onClick={() => setSelectedStaff(item)}
                        className={`cursor-pointer transition-colors duration-150 ${
                          isSelected
                            ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary font-medium'
                            : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Employee Avatar & Name */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/80 to-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {item.username}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate">
                                {item.email || 'No email'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role Pill */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getRoleBadgeStyle(
                              item.role
                            )}`}
                          >
                            {item.role || 'Staff'}
                          </span>
                        </td>

                        {/* Driving License Tags */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                            {item?.drivingLicense && item.drivingLicense.length > 0 ? (
                              item.drivingLicense.map((lic, licIdx) => (
                                <span
                                  key={licIdx}
                                  className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                                >
                                  {lic}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </div>
                        </td>

                        {/* Joining Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <FiCalendar className="text-slate-400 text-xs" />
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedStaff(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                              title="View Details"
                            >
                              <FiUserCheck className="text-sm" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                              title="Delete Employee"
                            >
                              <FiTrash2 className="text-sm" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {sortedData.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                {Math.min(currentPage * entriesPerPage, sortedData.length)} of{' '}
                {sortedData.length} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiChevronLeft className="text-sm" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), currentPage + 2)
                  .map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg font-bold text-xs cursor-pointer ${
                        currentPage === page
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <FiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleek Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-boxdark rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-strokedark relative">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900 text-xl">
              <FiAlertTriangle />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
              Confirm Delete
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to permanently remove employee{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {selectedAgent?.username}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                Yes, Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agentslist;
