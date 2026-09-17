import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useForm } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import Loader from '../../common/Loader';

const NewJob = ({ handler }) => {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form State
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      customerType: 'existing',
      customer: '',
      client: {
        typeOfCustomer: 'Particular',
        salutation: 'Mr',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
      load: {
        street: '',
        houseNumber: '',
        addition: '',
        city: '',
        postcode: '',
        country: 'Netherlands',
        typeOfProperty: 'House',
        floor: '0',
        hasElevator: false,
      },
      unload: {
        street: '',
        houseNumber: '',
        addition: '',
        city: '',
        postcode: '',
        country: 'Netherlands',
        typeOfProperty: 'House',
        floor: '0',
        hasElevator: false,
      },
      knownAddress: true,
      priceAgreement: 'onhourly_basis',
      package: '',
    },
  });

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerList, setCustomerList] = useState([]);
  const [countries, setCountries] = useState(['Netherlands', 'Germany', 'Belgium', 'France', 'India', 'United Kingdom', 'United States']);
  const [packageList, setPackageList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  const customerType = watch('customerType');
  const selectedCustomerId = watch('customer');
  const selectedPackageId = watch('package');
  const selectedPriceAgreement = watch('priceAgreement');
  const isKnownAddress = watch('knownAddress');

  const propertyTypes = [
    'Apartment',
    'House',
    'Villa',
    'Studio',
    'Office',
    'Warehouse',
    'Commercial Space',
    'Penthouses',
    'Other',
  ];

  const steps = [
    { id: 0, title: 'Customer', icon: PersonIcon, desc: 'Client information' },
    { id: 1, title: 'Locations', icon: LocationOnIcon, desc: 'Pickup & dropoff' },
    { id: 2, title: 'Services', icon: MiscellaneousServicesIcon, desc: 'Select services' },
    { id: 3, title: 'Package & Rates', icon: Inventory2Icon, desc: 'Pricing & package' },
  ];

  const handleOpen = () => {
    setOpen(true);
    setActiveStep(0);
    fetchInitialData();
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setCustomerSearch('');
    setSelectedServices([]);
  };

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Customers
      const custRes = await axios.get(`${apiPath}/customer/customerList`);
      if (custRes.data?.customers) {
        setCustomerList(custRes.data.customers);
      }

      // 2. Fetch Countries
      try {
        const countryRes = await axios.get(`${apiPath}/api/sale_group?type=country`);
        if (Array.isArray(countryRes.data) && countryRes.data.length > 0) {
          const names = countryRes.data.map((c) => c.name).filter(Boolean);
          if (names.length > 0) setCountries(names);
        }
      } catch (e) {
        // Fallback default countries
      }

      // 3. Fetch Packages
      fetchPackages(selectedPriceAgreement);

      // 4. Fetch Services
      try {
        const srvRes = await axios.get(`${apiPath}/api/services`);
        if (Array.isArray(srvRes.data)) {
          setServicesList(srvRes.data);
        }
      } catch (e) {
        console.error('Error fetching services:', e);
      }
    } catch (err) {
      console.error('Error loading initial job form data:', err);
    }
  };

  const fetchPackages = async (priceAgree) => {
    try {
      const url = priceAgree
        ? `${apiPath}/api/packages?priceAgree=${priceAgree}`
        : `${apiPath}/api/packages`;
      const res = await axios.get(url);
      if (Array.isArray(res.data)) {
        setPackageList(res.data);
        if (res.data.length > 0 && !selectedPackageId) {
          setValue('package', res.data[0]._id);
        }
      }
    } catch (e) {
      console.error('Error fetching packages:', e);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPackages(selectedPriceAgreement);
    }
  }, [selectedPriceAgreement]);

  // Filter customers based on search
  const filteredCustomers = customerList.filter((c) => {
    const q = customerSearch.toLowerCase();
    const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return fullName.includes(q) || email.includes(q) || phone.includes(q);
  });

  const selectedCustomerObj = customerList.find((c) => c._id === selectedCustomerId);

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Validate current step before advancing
  const handleNextStep = () => {
    if (activeStep === 0) {
      if (customerType === 'existing') {
        if (!selectedCustomerId) {
          toast.error('Please select an existing customer');
          return;
        }
      } else {
        const client = watch('client');
        if (!client?.firstName?.trim()) {
          toast.error('First Name is required');
          return;
        }
        if (!client?.lastName?.trim()) {
          toast.error('Last Name is required');
          return;
        }
        if (!client?.email?.trim()) {
          toast.error('Email is required');
          return;
        }
      }
    } else if (activeStep === 1) {
      const load = watch('load');
      if (!load?.city?.trim()) {
        toast.error('Pickup City is required');
        return;
      }
      if (!load?.street?.trim()) {
        toast.error('Pickup Street is required');
        return;
      }
      if (isKnownAddress) {
        const unload = watch('unload');
        if (!unload?.city?.trim()) {
          toast.error('Dropoff City is required (or uncheck "Destination address known")');
          return;
        }
      }
    } else if (activeStep === 3) {
      if (!selectedPackageId) {
        toast.error('Please select a moving package');
        return;
      }
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
    } else {
      handleSubmit(onSubmitJob)();
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const onSubmitJob = async (formData) => {
    setLoading(true);
    try {
      let finalCustomerId = formData.customer;

      // 1. If new customer, create customer first
      if (formData.customerType === 'new') {
        const newCustomerPayload = {
          ...formData.client,
          address: [
            {
              street: formData.load.street,
              houseNumber: formData.load.houseNumber,
              addition: formData.load.addition,
              city: formData.load.city,
              postcode: formData.load.postcode,
              country: formData.load.country,
              typeOfProperty: formData.load.typeOfProperty,
              floor: formData.load.floor,
              addressType: 'head',
            },
          ],
        };

        const customerRes = await axios.post(`${apiPath}/customer/customeradd`, newCustomerPayload);
        finalCustomerId = customerRes.data?.customerID || customerRes.data?._id;
        if (!finalCustomerId) {
          throw new Error('Failed to retrieve newly created customer ID');
        }
      }

      // 2. Prepare Job Payload
      const jobPayload = {
        date: new Date().toISOString().split('T')[0],
        customer: finalCustomerId,
        package: formData.package,
        priceAgree: formData.priceAgreement,
        services: selectedServices,
        hasElevator: Boolean(formData.load?.hasElevator),
        unloadElevator: Boolean(formData.unload?.hasElevator),
        load: formData.load,
        unload: formData.knownAddress ? formData.unload : {},
        knownAddress: Boolean(formData.knownAddress),
      };

      const jobResponse = await axios.post(`${apiPath}/api/jobSchedule`, jobPayload);
      const newJob = jobResponse.data;

      toast.success(`Job ${newJob?.index ? '#' + newJob.index : ''} created successfully!`);
      handleClose();
      if (typeof handler === 'function') {
        handler();
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          error?.message ||
          'Failed to create job schedule'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div>
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
        >
          <AddIcon fontSize="small" />
          <span>New Job</span>
        </button>
      </div>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className: 'rounded-2xl dark:bg-boxdark border border-slate-200/80 dark:border-strokedark shadow-2xl overflow-hidden',
        }}
      >
        {/* Standard Modal Header (Matching Website Popups) */}
        <DialogTitle
          sx={{
            padding: '24px 32px !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: 0,
          }}
          className="bg-slate-50 dark:bg-boxdark border-b border-slate-200/80 dark:border-strokedark"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-primary flex items-center justify-center font-bold">
              <LocalShippingIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Create New Job
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Setup customer, transport routes, and moving package
              </p>
            </div>
          </div>
          <IconButton onClick={handleClose} size="small" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Stepper Navigation */}
        <div className="bg-slate-50/50 dark:bg-meta-4/20 px-8 py-3.5 border-b border-slate-200/80 dark:border-strokedark flex items-center justify-center gap-3 sm:gap-6 overflow-x-auto">
          {steps.map((step, idx) => {
            const isActive = activeStep === idx;
            const isDone = activeStep > idx;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => idx <= activeStep && setActiveStep(idx)}
                className={`flex items-center gap-2.5 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : isDone
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-primary cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-70'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-primary'
                      : isDone
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <DialogContent
          sx={{
            padding: '28px 32px !important',
          }}
          className="space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto"
        >
          {/* STEP 0: CUSTOMER SELECTION */}
          {activeStep === 0 && (
            <div className="space-y-5">
              {/* Switcher: Existing vs New */}
              <div className="flex bg-slate-100 dark:bg-meta-4/30 p-1 rounded-xl w-full max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => setValue('customerType', 'existing')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    customerType === 'existing'
                      ? 'bg-white dark:bg-boxdark text-primary shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Existing Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('customerType', 'new');
                    setValue('customer', '');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    customerType === 'new'
                      ? 'bg-white dark:bg-boxdark text-primary shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  + New Customer
                </button>
              </div>

              {customerType === 'existing' ? (
                <div className="space-y-4 max-w-xl mx-auto">
                  {/* Search Input */}
                  <div className="relative">
                    <SearchIcon className="absolute left-3.5 top-3 text-slate-400 text-sm" />
                    <input
                      type="text"
                      placeholder="Search customer by name, email or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-strokedark bg-slate-50 dark:bg-meta-4/20 text-xs outline-none focus:border-primary focus:bg-white transition"
                    />
                  </div>

                  {/* Customer Selection List */}
                  <div className="border border-slate-200 dark:border-strokedark rounded-xl max-h-[260px] overflow-y-auto divide-y divide-slate-100 dark:divide-strokedark bg-white dark:bg-boxdark">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No matching customers found.
                      </div>
                    ) : (
                      filteredCustomers.map((cust) => {
                        const isSelected = selectedCustomerId === cust._id;
                        const name = `${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Unnamed';

                        return (
                          <div
                            key={cust._id}
                            onClick={() => setValue('customer', cust._id)}
                            className={`p-3.5 flex items-center justify-between cursor-pointer transition ${
                              isSelected
                                ? 'bg-blue-50/80 dark:bg-blue-900/20 border-l-4 border-primary'
                                : 'hover:bg-slate-50 dark:hover:bg-meta-4/20'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="bg-primary/20 text-primary font-bold text-xs w-9 h-9">
                                {name.charAt(0).toUpperCase()}
                              </Avatar>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                                  {name}
                                </h4>
                                <p className="text-[11px] text-slate-500">
                                  {cust.email} {cust.phone ? `• ${cust.phone}` : ''}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <CheckCircleIcon className="text-primary text-xl" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {selectedCustomerObj && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                      <span>
                        Selected: <strong>{selectedCustomerObj.firstName} {selectedCustomerObj.lastName}</strong> ({selectedCustomerObj.email})
                      </span>
                      <span className="bg-blue-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                        READY
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto bg-slate-50 dark:bg-meta-4/10 p-5 rounded-2xl border border-slate-200 dark:border-strokedark">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Customer Type
                    </label>
                    <select
                      {...register('client.typeOfCustomer')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    >
                      <option value="Particular">Individual / Residential</option>
                      <option value="Commerical">Commercial / Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Salutation
                    </label>
                    <select
                      {...register('client.salutation')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    >
                      <option value="Mr">Mr.</option>
                      <option value="Mrs">Mrs.</option>
                      <option value="Ms">Ms.</option>
                      <option value="Madam">Madam</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      {...register('client.firstName', { required: 'First name is required' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Doe"
                      {...register('client.lastName', { required: 'Last name is required' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john.doe@example.com"
                      {...register('client.email', { required: 'Email is required' })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+31 6 12345678"
                      {...register('client.phone')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: LOCATIONS (LOAD & UNLOAD) */}
          {activeStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pickup / Origin Address */}
              <div className="bg-slate-50 dark:bg-meta-4/10 p-5 rounded-2xl border border-slate-200 dark:border-strokedark space-y-3">
                <div className="flex items-center gap-2 text-primary font-bold text-xs border-b border-slate-200 dark:border-strokedark pb-2.5">
                  <LocationOnIcon fontSize="small" />
                  <span>1. Pickup (Origin / Load)</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Street <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Damrak"
                      {...register('load.street', { required: true })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      House No
                    </label>
                    <input
                      type="text"
                      placeholder="12"
                      {...register('load.houseNumber')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Addition
                    </label>
                    <input
                      type="text"
                      placeholder="A"
                      {...register('load.addition')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      placeholder="1012 JS"
                      {...register('load.postcode')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Amsterdam"
                      {...register('load.city', { required: true })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Country
                    </label>
                    <select
                      {...register('load.country')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    >
                      {countries.map((c, i) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Property Type
                    </label>
                    <select
                      {...register('load.typeOfProperty')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    >
                      {propertyTypes.map((pt, i) => (
                        <option key={i} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                      Floor:
                    </label>
                    <input
                      type="text"
                      placeholder="0"
                      {...register('load.floor')}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      {...register('load.hasElevator')}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <span>Elevator Available</span>
                  </label>
                </div>
              </div>

              {/* Dropoff / Destination Address */}
              <div className="bg-slate-50 dark:bg-meta-4/10 p-5 rounded-2xl border border-slate-200 dark:border-strokedark space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-strokedark pb-2.5">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <LocationOnIcon fontSize="small" />
                    <span>2. Dropoff (Destination / Unload)</span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isKnownAddress}
                      onChange={(e) => setValue('knownAddress', e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span>Address Known</span>
                  </label>
                </div>

                {isKnownAddress ? (
                  <>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Street <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Coolsingel"
                          {...register('unload.street')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          House No
                        </label>
                        <input
                          type="text"
                          placeholder="45"
                          {...register('unload.houseNumber')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Addition
                        </label>
                        <input
                          type="text"
                          placeholder="B"
                          {...register('unload.addition')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="3012 AA"
                          {...register('unload.postcode')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Rotterdam"
                          {...register('unload.city')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Country
                        </label>
                        <select
                          {...register('unload.country')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        >
                          {countries.map((c, i) => (
                            <option key={i} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                          Property Type
                        </label>
                        <select
                          {...register('unload.typeOfProperty')}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        >
                          {propertyTypes.map((pt, i) => (
                            <option key={i} value={pt}>
                              {pt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5">
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                          Floor:
                        </label>
                        <input
                          type="text"
                          placeholder="1"
                          {...register('unload.floor')}
                          className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-strokedark bg-white dark:bg-boxdark text-xs outline-none focus:border-primary"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          {...register('unload.hasElevator')}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span>Elevator Available</span>
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center bg-white dark:bg-boxdark rounded-xl border border-dashed border-slate-300 dark:border-strokedark">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Destination address is not yet known
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      You can update the dropoff location anytime later from the Job details page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: SERVICES SELECTION */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/80 dark:border-strokedark">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MiscellaneousServicesIcon className="text-primary" fontSize="small" />
                    <span>Select Required Services</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Choose which moving and special services apply to this job
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedServices(servicesList.map((s) => s._id))}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-meta-4/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedServices([])}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-meta-4/30 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {servicesList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                  Loading services...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {servicesList.map((service) => {
                    const isSelected = selectedServices.includes(service._id);
                    return (
                      <div
                        key={service._id}
                        onClick={() => toggleService(service._id)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-primary bg-blue-50/60 dark:bg-blue-900/20 shadow-xs ring-1 ring-primary/20'
                            : 'border-slate-200 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-meta-4/10'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? 'bg-white dark:bg-boxdark border-primary/30 text-primary'
                              : 'bg-slate-100 dark:bg-meta-4/40 border-slate-200 dark:border-strokedark text-slate-500'
                          }`}>
                            {service.icon ? (
                              <div
                                className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5 [&>svg]:fill-current"
                                dangerouslySetInnerHTML={{ __html: service.icon }}
                              />
                            ) : (
                              <MiscellaneousServicesIcon fontSize="small" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {service.serviceName || service.serviceTypeName}
                            </h5>
                            <span className="inline-block text-[10px] uppercase font-semibold text-slate-400">
                              {service.serviceTypeName}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm'
                              : 'border border-slate-300 dark:border-strokedark text-transparent'
                          }`}>
                            ✓
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  {selectedServices.length === 0
                    ? 'No services selected (optional)'
                    : `✓ ${selectedServices.length} ${selectedServices.length === 1 ? 'service' : 'services'} selected`}
                </span>
                <span className="text-[11px] text-slate-400">
                  You can also configure more details later in Valuation
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: PACKAGE & PRICE AGREEMENT */}
          {activeStep === 3 && (
            <div className="space-y-5 max-w-2xl mx-auto">
              {/* Price Agreement Switch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Pricing Agreement
                </label>
                <div className="grid grid-cols-2 gap-3.5">
                  <div
                    onClick={() => setValue('priceAgreement', 'onhourly_basis')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      selectedPriceAgreement === 'onhourly_basis'
                        ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20 text-primary'
                        : 'border-slate-200 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-meta-4/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1.5">
                        <AccessTimeIcon style={{ fontSize: 16 }} className="text-primary" />
                        <span>Hourly Basis</span>
                      </h4>
                      <p className="text-[11px] opacity-75 mt-0.5">Calculated per hour per mover</p>
                    </div>
                    {selectedPriceAgreement === 'onhourly_basis' && (
                      <CheckCircleIcon className="text-primary text-xl" />
                    )}
                  </div>

                  <div
                    onClick={() => setValue('priceAgreement', 'fixed_price')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      selectedPriceAgreement === 'fixed_price'
                        ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20 text-primary'
                        : 'border-slate-200 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-meta-4/20 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold flex items-center gap-1.5">
                        <LocalOfferIcon style={{ fontSize: 16 }} className="text-primary" />
                        <span>Fixed Price</span>
                      </h4>
                      <p className="text-[11px] opacity-75 mt-0.5">Agreed total flat rate quote</p>
                    </div>
                    {selectedPriceAgreement === 'fixed_price' && (
                      <CheckCircleIcon className="text-primary text-xl" />
                    )}
                  </div>
                </div>
              </div>

              {/* Packages Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
                  Select Moving Package
                </label>

                {packageList.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-dashed rounded-xl">
                    No packages found for this agreement.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto">
                    {packageList.map((pkg) => {
                      const isSelected = selectedPackageId === pkg._id;

                      return (
                        <div
                          key={pkg._id}
                          onClick={() => setValue('package', pkg._id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-primary bg-blue-50/50 dark:bg-blue-900/20 shadow-sm'
                              : 'border-slate-200 dark:border-strokedark hover:bg-slate-50 dark:hover:bg-meta-4/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {pkg.name}
                              </h4>
                              <span className="inline-block mt-1 text-[10px] font-semibold bg-slate-100 dark:bg-meta-4 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                                {pkg.type_job || 'Relocation'}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircleIcon className="text-primary text-xl" />
                            )}
                          </div>

                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5">
                            VAT: {pkg.vat || 'Exclusive'} • Rules: {pkg.ignoreRules ? 'Manual' : 'Standard'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>

        {/* Standard Modal Footer / Action Buttons */}
        <DialogActions
          sx={{
            padding: '20px 32px !important',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '0 !important',
          }}
          className="bg-slate-50 dark:bg-boxdark border-t border-slate-200/80 dark:border-strokedark"
        >
          <button
            type="button"
            onClick={activeStep === 0 ? handleClose : handlePrevStep}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            {activeStep === 0 ? 'Cancel' : <><ArrowBackIcon fontSize="small" /> Back</>}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleNextStep}
            className="px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
          >
            {activeStep === steps.length - 1 ? (
              loading ? 'Creating Job...' : 'Create Job'
            ) : (
              <>Next <ArrowForwardIcon fontSize="small" /></>
            )}
          </button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NewJob;
