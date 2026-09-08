import React, { useContext, useState } from 'react';
import { Modal } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../common/Loader';
import { EmailContext } from '../EmailProvider/EmailContext';
import DocumentSelected from '../pages/customerDetails/DocumentSelected';
import {
  FiPlus,
  FiUserPlus,
  FiX,
  FiUser,
  FiMapPin,
  FiFileText,
  FiCheckCircle,
  FiAward,
  FiLock,
} from 'react-icons/fi';
import ModulePermissionsSelector, { ALL_MODULE_IDS } from './ModulePermissionsSelector';
import { useCurrency } from '../utils/currencyUtil';

const MultiStepPopup = ({ skills, licenses, handler, countries }) => {
  const { symbol: currencySymbol } = useCurrency();
  const {
    control,
    handleSubmit,
    register,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      selectedLicenses: [],
      skills: [],
      role: 'Staff',
      access: ['Dashboard'],
    },
  });
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { settings } = useContext(EmailContext);

  const notify = (message) => toast.success(message);
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const handleNext = () => {
    handleSubmit(() => {
      setActiveStep((prev) => prev + 1);
    })();
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleClose = () => setOpen(false);

  const steps = [
    { label: 'Colleague', icon: <FiUser /> },
    { label: 'Address', icon: <FiMapPin /> },
    { label: 'Contract', icon: <FiFileText /> },
    { label: 'Documents', icon: <FiCheckCircle /> },
    { label: 'Skills & Access', icon: <FiAward /> },
  ];

  const onSubmit = (data) => {
    postUserData(data);
  };

  const postUserData = async (data) => {
    if (!data.firstName || data.firstName.trim() === '') {
      notifyError('First Name is required');
      return;
    }
    if (!data.surname || data.surname.trim() === '') {
      notifyError('Surname is required');
      return;
    }
    if (data.firstName.trim().length < 3 || data.firstName.trim().length > 20) {
      notifyError('First Name must be between 3 and 20 characters');
      return;
    }
    if (data.surname.trim().length < 3 || data.surname.trim().length > 20) {
      notifyError('Surname must be between 3 and 20 characters');
      return;
    }
    if (!data.email || data.email.trim() === '') {
      notifyError('Email is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      notifyError('Enter a valid email address');
      return;
    }
    if (!data.telephone || data.telephone.trim() === '') {
      notifyError('Telephone is required');
      return;
    }
    if (!/^[0-9]{10,15}$/.test(data.telephone.trim())) {
      notifyError('Enter a valid phone number (10-15 digits)');
      return;
    }
    if (!data.postcode || data.postcode.trim() === '') {
      notifyError('Postcode is required');
      return;
    }
    if (!data.houseNumber || data.houseNumber.trim() === '') {
      notifyError('House Number is required');
      return;
    }
    if (!data.street || data.street.trim() === '') {
      notifyError('Street is required');
      return;
    }
    if (!data.city || data.city.trim() === '') {
      notifyError('City is required');
      return;
    }
    if (!data.country || data.country.trim() === '') {
      notifyError('Country is required');
      return;
    }
    if (!data.password || data.password.trim() === '') {
      notifyError('Password is required');
      return;
    }
    if (data.password.trim().length < 6 || data.password.trim().length > 20) {
      notifyError('Password must be between 6 and 20 characters');
      return;
    }

    setLoading(true);
    const transformedData = {
      username: `${data.firstName} ${data.surname}`,
      email: data.email,
      gender: data.gender,
      language: data.language,
      dob: data.dob,
      telephone: data.telephone,
      postCode: data.postcode,
      houseNumber: data.houseNumber,
      addition: data.addition,
      street: data.street,
      city: data.city,
      country: data.country,
      inservice: data.inservice,
      outofservice: data.outservice,
      trailPeriod: new Date(data.trailPeriod).getTime(),
      contract: {
        startDate: data.contract_startDate,
        endDate: data.contract_endDate,
        type: data.contract_type,
        hourlyWage: Number(data.contract_hourlyWage),
        hoursWeek: Number(data.contract_hoursPerWeek),
        daysWeek: data.contract_DaysPerWeek,
      },
      drivingLicense: data.selectedLicenses || [],
      skills: data.skills || [],
      password: data.password,
      role: data.role || 'Staff',
      access:
        data.role === 'Admin'
          ? ALL_MODULE_IDS
          : data.access && data.access.length > 0
          ? data.access
          : ['Dashboard'],
      documentNumber: data.documentNumber,
    };

    try {
      await axios.post(`${apiPath}/user/register`, transformedData);
      reset();
      await sendMail(transformedData);
      handleClose();
      handler();
      notify('Employee created successfully!');
    } catch (error) {
      notifyError(
        error?.response?.data?.msg === 'User already exists'
          ? 'User Email already exists'
          : error?.response?.data?.msg || 'Error registering employee'
      );
    } finally {
      setLoading(false);
    }
  };

  const sendMail = async (detail) => {
    try {
      await axios.post(`${apiPath}/email/send_email`, {
        emailTemplateId: settings?.emailTemplates?.confirmation,
        extraData: detail,
        subject: `hey ${detail.username} It is a confirmation mail regarding to your work with Techbeeps`,
      });
    } catch (error) {
      console.error(`Error in sending mail: ${error.message}`);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
        >
          <FiPlus className="text-base" />
          <span>New Employee</span>
        </button>

        <Modal open={open} onClose={handleClose}>
          <div className="fixed inset-0 z-999 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white dark:bg-boxdark rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 border border-slate-100 dark:border-strokedark z-10 max-h-[92vh] flex flex-col overflow-hidden font-sans">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg font-bold">
                    <FiUserPlus />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      New Employee Registration
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Step {activeStep + 1} of {steps.length}: {steps[activeStep].label}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Modern Step Pill Progress Bar */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
                {steps.map((step, index) => {
                  const isCompleted = index < activeStep;
                  const isCurrent = index === activeStep;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (index <= activeStep) setActiveStep(index);
                        else handleNext();
                      }}
                      className={`flex-1 min-w-[95px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                          : isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-white/50'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-primary text-white'
                            : isCompleted
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isCompleted ? '✓' : index + 1}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scrollable Form Body */}
              <div className="overflow-y-auto flex-1 pr-1.5">
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Step 0: Colleague */}
                  {activeStep === 0 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Gender <span className="text-rose-500">*</span>
                        </label>
                        <select
                          {...register('gender', { required: 'Gender is required' })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>
                            Select Gender
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="text-rose-500 text-xs mt-1">{errors.gender.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            First Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Asif"
                            {...register('firstName', { required: 'First Name is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.firstName && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.firstName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Surname <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Ansar"
                            {...register('surname', { required: 'Surname is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.surname && (
                            <p className="text-rose-500 text-xs mt-1">{errors.surname.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Language <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. English, Dutch"
                            {...register('language', { required: 'Language is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.language && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.language.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Date of Birth <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            {...register('dob', { required: 'Date of Birth is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                          />
                          {errors.dob && (
                            <p className="text-rose-500 text-xs mt-1">{errors.dob.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Email Address <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. employee@company.com"
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address',
                              },
                            })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.email && (
                            <p className="text-rose-500 text-xs mt-1">{errors.email.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Telephone Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            placeholder="e.g. 31612345678"
                            {...register('telephone', {
                              required: 'Telephone is required',
                              pattern: {
                                value: /^[0-9]{10,15}$/,
                                message: 'Enter a valid phone number (10-15 digits)',
                              },
                            })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.telephone && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.telephone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Address */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Street <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Kalverstraat"
                            {...register('street', { required: 'Street is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.street && (
                            <p className="text-rose-500 text-xs mt-1">{errors.street.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            House Number <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 42"
                            {...register('houseNumber', { required: 'House number is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.houseNumber && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.houseNumber.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Addition (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. A, Bis"
                            {...register('addition')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Postcode <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. 1012 NX"
                            {...register('postcode', { required: 'Postcode is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.postcode && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.postcode.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            City <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Amsterdam"
                            {...register('city', { required: 'City is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.city && (
                            <p className="text-rose-500 text-xs mt-1">{errors.city.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Country <span className="text-rose-500">*</span>
                          </label>
                          <select
                            {...register('country', { required: 'Country is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                          >
                            <option value="" disabled>
                              Select Country
                            </option>
                            {countries &&
                              countries.map((country, index) => (
                                <option key={index} value={country.name}>
                                  {country.name}
                                </option>
                              ))}
                          </select>
                          {errors.country && (
                            <p className="text-rose-500 text-xs mt-1">{errors.country.message}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Contract */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            In Service Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            {...register('inservice', { required: 'In service date is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                          />
                          {errors.inservice && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.inservice.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Out of Service Date
                          </label>
                          <input
                            type="date"
                            {...register('outservice')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Trial Period Date <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="date"
                            {...register('trailPeriod', { required: 'Trial period is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                          />
                          {errors.trailPeriod && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.trailPeriod.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                          Contract Agreement Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Contract Type <span className="text-rose-500">*</span>
                            </label>
                            <select
                              {...register('contract_type', {
                                required: 'Contract type is required',
                              })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                            >
                              <option value="" disabled>
                                Select Type
                              </option>
                              <option value="Fixed hours">Fixed hours</option>
                              <option value="Variable hours">Variable hours</option>
                              <option value="Hiring">Hiring</option>
                              <option value="Payroll">Payroll</option>
                            </select>
                            {errors.contract_type && (
                              <p className="text-rose-500 text-xs mt-1">
                                {errors.contract_type.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Start Date <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="date"
                              {...register('contract_startDate', {
                                required: 'Start Date is required',
                              })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                            />
                            {errors.contract_startDate && (
                              <p className="text-rose-500 text-xs mt-1">
                                {errors.contract_startDate.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              End Date (Optional)
                            </label>
                            <input
                              type="date"
                              {...register('contract_endDate')}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Hourly Wage ({currencySymbol}) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="e.g. 18.50"
                              {...register('contract_hourlyWage', {
                                required: 'Hourly wage is required',
                              })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                            />
                            {errors.contract_hourlyWage && (
                              <p className="text-rose-500 text-xs mt-1">
                                {errors.contract_hourlyWage.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Hours per week <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 40"
                              {...register('contract_hoursPerWeek', {
                                required: 'Hours per week is required',
                              })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                            />
                            {errors.contract_hoursPerWeek && (
                              <p className="text-rose-500 text-xs mt-1">
                                {errors.contract_hoursPerWeek.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                              Days per week <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 5"
                              {...register('contract_DaysPerWeek', {
                                required: 'Days per week is required',
                              })}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                            />
                            {errors.contract_DaysPerWeek && (
                              <p className="text-rose-500 text-xs mt-1">
                                {errors.contract_DaysPerWeek.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Documents & Licenses */}
                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                          Select Driving Licenses <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                          name="selectedLicenses"
                          control={control}
                          rules={{
                            required: 'At least one license must be selected',
                            validate: (value) =>
                              (value && value.length > 0) || 'Select at least one license',
                          }}
                          defaultValue={[]}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                {licenses &&
                                  licenses.map((license, index) => {
                                    const isChecked = field.value?.includes(license.name);
                                    return (
                                      <button
                                        type="button"
                                        key={index}
                                        onClick={() => {
                                          const value = license.name;
                                          if (isChecked) {
                                            field.onChange(
                                              field.value.filter((item) => item !== value)
                                            );
                                          } else {
                                            field.onChange([...(field.value || []), value]);
                                          }
                                        }}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                                          isChecked
                                            ? 'bg-primary text-white border-primary shadow-xs'
                                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                        }`}
                                      >
                                        <span
                                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                                            isChecked
                                              ? 'bg-white text-primary font-bold'
                                              : 'border border-slate-300 dark:border-slate-600'
                                          }`}
                                        >
                                          {isChecked ? '✓' : ''}
                                        </span>
                                        <span>{license.name}</span>
                                      </button>
                                    );
                                  })}
                              </div>
                              {errors.selectedLicenses && (
                                <p className="text-rose-500 text-xs mt-1">
                                  {errors.selectedLicenses.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                          Document Number (ID / Passport) <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. DOC-98765432"
                          {...register('documentNumber', {
                            required: 'Document Number is required',
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                        />
                        {errors.documentNumber && (
                          <p className="text-rose-500 text-xs mt-1">
                            {errors.documentNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="pt-2">
                        <DocumentSelected email={watch('email')} isEmployee={true} />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Skills & Access */}
                  {activeStep === 4 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                          Select Skills & Certifications <span className="text-rose-500">*</span>
                        </label>
                        <Controller
                          name="skills"
                          control={control}
                          rules={{
                            required: 'At least one skill must be selected',
                            validate: (value) =>
                              (value && value.length > 0) || 'Select at least one skill',
                          }}
                          defaultValue={[]}
                          render={({ field }) => (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2.5 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700">
                                {skills &&
                                  skills.map((skill, index) => {
                                    const isChecked = field.value?.includes(skill.name);
                                    return (
                                      <button
                                        type="button"
                                        key={index}
                                        onClick={() => {
                                          const value = skill.name;
                                          if (isChecked) {
                                            field.onChange(
                                              field.value.filter((item) => item !== value)
                                            );
                                          } else {
                                            field.onChange([...(field.value || []), value]);
                                          }
                                        }}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                                          isChecked
                                            ? 'bg-primary text-white border-primary shadow-xs'
                                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                                        }`}
                                      >
                                        <span
                                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                                            isChecked
                                              ? 'bg-white text-primary font-bold'
                                              : 'border border-slate-300 dark:border-slate-600'
                                          }`}
                                        >
                                          {isChecked ? '✓' : ''}
                                        </span>
                                        <span>{skill.name}</span>
                                      </button>
                                    );
                                  })}
                              </div>
                              {errors.skills && (
                                <p className="text-rose-500 text-xs mt-1">
                                  {errors.skills.message}
                                </p>
                              )}
                            </div>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            User Role <span className="text-rose-500">*</span>
                          </label>
                          <select
                            {...register('role', { required: 'Role is required' })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                          >
                            <option value="" disabled>
                              Select Role
                            </option>
                            <option value="Staff">Staff</option>
                            <option value="Agent">Agent</option>
                            <option value="Admin">Admin</option>
                          </select>
                          {errors.role && (
                            <p className="text-rose-500 text-xs mt-1">{errors.role.message}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                            Password <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            {...register('password', {
                              required: 'Password is required',
                              minLength: { value: 6, message: 'Minimum 6 characters' },
                            })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                          />
                          {errors.password && (
                            <p className="text-rose-500 text-xs mt-1">
                              {errors.password.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Module Access Rights & Permissions */}
                      <div className="pt-2">
                        <Controller
                          name="access"
                          control={control}
                          defaultValue={['Dashboard']}
                          render={({ field }) => (
                            <ModulePermissionsSelector
                              value={field.value}
                              onChange={field.onChange}
                              role={watch('role')}
                            />
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer Action Buttons */}
                  <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={
                        activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext
                      }
                      className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/25 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      {activeStep === steps.length - 1 ? 'Finish & Create Employee' : 'Next Step →'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default MultiStepPopup;
