import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InventoryIcon from '@mui/icons-material/Inventory';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TagIcon from '@mui/icons-material/Tag';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import { apiPath } from '../../../../apiPath';
import { UserContext } from '../../../UserContext';
import AddIcon from '@mui/icons-material/Add';
interface FinanceModuleProps {
  data?: any;
  job?: any;
  onSuccess?: () => void;
}

interface RuleItem {
  id?: string;
  salesGroup: string;
  description: string;
  number: string | number;
  unitPrice: string | number;
  btw: string | number;
  enabled: boolean;
  isCalculated: boolean;
}

const QUANTITY_OPTIONS = [
  { value: '{{relocation_totalVolume}}', label: 'Total Volume (m³)' },
  { value: '{{relocation_movers}}', label: 'Movers Count' },
  { value: '{{relocation_requiredHours}}', label: 'Required Hours' },
  { value: '{{relocation_totalBoxes}}', label: 'Box Quantity' },
  { value: '{{relocation_travelTime}}', label: 'Travel Time (hrs)' },
  { value: '{{relocation_distance}}', label: 'Distance (km)' },
  { value: '{{movingLift_quantity}}', label: 'Moving Lift' },
  { value: '{{assembling_requiredHours}}', label: 'Assembling Hours' },
  { value: '{{disassembling_requiredHours}}', label: 'Dismantle Hours' },
  { value: '{{total_handyman}}', label: 'Number of Handyman' },
  { value: '{{packing_requiredHours}}', label: 'Packing Hours' },
  { value: '{{packing_requiredPackers}}', label: 'Packers Count' },
  { value: '{{unpacking_requiredHours}}', label: 'Unpacking Hours' },
  { value: '{{unpacking_requiredPackers}}', label: 'Unpackers Count' },
  { value: '{{certificate_quantity}}', label: 'Warranty Certificate' },
  { value: '{{insurance_quantity}}', label: 'Insurance' },
  { value: '{{storage_storageVolume}}', label: 'Storage Volume (m³)' },
];

const PRICE_OPTIONS = [
  { value: '{{relocation_pricePerMeterCubic}}', label: 'Rate per m³' },
  { value: '{{moverPrice}}', label: 'Mover Rate / Hour' },
  { value: '{{boxCharges}}', label: 'Box Unit Price' },
  { value: '{{relocation_pricePerHour}}', label: 'Travel Time Rate' },
  { value: '{{relocation_pricePerKilometer}}', label: 'Distance Rate / km' },
  { value: '{{movingLift_price}}', label: 'Moving Lift Rate' },
  { value: '{{assembling_appliedPrice}}', label: 'Assembling Rate' },
  { value: '{{disassembling_appliedPrice}}', label: 'Dismantle Rate' },
  { value: '{{handymanCharge}}', label: 'Handyman Rate' },
  { value: '{{packing_appliedPrice}}', label: 'Packing Rate' },
  { value: '{{packersCharge}}', label: 'Packers Rate' },
  { value: '{{unpacking_appliedPrice}}', label: 'Unpacking Rate' },
  { value: '{{packerCharge}}', label: 'Unpackers Rate' },
  { value: '{{certificate_price}}', label: 'Certificate Price' },
  { value: '{{insurance_price}}', label: 'Insurance Price' },
  { value: '{{storage_appliedPrice}}', label: 'Storage Rate' },
];

const STEPS = [
  { id: 'invoice', label: 'Acceptance of offer', type: 'Acceptance of offer', icon: <ReceiptIcon /> },
  { id: 'start_job', label: 'Start job', type: 'Start job', icon: <PlayArrowIcon /> },
  { id: 'Storage', label: 'Storage loaded', type: 'Storage loaded', icon: <InventoryIcon /> },
  { id: 'appointment', label: 'After last appointment', type: 'After last appointment', icon: <EventAvailableIcon /> },
];

const FinanceModule: React.FC<FinanceModuleProps> = ({ data, job, onSuccess }) => {
  const { id: currentUserId } = (useContext(UserContext) as any) || {};

  // Active step in workflow - NOT selected by default, toggles on click
  const [selectedForm, setSelectedForm] = useState<string>('');

  // Metadata & Dropdown Lists
  const [templateList, setTemplateList] = useState<any[]>([]);
  const [salesGroupList, setSalesGroupList] = useState<any[]>([]);
  const [taxTypeList, setTaxTypeList] = useState<any[]>([]);
  const [inputFields, setInputFields] = useState<any[]>([]);

  // Form states
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [discountDescription, setDiscountDescription] = useState<string>('');
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [vatSelected, setVatSelected] = useState<'inclusive' | 'exclusive'>('exclusive');
  const [taxTypeSalesGroup, setTaxTypeSalesGroup] = useState<string>('');
  const [ignoreRules, setIgnoreRules] = useState<boolean>(false);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [reference, setReference] = useState<string>('');
  const [status, setStatus] = useState<string>('Draft');
  const [remark, setRemark] = useState<string>('');
  const [extraFieldValues, setExtraFieldValues] = useState<Record<string, any>>({});

  // Default to 0 rules/items
  const [rules, setRules] = useState<RuleItem[]>([]);

  // Loading indicator
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Helper to evaluate placeholders from Job relocation details
  const resolveTokenValue = (token: string | number): number => {
    if (typeof token === 'number') return token;
    if (!token) return 0;
    if (!isNaN(Number(token))) return Number(token);

    const clean = String(token).replace(/[{}]/g, '').trim();
    const rel = job?.relocation?.relocation || job?.relocation || {};
    const rates = job?.relocation?.rates || {};
    const hours = job?.relocation?.hours || {};
    const packing = job?.relocation?.packing || {};
    const unpacking = job?.relocation?.unpacking || {};
    const assembling = job?.relocation?.assembling || {};
    const disassembling = job?.relocation?.disassembling || {};
    const movingLift = job?.relocation?.movingLift || {};
    const certificate = job?.relocation?.certificate || {};
    const insurance = job?.relocation?.insurance || {};
    const storage = job?.relocation?.storage || {};
    const total = job?.relocation?.total || {};

    const lookupMap: Record<string, number> = {
      // Quantities
      relocation_totalVolume: Number(rel.totalVolume ?? 0),
      relocation_movers: Number(rel.movers ?? 0),
      relocation_requiredHours: Number(rel.requiredHours ?? hours.hours ?? 0),
      relocation_totalBoxes: Number(rel.totalBoxes ?? 0),
      relocation_travelTime: Number(rel.travelTime ?? hours.travelTime ?? 0),
      relocation_distance: Number(rel.distance ?? 0),
      movingLift_quantity: Number(movingLift.quantity ?? 0),
      assembling_requiredHours: Number(assembling.requiredHours ?? hours.assemblingHours ?? 0),
      disassembling_requiredHours: Number(disassembling.requiredHours ?? hours.disassemblyHours ?? 0),
      total_handyman: Number(rel.handyman ?? total.handyman ?? 0),
      packing_requiredHours: Number(packing.requiredHours ?? hours.packingHours ?? 0),
      packing_requiredPackers: Number(packing.requiredPackers ?? 0),
      unpacking_requiredHours: Number(unpacking.requiredHours ?? hours.unpackingHours ?? 0),
      unpacking_requiredPackers: Number(unpacking.requiredPackers ?? 0),
      certificate_quantity: Number(certificate.quantity ?? 0),
      insurance_quantity: Number(insurance.quantity ?? 0),
      storage_storageVolume: Number(storage.storageVolume ?? 0),

      // Rates & Prices
      relocation_pricePerMeterCubic: Number(rel.pricePerMeterCubic ?? rates.cubicMeter ?? 0),
      moverPrice: Number(rates.moverPrice ?? rel.moverPrice ?? 0),
      boxCharges: Number(rates.boxCharges ?? 0),
      relocation_pricePerHour: Number(rel.pricePerHour ?? rates.travelTime ?? 0),
      relocation_pricePerKilometer: Number(rel.pricePerKilometer ?? rates.distance ?? 0),
      movingLift_price: Number(movingLift.price ?? 0),
      assembling_appliedPrice: Number(assembling.appliedPrice ?? rates.assemblyHours ?? 0),
      disassembling_appliedPrice: Number(disassembling.appliedPrice ?? rates.disassemblyHours ?? 0),
      handymanCharge: Number(rates.handymanCharge ?? 0),
      packing_appliedPrice: Number(packing.appliedPrice ?? rates.packingHours ?? 0),
      packersCharge: Number(rates.packersCharge ?? 0),
      unpacking_appliedPrice: Number(unpacking.appliedPrice ?? rates.unpackingHours ?? 0),
      packerCharge: Number(rates.packerCharge ?? 0),
      certificate_price: Number(certificate.price ?? 0),
      insurance_price: Number(insurance.price ?? 0),
      storage_appliedPrice: Number(storage.appliedPrice ?? 0),
    };

    return lookupMap[clean] !== undefined ? lookupMap[clean] : 0;
  };

  // Fetch dropdown data
  useEffect(() => {

    const fetchTemplates = async () => {
      try {
        const res = await axios.get(`${apiPath}/api/templates?type=invoice`);
        setTemplateList(res.data || []);
      } catch (err: any) {
        console.error('Error fetching invoice templates:', err);
      }
    };

    const fetchSalesGroups = async () => {
      try {
        const res = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`);
        setSalesGroupList(res.data || []);
      } catch (err: any) {
        console.error('Error fetching sales groups:', err);
      }
    };

    const fetchTaxTypes = async () => {
      try {
        const res = await axios.get(`${apiPath}/api/sale_group?type=tax`);
        setTaxTypeList(res.data || []);
        if (res.data && res.data.length > 0 && !taxTypeSalesGroup) {
          setTaxTypeSalesGroup(res.data[0]._id);
        }
      } catch (err: any) {
        console.error('Error fetching tax types:', err);
      }
    };

    fetchTemplates();
    fetchSalesGroups();
    fetchTaxTypes();
  }, []);

  // Fetch extra fields whenever selectedTemplate changes
  useEffect(() => {
    if (!selectedTemplate) {
      setInputFields([]);
      return;
    }
    const fetchExtraFields = async () => {
      try {
        const res = await axios.get(
          `${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`
        );
        setInputFields(res.data[0]?.extraFields || []);
      } catch (err: any) {
        console.error('Error fetching template extra fields:', err);
      }
    };
    fetchExtraFields();
  }, [selectedTemplate]);

  // Load step configuration when selectedForm or data changes
  useEffect(() => {
    if (!selectedForm) {
      setRules([]);
      return;
    }

    const stepData = data?.[selectedForm];
    if (stepData) {
      setSelectedTemplate(stepData.financialTemplate || '');
      setDiscountDescription(stepData.discountDescription || '');
      setDiscountPercentage(Number(stepData.percentage) || 0);

      // Load existing saved rules if available, otherwise by default 0 items
      if (stepData.rules && Array.isArray(stepData.rules) && stepData.rules.length > 0) {
        setRules(
          stepData.rules.map((r: any) => ({
            salesGroup: r.salesGroup || '',
            description: r.description || '',
            number: r.number ?? '',
            unitPrice: r.unitPrice ?? '',
            btw: r.btw ?? '21',
            enabled: r.enabled !== false,
            isCalculated: !!r.isCalculated,
          }))
        );
      } else {
        setRules([]); // 0 items by default
      }
    } else {
      setSelectedTemplate('');
      setDiscountDescription('');
      setDiscountPercentage(0);
      setRules([]); // 0 items by default
    }

    if (data?.vat) {
      setVatSelected(data.vat === 'inclusive' ? 'inclusive' : 'exclusive');
    }
    if (data?.ignoreRules !== undefined) {
      setIgnoreRules(!!data.ignoreRules);
    }
  }, [selectedForm, data]);

  // Toggle stage selection (selects if not active, deselects if currently active)
  const handleStageToggle = (stepId: string) => {
    setSelectedForm((prev) => (prev === stepId ? '' : stepId));
  };

  // Computed line items with resolved values
  const evaluatedItems = useMemo(() => {
    return rules.map((rule) => {
      const evalQty = rule.isCalculated ? resolveTokenValue(rule.number) : Number(rule.number) || 0;
      const evalPrice = rule.isCalculated ? resolveTokenValue(rule.unitPrice) : Number(rule.unitPrice) || 0;
      const btwRate = Number(rule.btw) || 0;
      const lineSubtotal = rule.enabled ? evalQty * evalPrice : 0;
      const lineTax = rule.enabled ? lineSubtotal * (btwRate / 100) : 0;

      return {
        ...rule,
        evalQty,
        evalPrice,
        btwRate,
        lineSubtotal,
        lineTax,
      };
    });
  }, [rules, job]);

  // Financial totals
  const subtotal = useMemo(() => {
    return evaluatedItems.reduce((acc, item) => acc + (item.enabled ? item.lineSubtotal : 0), 0);
  }, [evaluatedItems]);

  const discountAmount = useMemo(() => {
    return subtotal * (Number(discountPercentage) / 100);
  }, [subtotal, discountPercentage]);

  const taxTotal = useMemo(() => {
    return evaluatedItems.reduce((acc, item) => acc + (item.enabled ? item.lineTax : 0), 0);
  }, [evaluatedItems]);

  const total = useMemo(() => {
    return subtotal - discountAmount + taxTotal;
  }, [subtotal, discountAmount, taxTotal]);

  // Add rules
  const addCalculatedRule = () => {
    const newRule: RuleItem = {
      salesGroup: salesGroupList.length > 0 ? salesGroupList[0]._id : '',
      description: 'Calculated Service',
      number: '{{relocation_totalVolume}}',
      unitPrice: '{{relocation_pricePerMeterCubic}}',
      btw: '21',
      enabled: true,
      isCalculated: true,
    };
    setRules((prev) => [...prev, newRule]);
  };

  const addFixedRule = () => {
    const newRule: RuleItem = {
      salesGroup: salesGroupList.length > 0 ? salesGroupList[0]._id : '',
      description: 'Fixed Item / Service',
      number: 1,
      unitPrice: 0,
      btw: '21',
      enabled: true,
      isCalculated: false,
    };
    setRules((prev) => [...prev, newRule]);
  };

  const updateRuleField = (index: number, field: keyof RuleItem, value: any) => {
    setRules((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const deleteRule = (index: number) => {
    setRules((prev) => prev.filter((_, i) => i !== index));
  };

  // Generate & Create Invoice via NewInvoice API
  const handleProcessWorkflowInvoice = async () => {
    if (!selectedForm) {
      toast.info('Please click and select a workflow stage card first.');
      return;
    }

    const customerId = job?.customer?._id || data?.customer;
    if (!customerId) {
      toast.error('No customer found for this job.');
      return;
    }

    const activeStepObj = STEPS.find((s) => s.id === selectedForm) || STEPS[0];
    setIsSubmitting(true);

    try {
      // Filter & map items
      let finalItems = evaluatedItems
        .filter((item) => {
          if (!item.enabled) return false;
          if (ignoreRules && item.evalQty === 0) return false;
          return true;
        })
        .map((item) => ({
          salesgroup: item.salesGroup,
          description: item.description,
          quantity: item.evalQty,
          price: item.evalPrice,
          btw: item.btw || '0',
        }));

      if (finalItems.length === 0) {
        finalItems = [
          {
            salesgroup: salesGroupList[0]?._id || '',
            description: `${activeStepObj.label} Charge`,
            quantity: 1,
            price: total > 0 ? total : 0,
            btw: '21',
          },
        ];
      }

      const invoicePayload = {
        customer: customerId,
        package: data?._id || job?.package?._id,
        date: invoiceDate,
        financialTemplate: selectedTemplate || undefined,
        reference: reference || `JOB-${job?.index || 'WORKFLOW'}-${activeStepObj.id.toUpperCase()}`,
        Status: status,
        vat: vatSelected,
        taxTypeSalesGroup: taxTypeSalesGroup || (taxTypeList[0]?._id ?? ''),
        ignoreRules: ignoreRules,
        items: finalItems,
        discount_description: discountDescription,
        discount: discountPercentage,
        discountedPrice: discountAmount.toFixed(2),
        subTotal: subtotal.toFixed(2),
        btw: taxTotal.toFixed(2),
        total: total.toFixed(2),
        remark: remark,
        contactPerson: currentUserId,
        job: job?._id,
        jobinput: extraFieldValues,
        type: activeStepObj.type, // "Acceptance of offer", "Start job", "Storage loaded", "After last appointment"
      };

      const response = await axios.post(`${apiPath}/invoice/new_invoice`, invoicePayload);

      // Link invoice to job schedule
      if (job?._id && response.data?._id) {
        try {
          await axios.put(`${apiPath}/api/job-schedule/${job._id}`, {
            invoice: response.data._id,
          });
        } catch (linkErr) {
          console.warn('Could not update job schedule:', linkErr);
        }
      }

      toast.success(`Invoice created for "${activeStepObj.label}" successfully!`, {
        autoClose: 3000,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error creating workflow invoice:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStepConfig = STEPS.find((s) => s.id === selectedForm);

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-strokedark">
        <div>
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Package: {data?.name || job?.package?.name || 'Fixed Full Service'}</span>
          </h3>
        </div>

        <button
          type="button"
          onClick={handleProcessWorkflowInvoice}
          disabled={isSubmitting || !selectedForm}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={!selectedForm ? 'Select a workflow stage first' : 'Create invoice'}
        >
          <AddIcon fontSize="small" />
          <span>
            {isSubmitting
              ? 'Creating Invoice...'
              : selectedForm
                ? `Create Invoice (${activeStepConfig?.label})`
                : 'Create Invoice'}
          </span>
        </button>
      </div>

      {/* Step Selector Cards (The 4 Workflow Stages) - Works as Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {STEPS.map((step) => {
          const isSelected = selectedForm === step.id;
          return (
            <div
              key={step.id}
              onClick={() => handleStageToggle(step.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 select-none relative overflow-hidden ${isSelected
                ? 'bg-primary/10 border-primary shadow-sm text-primary dark:text-white ring-2 ring-primary/40'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-2 h-full bg-primary" />
              )}
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isSelected
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-boxdark text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-strokedark'
                  }`}
              >
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold block truncate">{step.label}</span>
                <span className="text-[10px] text-slate-400 block font-medium mt-0.5">
                  {isSelected ? 'Selected (Click to close)' : 'Click to configure'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice Generator & Configuration Panel (Rendered only when a stage is selected) */}
      {selectedForm && activeStepConfig ? (
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-6">
          {/* Stage Header Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Invoice Settings: {activeStepConfig.label}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              {job?.customer && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white dark:bg-boxdark border border-slate-200/80 dark:border-strokedark text-slate-600 dark:text-slate-300">
                  <PersonOutlineIcon style={{ fontSize: 14 }} className="text-primary" />
                  <span>{job.customer.firstName} {job.customer.lastName}</span>
                </span>
              )}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                Type: {activeStepConfig.type}
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Row 1: Financial Template & VAT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Financial Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="">Select Template</option>
                  {templateList.map((tpl) => (
                    <option key={tpl._id} value={tpl._id}>
                      {tpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* VAT Inclusion Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  VAT Scenario
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVatSelected('inclusive')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${vatSelected === 'inclusive'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white dark:bg-boxdark text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-strokedark hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    Including VAT
                  </button>
                  <button
                    type="button"
                    onClick={() => setVatSelected('exclusive')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${vatSelected === 'exclusive'
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white dark:bg-boxdark text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-strokedark hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    Excluding VAT
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Template Extra Fields */}
            {selectedTemplate && inputFields && inputFields.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-boxdark border border-slate-200/80 dark:border-strokedark space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Template Extra Custom Inputs
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {inputFields.map((field, idx) => (
                    <div key={idx}>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type={field.type || 'text'}
                        placeholder={field.label}
                        value={extraFieldValues[field.name] || data?.[selectedForm]?.[field.name] || ''}
                        onChange={(e) =>
                          setExtraFieldValues((prev) => ({
                            ...prev,
                            [field.name]: e.target.value,
                          }))
                        }
                        className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Row 2: Additional Invoice Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CalendarMonthIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  <span>Invoice Date</span>
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <TagIcon style={{ fontSize: 14 }} className="text-slate-400" />
                  <span>Reference / PO</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. REF-2026-001"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Select Tax (Sales Group)
                </label>
                <select
                  value={taxTypeSalesGroup}
                  onChange={(e) => setTaxTypeSalesGroup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="">Select Tax</option>
                  {taxTypeList.map((tax) => (
                    <option key={tax._id} value={tax._id}>
                      {tax.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Invoice Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Sent">Sent</option>
                </select>
              </div>
            </div>

            {/* Row 3: Discount Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Discount Description
                </label>
                <input
                  type="text"
                  value={discountDescription}
                  onChange={(e) => setDiscountDescription(e.target.value)}
                  placeholder="Enter discount description"
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage || ''}
                  onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                  placeholder="Enter %"
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>
            </div>

            {/* Ignore rules checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ignoreRulesAlways"
                checked={ignoreRules}
                onChange={(e) => setIgnoreRules(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
              />
              <label
                htmlFor="ignoreRulesAlways"
                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Ignore rules with a count of 0
              </label>
            </div>

            {/* Rule Management Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Line Items & Rules ({rules.length} items):
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={addCalculatedRule}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span>Add Calculated Rule</span>
                </button>

                <button
                  type="button"
                  onClick={addFixedRule}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span>Add Fixed Rule</span>
                </button>
              </div>
            </div>

            {/* Rules / Line Items Table */}
            {rules.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100/80 dark:bg-slate-800 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark">
                    <tr>
                      <th className="py-3 px-3 w-1/6">Sales Group</th>
                      <th className="py-3 px-3 w-1/4">Description</th>
                      <th className="py-3 px-3 w-1/5">Quantity / Source</th>
                      <th className="py-3 px-3 w-1/5">Unit Price / Rate</th>
                      <th className="py-3 px-3 w-16">BTW</th>
                      <th className="py-3 px-3 text-right">Subtotal</th>
                      <th className="py-3 px-3 text-center w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {evaluatedItems.map((rule, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${!rule.enabled ? 'opacity-50' : ''
                          }`}
                      >
                        {/* Sales Group */}
                        <td className="p-2.5">
                          <select
                            value={rule.salesGroup}
                            onChange={(e) => updateRuleField(idx, 'salesGroup', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                          >
                            <option value="">Select Group</option>
                            {salesGroupList.map((sg) => (
                              <option key={sg._id} value={sg._id}>
                                {sg.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Description */}
                        <td className="p-2.5">
                          <input
                            type="text"
                            value={rule.description}
                            onChange={(e) => updateRuleField(idx, 'description', e.target.value)}
                            placeholder="Description"
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="p-2.5">
                          {rule.isCalculated ? (
                            <div className="space-y-1">
                              <select
                                value={rule.number}
                                onChange={(e) => updateRuleField(idx, 'number', e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select Metric</option>
                                {QUANTITY_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                <span>Computed:</span>
                                <span className="text-primary font-extrabold">{rule.evalQty}</span>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={rule.number}
                              onChange={(e) =>
                                updateRuleField(idx, 'number', Number(e.target.value) || 0)
                              }
                              placeholder="Qty"
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                            />
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="p-2.5">
                          {rule.isCalculated ? (
                            <div className="space-y-1">
                              <select
                                value={rule.unitPrice}
                                onChange={(e) => updateRuleField(idx, 'unitPrice', e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                              >
                                <option value="">Select Rate Component</option>
                                {PRICE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                <span>Rate:</span>
                                <span className="text-primary font-extrabold">€ {rule.evalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="number"
                              min="0"
                              value={rule.unitPrice}
                              onChange={(e) =>
                                updateRuleField(idx, 'unitPrice', Number(e.target.value) || 0)
                              }
                              placeholder="Price"
                              className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-200 bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                            />
                          )}
                        </td>

                        {/* BTW */}
                        <td className="p-2.5">
                          <select
                            value={rule.btw}
                            onChange={(e) => updateRuleField(idx, 'btw', e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                          >
                            <option value="0">0%</option>
                            <option value="9">9%</option>
                            <option value="21">21%</option>
                          </select>
                        </td>

                        {/* Evaluated Line Subtotal */}
                        <td className="p-2.5 text-right font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                          € {rule.lineSubtotal.toFixed(2)}
                        </td>

                        {/* Actions */}
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateRuleField(idx, 'enabled', e.target.checked)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                              title="Enable / Disable Rule"
                            />
                            <button
                              type="button"
                              onClick={() => deleteRule(idx)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Rule"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/80 rounded-2xl bg-white/60 dark:bg-boxdark/50 space-y-2">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  No line items or rules added yet (0 items).
                </p>
                <p className="text-[11px] text-slate-400">
                  Click <span className="font-bold text-primary">+ Add Calculated Rule</span> or <span className="font-bold text-slate-700 dark:text-slate-300">+ Add Fixed Rule</span> to add invoice lines.
                </p>
              </div>
            )}

            {/* Financial Summary Card */}
            <div className="bg-white dark:bg-boxdark p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs space-y-4">
              <h5 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-2">
                Invoice Calculation Summary
              </h5>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Subtotal
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                    € {subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Discount ({discountPercentage}%)
                  </span>
                  <span className="text-base font-black text-rose-600 dark:text-rose-400 mt-0.5 block">
                    - € {discountAmount.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Tax (BTW)
                  </span>
                  <span className="text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                    + € {taxTotal.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">
                    Grand Total ({vatSelected})
                  </span>
                  <span className="text-lg font-black text-primary mt-0.5 block">
                    € {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Note for recipient textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Note for the recipient / Remark
                </label>
                <textarea
                  rows={2}
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Add note or special instructions for the invoice recipient..."
                  className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                />
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
                <button
                  type="button"
                  onClick={handleProcessWorkflowInvoice}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleOutlineIcon fontSize="small" />
                  <span>
                    {isSubmitting
                      ? 'Creating Invoice...'
                      : `Prepare & Create Invoice (${activeStepConfig.label})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default FinanceModule;
