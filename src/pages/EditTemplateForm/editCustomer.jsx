import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { isValidPhoneNumber } from '../../utils/phoneUtil';
import { lookupDutchAddress } from '../../utils/dutchAddressLookup';

const EditCustomer = ({
  customerData,
  handleEditSubmit,
  formType,
  handleCustomer,
}) => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm({
    defaultValues: (formType !== 'address' && customerData) || {},
  });

  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formType !== 'address' && customerData) {
      reset(customerData);
    }
  }, [customerData, reset, formType]);

  const handleOpen = () => {
    if (formType !== 'address' && customerData) {
      reset(customerData);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (formType !== 'address' && customerData) {
      reset(customerData);
    } else {
      reset();
    }
  };

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

  const newAddressHandler = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let response = await axios.post(
        `${apiPath}/customer/customer/address`,
        data,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (response.status === 200) {
        handleClose();
        if (handleCustomer) {
          await handleCustomer();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (formType === 'address') {
      await newAddressHandler({ customerId: customerData._id, addressData: data });
    } else {
      setLoading(true);
      try {
        const result = await handleEditSubmit(data);
        if (result && result.success) {
          reset(result.data || data);
          handleClose();
        }
        // If result.success is false or not ok, modal remains open and inputs remain intact!
      } catch (err) {
        console.error('Error during form submission:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!open) {
    return formType === 'address' ? (
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all text-xs font-semibold cursor-pointer"
      >
        <AddCircleOutlineIcon style={{ fontSize: 16 }} />
        <span>Add Address</span>
      </button>
    ) : (
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
      >
        <EditIcon style={{ fontSize: 18 }} />
        <span>Edit Customer</span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Modern Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-strokedark bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <EditIcon />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
                {formType === 'address' ? 'Add New Address' : 'Edit Customer Profile'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update records for {customerData?.firstName} {customerData?.lastName}.
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

        {/* Modal Form Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="edit-customer-modal-form" className="space-y-4">
            {formType === 'address' ? (
              <AddressForm
                register={register}
                errors={errors}
                control={control}
                countries={countries}
                property={property}
                setValue={setValue}
                watch={watch}
              />
            ) : (
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
                {(watch('typeOfCustomer') === 'Commerical' || watch('typeOfCustomer') === 'Commercial') && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp B.V."
                      {...register('companyName', {
                        required: (watch('typeOfCustomer') === 'Commerical' || watch('typeOfCustomer') === 'Commercial') ? 'Company name is required for commercial customers' : false,
                        validate: (value) => {
                          if (watch('typeOfCustomer') === 'Commerical' || watch('typeOfCustomer') === 'Commercial') {
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

                {/* Contact & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
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
            form="edit-customer-modal-form"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/90 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-primary/25 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomer;

const AddressForm = ({ register, errors, control, countries, property, setValue, watch }) => {
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupStatus, setLookupStatus] = React.useState(null);

  // Initialize country default to Netherlands if untouched
  React.useEffect(() => {
    if (watch && setValue) {
      const currentCountry = watch('country');
      if (!currentCountry) {
        setValue('country', 'Netherlands');
      }
    }
  }, [watch, setValue]);

  const handleLookup = async () => {
    if (!watch || !setValue) return;
    const rawPostcode = watch('postcode') || '';
    const houseNumber = watch('houseNumber') || '';
    const addition = watch('addition') || '';
    const country = watch('country') || 'Netherlands';

    if (!rawPostcode || !houseNumber) {
      return;
    }

    setLookupLoading(true);
    setLookupStatus(null);
    try {
      const res = await lookupDutchAddress(rawPostcode, houseNumber, addition, country);
      if (res.success && res.street && res.city) {
        setValue('street', res.street, { shouldValidate: true, shouldDirty: true });
        setValue('city', res.city, { shouldValidate: true, shouldDirty: true });
        if (!watch('country')) {
          setValue('country', 'Netherlands', { shouldValidate: true, shouldDirty: true });
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
      {/* Address Type */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Address Type <span className="text-rose-500">*</span>
        </label>
        <Controller
          name="addressType"
          control={control}
          defaultValue=""
          rules={{ required: 'Address type is required' }}
          render={({ field }) => (
            <select
              {...field}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs cursor-pointer"
            >
              <option value="" disabled>Select address type</option>
              <option value="billing">Billing</option>
              <option value="private">Private</option>
              <option value="other">Other</option>
            </select>
          )}
        />
        {errors.addressType && (
          <span className="text-xs text-rose-500 font-medium mt-1 block">
            {errors.addressType.message}
          </span>
        )}
      </div>

      {/* Postcode & House Number */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Postcode <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 3011AD"
            {...register('postcode', { required: 'Postcode is required' })}
            onBlur={handleLookup}
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
            placeholder="e.g. 40"
            {...register('houseNumber', { required: 'House number is required' })}
            onBlur={handleLookup}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-100 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs placeholder:text-slate-400"
          />
          {errors.houseNumber && (
            <span className="text-xs text-rose-500 font-medium mt-1 block">
              {errors.houseNumber.message}
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
            placeholder="e.g. Amsterdam"
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

      {/* Addition */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Addition / Landmark
        </label>
        <input
          type="text"
          placeholder="e.g. Apt 2B"
          {...register('addition')}
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
                {property &&
                  property.map((propItem, idx) => (
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
                {countries &&
                  countries.map((cName, idx) => (
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

      {/* Floor, Lift Distance, Apartment Distance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Floor
          </label>
          <input
            type="text"
            placeholder="e.g. 1"
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

      {/* Checkboxes */}
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register('hasElevator')}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span>Has Elevator</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register('deliveringBoxes')}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span>Delivering Boxes</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            {...register('applyForPermit')}
            className="w-4 h-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span>Apply for Permit</span>
        </label>
      </div>
    </div>
  );
};

