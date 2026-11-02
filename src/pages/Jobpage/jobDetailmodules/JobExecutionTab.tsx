import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { apiPath } from '../../../../apiPath';
import { UserContext } from '../../../UserContext';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ClearIcon from '@mui/icons-material/Clear';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

interface JobExecutionTabProps {
  job: any;
  onRefresh?: () => void;
}

const COMMON_MATERIALS = [
  { name: 'Standard Moving Box (50L)', defaultPrice: 2.50 },
  { name: 'Book Box (Strong 35L)', defaultPrice: 2.00 },
  { name: 'Packing Tape Roll (66m)', defaultPrice: 3.50 },
  { name: 'Stretch Film / Foil Roll', defaultPrice: 12.00 },
  { name: 'Bubble Wrap (50cm x 100m)', defaultPrice: 18.00 },
  { name: 'Mattress Cover (Double)', defaultPrice: 6.50 },
  { name: 'Moving Blanket (Protective)', defaultPrice: 8.00 },
];

export const JobExecutionTab: React.FC<JobExecutionTabProps> = ({ job, onRefresh }) => {
  const { userData, role } = useContext(UserContext) || {};
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Execution Details Form State
  const [startedAt, setStartedAt] = useState<string>('');
  const [completedAt, setCompletedAt] = useState<string>('');
  const [startKilometres, setStartKilometres] = useState<number>(0);
  const [endKilometres, setEndKilometres] = useState<number>(0);
  const [actualMovers, setActualMovers] = useState<number>(0);
  const [billableHours, setBillableHours] = useState<number>(0);
  const [payrollHours, setPayrollHours] = useState<number>(0);
  const [colliCount, setColliCount] = useState<number>(0);
  const [colliNotes, setColliNotes] = useState<string>('');
  const [operationalNotes, setOperationalNotes] = useState<string>('');
  const [foremanName, setForemanName] = useState<string>('');

  // Materials State
  const [materialsUsed, setMaterialsUsed] = useState<Array<{
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>>([]);

  // Damage Reports State
  const [damageReports, setDamageReports] = useState<Array<{
    description: string;
    location: string;
    reportedAt: string;
  }>>([]);
  const [newDamageDesc, setNewDamageDesc] = useState<string>('');
  const [newDamageLoc, setNewDamageLoc] = useState<string>('');

  // Signature State
  const [signerName, setSignerName] = useState<string>('');
  const [signerRole, setSignerRole] = useState<string>('Customer');
  const [existingSignature, setExistingSignature] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Status History
  const [statusHistory, setStatusHistory] = useState<any[]>([]);

  // Format Date for datetime-local input
  const toDateTimeLocal = (dateVal: any) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      const pad = (n: number) => String(n).padStart(2, '0');
      const y = d.getFullYear();
      const m = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hh = pad(d.getHours());
      const mm = pad(d.getMinutes());
      return `${y}-${m}-${day}T${hh}:${mm}`;
    } catch {
      return '';
    }
  };

  // Populate state from job on mount / change
  useEffect(() => {
    if (!job) return;

    const exec = job.executionDetails || {};
    setStartedAt(toDateTimeLocal(exec.startedAt));
    setCompletedAt(toDateTimeLocal(exec.completedAt));
    setStartKilometres(Number(exec.startKilometres) || 0);
    setEndKilometres(Number(exec.endKilometres) || 0);
    setActualMovers(Number(exec.actualMovers) || 0);
    setBillableHours(Number(exec.billableHours) || 0);
    setPayrollHours(Number(exec.payrollHours) || 0);
    setColliCount(Number(exec.colliCount) || 0);
    setColliNotes(exec.colliNotes || '');
    setOperationalNotes(exec.operationalNotes || '');
    setForemanName(exec.foremanName || userData?.username || '');

    if (Array.isArray(exec.materialsUsed) && exec.materialsUsed.length > 0) {
      setMaterialsUsed(exec.materialsUsed);
    } else {
      // Default initial material rows
      setMaterialsUsed([
        { materialName: 'Standard Moving Box (50L)', quantity: 0, unitPrice: 2.50, totalPrice: 0 },
        { materialName: 'Packing Tape Roll (66m)', quantity: 0, unitPrice: 3.50, totalPrice: 0 },
      ]);
    }

    if (Array.isArray(exec.damageReports)) {
      setDamageReports(exec.damageReports);
    }

    if (exec.customerSignature?.signatureData) {
      setExistingSignature(exec.customerSignature);
      setSignerName(exec.customerSignature.signerName || '');
      setSignerRole(exec.customerSignature.signerRole || 'Customer');
    } else {
      setExistingSignature(null);
      const customerFullName = [job.customer?.firstName, job.customer?.lastName].filter(Boolean).join(' ');
      setSignerName(customerFullName || '');
    }

    if (Array.isArray(job.statusHistory)) {
      setStatusHistory(job.statusHistory);
    }
  }, [job]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e293b';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Materials table handlers
  const handleMaterialChange = (index: number, field: string, value: any) => {
    setMaterialsUsed((prev) => {
      const next = [...prev];
      const item = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        item.totalPrice = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
      }
      next[index] = item;
      return next;
    });
  };

  const addMaterialRow = (name = 'Custom Material', price = 0) => {
    setMaterialsUsed((prev) => [
      ...prev,
      { materialName: name, quantity: 1, unitPrice: price, totalPrice: price },
    ]);
  };

  const removeMaterialRow = (index: number) => {
    setMaterialsUsed((prev) => prev.filter((_, i) => i !== index));
  };

  // Damage handlers
  const addDamageReport = () => {
    if (!newDamageDesc.trim()) {
      toast.warning('Please enter a damage description');
      return;
    }
    const report = {
      description: newDamageDesc.trim(),
      location: newDamageLoc.trim() || 'General',
      reportedAt: new Date().toISOString(),
    };
    setDamageReports((prev) => [...prev, report]);
    setNewDamageDesc('');
    setNewDamageLoc('');
    toast.info('Damage logged. Remember to save execution details.');
  };

  const removeDamageReport = (index: number) => {
    setDamageReports((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Start Execution Action
  const handleQuickStartExecution = async () => {
    if (!job?._id) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const now = new Date();
      // Update status to EXECUTION
      const res = await axios.put(
        `${apiPath}/api/jobs/${job._id}/status`,
        { status: 'EXECUTION', reason: 'Field execution journey started by crew' },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // Also set startedAt
      await axios.put(
        `${apiPath}/api/jobs/${job._id}/execution`,
        { startedAt: now },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      toast.success('Job started! Status transitioned to EXECUTION.');
      setStartedAt(toDateTimeLocal(now));
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to start execution:', err);
      toast.error(err?.response?.data?.message || 'Failed to start execution');
    } finally {
      setSaving(false);
    }
  };

  // Save Execution Details (Draft / In-progress)
  const handleSaveExecution = async (completeJob = false) => {
    if (!job?._id) return;

    let signaturePayload = existingSignature;
    const canvas = canvasRef.current;
    if (canvas) {
      // Check if canvas has strokes
      const blank = document.createElement('canvas');
      blank.width = canvas.width;
      blank.height = canvas.height;
      if (canvas.toDataURL() !== blank.toDataURL()) {
        signaturePayload = {
          signerName: signerName.trim() || 'Customer',
          signerRole,
          signatureData: canvas.toDataURL('image/png'),
          signedAt: new Date(),
        };
      }
    }

    if (completeJob && !signaturePayload?.signatureData) {
      toast.error('Customer digital signature is required before completing the job.');
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload: any = {
        startedAt: startedAt ? new Date(startedAt) : undefined,
        completedAt: completeJob ? new Date() : (completedAt ? new Date(completedAt) : undefined),
        startKilometres: Number(startKilometres) || 0,
        endKilometres: Number(endKilometres) || 0,
        operationalNotes,
        actualMovers: Number(actualMovers) || 0,
        billableHours: Number(billableHours) || 0,
        payrollHours: Number(payrollHours) || 0,
        colliCount: Number(colliCount) || 0,
        colliNotes,
        materialsUsed,
        damageReports,
        customerSignature: signaturePayload,
        autoComplete: completeJob,
      };

      const response = await axios.put(
        `${apiPath}/api/jobs/${job._id}/execution`,
        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (response.data && response.data.success) {
        if (completeJob) {
          toast.success('Job completed successfully with customer sign-off!');
        } else {
          toast.success('Execution details saved successfully!');
        }
        if (response.data.executionDetails?.customerSignature) {
          setExistingSignature(response.data.executionDetails.customerSignature);
        }
        if (onRefresh) onRefresh();
      }
    } catch (err: any) {
      console.error('Error saving execution details:', err);
      toast.error(err?.response?.data?.message || 'Failed to save execution details');
    } finally {
      setSaving(false);
    }
  };

  const totalKm = Math.max(0, (Number(endKilometres) || 0) - (Number(startKilometres) || 0));
  const totalMaterialsAmount = materialsUsed.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  const currentStatus = String(job?.status || 'PENDING').toUpperCase();

  return (
    <div className="space-y-6 text-slate-800 dark:text-white">
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <LocalShippingOutlinedIcon fontSize="medium" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-white">
                Worker Field Execution Journey
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                  currentStatus === 'EXECUTION'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : currentStatus === 'COMPLETED'
                    ? 'bg-blue/15 text-blue border border-blue/30'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live crew transport log, on-site materials, incident reporting, and customer digital sign-off.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentStatus !== 'EXECUTION' && currentStatus !== 'COMPLETED' && (
            <button
              type="button"
              onClick={handleQuickStartExecution}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <PlayArrowIcon fontSize="small" />
              <span>Start Execution</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleSaveExecution(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <SaveIcon fontSize="small" />
            <span>{saving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          {currentStatus !== 'COMPLETED' && (
            <button
              type="button"
              onClick={() => handleSaveExecution(true)}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <CheckCircleIcon fontSize="small" />
              <span>Complete Job & Sign</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Distance</span>
            <SpeedIcon fontSize="small" className="text-sky-500" />
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {totalKm} <span className="text-xs font-semibold text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Start: {startKilometres} km • End: {endKilometres} km
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Hours Logged</span>
            <AccessTimeIcon fontSize="small" className="text-purple-500" />
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {billableHours} <span className="text-xs font-semibold text-slate-400">billable</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Payroll: {payrollHours} hrs
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Colli / Items</span>
            <Inventory2OutlinedIcon fontSize="small" className="text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-white mt-1">
            {colliCount} <span className="text-xs font-semibold text-slate-400">units</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Movers: {actualMovers} on-site
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Sign-Off</span>
            <DrawOutlinedIcon fontSize="small" className={existingSignature ? 'text-emerald-500' : 'text-slate-400'} />
          </div>
          <div className="text-sm font-bold text-slate-800 dark:text-white mt-2">
            {existingSignature ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircleIcon fontSize="inherit" /> Signed by {existingSignature.signerName || 'Customer'}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">Pending Customer Sign</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Materials: €{totalMaterialsAmount.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Time & Mileage, Crew, Materials), Right Column (Damages, Signature, History) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Section 1: Timers & Mileage */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-strokedark">
              <SpeedIcon fontSize="small" className="text-primary" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Transport Log & Operational Timing
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Started At
                </label>
                <input
                  type="datetime-local"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Completed At
                </label>
                <input
                  type="datetime-local"
                  value={completedAt}
                  onChange={(e) => setCompletedAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Start Kilometres (KM)
                </label>
                <input
                  type="number"
                  min="0"
                  value={startKilometres || ''}
                  onChange={(e) => setStartKilometres(Number(e.target.value))}
                  placeholder="e.g. 142500"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  End Kilometres (KM)
                </label>
                <input
                  type="number"
                  min="0"
                  value={endKilometres || ''}
                  onChange={(e) => setEndKilometres(Number(e.target.value))}
                  placeholder="e.g. 142580"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Billable Hours
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={billableHours || ''}
                  onChange={(e) => setBillableHours(Number(e.target.value))}
                  placeholder="e.g. 4.5"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Payroll Hours
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  value={payrollHours || ''}
                  onChange={(e) => setPayrollHours(Number(e.target.value))}
                  placeholder="e.g. 5.0"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Crew & Colli Tracking */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-strokedark">
              <GroupIcon fontSize="small" className="text-primary" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Movers & Inventory (Colli)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Foreman
                </label>
                <input
                  type="text"
                  value={foremanName}
                  onChange={(e) => setForemanName(e.target.value)}
                  placeholder="Foreman Name"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Active Movers Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={actualMovers || ''}
                  onChange={(e) => setActualMovers(Number(e.target.value))}
                  placeholder="e.g. 3"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Total Colli Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={colliCount || ''}
                  onChange={(e) => setColliCount(Number(e.target.value))}
                  placeholder="e.g. 64"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Colli / Inventory Notes
              </label>
              <input
                type="text"
                value={colliNotes}
                onChange={(e) => setColliNotes(e.target.value)}
                placeholder="e.g. 40 standard boxes, 14 wardrobe boxes, 10 furniture items"
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Foreman Operational Field Notes
              </label>
              <textarea
                rows={2}
                value={operationalNotes}
                onChange={(e) => setOperationalNotes(e.target.value)}
                placeholder="Access difficulties, parking situation, elevator delays, special customer requests..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Section 3: Materials Used Logger */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-strokedark">
              <div className="flex items-center gap-2">
                <Inventory2OutlinedIcon fontSize="small" className="text-primary" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                  Materials Used On-Site
                </h3>
              </div>
              <span className="text-xs font-black text-primary">
                Total: €{totalMaterialsAmount.toFixed(2)}
              </span>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MATERIALS.slice(0, 4).map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addMaterialRow(m.name, m.defaultPrice)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  + {m.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => addMaterialRow('Custom Item', 0)}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer"
              >
                + Add Custom
              </button>
            </div>

            {/* Materials Table */}
            <div className="space-y-2">
              {materialsUsed.map((row, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-xs"
                >
                  <input
                    type="text"
                    value={row.materialName}
                    onChange={(e) => handleMaterialChange(index, 'materialName', e.target.value)}
                    placeholder="Material name"
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  />
                  <div className="flex items-center gap-1 w-20">
                    <input
                      type="number"
                      min="0"
                      value={row.quantity}
                      onChange={(e) => handleMaterialChange(index, 'quantity', Number(e.target.value))}
                      placeholder="Qty"
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-xs text-center font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1 w-24">
                    <span className="text-slate-400">€</span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={row.unitPrice}
                      onChange={(e) => handleMaterialChange(index, 'unitPrice', Number(e.target.value))}
                      placeholder="Price"
                      className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-xs text-right font-bold"
                    />
                  </div>
                  <div className="w-16 text-right font-black text-slate-700 dark:text-slate-200">
                    €{(row.totalPrice || 0).toFixed(2)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMaterialRow(index)}
                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Damages, Customer Signature Pad, Audit Trail */}
        <div className="space-y-6">
          {/* Section 4: Damage & Incident Reports */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-strokedark">
              <ReportProblemOutlinedIcon fontSize="small" className="text-rose-500" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Damage & Incident Reports
              </h3>
            </div>

            {/* List Existing Damage Reports */}
            {damageReports.length > 0 ? (
              <div className="space-y-2">
                {damageReports.map((d, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs"
                  >
                    <div>
                      <div className="font-bold text-rose-900 dark:text-rose-200">
                        {d.location ? `[${d.location}] ` : ''}{d.description}
                      </div>
                      <div className="text-[10px] text-rose-500/80 mt-0.5">
                        Logged at: {d.reportedAt ? new Date(d.reportedAt).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDamageReport(idx)}
                      className="text-rose-400 hover:text-rose-600 transition-colors ml-2"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2 text-center">
                No damages or incidents recorded for this job.
              </div>
            )}

            {/* Quick Add Damage Input */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={newDamageLoc}
                onChange={(e) => setNewDamageLoc(e.target.value)}
                placeholder="Room / Spot"
                className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
              />
              <input
                type="text"
                value={newDamageDesc}
                onChange={(e) => setNewDamageDesc(e.target.value)}
                placeholder="Describe pre-existing or relocation damage..."
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
              />
              <button
                type="button"
                onClick={addDamageReport}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer whitespace-nowrap"
              >
                Log Damage
              </button>
            </div>
          </div>

          {/* Section 5: Customer Digital Signature Pad */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-strokedark">
              <div className="flex items-center gap-2">
                <DrawOutlinedIcon fontSize="small" className="text-primary" />
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                  Customer Digital Sign-Off
                </h3>
              </div>
              {existingSignature && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircleIcon fontSize="inherit" /> Signed
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Signer Full Name
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Signer Role
                </label>
                <select
                  value={signerRole}
                  onChange={(e) => setSignerRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="Customer">Customer</option>
                  <option value="Authorized Representative">Authorized Representative</option>
                  <option value="Building Manager">Building Manager</option>
                </select>
              </div>
            </div>

            {/* Signature Pad Area */}
            {existingSignature?.signatureData ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Signed on {new Date(existingSignature.signedAt).toLocaleString()} by {existingSignature.signerName} ({existingSignature.signerRole})
                </p>
                <div className="bg-white p-2 rounded-lg border border-slate-200 inline-block shadow-xs">
                  <img
                    src={existingSignature.signatureData}
                    alt="Customer Signature"
                    className="max-h-28 object-contain mx-auto"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setExistingSignature(null)}
                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                  >
                    Re-capture Signature
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/30 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-36 touch-none cursor-crosshair bg-white dark:bg-boxdark"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ClearIcon fontSize="inherit" /> Clear
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-3 text-[10px] text-slate-400 pointer-events-none">
                    Sign inside the box using finger or mouse
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  By signing, the customer confirms all items received in good order except as noted in the damage log above.
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Audit Trail & Status History */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-strokedark">
              <HistoryEduOutlinedIcon fontSize="small" className="text-primary" />
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
                Job State Transition Audit Trail
              </h3>
            </div>

            {statusHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {statusHistory.slice().reverse().map((hist, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-700 dark:text-slate-300">
                          {hist.fromStatus || 'START'}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="font-extrabold text-primary">
                          {hist.toStatus}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {hist.changedAt ? new Date(hist.changedAt).toLocaleString() : ''}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Changed by: <strong>{hist.changedByName || 'System'}</strong> ({hist.userRole || 'Staff'})</span>
                    </div>

                    {hist.reason && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">
                        Reason: {hist.reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic py-2 text-center">
                No previous status transitions recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobExecutionTab;

