import React, { useContext, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PercentIcon from '@mui/icons-material/Percent';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { useNavigate, useParams } from 'react-router-dom';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import Loader from '../../common/Loader';
import SearchableClientSelect from '../../components/SearchableClientSelect';
import { useCurrency } from '../../utils/currencyUtil';

const Editoffer = ({ display, offer, onclose }) => {
  const { formatCurrency } = useCurrency();
  const { id } = useContext(UserContext);
  const params = useParams();
  const Id = !offer ? params.Id : offer._id;
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');

  const [packageList, setPackage] = useState([]);
  const [templateList, setTemplate] = useState([]);
  const [vatSelected, setVatSelected] = useState('exclusive');
  const [salesgroup, setSales] = useState([]);
  const [inputField, setInputFields] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      items: [
        { salesgroup: '', description: '', quantity: 1, btw: '', price: 0 },
      ],
      discount: 0,
    },
  });

  const handleVatSelect = (type) => {
    setVatSelected(type);
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items') || [];
  const discountPercentage = watch('discount') || 0;
  const selectedTemplate = watch('financialTemplate') || '';
  const selectedCustomerValue = watch('customer') || '';

  // Register hidden customer input for validation tracking
  useEffect(() => {
    register('customer', { required: 'Client selection is required' });
  }, [register]);

  // Calculations
  const subtotal = items.reduce((acc, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    return acc + quantity * price;
  }, 0);

  const taxTotal = items.reduce((acc, item) => {
    const quantity = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.price) || 0;
    const btw = parseFloat(item.btw) || 0;
    const itemTax = price * quantity * (btw / 100);
    return acc + itemTax;
  }, 0);

  const discountAmount = subtotal * (discountPercentage / 100);
  const total = subtotal - discountAmount + taxTotal;

  const navigate = useNavigate();

  const handleClient = async () => {
    try {
      const response = await axios.get(`${apiPath}/customer/customerList`);
      setCustomer(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setTimeout(() => {
        fetchInvoice();
      }, 1);
    }
  };

  const fetchInvoice = async () => {
    if (!Id) return;
    try {
      setLoading(true);
      const response = await axios.get(`${apiPath}/finance/finance/${Id}`);
      const invoiceData = response.data.finance;
      reset();
      setValue('customer', invoiceData?.customer?._id, { shouldValidate: true });
      setValue('package', invoiceData?.package?._id);
      if (invoiceData?.date) {
        const formattedDate = new Date(invoiceData.date)
          .toISOString()
          .split('T')[0];
        setValue('date', formattedDate);
      }
      setValue('financialTemplate', invoiceData?.financialTemplate?._id);
      setValue('reference', invoiceData?.reference);
      setValue('Status', invoiceData?.Status);
      setValue('discount', invoiceData?.discount);
      setValue('discount_description', invoiceData?.discount_description);
      setVatSelected(invoiceData?.vat || 'exclusive');
      setValue('ignoreRules', invoiceData?.ignoreRules);
      if (invoiceData?.expire_date) {
        setValue(
          'expire_date',
          new Date(invoiceData.expire_date).toISOString().split('T')[0]
        );
      }

      fields.forEach((_, index) => remove(index));

      if (invoiceData?.items && invoiceData.items.length > 0) {
        invoiceData.items.forEach((item) => {
          append({
            salesgroup: item?.salesgroup?._id || item?.salesgroup || '',
            description: item?.description || '',
            quantity: item?.quantity || 1,
            btw: item?.btw || '',
            price: item?.price || 0,
          });
        });
      }

      if (invoiceData?.jobinput) {
        Object.keys(invoiceData.jobinput).forEach((key) => {
          setValue(`jobinput_${key}`, invoiceData.jobinput[key]);
        });
      }

      setValue('discount_description', invoiceData?.discount_description || '');
      setValue('discount', invoiceData?.discount || 0);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackage = async () => {
    try {
      const response = await axios.get(
        apiPath + '/api/packages?type=Manual/No job'
      );
      setPackage(response.data || []);
    } catch (error) {
      console.error('Error fetching package:', error.message);
    }
  };

  const handlesalesgroup = async () => {
    try {
      const response = await axios.get(
        apiPath + '/api/sale_group?type=salesGroup'
      );
      setSales(response.data || []);
    } catch (error) {
      console.error('Error fetching sales group:', error.message);
    }
  };

  const handleAllinputs = async () => {
    if (!selectedTemplate) return;
    try {
      const response = await axios.get(
        `${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`
      );
      setInputFields(response.data[0]?.extraFields || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handletemplate = async () => {
    try {
      const response = await axios.get(apiPath + '/api/templates?type=quote');
      setTemplate(response.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error.message);
    }
  };

  const handleInvoice = async (data) => {
    setIsSubmitting(true);
    let finalData = restructureData(data);
    try {
      await axios.post(
        `${apiPath}/finance/update/${Id}`,
        finalData
      );
      alert('Offer updated successfully');
      if (display === 'none') {
        onclose && onclose();
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error updating offer:', error);
      alert('Error updating offer proposal');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedTemplate) {
      handleAllinputs();
    }
  }, [selectedTemplate]);

  useEffect(() => {
    handleClient();
    handlePackage();
    handletemplate();
    handlesalesgroup();
  }, [Id]);

  function restructureData(inputData) {
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
  }

  const onSubmit = (data) => {
    let finalData = {
      ...data,
      btw: taxTotal.toFixed(2),
      discountedPrice: discountAmount.toFixed(2),
      vat: vatSelected,
      subTotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      contactPerson: id,
    };
    handleInvoice(finalData);
  };

  if (loading) return <Loader />;

  const isModalView = display === 'none';

  return (
    <div
      className={
        !isModalView
          ? 'max-w-7xl w-full mx-auto p-4 sm:p-8 my-4 sm:my-6 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xl transition-all text-slate-800 dark:text-white'
          : 'bg-white dark:bg-boxdark p-4 sm:p-6 text-slate-800 dark:text-white w-full'
      }
    >
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-strokedark">
        <div className="flex items-center gap-3">
          {!isModalView && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-meta-4 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              title="Go back"
            >
              <KeyboardBackspaceIcon />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <RequestQuoteIcon className="text-primary" />
              Edit Offer Proposal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Update quotation details, pricing structure, and items
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200">
          Editing Mode
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General Information Card */}
        <div className="bg-slate-50/60 dark:bg-meta-4/20 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-strokedark space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ReceiptLongIcon fontSize="small" className="text-primary" />
            General Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Searchable Client Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Client <span className="text-rose-500">*</span>
              </label>
              <SearchableClientSelect
                customerList={customer}
                value={selectedCustomerValue}
                onChange={(val) => setValue('customer', val, { shouldValidate: true })}
                error={!!errors.customer}
              />
              {errors.customer && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.customer.message}
                </p>
              )}
            </div>

            {/* Package */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Package <span className="text-rose-500">*</span>
              </label>
              <select
                className={`w-full rounded-xl border ${
                  errors.package ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-boxdark px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium`}
                {...register('package', { required: 'Package selection is required' })}
              >
                <option value="">Select Package</option>
                {packageList.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.package && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.package.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && (
                <p className="text-rose-500 text-xs mt-1 font-medium">{errors.date.message}</p>
              )}
            </div>

            {/* Financial Template */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Financial Template <span className="text-rose-500">*</span>
              </label>
              <select
                className={`w-full rounded-xl border ${
                  errors.financialTemplate ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-300 dark:border-slate-600'
                } bg-white dark:bg-boxdark px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium`}
                {...register('financialTemplate', { required: 'Template is required' })}
              >
                <option value="">Select Template</option>
                {templateList.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {errors.financialTemplate && (
                <p className="text-rose-500 text-xs mt-1 font-medium">
                  {errors.financialTemplate.message}
                </p>
              )}
            </div>

            {/* Reference */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Reference Code
              </label>
              <input
                type="text"
                placeholder="e.g. REF-2026-001"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                {...register('reference')}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                Proposal Status <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                {...register('Status', { required: 'Status is required' })}
              >
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dynamic Template Inputs Section */}
        {selectedTemplate && inputField && inputField.length > 0 && (
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Template Specific Fields ({selectedTemplate})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inputField.map((field, index) => (
                <div key={index}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    {...register(`jobinput_${field.name}`, { required: field.required })}
                    placeholder={field.label}
                    type={field.type || 'text'}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                  {errors[`jobinput_${field.name}`] && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">Field is required</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VAT & Business Rule Options */}
        <div className="bg-slate-50/60 dark:bg-meta-4/20 p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              VAT Pricing Model
            </label>
            <div className="inline-flex rounded-xl p-1 bg-slate-200/80 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600">
              <button
                type="button"
                onClick={() => handleVatSelect('inclusive')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  vatSelected === 'inclusive'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Including VAT
              </button>
              <button
                type="button"
                onClick={() => handleVatSelect('exclusive')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  vatSelected === 'exclusive'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Excluding VAT
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <input
              type="checkbox"
              id="ignoreRules"
              {...register('ignoreRules')}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 accent-primary"
            />
            <label htmlFor="ignoreRules" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Ignore rules with a count of 0
            </label>
          </div>
        </div>

        {/* Line Items Container */}
        <div className="bg-slate-50/60 dark:bg-meta-4/20 p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Itemized Proposal Items
            </h2>
            <span className="text-xs text-slate-400">
              {fields.length} line item{fields.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Desktop Column Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 pb-2 border-b border-slate-200 dark:border-strokedark text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-3">Sales Group *</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">BTW (Tax)</div>
            <div className="col-span-1">Price ($)</div>
            <div className="col-span-1 text-center">Remove</div>
          </div>

          {/* Item Rows */}
          <div className="space-y-3">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white dark:bg-boxdark p-3.5 rounded-xl border border-slate-200/90 dark:border-strokedark shadow-sm"
              >
                {/* Sales group */}
                <div className="col-span-1 md:col-span-3">
                  <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Sales Group *
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                    {...register(`items.${index}.salesgroup`, {
                      required: 'Sales group is required',
                    })}
                  >
                    <option value="">Select Group</option>
                    {salesgroup?.map((sg, idx) => (
                      <option key={idx} value={sg._id}>
                        {sg.name}
                      </option>
                    ))}
                  </select>
                  {errors?.items?.[index]?.salesgroup && (
                    <p className="text-rose-500 text-xs mt-1">
                      {errors.items[index].salesgroup.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="col-span-1 md:col-span-3">
                  <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Item details or specification..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                    {...register(`items.${index}.description`)}
                  />
                </div>

                {/* Quantity */}
                <div className="col-span-1 md:col-span-2">
                  <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                    onKeyDown={(e) => {
                      if (e.key === '+' || e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>

                {/* BTW Tax */}
                <div className="col-span-1 md:col-span-2">
                  <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block">
                    BTW (Tax %)
                  </label>
                  <select
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                    {...register(`items.${index}.btw`)}
                  >
                    <option value="">Select %</option>
                    <option value="0">0%</option>
                    <option value="9">9%</option>
                    <option value="21">21%</option>
                  </select>
                </div>

                {/* Price */}
                <div className="col-span-1 md:col-span-1">
                  <label className="md:hidden text-xs font-bold text-slate-500 uppercase mb-1 block">
                    Price
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-2.5 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                    onKeyDown={(e) => {
                      if (e.key === '+' || e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}
                    {...register(`items.${index}.price`, { valueAsNumber: true })}
                  />
                </div>

                {/* Remove button */}
                <div className="col-span-1 md:col-span-1 text-right md:text-center">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Remove Item"
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add item button */}
          <button
            type="button"
            onClick={() =>
              append({
                salesgroup: '',
                description: '',
                quantity: 1,
                btw: '',
                price: 0,
              })
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-dashed border-primary/40 text-primary hover:bg-primary/5 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
          >
            <AddIcon fontSize="small" />
            <span>Add Item Row</span>
          </button>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/60 dark:bg-meta-4/20 p-5 rounded-2xl border border-slate-200/80 dark:border-strokedark">
          {/* Discount details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <PercentIcon fontSize="small" className="text-primary" />
              Discount Adjustments
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount Reason / Note
              </label>
              <input
                type="text"
                placeholder="e.g. Seasonal Promotion"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3.5 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                {...register('discount_description')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-boxdark px-3.5 py-2 text-sm focus:outline-none focus:border-primary font-medium"
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                {...register('discount', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Financial Totals */}
          <div className="bg-white dark:bg-boxdark p-4 rounded-xl border border-slate-200 dark:border-strokedark space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Financial Breakdown
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Discount ({discountPercentage}%):</span>
                <span className="font-semibold text-rose-600">
                  - {formatCurrency(discountAmount)}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Total Tax (BTW):</span>
                <span className="font-semibold text-emerald-600">
                  + {formatCurrency(taxTotal)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-strokedark flex justify-between items-center">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  Grand Total:
                </span>
                <span className="text-2xl font-black text-primary dark:text-blue-400">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!isModalView && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Proposal...' : 'Update Offer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Editoffer;
