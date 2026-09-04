import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Autocomplete,
  Chip,
  TextField,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import {
  FiUsers,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiAlertTriangle,
  FiLayers,
  FiCheckCircle,
} from 'react-icons/fi';
import TeamSlider from './Teamslider';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';

const Team = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [roles, setRoles] = useState([]);

  // Filter & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const notify = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg, { autoClose: 2000 });

  const handleAllAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${apiPath}/api/teams`);
      setData(response.data || []);
      if (selectedStaff) {
        const updated = (response.data || []).find((t) => t._id === selectedStaff._id);
        if (updated) setSelectedStaff(updated);
      }
    } catch (err) {
      console.error(err);
      notifyError('Failed to fetch teams');
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
    try {
      const response = await axios.delete(`${apiPath}/api/teams/${selectedAgent._id}`);
      if (response.status === 200) {
        if (selectedStaff?._id === selectedAgent._id) {
          setSelectedStaff(null);
        }
        await handleAllAgents();
        notify('Team deleted successfully');
      }
    } catch (err) {
      notifyError(`Failed to delete team: ${err.message}`);
    } finally {
      closeDeleteModal();
    }
  };

  const openEditModal = () => {
    reset({ teamName: '', members: [] });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    reset();
  };

  const onEditSubmit = async (formData) => {
    try {
      await axios.post(`${apiPath}/api/teams`, formData);
      notify('Team created successfully!');
      await handleAllAgents();
      closeEditModal();
    } catch (err) {
      notifyError(`Failed to create team: ${err.message}`);
    }
  };

  const handleAllEmployee = async () => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      const employees = (response.data || []).map((employee) => ({
        label: employee.username,
        value: employee._id,
      }));
      setRoles(employees);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  useEffect(() => {
    handleAllAgents();
    handleAllEmployee();
  }, []);

  // Filtered & Paginated Teams
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const teamName = (item.teamName || '').toLowerCase();
      const memberMatch = (item.members || []).some((m) =>
        (m.username || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      return teamName.includes(searchTerm.toLowerCase()) || memberMatch;
    });
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / entriesPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    return filteredData.slice(start, start + entriesPerPage);
  }, [filteredData, currentPage, entriesPerPage]);

  if (loading && data.length === 0) {
    return <Loader />;
  }

  if (error && data.length === 0) {
    return (
      <div className="bg-rose-50 text-rose-600 rounded-2xl p-6 text-center border border-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Side: Teams Table Panel */}
        <div
          className={`w-full ${
            selectedStaff ? 'lg:w-7/12' : 'w-full'
          } bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden transition-all duration-300`}
        >
          {/* Header Action Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  <FiLayers />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Teams for Tasks
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {data.length} operational {data.length === 1 ? 'team' : 'teams'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={openEditModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
              >
                <FiPlus className="text-base" />
                <span>New Team</span>
              </button>
            </div>

            {/* Search & Entries Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 sm:max-w-xs">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search team or member..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary"
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

          {/* Table Container */}
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400 text-xl">
                        <FiLayers />
                      </div>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        No teams found
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Create a team to start grouping task assignees
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((item, index) => {
                    const isSelected = selectedStaff?._id === item._id;
                    const initial = (item.teamName || 'T').charAt(0).toUpperCase();

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
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                              {initial}
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.teamName}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                              <FiUsers className="text-[10px]" />
                              {item?.members?.length || 0} members
                            </span>
                            {item?.members?.slice(0, 3).map((m, mIdx) => (
                              <span
                                key={mIdx}
                                className="px-2 py-0.5 rounded-lg text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                              >
                                {m.username}
                              </span>
                            ))}
                            {(item?.members?.length || 0) > 3 && (
                              <span className="text-slate-400 text-[11px]">
                                +{(item?.members?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div
                            className="inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedStaff(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                              title="View Team"
                            >
                              <FiCheckCircle className="text-sm" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                              title="Delete Team"
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
          {filteredData.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing {(currentPage - 1) * entriesPerPage + 1} to{' '}
                {Math.min(currentPage * entriesPerPage, filteredData.length)} of{' '}
                {filteredData.length} teams
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <FiChevronLeft className="text-sm" />
                </button>
                <span className="px-3 py-1 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <FiChevronRight className="text-sm" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Team Detail Slider */}
        {selectedStaff && (
          <div className="w-full lg:w-5/12 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden sticky top-4">
            <TeamSlider
              Ondelete={openDeleteModal}
              selectedStaff={selectedStaff}
              onClose={() => setSelectedStaff(null)}
              isEdited={() => handleAllAgents()}
            />
          </div>
        )}
      </div>

      {/* Modern Make New Team Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-boxdark rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-100 dark:border-strokedark relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                  <FiPlus />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Create New Team
                  </h3>
                  <p className="text-xs text-slate-500">
                    Group employees together for assignments
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Moving Crew Alpha"
                  {...register('teamName', { required: 'Team name is required' })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                />
                {errors.teamName && (
                  <p className="text-rose-500 text-xs mt-1">{errors.teamName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Team Members
                </label>
                <Controller
                  name="members"
                  control={control}
                  defaultValue={[]}
                  render={({ field }) => (
                    <Autocomplete
                      multiple
                      options={roles}
                      getOptionLabel={(option) => option.label}
                      onChange={(_, data) => field.onChange(data.map((option) => option.value))}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            label={option.label}
                            {...getTagProps({ index })}
                            key={option.value || option.label}
                            size="small"
                            className="bg-primary/10 text-primary font-bold"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select team members..."
                          size="small"
                          className="bg-slate-50 dark:bg-slate-800 rounded-xl"
                        />
                      )}
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Save Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sleek Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-999 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-boxdark rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 dark:border-strokedark relative">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 text-xl">
              <FiAlertTriangle />
            </div>

            <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
              Confirm Delete Team
            </h3>
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete team{' '}
              <strong className="text-slate-800 dark:text-slate-200">
                {selectedAgent?.teamName}
              </strong>
              ?
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 active:scale-[0.98] transition-all cursor-pointer"
              >
                Yes, Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
