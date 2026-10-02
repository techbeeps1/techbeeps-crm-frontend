import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import { isValidPhoneNumber } from '../../utils/phoneUtil';
import { lookupDutchAddress } from '../../utils/dutchAddressLookup';

const NewCustomer = ({ handler, setOpen, open, type = 'Customer' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
    watch,
    setValue,
  } = useForm({});

  const allValues = watch();
  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setStep(1);
  };

  const notify = (message) =>
    toast.success(message, {
      autoClose: 2000,
    });
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  useEffect(() => {
    axios
      .get(`${apiPath}/api/sale_group?type=country`)
      .then((response) => {
        const countryNames = response.data.map((country) => country.name);
        setCountries(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });

    axios
      .get(`${apiPath}/api/sale_group?type=property`)
      .then((response) => {
        const countryNames = response.data.map((country) => country.name);
        setProperty(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching property types:', error);
      });
  }, []);

  const createCustomer = async (e) => {
    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${apiPath}/customer/customeradd`,
        { ...e, type: type },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      if (response.data.message === 'customer created' || response.data.success === true) {
        handleClose();
        reset();
        handler();
        setLoading(false);
        notify('Customer added successfully');
      } else {
        setLoading(false);
        notifyError(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      notifyError(error.response?.data?.error || 'Something went wrong');
    }
  };

  const onSubmit = (data) => {
    createCustomer(data);
  };

  const goToNextStep = async (e) => {
    e.preventDefault();
    const fieldsToValidate = [
      'typeOfCustomer',
      'firstName',
      'lastName',
      'gender',
      'email',
      'contact',
      'mobile',
    ];
    if (allValues?.typeOfCustomer === 'Commerical' || allValues?.typeOfCustomer === 'Commercial') {
      fieldsToValidate.push('companyName');
    }
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep(2);
  };

  const goToPreviousStep = () => setStep(1);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header & Wizard Progress */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <PersonAddIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                New {type} (Step {step} of 2)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 1 ? 'Personal Profile & Contact Information' : 'Address & Property Details'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="new-customer-form" className="space-y-4">
            {step === 1 && (
              <div className="space-y-4">
                {/* Type of Customer */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Type of Customer <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="typeOfCustomer"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Type of customer is required' }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                      >
                        <option value="" disabled>Select customer type</option>
                        <option value="Commercial">Commercial</option>
                        {field.value === 'Commerical' && (
                          <option value="Commerical" style={{ display: 'none' }}>Commercial</option>
                        )}
                        <option value="Individual">Individual</option>
                      </select>
                    )}
                  />
                  {errors.typeOfCustomer && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.typeOfCustomer.message}
                    </span>
                  )}
                </div>

                {/* Company Name (for Commercial customer type) */}
                {(allValues?.typeOfCustomer === 'Commerical' || allValues?.typeOfCustomer === 'Commercial') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp B.V."
                      {...register('companyName', {
                        required: (allValues?.typeOfCustomer === 'Commerical' || allValues?.typeOfCustomer === 'Commercial') ? 'Company name is required for commercial customers' : false,
                        validate: (value) => {
                          if (allValues?.typeOfCustomer === 'Commerical' || allValues?.typeOfCustomer === 'Commercial') {
                            return (typeof value === 'string' && value.trim().length > 0) || 'Company name cannot be blank or spaces only.';
                          }
                          return true;
                        },
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.companyName
                          ? 'border-rose-500 ring-2 ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400`}
                    />
                    {errors.companyName && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.companyName.message}
                      </span>
                    )}
                  </div>
                )}

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${errors.firstName ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gurjeet"
                      {...register('firstName', {
                        required: 'First name is required',
                        validate: (value) => (typeof value === 'string' && value.trim().length > 0) || 'First name cannot be blank or spaces only.',
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.firstName
                          ? 'border-rose-500 ring-2 ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400`}
                    />
                    {errors.firstName && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${errors.lastName ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Singh"
                      {...register('lastName', {
                        required: 'Last name is required',
                        validate: (value) => (typeof value === 'string' && value.trim().length > 0) || 'Last name cannot be blank or spaces only.',
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.lastName
                          ? 'border-rose-500 ring-2 ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400`}
                    />
                    {errors.lastName && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.lastName.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Salutation & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Salutation
                    </label>
                    <Controller
                      name="salutation"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>Select Salutation</option>
                          <option value="Madam">Madam</option>
                          <option value="Mrs">Mrs.</option>
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${errors.gender ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="gender"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`w-full px-4 py-2.5 rounded-xl border ${
                            errors.gender
                              ? 'border-rose-500 ring-2 ring-rose-500/10'
                              : 'border-slate-200 dark:border-slate-700'
                          } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer`}
                        >
                          <option value="" disabled>Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      )}
                    />
                    {errors.gender && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.gender.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${errors.email ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. guri7756@gmail.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    className={`w-full px-4 py-2.5 rounded-xl border ${
                      errors.email
                        ? 'border-rose-500 ring-2 ring-rose-500/10'
                        : 'border-slate-200 dark:border-slate-700'
                    } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400`}
                  />
                  {errors.email && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Contact Phone & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${errors.contact ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 010 1234567 or +31 10 1234567"
                      {...register('contact', {
                        validate: (value) => {
                          if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                            return true; // Optional empty telephone does not block
                          }
                          return (
                            isValidPhoneNumber(value) ||
                            'Please enter a valid telephone number (e.g. 010 1234567 or +31 10 1234567).'
                          );
                        },
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.contact
                          ? 'border-rose-500 ring-2 ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400`}
                    />
                    {errors.contact && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.contact.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${errors.mobile ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 06 12345678 or +31 6 12345678"
                      {...register('mobile', {
                        required: 'Mobile number is required',
                        validate: (value) => {
                          if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                            return 'Mobile number is required';
                          }
                          return (
                            isValidPhoneNumber(value) ||
                            'Please enter a valid mobile number (e.g. 06 12345678 or +31 6 12345678).'
                          );
                        },
                      })}
                      className={`w-full px-4 py-2.5 rounded-xl border ${
                        errors.mobile
                          ? 'border-rose-500 ring-2 ring-rose-500/10'
                          : 'border-slate-200 dark:border-slate-700'
                      } bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400`}
                    />
                    {errors.mobile && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.mobile.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Language & Find Us */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Language
                    </label>
                    <Controller
                      name="taal"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>Select Language</option>
                          <option value="Dutch">Dutch</option>
                          <option value="English">English</option>
                          <option value="German">German</option>
                          <option value="French">French</option>
                        </select>
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Find Us
                    </label>
                    <Controller
                      name="findUs"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
                        >
                          <option value="" disabled>Select how you found us</option>
                          <option value="social_media">Social Media</option>
                          <option value="Google">Google</option>
                          <option value="Friend">Friend</option>
                          <option value="Website">Website</option>
                          <option value="Other">Other</option>
                        </select>
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <AddressForm
                type="head"
                register={register}
                errors={errors}
                control={control}
                countries={countries}
                property={property}
                setValue={setValue}
                watch={watch}
              />
            )}
          </form>
        </div>

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={goToPreviousStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowBackIcon style={{ fontSize: 16 }} />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={goToNextStep}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/25 cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowForwardIcon style={{ fontSize: 16 }} />
              </button>
            ) : (
              <button
                type="submit"
                form="new-customer-form"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-primary/25 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Create Customer</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewCustomer;

const AddressForm = ({
  type,
  register,
  errors,
  control,
  countries,
  property,
  setValue,
  watch,
}) => {
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupStatus, setLookupStatus] = React.useState(null);

  // Initialize country default to Netherlands if untouched
  React.useEffect(() => {
    if (watch && setValue) {
      const currentCountry = watch(`${type}.country`);
      if (!currentCountry) {
        setValue(`${type}.country`, 'Netherlands');
      }
    }
  }, [type, watch, setValue]);

  const handleLookup = async () => {
    if (!watch || !setValue) return;
    const rawPostcode = watch(`${type}.postcode`) || '';
    const houseNumber = watch(`${type}.houseNumber`) || '';
    const addition = watch(`${type}.addition`) || '';
    const country = watch(`${type}.country`) || 'Netherlands';

    if (!rawPostcode || !houseNumber) {
      return;
    }

    setLookupLoading(true);
    setLookupStatus(null);
    try {
      const res = await lookupDutchAddress(rawPostcode, houseNumber, addition, country);
      if (res.success && res.street && res.city) {
        setValue(`${type}.street`, res.street, { shouldValidate: true, shouldDirty: true });
        setValue(`${type}.city`, res.city, { shouldValidate: true, shouldDirty: true });
        if (!watch(`${type}.country`)) {
          setValue(`${type}.country`, 'Netherlands', { shouldValidate: true, shouldDirty: true });
        }
        setLookupStatus({ type: 'success', text: `✓ Auto-filled: ${res.street}, ${res.city}` });
      } else if (res.message && !res.message.includes('Foreign country')) {
        setLookupStatus({ type: 'info', text: res.message });
      }
    } catch {
      setLookupStatus({ type: 'info', text: 'Lookup unavailable; manual entry enabled.' });
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="hidden" {...register(`${type}.${type}`)} value={type} />
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-2">
        Address & Property Information
      </h4>

      {/* Postcode & House Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Postcode <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 3011AD"
            {...register(`${type}.postcode`, { required: 'Postcode is required' })}
            onBlur={handleLookup}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
          {errors[type]?.postcode && (
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {errors[type]?.postcode?.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            House Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 40"
            {...register(`${type}.houseNumber`, { required: 'House number is required' })}
            onBlur={handleLookup}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
          {errors[type]?.houseNumber && (
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {errors[type]?.houseNumber?.message}
            </span>
          )}
        </div>
      </div>

      {lookupLoading && (
        <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
          <svg className="animate-spin h-3.5 w-3.5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          Looking up address via PDOK...
        </div>
      )}
      {lookupStatus && !lookupLoading && (
        <div className={`text-xs p-2 rounded-lg font-medium ${
          lookupStatus.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
        }`}>
          {lookupStatus.text}
        </div>
      )}

      {/* Street & City */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Street <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Main Street"
            {...register(`${type}.street`, { required: 'Street is required' })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
          {errors[type]?.street && (
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {errors[type]?.street?.message}
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            City <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Amsterdam"
            {...register(`${type}.city`, { required: 'City is required' })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
          {errors[type]?.city && (
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {errors[type]?.city?.message}
            </span>
          )}
        </div>
      </div>

      {/* Addition */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Addition / Landmark
        </label>
        <input
          type="text"
          placeholder="e.g. Apt 2B"
          {...register(`${type}.addition`)}
          onBlur={handleLookup}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
        />
      </div>

      {/* Property Type & Country */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Type of Property <span className="text-rose-500">*</span>
          </label>
          <Controller
            name={`${type}.typeOfProperty`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
              >
                <option value="" disabled>Select property type</option>
                {property.map((propItem, idx) => (
                  <option key={idx} value={propItem}>
                    {propItem}
                  </option>
                ))}
              </select>
            )}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Country <span className="text-rose-500">*</span>
          </label>
          <Controller
            name={`${type}.country`}
            control={control}
            defaultValue=""
            render={({ field }) => (
              <select
                {...field}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
              >
                <option value="" disabled>Select country</option>
                {countries.map((cName, idx) => (
                  <option key={idx} value={cName}>
                    {cName}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      {/* Floor, Lift Distance, Apartment Distance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Floor
          </label>
          <input
            type="text"
            placeholder="e.g. 1"
            {...register(`${type}.floor`)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Distance to Lift
          </label>
          <input
            type="text"
            placeholder="e.g. 10m"
            {...register(`${type}.distanceToLift`)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Distance to Apartment
          </label>
          <input
            type="text"
            placeholder="e.g. 15m"
            {...register(`${type}.distanceToApartment`)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Checkbox Options */}
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register(`${type}.hasElevator`)}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span>Has Elevator</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register(`${type}.deliveringBoxes`)}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span>Delivering Boxes</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register(`${type}.applyForPermit`)}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span>Apply for Permit</span>
        </label>
      </div>
    </div>
  );
};

