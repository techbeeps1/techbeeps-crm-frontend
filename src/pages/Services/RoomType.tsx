import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Modal, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { FurnitureDrawer } from './FurnitureDrawer';
import IconPicker from './IconPicker';
import {
  MdOutlineMeetingRoom,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdChair,
  MdDriveFileRenameOutline,
  MdSave,
  MdWarningAmber
} from 'react-icons/md';

const RoomType: React.FC = () => {
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<any>(null);
  const [icons, setIcons] = useState<any[]>([]);
  const [furniture, setFurniture] = useState<any[]>([]);

  const openModal = (group: any) => {
    setSelectedSalesGroup(group);
    setremoveIcon(false);
    setModalOpen(true);
    if (!group) {
      reset({ roomTypeName: '', icon: null });
    }
    if (group) {
      reset({ roomTypeName: group?.roomTypeName, icon: group?.icon });
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
      const response = await axios.get(`${apiPath}/api/room`);
      setData(response.data || []);
    } catch (err: any) {
      notifyError(`Failed to fetch room types: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: any) => {
    if ((formData.roomTypeName || '').trim() === '') {
      notifyError('Room type name is required');
      return;
    }
    if (formData.roomTypeName.length > 55 || formData.roomTypeName.length < 2) {
      notifyError('Room type name must be between 2 and 55 characters');
      return;
    }
    setSaving(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(
          `${apiPath}/api/room/${selectedSalesGroup._id}`,
          formData,
        );
        notify('Room type updated successfully');
      } else {
        await axios.post(`${apiPath}/api/room`, {
          ...formData,
          type: 'room',
        });
        notify('Room type created successfully');
      }
      closeModal();
      fetchSalesGroups();
    } catch (error: any) {
      notifyError(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteSalesGroup = async () => {
    if (!selectedSalesGroup) return;
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/room/${selectedSalesGroup._id}`);
      closeDeleteModal();
      fetchSalesGroups();
      notify('Room type deleted successfully');
    } catch (error: any) {
      notifyError(`Error deleting: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchFurniture = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/furniture`);
      setFurniture(response.data || []);
    } catch (err: any) {
      notifyError(`Failed to fetch furniture: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchSalesGroups();
    fetchFurniture();
  }, []);

  const filteredRooms = data.filter((item: any) =>
    (item.roomTypeName || '').toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Search room classifications..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => openModal(null)}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer self-start sm:self-auto text-xs sm:text-sm"
        >
          <MdAdd className="text-lg" />
          <span>New Room Type</span>
        </button>
      </div>

      {/* Room Table Card */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Icon</th>
                <th className="py-3.5 px-5">Room Type Name</th>
                <th className="py-3.5 px-5">Furniture Inventory</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No room types found. Click "New Room Type" to create one.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((group: any) => (
                  <tr
                    key={group._id}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    {/* Icon Preview */}
                    <td className="py-3.5 px-5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center p-1.5 overflow-hidden text-primary shrink-0">
                        {group?.icon ? (
                          <div
                            className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current"
                            dangerouslySetInnerHTML={{ __html: group.icon }}
                          />
                        ) : (
                          <MdOutlineMeetingRoom className="text-xl" />
                        )}
                      </div>
                    </td>

                    {/* Room Name */}
                    <td
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors"
                      onClick={() => openModal(group)}
                    >
                      {group.roomTypeName || 'Unnamed Room'}
                    </td>

                    {/* Furniture Drawer Action */}
                    <td className="py-3.5 px-5">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(group)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <MdChair className="text-sm" />
                        Manage Furniture
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(group)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Room Type"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(group)}
                          className="p-2 text-slate-500 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Room Type"
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

      <FurnitureDrawer
        furniture={furniture}
        selectItem={isDrawerOpen}
        setSelectItem={setIsDrawerOpen}
      />

      {/* New / Edit Room Modal */}
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
                <MdOutlineMeetingRoom />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {selectedSalesGroup ? 'Edit Room Type' : 'Create Room Type'}
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Define standard room space category and inventory defaults
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Room Name */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
                  Room Type Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('roomTypeName', {
                    required: 'Room type is required',
                  })}
                  placeholder="e.g. Master Bedroom, Living Room, Kitchen"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                {errors.roomTypeName && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.roomTypeName.message as string}
                  </p>
                )}
              </div>

              {/* Room Icon */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Room Representation Icon
                </label>
                {selectedSalesGroup && !removeicon && selectedSalesGroup?.icon ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-2 dark:bg-meta-4/30 rounded-xl border border-stroke dark:border-strokedark">
                    <div
                      className="w-12 h-12 bg-white dark:bg-boxdark rounded-lg border border-stroke dark:border-strokedark p-2 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full text-primary"
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
                    icons={icons}
                    control={control}
                    errors={errors}
                  />
                )}
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
                  {saving ? 'Saving...' : selectedSalesGroup ? 'Update Room' : 'Create Room'}
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
                Delete Room Type
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to delete{' '}
                <span className="font-bold text-black dark:text-white">
                  "{selectedSalesGroup?.roomTypeName}"
                </span>
                ? This room category will be removed from inventory calculations.
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

export default RoomType;

