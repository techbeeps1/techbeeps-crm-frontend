import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { Dialog } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import Loader from '../../../common/Loader';
import { toast } from 'react-toastify';
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdLayers,
  MdWarningAmber,
  MdSave,
} from 'react-icons/md';

interface SalesGroup {
  _id: string;
  name: string;
  code: string | number;
}

interface FormData {
  name: string;
  code: string;
}

const InputHander: React.FC<{ type: string }> = ({ type }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();
  const [data, setData] = useState<SalesGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedSalesGroup, setSelectedSalesGroup] = useState<SalesGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const openModal = (group: SalesGroup | null = null) => {
    setSelectedSalesGroup(group);
    setModalOpen(true);
    if (group) {
      reset({ name: group.name, code: String(group.code || '') });
    } else {
      reset({ name: '', code: '' });
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

  const openDeleteModal = (group: SalesGroup) => {
    setSelectedSalesGroup(group);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const fetchSalesGroups = async () => {
    setLoading(true);
    try {
      const response = await axios.get<SalesGroup[]>(
        `${apiPath}/api/sale_group?type=${type}`
      );
      setData(response.data || []);
    } catch (err: any) {
      notifyError(`Failed to fetch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    setLoading(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(
          `${apiPath}/api/sale_group/${selectedSalesGroup._id}`,
          formData
        );
        notify(`${type} item updated successfully`);
      } else {
        await axios.post(`${apiPath}/api/sale_group`, { ...formData, type: type });
        notify(`${type} item added successfully`);
      }
      closeModal();
      fetchSalesGroups();
    } catch (err: any) {
      notifyError(`Failed to save: ${err?.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesGroup = async () => {
    if (!selectedSalesGroup) return;
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/sale_group/${selectedSalesGroup._id}`);
      closeDeleteModal();
      notify(`${type} item deleted successfully`);
      fetchSalesGroups();
    } catch (err: any) {
      notifyError(`Error deleting: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesGroups();
    return () => setData([]);
  }, [type]);

  const filteredData = data.filter((item) =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (String(item.code || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTitle = () => {
    switch (type) {
      case 'country':
        return 'Country Directory';
      case 'Skill':
        return 'Staff Skills & Qualifications';
      case 'Licence':
        return 'Driving Licences';
      case 'tax':
        return 'Tax (VAT) Brackets';
      case 'property':
        return 'Property Classifications';
      default:
        return `${type} Management`;
    }
  };

  return (
    <div className="space-y-6">
      {loading && <Loader />}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white capitalize">
            {getTitle()}
          </h3>
          <p className="text-xs text-body dark:text-bodydark">
            Manage system options, lookup tables, and preset categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2 pl-9 pr-4 outline-none focus:border-primary text-xs w-48 sm:w-60 shadow-xs"
            />
            <MdSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
          </div>

          {/* Add Button */}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-1.5 bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-xl shadow-md shadow-primary/25 transition-all text-xs cursor-pointer shrink-0"
          >
            <MdAdd className="text-base" />
            <span>Add New {type}</span>
          </button>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-5">Name / Title</th>
                {type === 'country' && <th className="py-3 px-5">Country Code</th>}
                {type === 'tax' && <th className="py-3 px-5">Tax Percentage</th>}
                <th className="py-3 px-5 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-xs">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={type === 'country' || type === 'tax' ? 3 : 2}
                    className="py-12 text-center text-body dark:text-bodydark text-xs"
                  >
                    No {type} records found. Click "Add New {type}" to create one.
                  </td>
                </tr>
              ) : (
                filteredData.map((group) => (
                  <tr
                    key={group._id}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    <td
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors"
                      onClick={() => openModal(group)}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm shrink-0 font-bold">
                          {group.name?.charAt(0).toUpperCase() || '•'}
                        </div>
                        <span>{group.name}</span>
                      </div>
                    </td>

                    {type === 'country' && (
                      <td className="py-3.5 px-5 font-semibold text-slate-600 dark:text-slate-300">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-meta-4 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                          {group.code || '—'}
                        </span>
                      </td>
                    )}

                    {type === 'tax' && (
                      <td className="py-3.5 px-5 font-bold text-primary">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                          {group.code}%
                        </span>
                      </td>
                    )}

                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openModal(group)}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(group)}
                          className="p-1.5 text-slate-400 hover:text-meta-1 hover:bg-meta-1/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
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

      {/* Add / Edit Modal Dialog */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className:
            'rounded-2xl dark:bg-boxdark border border-stroke dark:border-strokedark shadow-2xl overflow-hidden',
        }}
      >
        <div className="p-6 sm:p-7 relative">
          <button
            type="button"
            onClick={closeModal}
            className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>

          <div className="flex items-center gap-3 mb-6 border-b border-stroke dark:border-strokedark pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
              <MdLayers />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                {selectedSalesGroup ? `Edit ${type}` : `Add New ${type}`}
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Configure classification details and parameters
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5 capitalize">
                {type} Name <span className="text-meta-1">*</span>
              </label>
              <input
                {...register('name', { required: `${type} name is required` })}
                placeholder={`Enter ${type} name`}
                defaultValue={selectedSalesGroup?.name || ''}
                className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
              />
              {errors.name && (
                <p className="text-meta-1 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {type === 'country' && (
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Country Code <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('code', { required: 'Country code is required' })}
                  placeholder="e.g. NL, US, DE"
                  defaultValue={selectedSalesGroup?.code || ''}
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium uppercase font-mono"
                />
                {errors.code && (
                  <p className="text-meta-1 text-xs mt-1">{errors.code.message}</p>
                )}
              </div>
            )}

            {type === 'tax' && (
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Tax Rate (%) <span className="text-meta-1">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register('code', {
                      required: 'Tax percentage is required',
                      valueAsNumber: true,
                      validate: (value: any) =>
                        value >= 0 || 'Value must be non-negative',
                    })}
                    placeholder="e.g. 21"
                    type="number"
                    min={0}
                    defaultValue={selectedSalesGroup?.code || ''}
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 pr-10 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                  <span className="absolute right-3.5 top-2.5 text-slate-400 font-bold text-sm">
                    %
                  </span>
                </div>
                {errors.code && (
                  <p className="text-meta-1 text-xs mt-1">{errors.code.message}</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer"
              >
                <MdSave className="text-base" />
                {selectedSalesGroup ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal Dialog */}
      <Dialog
        open={isDeleteModalOpen}
        onClose={closeDeleteModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          className:
            'rounded-2xl dark:bg-boxdark border border-stroke dark:border-strokedark shadow-2xl overflow-hidden',
        }}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-meta-1/10 text-meta-1 flex items-center justify-center text-3xl mx-auto mb-4">
            <MdWarningAmber />
          </div>

          <h3 className="text-base font-bold text-black dark:text-white mb-2">
            Confirm Item Deletion
          </h3>
          <p className="text-xs text-body dark:text-bodydark mb-6">
            Are you sure you want to delete the {type} item{' '}
            <strong className="text-black dark:text-white font-bold">
              "{selectedSalesGroup?.name}"
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={closeDeleteModal}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={deleteSalesGroup}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-meta-1 hover:bg-opacity-90 text-white shadow-md shadow-meta-1/25 transition-all cursor-pointer"
            >
              Delete Item
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InputHander;


