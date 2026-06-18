import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';

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

  const storageHandlers = async (data: any) => {
    setLoading(true);
    let path = `${apiPath}/api/storages`;
    if (data._id) {
      path = `${path}/${data?._id}`;
    }
    if (data.storageCode.trim() === '') {
      notifyError('Storage number is required');
      setLoading(false);
      return;
    } else if (data.storageCode.length > 50 || data.storageCode.length < 2) {
      notifyError('Storage number must be between 2 and 50 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(path, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 201 || response.status === 200) {
        notify('Request successfully!');
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
      console.log(response.data, 'storage location');
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
      <Button
        onClick={handleOpen}
        variant="contained"
        size={`${data ? 'small' : 'large'}`}
      >
        {data ? 'Edit' : 'New Storage'}
      </Button>
      <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
        {loading && <Loader />}
        <DialogTitle className="flex justify-between items-center">
          <span
            className="font-semibold text-primary mb-1 mt-4"
            style={{ fontSize: '28px' }}
          >
            {data ? 'Update' : 'Add New'} Storage
          </span>
          <IconButton onClick={handleCancel}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: '16px' }}>
          <p className="mb-8">
            You can add storage here, it is also possible to fill in the form
            below.
          </p>
          {loading && <Loader />}
          <div className="w-full">
            <div className="mb-3">
              <label className="block text-md font-medium pb-2">
                Storage Number*
              </label>
              <Controller
                name="storageCode"
                control={control}
                defaultValue=""
                rules={{ required: 'field is a required field' }}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Storage Number"
                    className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.storageCode && (
                <p className="text-red-500 text-sm">
                  {errors.storageCode.message}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-md font-medium pb-2">Type*</label>
              <Controller
                name="storageType"
                control={control}
                defaultValue=""
                rules={{ required: 'field is a required field' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <p className="text-red-500 text-sm">
                  {errors.storageType.message}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-md font-medium pb-2">
                Contents*
              </label>
              <Controller
                name="cubicMeter"
                control={control}
                defaultValue=""
                rules={{ required: 'contents is a required field' }}
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
                    placeholder="Contents"
                    className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              />
              {errors.cubicMeter && (
                <p className="text-red-500 text-sm">
                  {errors.cubicMeter.message}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-md font-medium pb-1">
                Is the Storage is Your own possession?
              </label>
              <div className="flex gap-4">
                <Controller
                  name="selfOwned"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      {...field}
                      onClick={() => field.onChange(true)} // Set elevator to true
                      className={`px-10 shadow py-3 w-full border border-gray rounded ${field.value ? 'bg-blue text-white' : 'bg-white'}`}
                    >
                      In Own Possession
                    </button>
                  )}
                />
                <Controller
                  name="selfOwned"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      {...field}
                      onClick={() => field.onChange(false)} // Set elevator to false
                      className={`px-10 py-3 shadow border border-gray rounded w-full ${!field.value ? 'bg-blue text-white' : 'bg-white'}`}
                    >
                      Rented
                    </button>
                  )}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-md font-medium pb-2">
                Warehouse*
              </label>
              <Controller
                name="warehouse"
                control={control}
                defaultValue=""
                rules={{ required: 'warehouse is a required field' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              {errors.warehousefilter && (
                <p className="text-red-500 text-sm">
                  {errors.warehousefilter.message}
                </p>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-md font-medium pb-2">
                Storage Location*
              </label>
              <Controller
                name="storageLocation"
                control={control}
                defaultValue=""
                rules={{ required: 'storage location is a required field' }}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select storage Location</option>
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
                <p className="text-red-500 text-sm">
                  {errors.storageLocation.message}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
        <DialogActions>
          <div className="flex gap-3 p-4 pe-6">
            <Button onClick={handleCancel} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              variant="contained"
              color="primary"
            >
              {data ? 'Submit' : 'Submit'}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default StorageForm;
