import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Modal, Box } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import IconPicker from './IconPicker';
import {
  MdOutlineChair,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdBuild,
  MdScale,
  MdViewInAr,
  MdDriveFileRenameOutline,
  MdSave,
  MdWarningAmber
} from 'react-icons/md';

const FurnitureType: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalesGroup, setSelectedSalesGroup] = useState<any>(null);
  const [icons, setIcons] = useState<any[]>([]);
  const [iconFileName, setIconFileName] = useState<string | null>(null);

  const handleFileNameChange = (name: string) => {
    setIconFileName(name);
  };

  const openModal = (group: any) => {
    setSelectedSalesGroup(group);
    setModalOpen(true);
    if (!group) {
      reset({
        furnitureTypeName: '',
        price: '',
        icon: '',
        cubicMeter: '',
        weight: '',
        isDisassambled: false,
      });
    }
    if (group) {
      reset({
        furnitureTypeName: group?.furnitureTypeName,
        price: group?.price,
        icon: group?.icon,
        cubicMeter: group?.cubicMeter,
        weight: group?.weight,
        isDisassambled: group?.isDisassambled || false,
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
      const response = await axios.get(`${apiPath}/api/furniture`);
      setData(response.data || []);
    } catch (err: any) {
      notifyError(`Failed to fetch furniture items: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    if ((formData.furnitureTypeName || '').trim() === '') {
      notifyError('Furniture type name is required');
      return;
    }
    if (
      formData.furnitureTypeName.length > 55 ||
      formData.furnitureTypeName.length < 2
    ) {
      notifyError('Furniture type name must be between 2 and 55 characters');
      return;
    }
    if (formData.cubicMeter === '' || formData.cubicMeter <= 0) {
      notifyError('Area in cubic meter (m³) must be a positive number');
      return;
    }
    const numberPattern = /^\d*\.?\d*$/;
    if (!numberPattern.test(formData.cubicMeter)) {
      notifyError('Area in cubic meter must be a valid number');
      return;
    }

    setSaving(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(
          `${apiPath}/api/furniture/${selectedSalesGroup._id}`,
          { formData, iconFileName: iconFileName || '' },
        );
        notify('Furniture item updated successfully');
      } else {
        await axios.post(`${apiPath}/api/furniture`, {
          ...formData,
          type: 'furniture',
          iconFileName: iconFileName || '',
        });
        notify('New furniture item saved successfully');
      }
      closeModal();
      fetchSalesGroups();
    } catch (error: any) {
      notifyError(`Failed to save: ${error?.response?.data?.error || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteSalesGroup = async () => {
    if (!selectedSalesGroup) return;
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/furniture/${selectedSalesGroup._id}`);
      closeDeleteModal();
      notify('Furniture item deleted successfully');
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

  const filteredItems = data.filter((item: any) =>
    (item.furnitureTypeName || '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

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
            placeholder="Search furniture items by name..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => openModal(null)}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer self-start sm:self-auto text-xs sm:text-sm"
        >
          <MdAdd className="text-lg" />
          <span>New Furniture</span>
        </button>
      </div>

      {/* Furniture Table Card */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Icon</th>
                <th className="py-3.5 px-5">Furniture Item</th>
                <th className="py-3.5 px-5">Volume (m³)</th>
                <th className="py-3.5 px-5">Weight</th>
                <th className="py-3.5 px-5">Disassembly</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No furniture items found. Click "New Furniture" to create one.
                  </td>
                </tr>
              ) : (
                filteredItems.map((group: any) => (
                  <tr
                    key={group._id}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    {/* Icon */}
                    <td className="py-3.5 px-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 overflow-hidden text-primary shrink-0">
                        {group?.icon ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"
                            dangerouslySetInnerHTML={{ __html: group.icon }}
                          />
                        ) : (
                          <MdOutlineChair className="text-xl" />
                        )}
                      </div>
                    </td>

                    {/* Name */}
                    <td
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors"
                      onClick={() => openModal(group)}
                    >
                      {group.furnitureTypeName || 'Unnamed Item'}
                    </td>

                    {/* Volume */}
                    <td className="py-3.5 px-5 font-semibold text-black dark:text-white">
                      {group.cubicMeter || 0} m³
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-5 text-body dark:text-bodydark">
                      {group.weight ? `${group.weight} kg` : '—'}
                    </td>

                    {/* Disassembly */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          group.isDisassambled
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50'
                            : 'bg-gray-2 dark:bg-meta-4 text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark'
                        }`}
                      >
                        {group.isDisassambled ? 'Required' : 'None'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(group)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(group)}
                          className="p-2 text-slate-500 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Item"
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

      {/* New / Edit Furniture Modal */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stroke dark:border-strokedark relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
            >
              <MdClose className="text-xl" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 mb-5 border-b border-stroke dark:border-strokedark pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                <MdOutlineChair />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {selectedSalesGroup ? 'Edit Furniture Item' : 'Add Furniture Item'}
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Define volume calculations and disassembly parameters
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
                  Furniture Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('furnitureTypeName', {
                    required: 'Furniture name is required',
                  })}
                  placeholder="e.g. 3-Seater Leather Sofa"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                {errors.furnitureTypeName && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.furnitureTypeName.message as string}
                  </p>
                )}
              </div>

              {/* Volume & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                    <MdViewInAr className="text-slate-400 text-sm" />
                    Volume in m³ <span className="text-meta-1">*</span>
                  </label>
                  <input
                    {...register('cubicMeter', {
                      required: 'Volume in cubic meters is required',
                    })}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.85"
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                  {errors.cubicMeter && (
                    <p className="text-meta-1 text-xs mt-1">
                      {errors.cubicMeter.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                    <MdScale className="text-slate-400 text-sm" />
                    Approx Weight (kg)
                  </label>
                  <input
                    {...register('weight', {
                      valueAsNumber: true,
                    })}
                    type="number"
                    step="0.5"
                    placeholder="e.g. 45"
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                </div>
              </div>

              {/* Disassembly Toggle */}
              <div className="bg-gray-2/60 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
                <label className="block text-xs font-bold text-black dark:text-white mb-2 flex items-center gap-1.5">
                  <MdBuild className="text-primary text-sm" />
                  Requires Disassembly & Re-assembly?
                </label>
                <Controller
                  name="isDisassambled"
                  control={control}
                  defaultValue={false}
                  render={({ field }) => (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange(true)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          field.value === true
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark hover:bg-slate-50'
                        }`}
                      >
                        Yes (Disassembly Needed)
                      </button>
                      <button
                        type="button"
                        onClick={() => field.onChange(false)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          field.value === false
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-300 border-stroke dark:border-strokedark hover:bg-slate-50'
                        }`}
                      >
                        No (Move As-Is)
                      </button>
                    </div>
                  )}
                />
              </div>

              {/* Icon Picker */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Furniture Representation Icon
                </label>
                <IconPicker
                  setValue={setValue}
                  register={register}
                  icons={icons}
                  control={control}
                  errors={errors}
                  selectedSalesGroup={selectedSalesGroup}
                  onFileNameChange={handleFileNameChange}
                />
              </div>

              {/* Action Buttons */}
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
                  {saving ? 'Saving...' : selectedSalesGroup ? 'Update Item' : 'Add Item'}
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
                Delete Furniture Item
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-black dark:text-white">
                  "{selectedSalesGroup?.furnitureTypeName}"
                </span>
                ? This item will be removed from all room catalogues.
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

export default FurnitureType;

