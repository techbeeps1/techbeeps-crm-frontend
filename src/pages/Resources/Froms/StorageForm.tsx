import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import { MdWarehouse, MdEdit, MdAdd, MdClose } from 'react-icons/md';

const StorageForm: React.FC<any> = ({ data, handler, warehouse }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storageLocation, setStorageLocation] = useState<any>([]);
  const warehousefilter = warehouse?.filter((item: any) => item.condition === 'Enable');
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
    reset,
  } = useForm();

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const onSubmit = (Formdata: any) => {
    storageHandlers(Formdata);
  };

  useEffect(() => {
    if (data) {
      reset(data);
      setValue('warehouse', (data && data.warehouse?._id) || '');
    }
  }, [reset, data, setValue]);

  const storageHandlers = async (formData: any) => {
    setLoading(true);
    let path = `${apiPath}/api/storages`;
    if (formData._id) {
      path = `${path}/${formData?._id}`;
    }
    if (!formData.storageCode || formData.storageCode.trim() === '') {
      notifyError('Storage number is required');
      setLoading(false);
      return;
    } else if (formData.storageCode.length > 50 || formData.storageCode.length < 2) {
      notifyError('Storage number must be between 2 and 50 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(path, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 201 || response.status === 200) {
        notify('Storage saved successfully!');
        handler();
        setOpen(false);
        reset();
      } else {
        notifyError(response.data.message);
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Something went wrong. Please try again.';
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  let warehouseId = watch('warehouse');

  const handleAllData = async () => {
    setLoading(true);
    try {
      warehouseId = warehouseId && typeof warehouseId === 'object'
        ? warehouseId._id
        : warehouseId;
      const response = await axios.get(
        `${apiPath}/api/storage_loaction?warehouseId=${(warehouseId && warehouseId) || ''}`,
      );
      setStorageLocation(response.data?.filter((item: any) => item.status === 'Enable') || []);
      if (data) {
        setValue('storageLocation', (data && data.storageLocation?._id) || '');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) handleAllData();
  }, [warehouseId]);

  const handleCancel = () => {
    setOpen(false);
    reset();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        type="button"
        className={data ? "inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors" : "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-primary hover:bg-opacity-90 shadow-sm shadow-primary/20 active:scale-[0.98] transition-all"}
      >
        {data ? (
          <>
            <MdEdit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </>
        ) : (
          <>
            <MdAdd className="w-5 h-5" />
            <span>Add Storage</span>
          </>
        )}
      </button>

      <Dialog
        open={open}
        onClose={handleCancel}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        {loading && <Loader />}
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
              <MdWarehouse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {data ? 'Update Storage Unit' : 'Add New Storage Unit'}
              </h3>
              <p className="text-xs text-slate-500">Configure storage dimensions and location</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Storage Number / Code <span className="text-red-500">*</span>
              </label>
              <Controller
                name="storageCode"
                control={control}
                defaultValue=""
                rules={{ required: 'Storage number is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="e.g. ST-101"
                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                      errors.storageCode ? 'border-red-500' : 'border-slate-300 focus:border-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800`}
                  />
                )}
              />
              {errors.storageCode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.storageCode.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Storage Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="storageType"
                control={control}
                defaultValue=""
                rules={{ required: 'Storage type is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                      errors.storageType ? 'border-red-500' : 'border-slate-300 focus:border-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800`}
                  >
                    <option value="">Select Type</option>
                    <option value="Container">Container</option>
                    <option value="Pallet">Pallet</option>
                    <option value="Chest">Chest</option>
                    <option value="Unit">Unit</option>
                    <option value="Conventional">Conventional</option>
                    <option value="Archive">Archive</option>
                    <option value="Distributed Storage">
                      Distributed Storage
                    </option>
                  </select>
                )}
              />
              {errors.storageType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.storageType.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Volume Capacity (m³) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="cubicMeter"
                control={control}
                defaultValue=""
                rules={{ required: 'Capacity is required' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min={0}
                    onKeyDown={(e) => {
                      if (e.key === '+' || e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="e.g. 25"
                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                      errors.cubicMeter ? 'border-red-500' : 'border-slate-300 focus:border-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800`}
                  />
                )}
              />
              {errors.cubicMeter && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.cubicMeter.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ownership
              </label>
              <div className="flex gap-2">
                <Controller
                  name="selfOwned"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(true)}
                      className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                        field.value 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Self Owned
                    </button>
                  )}
                />
                <Controller
                  name="selfOwned"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(false)}
                      className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                        !field.value 
                          ? 'bg-primary text-white border-primary shadow-xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Rented
                    </button>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Warehouse <span className="text-red-500">*</span>
              </label>
              <Controller
                name="warehouse"
                control={control}
                defaultValue=""
                rules={{ required: 'Warehouse is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                      errors.warehouse ? 'border-red-500' : 'border-slate-300 focus:border-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800`}
                  >
                    <option value="">Select Warehouse</option>
                    {warehousefilter &&
                      warehousefilter.map((item: any) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                )}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.warehouse.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Storage Location <span className="text-red-500">*</span>
              </label>
              <Controller
                name="storageLocation"
                control={control}
                defaultValue=""
                rules={{ required: 'Location is required' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                      errors.storageLocation ? 'border-red-500' : 'border-slate-300 focus:border-primary'
                    } rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-slate-800`}
                  >
                    <option value="">Select Storage Location</option>
                    {storageLocation &&
                      storageLocation.map((item: any) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                )}
              />
              {errors.storageLocation && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.storageLocation.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-opacity-90 shadow-sm shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer"
            >
              {data ? 'Update Storage' : 'Create Storage'}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  );
};

export default StorageForm;
