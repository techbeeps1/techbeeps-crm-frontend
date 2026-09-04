import React, { useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';
import EventIcon from '@mui/icons-material/Event';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Dialog, IconButton } from '@mui/material';
import Loader from '../../common/Loader';

interface JobItem {
  _id: string;
  index?: string;
  date?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  load?: {
    city?: string;
    country?: string;
  };
  unload?: {
    city?: string;
    country?: string;
  };
  status?: string;
}

interface TaskItem {
  _id: string;
  summary?: string;
  assignedTo?: string;
  status?: string;
  scheduledFor?: string;
  createdAt?: string;
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  job?: {
    index?: string;
  };
}

const StaffDashboard: React.FC = () => {
  const [tasksList, setTasksList] = useState<TaskItem[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);

  // Filter tab for combined work table
  const [workFilterTab, setWorkFilterTab] = useState<'all' | 'jobs' | 'tasks'>('all');

  // Planning Calendar state
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());

  // Inspection modals
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  const navigate = useNavigate();
  const { username, id, role, userData, isAdmin, hasAccess }: any = useContext(UserContext) || {};
  const token = localStorage.getItem('token');

  // Role Access Verification for 'Work'
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';
  const hasWorkAccess =
    isUserAdmin ||
    (typeof hasAccess === 'function'
      ? hasAccess('Work')
      : userData?.access?.includes('Work'));

  useEffect(() => {
    async function fetchStaffData() {
      // If user has no work access, skip loading work assignments
      if (!hasWorkAccess) {
        setLoading(false);
        setTasksLoading(false);
        setJobsLoading(false);
        return;
      }

      setLoading(true);
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [taskRes, apptRes] = await Promise.all([
          axios.get(`${apiPath}/api/task`, { headers }).catch(() => ({ data: [] })),
          axios.get(`${apiPath}/api/appointment`, { headers }).catch(() => ({ data: [] })),
        ]);

        const rawTasks: any[] = Array.isArray(taskRes.data)
          ? taskRes.data
          : taskRes.data?.tasks || taskRes.data?.data || [];

        const rawAppts: any[] = apptRes.data?.data || apptRes.data || [];

        // Filter tasks assigned to this staff / agent
        const myTasks = rawTasks.filter((t: any) => {
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

        // Filter appointments assigned to this staff / agent
        const myAppts = rawAppts.filter((item: any) => {
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

        setTasksList(myTasks);
        setAppointmentsList(myAppts);
      } catch (err) {
        console.error('Error fetching staff dashboard data:', err);
      } finally {
        setLoading(false);
        setTasksLoading(false);
        setJobsLoading(false);
      }
    }

    fetchStaffData();
  }, [id, username, hasWorkAccess]);

  // Date formatted
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isToday = (dateInput?: any) => {
    if (!dateInput) return false;
    const d = new Date(dateInput);
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  // Metrics
  const activeTasks = useMemo(() => {
    return tasksList.filter((t) => (t.status || '').toLowerCase() !== 'done');
  }, [tasksList]);

  const doneTasks = useMemo(() => {
    return tasksList.filter((t) => (t.status || '').toLowerCase() === 'done');
  }, [tasksList]);

  const todayCount = useMemo(() => {
    const todayTasks = tasksList.filter((t) => isToday(t.scheduledFor || t.createdAt)).length;
    const todayAppts = appointmentsList.filter((a) => isToday(a.date || a.startTime)).length;
    return todayTasks + todayAppts;
  }, [tasksList, appointmentsList]);

  // Helper for Name initials
  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'W';
  };

  // Combined work items for the unified section
  const combinedWorkItems = useMemo(() => {
    const list: any[] = [];

    // Add appointments
    if (workFilterTab === 'all' || workFilterTab === 'jobs') {
      appointmentsList.forEach((appt) => {
        list.push({
          type: 'job',
          id: appt._id,
          raw: appt,
          date: appt.date || appt.startTime,
          title: appt.appointmentType || 'Job Shift',
          customer: appt.jobId?.customer || appt.customer,
          jobIndex: appt.jobId?.index,
          location: appt.departureLocation || 'On-site Appointment',
          status: appt.appointmentType || 'Active',
          statusClass:
            'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        });
      });
    }

    // Add tasks
    if (workFilterTab === 'all' || workFilterTab === 'tasks') {
      tasksList.forEach((task) => {
        list.push({
          type: 'task',
          id: task._id,
          raw: task,
          date: task.scheduledFor || task.createdAt,
          title: task.summary || 'Assigned Task',
          customer: task.customer,
          jobIndex: task.job?.index,
          location: task.assignedTo || username || 'Assigned',
          status: task.status || 'Pending',
          statusClass:
            'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        });
      });
    }

    // Sort by scheduled date descending
    return list.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });
  }, [appointmentsList, tasksList, workFilterTab, username]);

  // Monthly Planning Calendar Calculations
  const currentCalYear = calendarMonth.getFullYear();
  const currentCalMonth = calendarMonth.getMonth();

  const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentCalYear, currentCalMonth, 1).getDay(); // 0 = Sun, 1 = Mon...
  const prevMonthDays = new Date(currentCalYear, currentCalMonth, 0).getDate();

  // Build 35 or 42 grid cells
  const calendarCells = useMemo(() => {
    const cells: {
      day: number;
      isCurrentMonth: boolean;
      date: Date;
      appts: any[];
      tasks: any[];
    }[] = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const dateObj = new Date(currentCalYear, currentCalMonth - 1, d);
      cells.push({
        day: d,
        isCurrentMonth: false,
        date: dateObj,
        appts: [],
        tasks: [],
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentCalYear, currentCalMonth, d);
      const apptsOnDay = appointmentsList.filter((a) => {
        const raw = a.date || a.startTime;
        if (!raw) return false;
        const dt = new Date(raw);
        return (
          dt.getDate() === d &&
          dt.getMonth() === currentCalMonth &&
          dt.getFullYear() === currentCalYear
        );
      });
      const tasksOnDay = tasksList.filter((t) => {
        const raw = t.scheduledFor || t.createdAt;
        if (!raw) return false;
        const dt = new Date(raw);
        return (
          dt.getDate() === d &&
          dt.getMonth() === currentCalMonth &&
          dt.getFullYear() === currentCalYear
        );
      });

      cells.push({
        day: d,
        isCurrentMonth: true,
        date: dateObj,
        appts: apptsOnDay,
        tasks: tasksOnDay,
      });
    }

    // Next month padding (total cells to 35 or 42)
    const remaining = 42 - cells.length;
    if (remaining > 0 && remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const dateObj = new Date(currentCalYear, currentCalMonth + 1, d);
        cells.push({
          day: d,
          isCurrentMonth: false,
          date: dateObj,
          appts: [],
          tasks: [],
        });
      }
    } else if (cells.length < 35) {
      const needed = 35 - cells.length;
      for (let d = 1; d <= needed; d++) {
        const dateObj = new Date(currentCalYear, currentCalMonth + 1, d);
        cells.push({
          day: d,
          isCurrentMonth: false,
          date: dateObj,
          appts: [],
          tasks: [],
        });
      }
    }

    return cells;
  }, [currentCalYear, currentCalMonth, daysInMonth, firstDayOfMonth, prevMonthDays, appointmentsList, tasksList]);

  // Next and previous month handlers
  const handlePrevMonth = () => {
    setCalendarMonth(new Date(currentCalYear, currentCalMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(currentCalYear, currentCalMonth + 1, 1));
  };

  const handleTodayMonth = () => {
    const now = new Date();
    setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedCalendarDate(now);
  };


  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

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

  const formatTimeWindow = (start: Date | null, end: Date | null) => {
    if (!start) return '';
    const sStr = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (!end) return sStr;
    const eStr = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${sStr} — ${eStr}`;
  };

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 p-4 md:p-6 space-y-6 font-sans">
      {loading && <Loader />}

      {/* Top Welcome Executive Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-primary text-white rounded-2xl p-6 md:p-8 shadow-md">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium backdrop-blur-md mb-3 border border-white/10">
              <CalendarTodayIcon style={{ fontSize: 14 }} />
              <span>{todayDate}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Universel CRM Dashboard
            </h1>
          </div>

          {hasWorkAccess && (
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
                <span className="block text-2xl font-bold">{activeTasks.length}</span>
                <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Active Tasks</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center">
                <span className="block text-2xl font-bold text-amber-400">{todayCount}</span>
                <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Due Today</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stat Cards - Only displayed if user has 'Work' access */}
      {hasWorkAccess && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* My Active Tasks */}
          <div
            onClick={() => navigate('/work')}
            className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  My Active Tasks
                </p>
                <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {tasksLoading ? '...' : activeTasks.length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <AssignmentIcon />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUpIcon style={{ fontSize: 16 }} />
              <span>Assigned action items</span>
            </div>
          </div>

          {/* Today's Schedule */}
          <div
            onClick={() => navigate('/work')}
            className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Today's Schedule
                </p>
                <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {loading ? '...' : todayCount}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
                <AccessTimeIcon />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              <span>Due / scheduled today</span>
            </div>
          </div>

          {/* Job Appointments */}
          <div
            onClick={() => navigate('/work')}
            className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Job Appointments
                </p>
                <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {jobsLoading ? '...' : appointmentsList.length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <WorkOutlineIcon />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              <span>Scheduled & running jobs</span>
            </div>
          </div>

          {/* Tasks Completed */}
          <div
            onClick={() => navigate('/work')}
            className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Tasks Completed
                </p>
                <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {tasksLoading ? '...' : doneTasks.length}
                </h4>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                <TaskAltIcon />
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-400 dark:text-slate-500">
              <span>Staff completed tasks</span>
            </div>
          </div>
        </div>
      )}

      {/* Role Access Guard: If user does NOT have 'Work' access, do NOT display Work Details & Calendar */}
      {!hasWorkAccess ? (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-8 md:p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 shadow-inner">
            <LockOutlinedIcon style={{ fontSize: 32 }} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            Work & Planning Access Restricted
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your account role permissions do not include the <strong>Work</strong> module. Assigned job appointments, staff tasks, and the planning calendar are hidden. If you need access, please contact your CRM administrator.
          </p>
        </div>
      ) : (
        /* Main Layout Grid: Left Combined Work Section (Jobs + Tasks) & Right Planning Calendar */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Combined Work & Operations Table (Dono section ka data ik sath) */}
          <div className="lg:col-span-7 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-4">
            {/* Header with Title and Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-strokedark pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-primary flex items-center justify-center">
                  <AssignmentIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Active Work & Operations
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Combined jobs, logistics shifts, and pending tasks
                  </p>
                </div>
              </div>

              {/* View All & Filter Tabs */}
              <div className="flex items-center gap-2">
                <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setWorkFilterTab('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      workFilterTab === 'all'
                        ? 'bg-white dark:bg-boxdark text-primary shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    All ({appointmentsList.length + tasksList.length})
                  </button>
                  <button
                    onClick={() => setWorkFilterTab('jobs')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      workFilterTab === 'jobs'
                        ? 'bg-white dark:bg-boxdark text-emerald-600 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Jobs ({appointmentsList.length})
                  </button>
                  <button
                    onClick={() => setWorkFilterTab('tasks')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      workFilterTab === 'tasks'
                        ? 'bg-white dark:bg-boxdark text-purple-600 shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    Tasks ({tasksList.length})
                  </button>
                </div>

                <button
                  onClick={() => navigate('/work')}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline ml-2"
                >
                  <span>View All</span>
                  <ArrowForwardIcon style={{ fontSize: 14 }} />
                </button>
              </div>
            </div>

            {/* Combined Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Title / Customer</th>
                    <th className="py-2.5 px-3">Route / Assignee</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Loading assigned work details...
                      </td>
                    </tr>
                  ) : combinedWorkItems.length > 0 ? (
                    combinedWorkItems.slice(0, 8).map((item) => {
                      const customer = item.customer;
                      const firstName = typeof customer === 'string' ? customer : customer?.firstName || '';
                      const lastName = typeof customer === 'string' ? '' : customer?.lastName || '';
                      const fullName = (firstName + ' ' + lastName).trim() || (item.type === 'job' ? 'Client' : 'Task Item');
                      const dateStr = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';

                      return (
                        <tr
                          key={`${item.type}-${item.id}`}
                          onClick={() => {
                            if (item.type === 'job') setSelectedAppointment(item.raw);
                            else setSelectedTask(item.raw);
                          }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        >
                          {/* Type indicator */}
                          <td className="py-3 px-3">
                            {item.type === 'job' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                <WorkOutlineIcon style={{ fontSize: 12 }} />
                                <span>Job</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <TaskAltIcon style={{ fontSize: 12 }} />
                                <span>Task</span>
                              </span>
                            )}
                          </td>

                          {/* Title / Customer */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0 ${
                                  item.type === 'job'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-purple-600 text-white'
                                }`}
                              >
                                {getInitials(firstName, lastName)}
                              </div>
                              <div className="max-w-[160px] truncate">
                                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                  {item.type === 'job' ? fullName : item.title}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {item.jobIndex ? `Job #${item.jobIndex}` : item.type === 'job' ? 'Logistics Shift' : fullName}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Route / Assignee */}
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                            {item.location}
                          </td>

                          {/* Date */}
                          <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                            {dateStr}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${item.statusClass}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                        No work assignments found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-strokedark text-xs text-slate-400">
              <span>Showing up to 8 recent assignments</span>
              <button
                onClick={() => navigate('/work')}
                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
              >
                <span>Open Work Board</span>
                <ArrowForwardIcon style={{ fontSize: 13 }} />
              </button>
            </div>
          </div>

          {/* Right Column: Monthly Planning Calendar (Only monthly calander) */}
          <div className="lg:col-span-5 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-4">
            {/* Calendar Header with Prev / Next month buttons */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-strokedark pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CalendarMonthIcon />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Planning Calendar
                  </h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Monthly schedule & shifts
                  </p>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleTodayMonth}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition"
                >
                  Today
                </button>
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Previous Month"
                >
                  <ChevronLeftIcon style={{ fontSize: 18 }} />
                </button>
                <span className="text-xs font-bold text-slate-800 dark:text-white px-1 whitespace-nowrap">
                  {calendarMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Next Month"
                >
                  <ChevronRightIcon style={{ fontSize: 18 }} />
                </button>
              </div>
            </div>

            {/* Monthly Calendar Grid */}
            <div>
              {/* Day names row */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                <div>Su</div>
                <div>Mo</div>
                <div>Tu</div>
                <div>We</div>
                <div>Th</div>
                <div>Fr</div>
                <div>Sa</div>
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  const isCurrentDay = isToday(cell.date);
                  const isSelected = selectedCalendarDate && isSameDay(selectedCalendarDate, cell.date);
                  const hasAppts = cell.appts.length > 0;
                  const hasTasks = cell.tasks.length > 0;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedCalendarDate(cell.date)}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center relative transition-all text-xs font-semibold ${
                        !cell.isCurrentMonth
                          ? 'text-slate-300 dark:text-slate-600 opacity-40 hover:opacity-80'
                          : isSelected
                          ? 'bg-primary text-white shadow-md'
                          : isCurrentDay
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-primary border border-primary/30 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{cell.day}</span>

                      {/* Event indicator dots */}
                      {(hasAppts || hasTasks) && (
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {hasAppts && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-emerald-500'
                              }`}
                              title={`${cell.appts.length} Job(s)`}
                            />
                          )}
                          {hasTasks && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-amber-300' : 'bg-purple-500'
                              }`}
                              title={`${cell.tasks.length} Task(s)`}
                            />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dot Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 pt-2 border-t border-slate-100 dark:border-strokedark text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Job Appointments</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                  <span>Tasks</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                  <span>Selected</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Inspection Modal */}
      {selectedTask && (() => {
        const selectedCustomer = selectedTask.customer || selectedTask.job?.customer;
        const customerName = selectedCustomer
          ? typeof selectedCustomer === 'string'
            ? selectedCustomer
            : `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() ||
              selectedCustomer.name ||
              ''
          : '';
        const customerMobile = selectedCustomer?.mobile || selectedCustomer?.contact || selectedCustomer?.phone || '';
        const customerEmail = selectedCustomer?.email || '';
        const jobIndex = selectedTask.job?.index;

        return (
          <Dialog
            open={Boolean(selectedTask)}
            onClose={() => setSelectedTask(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: '24px',
                overflow: 'hidden',
              },
            }}
          >
            <div className="relative bg-gradient-to-r from-purple-700 via-indigo-700 to-primary p-6 text-white">
              <IconButton
                onClick={() => setSelectedTask(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-purple-200 mb-1">
                <AssignmentIcon style={{ fontSize: 16 }} />
                <span>Task Assignment Details</span>
              </div>

              <h2 className="text-xl font-extrabold pr-8">
                {selectedTask.summary || 'Untitled Task'}
              </h2>
            </div>

            <div className="p-6 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
              {/* Status and Scheduled Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Status</p>
                  <p className="font-extrabold text-sm text-purple-600 uppercase mt-0.5">
                    {selectedTask.status || 'Pending'}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Scheduled Date</p>
                  <p className="font-extrabold text-sm text-slate-800 dark:text-white mt-0.5">
                    {selectedTask.scheduledFor
                      ? new Date(selectedTask.scheduledFor).toLocaleDateString('en-GB')
                      : selectedTask.createdAt
                      ? new Date(selectedTask.createdAt).toLocaleDateString('en-GB')
                      : 'Immediate'}
                  </p>
                </div>
              </div>

              {/* Customer Details Card */}
              {customerName ? (
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
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

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {getInitials(
                        typeof selectedCustomer === 'object' ? selectedCustomer?.firstName : customerName,
                        typeof selectedCustomer === 'object' ? selectedCustomer?.lastName : ''
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {customerName}
                      </h4>
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
                  </div>
                </div>
              ) : jobIndex ? (
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Linked Job</span>
                  <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs">
                    Job #{jobIndex}
                  </span>
                </div>
              ) : null}

              {/* Notes / Description */}
              {selectedTask.description && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <NotesIcon style={{ fontSize: 14 }} />
                    <span>Task Instructions & Details</span>
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 whitespace-pre-wrap leading-relaxed">
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

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>
          </Dialog>
        );
      })()}

      {/* Appointment Inspection Modal */}
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
        const customerMobile = selectedCustomer?.mobile || selectedCustomer?.contact || selectedCustomer?.phone || '';
        const customerEmail = selectedCustomer?.email || '';

        const loadAddress = formatAddress(selectedJob?.load) || selectedAppointment.departureLocation || '';
        const unloadAddress = formatAddress(selectedJob?.unload) || selectedAppointment.arrivalLocation || '';

        const apptDate = selectedAppointment.date || selectedAppointment.startTime;
        const startTime = selectedAppointment.startTime ? new Date(selectedAppointment.startTime) : null;
        const endTime = selectedAppointment.endTime ? new Date(selectedAppointment.endTime) : null;

        return (
          <Dialog
            open={Boolean(selectedAppointment)}
            onClose={() => setSelectedAppointment(null)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              style: {
                borderRadius: '24px',
                overflow: 'hidden',
              },
            }}
          >
            {/* Header Banner */}
            <div className="relative bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 p-6 text-white">
              <IconButton
                onClick={() => setSelectedAppointment(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  color: 'white',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-200 mb-1">
                <WorkOutlineIcon style={{ fontSize: 16 }} />
                <span>Job Shift & Appointment Details</span>
              </div>

              <h2 className="text-xl font-extrabold pr-8 capitalize">
                {selectedAppointment.appointmentType || 'Logistics Operation'}
              </h2>
            </div>

            <div className="p-6 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
              {/* Date & Schedule Window Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Scheduled Date
                  </span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white mt-0.5 block">
                    {apptDate ? new Date(apptDate).toLocaleDateString('en-GB') : 'Immediate'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Time Window
                  </span>
                  <span className="font-extrabold text-sm text-primary mt-0.5 block">
                    {startTime ? formatTimeWindow(startTime, endTime) : 'Flexible'}
                  </span>
                </div>
              </div>

              {/* Customer Details Card */}
              {customerName ? (
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2">
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

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                      {getInitials(
                        typeof selectedCustomer === 'object' ? selectedCustomer?.firstName : customerName,
                        typeof selectedCustomer === 'object' ? selectedCustomer?.lastName : ''
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {customerName}
                      </h4>
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
                  </div>
                </div>
              ) : selectedJob?.index ? (
                <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Linked Job</span>
                  <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs">
                    Job #{selectedJob.index}
                  </span>
                </div>
              ) : null}

              {/* Relocation Route: Origin to Destination */}
              {(loadAddress || unloadAddress) && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Relocation Route
                  </span>

                  {loadAddress && (
                    <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                      <LocationOnIcon style={{ fontSize: 16 }} className="text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-emerald-600 block uppercase tracking-wider">
                          Origin / Pickup Location
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {loadAddress}
                        </span>
                      </div>
                    </div>
                  )}

                  {unloadAddress && (
                    <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                      <LocationOnIcon style={{ fontSize: 16 }} className="text-rose-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wider">
                          Destination / Delivery Location
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                          {unloadAddress}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Assigned Crew & Vehicles */}
              {selectedAppointment.assignedEmployees?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Assigned Crew & Resources
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedAppointment.assignedEmployees.map((emp: any, idx: number) => (
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
                              Role: {emp.workType}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedAppointment.assignedEmployees?.some((e: any) => e.vehicle) && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
                      <DirectionsCarIcon style={{ fontSize: 15 }} className="text-indigo-500 shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Vehicle assigned to appointment
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions & Notes */}
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

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </Dialog>
        );
      })()}
    </div>
  );
};

export default StaffDashboard;
