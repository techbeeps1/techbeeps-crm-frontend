import React, { useEffect, useState, useContext, useMemo } from 'react';
import Shortcuts from './Shortcuts.tsx';
import StaffDashboard from './StaffDashboard.tsx';
import { UserContext } from '../../UserContext.tsx';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../../apiPath';

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
  customer?: {
    firstName?: string;
    lastName?: string;
  };
  job?: {
    index?: string;
  };
}

const ECommerce = () => {
  const { userData, isAdmin, role }: any = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  if (!isUserAdmin) {
    return <StaffDashboard />;
  }

  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [totalLeadCount, setTotalLeadCount] = useState<number | null>(null);
  const [activeLeadCount, setActiveLeadCount] = useState<number | null>(null);
  const [jobsList, setJobsList] = useState<JobItem[] | null>(null);
  const [tasksList, setTasksList] = useState<TaskItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [jobsLoading, setJobsLoading] = useState<boolean>(true);
  const [tasksLoading, setTasksLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [jobsError, setJobsError] = useState<boolean>(false);
  const [tasksError, setTasksError] = useState<boolean>(false);

  const navigate = useNavigate();

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const custPromise = axios.get(`${apiPath}/customer/customerList?type=Customer`, { headers });
      const leadPromise = axios.get(`${apiPath}/leads/leadList`, { headers })
        .catch(() => axios.get(`${apiPath}/customer/customerList?type=leads`, { headers }));

      const [custRes, leadRes] = await Promise.all([custPromise, leadPromise]);
      const custs = custRes.data?.customers || custRes.data?.data || custRes.data || [];
      const rawLeads = leadRes.data?.leads || leadRes.data?.customers || leadRes.data?.data || [];

      setCustomerCount(Array.isArray(custs) ? custs.length : 0);

      const total = Array.isArray(rawLeads) ? rawLeads.length : (leadRes.data?.totalLeads || 0);
      const active = Array.isArray(rawLeads)
        ? rawLeads.filter((l: any) => {
            const s = (l.status || '').toLowerCase().trim();
            return s !== 'converted' && s !== 'lost' && s !== 'rejected';
          }).length
        : total;

      setTotalLeadCount(total);
      setActiveLeadCount(active);
    } catch (err: any) {
      console.error('Error fetching metrics:', err);
      setFetchError(err.message || 'Failed to load metrics');
      // Do not deceptively reset to 0 (business zero) if fetch failed
    } finally {
      setLoading(false);
    }
  };

  const fetchJobsData = async () => {
    try {
      setJobsLoading(true);
      setJobsError(false);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiPath}/api/jobList`, { headers });
      setJobsList(response.data?.jobList || []);
    } catch (err) {
      console.error('Error fetching jobs list:', err);
      setJobsError(true);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchTasksData = async () => {
    try {
      setTasksLoading(true);
      setTasksError(false);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiPath}/api/task?page=1&limit=50`, { headers });
      const taskData = Array.isArray(response.data)
        ? response.data
        : response.data?.tasks || response.data?.data || [];
      setTasksList(taskData);
    } catch (err) {
      console.error('Error fetching tasks list:', err);
      setTasksError(true);
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
    fetchJobsData();
    fetchTasksData();
  }, []);

  const activeJobs = useMemo(() => {
    if (!jobsList) return [];
    return jobsList.filter((job) => {
      const s = (job.status || '').toLowerCase().trim();
      return s !== 'completed' && s !== 'cancelled' && s !== 'draft';
    });
  }, [jobsList]);

  const pendingTasks = useMemo(() => {
    if (!tasksList) return [];
    return tasksList.filter((task) => {
      const s = (task.status || '').toLowerCase().trim();
      return s !== 'completed' && s !== 'done';
    });
  }, [tasksList]);

  // Today's Date formatted
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Helper for Name initials
  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'J';
  };

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 p-4 md:p-6 space-y-6 font-sans">
      {/* Top Welcome Executive Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-primary text-white rounded-2xl p-6 md:p-8 shadow-md">
        {/* Subtle Ambient Background Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-40 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-medium backdrop-blur-md mb-3 border border-white/10">
              <CalendarTodayIcon style={{ fontSize: 14 }} />
              <span>{todayDate}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Universal Movers CRM Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              onClick={() => navigate('/customers')}
              className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center cursor-pointer hover:bg-white/20 transition-all"
            >
              <span className="block text-2xl font-bold">
                {loading ? '...' : customerCount !== null ? customerCount : '—'}
              </span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Total Clients</span>
            </div>
            <div
              onClick={() => navigate('/leads?filter=pipeline')}
              className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 text-center cursor-pointer hover:bg-white/20 transition-all"
            >
              <span className="block text-2xl font-bold text-amber-400">
                {loading ? '...' : activeLeadCount !== null ? activeLeadCount : '—'}
              </span>
              <span className="text-[11px] text-slate-300 uppercase tracking-wider font-medium">Active Leads</span>
            </div>
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl flex items-center justify-between text-xs font-semibold">
          <span>Notice: Some dashboard metrics could not be refreshed ({fetchError})</span>
          <button
            onClick={() => { fetchDashboardMetrics(); fetchJobsData(); fetchTasksData(); }}
            className="flex items-center gap-1 bg-white dark:bg-boxdark border border-rose-300 px-3 py-1 rounded-xl text-rose-800 dark:text-rose-300 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <RefreshIcon style={{ fontSize: 14 }} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Quick Actions Shortcuts Container */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs">
        <Shortcuts />
      </div>

      {/* Dynamic KPI Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div
          onClick={() => navigate('/customers')}
          className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Customers
              </p>
              <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {loading ? '...' : customerCount !== null ? customerCount : '—'}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <PeopleIcon />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <TrendingUpIcon style={{ fontSize: 16 }} /> Active database entries
            </span>
            <span className="text-primary font-semibold text-[11px] hover:underline">View All →</span>
          </div>
        </div>

        {/* Active Leads */}
        <div
          onClick={() => navigate('/leads?filter=pipeline')}
          className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Active Leads
              </p>
              <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                {loading ? '...' : activeLeadCount !== null ? activeLeadCount : '—'}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
              <AssignmentIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>
              {activeLeadCount !== null ? `${activeLeadCount} active of ${totalLeadCount || 0} total leads` : 'Pipeline opportunities'}
            </span>
            <span className="text-primary font-semibold text-[11px] hover:underline">View Leads →</span>
          </div>
        </div>

        {/* Active Jobs Card */}
        <div
          onClick={() => navigate('/jobs?filter=ACTIVE')}
          className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Active Jobs
              </p>
              <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {jobsLoading ? '...' : jobsError ? '—' : activeJobs.length}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <WorkOutlineIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>{jobsList !== null ? `${activeJobs.length} active of ${jobsList.length} total operations` : 'Active operations'}</span>
            <span className="text-primary font-semibold text-[11px] hover:underline">View Jobs →</span>
          </div>
        </div>

        {/* Scheduled Tasks Card */}
        <div
          onClick={() => navigate('/tasks')}
          className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Pending Tasks
              </p>
              <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {tasksLoading ? '...' : tasksError ? '—' : pendingTasks.length}
              </h4>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <TaskAltIcon />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-400 dark:text-slate-500 flex items-center justify-between">
            <span>{tasksList !== null ? `${pendingTasks.length} open of ${tasksList.length} total tasks` : 'Pending tasks'}</span>
            <span className="text-primary font-semibold text-[11px] hover:underline">View Tasks →</span>
          </div>
        </div>
      </div>

      {/* Main Content: Jobs & Tasks Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Jobs Widget */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-strokedark pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <WorkOutlineIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Active Jobs & Operations
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Recent logistics and relocation schedules (excluding drafts & completed)
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/jobs?filter=ACTIVE')}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>View All</span>
              <ArrowForwardIcon style={{ fontSize: 14 }} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5 px-3">Customer / Job</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {jobsLoading ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Loading active jobs...
                    </td>
                  </tr>
                ) : activeJobs.length > 0 ? (
                  activeJobs.slice(0, 6).map((job, idx) => (
                    <tr
                      key={job._id || idx}
                      onClick={() => navigate(`/jobs?${job._id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0">
                            {getInitials(job.customer?.firstName, job.customer?.lastName)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                              {job.customer?.firstName} {job.customer?.lastName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {job.date ? new Date(job.date).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {job.load?.city || 'Origin'} <ArrowForwardIcon style={{ fontSize: 12 }} /> {job.unload?.city || 'Destination'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          {job.status || 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : jobsError ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-rose-500 dark:text-rose-400">
                      Failed to load active jobs.{' '}
                      <button
                        onClick={fetchJobsData}
                        className="underline font-bold text-primary hover:text-primary/80 cursor-pointer ml-1"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                      No active jobs in execution or pending.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Tasks Widget */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-strokedark pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <TaskAltIcon />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Pending Tasks & Assignments
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Staff todo lists and activity schedules (open tasks only)
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/tasks')}
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>View All</span>
              <ArrowForwardIcon style={{ fontSize: 14 }} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <th className="py-2.5 px-3">Task Summary</th>
                  <th className="py-2.5 px-3">Assigned To</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {tasksLoading ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      Loading pending tasks...
                    </td>
                  </tr>
                ) : pendingTasks.length > 0 ? (
                  pendingTasks.slice(0, 6).map((task, idx) => (
                    <tr
                      key={task._id || idx}
                      onClick={() => navigate('/tasks')}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-100 max-w-[180px] truncate">
                        {task.summary || 'Task details...'}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {task.assignedTo || 'Unassigned'}
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
                          {task.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : tasksError ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-rose-500 dark:text-rose-400">
                      Failed to load pending tasks.{' '}
                      <button
                        onClick={fetchTasksData}
                        className="underline font-bold text-primary hover:text-primary/80 cursor-pointer ml-1"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                      No pending tasks open.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ECommerce;


