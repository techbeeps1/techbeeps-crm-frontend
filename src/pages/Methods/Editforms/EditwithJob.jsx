import React, { useState, useEffect } from 'react';
import { Dialog } from '@mui/material';
import { useForm } from 'react-hook-form';
import EditForm from '../Forms/EditForm';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';
import {
  MdWorkOutline,
  MdClose,
  MdDescription,
  MdAssignmentTurnedIn,
  MdPlayCircleOutline,
  MdInventory2,
  MdEventAvailable,
  MdDriveFileRenameOutline,
  MdCategory,
  MdSave
} from 'react-icons/md';

const EditwithJob = ({ open, onClose, data }) => {
  const [selectedForm, setSelectedForm] = useState('offers');
  const [priceAgree, setPriceAgree] = useState('fixed_price');
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

  useEffect(() => {
    reset();
    if (data) {
      const reversedData = reverseApiData(data);
      Object.keys(reversedData).forEach((key) => {
        setValue(key, reversedData[key]);
      });
      setVatSelected(data.vat || 'exclusive');
      setPriceAgree(data.priceAgree || 'fixed_price');
    }
  }, [data, setValue, reset]);

  const handleVatSelect = (type) => {
    setVatSelected(type);
  };

  function formatApiData(formData) {
    const formattedData = {
      name: formData.name,
      ignoreRules: formData.ignoreRules,
      vat: formData.vat,
      type_job: formData.type_job,
      priceAgree: priceAgree,
    };
    const sections = [
      'offers',
      'invoice',
      'start_job',
      'Storage',
      'appointment',
    ];
    sections.forEach((section) => {
      formattedData[section] = {};
      Object.keys(formData).forEach((key) => {
        if (key.startsWith(`${section}_`)) {
          const newKey = key.replace(`${section}_`, '');
          formattedData[section][newKey] = formData[key];
        }
      });
      if (formData[`${section}rules`]) {
        formattedData[section].rules = formData[`${section}rules`];
      }
    });
    updatePackage(formattedData);
  }

  const updatePackage = async (packageData) => {
    setSaving(true);
    try {
      await axios.post(`${apiPath}/api/packages/${data._id}`, packageData);
      toast.success('Job package updated successfully');
      reset();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating package');
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (formData) => {
    let finalData = { ...formData, vat: vatSelected };
    formatApiData(finalData);
  };

  function reverseApiData(formattedData) {
    const res = {
      name: formattedData.name,
      ignoreRules: formattedData.ignoreRules,
      type_job: formattedData.type_job,
      priceAgree: formattedData.priceAgree,
      vat: formattedData.vat,
    };

    const sections = [
      'offers',
      'invoice',
      'start_job',
      'Storage',
      'appointment',
    ];
    sections.forEach((section) => {
      if (formattedData[section]) {
        Object.keys(formattedData[section]).forEach((key) => {
          if (key !== 'rules') {
            res[`${section}_${key}`] = formattedData[section][key];
          }
        });
        if (formattedData[section].rules) {
          res[`${section}rules`] = formattedData[section].rules;
        }
      }
    });
    return res;
  }

  const stages = [
    { id: 'offers', label: '1. Offers / Quotes', icon: MdDescription },
    { id: 'invoice', label: '2. Offer Acceptance', icon: MdAssignmentTurnedIn },
    { id: 'start_job', label: '3. Start Job', icon: MdPlayCircleOutline },
    { id: 'Storage', label: '4. Storage Staging', icon: MdInventory2 },
    { id: 'appointment', label: '5. Post Completion', icon: MdEventAvailable },
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        className:
          'rounded-2xl dark:bg-boxdark border border-stroke dark:border-strokedark shadow-2xl overflow-hidden',
      }}
    >
      <div className="p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
        >
          <MdClose className="text-xl" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6 border-b border-stroke dark:border-strokedark pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
            <MdWorkOutline />
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">
              Edit Custom Package (With Job Details)
            </h3>
            <p className="text-xs text-body dark:text-bodydark">
              Modify multi-phase quotation, acceptance, and execution stages
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Top Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Package Name */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
                Package Name <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('name', { required: true })}
                placeholder="Enter package name"
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
              {errors.name && (
                <p className="text-meta-1 text-xs mt-1">Package name is required</p>
              )}
            </div>

            {/* Type of Job */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                <MdCategory className="text-slate-400 text-sm" />
                Operation Job Type <span className="text-meta-1">*</span>
              </label>
              <select
                {...register('type_job')}
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              >
                <option value="relocation">Relocation Services</option>
                <option value="transport">Transport & Haulage</option>
                <option value="moving_lift">Moving Lift Operation</option>
              </select>
            </div>
          </div>

          {/* Options Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-2/60 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
            {/* VAT */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-2">
                VAT Calculation
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

            {/* Price Agreement */}
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-2">
                Pricing Agreement
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPriceAgree('fixed_price')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    priceAgree === 'fixed_price'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
                  }`}
                >
                  Fixed Price
                </button>
                <button
                  type="button"
                  onClick={() => setPriceAgree('onhourly_basis')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    priceAgree === 'onhourly_basis'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
                  }`}
                >
                  Hourly Rate
                </button>
              </div>
            </div>

            {/* Zero Rules Toggle */}
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

          {/* Workflow Stage Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Workflow Stage Form
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {stages.map((stage) => {
                const IconComponent = stage.icon;
                const isActive = selectedForm === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setSelectedForm(stage.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/25 scale-[1.02]'
                        : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark hover:bg-gray-2 dark:hover:bg-meta-4'
                    }`}
                  >
                    <IconComponent className="text-xl mb-1.5" />
                    <span className="text-center truncate w-full">{stage.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form Sections */}
          <div style={{ display: selectedForm === 'offers' ? 'block' : 'none' }}>
            <EditForm
              register={register}
              errors={errors}
              type="offers"
              watch={watch}
              setValue={setValue}
              data={data?.offers}
            />
          </div>
          <div style={{ display: selectedForm === 'invoice' ? 'block' : 'none' }}>
            <EditForm
              register={register}
              errors={errors}
              type="invoice"
              watch={watch}
              setValue={setValue}
              data={data?.invoice}
            />
          </div>
          <div style={{ display: selectedForm === 'start_job' ? 'block' : 'none' }}>
            <EditForm
              register={register}
              errors={errors}
              type="start_job"
              watch={watch}
              setValue={setValue}
              data={data?.start_job}
            />
          </div>
          <div style={{ display: selectedForm === 'Storage' ? 'block' : 'none' }}>
            <EditForm
              register={register}
              errors={errors}
              type="Storage"
              watch={watch}
              setValue={setValue}
              data={data?.Storage}
            />
          </div>
          <div style={{ display: selectedForm === 'appointment' ? 'block' : 'none' }}>
            <EditForm
              register={register}
              errors={errors}
              type="appointment"
              watch={watch}
              setValue={setValue}
              data={data?.appointment}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
            <button
              type="button"
              onClick={onClose}
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
              {saving ? 'Updating...' : 'Update Custom Job Package'}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
};

export default EditwithJob;

