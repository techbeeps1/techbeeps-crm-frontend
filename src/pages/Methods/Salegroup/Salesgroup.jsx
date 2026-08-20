import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { Modal, Box } from '@mui/material';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import {
  MdGroups,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdDriveFileRenameOutline,
  MdSave,
  MdWarningAmber
} from 'react-icons/md';

const Salesgroup = () => {
  const { register, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalesGroup, setSelectedSalesGroup] = useState(null);

  const openModal = (group = null) => {
    setSelectedSalesGroup(group);
    setModalOpen(true);
    if (group) {
      reset({ name: group.name });
    } else {
      reset({ name: '' });
    }
  };

  const notify = (message) => toast.success(message);
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSalesGroup(null);
    reset();
  };

  const openDeleteModal = (group) => {
    setSelectedSalesGroup(group);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const fetchSalesGroups = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/sale_group?type=salesGroup`,
      );
      setData(response.data || []);
    } catch (err) {
      notifyError(`Failed to fetch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    if ((formData.name || '').trim() === '') {
      notifyError('Sales group name is required');
      return;
    }
    setSaving(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(
          `${apiPath}/api/sale_group/${selectedSalesGroup._id}`,
          formData,
        );
        notify('Sales group updated successfully');
      } else {
        await axios.post(`${apiPath}/api/sale_group`, {
          ...formData,
          type: 'salesGroup',
        });
        notify('New sales group created successfully');
      }
      closeModal();
      fetchSalesGroups();
    } catch (error) {
      notifyError(`Failed to save: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteSalesGroup = async () => {
    if (!selectedSalesGroup) return;
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/sale_group/${selectedSalesGroup._id}`);
      closeDeleteModal();
      notify('Sales group deleted successfully');
      fetchSalesGroups();
    } catch (error) {
      notifyError(`Error deleting: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesGroups();
  }, []);

  const filteredGroups = data.filter((group) =>
    (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Search sales groups..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer self-start sm:self-auto text-xs sm:text-sm"
        >
          <MdAdd className="text-lg" />
          <span>New Sales Group</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Group Name</th>
                <th className="py-3.5 px-5">Group Scope</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No sales groups found. Click "New Sales Group" to create one.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr
                    key={group._id}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    {/* Name */}
                    <td
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2.5"
                      onClick={() => openModal(group)}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base shrink-0">
                        <MdGroups />
                      </div>
                      <span>{group.name || 'Unnamed Group'}</span>
                    </td>

                    {/* Scope */}
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-2 dark:bg-meta-4 text-slate-700 dark:text-slate-200 border border-stroke dark:border-strokedark">
                        Sales Division
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openModal(group)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Group"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(group)}
                          className="p-2 text-slate-500 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Group"
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

      {/* New / Edit Modal */}
      <Modal open={isModalOpen} onClose={closeModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stroke dark:border-strokedark relative">
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
                <MdGroups />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  {selectedSalesGroup ? 'Edit Sales Group' : 'New Sales Group'}
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Organize leads and quotation pipelines
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
                  Sales Group Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('name', { required: true })}
                  placeholder="e.g. Residential Moves Division"
                  defaultValue={selectedSalesGroup?.name || ''}
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
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
                  {saving ? 'Saving...' : selectedSalesGroup ? 'Update Group' : 'Create Group'}
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
                Delete Sales Group
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to delete sales group{' '}
                <span className="font-bold text-black dark:text-white">
                  "{selectedSalesGroup?.name}"
                </span>
                ?
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

export default Salesgroup;

