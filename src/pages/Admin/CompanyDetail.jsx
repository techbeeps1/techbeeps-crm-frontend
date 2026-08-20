import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import {
  MdOutlineBusiness,
  MdLocationOn,
  MdMap,
  MdPublic,
  MdEmail,
  MdPhone,
  MdLanguage,
  MdReceiptLong,
  MdFactCheck,
  MdConfirmationNumber,
  MdSave,
  MdCheckCircleOutline,
  MdInfoOutline
} from 'react-icons/md';

const CompanySettings = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const notify = (message) => toast.success(message);
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiPath}/api/company-details`);
        const data = await response.json();
        reset(data);
      } catch (error) {
        console.error('Error fetching company details:', error);
        notifyError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [reset]);

  const handleFormSubmit = (data) => {
    const validateLength = (value, min, max) => {
      const trimmed = (value || '').trim();
      return trimmed.length >= min && trimmed.length <= max;
    };

    if (!validateLength(data.companyName, 2, 55)) {
      notifyError('Company Name must be between 2 and 55 characters.');
      return;
    }

    if (!validateLength(data.companyAddress, 2, 55)) {
      notifyError('Company Address must be between 2 and 55 characters.');
      return;
    }

    if (!validateLength(data.companyState, 2, 55)) {
      notifyError('Company State must be between 2 and 55 characters.');
      return;
    }

    if (!validateLength(data.companyEmail, 5, 55)) {
      notifyError('Company Email must be between 5 and 55 characters.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data.companyEmail || '').trim())) {
      notifyError('Please enter a valid Company Email.');
      return;
    }

    if (!/^\d{7,15}$/.test((data.companyPhone || '').trim())) {
      notifyError('Company Phone must be between 7 and 15 digits.');
      return;
    }

    if (!validateLength(data.companyWebsite, 5, 55)) {
      notifyError('Company Website must be between 5 and 55 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9]{8,20}$/.test((data.companyTaxNumber || '').trim())) {
      notifyError('Company Tax Number must be 8 to 20 characters and alphanumeric.');
      return;
    }

    if (!validateLength(data.companyVatNumber, 8, 15)) {
      notifyError('Company VAT Number must be between 8 and 15 characters.');
      return;
    }

    if (!validateLength(data.companyRegNumber, 6, 25)) {
      notifyError('Company Register Number must be between 6 and 25 characters.');
      return;
    }

    setPendingData(data);
    setShowConfirmModal(true);
  };

  const confirmAndSave = async () => {
    if (!pendingData) return;
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const response = await fetch(`${apiPath}/api/company-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pendingData),
      });

      if (response.ok) {
        notify('Company details updated successfully!');
      } else {
        notifyError('Failed to update company details.');
      }
    } catch (error) {
      console.error('Error updating company details:', error);
      notifyError('An error occurred while updating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {loading && <Loader />}

      {/* Header Info */}
      <div className="border-b border-stroke dark:border-strokedark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
            <MdOutlineBusiness className="text-primary text-2xl" />
            Company & Business Details
          </h3>
          <p className="text-sm text-body dark:text-bodydark mt-1">
            Official company credentials printed on quotations, bills, tax invoices and emails.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 self-start sm:self-auto font-medium">
          <MdInfoOutline className="text-sm" />
          Used across CRM invoices
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Section 1: Basic Identity */}
        <div className="bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MdFactCheck className="text-primary text-base" />
            Company Profile & Identity
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdOutlineBusiness className="text-slate-400 text-sm" />
                Company Name <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyName', { required: true })}
                placeholder="e.g. Techbeeps Solutions Pvt Ltd"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyName && (
                <span className="text-meta-1 text-xs mt-1 block">Company Name is required</span>
              )}
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdConfirmationNumber className="text-slate-400 text-sm" />
                Company Registration No. <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyRegNumber', { required: true })}
                placeholder="e.g. U72200DL2021PTC12345"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyRegNumber && (
                <span className="text-meta-1 text-xs mt-1 block">Register Number is required</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Address & Location */}
        <div className="bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MdLocationOn className="text-primary text-base" />
            Headquarters & Location
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Address */}
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdLocationOn className="text-slate-400 text-sm" />
                Street Address <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyAddress', { required: true })}
                placeholder="e.g. Suite 402, Business Tower, Tech Park"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyAddress && (
                <span className="text-meta-1 text-xs mt-1 block">Address is required</span>
              )}
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdMap className="text-slate-400 text-sm" />
                State / Province <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyState', { required: true })}
                placeholder="e.g. Delhi"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyState && (
                <span className="text-meta-1 text-xs mt-1 block">State is required</span>
              )}
            </div>

            {/* Country */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdPublic className="text-slate-400 text-sm" />
                Country <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyCountry', { required: true })}
                placeholder="e.g. India"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyCountry && (
                <span className="text-meta-1 text-xs mt-1 block">Country is required</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Web */}
        <div className="bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MdEmail className="text-primary text-base" />
            Contact & Digital Presence
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdEmail className="text-slate-400 text-sm" />
                Company Email <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyEmail', { required: true, pattern: /^\S+@\S+$/i })}
                type="email"
                placeholder="contact@company.com"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyEmail && (
                <span className="text-meta-1 text-xs mt-1 block">Valid email is required</span>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdPhone className="text-slate-400 text-sm" />
                Phone Number <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyPhone', { required: true })}
                placeholder="e.g. 9876543210"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyPhone && (
                <span className="text-meta-1 text-xs mt-1 block">Valid phone is required</span>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdLanguage className="text-slate-400 text-sm" />
                Website URL <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyWebsite', { required: true })}
                placeholder="e.g. https://company.com"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
              />
              {errors.companyWebsite && (
                <span className="text-meta-1 text-xs mt-1 block">Website is required</span>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Tax & VAT */}
        <div className="bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark space-y-4">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <MdReceiptLong className="text-primary text-base" />
            Taxation & Compliance Numbers
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tax Number */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdReceiptLong className="text-slate-400 text-sm" />
                Tax ID / GSTIN / EIN <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyTaxNumber', { required: true })}
                placeholder="e.g. 07AAAAA0000A1Z5"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium uppercase"
              />
              {errors.companyTaxNumber && (
                <span className="text-meta-1 text-xs mt-1 block">Tax Number is required</span>
              )}
            </div>

            {/* VAT Number */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdReceiptLong className="text-slate-400 text-sm" />
                VAT Number <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('companyVatNumber', { required: true })}
                placeholder="e.g. VAT12345678"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium uppercase"
              />
              {errors.companyVatNumber && (
                <span className="text-meta-1 text-xs mt-1 block">VAT Number is required</span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-7 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
          >
            <MdSave className="text-lg" />
            {loading ? 'Saving Updates...' : 'Save Company Details'}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stroke dark:border-strokedark space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
              <MdCheckCircleOutline />
            </div>
            <div>
              <h4 className="text-lg font-bold text-black dark:text-white">
                Confirm Details Update
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to update your official company details? These changes will immediately reflect across all generated quotations and invoices.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmAndSave}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary hover:bg-opacity-90 text-white shadow-md shadow-primary/25 transition-all cursor-pointer"
              >
                Confirm & Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySettings;

