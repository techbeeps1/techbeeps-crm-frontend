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
  FiXCircle,
  FiCreditCard,
  FiPaperclip,
  FiShield,
  FiSave,
  FiAlertCircle,
  FiInfo,
  FiCheck,
  FiLayers,
  FiTrendingUp,
  FiEdit2,
  FiDownload,
  FiRefreshCw,
  FiSliders,
  FiRotateCcw,
  FiPlus,
  FiNavigation,
  FiDroplet,
  FiCoffee,
  FiPackage,
  FiTool,
  FiHome,
  FiEye,
} from 'react-icons/fi';
import { Dialog, IconButton } from '@mui/material';
import axios from 'axios';
import toast from 'react-hot-toast';
import { apiPath } from '../../../apiPath';
import EditEmployee from '../../agents/EditEmployee';
import AvailabilityComponent from '../../agents/Available';
import ModulePermissionsSelector, { ALL_MODULE_IDS } from '../../agents/ModulePermissionsSelector';
import ApplyDeclarationModal from './ApplyDeclarationModal';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const getCategoryBadge = (type = '') => {
  switch (type) {
    case 'Travel & Mileage':
      return {
        bg: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        icon: FiNavigation,
      };
    case 'Fuel & Gas':
      return {
        bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        icon: FiDroplet,
      };
    case 'Parking & Tolls':
      return {
        bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        icon: FiMapPin,
      };
    case 'Meals & Subsistence':
      return {
        bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        icon: FiCoffee,
      };
    case 'Materials & Supplies':
      return {
        bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        icon: FiPackage,
      };
    case 'Equipment & Rental':
      return {
        bg: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
        icon: FiTool,
      };
    case 'Accommodation':
      return {
        bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
        icon: FiHome,
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        icon: FiFileText,
      };
  }
};

const getStatusBadge = (status = '') => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Paid':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    case 'Pending':
    default:
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
};

const isPdfUrl = (url = '') => {
  if (!url) return false;
  const str = String(url).toLowerCase();
  return (
    str.startsWith('data:application/pdf') ||
    str.includes('application/pdf') ||
    str.endsWith('.pdf') ||
    str.includes('.pdf?') ||
    str.startsWith('jvberiox')
  );
};

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const StaffSlider = ({ handler, selectedStaff, onClose, Ondelete, skills, licenses, countries }) => {
  const { symbol: currencySymbol } = useCurrency();
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

  // Declarations Management State for Selected Staff
  const [staffDeclarations, setStaffDeclarations] = useState([]);
  const [declarationSummary, setDeclarationSummary] = useState({
    totalAmount: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    paidAmount: 0,
  });
  const [loadingDeclarations, setLoadingDeclarations] = useState(false);
  const [isApplyDeclarationModalOpen, setIsApplyDeclarationModalOpen] = useState(false);
  const [selectedDeclarationForEdit, setSelectedDeclarationForEdit] = useState(null);

  // Status Action Modal State in Slider
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusTargetDecl, setStatusTargetDecl] = useState(null);
  const [targetStatusType, setTargetStatusType] = useState('Pending');
  const [statusComment, setStatusComment] = useState('');
  const [approvedAmountVal, setApprovedAmountVal] = useState('');
  const [paymentRefVal, setPaymentRefVal] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  // Receipt Modal State in Slider
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const [activeReceiptUrl, setActiveReceiptUrl] = useState('');
  const [activeReceiptTitle, setActiveReceiptTitle] = useState('');

  const staffId = selectedStaff?._id || selectedStaff?.id;

  const fetchStaffDeclarations = async () => {
    if (!staffId) return;
    setLoadingDeclarations(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(
        `${apiPath}/api/declarations/employee/${staffId}`,
        { headers }
      );

      if (res.data?.success) {
        setStaffDeclarations(res.data.data || []);
        if (res.data.summary) {
          setDeclarationSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Error fetching staff declarations:', err);
    } finally {
      setLoadingDeclarations(false);
    }
  };

  useEffect(() => {
    if (tabIndex === 'declarations' && staffId) {
      fetchStaffDeclarations();
    }
  }, [tabIndex, staffId]);

  const openStatusModal = (decl, defaultStatus = null) => {
    setStatusTargetDecl(decl);
    setTargetStatusType(defaultStatus || decl?.status || 'Pending');
    setStatusComment(decl?.reviewerComment || '');
    setApprovedAmountVal(decl?.amount !== undefined ? String(decl.amount) : '');
    setPaymentRefVal(
      decl?.paymentReference || `BANK-${new Date().getFullYear()}-${decl?.jobIndex || 'EXP'}`
    );
    setStatusModalOpen(true);
  };

  const handleSaveStatusModal = async (e) => {
    e.preventDefault();
    if (!statusTargetDecl) return;

    setSavingStatus(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        status: targetStatusType,
        reviewerComment: statusComment.trim(),
      };

      if (targetStatusType === 'Approved' && approvedAmountVal) {
        payload.approvedAmount = parseFloat(approvedAmountVal);
      }
      if (targetStatusType === 'Paid') {
        payload.paymentReference = paymentRefVal.trim();
      }

      const res = await axios.put(
        `${apiPath}/api/declarations/${statusTargetDecl._id}/status`,
        payload,
        { headers }
      );

      if (res.data?.success) {
        toast.success(`Declaration status updated to ${targetStatusType}`);
        setStatusModalOpen(false);
        fetchStaffDeclarations();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteStaffDeclaration = async (id) => {
    if (!window.confirm('Delete this declaration?')) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.delete(`${apiPath}/api/declarations/${id}`, { headers });
      if (res.data?.success) {
        toast.success('Declaration deleted');
        fetchStaffDeclarations();
      }
    } catch (err) {
      console.error('Error deleting declaration:', err);
      toast.error('Failed to delete');
    }
  };

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

  // Hours Overview State for this Staff Member
  const [hoursYear, setHoursYear] = useState(currentYear);
  const [hoursMonth, setHoursMonth] = useState('all'); // 'all' or '0'..'11'
  const [hoursData, setHoursData] = useState(null);
  const [loadingHours, setLoadingHours] = useState(false);

  // Fetch Hours for this Employee
  const fetchEmployeeHours = async () => {
    if (!selectedStaff?._id) return;
    setLoadingHours(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {
        employeeId: selectedStaff._id,
        year: hoursYear,
        month: hoursMonth,
      };
      const res = await axios.get(`${apiPath}/api/hours/overview`, { headers, params });
      if (res.data?.success) {
        const empRecord = res.data.data?.[0] || null;
        setHoursData(empRecord);
      }
    } catch (err) {
      console.error('Error fetching employee hours:', err);
    } finally {
      setLoadingHours(false);
    }
  };

  useEffect(() => {
    if (tabIndex === 'hours-overview' && selectedStaff?._id) {
      fetchEmployeeHours();
    }
  }, [tabIndex, selectedStaff?._id, hoursYear, hoursMonth]);

  // Export Individual Employee Timesheet CSV
  const handleExportStaffTimesheet = () => {
    if (!hoursData?.shifts || hoursData.shifts.length === 0) {
      toast.error('No shift records found for this period');
      return;
    }

    const headers = [
      'Date',
      'Job Number',
      'Customer',
      'Work Type',
      'Scheduled Duration (hrs)',
      'Actual Start Time',
      'Actual End Time',
      'Break (mins)',
      'Approved Hours',
      'Overtime Hours',
      'Status',
      'Notes',
    ];

    const rows = hoursData.shifts.map((s) => [
      `"${formatDate(s.date)}"`,
      `"${s.jobIndex || 'N/A'}"`,
      `"${(s.customerName || 'Client').replace(/"/g, '""')}"`,
      `"${s.workType || 'Mover'}"`,
      s.scheduledHours,
      `"${formatTimeOnly(s.actualStartTime)}"`,
      `"${formatTimeOnly(s.actualEndTime)}"`,
      s.breakMinutes || 0,
      s.approvedHours,
      s.overtimeHours || 0,
      `"${s.status}"`,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const cleanName = (selectedStaff?.username || 'Staff').replace(/\s+/g, '_');
    const periodStr = hoursMonth === 'all' ? `Year_${hoursYear}` : `${MONTH_NAMES[parseInt(hoursMonth)]}_${hoursYear}`;
    link.setAttribute('download', `Timesheet_${cleanName}_${periodStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Timesheet exported successfully');
  };

  function formatTimeOnly(isoOrTimeString) {
    if (!isoOrTimeString) return '--:--';
    if (typeof isoOrTimeString === 'string' && isoOrTimeString.length === 5 && isoOrTimeString.includes(':')) {
      return isoOrTimeString;
    }
    try {
      const d = new Date(isoOrTimeString);
      if (isNaN(d.getTime())) return String(isoOrTimeString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '--:--';
    }
  }

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
    { id: 'hours-overview', label: 'Hours Overview', icon: <FiClock /> },
    { id: 'declarations', label: 'Declarations', icon: <FiFileText /> },
    { id: 'billing', label: 'Billing', icon: <FiDollarSign /> },
    { id: 'delete', label: 'Delete', icon: <FiTrash2 className="text-rose-500" /> },
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
            const isDelete = tab.id === 'delete';
            return (
              <button
                key={tab.id}
                onClick={() => setTabIndex(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? isDelete
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-primary text-white shadow-xs'
                    : isDelete
                    ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
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
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                  <FiUser className="text-primary text-sm" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Personal Information
                  </h4>
                </div>

                {/* Edit Button in Top Right Corner of User Details */}
                <EditEmployee
                  skills={skills}
                  licenses={licenses}
                  countries={countries}
                  handler={handler}
                  userData={selectedStaff}
                />
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
                        {formatCurrency(selectedStaff?.contract?.hourlyWage || 0)}/hr
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
            <AvailabilityComponent selectedStaff={selectedStaff} />
          </div>
        )}

        {/* TAB 5: HOURS OVERVIEW */}
        {tabIndex === 'hours-overview' && (
          <div className="space-y-4">
            {/* Filter & Period Controls Bar */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-3.5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Year Select */}
                <select
                  value={hoursYear}
                  onChange={(e) => setHoursYear(parseInt(e.target.value))}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                >
                  {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                {/* Month Select */}
                <select
                  value={hoursMonth}
                  onChange={(e) => setHoursMonth(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                >
                  <option value="all">Full Year (All Months)</option>
                  {MONTH_NAMES.map((m, idx) => (
                    <option key={idx} value={idx.toString()}>
                      {m}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={fetchEmployeeHours}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-all text-xs"
                  title="Refresh hours"
                >
                  <FiRefreshCw className={loadingHours ? 'animate-spin' : ''} />
                </button>
              </div>

              {/* CSV Export */}
              <button
                type="button"
                onClick={handleExportStaffTimesheet}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-white shadow-xs transition-all cursor-pointer"
              >
                <FiDownload />
                <span>Export Timesheet</span>
              </button>
            </div>

            {/* KPI Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Scheduled Hours */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Hours</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-slate-800 dark:text-white">
                    {hoursData?.totalScheduledHours || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">hrs</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {hoursData?.totalJobs || 0} Total Shifts
                </div>
              </div>

              {/* Approved Hours */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Approved Hours</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    {hoursData?.approvedHours || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">hrs</span>
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {hoursData?.totalScheduledHours > 0
                    ? `${((hoursData.approvedHours / hoursData.totalScheduledHours) * 100).toFixed(0)}% approved`
                    : '0% approved'}
                </div>
              </div>

              {/* Overtime */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overtime</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                    {hoursData?.overtimeHours || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">hrs</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Net: {hoursData?.totalNetApprovedHours || 0} hrs
                </div>
              </div>

              {/* Pending Review */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Pending Review</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {hoursData?.pendingHours || 0}
                  </span>
                  <span className="text-[10px] text-slate-400">hrs</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Awaiting review
                </div>
              </div>
            </div>

            {/* Shift Logs Table */}
            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Appointment Shift Records
                </h4>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                  {hoursData?.shifts?.length || 0} Shifts
                </span>
              </div>

              {loadingHours ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FiRefreshCw className="animate-spin text-xl text-primary" />
                  <p className="text-xs">Loading shift records...</p>
                </div>
              ) : !hoursData?.shifts || hoursData.shifts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <FiClock className="text-3xl mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No shift hours recorded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    There are no appointment shifts for this staff member in the selected time period.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-white/60 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/60 dark:border-slate-700/60 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Job / Client</th>
                        <th className="py-2.5 px-3">Role</th>
                        <th className="py-2.5 px-3 text-center">Scheduled</th>
                        <th className="py-2.5 px-3 text-center">Break</th>
                        <th className="py-2.5 px-3 text-center">Approved</th>
                        <th className="py-2.5 px-3 text-center">Overtime</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                        <th className="py-2.5 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/50 dark:divide-slate-700/50 font-medium">
                      {hoursData.shifts.map((s, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-white/50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatDate(s.date)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              Job #{s.jobIndex || 'N/A'}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                              {s.customerName}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                              {s.workType || 'Mover'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="font-semibold text-slate-700 dark:text-slate-300">
                              {s.scheduledHours}h
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatTimeOnly(s.actualStartTime)} - {formatTimeOnly(s.actualEndTime)}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-500">
                            {s.breakMinutes ? `${s.breakMinutes}m` : '--'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                            {s.approvedHours}h
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {s.overtimeHours > 0 ? (
                              <span className="text-purple-600 dark:text-purple-400 font-bold">
                                +{s.overtimeHours}h
                              </span>
                            ) : (
                              <span className="text-slate-400">--</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                s.status === 'Approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                  : s.status === 'Rejected'
                                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-[150px] truncate">
                            {s.notes || '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: DECLARATIONS */}
        {tabIndex === 'declarations' && (
          <div className="space-y-4">
            {/* Mini Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Declared
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white mt-0.5 block">
                  {formatCurrency(declarationSummary?.totalAmount || 0)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                  Pending
                </span>
                <span className="text-sm font-black text-amber-600 dark:text-amber-400 mt-0.5 block">
                  {formatCurrency(declarationSummary?.pendingAmount || 0)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Approved
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {formatCurrency(declarationSummary?.approvedAmount || 0)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
                  Paid / Settled
                </span>
                <span className="text-sm font-black text-purple-600 dark:text-purple-400 mt-0.5 block">
                  {formatCurrency(declarationSummary?.paidAmount || 0)}
                </span>
              </div>
            </div>

            {/* Header & Add Button */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Expense & Allowance Claims ({staffDeclarations.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDeclarationForEdit(null);
                  setIsApplyDeclarationModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-xs cursor-pointer transition-all"
              >
                <FiPlus className="text-xs" />
                <span>Add Declaration</span>
              </button>
            </div>

            {/* Table or Empty State */}
            {loadingDeclarations ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <FiRefreshCw className="animate-spin text-xl mx-auto mb-2 text-primary" />
                <p>Loading declarations...</p>
              </div>
            ) : staffDeclarations.length === 0 ? (
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
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Category & Title</th>
                      <th className="py-2.5 px-3">Job</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Receipt</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {staffDeclarations.map((d) => {
                      const catBadge = getCategoryBadge(d.declarationType);
                      const CatIcon = catBadge.icon;
                      const dateVal = d.expenseDate || d.date || d.createdAt;
                      return (
                        <tr key={d._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 dark:text-slate-300 font-semibold">
                            {formatDate(dateVal)}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="space-y-0.5 max-w-[200px]">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${catBadge.bg}`}
                                >
                                  <CatIcon className="text-[10px] shrink-0" />
                                  <span className="truncate">{d.declarationType}</span>
                                </span>
                                {d.items && d.items.length > 1 && (
                                  <span className="px-1 py-0.2 rounded text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/40 text-primary border border-blue-200 dark:border-blue-900/60">
                                    {d.items.length} items
                                  </span>
                                )}
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {d.title}
                              </p>
                              {d.description && (
                                <p className="text-[10px] text-slate-400 truncate" title={d.description}>
                                  {d.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-[11px] text-slate-500">
                            {d.jobIndex ? (
                              <span className="font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
                                Job: {d.jobIndex}
                              </span>
                            ) : (
                              '--'
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                            {formatCurrency(d.amount || 0)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {d.receiptUrl ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveReceiptUrl(d.receiptUrl);
                                  setActiveReceiptTitle(d.title);
                                  setReceiptViewerOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-all cursor-pointer"
                              >
                                <FiPaperclip className="text-xs" />
                                <span>View</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">--</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => openStatusModal(d, d.status)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all ${getStatusBadge(
                                d.status
                              )}`}
                              title="Click to manage status"
                            >
                              <span>{d.status}</span>
                              <FiEdit2 className="text-[8px] opacity-70" />
                            </button>
                            {d.reviewedBy && d.status !== 'Pending' && (
                              <span className="text-[8px] text-slate-400 block mt-0.5 truncate max-w-[90px]">
                                by {d.reviewerName || 'Manager'}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {d.status === 'Pending' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openStatusModal(d, 'Approved')}
                                    className="p-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 cursor-pointer"
                                    title="Approve"
                                  >
                                    <FiCheck className="text-xs" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openStatusModal(d, 'Rejected')}
                                    className="p-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                                    title="Reject"
                                  >
                                    <FiX className="text-xs" />
                                  </button>
                                </>
                              )}
                              {d.status === 'Approved' && (
                                <button
                                  type="button"
                                  onClick={() => openStatusModal(d, 'Paid')}
                                  className="p-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer"
                                  title="Mark as Paid"
                                >
                                  <FiCreditCard className="text-xs" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDeclarationForEdit(d);
                                  setIsApplyDeclarationModalOpen(true);
                                }}
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer"
                                title={d.status === 'Pending' ? 'Edit' : `View (${d.status} - Read Only)`}
                              >
                                {d.status === 'Pending' ? (
                                  <FiEdit2 className="text-xs" />
                                ) : (
                                  <FiEye className="text-xs text-slate-400 hover:text-primary" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteStaffDeclaration(d._id)}
                                className="p-1 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Delete"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal 1: Create / Edit Declaration */}
            <ApplyDeclarationModal
              open={isApplyDeclarationModalOpen}
              onClose={() => {
                setIsApplyDeclarationModalOpen(false);
                setSelectedDeclarationForEdit(null);
              }}
              onSuccess={() => {
                fetchStaffDeclarations();
              }}
              defaultEmployeeId={staffId}
              initialData={selectedDeclarationForEdit}
            />

            {/* Modal 2: Status Management Modal */}
            <Dialog
              open={statusModalOpen}
              onClose={() => setStatusModalOpen(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                style: {
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                },
              }}
            >
              <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <FiSliders className="text-primary text-lg" />
                      <span>Manage Declaration Status</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Change status, approve, reimburse, or reset claim back to Pending
                    </p>
                  </div>
                  <IconButton size="small" onClick={() => setStatusModalOpen(false)}>
                    <FiX className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                  </IconButton>
                </div>

                <form onSubmit={handleSaveStatusModal} className="space-y-5">
                  {/* Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                          {statusTargetDecl?.jobIndex
                            ? `Job: ${statusTargetDecl?.jobIndex}`
                            : `Ref: ${statusTargetDecl?._id?.slice(-6)?.toUpperCase() || 'EXP'}`}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {selectedStaff?.username || 'Staff'}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {statusTargetDecl?.title || 'Declaration'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDate(statusTargetDecl?.expenseDate || statusTargetDecl?.date)} ·{' '}
                        {statusTargetDecl?.declarationType}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-400 block font-medium">Claim Amount</span>
                      <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(statusTargetDecl?.amount || 0)}
                      </span>
                      <div className="mt-1">
                        <span
                          className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            statusTargetDecl?.status
                          )}`}
                        >
                          Current: {statusTargetDecl?.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Status Cards */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                      Select Target Status
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {/* Pending */}
                      <button
                        type="button"
                        onClick={() => setTargetStatusType('Pending')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          targetStatusType === 'Pending'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <FiClock
                          className={`text-base ${
                            targetStatusType === 'Pending' ? 'text-amber-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs">Pending</span>
                        <span className="text-[9px] opacity-75">Revert / Reset</span>
                      </button>

                      {/* Approved */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStatusType('Approved');
                          if (!approvedAmountVal && statusTargetDecl?.amount) {
                            setApprovedAmountVal(String(statusTargetDecl.amount));
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          targetStatusType === 'Approved'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <FiCheckCircle
                          className={`text-base ${
                            targetStatusType === 'Approved' ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs">Approved</span>
                        <span className="text-[9px] opacity-75">Accept Claim</span>
                      </button>

                      {/* Paid */}
                      <button
                        type="button"
                        onClick={() => {
                          setTargetStatusType('Paid');
                          if (!paymentRefVal) {
                            setPaymentRefVal(
                              statusTargetDecl?.paymentReference ||
                                `BANK-${new Date().getFullYear()}-${statusTargetDecl?.jobIndex || 'EXP'}`
                            );
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          targetStatusType === 'Paid'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/30 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <FiCreditCard
                          className={`text-base ${
                            targetStatusType === 'Paid' ? 'text-blue-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs">Paid</span>
                        <span className="text-[9px] opacity-75">Reimbursed</span>
                      </button>

                      {/* Rejected */}
                      <button
                        type="button"
                        onClick={() => setTargetStatusType('Rejected')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          targetStatusType === 'Rejected'
                            ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <FiXCircle
                          className={`text-base ${
                            targetStatusType === 'Rejected' ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs">Rejected</span>
                        <span className="text-[9px] opacity-75">Decline Claim</span>
                      </button>

                      {/* Cancelled */}
                      <button
                        type="button"
                        onClick={() => setTargetStatusType('Cancelled')}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          targetStatusType === 'Cancelled'
                            ? 'border-slate-500 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 ring-2 ring-slate-500/30 font-bold shadow-xs'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <FiX
                          className={`text-base ${
                            targetStatusType === 'Cancelled'
                              ? 'text-slate-600 dark:text-slate-300'
                              : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs">Cancelled</span>
                        <span className="text-[9px] opacity-75">Void Claim</span>
                      </button>
                    </div>
                  </div>

                  {/* Context notice */}
                  {targetStatusType === 'Pending' && (
                    <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <FiRotateCcw className="text-amber-600 shrink-0 mt-0.5 text-sm" />
                      <div>
                        <p className="font-bold">Revert / Reset to Pending</p>
                        <p className="mt-0.5 text-[11px] opacity-90">
                          This will clear previous reviewer and payment records. The claim will return to active pending status.
                        </p>
                      </div>
                    </div>
                  )}

                  {targetStatusType === 'Approved' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Approved Amount ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={approvedAmountVal}
                        onChange={(e) => setApprovedAmountVal(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary"
                        required
                      />
                    </div>
                  )}

                  {targetStatusType === 'Paid' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Payment Reference / Transfer ID
                      </label>
                      <input
                        type="text"
                        value={paymentRefVal}
                        onChange={(e) => setPaymentRefVal(e.target.value)}
                        placeholder="e.g. SEPA-TXN-129402"
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary"
                        required
                      />
                    </div>
                  )}

                  {targetStatusType === 'Rejected' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Rejection Reason <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={2}
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        placeholder="Reason for rejecting this claim..."
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary resize-none"
                        required
                      />
                    </div>
                  )}

                  {targetStatusType !== 'Rejected' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Reviewer Note (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        placeholder="Add notes for records..."
                        className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-primary resize-none"
                      />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setStatusModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingStatus}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer transition-all ${
                        targetStatusType === 'Approved'
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                          : targetStatusType === 'Paid'
                          ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                          : targetStatusType === 'Rejected'
                          ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                          : targetStatusType === 'Pending'
                          ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                          : 'bg-slate-700 hover:bg-slate-800 shadow-slate-700/20'
                      }`}
                    >
                      {savingStatus ? (
                        <>
                          <FiRefreshCw className="animate-spin text-xs" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          {targetStatusType === 'Pending' && <FiRotateCcw className="text-xs" />}
                          {targetStatusType === 'Approved' && <FiCheck className="text-xs" />}
                          {targetStatusType === 'Paid' && <FiCreditCard className="text-xs" />}
                          {targetStatusType === 'Rejected' && <FiX className="text-xs" />}
                          {targetStatusType === 'Cancelled' && <FiX className="text-xs" />}
                          <span>Set Status to {targetStatusType}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </Dialog>

            {/* Modal 3: Receipt Viewer Modal */}
            <Dialog
              open={receiptViewerOpen}
              onClose={() => setReceiptViewerOpen(false)}
              maxWidth="md"
              fullWidth
              PaperProps={{
                style: {
                  borderRadius: '24px',
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                },
              }}
            >
              <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <FiPaperclip className="text-primary" />
                      <span>Receipt Attachment</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{activeReceiptTitle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeReceiptUrl && (
                      <a
                        href={activeReceiptUrl}
                        download={`receipt-${activeReceiptTitle || 'doc'}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary transition-colors inline-flex items-center gap-1 text-xs font-bold"
                        title="Download Receipt"
                      >
                        <FiDownload />
                        <span>Download</span>
                      </a>
                    )}
                    <IconButton size="small" onClick={() => setReceiptViewerOpen(false)}>
                      <FiX className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                    </IconButton>
                  </div>
                </div>

                <div className="bg-slate-100 dark:bg-slate-900/60 rounded-2xl p-2 min-h-[300px] max-h-[70vh] flex items-center justify-center overflow-auto">
                  {isPdfUrl(activeReceiptUrl) ? (
                    <iframe
                      src={activeReceiptUrl}
                      title="Receipt PDF Preview"
                      className="w-full h-[65vh] rounded-xl border-none shadow-xs"
                    />
                  ) : activeReceiptUrl ? (
                    <img
                      src={activeReceiptUrl}
                      alt="Receipt Attachment"
                      className="max-h-[65vh] w-auto max-w-full rounded-xl object-contain shadow-md mx-auto"
                    />
                  ) : (
                    <div className="text-center text-slate-400 text-xs py-12">
                      <FiPaperclip className="text-3xl mx-auto mb-2 opacity-40" />
                      <p>No receipt attachment available</p>
                    </div>
                  )}
                </div>
              </div>
            </Dialog>
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

        {/* TAB 7: DELETE EMPLOYEE */}
        {tabIndex === 'delete' && (
          <div className="space-y-4">
            <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 sm:p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center text-3xl shadow-xs">
                <FiTrash2 />
              </div>

              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Delete {selectedStaff?.username || 'Employee'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Are you sure you want to permanently delete this employee? This action cannot be undone and will remove their profile, system access, and work schedules.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 max-w-sm mx-auto border border-rose-100 dark:border-rose-900/30 text-xs text-left space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Employee Name:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{selectedStaff?.username}</strong>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{selectedStaff?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Role:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{selectedStaff?.role || 'Staff'}</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setTabIndex('colleague')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => Ondelete(selectedStaff)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/25 active:scale-95 transition-all cursor-pointer"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Delete Employee</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSlider;
