import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Modal, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import IconPicker from './IconPicker';
import {
  MdOutlineDesignServices,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdAttachMoney,
  MdCategory,
  MdDriveFileRenameOutline,
  MdSave,
  MdWarningAmber
} from 'react-icons/md';

const ServicePage: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm();
  const [data, setData] = useState<any[]>([]);
  const [removeicon, setremoveIcon] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalesGroup, setSelectedSalesGroup] = useState<any>(null);

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
      setData(response.data || []);
    } catch (err: any) {
      notifyError(`Failed to fetch services: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    setSaving(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(
          `${apiPath}/api/services/${selectedSalesGroup._id}`,
          formData,
        );
        notify('Service updated successfully');
      } else {
        await axios.post(`${apiPath}/api/services`, {
          ...formData,
          type: 'service',
        });
        notify('New service created successfully');
      }
      closeModal();
      fetchSalesGroups();
    } catch (error: any) {
      notifyError(`Error saving service: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteSalesGroup = async () => {
    if (!selectedSalesGroup) return;
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/services/${selectedSalesGroup._id}`);
      notify('Service deleted successfully');
      closeDeleteModal();
      fetchSalesGroups();
    } catch (error: any) {
      notifyError(`Error deleting: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesGroups();
  }, []);

  const filteredServices = data.filter((item: any) => {
    const query = searchTerm.toLowerCase();
    return (
      (item.serviceName || '').toLowerCase().includes(query) ||
      (item.serviceTypeName || '').toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {loading && <Loader />}

      {/* Action & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-2/70 dark:bg-meta-4/20 p-4 rounded-2xl border border-stroke dark:border-strokedark">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xl" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services by name or category..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => openModal(null)}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer self-start sm:self-auto text-xs sm:text-sm"
        >
          <MdAdd className="text-lg" />
          <span>New Service</span>
        </button>
      </div>

      {/* Service Table Card */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Icon</th>
                <th className="py-3.5 px-5">Service Name</th>
                <th className="py-3.5 px-5">Category / Type</th>
                <th className="py-3.5 px-5">Rate / Fee</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No services found. Click "New Service" to create one.
                  </td>
                </tr>
              ) : (
                filteredServices.map((group: any) => (
                  <tr
                    key={group._id}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="w-10 h-10 rounded-xl bg-gray-2 dark:bg-meta-4/30 border border-stroke dark:border-strokedark flex items-center justify-center p-1.5 overflow-hidden text-black dark:text-white shrink-0">
                        {group?.icon ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-black dark:text-white"
                            dangerouslySetInnerHTML={{ __html: group.icon }}
                          />
                        ) : (
                          <MdOutlineDesignServices className="text-xl text-black dark:text-white" />
                        )}
                      </div>
                    </td>

                    <td
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors"
                      onClick={() => openModal(group)}
                    >
                      {group.serviceName || 'Unnamed Service'}
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-2 dark:bg-meta-4 text-slate-700 dark:text-slate-200 border border-stroke dark:border-strokedark">
                        {group.serviceTypeName || 'Standard'}
                      </span>
                    </td>

                    <td className="py-3.5 px-5">
                      <span className="font-extrabold text-black dark:text-white text-sm">
                        ${group.price || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(group)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Service"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(group)}
                          className="p-2 text-slate-500 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Service"
                        >
                          <MdDeleteOutline className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New / Edit Service Modal */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stroke dark:border-strokedark relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
            >
              <MdClose className="text-xl" />
            </button>

            <div className="flex items-center gap-3 mb-5 border-b border-stroke dark:border-strokedark pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                <MdOutlineDesignServices />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {selectedSalesGroup ? 'Edit Service Offering' : 'Create New Service'}
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Define service pricing and customer catalogue icon
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
                  Service Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('serviceName', {
                    required: 'Service Name is required',
                  })}
                  placeholder="e.g. Premium Moving Lift Support"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                {errors.serviceName && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.serviceName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdCategory className="text-slate-400 text-sm" />
                  Service Type / Category <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('serviceTypeName', {
                    required: 'Service Type is required',
                  })}
                  placeholder="e.g. Lifting & Heavy Transport"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                {errors.serviceTypeName && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.serviceTypeName.message as string}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdAttachMoney className="text-slate-400 text-sm" />
                  Service Charge Amount ($) <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('price', {
                    required: 'Service Charge Amount is required',
                    valueAsNumber: true,
                  })}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                {errors.price && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.price.message as string}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Service Representation Icon
                </label>
                {selectedSalesGroup && !removeicon && selectedSalesGroup?.icon ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-2 dark:bg-meta-4/30 rounded-xl border border-stroke dark:border-strokedark">
                    <div
                      className="w-12 h-12 bg-white dark:bg-boxdark rounded-lg border border-stroke dark:border-strokedark p-2 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-black dark:text-white"
                      dangerouslySetInnerHTML={{
                        __html: selectedSalesGroup.icon,
                      }}
                    />
                    <div>
                      <p className="text-xs font-semibold text-black dark:text-white">
                        Current SVG Icon Assigned
                      </p>
                      <button
                        type="button"
                        onClick={() => setremoveIcon(true)}
                        className="text-xs text-primary font-bold hover:underline mt-0.5 cursor-pointer"
                      >
                        Change Icon
                      </button>
                    </div>
                  </div>
                ) : (
                  <IconPicker
                    setValue={setValue}
                    register={register}
                    control={control}
                    errors={errors}
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stroke dark:border-strokedark">
                <button
                  type="button"
                  onClick={closeModal}
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
                  {saving ? 'Saving...' : selectedSalesGroup ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stroke dark:border-strokedark space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-2xl bg-meta-1/10 text-meta-1 flex items-center justify-center text-2xl">
              <MdWarningAmber />
            </div>
            <div>
              <h4 className="text-lg font-bold text-black dark:text-white">
                Delete Service
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to delete service{' '}
                <span className="font-bold text-black dark:text-white">
                  "{selectedSalesGroup?.serviceName || selectedSalesGroup?.serviceTypeName}"
                </span>
                ? This will remove it from future quotation packages.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteSalesGroup}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-meta-1 hover:bg-opacity-90 text-white shadow-md shadow-meta-1/25 transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ServicePage;
