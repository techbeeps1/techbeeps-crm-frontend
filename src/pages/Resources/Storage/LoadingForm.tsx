import React, { useState, useEffect } from 'react';

import {
  Button,
  IconButton,
  Modal,
  Box,
  Tabs,
  Tab,
  MenuItem,
  Select,
  Typography,
  FormControl,
  Avatar,
  InputLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import CustomerForm from '../../Jobpage/helper/NewcustomForm';
import Loader from '../../../common/Loader/index';
import ReactDatePicker from '../../../common/ReactDatepicker';

const LoadingForm: React.FC<any> = ({ handler, storageData }) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);

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
          storageLocation: '',
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

  const [customerType, setCustomerType] = useState('existing');
  const [countries, setCountries] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [invoicePeriod, setInvoicePeriod] = useState('Monthly');
  const [vatOption, setVatOption] = useState('Including VAT');
  const [storageOption, setStorageOption] = useState('In advance');
  const [salesGroupOption, setSalesGroupOption] = useState<any>([]);
  const [jobs, setJobs] = useState<any>([]);
  const [handlingCost, setHandlingCost] = useState<any>('No');
  const [invoicePerVolume, setInvoicePerVolume] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const handleCustomerTypeChange = (event: any) => {
    setCustomerType(event.target.value);
    setValue('customer', '');
  };

  const [activeStep, setActiveStep] = useState(0);

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleClose = () => {
    setOpen(false), reset();
  };
  const invoicingStartDate = watch('invoicingStartDate');

  const volumeHandler = watch('rows');

  const totalVolume = volumeHandler?.reduce((acc: any, item: any) => {
    if (item.contents) {
      return acc + Number(item.contents);
    }
    return acc;
  }, 0);

  useEffect(() => {
    if (storageData.cubicMeter < totalVolume) {
      alert(`Storage has only ${storageData.cubicMeter} m\u00B3 Space`);
    }
    setValue('totalVolume', totalVolume);
  }, [totalVolume]);

  const steps = [
    { label: 'Customer' },
    { label: 'Billing' },
    { label: 'What' },
  ];

  const onSubmit = (data: any) => {
    let finalData = {
      ...data,
      percentageFill: ((totalVolume / storageData.cubicMeter) * 100).toFixed(2),
      invoicePerVolume: invoicePerVolume,
      invoicingPeriod: invoicePeriod,
      storageStatus: 'In use',
      costAction: [data.action],
      includingVat: vatOption,
      billStorageInAdvance: storageOption,
      events: data.rows,
      loadedOn: new Date(),
    };
    storageHandlers(finalData);
  };

  const storageHandlers = async (data: any) => {
    setLoading(true);
    let path = `${apiPath}/api/storages/${storageData?._id}`;
    try {
      if (customerType === 'new') {
        const customerResponse = await axios.post(
          `${apiPath}/customer/customeradd`,
          data.client,
        );
        data.customer = customerResponse.data._id;
      }
      const response = await axios.post(path, data);
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

  const handleNext = () => {
    handleSubmit(() => {
      setActiveStep((prev) => prev + 1);
    })();
  };

  const handleAllEmploye = async () => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      let Employee = response['data'].map((team: any) => {
        return { label: team.username, value: team._id };
      });
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
      let jobs = response['data'].jobList.map((job: any) => {
        return {
          label:
            job.customer?.firstName +
            ' ' +
            job.customer?.lastName +
            ` (${job.index})`,
          value: job._id,
        };
      });
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
      setCustomer(response.data.customers);
    } catch (error: any) {
      alert(error.message);
    }
  };
  const countriesHandler = async () => {
    try {
      let response = await axios.get(`${apiPath}/api/sale_group?type=country`);
      const countryNames = response.data?.map((country: any) => country?.name);
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
      setSalesGroupOption(response.data);
    } catch (error) {
      console.error('Error fetching countries:', error);
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
      <div>
        <button
          onClick={() => setOpen(true)}
          className="px-3 py-2 h-auto text-lg font-semibold bg-sky-700 text-red-600 border border-red-600 rounded hover:bg-red-600 text-white transition duration-300"
        >
          Load Storage
        </button>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Modal open={open} onClose={handleClose}>
            <Box
              className="bg-white p-5 rounded-lg shadow-lg mx-auto relative overflow-y-auto"
              style={{ maxHeight: '100vh' }}
            >
              {loading && <Loader />}
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-8">
                  <Typography variant="h4" component="h2" className="pb-2">
                    Load Storage
                  </Typography>
                  <Tabs
                    value={activeStep}
                    className=""
                    onChange={(e, val) => setActiveStep(val)}
                    variant="standard"
                  >
                    {steps.map((step, index) => (
                      <Tab
                        label={step.label}
                        key={index}
                        sx={{ fontSize: '15px' }}
                        disabled={index > activeStep}
                      />
                    ))}
                  </Tabs>
                </div>
                <IconButton
                  onClick={handleClose}
                  className="absolute top-0 right-2 text-gray hover:text-black"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div>
                {loading ? (
                  <p
                    style={{
                      minHeight: '80vh',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    loading...
                  </p>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)}>
                    {activeStep === 0 && (
                      <>
                        <div
                          style={{
                            maxWidth: '700px',
                            margin: 'auto',
                            minHeight: '76vh',
                          }}
                        >
                          <FormControl
                            component="fieldset"
                            style={{ marginBottom: '16px' }}
                          >
                            <RadioGroup
                              row
                              value={customerType}
                              onChange={handleCustomerTypeChange}
                            >
                              <FormControlLabel
                                value="new"
                                control={<Radio />}
                                label="New customer"
                              />
                              <FormControlLabel
                                value="existing"
                                control={<Radio />}
                                label="Existing customer"
                              />
                            </RadioGroup>
                          </FormControl>
                          {customerType === 'new' && (
                            <CustomerForm
                              register={register}
                              errors={errors}
                              control={control}
                              countries={countries}
                            />
                          )}
                          {customerType === 'existing' && (
                            <FormControl
                              fullWidth
                              variant="standard"
                              className="w-1/2"
                            >
                              <InputLabel>Select Customer</InputLabel>
                              <Controller
                                name="customer" // Name for the form field
                                control={control}
                                defaultValue="" // Set a default value to prevent undefined
                                rules={{ required: 'Customer is required' }} // Validation rule
                                render={({ field }) => (
                                  <Select
                                    {...field}
                                    value={field.value || ''} // Ensure value is never undefined
                                    label="Select Customer"
                                  >
                                    {customer &&
                                      customer.map(
                                        (item: any, index: number) => (
                                          <MenuItem
                                            key={index}
                                            value={item._id}
                                          >
                                            <Box className="flex items-center">
                                              <Avatar className="bg-gray-500 mr-2"></Avatar>
                                              <Box>
                                                <Typography variant="body1">{`${item.firstName} ${item.lastName}`}</Typography>
                                                <Typography
                                                  variant="body2"
                                                  color="textSecondary"
                                                >
                                                  {item.email}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          </MenuItem>
                                        ),
                                      )}
                                  </Select>
                                )}
                              />
                              {errors.customer && (
                                <span className="text-red">
                                  {errors.customer.message}
                                </span>
                              )}{' '}
                              {/* Display error message */}
                            </FormControl>
                          )}
                        </div>
                      </>
                    )}
                    {activeStep === 1 && (
                      <>
                        <div
                          style={{
                            maxWidth: '800px',
                            margin: 'auto',
                            minHeight: '76vh',
                          }}
                        >
                          <div className="mb-6">
                            <p className="font-medium text-lg mb-2">
                              Invoice period
                            </p>
                            <div className="flex space-x-2">
                              {[
                                'Daily',
                                'Weekly',
                                'Monthly',
                                'quarter',
                                'Annual',
                              ].map((period) => (
                                <button
                                  type="button"
                                  key={period}
                                  className={`px-4 w-full py-2 text-lg font-medium border rounded ${
                                    invoicePeriod === period
                                      ? 'bg-blue text-white'
                                      : 'bg-gray'
                                  }`}
                                  onClick={() => setInvoicePeriod(period)}
                                >
                                  {period}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="mb-4">
                              <p className="font-medium text-lg mb-2">
                                Is the price inclusive or exclusive of VAT?
                              </p>
                              <div className="flex space-x-2">
                                {['Including VAT', 'Excluding VAT'].map(
                                  (option) => (
                                    <button
                                      type="button"
                                      key={option}
                                      className={`w-full px-4 py-2 border text-lg font-medium rounded ${
                                        vatOption === option
                                          ? 'bg-blue text-white'
                                          : 'bg-gray'
                                      }`}
                                      onClick={() => setVatOption(option)}
                                    >
                                      {option}
                                    </button>
                                  ),
                                )}
                              </div>
                            </div>
                            <div className="mb-4">
                              <p className="font-medium text-lg mb-2">
                                Storage in advance or after invoicing?
                              </p>
                              <div className="flex space-x-2">
                                {['In advance', 'Afterwards'].map((option) => (
                                  <button
                                    type="button"
                                    key={option}
                                    className={`w-full px-4 py-2 border text-lg font-medium rounded ${
                                      storageOption === option
                                        ? 'bg-blue text-white'
                                        : 'bg-gray'
                                    }`}
                                    onClick={() => setStorageOption(option)}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="mb-4">
                              <p className="font-medium text-lg mb-2">
                                Invoice by volume?
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  className={`w-full px-4 py-2 border text-lg font-medium rounded ${
                                    invoicePerVolume
                                      ? 'bg-blue text-white'
                                      : 'bg-gray'
                                  }`}
                                  onClick={() => setInvoicePerVolume(true)}
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  className={`w-full px-4 py-2 border text-lg font-medium rounded ${
                                    !invoicePerVolume
                                      ? 'bg-blue text-white'
                                      : 'bg-gray'
                                  }`}
                                  onClick={() => setInvoicePerVolume(false)}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                              <label className="block font-medium text-lg mb-2">
                                VAT
                              </label>
                              <select
                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                {...register('vatPercentage', {
                                  required: 'VAT is required',
                                })}
                              >
                                <option value="">Select Vat</option>
                                <option value="0">0%</option>
                                <option value="9">9%</option>
                                <option value="21">21%</option>
                              </select>
                              {errors.vatPercentage && (
                                <p className="text-red-500 text-sm">
                                  {errors.vatPercentage.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block font-medium text-lg mb-2">{`Price per ${invoicePeriod} ${
                                invoicePerVolume ? 'Per volume' : ''
                              }`}</label>
                              <input
                                type="number"
                                min={0}
                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                {...register('price', {
                                  required: 'Price is required',
                                })}
                                placeholder={`Enter price per ${invoicePeriod} ${
                                  invoicePerVolume ? 'Per volume' : ''
                                }`}
                              />
                              {errors.price && (
                                <p className="text-red-500 text-sm">
                                  {errors.price.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block font-medium text-lg mb-2">
                                Sales group
                              </label>
                              <select
                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                {...register('salesGroup')}
                              >
                                <option value="">Select Salesgroup</option>
                                {salesGroupOption &&
                                  salesGroupOption.map((item: any) => (
                                    <option key={item._id} value={item.name}>
                                      {item.name}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium text-lg mb-2">
                                Job
                              </label>
                              <select
                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                {...register('storedForProject')}
                              >
                                <option value="">Select job</option>
                                {jobs &&
                                  jobs.map((item: any) => (
                                    <option key={item.value} value={item.value}>
                                      {item.label}
                                    </option>
                                  ))}
                              </select>
                            </div>
                            <div>
                              <label className="block font-medium text-lg mb-2">
                                Invoice reference
                              </label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                {...register('invoiceReference')}
                                placeholder="Enter invoice reference"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-lg mb-2">
                                Start date
                              </label>
                              <ReactDatePicker
                                control={control}
                                name="invoicingStartDate"
                                rules={{ required: 'Date is required' }}
                                placeholderText="Select Start date"
                              />
                            </div>
                            <div>
                              <label className="block font-medium text-lg mb-2">
                                Last invoiced date
                              </label>
                              <ReactDatePicker
                                control={control}
                                name="lastInvoicedDate"
                                minDate={invoicingStartDate}
                                placeholderText="Select invoiced date"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    {activeStep === 2 && (
                      <>
                        <div style={{ margin: 'auto', minHeight: '76vh' }}>
                          <div className="flex gap-3 my-4">
                            <div className="w-full">
                              <label className="block font-medium text-lg mb-2">
                                Notes
                              </label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                {...register('notes')}
                                placeholder="Notes"
                              />
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <button
                              type="button"
                              onClick={() =>
                                append({
                                  description: '',
                                  itemCode: '',
                                  externalCode: '',
                                  contents: '',
                                  storageLocation: '',
                                  loadedOn: '',
                                  ReleasedOn: '',
                                  loadedByEmployee: '',
                                  ReleasedByEmployee: null,
                                  loadedByCustomer: false,
                                })
                              }
                              className="px-4 py-2 mb-3  bg-blue text-white border border-danger font-medium text-lg rounded hover:bg-blue"
                            >
                              Add Row
                            </button>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                              <thead>
                                <tr>
                                  <th className="p-2 border border-gray">
                                    Description
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Item Code
                                  </th>
                                  <th className="p-2 border border-gray">
                                    External Code
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Contents
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Storage Location
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Loaded on
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Released On
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Loaded by Employee
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Released by Employee
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Loaded By Customer
                                  </th>
                                  <th className="p-2 border border-gray">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {fields.map((field: any, index: any) => (
                                  <tr key={field.id}>
                                    <td className="p-2 border border-gray">
                                      <input
                                        type="text"
                                        {...register(
                                          `rows.${index}.description`,
                                          {
                                            required: 'Description is required',
                                          },
                                        )}
                                        className={`w-full p-2 border ${
                                          errors.rows?.[index]?.description
                                            ? 'border-red-500'
                                            : 'border-gray'
                                        }`}
                                      />
                                      {errors.rows?.[index]?.description && (
                                        <p className="text-red-500 text-sm">
                                          {
                                            errors.rows[index].description
                                              .message
                                          }
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <input
                                        type="text"
                                        {...register(`rows.${index}.itemCode`)}
                                        className="w-full p-2 border border-gray"
                                      />
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <input
                                        type="text"
                                        {...register(
                                          `rows.${index}.externalCode`,
                                        )}
                                        className="w-full p-2 border border-gray"
                                      />
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <input
                                        type="number"
                                        min={0}
                                        {...register(`rows.${index}.contents`)}
                                        className="w-full p-2 border border-gray"
                                      />
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <select
                                        className="w-full p-2 border border-gray"
                                        {...register(
                                          `rows.${index}.storageLocation`,
                                          { required: 'field is required' },
                                        )}
                                      >
                                        {storageData && (
                                          <option
                                            value={
                                              storageData?.storageLocation
                                                ?._id || null
                                            }
                                          >
                                            {storageData?.storageLocation?.name}
                                          </option>
                                        )}
                                      </select>
                                      {errors.rows?.[index]
                                        ?.storageLocation && (
                                        <p className="text-red-500 text-sm">
                                          {
                                            errors.rows[index].storageLocation
                                              .message
                                          }
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <ReactDatePicker
                                        control={control}
                                        name={`rows.${index}.loadedOn`}
                                        rules={{ required: 'Date is required' }}
                                        placeholderText=""
                                      />
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <ReactDatePicker
                                        control={control}
                                        name={`rows.${index}.ReleasedOn`}
                                        placeholderText=""
                                      />
                                    </td>

                                    <td className="p-2 border border-gray">
                                      <select
                                        className="w-full p-2 border border-gray"
                                        {...register(
                                          `rows.${index}.loadedByEmployee`,
                                          { required: 'field is required' },
                                        )}
                                      >
                                        {data &&
                                          data.map((item: any) => (
                                            <option
                                              key={item.value}
                                              value={item.value}
                                            >
                                              {item.label}
                                            </option>
                                          ))}
                                      </select>
                                      {errors.rows?.[index]
                                        ?.loadedByEmployee && (
                                        <p className="text-red-500 text-sm">
                                          {
                                            errors.rows[index].loadedByEmployee
                                              .message
                                          }
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-2 border border-gray">
                                      <select
                                        className="w-full p-2 border border-gray"
                                        {...register(
                                          `rows.${index}.ReleasedByEmployee`,
                                        )}
                                      >
                                        {data &&
                                          data.map((item: any) => (
                                            <option
                                              key={item.value}
                                              value={item.value}
                                            >
                                              {item.label}
                                            </option>
                                          ))}
                                      </select>
                                    </td>
                                    <td className="p-2 border border-gray text-center">
                                      <input
                                        type="checkbox"
                                        {...register(
                                          `rows.${index}.loadedByCustomer`,
                                        )}
                                        className="h-5 w-5"
                                      />
                                    </td>
                                    <td className="p-2 border border-gray text-center">
                                      <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex w-full mt-6 gap-5">
                            <div className="w-full">
                              <p className="font-bold text-xl mb-2">
                                The cost of handling -
                              </p>
                              <div className="mb-4">
                                <p className="font-medium text-lg mb-2">
                                  Do you want to invoice the handling costs ?
                                </p>
                                <div className="flex space-x-2">
                                  {['Yes', 'No'].map((option) => (
                                    <button
                                      type="button"
                                      key={option}
                                      className={`w-full px-4 py-2 border text-lg font-medium rounded ${
                                        handlingCost === option
                                          ? 'bg-blue text-white'
                                          : 'bg-gray'
                                      }`}
                                      onClick={() => setHandlingCost(option)}
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {handlingCost === 'Yes' && (
                                <>
                                  <div className="w-full mb-4">
                                    <label className="block font-medium text-lg mb-2">
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                      {...register('action.description')}
                                      placeholder="Description"
                                    />
                                  </div>
                                  <div className="flex gap-3 my-4">
                                    <div className="w-full">
                                      <label className="block font-medium text-lg mb-2">
                                        Amount
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                        {...register('action.price')}
                                        placeholder="Enter price"
                                      />
                                    </div>
                                    <div className="w-full">
                                      <label className="block font-medium text-lg mb-2">
                                        Quantity
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                        {...register('action.quantity')}
                                        placeholder="Quantity"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block font-medium text-lg mb-2">
                                      Action Date
                                    </label>
                                    <ReactDatePicker
                                      control={control}
                                      name="action.actionDate"
                                      rules={{ required: 'Date is required' }}
                                      placeholderText="Select date"
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                            <div className="w-full flex gap-5">
                              {invoicePerVolume && (
                                <>
                                  <p className="font-bold text-xl mb-2">
                                    Volume based billing -
                                  </p>
                                  <p className="font-bold text-lg mb-2">
                                    Allowed
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <Box className="flex justify-between mt-6 mb-5">
                      <Button
                        variant="outlined"
                        disabled={activeStep === 0}
                        onClick={handleBack}
                        size="large"
                      >
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={storageData.cubicMeter < totalVolume}
                        size="large"
                        onClick={
                          activeStep === steps.length - 1
                            ? handleSubmit(onSubmit)
                            : handleNext
                        }
                      >
                        {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                      </Button>
                    </Box>
                  </form>
                )}
              </div>
            </Box>
          </Modal>
        </LocalizationProvider>
      </div>
    </>
  );
};

export default LoadingForm;
