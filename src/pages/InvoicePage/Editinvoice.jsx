import React, { useContext, useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Autocomplete, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TagIcon from '@mui/icons-material/Tag';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PercentIcon from '@mui/icons-material/Percent';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { apiPath } from '../../../apiPath';
import { UserContext } from '../../UserContext';
import Loader from '../../common/Loader';
import NewCustomer from '../customerDetails/NewCustomer';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const EditInvoice = () => {
    const { id } = useContext(UserContext) || {};
    const { Id } = useParams(); // Get invoiceId from URL parameters
    const { symbol: currencySymbol, code: currencyCode } = useCurrency();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type'); // 'Performa' or standard

    const navigate = useNavigate();

    // State Lists
    const [customerList, setCustomerList] = useState([]);
    const [packageList, setPackageList] = useState([]);
    const [templateList, setTemplateList] = useState([]);
    const [salesGroupList, setSalesGroupList] = useState([]);
    const [taxTypeList, setTaxTypeList] = useState([]);
    const [inputFields, setInputFields] = useState([]);

    // Modal and Loading States
    const [openNewCustomer, setOpenNewCustomer] = useState(false);
    const [vatSelected, setVatSelected] = useState('exclusive');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [packageAutofilled, setPackageAutofilled] = useState(false);
    const [invoiceIndex, setInvoiceIndex] = useState('');

    // Form Setup
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            customer: '',
            package: '',
            date: new Date().toISOString().split('T')[0],
            financialTemplate: '',
            reference: '',
            Status: 'Draft',
            taxTypeSalesGroup: '',
            discount_description: '',
            discount: 0,
            ignoreRules: false,
            remark: '',
            items: [
                {
                    salesgroup: '',
                    description: '',
                    quantity: 1,
                    btw: '21',
                    price: 0,
                },
            ],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'items',
    });

    const watchedItems = watch('items');
    const discountPercentage = watch('discount') || 0;
    const selectedTemplate = watch('financialTemplate') || '';
    const selectedCustomerId = watch('customer') || '';
    const selectedPackageId = watch('package') || '';

    // Selected Customer Details Snippet
    const currentCustomer = useMemo(() => {
        return (customerList || []).find((c) => c._id === selectedCustomerId);
    }, [customerList, selectedCustomerId]);

    // Financial Calculations
    const subtotal = useMemo(() => {
        return (watchedItems || []).reduce((acc, item) => {
            const quantity = Number(item?.quantity) || 0;
            const price = Number(item?.price) || 0;
            return acc + quantity * price;
        }, 0);
    }, [watchedItems]);

    const discountAmount = useMemo(() => {
        const pct = Math.min(Math.max(Number(discountPercentage) || 0, 0), 100);
        return subtotal * (pct / 100);
    }, [subtotal, discountPercentage]);

    const taxTotal = useMemo(() => {
        return (watchedItems || []).reduce((acc, item) => {
            const quantity = Number(item?.quantity) || 0;
            const price = Number(item?.price) || 0;
            const btw = Number(item?.btw) || 0;
            const lineSubtotal = quantity * price;
            return acc + lineSubtotal * (btw / 100);
        }, 0);
    }, [watchedItems]);

    const grandTotal = useMemo(() => {
        return subtotal - discountAmount + taxTotal;
    }, [subtotal, discountAmount, taxTotal]);

    // Fetch initial dropdown metadata
    const handleClient = async () => {
        try {
            const res = await axios.get(`${apiPath}/customer/customerList`);
            setCustomerList(res.data?.customers || []);
        } catch (err) {
            console.error('Error fetching customers:', err);
        }
    };

    const handlePackage = async () => {
        try {
            const res = await axios.get(`${apiPath}/api/packages?type=Manual/No job`);
            setPackageList(res.data || []);
        } catch (err) {
            console.error('Error fetching packages:', err);
        }
    };

    const handlesalesgroup = async () => {
        try {
            const res = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`);
            setSalesGroupList(res.data || []);
        } catch (err) {
            console.error('Error fetching sales groups:', err);
        }
    };

    const handleTaxTypeSalesGroup = async () => {
        try {
            const res = await axios.get(`${apiPath}/api/sale_group?type=tax`);
            setTaxTypeList(res.data || []);
        } catch (err) {
            console.error('Error fetching tax types:', err);
        }
    };

    const handletemplate = async () => {
        try {
            const res = await axios.get(`${apiPath}/api/templates?type=invoice`);
            setTemplateList(res.data || []);
        } catch (err) {
            console.error('Error fetching templates:', err);
        }
    };

    // Fetch existing Invoice Data
    const fetchInvoice = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${apiPath}/invoice/invoice/${Id}`);
            const invoiceData = response.data?.invoice;

            if (!invoiceData) {
                toast.error('Invoice data not found');
                return;
            }

            setInvoiceIndex(invoiceData.index ? `#${invoiceData.index}` : '');

            // Populate core fields
            setValue('customer', invoiceData.customer?._id || invoiceData.customer || '', {
                shouldValidate: true,
            });
            setValue('package', invoiceData.package?._id || invoiceData.package || '');

            const formattedDate = invoiceData.date
                ? new Date(invoiceData.date).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            setValue('date', formattedDate, { shouldValidate: true });

            const templateId = invoiceData.financialTemplate?._id || invoiceData.financialTemplate || '';
            setValue('financialTemplate', templateId, { shouldValidate: true });

            setValue('reference', invoiceData.reference || '');
            setValue('Status', invoiceData.Status || invoiceData.status || 'Draft', {
                shouldValidate: true,
            });
            setValue(
                'taxTypeSalesGroup',
                invoiceData.taxTypeSalesGroup?._id || invoiceData.taxTypeSalesGroup || ''
            );
            setVatSelected(invoiceData.vat === 'inclusive' ? 'inclusive' : 'exclusive');
            setValue('ignoreRules', !!invoiceData.ignoreRules);
            setValue('discount_description', invoiceData.discount_description || '');
            setValue('discount', Number(invoiceData.discount) || 0);
            setValue('remark', invoiceData.remark || '');

            // Load Items
            if (invoiceData.items && Array.isArray(invoiceData.items) && invoiceData.items.length > 0) {
                const mappedItems = invoiceData.items.map((item) => ({
                    salesgroup: item.salesgroup?._id || item.salesgroup || (salesGroupList[0]?._id ?? ''),
                    description: item.description || '',
                    quantity: Number(item.quantity) || 1,
                    btw: item.btw !== undefined ? String(item.btw) : '21',
                    price: Number(item.price) || 0,
                }));
                replace(mappedItems);
            }

            // Load Template Extra Fields if template exists
            if (templateId) {
                try {
                    const inputRes = await axios.get(
                        `${apiPath}/api/input?inputFor=Template&name=${templateId}`
                    );
                    const fields = inputRes.data[0]?.extraFields || [];
                    setInputFields(fields);

                    if (invoiceData.jobinput) {
                        Object.keys(invoiceData.jobinput).forEach((key) => {
                            setValue(`jobinput_${key}`, invoiceData.jobinput[key]);
                        });
                    }
                } catch (inputErr) {
                    console.error('Error fetching template extra fields:', inputErr);
                }
            }
        } catch (error) {
            console.error('Error fetching invoice data:', error);
            toast.error('Failed to load invoice details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initData = async () => {
            await Promise.all([
                handleClient(),
                handlePackage(),
                handletemplate(),
                handlesalesgroup(),
                handleTaxTypeSalesGroup(),
            ]);
            await fetchInvoice();
        };
        initData();
    }, [Id]);

    // Dynamic template extra inputs fetch when selectedTemplate changes
    useEffect(() => {
        if (!selectedTemplate || loading) return;

        const fetchExtraFields = async () => {
            try {
                const response = await axios.get(
                    `${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`
                );
                const fields = response.data[0]?.extraFields || [];
                setInputFields(fields);

                // Populate from package if present
                const selectedPkg = packageList.find((p) => p._id === selectedPackageId);
                if (selectedPkg && fields.length > 0) {
                    fields.forEach((field) => {
                        const val =
                            selectedPkg.invoice?.[field.name] ??
                            selectedPkg[`invoice_${field.name}`] ??
                            selectedPkg[field.name] ??
                            selectedPkg.jobinput?.[field.name] ??
                            selectedPkg.invoice?.jobinput?.[field.name] ??
                            selectedPkg.offers?.[field.name];

                        if (val !== undefined && val !== null && val !== '') {
                            setValue(`jobinput_${field.name}`, val);
                        }
                    });
                }
            } catch (err) {
                console.error('Error fetching template extra fields:', err);
            }
        };
        fetchExtraFields();
    }, [selectedTemplate]);

    // Package Autofill Logic
    const handlePackageChange = async (packageId) => {
        setValue('package', packageId, { shouldValidate: true });
        if (!packageId) {
            setPackageAutofilled(false);
            return;
        }

        const selectedPkg = packageList.find((p) => p._id === packageId);
        if (!selectedPkg) return;

        // 1. Financial Template & Dynamic Extra Fields
        const templateId =
            selectedPkg.invoice?.financialTemplate ||
            selectedPkg.financialTemplate ||
            selectedPkg.offers?.financialTemplate ||
            '';

        if (templateId) {
            setValue('financialTemplate', templateId, { shouldValidate: true });
            try {
                const response = await axios.get(
                    `${apiPath}/api/input?inputFor=Template&name=${templateId}`
                );
                const fields = response.data[0]?.extraFields || [];
                setInputFields(fields);

                fields.forEach((field) => {
                    const val =
                        selectedPkg.invoice?.[field.name] ??
                        selectedPkg[`invoice_${field.name}`] ??
                        selectedPkg[field.name] ??
                        selectedPkg.jobinput?.[field.name] ??
                        selectedPkg.invoice?.jobinput?.[field.name] ??
                        selectedPkg.offers?.[field.name];

                    if (val !== undefined && val !== null && val !== '') {
                        setValue(`jobinput_${field.name}`, val);
                    }
                });
            } catch (err) {
                console.error('Error loading package template fields:', err);
            }
        }

        // 2. VAT Scenario
        if (selectedPkg.vat) {
            setVatSelected(selectedPkg.vat === 'inclusive' ? 'inclusive' : 'exclusive');
        }

        // 3. Tax Type (Sales Group)
        const taxId =
            selectedPkg.taxTypeSalesGroup ||
            (taxTypeList && taxTypeList.length > 0 ? taxTypeList[0]._id : '');
        if (taxId) {
            setValue('taxTypeSalesGroup', taxId, { shouldValidate: true });
        }

        // 4. Ignore Rules
        if (selectedPkg.ignoreRules !== undefined) {
            setValue('ignoreRules', !!selectedPkg.ignoreRules);
        }

        // 5. Discount Description & Percentage
        const discountDesc =
            selectedPkg.invoice?.discountDescription || selectedPkg.discountDescription || '';
        const discountPct = Number(
            selectedPkg.invoice?.percentage || selectedPkg.percentage || 0
        );
        setValue('discount_description', discountDesc);
        setValue('discount', discountPct);

        // 6. Autofill Rules / Items
        const pkgRules =
            selectedPkg.invoice?.rules ||
            selectedPkg.invoicerules ||
            selectedPkg.rules ||
            [];

        if (Array.isArray(pkgRules) && pkgRules.length > 0) {
            const formattedItems = pkgRules.map((rule) => ({
                salesgroup:
                    rule.salesGroup ||
                    rule.salesgroup ||
                    (salesGroupList[0]?._id || ''),
                description: rule.description || '',
                quantity:
                    Number(rule.number) ||
                    (isNaN(Number(rule.number)) ? 1 : Number(rule.number)) ||
                    1,
                btw: rule.btw !== undefined ? String(rule.btw) : '21',
                price: Number(rule.unitPrice) || Number(rule.price) || 0,
            }));
            replace(formattedItems);
        }

        setPackageAutofilled(true);
        toast.info(`Package "${selectedPkg.name}" applied with rules & template!`, {
            autoClose: 2500,
        });
    };

    // Handle manual template change
    const handleTemplateChange = async (templateId) => {
        setValue('financialTemplate', templateId, { shouldValidate: true });
        if (!templateId) {
            setInputFields([]);
            return;
        }
        try {
            const response = await axios.get(
                `${apiPath}/api/input?inputFor=Template&name=${templateId}`
            );
            const fields = response.data[0]?.extraFields || [];
            setInputFields(fields);

            const selectedPkg = packageList.find((p) => p._id === selectedPackageId);
            if (selectedPkg) {
                fields.forEach((field) => {
                    const val =
                        selectedPkg.invoice?.[field.name] ??
                        selectedPkg[`invoice_${field.name}`] ??
                        selectedPkg[field.name] ??
                        selectedPkg.jobinput?.[field.name] ??
                        selectedPkg.invoice?.jobinput?.[field.name] ??
                        selectedPkg.offers?.[field.name];

                    if (val !== undefined && val !== null && val !== '') {
                        setValue(`jobinput_${field.name}`, val);
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching template extra fields:', err);
        }
    };

    // Restructure payload with dynamic extra fields
    const restructureData = (inputData) => {
        const jobinput = {};
        const result = Object.keys(inputData).reduce((acc, key) => {
            if (key.startsWith('jobinput_')) {
                const newKey = key.replace('jobinput_', '');
                jobinput[newKey] = inputData[key];
            } else {
                acc[key] = inputData[key];
            }
            return acc;
        }, {});
        result.jobinput = jobinput;
        return result;
    };

    // Submit Updated Invoice
    const onSubmit = async (formData) => {
        if (!watchedItems || watchedItems.length === 0) {
            toast.error('Please add at least one line item.');
            return;
        }

        setIsSubmitting(true);
        try {
            let finalData = restructureData(formData);
            finalData = {
                ...finalData,
                btw: taxTotal.toFixed(2),
                discountedPrice: discountAmount.toFixed(2),
                vat: vatSelected,
                subTotal: subtotal.toFixed(2),
                total: grandTotal.toFixed(2),
                contactPerson: id,
            };

            await axios.post(`${apiPath}/invoice/update/${Id}`, finalData);
            toast.success('Invoice updated successfully!');
            navigate(-1);
        } catch (error) {
            console.error('Error updating invoice:', error);
            toast.error(
                error.response?.data?.message || error.message || 'Failed to update invoice'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-boxdark-2 p-4 md:p-8 font-sans text-slate-800 dark:text-slate-100">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Top Header & Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-strokedark flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
                            title="Go Back"
                        >
                            <ArrowBackIcon fontSize="small" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Edit {type === 'Performa' ? 'Performa Invoice' : 'Invoice'}
                                </h1>
                                {invoiceIndex && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                                        {invoiceIndex}
                                    </span>
                                )}
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircleOutlineIcon fontSize="small" />
                            <span>{isSubmitting ? 'Updating Invoice...' : 'Save & Update Invoice'}</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Card 1: Client & Package Selection */}
                    <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <PersonOutlineIcon fontSize="small" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                    Client & Package Information
                                </h3>
                            </div>
                            {packageAutofilled && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                    <AutoAwesomeIcon style={{ fontSize: 13 }} />
                                    <span>Package Autofilled</span>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Client Selection with Search feature */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Client <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setOpenNewCustomer(true)}
                                        className="text-xs font-extrabold text-primary hover:underline cursor-pointer"
                                    >
                                        + Add New Client
                                    </button>
                                </div>

                                <Autocomplete
                                    options={customerList || []}
                                    getOptionLabel={(option) =>
                                        typeof option === 'string'
                                            ? option
                                            : `${option.firstName || ''} ${option.lastName || ''} ${option.email ? `(${option.email})` : ''
                                                }`.trim()
                                    }
                                    value={customerList.find((c) => c._id === selectedCustomerId) || null}
                                    onChange={(_, newValue) => {
                                        setValue('customer', newValue ? newValue._id : '', {
                                            shouldValidate: true,
                                        });
                                    }}
                                    filterOptions={(options, state) => {
                                        const query = state.inputValue.toLowerCase().trim();
                                        if (!query) return options;
                                        return options.filter((item) => {
                                            const name = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
                                            const email = (item.email || '').toLowerCase();
                                            const phone = (item.contact || item.mobile || '').toLowerCase();
                                            return name.includes(query) || email.includes(query) || phone.includes(query);
                                        });
                                    }}
                                    isOptionEqualToValue={(option, val) => option._id === val?._id}
                                    renderOption={(props, option) => {
                                        const { key, ...otherProps } = props;
                                        return (
                                            <li
                                                key={key || option._id}
                                                {...otherProps}
                                                className="flex items-center gap-3 p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-xs border-b border-slate-100 dark:border-slate-800 last:border-0"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[10px] shrink-0">
                                                    {(option.firstName?.[0] || 'C') + (option.lastName?.[0] || 'U')}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-bold text-slate-900 dark:text-white truncate">
                                                        {option.firstName} {option.lastName}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 truncate">
                                                        {option.email || option.contact || option.mobile || 'No contact info'}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            placeholder="Search client by name, email, or phone..."
                                            error={!!errors.customer}
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '0.75rem',
                                                    fontSize: '0.75rem',
                                                    backgroundColor: 'var(--tw-bg-opacity, #ffffff)',
                                                    '& fieldset': {
                                                        borderColor: errors.customer ? '#f43f5e' : 'rgba(226, 232, 240, 0.8)',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: errors.customer ? '#f43f5e' : '#3b82f6',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: errors.customer ? '#f43f5e' : '#3b82f6',
                                                    },
                                                    '& input': {
                                                        padding: '4px 8px !important',
                                                        fontSize: '0.75rem',
                                                    },
                                                },
                                            }}
                                        />
                                    )}
                                />
                                <input
                                    type="hidden"
                                    {...register('customer', { required: 'Client is required' })}
                                />
                                {errors.customer && (
                                    <p className="text-rose-500 text-[11px] font-bold mt-1">
                                        {errors.customer.message}
                                    </p>
                                )}

                                {/* Client Snippet if selected */}
                                {currentCustomer && (
                                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark text-xs flex flex-wrap items-center gap-4">
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {currentCustomer.firstName} {currentCustomer.lastName}
                                        </span>
                                        {currentCustomer.email && (
                                            <span className="text-slate-500">{currentCustomer.email}</span>
                                        )}
                                        {(currentCustomer.contact || currentCustomer.mobile) && (
                                            <span className="text-slate-500">
                                                {currentCustomer.contact || currentCustomer.mobile}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Package Selection with Autofill */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Package <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedPackageId}
                                    onChange={(e) => handlePackageChange(e.target.value)}
                                    className={`w-full p-2.5 rounded-xl border ${errors.package
                                            ? 'border-rose-500 ring-1 ring-rose-500'
                                            : 'border-slate-200/80 dark:border-strokedark'
                                        } bg-white dark:bg-boxdark text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                                >
                                    <option value="">Select Package (Auto-populates items & rules)</option>
                                    {packageList.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="hidden"
                                    {...register('package', { required: 'Package is required' })}
                                />
                                {errors.package && (
                                    <p className="text-rose-500 text-[11px] font-bold mt-1">
                                        {errors.package.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Date, Financial Template, Reference, Status */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <CalendarMonthIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                    <span>Invoice Date <span className="text-rose-500">*</span></span>
                                </label>
                                <input
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full p-2.5 rounded-xl border ${errors.date
                                            ? 'border-rose-500 ring-1 ring-rose-500'
                                            : 'border-slate-200/80 dark:border-strokedark'
                                        } bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                                    {...register('date', { required: 'Date is required' })}
                                />
                                {errors.date && (
                                    <p className="text-rose-500 text-[11px] font-bold mt-1">{errors.date.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Financial Template <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => handleTemplateChange(e.target.value)}
                                    className={`w-full p-2.5 rounded-xl border ${errors.financialTemplate
                                            ? 'border-rose-500 ring-1 ring-rose-500'
                                            : 'border-slate-200/80 dark:border-strokedark'
                                        } bg-white dark:bg-boxdark text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                                >
                                    <option value="">Select Template</option>
                                    {templateList.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="hidden"
                                    {...register('financialTemplate', {
                                        required: 'Financial Template is required',
                                    })}
                                />
                                {errors.financialTemplate && (
                                    <p className="text-rose-500 text-[11px] font-bold mt-1">
                                        {errors.financialTemplate.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                    <TagIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                    <span>Reference / PO</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. INV-2026-001"
                                    className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                                    {...register('reference')}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Invoice Status <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                                    {...register('Status', { required: 'Status is required' })}
                                >
                                    <option value="Draft">Draft</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Sent">Sent</option>
                                    {type === 'Performa' && (
                                        <>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Declined">Declined</option>
                                        </>
                                    )}
                                </select>
                                {errors.Status && (
                                    <p className="text-rose-500 text-[11px] font-bold mt-1">
                                        {errors.Status.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dynamic Template Extra Fields */}
                        {selectedTemplate && inputFields && inputFields.length > 0 && (
                            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-strokedark space-y-3 mt-2">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Template Custom Inputs
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {inputFields.map((field, index) => (
                                        <div key={index}>
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                {field.label} {field.required && <span className="text-rose-500">*</span>}
                                            </label>
                                            <input
                                                {...register(`jobinput_${field.name}`, {
                                                    required: field.required ? `${field.label} is required` : false,
                                                })}
                                                placeholder={field.label}
                                                type={field.type || 'text'}
                                                className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            {errors[`jobinput_${field.name}`] && (
                                                <p className="text-rose-500 text-[11px] font-bold mt-0.5">
                                                    {errors[`jobinput_${field.name}`].message}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* VAT & Tax Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-strokedark">
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
                                                : 'bg-white dark:bg-boxdark text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        Including VAT
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setVatSelected('exclusive')}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${vatSelected === 'exclusive'
                                                ? 'bg-primary text-white border-primary shadow-sm'
                                                : 'bg-white dark:bg-boxdark text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        Excluding VAT
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Select Tax (Sales Group) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    className={`w-full p-2.5 rounded-xl border ${errors.taxTypeSalesGroup
                                            ? 'border-rose-500 ring-1 ring-rose-500'
                                            : 'border-slate-200/80 dark:border-strokedark'
                                        } bg-white dark:bg-boxdark text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                                    {...register('taxTypeSalesGroup', { required: 'Tax is required' })}
                                >
                                    <option value="">Select Tax</option>
                                    {taxTypeList.map((item) => (
                                        <option key={item._id} value={item._id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.taxTypeSalesGroup && (
                                    <p className="text-rose-500 text-[11px] font-bold mt-1">
                                        {errors.taxTypeSalesGroup.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Ignore Rules Checkbox */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="ignoreRulesToggle"
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                                {...register('ignoreRules')}
                            />
                            <label
                                htmlFor="ignoreRulesToggle"
                                className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                            >
                                Ignore rules with a count of 0
                            </label>
                        </div>
                    </div>

                    {/* Card 2: Line Items & Rules Table */}
                    <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-strokedark">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                    <ReceiptLongOutlinedIcon fontSize="small" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                    Invoice Line Items ({fields.length})
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    append({
                                        salesgroup: salesGroupList[0]?._id || '',
                                        description: '',
                                        quantity: 1,
                                        btw: '21',
                                        price: 0,
                                    })
                                }
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
                            >
                                <AddCircleOutlineIcon fontSize="small" />
                                <span>Add Item</span>
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark">
                            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                                <thead className="bg-slate-50/90 dark:bg-slate-800/70 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark">
                                    <tr>
                                        <th className="py-3 px-3 w-1/4">Sales Group *</th>
                                        <th className="py-3 px-3 w-1/3">Description</th>
                                        <th className="py-3 px-3 w-20">Quantity</th>
                                        <th className="py-3 px-3 w-24">BTW</th>
                                        <th className="py-3 px-3 w-28">Unit Price ({currencySymbol})</th>
                                        <th className="py-3 px-3 text-right">Subtotal</th>
                                        <th className="py-3 px-3 text-center w-16">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {fields.map((item, index) => {
                                        const currentQty = Number(watchedItems?.[index]?.quantity) || 0;
                                        const currentPrice = Number(watchedItems?.[index]?.price) || 0;
                                        const lineSubtotal = currentQty * currentPrice;

                                        return (
                                            <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                                                {/* Sales Group */}
                                                <td className="p-2.5">
                                                    <select
                                                        className={`w-full p-2 rounded-lg border ${errors?.items?.[index]?.salesgroup
                                                                ? 'border-rose-500'
                                                                : 'border-slate-200 dark:border-strokedark'
                                                            } bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary`}
                                                        {...register(`items.${index}.salesgroup`, {
                                                             required: 'Sales group is required',
                                                         })}
                                                     >
                                                         <option value="">Select Group</option>
                                                         {salesGroupList.map((sg) => (
                                                             <option key={sg._id} value={sg._id}>
                                                                 {sg.name}
                                                             </option>
                                                         ))}
                                                     </select>
                                                     {errors?.items?.[index]?.salesgroup && (
                                                         <p className="text-rose-500 text-[10px] font-bold mt-0.5">
                                                             {errors.items[index].salesgroup.message}
                                                         </p>
                                                     )}
                                                 </td>

                                                 {/* Description */}
                                                 <td className="p-2.5">
                                                     <input
                                                         type="text"
                                                         placeholder="Line description"
                                                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                                                         {...register(`items.${index}.description`)}
                                                     />
                                                 </td>

                                                 {/* Quantity */}
                                                 <td className="p-2.5">
                                                     <input
                                                         type="number"
                                                         min="0"
                                                         step="any"
                                                         placeholder="Qty"
                                                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                                                         {...register(`items.${index}.quantity`, {
                                                             valueAsNumber: true,
                                                             min: { value: 0, message: 'Must be >= 0' },
                                                         })}
                                                     />
                                                 </td>

                                                 {/* BTW */}
                                                 <td className="p-2.5">
                                                     <select
                                                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                                                         {...register(`items.${index}.btw`)}
                                                     >
                                                         <option value="0">0%</option>
                                                         <option value="9">9%</option>
                                                         <option value="21">21%</option>
                                                     </select>
                                                 </td>

                                                 {/* Unit Price */}
                                                 <td className="p-2.5">
                                                     <input
                                                         type="number"
                                                         min="0"
                                                         step="any"
                                                         placeholder="0.00"
                                                         className="w-full p-2 rounded-lg border border-slate-200 dark:border-strokedark bg-white dark:bg-boxdark text-xs focus:ring-1 focus:ring-primary"
                                                         {...register(`items.${index}.price`, {
                                                             valueAsNumber: true,
                                                             min: { value: 0, message: 'Must be >= 0' },
                                                         })}
                                                     />
                                                 </td>

                                                 {/* Line Subtotal */}
                                                 <td className="p-2.5 text-right font-black text-slate-900 dark:text-white whitespace-nowrap">
                                                     {formatCurrency(lineSubtotal)}
                                                 </td>

                                                 {/* Action */}
                                                 <td className="p-2.5 text-center">
                                                     <button
                                                         type="button"
                                                         onClick={() => remove(index)}
                                                         disabled={fields.length === 1}
                                                         className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                                         title="Remove Line"
                                                     >
                                                         <DeleteOutlineIcon fontSize="small" />
                                                     </button>
                                                 </td>
                                             </tr>
                                         );
                                     })}
                                 </tbody>
                             </table>
                         </div>
                     </div>

                     {/* Card 3: Executive Invoice Billing Breakdown & Payment Terms */}
                     <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                         {/* Left Column: Discount Adjustments & Payment Terms (7 cols) */}
                         <div className="lg:col-span-7 space-y-5">
                             {/* Discount & Adjustments Card */}
                             <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4">
                                 <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
                                     <div className="flex items-center gap-2.5">
                                         <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                             <PercentIcon style={{ fontSize: 16 }} />
                                         </div>
                                         <div>
                                             <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                 Discount & Special Pricing
                                             </h4>
                                             <p className="text-[11px] text-slate-400">Apply promotional or negotiated discount</p>
                                         </div>
                                     </div>
                                     {Number(discountPercentage) > 0 && (
                                         <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                                             <span>-{discountPercentage}%</span>
                                             <span className="text-[10px] font-semibold">(-{formatCurrency(discountAmount)})</span>
                                         </span>
                                     )}
                                 </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Discount Reason / Description
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Loyalty discount, Early bird"
                                            className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                                            {...register('discount_description')}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                            Discount Rate (%)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                className="w-full p-2.5 pr-8 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                                                {...register('discount', {
                                                    valueAsNumber: true,
                                                    min: { value: 0, message: 'Discount cannot be negative' },
                                                    max: { value: 100, message: 'Discount cannot exceed 100%' },
                                                })}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                                %
                                            </span>
                                        </div>
                                        {errors.discount && (
                                            <p className="text-rose-500 text-[11px] font-bold mt-1">
                                                {errors.discount.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Terms & Notes Card */}
                            <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                            <ReceiptLongOutlinedIcon style={{ fontSize: 16 }} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                                Payment Terms & Notes
                                            </h4>
                                            <p className="text-[11px] text-slate-400">Instructions printed on the invoice for the client</p>
                                        </div>
                                    </div>
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="e.g. Please pay within 14 days of invoice date to account NL91 ABNA 0417... BIC: ABNANL2A citing invoice number."
                                    className="w-full p-3.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs leading-relaxed"
                                    {...register('remark')}
                                />
                            </div>
                        </div>

                        {/* Right Column: Authentic Executive Invoice Statement Receipt (5 cols) */}
                        <div className="lg:col-span-5">
                            <div className="bg-gradient-to-b from-white to-slate-50/80 dark:from-boxdark dark:to-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-strokedark p-6 shadow-md space-y-5 relative">
                                {/* Statement Header */}
                                <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-strokedark">
                                    <div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                                            TAX INVOICE STATEMENT
                                        </span>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                            Summary of Charges
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs">
                                            {currencyCode} ({currencySymbol})
                                        </span>
                                    </div>
                                </div>

                                {/* Tabular Itemized Breakdown with dotted line aesthetics */}
                                <div className="space-y-3 text-xs">
                                    {/* Subtotal */}
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100/80 dark:border-slate-800/60">
                                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                                            Line Items Subtotal
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </div>

                                    {/* Discount Line */}
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100/80 dark:border-slate-800/60">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">
                                                Discount
                                            </span>
                                            {Number(discountPercentage) > 0 && (
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
                                                    {discountPercentage}%
                                                </span>
                                            )}
                                        </div>
                                        <span
                                            className={`font-bold font-mono text-sm ${
                                                discountAmount > 0
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : formatCurrency(0)}
                                        </span>
                                    </div>

                                    {/* Net Taxable Amount */}
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100/80 dark:border-slate-800/60">
                                        <span className="font-semibold text-slate-600 dark:text-slate-400">
                                            Net Taxable Base
                                        </span>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-sm">
                                            {formatCurrency(subtotal - discountAmount)}
                                        </span>
                                    </div>

                                    {/* Tax BTW Line */}
                                    <div className="flex items-center justify-between py-1 border-b border-slate-100/80 dark:border-slate-800/60">
                                        <div className="flex items-center gap-1.5">
                                            <span className="font-semibold text-slate-600 dark:text-slate-400">
                                                Total BTW / Tax
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {vatSelected === 'inclusive' ? 'VAT Included' : 'VAT Excluded'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                                            + {formatCurrency(taxTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Grand Total Box (Executive Dark Slate & Indigo Gradient Banner) */}
                                <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 shadow-lg border border-slate-700/50">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                                            TOTAL DUE
                                        </span>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/15">
                                            {vatSelected === 'inclusive' ? 'Incl. BTW' : 'Excl. BTW'}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline justify-between pt-1">
                                        <span className="text-xs text-slate-400">Total Payable</span>
                                        <span className="text-2xl md:text-3xl font-black text-white font-mono tracking-tight">
                                            {formatCurrency(grandTotal)}
                                        </span>
                                    </div>
                                </div>

                                {/* Form Action Buttons */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircleOutlineIcon fontSize="small" />
                                        <span>{isSubmitting ? 'Updating Invoice...' : 'Save & Update Invoice'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Modal to add new customer directly */}
            <NewCustomer
                setOpen={setOpenNewCustomer}
                open={openNewCustomer}
                handler={handleClient}
                type="Customer"
            />
        </div>
    );
};

export default EditInvoice;
