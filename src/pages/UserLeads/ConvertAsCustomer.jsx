import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';

const ConvertAsCustomer = ({ handler, setOpen, open, type = 'Lead', customerData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({ defaultValues: customerData || {} });

  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerData) {
      reset(customerData);
    }
  }, [customerData, reset]);

  const handleClose = () => setOpen(false);

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

  const NewCustomer = async (e) => {
    if (!e?.email || e?.email?.trim() === '') {
      notifyError('Email is required');
      return;
    }

    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e?.email?.trim())) {
      notifyError('Invalid email address');
      return;
    }

    if (!e?.contact || e?.contact?.trim() === '') {
      notifyError('Contact number is required');
      return;
    } else if (e?.contact && (e?.contact?.trim().length < 10 || e?.contact?.trim().length > 13)) {
      notifyError('Contact number must be between 10 and 13 digits');
      return;
    }

    if (e?.mobile && (e?.mobile?.trim().length < 10 || e?.mobile?.trim().length > 13)) {
      notifyError('Mobile number must be between 10 and 13 digits');
      return;
    }

    if (!e?.postcode || e?.postcode?.trim() === '') {
      notifyError('Postcode is required');
      return;
    } else if (e?.postcode?.trim().length < 3 || e?.postcode?.trim().length > 12) {
      notifyError('Postcode must be between 3 and 12 characters');
      return;
    }

    if (!e?.houseNumber || e?.houseNumber?.toString().trim() === '') {
      notifyError('House number is required');
      return;
    }

    if (!e?.street || e?.street?.trim() === '') {
      notifyError('Street is required');
      return;
    } else if (e?.street?.trim().length < 2 || e?.street?.trim().length > 55) {
      notifyError('Street must be between 2 and 55 characters');
      return;
    }

    if (!e?.city || e?.city?.trim() === '') {
      notifyError('City is required');
      return;
    } else if (e?.city?.trim().length < 2 || e?.city?.trim().length > 55) {
      notifyError('City must be between 2 and 55 characters');
      return;
    }

    if (!e?.typeOfProperty || e?.typeOfProperty?.trim() === '') {
      notifyError('Type of property is required');
      return;
    }

    if (!e?.country || e?.country?.trim() === '') {
      notifyError('Country is required');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiPath}/leads/convert-as-customer`,
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
        notify('Lead Converted As Customer');
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
        className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Modern Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <SwapHorizIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                Convert Lead to Customer
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete address & property details to finalize conversion.
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
        <div className="p-6 overflow-y-auto space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="convert-customer-form" className="space-y-6">
            <input type="hidden" {...register("type")} value="Customer" />

            {/* Contact Information Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-2">
                Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    Contact Number <span className="text-rose-500">*</span>
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    {...register('mobile', {
                      maxLength: {
                        value: 13,
                        message: 'Mobile number must be at most 13 digits',
                      },
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                  {errors.mobile && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.mobile.message}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-2">
                Address Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Postcode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 335701"
                    {...register('postcode', { required: 'Postcode is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                  {errors.postcode && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.postcode.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    House Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 42A"
                    {...register('houseNumber', { required: 'House number is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                  {errors.houseNumber && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.houseNumber.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Street <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Market Street"
                    {...register('street', { required: 'Street is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                  {errors.street && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.street.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Anupgarh"
                    {...register('city', { required: 'City is required' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                  {errors.city && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.city.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                  Addition / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Apt 4B, Near Central Park"
                  {...register('addition')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Property Details Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-2">
                Property & Location Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Type of Property <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="typeOfProperty"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Property type is required' }}
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
                  {errors.typeOfProperty && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.typeOfProperty.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Country <span className="text-rose-500">*</span>
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    defaultValue=""
                    rules={{ required: 'Country is required' }}
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
                  {errors.country && (
                    <span className="text-xs text-rose-500 font-medium mt-1 block">
                      {errors.country.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    Floor
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2nd Floor"
                    {...register('floor')}
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
                    {...register('distanceToLift')}
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
                    {...register('distanceToApartment')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
                  />
                </div>
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
            form="convert-customer-form"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-emerald-600/25 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Converting...</span>
              </>
            ) : (
              <span>Convert to Customer</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertAsCustomer;

