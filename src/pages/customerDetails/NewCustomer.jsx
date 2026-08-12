import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewCustomer = ({ handler, setOpen, open, type = 'Customer' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
    watch,
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
    if (!e.head?.postcode || e.head?.postcode?.trim() === '') {
      notifyError('Postcode is required');
      return;
    } else if (e.head?.postcode?.trim().length < 3 || e.head?.postcode?.trim().length > 12) {
      notifyError('Postcode must be between 3 and 12 characters');
      return;
    }

    if (!e.head?.houseNumber || e.head?.houseNumber?.toString().trim() === '') {
      notifyError('House number is required');
      return;
    }

    if (!e.head?.street || e.head?.street?.trim() === '') {
      notifyError('Street is required');
      return;
    } else if (e.head?.street?.trim().length < 2 || e.head?.street?.trim().length > 55) {
      notifyError('Street must be between 2 and 55 characters');
      return;
    }

    if (!e.head?.city || e.head?.city?.trim() === '') {
      notifyError('City is required');
      return;
    } else if (e.head?.city?.trim().length < 2 || e.head?.city?.trim().length > 55) {
      notifyError('City must be between 2 and 55 characters');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiPath}/customer/customeradd`,
        { ...e, type: type },
        {
          headers: {
            'Content-Type': 'application/json',
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

    if (!allValues.firstName || allValues.firstName?.trim() === '') {
      notifyError('First name is required');
      return;
    } else if (allValues.firstName?.trim().length < 3 || allValues.firstName?.trim().length > 30) {
      notifyError('First name must be between 3 and 30 characters');
      return;
    }

    if (!allValues.lastName || allValues.lastName?.trim() === '') {
      notifyError('Last name is required');
      return;
    } else if (allValues.lastName?.trim().length < 3 || allValues.lastName?.trim().length > 30) {
      notifyError('Last name must be between 3 and 30 characters');
      return;
    }

    if (!allValues.gender || allValues.gender?.trim() === '') {
      notifyError('Gender is required');
      return;
    }

    if (!allValues.email || allValues.email?.trim() === '') {
      notifyError('Email is required');
      return;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(allValues.email?.trim())) {
      notifyError('Invalid email address');
      return;
    }

    if (!allValues.mobile || allValues.mobile?.trim() === '') {
      notifyError('Mobile number is required');
      return;
    } else if (allValues.mobile?.trim().length < 10 || allValues.mobile?.trim().length > 13) {
      notifyError('Mobile number must be between 10 and 13 digits');
      return;
    }

    const isValid = await trigger();
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
                        <option value="Commerical">Commercial</option>
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

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      First Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gurjeet"
                      {...register('firstName', { required: 'First name is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                    {errors.firstName && (
                      <span className="text-xs text-rose-500 font-medium mt-1 block">
                        {errors.firstName.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Singh"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <Controller
                      name="gender"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <select
                          {...field}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. guri7756@gmail.com"
                    {...register('email', { required: 'Email is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8696671521"
                      {...register('contact', {
                        maxLength: {
                          value: 10,
                          message: 'Contact number must be at most 10 digits',
                        },
                      })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      {...register('mobile', { required: 'Mobile number is required' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
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
}) => {
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
            placeholder="e.g. 335701"
            {...register(`${type}.postcode`, { required: 'Postcode is required' })}
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
            placeholder="e.g. 42"
            {...register(`${type}.houseNumber`, { required: 'House number is required' })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
          {errors[type]?.houseNumber && (
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {errors[type]?.houseNumber?.message}
            </span>
          )}
        </div>
      </div>

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

