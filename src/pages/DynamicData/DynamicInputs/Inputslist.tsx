import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { Dialog } from '@mui/material';
import Inputfieldfrom from './Inputfieldfrom';
import {
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdDynamicForm,
  MdInfoOutline,
  MdWarningAmber,
  MdTextFields,
  MdFormatListBulleted,
} from 'react-icons/md';

const AppointmentType: React.FC<{ inputFor: string }> = ({ inputFor }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedStaff, setSelectedStaff] = useState<any>('');
  const [previous, setPrevious] = useState<any>('');
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesNames, setTemplatesName] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAllinputs = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/input?inputFor=${inputFor}`);
      setData(response.data || []);
      setSelectedStaff('');
    } catch (err) {
      setError('Failed to fetch input configurations. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`${apiPath}/api/input/${selectedStaff._id}`);
      if (response.status === 200) {
        handleAllinputs();
      }
    } catch (err) {
      console.error('Failed to delete input:', err);
    } finally {
      closeDeleteModal();
    }
  };

  const handleAlltemplates = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/templates`);
      setTemplatesName(response.data || []);
      const dataNames = data.map((item: any) => item.name);
      const filteredTemplates = (response.data || []).filter(
        (template: any) => !dataNames.includes(template._id)
      );
      setTemplates(filteredTemplates);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (data: any): void => {
    setEditModalOpen(true);
    setPrevious(data);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  useEffect(() => {
    handleAllinputs();
  }, [inputFor]);

  useEffect(() => {
    if (inputFor === 'Template') {
      handleAlltemplates();
    }
  }, [inputFor, data]);

  const filteredData = data.filter((item: any) => {
    const templateName =
      templatesNames &&
      templatesNames.find((template: any) => template._id === item.name)?.name;
    const displayName = templateName || item.name || '';
    return (
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.inputFor || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getDisplayName = (item: any) => {
    if (!item) return '';
    const templateName =
      templatesNames &&
      templatesNames.find((template: any) => template._id === item.name)?.name;
    return templateName || item.name || 'Unnamed Input';
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-semibold text-body dark:text-bodydark">
        Loading {inputFor} inputs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center text-xs font-semibold text-meta-1">
        {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
      {/* Left Column: Input Configurations Table */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-black dark:text-white">
                {inputFor} Custom Inputs
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Dynamic fields attached to {inputFor.toLowerCase()} workflows
              </p>
            </div>

            <button
              onClick={() => openEditModal(null)}
              className="flex items-center gap-1.5 bg-primary hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-xl shadow-md shadow-primary/25 transition-all text-xs cursor-pointer shrink-0"
            >
              <MdAdd className="text-base" />
              <span>New Input</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder={`Search ${inputFor} inputs...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-2/40 dark:bg-meta-4/20 text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2 pl-9 pr-4 outline-none focus:border-primary text-xs"
            />
            <MdSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
          </div>

          {/* Table */}
          <div className="border border-stroke dark:border-strokedark rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Input Name</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4 text-center">Fields</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark text-xs">
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 text-center text-body dark:text-bodydark text-xs"
                    >
                      No input fields configured yet. Click "New Input" to start.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item: any, index: number) => {
                    const isSelected = selectedStaff?._id === item._id;
                    const displayName = getDisplayName(item);
                    return (
                      <tr
                        key={index}
                        onClick={() => setSelectedStaff(item)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-primary/10 dark:bg-primary/20 border-l-4 border-l-primary font-bold'
                            : 'hover:bg-gray-2/40 dark:hover:bg-meta-4/20'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-black dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 font-bold ${
                                isSelected
                                  ? 'bg-primary text-white'
                                  : 'bg-primary/10 text-primary'
                              }`}
                            >
                              <MdTextFields />
                            </div>
                            <span className="truncate">{displayName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600 dark:text-slate-300">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-meta-4 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                            {item.inputFor}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-md bg-meta-3/10 text-meta-3 font-bold text-[11px]">
                            {item.extraFields?.length || 0} fields
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Column: Input Details Preview Pane */}
      <div className="lg:col-span-5">
        {selectedStaff ? (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-5 sm:p-6 shadow-xs space-y-5 sticky top-20">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stroke dark:border-strokedark">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                  <MdDynamicForm />
                </div>
                <div>
                  <h4 className="text-base font-bold text-black dark:text-white uppercase truncate">
                    {getDisplayName(selectedStaff)}
                  </h4>
                  <p className="text-[11px] text-body dark:text-bodydark">
                    Scope: {selectedStaff.inputFor}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="p-2 text-slate-400 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                  title="Delete Input Configuration"
                >
                  <MdDeleteOutline className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStaff('')}
                  className="p-2 text-slate-400 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-meta-4 rounded-xl transition-colors cursor-pointer"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>
            </div>

            {/* Spec details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark">
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  Configuration Name
                </p>
                <p className="text-xs font-bold text-black dark:text-white mt-1 truncate">
                  {getDisplayName(selectedStaff)}
                </p>
              </div>
              <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-xl border border-stroke dark:border-strokedark">
                <p className="text-[11px] font-bold text-slate-400 uppercase">
                  Target Scope
                </p>
                <p className="text-xs font-bold text-primary mt-1">
                  {selectedStaff?.inputFor}
                </p>
              </div>
            </div>

            {/* Dynamic fields list */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MdFormatListBulleted className="text-primary text-base" />
                <h5 className="text-xs font-bold text-black dark:text-white uppercase tracking-wider">
                  Configured Dynamic Fields (
                  {selectedStaff?.extraFields?.length || 0})
                </h5>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedStaff?.extraFields?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-gray-2/40 dark:bg-meta-4/20 p-3 rounded-xl border border-stroke dark:border-strokedark flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-bold text-black dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-[11px] font-mono text-slate-500">
                        name: {item.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-meta-4 text-[10px] font-semibold uppercase text-slate-700 dark:text-slate-300">
                        {item.type || 'text'}
                      </span>
                      {item.required && (
                        <span className="px-2 py-0.5 rounded-md bg-meta-1/10 text-meta-1 text-[10px] font-bold">
                          Required
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Action Button */}
            <div className="pt-3 border-t border-stroke dark:border-strokedark">
              <button
                type="button"
                onClick={() => openEditModal(selectedStaff)}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-4 rounded-xl shadow-md shadow-primary/25 transition-all text-xs cursor-pointer"
              >
                <MdEdit className="text-base" />
                <span>Edit This Input Configuration</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-dashed border-stroke dark:border-strokedark p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-14 h-14 rounded-2xl bg-gray-2/80 dark:bg-meta-4/40 text-slate-400 flex items-center justify-center text-2xl mb-3">
              <MdInfoOutline />
            </div>
            <h4 className="text-sm font-bold text-black dark:text-white mb-1">
              No Input Selected
            </h4>
            <p className="text-xs text-body dark:text-bodydark max-w-xs">
              Click on any row in the table to view its dynamic field definitions and edit options.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
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
            Confirm Input Deletion
          </h3>
          <p className="text-xs text-body dark:text-bodydark mb-6">
            Are you sure you want to delete the configuration for{' '}
            <strong className="text-black dark:text-white font-bold">
              "{getDisplayName(selectedStaff)}"
            </strong>
            ? All attached dynamic input rules will be removed.
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
              onClick={confirmDelete}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-meta-1 hover:bg-opacity-90 text-white shadow-md shadow-meta-1/25 transition-all cursor-pointer"
            >
              Delete Input
            </button>
          </div>
        </div>
      </Dialog>

      {/* Create / Edit Input Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={closeEditModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className:
            'rounded-2xl dark:bg-boxdark border border-stroke dark:border-strokedark shadow-2xl overflow-hidden',
        }}
      >
        <div className="p-6 sm:p-7 relative">
          <button
            type="button"
            onClick={closeEditModal}
            className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>

          <Inputfieldfrom
            templates={templates}
            inputFor={inputFor}
            value={previous}
            close={closeEditModal}
            handler={handleAllinputs}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default AppointmentType;

