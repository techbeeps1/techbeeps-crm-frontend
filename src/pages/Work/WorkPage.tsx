import React, { useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import {
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import GroupsIcon from '@mui/icons-material/Groups';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';
import Loader from '../../common/Loader';

const typeColors: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  move: {
    bg: '#3c50e0',
    border: '#2a3bb7',
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    text: 'text-indigo-600',
  },
  loading: {
    bg: '#0ea5e9',
    border: '#0284c7',
    badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    text: 'text-sky-600',
  },
  packing: {
    bg: '#10b981',
    border: '#059669',
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-600',
  },
  other: {
    bg: '#8b5cf6',
    border: '#7c3aed',
    badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    text: 'text-purple-600',
  },
  default: {
    bg: '#64748b',
    border: '#475569',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    text: 'text-slate-600',
  },
};

const getEventColor = (title: string = '') => {
  const key = (title || '').toLowerCase();
  for (const k of Object.keys(typeColors)) {
    if (key.includes(k)) return typeColors[k];
  }
  return typeColors.default;
};

const WorkPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'tasks' | 'appointments'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'upcoming'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Selected detail modal states
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const { username, id, role }: any = useContext(UserContext) || {};
  const token = localStorage.getItem('token');

  // Fetch all tasks and appointments assigned to current staff / agent
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [taskRes, apptRes] = await Promise.all([
        axios.get(`${apiPath}/api/task`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${apiPath}/api/appointment`, { headers }).catch(() => ({ data: [] })),
      ]);

      const rawTasks = taskRes.data || [];
      const rawAppts = apptRes.data?.data || apptRes.data || [];

      // Filter tasks: ONLY items assigned to this staff or agent
      const filteredTasks = rawTasks.filter((t: any) => {
        const isDirect = (t.directMembers || []).some(
          (m: any) => (m?._id || m) === id
        );
        const isTeam = (t.teamMembers || []).some(
          (m: any) => (m?._id || m) === id
        );
        const isNameAssigned =
          t.assignedTo &&
          username &&
          t.assignedTo.toLowerCase().includes(username.toLowerCase());
        return isDirect || isTeam || isNameAssigned;
      });

      // Filter appointments: ONLY items assigned to this staff or agent
      const filteredAppts = rawAppts.filter((item: any) => {
        const emps = item.assignedEmployees || [];
        return emps.some((emp: any) => {
          const empId = emp?.employeeId?._id || emp?.employeeId || emp?._id;
          const empName = (emp?.employeeName || '').toLowerCase();
          const uName = (username || '').toLowerCase();
          return (
            (id && empId && String(empId) === String(id)) ||
            (uName && empName.includes(uName))
          );
        });
      });

      setTasks(filteredTasks);
      setAppointments(filteredAppts);
    } catch (err) {
      console.error('Failed to load work data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, username]);

  // Date helper functions
  const isDateToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isDateTomorrow = (d: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      d.getDate() === tomorrow.getDate() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getFullYear() === tomorrow.getFullYear()
    );
  };

  const isDateUpcoming = (d: Date) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return d.getTime() >= startOfToday.getTime();
  };

  // Convert tasks to unified work items
  const unifiedItems = useMemo(() => {
    const taskItems = tasks.map((t) => {
      const scheduledDate = t.scheduledFor ? new Date(t.scheduledFor) : (t.createdAt ? new Date(t.createdAt) : new Date());
      const customer = t.customer;
      const custName = customer
        ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
        : 'N/A';

      return {
        id: `task-${t._id}`,
        rawId: t._id,
        kind: 'task' as const,
        title: t.summary || 'Assigned Task',
        description: t.description || '',
        date: scheduledDate,
        status: t.status || 'open',
        customerName: custName,
        customerObj: customer,
        jobIndex: t.job?.index || '',
        jobId: t.job?._id || t.job,
        assignedTo: t.assignedTo || '',
        raw: t,
      };
    });

    const apptItems = appointments.map((a) => {
      const apptDate = a.startTime ? new Date(a.startTime) : (a.date ? new Date(a.date) : new Date());
      const job = a.jobId;
      const customer = job?.customer || a.customer;
      const custName = customer
        ? typeof customer === 'string'
          ? customer
          : `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
        : 'N/A';

      return {
        id: `appt-${a._id}`,
        rawId: a._id,
        kind: 'appointment' as const,
        title: a.appointmentType || 'Job Appointment',
        description: a.notes || '',
        date: apptDate,
        startTime: a.startTime ? new Date(a.startTime) : null,
        endTime: a.endTime ? new Date(a.endTime) : null,
        status: 'scheduled',
        customerName: custName,
        customerObj: customer,
        jobIndex: job?.index || '',
        jobId: job?._id || job,
        departureLocation: a.departureLocation || '',
        assignedEmployees: a.assignedEmployees || [],
        raw: a,
      };
    });

    return [...taskItems, ...apptItems].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, appointments]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return unifiedItems.filter((item) => {
      // 1. Kind Tab Filter
      if (activeTab === 'tasks' && item.kind !== 'task') return false;
      if (activeTab === 'appointments' && item.kind !== 'appointment') return false;

      // 2. Date Filter
      if (dateFilter === 'today' && !isDateToday(item.date)) return false;
      if (dateFilter === 'tomorrow' && !isDateTomorrow(item.date)) return false;
      if (dateFilter === 'upcoming' && !isDateUpcoming(item.date)) return false;

      // 3. Search Filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchCustomer = item.customerName.toLowerCase().includes(query);
        const matchJob = String(item.jobIndex).toLowerCase().includes(query);
        const matchDesc = item.description.toLowerCase().includes(query);
        const matchAssigned = (item.assignedTo || '').toLowerCase().includes(query);
        const matchLocation = (item.departureLocation || '').toLowerCase().includes(query);

        return matchTitle || matchCustomer || matchJob || matchDesc || matchAssigned || matchLocation;
      }

      return true;
    });
  }, [unifiedItems, activeTab, dateFilter, searchTerm]);

  // Statistics
  const stats = useMemo(() => {
    const todayCount = unifiedItems.filter((i) => isDateToday(i.date)).length;
    return {
      total: unifiedItems.length,
      taskCount: tasks.length,
      apptCount: appointments.length,
      todayCount,
    };
  }, [unifiedItems, tasks, appointments]);

  const formatTimeWindow = (start: Date | null, end: Date | null) => {
    if (!start) return '';
    const sStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!end) return sStr;
    const eStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${sStr} — ${eStr}`;
  };

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/60 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 p-4 md:p-7 font-sans space-y-6">
      {loading && <Loader />}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-boxdark p-6 rounded-3xl border border-slate-200/80 dark:border-strokedark shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
        
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              My Assigned Work
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
              {role || 'Staff'} View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unified workbench for your assigned tasks, logistics jobs, and on-site appointments
          </p>
        </div>

        {/* Quick Date Display */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <EventIcon fontSize="small" className="text-primary" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Work */}
        <div
          onClick={() => { setActiveTab('all'); setDateFilter('all'); }}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'all' && dateFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent shadow-md'
              : 'bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">
              All Assignments
            </span>
            <WorkOutlineIcon fontSize="small" className="opacity-80" />
          </div>
          <div className="text-3xl font-black mt-2 tracking-tight">
            {stats.total}
          </div>
          <p className="text-[11px] opacity-70 mt-1 font-medium">Tasks & Appointments combined</p>
        </div>

        {/* Today's Schedule */}
        <div
          onClick={() => setDateFilter('today')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            dateFilter === 'today'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-md'
              : 'bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-85">
              Due / Scheduled Today
            </span>
            <AccessTimeIcon fontSize="small" className="text-amber-500" />
          </div>
          <div className="text-3xl font-black mt-2 tracking-tight">
            {stats.todayCount}
          </div>
          <p className="text-[11px] opacity-70 mt-1 font-medium">High priority today</p>
        </div>

        {/* Assigned Tasks */}
        <div
          onClick={() => setActiveTab('tasks')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-md'
              : 'bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-85">
              My Tasks
            </span>
            <AssignmentIcon fontSize="small" className="text-indigo-500" />
          </div>
          <div className="text-3xl font-black mt-2 tracking-tight">
            {stats.taskCount}
          </div>
          <p className="text-[11px] opacity-70 mt-1 font-medium">Assigned action items</p>
        </div>

        {/* Job Appointments */}
        <div
          onClick={() => setActiveTab('appointments')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'appointments'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white border-transparent shadow-md'
              : 'bg-white dark:bg-boxdark border-slate-200/80 dark:border-strokedark hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-85">
              Job Appointments
            </span>
            <LocalShippingIcon fontSize="small" className="text-sky-500" />
          </div>
          <div className="text-3xl font-black mt-2 tracking-tight">
            {stats.apptCount}
          </div>
          <p className="text-[11px] opacity-70 mt-1 font-medium">Moves, Loading, Packing</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-boxdark p-4 rounded-3xl border border-slate-200/80 dark:border-strokedark shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Category Segment */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Work ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tasks ({stats.taskCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Appointments ({stats.apptCount})
          </button>
        </div>

        {/* Right: Date Filter & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Date Chips */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
            {(['all', 'today', 'tomorrow', 'upcoming'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDateFilter(d)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all cursor-pointer ${
                  dateFilter === d
                    ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search work, customer, job..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary font-medium"
            />
            <SearchIcon
              fontSize="small"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 16 }}
            />
          </div>
        </div>
      </div>

      {/* Main Work Table View */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200/80 dark:border-strokedark p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircleOutlineIcon style={{ fontSize: 32 }} />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            No work assignments found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || dateFilter !== 'all'
              ? 'Try adjusting your search query or date filter.'
              : 'You have no assigned tasks or appointments currently.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200/80 dark:border-strokedark shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Title & Description</th>
                  <th className="py-4 px-5">Customer & Job</th>
                  <th className="py-4 px-5">Scheduled Date & Time</th>
                  <th className="py-4 px-5">Assigned / Location</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {filteredItems.map((item) => {
                  const isTask = item.kind === 'task';
                  const colorScheme = isTask ? typeColors.other : getEventColor(item.title);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Column 1: Type */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                            isTask
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                              : colorScheme.badge
                          }`}
                        >
                          {isTask ? (
                            <AssignmentIcon style={{ fontSize: 13 }} />
                          ) : (
                            <LocalShippingIcon style={{ fontSize: 13 }} />
                          )}
                          <span>{isTask ? 'Task' : item.title}</span>
                        </span>
                      </td>

                      {/* Column 2: Title & Description */}
                      <td className="py-4 px-5 max-w-[280px]">
                        <div
                          onClick={() => {
                            if (isTask) setSelectedTask(item.raw);
                            else setSelectedAppointment(item.raw);
                          }}
                          className="font-extrabold text-slate-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer truncate"
                        >
                          {item.title}
                        </div>
                        {item.description ? (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.description}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic mt-0.5">
                            No additional notes
                          </div>
                        )}
                      </td>

                      {/* Column 3: Customer & Job */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold">
                          <PersonIcon style={{ fontSize: 14 }} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{item.customerName}</span>
                        </div>
                        {item.jobIndex && (
                          <div className="mt-1">
                            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-bold text-[10px]">
                              Job #{item.jobIndex}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 4: Scheduled Date & Time */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                          <EventIcon style={{ fontSize: 14 }} className="text-slate-400" />
                          <span>{item.date.toLocaleDateString('en-GB')}</span>
                        </div>
                        {!isTask && item.startTime ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                            <AccessTimeIcon style={{ fontSize: 12 }} className="text-sky-500" />
                            <span>{formatTimeWindow(item.startTime, item.endTime)}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 mt-1">Full day / As scheduled</div>
                        )}
                      </td>

                      {/* Column 5: Assigned / Location */}
                      <td className="py-4 px-5 max-w-[220px]">
                        {!isTask && item.departureLocation ? (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs truncate">
                            <LocationOnIcon style={{ fontSize: 14 }} className="text-rose-400 shrink-0" />
                            <span className="truncate">{item.departureLocation}</span>
                          </div>
                        ) : isTask && item.assignedTo ? (
                          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 text-xs truncate">
                            <GroupsIcon style={{ fontSize: 14 }} className="text-indigo-400 shrink-0" />
                            <span className="truncate">{item.assignedTo}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Self-assigned</span>
                        )}
                      </td>

                      {/* Column 6: Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isTask && (item.status || '').toLowerCase() === 'done'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : isTask && (item.status || '').toLowerCase() === 'in progress'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60'
                          }`}
                        >
                          {isTask ? item.status : 'SCHEDULED'}
                        </span>
                      </td>

                      {/* Column 7: Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            if (isTask) setSelectedTask(item.raw);
                            else setSelectedAppointment(item.raw);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary hover:text-white hover:bg-primary bg-primary/10 transition-all cursor-pointer shadow-2xs active:scale-95"
                        >
                          <VisibilityIcon style={{ fontSize: 14 }} />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Count */}
          <div className="py-3 px-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing <strong className="text-slate-700 dark:text-slate-200">{filteredItems.length}</strong> of <strong className="text-slate-700 dark:text-slate-200">{stats.total}</strong> assignments</span>
            <span>Click <strong>View Details</strong> to view complete task/job appointment info</span>
          </div>
        </div>
      )}

      {/* Task Details Dialog (Matches Appointment Dialog style) */}
      <Dialog
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1.5rem',
            overflow: 'hidden',
          },
        }}
      >
        {selectedTask && (() => {
          const customer = selectedTask.customer;
          const customerName = customer
            ? typeof customer === 'string'
              ? customer
              : `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.name || ''
            : '';
          const customerMobile = customer?.mobile || customer?.contact || '';
          const customerEmail = customer?.email || '';
          const customerType = customer?.type || customer?.customerType || '';
          const jobIndex = selectedTask.job?.index || selectedTask.jobIndex || '';
          const scheduledDate = selectedTask.scheduledFor || selectedTask.createdAt;

          return (
            <div className="bg-white dark:bg-boxdark text-slate-800 dark:text-slate-100 font-sans">
              {/* Header Banner */}
              <div className="p-5 text-white flex items-center justify-between relative bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                    <AssignmentIcon />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
                      Task Details
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {selectedTask.summary || 'Task Assignment'}
                    </h3>
                  </div>
                </div>

                <IconButton
                  onClick={() => setSelectedTask(null)}
                  size="small"
                  className="text-white hover:bg-white/20"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>

              {/* Dialog Content */}
              <div className="p-6 space-y-5 text-xs">
                {/* Date & Status Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Scheduled Date
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 block">
                      {scheduledDate ? new Date(scheduledDate).toLocaleDateString('en-GB') : 'No date set'}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Status
                    </span>
                    <span className="font-extrabold text-sm text-primary uppercase mt-0.5 block">
                      {selectedTask.status || 'Open'}
                    </span>
                  </div>
                </div>

                {/* Customer Details Card */}
                {customerName && (
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Customer Information
                      </span>
                      {jobIndex && (
                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-bold text-[10px]">
                          Job #{jobIndex}
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {customerName}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-slate-600 dark:text-slate-400 pt-1">
                      {customerMobile && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon style={{ fontSize: 13 }} className="text-slate-400" />
                          <span>{customerMobile}</span>
                        </div>
                      )}
                      {customerEmail && (
                        <div className="flex items-center gap-1">
                          <EmailIcon style={{ fontSize: 13 }} className="text-slate-400" />
                          <span>{customerEmail}</span>
                        </div>
                      )}
                      {customerType && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <span className="font-semibold">Type:</span> {customerType}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description Box */}
                {selectedTask.description && (
                  <div className="bg-slate-50/80 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                      <NotesIcon style={{ fontSize: 14 }} />
                      <span>Description & Instructions</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTask.description}
                    </p>
                  </div>
                )}

                {/* Assigned Staff Box */}
                {selectedTask.assignedTo && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Assigned To
                    </span>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                      <PersonIcon style={{ fontSize: 15 }} className="text-primary shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {selectedTask.assignedTo}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dialog Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Dialog>

      {/* Appointment Details Dialog */}
      <Dialog
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1.5rem',
            overflow: 'hidden',
          },
        }}
      >
        {selectedAppointment && (() => {
          const selectedJob = selectedAppointment?.jobId;
          const selectedCustomer = selectedJob?.customer || selectedAppointment?.customer;
          const customerName = selectedCustomer
            ? typeof selectedCustomer === 'string'
              ? selectedCustomer
              : `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() ||
                selectedCustomer.name ||
                ''
            : '';
          const customerMobile = selectedCustomer?.mobile || selectedCustomer?.contact || '';
          const customerEmail = selectedCustomer?.email || '';

          const formatAddress = (addr: any) => {
            if (!addr) return '';
            if (typeof addr === 'string') return addr;
            const parts = [
              [addr.street, addr.houseNumber, addr.addition].filter(Boolean).join(' '),
              addr.postcode,
              addr.city,
              addr.country,
            ].filter(Boolean);
            return parts.join(', ');
          };

          const loadAddress = formatAddress(selectedJob?.load);
          const unloadAddress = formatAddress(selectedJob?.unload);
          const colorScheme = getEventColor(selectedAppointment.appointmentType);

          return (
            <div className="bg-white dark:bg-boxdark text-slate-800 dark:text-slate-100 font-sans">
              {/* Header Banner */}
              <div
                className="p-5 text-white flex items-center justify-between relative"
                style={{ backgroundColor: colorScheme.bg }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                    <LocalShippingIcon />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
                      Job Appointment Details
                    </span>
                    <h3 className="text-lg font-black text-white">
                      {selectedAppointment.appointmentType || 'Appointment'}
                    </h3>
                  </div>
                </div>

                <IconButton
                  onClick={() => setSelectedAppointment(null)}
                  size="small"
                  className="text-white hover:bg-white/20"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>

              {/* Dialog Content */}
              <div className="p-6 space-y-5 text-xs">
                {/* Date & Time Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Date
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 block">
                      {new Date(selectedAppointment.date || selectedAppointment.startTime).toLocaleDateString('en-GB')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Schedule Window
                    </span>
                    <span className="font-extrabold text-sm text-primary mt-0.5 block">
                      {selectedAppointment.startTime
                        ? formatTimeWindow(new Date(selectedAppointment.startTime), new Date(selectedAppointment.endTime))
                        : 'Flexible'}
                    </span>
                  </div>
                </div>

                {/* Customer Details Card */}
                {customerName && (
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Customer Information
                      </span>
                      {selectedJob?.index && (
                        <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-bold text-[10px]">
                          Job #{selectedJob.index}
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {customerName}
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-slate-600 dark:text-slate-400 pt-1">
                      {customerMobile && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon style={{ fontSize: 13 }} className="text-slate-400" />
                          <span>{customerMobile}</span>
                        </div>
                      )}
                      {customerEmail && (
                        <div className="flex items-center gap-1">
                          <EmailIcon style={{ fontSize: 13 }} className="text-slate-400" />
                          <span>{customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Route: Load to Unload */}
                {(loadAddress || unloadAddress) && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Relocation Route
                    </span>

                    {loadAddress && (
                      <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <LocationOnIcon style={{ fontSize: 15 }} className="text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">
                            Origin / Pickup
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {loadAddress}
                          </span>
                        </div>
                      </div>
                    )}

                    {unloadAddress && (
                      <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <LocationOnIcon style={{ fontSize: 15 }} className="text-rose-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">
                            Destination / Delivery
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-medium">
                            {unloadAddress}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Assigned Crew & Vehicle */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Crew & Resources
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedAppointment.assignedEmployees || []).map((emp: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60"
                      >
                        <PersonIcon style={{ fontSize: 15 }} className="text-primary shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                            {emp.employeeName || 'Staff Member'}
                          </span>
                          {emp.workType && (
                            <span className="text-[10px] text-slate-400 block">
                              {emp.workType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vehicle details */}
                  {selectedAppointment.assignedEmployees?.some((e: any) => e.vehicle) && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                      <DirectionsCarIcon style={{ fontSize: 15 }} className="text-indigo-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Vehicle assigned to appointment
                      </span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {selectedAppointment.notes && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold">
                      <NotesIcon style={{ fontSize: 14 }} />
                      <span>Instructions & Notes</span>
                    </div>
                    <p className="text-amber-900/80 dark:text-amber-200/80 leading-relaxed font-medium">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Dialog Footer */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Dialog>
    </div>
  );
};

export default WorkPage;
