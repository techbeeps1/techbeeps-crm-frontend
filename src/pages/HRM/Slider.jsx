import React, { useState, useEffect } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiGlobe,
  FiTruck,
  FiFileText,
  FiAward,
  FiTrash2,
  FiX,
  FiClock,
  FiDollarSign,
  FiCheckCircle,
  FiShield,
  FiSave,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiLayers,
  FiTrendingUp,
  FiEdit2,
} from 'react-icons/fi';
import { Dialog } from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiPath } from '../../../apiPath';
import EditEmployee from '../../agents/EditEmployee';
import AvailabilityComponent from '../../agents/Available';
import ModulePermissionsSelector, { ALL_MODULE_IDS } from '../../agents/ModulePermissionsSelector';

const StaffSlider = ({ handler, selectedStaff, onClose, Ondelete, skills, licenses, countries }) => {
  const [tabIndex, setTabIndex] = useState('colleague');

  // Role Access Management State
  const [selectedAccess, setSelectedAccess] = useState(
    selectedStaff?.role === 'Admin'
      ? ALL_MODULE_IDS
      : Array.isArray(selectedStaff?.access) && selectedStaff.access.length > 0
        ? selectedStaff.access
        : ['Dashboard']
  );
  const [savingPermissions, setSavingPermissions] = useState(false);

  // Leave Quota Management State
  const currentYear = new Date().getFullYear();
  const [leaveYear, setLeaveYear] = useState(currentYear);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loadingLeaveData, setLoadingLeaveData] = useState(false);
  const [quotaInput, setQuotaInput] = useState(12);
  const [quotaNotes, setQuotaNotes] = useState('');
  const [savingQuota, setSavingQuota] = useState(false);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);

  // Sync access state when selectedStaff changes
  useEffect(() => {
    if (selectedStaff) {
      setSelectedAccess(
        selectedStaff.role === 'Admin'
          ? ALL_MODULE_IDS
          : Array.isArray(selectedStaff.access) && selectedStaff.access.length > 0
            ? selectedStaff.access
            : ['Dashboard']
      );
    }
  }, [selectedStaff]);

  // Fetch Leave Data for this Employee
  const fetchEmployeeLeaveData = async () => {
    if (!selectedStaff?._id) return;
    setLoadingLeaveData(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [balRes, reqRes] = await Promise.all([
        axios.get(`${apiPath}/api/leave/balances?year=${leaveYear}&employeeId=${selectedStaff._id}`, { headers }),
        axios.get(`${apiPath}/api/leave/requests?employeeId=${selectedStaff._id}&year=${leaveYear}`, { headers }),
      ]);

      const balList = balRes.data?.data || [];
      const empBal = balList.find(
        (b) => (b.employeeId?._id || b.employeeId || b.employee?._id) === selectedStaff._id
      ) || balList[0];

      setLeaveBalance(empBal || null);
      if (empBal) {
        setQuotaInput(empBal.annualEntitlement !== undefined ? empBal.annualEntitlement : 12);
        setQuotaNotes(empBal.notes || '');
      } else {
        setQuotaInput(12);
        setQuotaNotes('');
      }

      setLeaveRequests(reqRes.data?.data || []);
    } catch (err) {
      console.error('Error fetching employee leave data:', err);
    } finally {
      setLoadingLeaveData(false);
    }
  };

  useEffect(() => {
    if (tabIndex === 'leave-quota' && selectedStaff?._id) {
      fetchEmployeeLeaveData();
    }
  }, [tabIndex, selectedStaff?._id, leaveYear]);

  // Save Role Access
  const handleSavePermissions = async () => {
    if (!selectedStaff?._id) return;
    setSavingPermissions(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.post(
        `${apiPath}/user/update`,
        {
          id: selectedStaff._id,
          access: selectedStaff.role === 'Admin' ? ALL_MODULE_IDS : selectedAccess,
          role: selectedStaff.role || 'Staff',
        },
        { headers }
      );

      toast.success('Role-based access permissions saved successfully!');
      if (handler) handler();
    } catch (err) {
      console.error('Error updating permissions:', err);
      toast.error(err.response?.data?.msg || err.message || 'Failed to update permissions');
    } finally {
      setSavingPermissions(false);
    }
  };

  // Save Leave Quota
  const handleSaveLeaveQuota = async (e) => {
    e.preventDefault();
    if (!selectedStaff?._id) return;
    setSavingQuota(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.put(
        `${apiPath}/api/leave/balances/${selectedStaff._id}`,
        {
          annualEntitlement: parseFloat(quotaInput) || 12,
          notes: quotaNotes.trim(),
          year: leaveYear,
        },
        { headers }
      );

      toast.success('Leave quota updated successfully!');
      fetchEmployeeLeaveData();
      setIsQuotaModalOpen(false);
      if (handler) handler();
    } catch (err) {
      console.error('Error saving leave quota:', err);
      toast.error(err.response?.data?.error || err.message || 'Failed to update leave quota');
    } finally {
      setSavingQuota(false);
    }
  };

  function formatDate(isoDateString) {
    if (!isoDateString) return 'N/A';
    try {
      const date = new Date(isoDateString);
      if (isNaN(date.getTime())) return 'N/A';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return 'N/A';
    }
  }

  if (!selectedStaff) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[350px]">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3 text-2xl">
          <FiUser />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Select an employee
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Click any staff row to view full details and contract profile
        </p>
      </div>
    );
  }

  const subTabs = [
    { id: 'colleague', label: 'Colleague', icon: <FiUser /> },
    { id: 'role-access', label: 'Role Access', icon: <FiShield /> },
    { id: 'leave-quota', label: 'Leave Quota', icon: <FiCalendar /> },
    { id: 'availability', label: 'Availability', icon: <FiClock /> },
    { id: 'declarations', label: 'Declarations', icon: <FiFileText /> },
    { id: 'billing', label: 'Billing', icon: <FiDollarSign /> },
  ];

  const getRoleBadge = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200/80 dark:border-purple-800';
    }
    if (r === 'agent') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/80 dark:border-blue-800';
    }
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-800';
  };

  const initial = (selectedStaff?.username || 'U').charAt(0).toUpperCase();

  // Metrics for Leave Quota
  const annualQuota = leaveBalance?.annualEntitlement !== undefined ? leaveBalance.annualEntitlement : 12;
  const usedPaidDays = leaveBalance?.usedDays || 0;
  const remainingPaidDays = Math.max(0, annualQuota - usedPaidDays);
  const unpaidDaysTaken = leaveBalance?.unpaidDays || leaveBalance?.usedBreakdown?.unpaid || 0;

  return (
    <div className="w-full flex flex-col h-full bg-white dark:bg-boxdark rounded-2xl overflow-hidden font-sans">
      {/* Header Profile Section */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20 shrink-0">
              {initial}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  {selectedStaff?.username}
                </h3>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${getRoleBadge(
                    selectedStaff?.role
                  )}`}
                >
                  {selectedStaff?.role || 'Staff'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {selectedStaff?.email || 'No email provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Edit Employee Trigger Modal */}
            <EditEmployee
              skills={skills}
              licenses={licenses}
              countries={countries}
              handler={handler}
              userData={selectedStaff}
            />

            <button
              onClick={() => Ondelete(selectedStaff)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
              title="Delete Staff"
            >
              <FiTrash2 className="text-lg" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Close panel"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs Nav */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto no-scrollbar border-b border-slate-200/60 dark:border-slate-700/60 pb-1">
          {subTabs.map((tab) => {
            const isActive = tabIndex === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTabIndex(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-5">
        {/* TAB 1: COLLEAGUE PROFILE */}
        {tabIndex === 'colleague' && (
          <div className="space-y-4">
            {/* Personal Information Card */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <FiUser className="text-primary text-sm" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Personal Information
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FiCalendar className="text-slate-400" />
                    {formatDate(selectedStaff?.dob)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Gender</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                    {selectedStaff?.gender || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Language</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <FiGlobe className="text-slate-400" />
                    {selectedStaff?.language || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-0.5">Telephone</span>
                  <a
                    href={`tel:${selectedStaff?.telephone}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-1.5"
                  >
                    <FiPhone />
                    {selectedStaff?.telephone ? `+${selectedStaff?.telephone}` : 'N/A'}
                  </a>
                </div>

                <div className="sm:col-span-2 md:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Email Address</span>
                  <a
                    href={`mailto:${selectedStaff?.email}`}
                    className="font-semibold text-primary hover:underline flex items-center gap-1.5 truncate"
                  >
                    <FiMail />
                    {selectedStaff?.email || 'N/A'}
                  </a>
                </div>

                <div className="sm:col-span-2 md:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Residential Address</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5">
                    <FiMapPin className="text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      {[
                        selectedStaff?.houseNumber,
                        selectedStaff?.street,
                        selectedStaff?.addition,
                        selectedStaff?.city,
                        selectedStaff?.postCode,
                        selectedStaff?.country,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'No address provided'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Driving License Card */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <FiTruck className="text-primary text-sm" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Driving Licenses
                </h4>
              </div>

              {selectedStaff?.drivingLicense && selectedStaff?.drivingLicense.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedStaff.drivingLicense.map((license, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {license}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No driving license assigned</p>
              )}
            </div>

            {/* Employment & Contract Card */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-primary text-sm" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Contract & Employment
                  </h4>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <FiCheckCircle className="text-[10px]" />
                  Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">In Service</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {formatDate(selectedStaff?.inservice)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Probation Status</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedStaff?.trailPeriod
                      ? `Until ${formatDate(selectedStaff?.trailPeriod)}`
                      : 'No probationary period'}
                  </span>
                </div>
              </div>

              {selectedStaff?.contract && (
                <div className="mt-2 bg-white dark:bg-slate-900 rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 font-semibold pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span>Contract Details</span>
                    <span className="font-bold text-primary">
                      {selectedStaff?.contract?.type || 'Standard'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Start Date</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatDate(selectedStaff?.contract?.startDate)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">End Date</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStaff?.contract?.endDate
                          ? formatDate(selectedStaff?.contract?.endDate)
                          : 'Indefinite'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Hourly Wage</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        €{selectedStaff?.contract?.hourlyWage || '0.00'}/hr
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Weekly Hours</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {selectedStaff?.contract?.hoursWeek || '0'} hrs/week
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Skills & Expertise Card */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <FiAward className="text-primary text-sm" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Skills & Certifications
                </h4>
              </div>

              {selectedStaff?.skills && selectedStaff?.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedStaff.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No skills registered</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ROLE BASE ACCESS MANAGEMENT */}
        {tabIndex === 'role-access' && (
          <div className="space-y-5">
            {/* Header / Info card */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <div className="flex items-center gap-2">
                    <FiShield className="text-primary text-base" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Role-Based Access Control (RBAC)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Manage visible CRM modules and granular capabilities for{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {selectedStaff?.username}
                    </strong>
                    .
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${getRoleBadge(
                      selectedStaff?.role
                    )}`}
                  >
                    Role: {selectedStaff?.role || 'Staff'}
                  </span>
                </div>
              </div>

              {selectedStaff?.role === 'Admin' ? (
                <div className="mt-4 p-4 rounded-xl bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
                  <FiAlertCircle className="text-purple-600 text-lg mt-0.5 shrink-0" />
                  <div className="text-xs text-purple-900 dark:text-purple-200">
                    <strong className="font-bold">Full Administrator Access</strong>
                    <p className="mt-0.5">
                      This user has the <strong>Admin</strong> role. Administrators inherently have
                      unrestricted read and write permissions to all CRM modules, system settings,
                      and role assignments.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <ModulePermissionsSelector
                    value={selectedAccess}
                    onChange={setSelectedAccess}
                    role={selectedStaff?.role || 'Staff'}
                  />

                  {/* Save Button Bar */}
                  <div className="pt-3 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-xs text-slate-400">
                      {selectedAccess.length} of {ALL_MODULE_IDS.length} modules granted
                    </span>
                    <button
                      type="button"
                      onClick={handleSavePermissions}
                      disabled={savingPermissions}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/25 active:scale-[0.98] transition cursor-pointer disabled:opacity-60"
                    >
                      <FiSave className="text-sm" />
                      <span>{savingPermissions ? 'Saving Access...' : 'Save Permissions'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LEAVE QUOTA & AUTOMATIC NON-PAID MANAGEMENT */}
        {tabIndex === 'leave-quota' && (
          <div className="space-y-5">
            {/* Header Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAward className="text-primary text-base" />
                  <span>Leave Quotas & Balances</span>
                </h4>

              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Year:</span>
                  <select
                    value={leaveYear}
                    onChange={(e) => setLeaveYear(parseInt(e.target.value))}
                    className="bg-transparent text-slate-700 dark:text-slate-200 font-bold focus:outline-none cursor-pointer"
                  >
                    {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                      <option key={yr} value={yr} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQuotaModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-sm shadow-primary/25 active:scale-[0.98] transition cursor-pointer"
                >
                  <FiEdit2 className="text-xs" />
                  <span>Manage Quota</span>
                </button>
              </div>
            </div>

            {/* 4 KPI Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Annual Quota */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
                  <span>Paid Quota</span>
                  <button
                    type="button"
                    onClick={() => setIsQuotaModalOpen(true)}
                    className="text-primary hover:underline text-[10px] font-bold inline-flex items-center gap-0.5"
                  >
                    <FiEdit2 className="text-[10px]" />
                    <span>Manage</span>
                  </button>
                </div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {annualQuota} <span className="text-xs font-medium text-slate-400">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Year {leaveYear}</span>
              </div>

              {/* Paid Used */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
                  <span>Paid Used</span>
                  <FiCalendar className="text-amber-500" />
                </div>
                <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  {usedPaidDays} <span className="text-xs font-medium text-slate-400">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Approved Leaves</span>
              </div>

              {/* Remaining Paid */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
                  <span>Remaining</span>
                  <FiCheckCircle className="text-emerald-500" />
                </div>
                <div
                  className={`text-xl font-extrabold ${remainingPaidDays > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                    }`}
                >
                  {remainingPaidDays} <span className="text-xs font-medium text-slate-400">Days</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {remainingPaidDays > 0 ? 'Paid Available' : 'Quota Exhausted'}
                </span>
              </div>

              {/* Non-Paid Taken */}
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1 font-semibold">
                  <span>Non-Paid Used</span>
                  <FiDollarSign className="text-purple-500" />
                </div>
                <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                  {unpaidDaysTaken} <span className="text-xs font-medium text-slate-400">Days</span>
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 mt-0.5 block font-semibold">
                  Auto Unpaid Leaves
                </span>
              </div>
            </div>

            {/* Manage Quota Popup Modal Dialog */}
            {isQuotaModalOpen && (
              <Dialog
                open={isQuotaModalOpen}
                onClose={() => setIsQuotaModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                  className: 'rounded-2xl dark:bg-boxdark overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl',
                }}
              >
                {/* Modal Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-primary to-blue-600 text-white flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <FiAward className="text-white" />
                      <span>Adjust Annual Quota</span>
                    </h3>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Employee: <strong>{selectedStaff?.username}</strong> • Year {leaveYear}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsQuotaModalOpen(false)}
                    className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    title="Close"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleSaveLeaveQuota} className="p-5 space-y-4 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Target Year
                    </label>
                    <select
                      value={leaveYear}
                      onChange={(e) => setLeaveYear(parseInt(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Annual Paid Entitlement (Days) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={quotaInput}
                      onChange={(e) => setQuotaInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Standard annual allocated vacation days (Default: 12.0).
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Adjustment Notes / Remarks (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={quotaNotes}
                      onChange={(e) => setQuotaNotes(e.target.value)}
                      placeholder="Remarks about contract changes, adjustments, or special quota approvals..."
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  {/* Summary preview */}
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-between font-bold">
                    <span>Annual Paid Quota:</span>
                    <span className="text-primary text-sm font-extrabold">
                      {parseFloat(quotaInput) || 12} Days
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsQuotaModalOpen(false)}
                      disabled={savingQuota}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingQuota}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 transition cursor-pointer disabled:opacity-60"
                    >
                      {savingQuota ? 'Saving Quota...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </Dialog>
            )}

            {/* Leave History Table */}
            <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden shadow-xs">
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiClock className="text-primary text-sm" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Leave Request History ({leaveRequests.length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold">Year {leaveYear}</span>
              </div>

              {loadingLeaveData ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading leave records...</div>
              ) : leaveRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <FiCalendar className="mx-auto text-2xl mb-2 opacity-50" />
                  <p className="text-xs font-semibold">No leave requests found for {leaveYear}</p>
                  <p className="text-[11px] mt-0.5">Any leaves applied by this colleague will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="p-3">Dates & Duration</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Paid / Unpaid Split</th>
                        <th className="p-3">Reason</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {leaveRequests.map((req) => {
                        const paid = req.paidDays !== undefined ? req.paidDays : req.totalDays;
                        const unpaid = req.unpaidDays || 0;

                        return (
                          <tr key={req._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50">
                            <td className="p-3">
                              <div className="font-bold text-slate-800 dark:text-slate-100">
                                {formatDate(req.startDate)}
                                {req.endDate && req.endDate !== req.startDate && ` → ${formatDate(req.endDate)}`}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {req.totalDays} {req.totalDays === 1 ? 'Day' : 'Days'} • {req.durationType}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">
                                {req.leaveType}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {paid > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                    {paid} Paid
                                  </span>
                                )}
                                {unpaid > 0 && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                    {unpaid} Non-Paid
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                              {req.reason || '—'}
                            </td>
                            <td className="p-3 text-right">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${req.status === 'Approved'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                    : req.status === 'Rejected'
                                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                  }`}
                              >
                                {req.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: AVAILABILITY */}
        {tabIndex === 'availability' && (
          <div className="bg-white dark:bg-boxdark rounded-2xl">
            <AvailabilityComponent />
          </div>
        )}

        {/* TAB 5: DECLARATIONS */}
        {tabIndex === 'declarations' && (
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl">
              <FiFileText />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              No Declarations Found
            </h4>
            <p className="text-xs text-slate-400">
              There are no declarations or expense receipts submitted for this colleague yet.
            </p>
          </div>
        )}

        {/* TAB 6: BILLING & PAYROLL */}
        {tabIndex === 'billing' && (
          <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-200/80 dark:bg-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-3 text-xl">
              <FiDollarSign />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              Billing & Payroll
            </h4>
            <p className="text-xs text-slate-400">
              Payroll statements and monthly wage slips will be generated at the end of the pay cycle.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSlider;
