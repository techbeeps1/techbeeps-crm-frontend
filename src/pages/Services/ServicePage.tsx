import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Button, Modal, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import IconPicker from './IconPicker';

const ServicePage: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const [data, setData] = useState([]);
  const [removeicon, setremoveIcon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalesGroup, setSelectedSalesGroup] = useState<any>(null);
  const [icons, setIcons] = useState<any[]>([]);

  const openModal = (group: any) => {
    setSelectedSalesGroup(group);
    setremoveIcon(false);
    setModalOpen(true);
    if (!group) {
      reset({ serviceName: '', serviceTypeName: '', price: '', icon: '' });
    }
    if (group) {
      reset({
        serviceName: group?.serviceName,
        serviceTypeName: group?.serviceTypeName,
        price: group?.price,
        icon: group?.icon,
      });
    }
  };
  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSalesGroup(null);
    reset();
  };

  const openDeleteModal = (group: any) => {
    setSelectedSalesGroup(group);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const fetchSalesGroups = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/services`);
      const table = $('#services').DataTable();
      if (table) {
        table.destroy();
      }
      setData(response.data);
      setTimeout(() => {
        $('#services').DataTable();
      }, 0);
    } catch (err: any) {
      notifyError(`Failed to fetch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchIcons = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/icons`);
      setIcons(response.data);
    } catch (err: any) {
      notifyError(`Failed to fetch icons: ${err.message}`);
    }
  };

  const onSubmit = async (formData: any) => {
    setLoading(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(
          `${apiPath}/api/services/${selectedSalesGroup._id}`,
          formData,
        );
        notify('item updated successfully');
      } else {
        await axios.post(`${apiPath}/api/services`, {
          ...formData,
          type: 'service',
        });
        notify('item saved successfully');
      }
      closeModal();
      fetchSalesGroups();
    } catch (error: any) {
      console.log('error', error);
      notifyError(`${error?.response?.data?.error}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesGroup = async () => {
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/services/${selectedSalesGroup._id}`);
      closeDeleteModal();
      notify('item Delete successfully');
      fetchSalesGroups();
    } catch (error: any) {
      notifyError(`Error deleting : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesGroups();
    fetchIcons();
  }, []);

  return (
    <div>
      {loading && <Loader />}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => openModal(null)}
        style={{ marginBottom: '20px' }}
      >
        New Service
      </Button>

      <table id="services" className="w-full">
        <thead>
          <tr>
            <th className="border-b">Name</th>
            <th className="border-b">Service Charge</th>
            <th className="border-b">Icon</th>
            <th className="border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((group: any) => (
              <tr key={group._id}>
                <td
                  className="border-b cursor-pointer p-0 text-lg font-medium"
                  onClick={() => openModal(group)}
                >
                  {group.serviceName}
                </td>
                <td
                  className="border-b cursor-pointer p-0 text-lg font-medium"
                  onClick={() => openModal(group)}
                >
                  {group.price} $
                </td>
                <td
                  className="border-b cursor-pointer p-0"
                  onClick={() => openModal(group)}
                >
                  <div
                    style={{
                      width: '35px',
                      height: '35px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                      padding: '2px',
                    }}
                    dangerouslySetInnerHTML={{ __html: group?.icon }}
                  />
                </td>
                <td className="border-b p-0 flex gap-4">
                  <IconButton onClick={() => openDeleteModal(group)}>
                    <DeleteIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <Modal open={isModalOpen} onClose={closeModal}>
        <div className="flex items-center justify-center min-h-screen text-black">
          <div className="text-lg bg-white px-6 py-4 rounded shadow-md max-w-lg w-full mx-auto">
            <IconButton
              onClick={closeModal}
              className="absolute top-0"
              style={{ left: '92%' }}
            >
              <CloseIcon />
            </IconButton>
            <Typography
              variant="h5"
              component="h2"
              marginTop={-4}
              paddingBottom={2}
              color={'blue'}
            >
              {selectedSalesGroup ? 'Edit Service' : 'New Service'}
            </Typography>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6 overflow-auto p-1"
            >
              <div className="flex flex-col">
                <label htmlFor="serviceName" className="font-medium mb-2">
                  Service Name *
                </label>
                <input
                  {...register('serviceName', {
                    required: 'Service Name is required',
                  })}
                  id="serviceName"
                  type="text"
                  placeholder="Enter service name"
                  className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue ${
                    errors.serviceName ? 'border-red-500' : 'border-gray'
                  }`}
                />
                {errors.serviceName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.serviceName.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="serviceTypeName" className="font-medium mb-2">
                  Service Type *
                </label>
                <input
                  {...register('serviceTypeName', {
                    required: 'Service Name is required',
                  })}
                  id="serviceTypeName"
                  type="text"
                  placeholder="Enter service type"
                  className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue ${
                    errors.serviceTypeName ? 'border-red-500' : 'border-gray'
                  }`}
                />
                {/* <select
                                    {...register('serviceTypeName', {
                                        required: 'Service Type is required',
                                    })}
                                    id="serviceTypeName"
                                    className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300 ${errors.serviceTypeName ? 'border-red-500' : 'border-gray'
                                        }`}
                                >
                                    <option value="" disabled>
                                        Select a service type
                                    </option>
                                    <option value="movingLift">Moving Lift</option>
                                    <option value="certificate">Warranty Certificate</option>
                                    <option value="movingPackage">Moving Package</option>
                                    <option value="packing">Packing</option>
                                    <option value="unpacking">Unpacking</option>
                                    <option value="assembling">Assembling</option>
                                    <option value="disassembling">Disassembling</option>
                                    <option value="storage">Storage</option>
                                    <option value="insurance">Insurance</option>
                                </select> */}

                {errors.serviceTypeName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.serviceTypeName.message}
                  </p>
                )}
              </div>

              {/* Service Charge Amount */}
              <div className="flex flex-col">
                <label htmlFor="price" className="font-medium mb-2">
                  Service Charge Amount
                </label>
                <input
                  {...register('price', {
                    required: 'Service Charge Amount is required',
                    valueAsNumber: true,
                  })}
                  id="price"
                  type="number"
                  placeholder="Enter service charge amount"
                  className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue ${
                    errors.price ? 'border-red-500' : 'border-gray'
                  }`}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Service Icon */}
              {  selectedSalesGroup && !removeicon ? 
              <div className="flex flex-col ">
              
                  <label htmlFor="price" className="font-medium mb-2">
                    Icon
                  </label>
                    <div className='flex gap-2'>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                      padding: '2px',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: selectedSalesGroup?.icon,
                    }}
                  />
                  
                  <div className='flex items-center cursor-pointer text-blue'
                    onClick={() => setremoveIcon(true)}
                  >
                {' Change '}
                  </div>
                </div>
              </div>
            : <div className="">
                <IconPicker
                  setValue={setValue}
                  register={register}
                  icons={icons}
                  control={control}
                  errors={errors}
                />
              </div>
}
              {/* Submit Button */}
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-primary border border-1 uppercase border-success shadow-lg text-white font-medium px-6 py-1 rounded hover:bg-blue focus:outline-none"
                >
                  {selectedSalesGroup ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <div className="flex items-center justify-center min-h-screen">
          <Box className="bg-white p-10 rounded shadow-md max-w-md mx-auto">
            <div className="flex justify-between mb-5">
              <Typography variant="h5" component="h2" color={'blue'}>
                Confirm Delete
              </Typography>
              <IconButton onClick={closeDeleteModal}>
                <CloseIcon />
              </IconButton>
            </div>
            <Typography marginBottom={2} variant="h6">
              Are you sure you want to delete the item that named "
              {selectedSalesGroup?.serviceTypeName}"?
            </Typography>
            <Box className="flex justify-end" style={{ gap: '10px' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={deleteSalesGroup}
              >
                Yes
              </Button>
              <Button variant="outlined" onClick={closeDeleteModal}>
                No
              </Button>
            </Box>
          </Box>
        </div>
      </Modal>
    </div>
  );
};

export default ServicePage;
