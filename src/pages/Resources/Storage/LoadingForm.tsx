import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import CustomerForm from '../../Jobpage/helper/NewcustomForm';
import Loader from '../../../common/Loader/index';
import ReactDatePicker from '../../../common/ReactDatepicker';
import { 
  MdWarehouse, 
  MdAdd, 
  MdClose, 
  MdDeleteOutline, 
  MdCheckCircle, 
  MdPerson, 
  MdReceipt, 
  MdInventory2 
} from 'react-icons/md';

const LoadingForm: React.FC<any> = ({ handler, storageData }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [customerType, setCustomerType] = useState('existing');
  const [countries, setCountries] = useState([]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rows: [
        {
          description: '',
          itemCode: '',
          externalCode: '',
          contents: '',
          storageLocation: storageData?.storageLocation?._id || '',
          loadedOn: null,
          ReleasedOn: null,
          loadedByEmployee: null,
          ReleasedByEmployee: null,
          loadedByCustomer: false,
        },
      ],
    },
  }) as any;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rows',
  });

  const [invoicePeriod, setInvoicePeriod] = useState('Monthly');
  const [vatOption, setVatOption] = useState('Including VAT');
  const [storageOption, setStorageOption] = useState('In advance');
  const [salesGroupOption, setSalesGroupOption] = useState<any>([]);
  const [jobs, setJobs] = useState<any>([]);
  const [invoicePerVolume, setInvoicePerVolume] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const handleCustomerTypeChange = (event: any) => {
    setCustomerType(event.target.value);
    setValue('customer', '');
  };

  const [activeStep, setActiveStep] = useState(0);
  const handleBack = () => setActiveStep((prev) => Math.max(0, prev - 1));
  const handleClose = () => {
    setOpen(false);
    reset();
    setActiveStep(0);
  };
  const invoicingStartDate = watch('invoicingStartDate');
  const volumeHandler = watch('rows');

  const totalVolume = volumeHandler?.reduce((acc: any, item: any) => {
    if (item.contents) {
      return acc + Number(item.contents);
    }
    return acc;
  }, 0) || 0;

  useEffect(() => {
    if (storageData && storageData.cubicMeter < totalVolume) {
      alert(`Storage has only ${storageData.cubicMeter} m³ Space`);
    }
    setValue('totalVolume', totalVolume);
  }, [totalVolume]);

  const steps = [
    { label: '1. Customer Details', icon: <MdPerson className="w-4 h-4" /> },
    { label: '2. Billing & Terms', icon: <MdReceipt className="w-4 h-4" /> },
    { label: '3. Inventory Items', icon: <MdInventory2 className="w-4 h-4" /> },
  ];

  const onSubmit = (formData: any) => {
    let finalData = {
      ...formData,
      percentageFill: ((totalVolume / (storageData?.cubicMeter || 1)) * 100).toFixed(2),
      invoicePerVolume: invoicePerVolume,
      invoicingPeriod: invoicePeriod,
      storageStatus: 'In use',
      costAction: formData.action ? [formData.action] : [],
      includingVat: vatOption,
      billStorageInAdvance: storageOption,
      events: formData.rows,
      loadedOn: new Date(),
    };
    storageHandlers(finalData);
  };

  const storageHandlers = async (formData: any) => {
    setLoading(true);
    let path = `${apiPath}/api/storages/${storageData?._id}`;
    try {
      if (customerType === 'new') {
        const customerResponse = await axios.post(
          `${apiPath}/customer/customeradd`,
          formData.client,
        );
        formData.customer = customerResponse.data._id;
      }
      const response = await axios.post(path, formData);
      if (response.status === 201 || response.status === 200) {
        handler();
        setOpen(false);
        reset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Something went wrong. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAllEmploye = async () => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      let Employee = response['data']?.map((team: any) => {
        return { label: team.username, value: team._id };
      }) || [];
      setData(Employee);
    } catch (err) {
      console.error(err);
    }
  };

  let customerId = watch('customer');
  const handleAllJob = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/jobList?customer=${customerId || ''}`,
      );
      let jobs = response['data']?.jobList?.map((job: any) => {
        return {
          label: `${job.customer?.firstName || ''} ${job.customer?.lastName || ''} (${job.index})`,
          value: job._id,
        };
      }) || [];
      setJobs(jobs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleAllJob();
  }, [customerId]);

  const handleClient = async () => {
    try {
      let response = await axios.get(apiPath + '/customer/customerList');
      setCustomer(response.data?.customers || []);
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const countriesHandler = async () => {
    try {
      let response = await axios.get(`${apiPath}/api/sale_group?type=country`);
      const countryNames = response.data?.map((country: any) => country?.name) || [];
      setCountries(countryNames);
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const salesGroupHandler = async () => {
    try {
      let response = await axios.get(
        `${apiPath}/api/sale_group?type=salesGroup`,
      );
      setSalesGroupOption(response.data || []);
    } catch (error) {
      console.error('Error fetching sales groups:', error);
    }
  };

  useEffect(() => {
    handleAllEmploye();
    salesGroupHandler();
    handleClient();
    countriesHandler();
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
      >
        <MdWarehouse className="w-4 h-4" />
        <span>Load Storage</span>
      </button>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Modal open={open} onClose={handleClose}>
          <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-slate-100 z-10">
              {loading && <Loader />}
              
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <MdWarehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Load Storage ({storageData?.storageCode})
                    </h3>
                    <p className="text-xs text-slate-500">Assign customer and load inventory units</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <MdClose className="w-5 h-5" />
                </button>
              </div>

              <div className="px-6 pt-4 pb-2 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  {steps.map((step, idx) => {
                    const isCurrent = activeStep === idx;
                    const isCompleted = activeStep > idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveStep(idx)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                            : isCompleted
                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200/70'
                        }`}
                      >
                        {isCompleted ? <MdCheckCircle className="w-4 h-4 text-indigo-600" /> : step.icon}
                        <span>{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                {activeStep === 0 && (
                  <div className="space-y-5 max-w-2xl mx-auto py-2">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-center">
                      <RadioGroup
                        row
                        value={customerType}
                        onChange={handleCustomerTypeChange}
                        className="gap-6"
                      >
                        <FormControlLabel
                          value="existing"
                          control={<Radio size="small" />}
                          label={<span className="text-xs font-bold text-slate-800">Existing Customer</span>}
                        />
                        <FormControlLabel
                          value="new"
                          control={<Radio size="small" />}
                          label={<span className="text-xs font-bold text-slate-800">New Customer</span>}
                        />
                      </RadioGroup>
                    </div>

                    {customerType === 'new' && (
                      <CustomerForm
                        register={register}
                        errors={errors}
                        control={control}
                        countries={countries}
                      />
                    )}

                    {customerType === 'existing' && (
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Select Customer <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="customer"
                          control={control}
                          defaultValue=""
                          rules={{ required: 'Customer is required' }}
                          render={({ field }) => (
                            <select
                              {...field}
                              className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                errors.customer ? 'border-red-500' : 'border-slate-300 focus:border-indigo-500'
                              } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800`}
                            >
                              <option value="">Select customer...</option>
                              {customer && customer.map((item: any) => (
                                <option key={item._id} value={item._id}>
                                  {item.firstName} {item.lastName} ({item.email || 'No email'})
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        {errors.customer && (
                          <p className="text-red-500 text-xs mt-1">{errors.customer.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-5 max-w-2xl mx-auto py-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        Invoice Period
                      </label>
                      <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                        {['Daily', 'Weekly', 'Monthly', 'quarter', 'Annual'].map((period) => (
                          <button
                            type="button"
                            key={period}
                            className={`py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                              invoicePeriod === period
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                            onClick={() => setInvoicePeriod(period)}
                          >
                            {period === 'quarter' ? 'Quarter' : period}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          VAT Option
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                          {['Including VAT', 'Excluding VAT'].map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                vatOption === option
                                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              onClick={() => setVatOption(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                          Billing Schedule
                        </label>
                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                          {['In advance', 'Afterwards'].map((option) => (
                            <button
                              type="button"
                              key={option}
                              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                storageOption === option
                                  ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/80'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                              onClick={() => setStorageOption(option)}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          VAT % <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                          {...register('vatPercentage', { required: 'VAT is required' })}
                        >
                          <option value="">Select VAT</option>
                          <option value="0">0%</option>
                          <option value="9">9%</option>
                          <option value="21">21%</option>
                        </select>
                        {errors.vatPercentage && <p className="text-red-500 text-xs mt-1">{errors.vatPercentage.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Price per {invoicePeriod} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                          {...register('price', { required: 'Price is required' })}
                          placeholder="e.g. 150"
                        />
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Sales Group
                        </label>
                        <select
                          className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                          {...register('salesGroup')}
                        >
                          <option value="">Select Sales Group</option>
                          {salesGroupOption && salesGroupOption.map((item: any) => (
                            <option key={item._id} value={item.name}>{item.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Job
                        </label>
                        <select
                          className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                          {...register('storedForProject')}
                        >
                          <option value="">Select Job</option>
                          {jobs && jobs.map((item: any) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <ReactDatePicker
                          control={control}
                          name="invoicingStartDate"
                          rules={{ required: 'Start date is required' }}
                          placeholderText="Select Start date"
                        />
                        {errors.invoicingStartDate && <p className="text-red-500 text-xs mt-1">{errors.invoicingStartDate.message}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          Last Invoiced Date
                        </label>
                        <ReactDatePicker
                          control={control}
                          name="lastInvoicedDate"
                          minDate={invoicingStartDate}
                          placeholderText="Select Last date"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-5 py-2">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Inventory Items to Load</h4>
                        <p className="text-xs text-slate-500">Total volume filled: <span className="font-bold text-indigo-600">{totalVolume} m³</span> of {storageData?.cubicMeter} m³</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          append({
                            description: '',
                            itemCode: '',
                            externalCode: '',
                            contents: '',
                            storageLocation: storageData?.storageLocation?._id || '',
                            loadedOn: '',
                            ReleasedOn: '',
                            loadedByEmployee: '',
                            ReleasedByEmployee: null,
                            loadedByCustomer: false,
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                      >
                        <MdAdd className="w-4 h-4" />
                        <span>Add Row</span>
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Item Code</th>
                            <th className="p-3 text-left">Ext Code</th>
                            <th className="p-3 text-left">Vol (m³)</th>
                            <th className="p-3 text-left">Loaded On</th>
                            <th className="p-3 text-left">Handler</th>
                            <th className="p-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {fields.map((field: any, index: any) => (
                            <tr key={field.id} className="hover:bg-slate-50/50">
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="Item name/description"
                                  {...register(`rows.${index}.description`, {
                                    required: 'Required',
                                  })}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="Code"
                                  {...register(`rows.${index}.itemCode`)}
                                  className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  placeholder="Ext Code"
                                  {...register(`rows.${index}.externalCode`)}
                                  className="w-24 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  min={0}
                                  placeholder="0"
                                  {...register(`rows.${index}.contents`)}
                                  className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                />
                              </td>
                              <td className="p-2">
                                <ReactDatePicker
                                  control={control}
                                  name={`rows.${index}.loadedOn`}
                                  placeholderText="Date"
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  {...register(`rows.${index}.loadedByEmployee`)}
                                  className="w-32 px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                                >
                                  <option value="">Select Employee</option>
                                  {data && data.map((item: any) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete row"
                                >
                                  <MdDeleteOutline className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Notes
                      </label>
                      <input
                        type="text"
                        className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                        {...register('notes')}
                        placeholder="Additional notes about this loading..."
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-40"
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      Cancel
                    </button>

                    {activeStep < 2 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStep((prev) => prev + 1)}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                      >
                        Next Step
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                      >
                        Submit & Load Storage
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </Box>
        </Modal>
      </LocalizationProvider>
    </>
  );
};

export default LoadingForm;
