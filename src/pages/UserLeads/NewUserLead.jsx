import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewUserLead = ({ handler, setOpen, open, type = "leads" }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({});

  const [loading, setLoading] = useState(false);

  const handleClose = () => setOpen(false);

  const notify = (message) =>
    toast.success(message, {
      autoClose: 2000,
    });
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const NewCustomer = async (e) => {
    if (!e?.firstName || e?.firstName?.trim() === '') {
      notifyError('First name is required');
      return;
    } else if (e?.firstName?.trim().length < 3 || e?.firstName?.trim().length > 30) {
      notifyError('First name must be between 3 and 30 characters');
      return;
    }

    if (!e?.lastName || e?.lastName?.trim() === '') {
      notifyError('Last name is required');
      return;
    } else if (e?.lastName?.trim().length < 3 || e?.lastName?.trim().length > 30) {
      notifyError('Last name must be between 3 and 30 characters');
      return;
    }

    if (!e?.gender || e?.gender?.trim() === '') {
      notifyError('Gender is required');
      return;
    }

    if (!e?.email || e?.email?.trim() === '') {
      notifyError('Email is required');
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e?.email?.trim())) {
      notifyError('Invalid email address');
      return;
    } else if (e?.contact && (e?.contact?.trim().length < 10 || e?.contact?.trim().length > 13)) {
      notifyError('Contact number must be between 10 and 13 digits');
      return;
    }

    if (!e?.postcode || e?.postcode?.trim() === '') {
      notifyError('Postcode is required');
      return;
    } else if (e?.postcode?.trim().length < 3 || e?.postcode?.trim().length > 12) {
      notifyError('Postcode must be between 3 and 12 characters');
      return;
    }

    if (!e?.city || e?.city?.trim() === '') {
      notifyError('City is required');
      return;
    } else if (e?.city?.trim().length < 2 || e?.city?.trim().length > 55) {
      notifyError('City must be between 2 and 55 characters');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiPath}/leads/leads`,
        { ...e, type: type },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.data.success === true) {
        handleClose();
        handler();
        reset();
        setLoading(false);
        notify('Customer added successfully');
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      notifyError(error.response?.data?.error || 'Something went wrong');
    }
  };

  const onSubmit = (data) => {
    NewCustomer(data);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Modern Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <PersonAddIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                New {type === 'leads' ? 'Lead' : 'Customer'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fill in the details below to add a record to CRM.
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

        {/* Modal Body Form */}
        <div className="p-6 overflow-y-auto space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="customer-form" className="space-y-4">
            {/* Customer Type Dropdown */}
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
                    <option value="" disabled>Select your customer type</option>
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

            {/* Email & Contact Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Email <span className="text-rose-500">*</span>
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8696671521"
                  {...register('contact', {
                    maxLength: {
                      value: 10,
                      message: 'Contact number must be at most 10 digits',
                    },
                    pattern: {
                      value: /^[0-9]*$/,
                      message: 'Contact number must be numeric',
                    },
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                />
                {errors.contact && (
                  <span className="text-xs text-rose-500 font-medium mt-1 block">
                    {errors.contact.message}
                  </span>
                )}
              </div>
            </div>

            {/* Gender & Find Us */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {errors.findUs && (
                  <span className="text-xs text-rose-500 font-medium mt-1 block">
                    {errors.findUs.message}
                  </span>
                )}
              </div>
            </div>

            {/* Postal Code, City, Language */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Postal Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 110001"
                  {...register('postcode', { required: 'Postal Code is required' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                />
                {(errors.postcode || errors[type]?.postcode) && (
                  <span className="text-xs text-rose-500 font-medium mt-1 block">
                    {errors.postcode?.message || errors[type]?.postcode?.message}
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
                  {...register('city', { required: 'City is required' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                />
                {(errors.city || errors[type]?.city) && (
                  <span className="text-xs text-rose-500 font-medium mt-1 block">
                    {errors.city?.message || errors[type]?.city?.message}
                  </span>
                )}
              </div>

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
                {errors.taal && (
                  <span className="text-xs text-rose-500 font-medium mt-1 block">
                    {errors.taal.message}
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="customer-form"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-primary/25 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Create Lead</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewUserLead;




