import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Box } from '@mui/material';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import TemplateEditor from './TemplateEditor';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import {
  MdDescription,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdArticle,
  MdCategory,
  MdLanguage,
  MdSave,
  MdWarningAmber
} from 'react-icons/md';

const Reporting = () => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const notify = (message) => toast.success(message);
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const handleEditTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setIsEditorOpen(true);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm();

  const handleNewReportClick = () => {
    setShowModal(true);
  };

  const openDeleteModal = (agent) => {
    setSelectedAgent(agent);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const handleAllPackage = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/templates`);
      setData(response.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAllPackage();
  }, [isDeleteModalOpen]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      await axios.post(`${apiPath}/api/templates`, formData);
      notify('Template created successfully');
      handleAllPackage();
      setShowModal(false);
      reset();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.error?.errors?.name?.message ||
        error.message ||
        'Error saving template';
      notifyError(errorMsg);
      setError('name', {
        type: 'manual',
        message: errorMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id) => {
    try {
      await axios.delete(`${apiPath}/api/templates/${id}`);
      notify('Template deleted successfully');
      closeDeleteModal();
      handleAllPackage();
    } catch (error) {
      notifyError(error.response?.data?.message || 'Error deleting template');
    }
  };

  const filteredTemplates = data.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(query) ||
      (item.documentType || '').toLowerCase().includes(query) ||
      (item.templateType || '').toLowerCase().includes(query)
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
            placeholder="Search report & document templates..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={handleNewReportClick}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer self-start sm:self-auto text-xs sm:text-sm"
        >
          <MdAdd className="text-lg" />
          <span>New Document Template</span>
        </button>
      </div>

      {/* Templates Table Card */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Template Name</th>
                <th className="py-3.5 px-5">Document Type</th>
                <th className="py-3.5 px-5">Layout Style</th>
                <th className="py-3.5 px-5">Language</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No document templates found. Click "New Document Template" to add one.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    {/* Name */}
                    <td
                      onClick={() => handleEditTemplate(item._id)}
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base shrink-0">
                        <MdDescription />
                      </div>
                      <span>{item.name || 'Unnamed Template'}</span>
                    </td>

                    {/* Document Type */}
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-2 dark:bg-meta-4 text-slate-700 dark:text-slate-200 border border-stroke dark:border-strokedark uppercase">
                        {item.documentType || 'Standard'}
                      </span>
                    </td>

                    {/* Template Type */}
                    <td className="py-3.5 px-5 capitalize font-medium text-black dark:text-white">
                      {item.templateType || 'Basic'}
                    </td>

                    {/* Language */}
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                        <MdLanguage className="text-slate-400" />
                        English
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTemplate(item._id)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Template"
                        >
                          <MdEdit className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(item)}
                          className="p-2 text-slate-500 hover:text-meta-1 hover:bg-meta-1/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Template"
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

      <TemplateEditor
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        templateId={selectedTemplateId}
      />

      {/* Create New Document Template Modal */}
      <Modal open={showModal} onClose={handleCloseModal}>
        <Box className="fixed inset-0 flex items-center justify-center p-4 z-99999 outline-none">
          <div className="bg-white dark:bg-boxdark rounded-2xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-stroke dark:border-strokedark relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
            >
              <MdClose className="text-xl" />
            </button>

            {/* Title */}
            <div className="flex items-center gap-3 mb-5 border-b border-stroke dark:border-strokedark pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                <MdArticle />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Create Document Template
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Configure structure for invoices, quotes, or customer reports
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Document Type */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Document Type <span className="text-meta-1">*</span>
                </label>
                <select
                  defaultValue=""
                  {...register('documentType', {
                    required: 'Please select a document type',
                  })}
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                >
                  <option value="" disabled>Select document type</option>
                  <option value="invoice">Invoice</option>
                  <option value="quote">Quote</option>
                  <option value="contract">Contract</option>
                </select>
                {errors.documentType && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.documentType.message}
                  </p>
                )}
              </div>

              {/* Template Style */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Template Style <span className="text-meta-1">*</span>
                </label>
                <select
                  defaultValue=""
                  {...register('templateType', {
                    required: 'Please select a template type',
                  })}
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                >
                  <option value="" disabled>Select template style</option>
                  <option value="basic">Basic Compact</option>
                  <option value="detailed">Detailed Itemized</option>
                  <option value="custom">Custom Corporate</option>
                </select>
                {errors.templateType && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.templateType.message}
                  </p>
                )}
              </div>

              {/* Template Name */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Template Display Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters long',
                    },
                    maxLength: {
                      value: 55,
                      message: 'Name must be at most 55 characters long',
                    },
                  })}
                  placeholder="e.g. Standard European Moving Invoice"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
                {errors.name && (
                  <p className="text-meta-1 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Inherit / Clone From */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Clone from existing (Optional)
                </label>
                <select
                  defaultValue=""
                  {...register('link_template')}
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                >
                  <option value="">Start from blank template</option>
                  {data &&
                    data.map((item, index) => (
                      <option key={index} value={item._id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stroke dark:border-strokedark">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  {saving ? 'Creating...' : 'Create Template'}
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
                Delete Template
              </h4>
              <p className="text-xs text-body dark:text-bodydark mt-1 leading-relaxed">
                Are you sure you want to delete template{' '}
                <span className="font-bold text-black dark:text-white">
                  "{selectedAgent?.name}"
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
                onClick={() => deletePackage(selectedAgent._id)}
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

export default Reporting;

