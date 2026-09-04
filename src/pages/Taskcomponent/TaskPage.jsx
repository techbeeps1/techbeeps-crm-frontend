import React, { useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Autocomplete,
  Modal,
  TextField,
  Box,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  UnfoldMore as UnfoldMoreIcon,
  Delete as DeleteIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  Lock as LockIcon,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { UserContext } from '../../UserContext';
import TaskSlider from './TaskSlider';
import DatePickerComponent from '../../common/Datepicker';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';

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
  return 'TK';
};

const TaskPage = ({ jobId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [roles, setRoles] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [jobs, setjobs] = useState([]);
  const { username, id, ws, role, userData, isAdmin } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const [currentJobData, setCurrentJobData] = useState(null);

  const notify = (message) =>
    toast.success(message, {
      autoClose: 2000,
    });
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  // Fetch job information when jobId prop is present
  const fetchCurrentJob = async () => {
    if (!jobId) return;
    try {
      const response = await axios.get(`${apiPath}/api/jobs/${jobId}`);
      const jobObj = response.data?.job || response.data;
      if (jobObj) {
        setCurrentJobData(jobObj);

        // Preload customer into list
        if (jobObj.customer) {
          const cId = jobObj.customer._id || jobObj.customer;
          const cLabel =
            typeof jobObj.customer === 'object'
              ? `${jobObj.customer.firstName || ''} ${jobObj.customer.lastName || ''} (${jobObj.customer.email || ''})`.trim()
              : 'Customer';

          setCustomer((prev) => {
            if (!prev.some((c) => c.value === cId)) {
              return [{ label: cLabel, value: cId }, ...prev];
            }
            return prev;
          });
        }

        // Preload job into list
        const jId = jobObj._id || jobId;
        const jCustomerName =
          typeof jobObj.customer === 'object'
            ? `${jobObj.customer.firstName || ''} ${jobObj.customer.lastName || ''}`.trim()
            : '';
        const jLabel = `${jCustomerName} (#${jobObj.index || jId})`.trim();

        setjobs((prev) => {
          if (!prev.some((j) => j.value === jId)) {
            return [{ label: jLabel, value: jId }, ...prev];
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to fetch job details for task:', err);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchCurrentJob();
    }
  }, [jobId]);

  const handleAlltask = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiPath}/api/task?scheduledFor=${filter}&jobId=${jobId || ''}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      const taskList = response?.data || [];
      const userTasks = isUserAdmin
        ? taskList
        : taskList.filter((t) => {
            const isDirect = (t.directMembers || []).some(
              (m) => (m?._id || m) === id
            );
            const isTeam = (t.teamMembers || []).some(
              (m) => (m?._id || m) === id
            );
            const isNameAssigned =
              t.assignedTo &&
              username &&
              t.assignedTo.toLowerCase().includes(username.toLowerCase());
            return isDirect || isTeam || isNameAssigned;
          });

      setData(userTasks);
      if (selectedStaff?._id) {
        const updated = userTasks.find((t) => t._id === selectedStaff._id);
        if (updated) setSelectedStaff(updated);
      }
    } catch (err) {
      setData([]);
      setError('Failed to fetch tasks. Please try again later.');
      notifyError(`Failed to fetch tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (agent) => {
    setSelectedStaff(agent);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!selectedStaff?._id) return;
    setLoading(true);
    try {
      const response = await axios.delete(
        `${apiPath}/api/task/${selectedStaff._id}`,
      );
      if (response.status === 200) {
        notify('Task deleted successfully');
        handleAlltask();
        setSelectedStaff(null);
      }
    } catch (err) {
      notifyError(`Failed to delete task: ${err.message}`);
    } finally {
      closeDeleteModal();
      setLoading(false);
    }
  };

  const openEditModal = () => {
    const custId =
      currentJobData?.customer?._id ||
      (typeof currentJobData?.customer === 'string' ? currentJobData.customer : '');

    reset({
      summary: '',
      description: '',
      scheduledFor: new Date().toISOString().split('T')[0],
      customer: jobId ? (custId || '') : '',
      job: jobId || '',
      teamMembers: [],
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    reset();
  };

  // Synchronize customer and job values when modal opens in job-specific mode
  useEffect(() => {
    if (isEditModalOpen && jobId) {
      setValue('job', jobId);
      const custId =
        currentJobData?.customer?._id ||
        (typeof currentJobData?.customer === 'string' ? currentJobData.customer : '');
      if (custId) {
        setValue('customer', custId);
      }
    }
  }, [isEditModalOpen, jobId, currentJobData, setValue]);

  const onSubmit = async (formData) => {
    setLoading(true);
    if (formData.summary.length < 2 || formData.summary.length > 55) {
      notifyError('Title should be between 2 and 55 characters');
      setLoading(false);
      return;
    }
    if (formData.description.length < 5 || formData.description.length > 125) {
      notifyError('Description should be between 5 and 125 characters');
      setLoading(false);
      return;
    }

    if (formData.scheduledFor) {
      const selectedDate = new Date(formData.scheduledFor);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        notifyError('Schedule date cannot be in the past');
        setLoading(false);
        return;
      }
    }

    const custId =
      currentJobData?.customer?._id ||
      (typeof currentJobData?.customer === 'string' ? currentJobData.customer : '');

    // Resolve all selected team member IDs, teams, and direct members from roles
    const selectedRoles = (roles || []).filter((r) => (formData.teamMembers || []).includes(r.value));
    const selectedTeams = selectedRoles.filter((r) => r.type === 'Team').map((r) => r.value);
    const selectedDirectMembers = selectedRoles.filter((r) => r.type === 'Member').map((r) => r.value);
    const allMemberIds = [...new Set(selectedRoles.flatMap((r) => r.teamMembers || [r.value]))];
    const assignedNames = selectedRoles.map((r) => r.label.trim()).filter(Boolean).join(', ');

    const payload = {
      ...formData,
      teams: selectedTeams,
      directMembers: selectedDirectMembers,
      teamMembers: allMemberIds.length > 0 ? allMemberIds : (formData.teamMembers || []),
      assignedTo: assignedNames || formData.assignedTo || '',
      ...(jobId ? { job: jobId, ...(custId ? { customer: custId } : {}) } : {}),
    };

    if (!payload.job || payload.job === '') {
      delete payload.job;
    }
    if (!payload.customer || payload.customer === '') {
      delete payload.customer;
    }

    try {
      let response = await axios.post(`${apiPath}/api/task`, payload);
      notify('Task created successfully');
      if (response.status === 201) {
        if (ws && ws.readyState === WebSocket.OPEN) {
          payload?.teamMembers?.forEach((item) => {
            const messageData = {
              recipient: item,
              sender: id,
              text: `A New Task was created by ${username} and you are part of the task.`,
            };
            ws.send(JSON.stringify(messageData));
          });
        }
        handleAlltask();
        closeEditModal();
      }
    } catch (err) {
      notifyError(`Error: ${err?.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAllTeams = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/teams`);
      let teams = (response['data'] || []).map((team) => ({
        label: (team.teamName || '').trim(),
        value: team._id,
        type: 'Team',
        category: 'Teams (Groups)',
        memberCount: team.members?.length || 0,
        teamMembers: (team.members || []).map((item) => (typeof item === 'object' ? item._id : item)),
      }));
      handleAllEmploye(teams);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllEmploye = async (teamsData) => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      let employees = (response['data'] || []).map((user) => ({
        label: (user.username || '').trim(),
        value: user._id,
        type: 'Member',
        category: 'Individual Members',
        teamMembers: [user._id],
      }));
      setRoles([...teamsData, ...employees]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllcustomer = async () => {
    try {
      const response = await axios.get(`${apiPath}/customer/customerList`);
      let cust = (response['data']?.customers || []).map((c) => ({
        label: `${c.firstName || ''} ${c.lastName || ''} (${c.email || ''})`.trim(),
        value: c._id,
      }));
      setCustomer(cust);
    } catch (err) {
      console.error(err);
    }
  };

  let customerIdWatch = watch('customer');

  const handleAllJob = async () => {
    if (customerIdWatch) {
      try {
        const response = await axios.get(
          `${apiPath}/api/jobList?customer=${customerIdWatch}`,
        );
        let jList = (response['data']?.jobList || []).map((j) => ({
          label: `${j.customer?.firstName || ''} ${j.customer?.lastName || ''} (#${j.index || ''})`.trim(),
          value: j._id,
        }));
        setjobs(jList);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    handleAllJob();
  }, [customerIdWatch]);

  useEffect(() => {
    handleAllTeams();
    handleAllcustomer();
  }, []);

  useEffect(() => {
    handleAlltask();
  }, [filter, isUserAdmin, id, username]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.filter((item) => {
      const summary = (item?.summary || '').toLowerCase();
      const desc = (item?.description || '').toLowerCase();
      const customerName = `${item?.customer?.firstName || ''} ${item?.customer?.lastName || ''}`.toLowerCase();
      const assigned = (item?.assignedTo || '').toLowerCase();
      const status = (item?.status || '').toLowerCase();
      const jobIdx = String(item?.job?.index || '').toLowerCase();
      const query = searchTerm.toLowerCase();

      return (
        summary.includes(query) ||
        desc.includes(query) ||
        customerName.includes(query) ||
        assigned.includes(query) ||
        status.includes(query) ||
        jobIdx.includes(query)
      );
    });
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    if (!sortConfig.key) return sorted;

    sorted.sort((a, b) => {
      let valA = '';
      let valB = '';

      if (sortConfig.key === 'title') {
        valA = a?.summary || '';
        valB = b?.summary || '';
      } else if (sortConfig.key === 'customer') {
        valA = `${a?.customer?.firstName || ''} ${a?.customer?.lastName || ''}`;
        valB = `${b?.customer?.firstName || ''} ${b?.customer?.lastName || ''}`;
      } else if (sortConfig.key === 'assignedTo') {
        valA = a?.assignedTo || '';
        valB = b?.assignedTo || '';
      } else if (sortConfig.key === 'createdAt') {
        valA = new Date(a?.createdAt || 0).getTime();
        valB = new Date(b?.createdAt || 0).getTime();
        return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
      } else if (sortConfig.key === 'status') {
        valA = a?.status || '';
        valB = b?.status || '';
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

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed' || s === 'done') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Completed
        </span>
      );
    } else if (s === 'in progress' || s === 'ongoing') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          In Progress
        </span>
      );
    } else if (s === 'overdue' || s === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Urgent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {status || 'Pending'}
      </span>
    );
  };

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="w-full space-y-5 font-sans">
      {loading && <Loader />}

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className={`w-full ${selectedStaff ? 'lg:w-7/12' : 'w-full'} bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden transition-all duration-300`}>
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <AssignmentIcon />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {jobId ? 'Job Tasks' : `Tasks Overview`}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {data.length} {data.length === 1 ? 'task' : 'tasks'} in schedule
                  </p>
                </div>
              </div>

              {isUserAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openEditModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                  >
                    <AddIcon style={{ fontSize: 18 }} />
                    <span>New Task</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => { setFilter(''); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filter === ''
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  All Tasks
                </button>
                <button
                  onClick={() => { setFilter('today'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'today'
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => { setFilter('tomorrow'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'tomorrow'
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => { setFilter('ever'); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filter === 'ever'
                      ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Future
                </button>
              </div>

              <div className="relative flex-1 sm:max-w-xs">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                <input
                  type="text"
                  placeholder="Search tasks, assignee, job..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40 select-none">
                  <th
                    onClick={() => handleSort('title')}
                    className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>TASK & CUSTOMER</span>
                      <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('assignedTo')}
                    className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>ASSIGNED TO</span>
                      <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('createdAt')}
                    className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>CREATED / SCHEDULED</span>
                      <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('status')}
                    className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>STATUS</span>
                      <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => {
                    const isSelected = selectedStaff?._id === item._id;
                    const initials = getInitials(
                      item?.customer?.firstName,
                      item?.customer?.lastName,
                      item?.summary
                    );
                    const avatarBg = getAvatarBg(index);
                    const customerFullName = item?.customer 
                      ? `${item.customer.firstName || ''} ${item.customer.lastName || ''}`.trim()
                      : '';

                    return (
                      <tr
                        key={item._id || index}
                        onClick={() => setSelectedStaff(item)}
                        className={`group transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 font-medium'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 ${avatarBg}`}>
                              {initials}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors capitalize">
                                {item?.summary || 'Untitled Task'}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                {customerFullName && <span>{customerFullName}</span>}
                                {item?.job?.index && (
                                  <span className="text-primary font-bold">
                                    • Job #{item.job.index}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {item?.assignedTo ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {item.assignedTo.split(',').map((name, i) => {
                                const trimmed = name.trim();
                                const lower = trimmed.toLowerCase();
                                const isTeam =
                                  (item?.teams || []).some((t) =>
                                    (typeof t === 'object' ? t?.teamName : '').trim().toLowerCase() === lower
                                  ) ||
                                  (roles || []).some(
                                    (r) => r.type === 'Team' && (r.label || '').trim().toLowerCase() === lower
                                  );

                                return (
                                  <span
                                    key={i}
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                      isTeam
                                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                    }`}
                                  >
                                    {isTeam ? (
                                      <GroupsIcon style={{ fontSize: 13 }} className="text-indigo-600 dark:text-indigo-400" />
                                    ) : (
                                      <PersonIcon style={{ fontSize: 13 }} className="text-slate-400" />
                                    )}
                                    <span>{trimmed}</span>
                                    {isTeam && <span className="text-[10px] opacity-75 font-normal">(Team)</span>}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">Unassigned</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <CalendarTodayIcon style={{ fontSize: 14 }} className="text-slate-400" />
                            <span>{new Date(item?.createdAt || Date.now()).toLocaleDateString('en-GB')}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {getStatusBadge(item?.status)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedStaff(item)}
                              title="View Details"
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-xs cursor-pointer"
                            >
                              <RemoveRedEyeIcon style={{ fontSize: 18 }} />
                            </button>

                            {isUserAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteModal(item);
                                }}
                                title="Delete Task"
                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white transition-all shadow-xs cursor-pointer"
                              >
                                <DeleteIcon style={{ fontSize: 18 }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                      No tasks found matching your filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {sortedData.length > entriesPerPage && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, sortedData.length)} of {sortedData.length} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <KeyboardArrowLeftIcon style={{ fontSize: 18 }} />
                </button>
                <span className="px-2.5 font-bold text-slate-700 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <KeyboardArrowRightIcon style={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Task Inspector Panel */}
        {selectedStaff && (
          <div className="w-full lg:w-5/12 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-4 sm:p-6 overflow-hidden">
            <TaskSlider
              handler={handleAlltask}
              roles={roles}
              Ondelete={openDeleteModal}
              task={selectedStaff}
              onClose={() => setSelectedStaff(null)}
            />
          </div>
        )}
      </div>

      {/* Modern Create New Task Modal */}
      <Modal open={isEditModalOpen} onClose={closeEditModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeEditModal} />

          <div className="relative bg-white dark:bg-boxdark rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 border border-slate-100 dark:border-strokedark z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <AddIcon />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Task</h3>
                  <p className="text-xs text-slate-500">Assign task, schedule date, and customer linking</p>
                </div>
              </div>
              <IconButton onClick={closeEditModal} size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule delivery inspection"
                  {...register('summary', { required: 'Title is required' })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 dark:text-white"
                />
                {errors.summary && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{errors.summary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Detailed instructions for the assignee..."
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 dark:text-white"
                />
                {errors.description && (
                  <p className="text-rose-600 text-[11px] mt-1 font-semibold">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Schedule Date
                  </label>
                  <DatePickerComponent
                    control={control}
                    name="scheduledFor"
                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Customer Link
                    </label>
                    {jobId && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        <LockIcon style={{ fontSize: 11 }} />
                        <span>Auto-Linked from Job</span>
                      </span>
                    )}
                  </div>
                  <Controller
                    name="customer"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        disabled={!!jobId}
                        options={customer}
                        getOptionLabel={(option) =>
                          typeof option === 'string' ? option : option?.label || ''
                        }
                        value={
                          customer.find((c) => c.value === field.value) ||
                          (field.value && currentJobData?.customer
                            ? {
                                label:
                                  typeof currentJobData.customer === 'object'
                                    ? `${currentJobData.customer.firstName || ''} ${currentJobData.customer.lastName || ''} (${currentJobData.customer.email || ''})`.trim()
                                    : 'Linked Customer',
                                value: field.value,
                              }
                            : null)
                        }
                        isOptionEqualToValue={(option, val) =>
                          option?.value === (val?.value || val)
                        }
                        onChange={(_, data) => field.onChange(data ? data.value : '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={jobId ? 'Customer auto-selected' : 'Select customer...'}
                            size="small"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                fontSize: '12px',
                                backgroundColor: jobId ? 'rgba(241, 245, 249, 0.7)' : undefined,
                              },
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Assign Team Members
                  </label>
                  <Controller
                    name="teamMembers"
                    control={control}
                    render={({ field }) => {
                      const selectedOptions = (roles || []).filter((r) =>
                        (field.value || []).includes(r.value)
                      );
                      return (
                        <Autocomplete
                          multiple
                          options={roles || []}
                          groupBy={(option) => option?.category || (option?.type === 'Team' ? 'Teams (Groups)' : 'Individual Members')}
                          getOptionLabel={(option) => option?.label || ''}
                          isOptionEqualToValue={(option, val) =>
                            (option?.value || option) === (val?.value || val)
                          }
                          value={selectedOptions}
                          onChange={(_, data) =>
                            field.onChange(data.map((item) => item.value))
                          }
                          renderOption={(props, option) => (
                            <li {...props} key={option.value} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                              <div className="flex items-center gap-2">
                                {option.type === 'Team' ? (
                                  <GroupsIcon style={{ fontSize: 18 }} className="text-indigo-600 dark:text-indigo-400" />
                                ) : (
                                  <PersonIcon style={{ fontSize: 18 }} className="text-slate-500" />
                                )}
                                <span className="font-semibold text-slate-800 dark:text-white">
                                  {option.label}
                                </span>
                              </div>
                              {option.type === 'Team' ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  Team ({option.memberCount || 0})
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Member
                                </span>
                              )}
                            </li>
                          )}
                          renderTags={(tagValue, getTagProps) =>
                            tagValue.map((option, index) => {
                              const isTeam = option?.type === 'Team';
                              return (
                                <span
                                  {...getTagProps({ index })}
                                  key={option.value || index}
                                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold m-0.5 ${
                                    isTeam
                                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  {isTeam ? (
                                    <GroupsIcon style={{ fontSize: 13 }} className="text-indigo-600 dark:text-indigo-400" />
                                  ) : (
                                    <PersonIcon style={{ fontSize: 13 }} className="text-slate-500" />
                                  )}
                                  <span>{option.label}</span>
                                </span>
                              );
                            })
                          }
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder={selectedOptions.length === 0 ? "Add assignees..." : ""}
                              size="small"
                              variant="outlined"
                              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '12px' } }}
                            />
                          )}
                        />
                      );
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Linked Job
                    </label>
                    {jobId && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                        <LockIcon style={{ fontSize: 11 }} />
                        <span>Fixed for this Job</span>
                      </span>
                    )}
                  </div>
                  <Controller
                    name="job"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        disabled={!!jobId}
                        options={jobs}
                        getOptionLabel={(option) =>
                          typeof option === 'string' ? option : option?.label || ''
                        }
                        value={
                          jobs.find((j) => j.value === field.value) ||
                          (field.value || jobId
                            ? {
                                label:
                                  currentJobData?.index
                                    ? `Job #${currentJobData.index}`
                                    : `Job #${String(field.value || jobId).slice(-6)}`,
                                value: field.value || jobId,
                              }
                            : null)
                        }
                        isOptionEqualToValue={(option, val) =>
                          option?.value === (val?.value || val)
                        }
                        onChange={(_, data) => field.onChange(data ? data.value : '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder={jobId ? 'Current Job' : 'Select job...'}
                            size="small"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                                fontSize: '12px',
                                backgroundColor: jobId ? 'rgba(241, 245, 249, 0.7)' : undefined,
                              },
                            }}
                          />
                        )}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>

      {/* Modern Delete Confirmation Dialog */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeDeleteModal} />

          <div className="relative bg-white dark:bg-boxdark rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 dark:border-strokedark z-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
              <WarningAmberIcon style={{ fontSize: 28 }} />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Delete Task
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-white">"{selectedStaff?.summary}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default TaskPage;
