import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Dialog, IconButton } from '@mui/material';
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiCheck,
  FiAlertTriangle,
  FiShield,
  FiCalendar,
  FiTruck,
  FiSearch,
  FiChevronDown,
  FiLink,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const ITEM_CATEGORIES = [
  'Furniture',
  'Electronics & Appliances',
  'Glass & Fragile',
  'Artwork & Antiques',
  'Building / Property Damage',
  'Boxes / Personal Effects',
  'Other',
];

const DAMAGE_TYPES = [
  'Broken / Shattered',
  'Scratch / Dent',
  'Water Damage',
  'Lost / Missing',
  'Structural Damage',
  'Stain / Tear',
  'Other',
];

const INCIDENT_STAGES = [
  'Pre-Move / Packing',
  'Loading / In-Transit',
  'Unloading / Delivery',
  'Storage / Warehouse',
  'Assembly / Handyman',
  'Other',
];

const INSURANCE_TYPES = [
  'Standard Transit Liability',
  'Full Value Protection (All-Risk)',
  'Company Self-Insured',
  'Customer Home Insurance',
  'Third-Party Carrier Insurance',
];

const REPORTED_BY_OPTIONS = [
  'Customer',
  'Driver / Mover',
  'Operations Manager',
  'Claims Adjuster',
  'Admin',
];

const initialItemState = {
  itemName: '',
  itemCategory: 'Furniture',
  damageType: 'Scratch / Dent',
  quantity: 1,
  estimatedOriginalValue: '',
  claimedAmount: '',
  evidencePhotos: [],
  repairQuoteUrl: '',
  notes: '',
};

/* ─────────────────── Custom Searchable Job Selector ─────────────────── */
function JobSearchSelect({ jobs, value, onChange, loading }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = jobs.filter((j) => {
    const q = query.toLowerCase();
    if (!q) return true;
    const num = String(j.index || j.jobNumber || '').toLowerCase();
    const firstName = (j.customer?.firstName || '').toLowerCase();
    const lastName = (j.customer?.lastName || '').toLowerCase();
    const from = (j.load?.city || j.load?.address || '').toLowerCase();
    const to = (j.unload?.city || j.unload?.address || '').toLowerCase();
    const date = j.date ? new Date(j.date).toLocaleDateString() : '';
    return num.includes(q) || firstName.includes(q) || lastName.includes(q) || from.includes(q) || to.includes(q) || date.includes(q);
  });

  const selectedJob = value ? jobs.find((j) => (j._id || j.id) === value) : null;

  const handleSelect = (job) => {
    onChange(job ? (job._id || job.id) : '');
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all cursor-pointer text-left
          ${open
            ? 'border-primary bg-white dark:bg-boxdark ring-2 ring-primary/20'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark hover:border-primary/60'
          } text-slate-800 dark:text-slate-200`}
      >
        <FiLink className="text-primary shrink-0" />
        <span className="flex-1 truncate">
          {loading
            ? 'Loading jobs...'
            : selectedJob
              ? (() => {
                  const f = selectedJob.customer?.firstName || '';
                  const l = selectedJob.customer?.lastName || '';
                  const name = `${f} ${l}`.trim();
                  return `Job #${selectedJob.index || 'N/A'}${name ? ` — ${name}` : ''}`;
                })()
              : '-- No Specific Job Linked --'
          }
        </span>
        <FiChevronDown className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute z-[9999] mt-1.5 w-full min-w-[280px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark shadow-2xl overflow-hidden">
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60">
            <FiSearch className="text-slate-400 text-sm shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by job#, customer, city, date..."
              className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <FiX className="text-xs" />
              </button>
            )}
          </div>

          {/* Options */}
          <div className="max-h-52 overflow-y-auto">
            {/* No-link option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer
                ${!value ? 'font-bold text-primary bg-primary/5' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <span className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px]">—</span>
              <span>No Specific Job Linked</span>
            </button>

            {loading ? (
              <div className="py-6 text-center text-xs text-slate-400">Loading jobs...</div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                {query ? `No jobs match "${query}"` : 'No jobs available'}
              </div>
            ) : (
              filtered.map((j) => {
                const jId = j._id || j.id;
                const isSelected = value === jId;
                const cFirst = j.customer?.firstName || '';
                const cLast = j.customer?.lastName || '';
                const cName = `${cFirst} ${cLast}`.trim();
                const from = j.load?.city || j.load?.address || '';
                const to = j.unload?.city || j.unload?.address || '';
                const dateStr = j.date
                  ? new Date(j.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '';
                return (
                  <button
                    key={jId}
                    type="button"
                    onClick={() => handleSelect(j)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800/40 last:border-0
                      ${isSelected ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                  >
                    {/* Left: colored dot indicator */}
                    <span className={`shrink-0 w-2 h-2 rounded-full mt-0.5
                      ${isSelected ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`} />

                    <div className="flex-1 min-w-0">
                      {/* Row 1: Customer name + date */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold truncate
                          ${isSelected ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                          {cName || 'Unknown Customer'}
                        </span>
                        {dateStr && (
                          <span className="shrink-0 text-[10px] text-slate-400">{dateStr}</span>
                        )}
                      </div>
                      {/* Row 2: Job number + route */}
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          #{j.index || jId?.slice(-6)}
                        </span>
                        {(from || to) && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                            {from && <span>{from}</span>}
                            {from && to && <span className="mx-1">→</span>}
                            {to && <span>{to}</span>}
                          </span>
                        )}
                        {j.status && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide">
                            {j.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && <FiCheck className="shrink-0 text-primary text-sm" />}
                  </button>
                );
              })
            )}
          </div>

          {filtered.length > 0 && (
            <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 text-[10px] text-slate-400">
              {filtered.length} job{filtered.length !== 1 ? 's' : ''} found{query && ` for "${query}"`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CreateClaimModal({ open, onClose, onSuccess, initialData = null }) {
  const { symbol: currencySymbol } = useCurrency();
  const [jobs, setJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Form State
  const [selectedJobId, setSelectedJobId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [reportedBy, setReportedBy] = useState('Customer');
  const [reportedByName, setReportedByName] = useState('');
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [incidentStage, setIncidentStage] = useState('Loading / In-Transit');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');

  // Items State
  const [items, setItems] = useState([ { ...initialItemState } ]);

  // Insurance State
  const [insuranceType, setInsuranceType] = useState('Standard Transit Liability');
  const [policyNumber, setPolicyNumber] = useState('');
  const [deductibleAmount, setDeductibleAmount] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Fetch Jobs and Customers when modal opens
  useEffect(() => {
    if (open) {
      fetchJobsList();
      fetchCustomerList();
    }
  }, [open]);

  // Auto-fill customer when jobs list loads and a job is already pre-selected
  useEffect(() => {
    if (selectedJobId && jobs.length > 0 && !customerName) {
      handleJobSelect(selectedJobId);
    }
  }, [jobs]);

  const fetchJobsList = async () => {
    setLoadingJobs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiPath}/api/jobList`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // API returns { jobList: [...] }
      const list = res.data?.jobList || res.data?.data || res.data || [];
      setJobs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchCustomerList = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiPath}/api/customerList`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const list = res.data?.customerList || res.data?.data || res.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  // Populate form if initialData (edit mode) or pre-linked job (new claim from job tab)
  useEffect(() => {
    if (!open) return;

    const isEditMode = initialData && (initialData._id || initialData.id);
    const isJobLinked = initialData && initialData.jobId && !isEditMode;

    if (isEditMode) {
      // Full edit — populate all fields
      setSelectedJobId(initialData.jobId?._id || initialData.jobId || '');
      setCustomerName(initialData.customerName || '');
      setCustomerEmail(initialData.customerEmail || '');
      setCustomerPhone(initialData.customerPhone || '');
      setReportedBy(initialData.reportedBy || 'Customer');
      setReportedByName(initialData.reportedByName || '');
      setIncidentDate(
        initialData.incidentDate
          ? new Date(initialData.incidentDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setIncidentStage(initialData.incidentStage || 'Loading / In-Transit');
      setIncidentLocation(initialData.incidentLocation || '');
      setIncidentDescription(initialData.incidentDescription || '');
      setInsuranceType(initialData.insuranceType || 'Standard Transit Liability');
      setPolicyNumber(initialData.policyNumber || '');
      setDeductibleAmount(
        initialData.deductibleAmount !== undefined ? String(initialData.deductibleAmount) : ''
      );
      if (initialData.items?.length > 0) {
        setItems(
          initialData.items.map((it) => ({
            itemName: it.itemName || '',
            itemCategory: it.itemCategory || 'Furniture',
            damageType: it.damageType || 'Scratch / Dent',
            quantity: it.quantity || 1,
            estimatedOriginalValue:
              it.estimatedOriginalValue !== undefined ? String(it.estimatedOriginalValue) : '',
            claimedAmount: it.claimedAmount !== undefined ? String(it.claimedAmount) : '',
            evidencePhotos: it.evidencePhotos || [],
            repairQuoteUrl: it.repairQuoteUrl || '',
            notes: it.notes || '',
          }))
        );
      } else {
        setItems([{ ...initialItemState }]);
      }
    } else if (isJobLinked) {
      // New claim pre-linked to a job — reset form but keep the jobId
      const jid = initialData.jobId?._id || initialData.jobId || '';
      setSelectedJobId(jid);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setReportedBy('Customer');
      setReportedByName('');
      setIncidentDate(new Date().toISOString().split('T')[0]);
      setIncidentStage('Loading / In-Transit');
      setIncidentLocation('');
      setIncidentDescription('');
      setInsuranceType('Standard Transit Liability');
      setPolicyNumber('');
      setDeductibleAmount('');
      setItems([{ ...initialItemState }]);
    } else {
      // Completely new claim — reset everything
      setSelectedJobId('');
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setReportedBy('Customer');
      setReportedByName('');
      setIncidentDate(new Date().toISOString().split('T')[0]);
      setIncidentStage('Loading / In-Transit');
      setIncidentLocation('');
      setIncidentDescription('');
      setInsuranceType('Standard Transit Liability');
      setPolicyNumber('');
      setDeductibleAmount('');
      setItems([{ ...initialItemState }]);
    }
  }, [initialData, open]);

  // Handle Job Selection — auto-fill customer & incident details
  const handleJobSelect = (jobId) => {
    setSelectedJobId(jobId);
    if (!jobId) return;
    const job = jobs.find((j) => (j._id || j.id) === jobId);
    if (!job) return;
    // API populates customer with firstName + lastName
    const cFirst = job.customer?.firstName || '';
    const cLast = job.customer?.lastName || '';
    const cName = `${cFirst} ${cLast}`.trim();
    const cEmail = job.customer?.email || '';
    const cPhone = job.customer?.contact || job.customer?.mobile || '';
    if (cName) setCustomerName(cName);
    if (cEmail) setCustomerEmail(cEmail);
    if (cPhone) setCustomerPhone(cPhone);
    const from = job.load?.city || job.load?.address || '';
    const to = job.unload?.city || job.unload?.address || '';
    if (from || to) setIncidentLocation(`${from || 'Origin'} → ${to || 'Destination'}`);
    if (job.date) setIncidentDate(new Date(job.date).toISOString().split('T')[0]);
    toast.success('Customer details auto-filled from job!', { duration: 2000, icon: '🔗' });
  };

  // Item change handlers
  const handleItemChange = (index, field, val) => {
    const next = [...items];
    next[index][field] = val;
    setItems(next);
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { ...initialItemState }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) {
      toast.error('At least one damaged item is required');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Photo Upload Handler for specific item
  const handlePhotoUpload = async (index, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      const next = [...items];
      if (!next[index].evidencePhotos) next[index].evidencePhotos = [];
      next[index].evidencePhotos.push({
        url: base64Data,
        name: file.name || 'Damage Photo',
        uploadedAt: new Date(),
      });
      setItems(next);
      toast.success('Photo added to item');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (itemIndex, photoIndex) => {
    const next = [...items];
    next[itemIndex].evidencePhotos = next[itemIndex].evidencePhotos.filter(
      (_, pIdx) => pIdx !== photoIndex
    );
    setItems(next);
  };

  // Calculate Total Claimed Amount
  const totalClaimAmount = items.reduce((sum, it) => {
    const amt = parseFloat(it.claimedAmount);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Please enter the customer name');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one damaged item');
      return;
    }

    // Validate Items
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.itemName.trim()) {
        toast.error(`Please provide an Item Name for Item #${i + 1}`);
        return;
      }
      const amt = parseFloat(it.claimedAmount);
      if (isNaN(amt) || amt <= 0) {
        toast.error(`Please enter a valid claimed amount for Item #${i + 1}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formattedItems = items.map((it) => ({
        itemName: it.itemName.trim(),
        itemCategory: it.itemCategory,
        damageType: it.damageType,
        quantity: parseInt(it.quantity, 10) || 1,
        estimatedOriginalValue: parseFloat(it.estimatedOriginalValue) || 0,
        claimedAmount: parseFloat(it.claimedAmount) || 0,
        evidencePhotos: it.evidencePhotos || [],
        repairQuoteUrl: (it.repairQuoteUrl || '').trim(),
        notes: (it.notes || '').trim(),
      }));

      const payload = {
        jobId: selectedJobId || null,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        reportedBy,
        reportedByName: reportedByName.trim() || customerName.trim(),
        incidentDate,
        incidentStage,
        incidentLocation: incidentLocation.trim(),
        incidentDescription: incidentDescription.trim(),
        items: formattedItems,
        insuranceType,
        policyNumber: policyNumber.trim(),
        deductibleAmount: parseFloat(deductibleAmount) || 0,
      };

      let res;
      if (initialData && (initialData._id || initialData.id)) {
        res = await axios.put(
          `${apiPath}/api/damage-claims/${initialData._id || initialData.id}`,
          payload,
          { headers }
        );
      } else {
        res = await axios.post(`${apiPath}/api/damage-claims`, payload, { headers });
      }

      if (res.data?.success) {
        toast.success(
          initialData
            ? 'Damage claim updated successfully'
            : `Damage claim ${res.data?.data?.claimNumber || ''} created successfully`
        );
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Error saving damage claim:', err);
      toast.error(err.response?.data?.message || 'Failed to save damage claim');
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
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center text-xl shadow-md shadow-rose-500/20">
              <FiAlertTriangle />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{initialData ? 'Edit Damage Claim' : 'Report Damage Claim'}</span>
                {initialData?.claimNumber && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900">
                    {initialData.claimNumber}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Log damaged furniture, transit breakage, evidence photos, and claim values
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <FiX />
          </IconButton>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Association & Customer Info */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <FiTruck className="text-primary text-sm" />
              <span>1. Job Association & Customer Details</span>
            </div>

            {/* Searchable Job Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Associated Job —{' '}
                <span className="font-normal text-slate-400">Search by job#, customer, city or date</span>
              </label>
              <JobSearchSelect
                jobs={jobs}
                value={selectedJobId}
                onChange={handleJobSelect}
                loading={loadingJobs}
              />
              {selectedJobId ? (
                <p className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <FiCheck className="text-xs" />
                  Customer details auto-filled & locked from job. Clear the job link to edit manually.
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1">
                  Select a job above to auto-fill customer details.
                </p>
              )}
            </div>

            {/* Customer Fields — readonly when job is selected */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  readOnly={!!selectedJobId}
                  value={customerName}
                  onChange={(e) => !selectedJobId && setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className={`w-full px-3 py-2 rounded-xl text-xs border transition-colors
                    ${
                      selectedJobId
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none'
                        : 'bg-white dark:bg-boxdark border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary'
                    }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Email
                </label>
                <input
                  type="email"
                  readOnly={!!selectedJobId}
                  value={customerEmail}
                  onChange={(e) => !selectedJobId && setCustomerEmail(e.target.value)}
                  placeholder={selectedJobId ? '—' : 'john@example.com'}
                  className={`w-full px-3 py-2 rounded-xl text-xs border transition-colors
                    ${
                      selectedJobId
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none'
                        : 'bg-white dark:bg-boxdark border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary'
                    }`}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Phone
                </label>
                <input
                  type="tel"
                  readOnly={!!selectedJobId}
                  value={customerPhone}
                  onChange={(e) => !selectedJobId && setCustomerPhone(e.target.value)}
                  placeholder={selectedJobId ? '—' : '+31 6 12345678'}
                  className={`w-full px-3 py-2 rounded-xl text-xs border transition-colors
                    ${
                      selectedJobId
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-slate-700 dark:text-slate-300 cursor-not-allowed select-none'
                        : 'bg-white dark:bg-boxdark border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary'
                    }`}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Incident Overview */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <FiCalendar className="text-primary text-sm" />
              <span>2. Incident Information & Timeline</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Incident Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Incident <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                />
              </div>

              {/* Incident Stage */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Move Stage Occurred
                </label>
                <select
                  value={incidentStage}
                  onChange={(e) => setIncidentStage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                >
                  {INCIDENT_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reported By */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reported By (Role)
                </label>
                <select
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                >
                  {REPORTED_BY_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Incident Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incident Location
                </label>
                <input
                  type="text"
                  value={incidentLocation}
                  onChange={(e) => setIncidentLocation(e.target.value)}
                  placeholder="e.g. Staircase / Highway A4 / Unit 102"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Incident Summary / What Happened
              </label>
              <textarea
                rows={2}
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Describe how the damage occurred (e.g. dropped during stair carry, strap snapped in transit...)"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section 3: Damaged Line Items Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                <FiAlertTriangle className="text-rose-500 text-sm" />
                <span>3. Damaged Items & Evidence Matrix ({items.length})</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs transition-colors cursor-pointer"
              >
                <FiPlus />
                <span>+ Add Damaged Item</span>
              </button>
            </div>

            {/* Items Cards */}
            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark rounded-2xl p-4 shadow-xs relative group"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center text-xs font-bold">
                        #{index + 1}
                      </span>
                      <span>{item.itemName || 'New Damaged Item'}</span>
                    </span>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove Item"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 mb-3">
                    {/* Item Name */}
                    <div className="md:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Item Description / Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={item.itemName}
                        onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                        placeholder="e.g. Glass Dining Table / 65 inch OLED TV"
                        className="w-full px-3 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    {/* Category */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Category
                      </label>
                      <select
                        value={item.itemCategory}
                        onChange={(e) => handleItemChange(index, 'itemCategory', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                      >
                        {ITEM_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Damage Type */}
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Damage Type
                      </label>
                      <select
                        value={item.damageType}
                        onChange={(e) => handleItemChange(index, 'damageType', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                      >
                        {DAMAGE_TYPES.map((dt) => (
                          <option key={dt} value={dt}>
                            {dt}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Qty */}
                    <div className="md:col-span-1">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs text-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                      />
                    </div>

                    {/* Est Original Value */}
                    <div className="md:col-span-1.5">
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Est Value ({currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={item.estimatedOriginalValue}
                        onChange={(e) =>
                          handleItemChange(index, 'estimatedOriginalValue', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary text-right"
                      />
                    </div>

                    {/* Claim Amount */}
                    <div className="md:col-span-1.5">
                      <label className="block text-[11px] font-bold text-rose-600 dark:text-rose-400 mb-1">
                        Claimed ({currencySymbol}) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder="0.00"
                        value={item.claimedAmount}
                        onChange={(e) => handleItemChange(index, 'claimedAmount', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 focus:outline-hidden focus:border-rose-500 text-right"
                      />
                    </div>
                  </div>

                  {/* Photo Evidence & Notes */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 items-center">
                    {/* Photos Upload & Thumbnails */}
                    <div className="md:col-span-7 flex items-center gap-2 flex-wrap">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:border-primary cursor-pointer transition-all">
                        <FiUploadCloud className="text-primary text-sm" />
                        <span>+ Attach Damage Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(index, e)}
                          className="hidden"
                        />
                      </label>

                      {/* Photo Thumbnails */}
                      {item.evidencePhotos &&
                        item.evidencePhotos.map((p, pIdx) => (
                          <div
                            key={pIdx}
                            className="relative group/photo w-10 h-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs"
                          >
                            <img
                              src={p.url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(index, pIdx)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity"
                            >
                              <FiTrash2 className="text-xs text-rose-300" />
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Item Notes */}
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        placeholder="Item damage notes / repair details..."
                        className="w-full px-3 py-1.5 rounded-xl text-[11px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Claim Calculation Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Total Claim Amount:
              </span>
              <span className="text-lg font-black text-emerald-400">
                {formatCurrency(totalClaimAmount)}
              </span>
            </div>
          </div>

          {/* Section 4: Insurance & Liability */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <FiShield className="text-primary text-sm" />
              <span>4. Insurance Coverage & Deductible Terms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Insurance Policy Type
                </label>
                <select
                  value={insuranceType}
                  onChange={(e) => setInsuranceType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                >
                  {INSURANCE_TYPES.map((it) => (
                    <option key={it} value={it}>
                      {it}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Policy / Certificate Number
                </label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="e.g. POL-2026-99881"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Standard Policy Deductible ({currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={deductibleAmount}
                  onChange={(e) => setDeductibleAmount(e.target.value)}
                  placeholder="e.g. 150.00"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
            >
              {submitting ? (
                <span>Saving Claim...</span>
              ) : (
                <>
                  <FiCheck className="text-sm" />
                  <span>{initialData ? 'Update Claim' : 'Submit Damage Claim'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
