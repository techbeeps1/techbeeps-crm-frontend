import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { useForm } from 'react-hook-form';
import OffersForm from './Forms/Offerform';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import {
  MdInventory2,
  MdClose,
  MdDescription,
  MdReceiptLong,
  MdDriveFileRenameOutline,
  MdSave,
  MdCheckCircle
} from 'react-icons/md';

const NewPackageModal = ({ open, onClose }) => {
  const [selectedForm, setSelectedForm] = useState('offers');
  const [vatSelected, setVatSelected] = useState('exclusive');
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const handleVatSelect = (type) => {
    setVatSelected(type);
  };

  const createPackage = async (packageData) => {
    if ((packageData.name || '').trim() === '') {
      toast.error('Please enter a package name');
      return;
    }
    if (packageData.name.length < 2 || packageData.name.length > 55) {
      toast.error('Package name must be between 2 and 55 characters');
      return;
    }

    setSaving(true);
    try {
      await axios.post(`${apiPath}/api/packages`, packageData);
      toast.success('Quotation package created successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating package');
    } finally {
      setSaving(false);
    }
  };

  function formatApiData(data) {
    const formattedData = {
      name: data.name,
      ignoreRules: data.ignoreRules,
      vat: data.vat,
    };
    const sections = ['offers', 'invoice'];
    sections.forEach((section) => {
      formattedData[section] = {};
      Object.keys(data).forEach((key) => {
        if (key.startsWith(`${section}_`)) {
          const newKey = key.replace(`${section}_`, '');
          formattedData[section][newKey] = data[key];
        }
      });
      if (data[`${section}rules`]) {
        formattedData[section].rules = data[`${section}rules`];
      }
    });
    createPackage(formattedData);
  }

  const onSubmit = (data) => {
    let finalData = { ...data, vat: vatSelected };
    formatApiData(finalData);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        className: 'rounded-2xl dark:bg-boxdark border border-stroke dark:border-strokedark shadow-2xl overflow-hidden',
      }}
    >
      <div className="p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            onClose();
            reset();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
        >
          <MdClose className="text-xl" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6 border-b border-stroke dark:border-strokedark pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
            <MdInventory2 />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">
              Create Standard Package (No Job)
            </h3>
            <p className="text-xs text-body dark:text-bodydark">
              Define pricing line items and automatic invoice calculations
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Package Name */}
          <div>
            <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
              <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
              Package Name <span className="text-meta-1">*</span>
            </label>
            <input
              {...register('name', { required: true })}
              placeholder="e.g. Economy 1-Bedroom Relocation Package"
              className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
            />
            {errors.name && (
              <p className="text-meta-1 text-xs mt-1">Package name is required</p>
            )}
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-2/60 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
            {/* VAT Mode */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-2">
                Tax (VAT) Calculation
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVatSelect('inclusive')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    vatSelected === 'inclusive'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
                  }`}
                >
                  Including VAT
                </button>
                <button
                  type="button"
                  onClick={() => handleVatSelect('exclusive')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    vatSelected === 'exclusive'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
                  }`}
                >
                  Excluding VAT
                </button>
              </div>
            </div>

            {/* Zero Count Rules Toggle */}
            <div className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('ignoreRules')}
                  className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke"
                />
                <span className="text-xs font-semibold text-black dark:text-white">
                  Ignore calculation rules when quantity count is 0
                </span>
              </label>
            </div>
          </div>

          {/* Step Selector Tabs */}
          <div className="flex items-center justify-center gap-4 py-2 border-y border-stroke dark:border-strokedark">
            <button
              type="button"
              onClick={() => setSelectedForm('offers')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedForm === 'offers'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-gray-2 dark:bg-meta-4 text-slate-600 dark:text-slate-300 hover:bg-gray-3'
              }`}
            >
              <MdDescription className="text-base" />
              <span>Offers & Quotes Rules</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedForm('invoice')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                selectedForm === 'invoice'
                  ? 'bg-primary text-white shadow-md shadow-primary/25'
                  : 'bg-gray-2 dark:bg-meta-4 text-slate-600 dark:text-slate-300 hover:bg-gray-3'
              }`}
            >
              <MdReceiptLong className="text-base" />
              <span>Invoice Form Structure</span>
            </button>
          </div>

          {/* Form Sections */}
          <div style={{ display: selectedForm === 'offers' ? 'block' : 'none' }}>
            <OffersForm
              register={register}
              errors={errors}
              type="offers"
              watch={watch}
              setValue={setValue}
            />
          </div>
          <div style={{ display: selectedForm === 'invoice' ? 'block' : 'none' }}>
            <OffersForm
              register={register}
              errors={errors}
              type="invoice"
              watch={watch}
              setValue={setValue}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
            <button
              type="button"
              onClick={() => {
                onClose();
                reset();
              }}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <MdSave className="text-base" />
              {saving ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default NewPackageModal;

