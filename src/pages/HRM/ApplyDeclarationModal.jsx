import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import { Dialog, IconButton, Menu, MenuItem } from '@mui/material';
import {
  FiX,
  FiUploadCloud,
  FiFileText,
  FiUser,
  FiBriefcase,
  FiPaperclip,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiNavigation,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiLayers,
  FiDroplet,
  FiCoffee,
  FiPackage,
  FiTool,
  FiHome,
  FiChevronDown,
  FiLock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

export const CATEGORIES = [
  {
    id: 'Travel & Mileage',
    label: 'Travel & Mileage (Km)',
    shortLabel: 'Travel & Mileage',
    icon: FiNavigation,
    iconColor: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/60',
    borderColor: 'border-blue-200 dark:border-blue-900/60',
  },
  {
    id: 'Fuel & Gas',
    label: 'Fuel & Gas',
    shortLabel: 'Fuel & Gas',
    icon: FiDroplet,
    iconColor: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/60',
    borderColor: 'border-amber-200 dark:border-amber-900/60',
  },
  {
    id: 'Parking & Tolls',
    label: 'Parking & Tolls / Vignette',
    shortLabel: 'Parking & Tolls',
    icon: FiMapPin,
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/60',
    borderColor: 'border-indigo-200 dark:border-indigo-900/60',
  },
  {
    id: 'Meals & Subsistence',
    label: 'Meals & Subsistence',
    shortLabel: 'Meals & Food',
    icon: FiCoffee,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/60',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'Materials & Supplies',
    label: 'Materials & Supplies',
    shortLabel: 'Materials',
    icon: FiPackage,
    iconColor: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/60',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    id: 'Equipment & Rental',
    label: 'Equipment & Rental',
    shortLabel: 'Equipment',
    icon: FiTool,
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/60',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  {
    id: 'Accommodation',
    label: 'Accommodation / Hotel',
    shortLabel: 'Hotel & Stay',
    icon: FiHome,
    iconColor: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/60',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
  {
    id: 'Other Out-of-Pocket',
    label: 'Other Out-of-Pocket',
    shortLabel: 'Other Expense',
    icon: FiFileText,
    iconColor: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
  },
];

// Custom Category Dropdown Component (Uses Portal Menu to completely avoid table overflow clipping)
const CategoryCustomDropdown = ({ value, onChange, disabled = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    if (disabled) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (categoryId) => {
    if (disabled) return;
    onChange(categoryId);
    handleClose();
  };

  const currentCat = CATEGORIES.find((c) => c.id === value) || CATEGORIES[0];
  const IconComp = currentCat.icon;

  return (
    <div>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-left shadow-xs transition-all ${
          disabled
            ? 'opacity-75 cursor-not-allowed bg-slate-100 dark:bg-slate-800'
            : 'bg-white dark:bg-boxdark hover:border-primary/60 dark:hover:border-primary/60 cursor-pointer active:scale-[0.99]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-lg ${currentCat.bgColor} ${currentCat.iconColor} border ${currentCat.borderColor} flex items-center justify-center shrink-0 text-xs shadow-xs`}
          >
            <IconComp />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
            {currentCat.shortLabel || currentCat.label}
          </span>
        </div>
        {!disabled && (
          <FiChevronDown
            className={`text-slate-400 text-xs shrink-0 transition-transform duration-200 ${
              open ? 'rotate-180 text-primary' : ''
            }`}
          />
        )}
      </button>

      {/* Portal Menu (Rendered outside table to prevent scrollbars & overflow cutoffs) */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 6,
          sx: {
            borderRadius: '16px',
            mt: 0.8,
            minWidth: 260,
            maxWidth: 300,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            p: 0.5,
            bgcolor: '#ffffff',
            '& .MuiMenuItem-root': {
              borderRadius: '10px',
              px: 1.5,
              py: 0.8,
              my: 0.25,
            },
          },
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
          Select Category
        </div>
        <div className="p-1 space-y-0.5 max-h-60 overflow-y-auto">
          {CATEGORIES.map((cat) => {
            const ItemIcon = cat.icon;
            const isSelected = cat.id === value;
            return (
              <MenuItem
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                selected={isSelected}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                  bgcolor: isSelected ? 'rgba(59, 130, 246, 0.08) !important' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(241, 245, 249, 0.8)',
                  },
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg ${cat.bgColor} ${cat.iconColor} border ${cat.borderColor} flex items-center justify-center shrink-0 text-xs`}
                  >
                    <ItemIcon />
                  </div>
                  <span
                    className={`text-xs truncate ${
                      isSelected ? 'font-bold text-primary' : 'font-medium text-slate-800'
                    }`}
                  >
                    {cat.label}
                  </span>
                </div>
                {isSelected && <FiCheck className="text-primary text-xs shrink-0 font-bold ml-2" />}
              </MenuItem>
            );
          })}
        </div>
      </Menu>
    </div>
  );
};

const createDefaultItem = (type = 'Travel & Mileage') => ({
  id: Date.now() + Math.random(),
  declarationType: type,
  title: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  distanceKm: '',
  startLocation: '',
  destinationLocation: '',
  showRouteDetails: false,
});

const ApplyDeclarationModal = ({
  open,
  onClose,
  onSuccess,
  defaultEmployeeId = null,
  initialData = null,
}) => {
  const { symbol: currencySymbol } = useCurrency();
  const { userData, id, role, isAdmin } = useContext(UserContext) || {};
  const isManager = isAdmin || role === 'Admin' || userData?.role === 'Admin';
  const currentUserId = userData?.userId || userData?._id || id;

  // If declaration exists and is not Pending, lock editing
  const isLocked = Boolean(initialData && initialData.status && initialData.status !== 'Pending');

  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);

  // Form State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    defaultEmployeeId || (isManager ? '' : currentUserId)
  );
  const [selectedJobId, setSelectedJobId] = useState('');
  const [description, setDescription] = useState('');

  // Line items state (Invoice items style)
  const [items, setItems] = useState([createDefaultItem()]);

  // Receipt upload
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [receiptName, setReceiptName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Fetch employees and jobs
  useEffect(() => {
    if (open) {
      fetchEmployeesAndJobs();
      if (initialData) {
        setSelectedEmployeeId(initialData.employeeId?._id || initialData.employeeId || '');
        setSelectedJobId(initialData.jobId?._id || initialData.jobId || '');
        setDescription(initialData.description || '');
        setReceiptUrl(initialData.receiptUrl || '');
        setReceiptName(initialData.receiptName || '');

        if (initialData.items && Array.isArray(initialData.items) && initialData.items.length > 0) {
          setItems(
            initialData.items.map((it) => ({
              id: it._id || Date.now() + Math.random(),
              declarationType: it.declarationType || 'Travel & Mileage',
              title: it.title || '',
              amount: it.amount !== undefined ? String(it.amount) : '',
              date: it.date
                ? new Date(it.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              distanceKm: it.distanceKm ? String(it.distanceKm) : '',
              startLocation: it.startLocation || '',
              destinationLocation: it.destinationLocation || '',
              showRouteDetails: Boolean(it.startLocation || it.destinationLocation),
            }))
          );
        } else {
          // Construct single item from legacy data
          setItems([
            {
              id: Date.now() + Math.random(),
              declarationType: initialData.declarationType || 'Travel & Mileage',
              title: initialData.title || '',
              amount: initialData.amount !== undefined ? String(initialData.amount) : '',
              date: initialData.date
                ? new Date(initialData.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0],
              distanceKm: initialData.distanceKm ? String(initialData.distanceKm) : '',
              startLocation: initialData.startLocation || '',
              destinationLocation: initialData.destinationLocation || '',
              showRouteDetails: Boolean(
                initialData.startLocation || initialData.destinationLocation
              ),
            },
          ]);
        }
      } else {
        // Reset form
        setSelectedEmployeeId(defaultEmployeeId || (isManager ? '' : currentUserId));
        setSelectedJobId('');
        setDescription('');
        setReceiptUrl('');
        setReceiptName('');
        setItems([createDefaultItem()]);
      }
    }
  }, [open, defaultEmployeeId, initialData]);

  const fetchEmployeesAndJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [empRes, jobRes] = await Promise.all([
        axios.get(`${apiPath}/user/all`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${apiPath}/api/jobList`, { headers }).catch(() => ({ data: [] })),
      ]);

      const rawEmps = Array.isArray(empRes.data)
        ? empRes.data
        : empRes.data?.data || empRes.data?.users || [];
      const staffList = Array.isArray(rawEmps)
        ? rawEmps.filter((u) => u && (u._id || u.id))
        : [];
      setEmployees(staffList);

      const rawJobs = Array.isArray(jobRes.data?.jobList)
        ? jobRes.data.jobList
        : Array.isArray(jobRes.data)
        ? jobRes.data
        : jobRes.data?.jobs || jobRes.data?.data || [];
      setJobs(Array.isArray(rawJobs) ? rawJobs : []);
    } catch (err) {
      console.error('Error fetching modal options:', err);
    }
  };

  // Line item handlers
  const handleAddItem = () => {
    setItems((prev) => [...prev, createDefaultItem()]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      // Reset the single item
      setItems([createDefaultItem()]);
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleRoute = (index) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        showRouteDetails: !updated[index].showRouteDetails,
      };
      return updated;
    });
  };

  // Calculate total claim amount
  const totalClaimAmount = items.reduce((sum, it) => {
    const val = parseFloat(it.amount);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // Upload receipt
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setUploadingReceipt(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token
        ? { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'multipart/form-data' };

      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('documentType', 'Declaration Receipt');

      const res = await axios.post(`${apiPath}/api/uploadDocument`, formData, { headers });

      if (res.data?.path || res.data?.data?.path) {
        const fileUrl = res.data.path || res.data.data.path;
        setReceiptUrl(fileUrl);
        setReceiptName(file.name);
        toast.success('Receipt attached successfully');
      } else {
        // Fallback: Read as data URL if S3 is unavailable
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptUrl(reader.result);
          setReceiptName(file.name);
          toast.success('Receipt attached');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Upload error:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptUrl(reader.result);
        setReceiptName(file.name);
        toast.success('Receipt attached locally');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleOpenReceiptInNewTab = (url) => {
    if (!url) return;
    if (url.startsWith('data:')) {
      try {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      } catch (e) {
        window.open(url, '_blank');
      }
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLocked) {
      toast.error(
        `Cannot modify a declaration with status '${initialData?.status}'. Revert status to 'Pending' first.`
      );
      return;
    }

    const finalEmpId = selectedEmployeeId || currentUserId;
    if (!finalEmpId) {
      toast.error('Please select an employee');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one expense item');
      return;
    }

    // Validate items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.title || !it.title.trim()) {
        toast.error(`Please provide a description for Item #${i + 1}`);
        return;
      }
      const itAmt = parseFloat(it.amount);
      if (isNaN(itAmt) || itAmt <= 0) {
        toast.error(`Please enter a valid amount greater than 0 for Item #${i + 1}`);
        return;
      }
    }

    if (totalClaimAmount <= 0) {
      toast.error('Total claim amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formattedItems = items.map((it) => ({
        declarationType: it.declarationType,
        title: it.title.trim(),
        amount: parseFloat(it.amount) || 0,
        date: it.date,
        distanceKm: it.declarationType === 'Travel & Mileage' ? parseFloat(it.distanceKm) || 0 : 0,
        startLocation: (it.startLocation || '').trim(),
        destinationLocation: (it.destinationLocation || '').trim(),
      }));

      const primaryItem = formattedItems[0] || {};

      const payload = {
        employeeId: finalEmpId,
        declarationType: primaryItem.declarationType || 'Travel & Mileage',
        title:
          formattedItems.length > 1
            ? `${primaryItem.title} (+${formattedItems.length - 1} more)`
            : primaryItem.title,
        amount: Number(totalClaimAmount.toFixed(2)),
        currency: 'EUR',
        date: primaryItem.date || new Date().toISOString().split('T')[0],
        distanceKm: primaryItem.distanceKm || 0,
        startLocation: primaryItem.startLocation || '',
        destinationLocation: primaryItem.destinationLocation || '',
        jobId: selectedJobId || null,
        description: description.trim(),
        receiptUrl,
        receiptName,
        items: formattedItems,
      };

      const targetId = initialData?._id || initialData?.id;
      if (targetId) {
        // Update
        const res = await axios.put(`${apiPath}/api/declarations/${targetId}`, payload, {
          headers,
        });
        if (res.data?.success || res.status === 200) {
          toast.success('Declaration updated successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      } else {
        // Create
        const res = await axios.post(`${apiPath}/api/declarations`, payload, { headers });
        if (res.data?.success || res.status === 200) {
          toast.success('Declaration submitted successfully');
          if (onSuccess) onSuccess();
          onClose();
        }
      }
    } catch (err) {
      console.error('Error submitting declaration:', err);
      toast.error(err.response?.data?.message || 'Failed to submit declaration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '24px',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                isLocked
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-gradient-to-tr from-primary to-blue-500 text-white shadow-primary/20'
              }`}
            >
              {isLocked ? <FiLock /> : <FiFileText />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>
                  {isLocked
                    ? `Declaration Details (${initialData?.status})`
                    : initialData
                    ? 'Edit Declaration Claim'
                    : 'New Expense Declaration'}
                </span>
                {isLocked && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Read Only
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isLocked
                  ? 'This declaration is locked from editing because it has already been approved or processed.'
                  : 'Submit itemized expense claims, travel & mileage allowances, and invoice receipts'}
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <FiX />
          </IconButton>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-6">
          {/* Lock Alert Banner */}
          {isLocked && (
            <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-start gap-3 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
              <FiLock className="text-amber-600 dark:text-amber-400 text-lg shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-extrabold text-sm block">
                  Declaration Locked ({initialData?.status})
                </span>
                <p className="text-xs opacity-90 leading-relaxed">
                  Details, amounts, and receipts are locked in <strong>Read-Only</strong> mode because this claim is <strong>{initialData?.status}</strong>. To modify any items or prices, a manager must first revert its status back to <strong>Pending</strong>.
                </p>
              </div>
            </div>
          )}

          {/* Top Meta Details: Staff Member & Associated Job */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {isManager && (
              <div className="md:col-span-6">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Staff Member <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    disabled={isLocked}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                    required
                  >
                    <option value="">Select Colleague...</option>
                    {employees.map((emp) => (
                      <option key={emp._id || emp.id} value={emp._id || emp.id}>
                        {emp.username || emp.name || emp.email || 'Colleague'} ({emp.role || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className={isManager ? 'md:col-span-6' : 'md:col-span-12'}>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Associated Customer Job (Optional)
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary cursor-pointer shadow-xs"
                >
                  <option value="">No specific customer job attached</option>
                  {jobs.map((job) => {
                    const custName = job.customer
                      ? `${job.customer.firstName || ''} ${job.customer.lastName || ''}`.trim() ||
                        job.customer.companyName || ''
                      : '';
                    const loadCity = job.load?.city;
                    const unloadCity = job.unload?.city;
                    const routeStr = loadCity && unloadCity ? ` (${loadCity} ➔ ${unloadCity})` : '';
                    const jobLabel = job.index || `Job #${String(job._id || job.id || '').slice(-4)}`;
                    return (
                      <option key={job._id || job.id} value={job._id || job.id}>
                        {jobLabel} {custName ? `- ${custName}` : ''}
                        {routeStr}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Invoice-Style Line Items Table Card */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark p-4 md:p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-strokedark">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base">
                  <FiLayers />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Expense Items ({items.length})
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Add one or more line items for this expense declaration
                  </p>
                </div>
              </div>

              {!isLocked && (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <FiPlus className="text-sm" />
                  <span>Add Item</span>
                </button>
              )}
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50/90 dark:bg-slate-800/70 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-strokedark">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-3 w-52">Category *</th>
                    <th className="py-3 px-3 min-w-[200px]">Description / Title *</th>
                    <th className="py-3 px-3 w-36">Date</th>
                    <th className="py-3 px-3 w-32 text-right">Amount ({currencySymbol}) *</th>
                    {!isLocked && <th className="py-3 px-3 text-center w-14">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, index) => {
                    const isMileage = item.declarationType === 'Travel & Mileage';
                    return (
                      <React.Fragment key={item.id || index}>
                        <tr className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Row Index */}
                          <td className="p-3 text-center font-bold text-slate-400 text-xs">
                            {index + 1}
                          </td>

                          {/* Custom Category Dropdown */}
                          <td className="p-2.5">
                            <CategoryCustomDropdown
                              value={item.declarationType}
                              onChange={(newCat) =>
                                handleItemChange(index, 'declarationType', newCat)
                              }
                              disabled={isLocked}
                            />
                          </td>

                          {/* Description Input */}
                          <td className="p-2.5">
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                                disabled={isLocked}
                                placeholder="e.g., Client visit, Fuel, Hotel, Toll fee..."
                                className="w-full p-2 rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs font-medium focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-200 disabled:opacity-75 disabled:cursor-not-allowed"
                                required
                              />

                              {/* Mileage Details Toggle / Badge */}
                              {isMileage && (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRoute(index)}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
                                  >
                                    <FiNavigation className="text-xs" />
                                    <span>
                                      {item.showRouteDetails
                                        ? 'Hide Route Details'
                                        : item.distanceKm || item.startLocation || item.destinationLocation
                                        ? `Route: ${item.distanceKm || 0} km (${item.startLocation || 'Start'} ➔ ${item.destinationLocation || 'End'})`
                                        : '+ Add Route & Distance (Km)'}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Date Input */}
                          <td className="p-2.5">
                            <input
                              type="date"
                              value={item.date}
                              onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                              disabled={isLocked}
                              className="w-full p-2 rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs font-medium focus:ring-1 focus:ring-primary text-slate-800 dark:text-slate-200 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                              required
                            />
                          </td>

                          {/* Amount Input */}
                          <td className="p-2.5">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                                {currencySymbol}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                value={item.amount}
                                onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                disabled={isLocked}
                                className="w-full pl-6 pr-2.5 py-2 rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs font-bold text-right text-slate-900 dark:text-white focus:ring-1 focus:ring-primary disabled:opacity-75 disabled:cursor-not-allowed"
                                required
                              />
                            </div>
                          </td>

                          {/* Action (Delete) */}
                          {!isLocked && (
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                disabled={items.length === 1 && !item.title && !item.amount}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                title="Delete Item"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            </td>
                          )}
                        </tr>

                        {/* Mileage Route & Distance Expandable Row */}
                        {isMileage && item.showRouteDetails && (
                          <tr className="bg-blue-50/40 dark:bg-blue-950/20">
                            <td colSpan={6} className="px-4 py-3 border-b border-blue-100 dark:border-blue-900/40">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                    Start Location / Address
                                  </label>
                                  <div className="relative">
                                    <FiMapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                    <input
                                      type="text"
                                      value={item.startLocation}
                                      onChange={(e) =>
                                        handleItemChange(index, 'startLocation', e.target.value)
                                      }
                                      disabled={isLocked}
                                      placeholder="e.g. Office / Home"
                                      className="w-full pl-7 pr-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                    Destination / Client Site
                                  </label>
                                  <div className="relative">
                                    <FiNavigation className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                                    <input
                                      type="text"
                                      value={item.destinationLocation}
                                      onChange={(e) =>
                                        handleItemChange(
                                          index,
                                          'destinationLocation',
                                          e.target.value
                                        )
                                      }
                                      disabled={isLocked}
                                      placeholder="e.g. Client Site / Warehouse"
                                      className="w-full pl-7 pr-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                                    Distance (Kilometers)
                                  </label>
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={item.distanceKm}
                                    onChange={(e) =>
                                      handleItemChange(index, 'distanceKm', e.target.value)
                                    }
                                    disabled={isLocked}
                                    placeholder="e.g. 45.5"
                                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary disabled:opacity-75 disabled:cursor-not-allowed"
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Total Calculation & Summary Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              {!isLocked ? (
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <FiPlus className="text-sm" />
                  <span>+ Add another expense line item</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Line items are locked because declaration is {initialData?.status}.
                </span>
              )}

              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-strokedark px-5 py-2.5 rounded-xl">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Total Claim Amount:
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {formatCurrency(totalClaimAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Receipt Attachment & Additional Notes */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Receipt Upload */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Receipt / Invoice Voucher Attachment
              </label>

              {receiptUrl ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-sm shadow-xs">
                      <FiPaperclip />
                    </div>
                    <div className="max-w-[200px]">
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                        {receiptName || 'Receipt Attached'}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenReceiptInNewTab(receiptUrl)}
                        className="text-[11px] text-emerald-700 dark:text-emerald-300 hover:underline font-bold text-left cursor-pointer"
                      >
                        View Receipt &rarr;
                      </button>
                    </div>
                  </div>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptUrl('');
                        setReceiptName('');
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove attachment"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  )}
                </div>
              ) : isLocked ? (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 text-center">
                  <span className="text-xs text-slate-400 italic">No receipt attached</span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary/60 bg-slate-50/50 dark:bg-slate-800/20 cursor-pointer transition-all">
                  <FiUploadCloud className="text-xl text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {uploadingReceipt ? 'Uploading receipt...' : 'Click or Drag to Upload Receipt'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    PNG, JPG, PDF up to 10MB
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploadingReceipt || isLocked}
                  />
                </label>
              )}
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Additional Notes / Remarks
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLocked}
                placeholder="Provide any additional explanation for supervisor review..."
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary resize-none shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            {isLocked ? (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
              >
                Close (Read Only)
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingReceipt}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <FiCheck className="text-sm" />
                      <span>{initialData ? 'Update Declaration' : 'Submit Declaration'}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default ApplyDeclarationModal;
