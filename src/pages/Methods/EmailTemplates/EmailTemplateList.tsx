import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Modal, Box } from '@mui/material';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import EmailTemplateEditor from './EmailTemplateEditor';
import Loader from '../../../common/Loader';
import { toast } from 'react-toastify';
import {
  MdEmail,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdClose,
  MdSearch,
  MdDriveFileRenameOutline,
  MdCheckCircle,
  MdSave,
  MdWarningAmber
} from 'react-icons/md';

interface Template {
  _id: string;
  name: string;
  status: string;
  templateType?: string;
}

interface FormData {
  name: string;
  documentType?: string;
  templateType?: string;
  link_template?: string | null;
}

const EmailTemplateList: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAgent, setSelectedAgent] = useState<Template | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      documentType: '',
      templateType: '',
      name: '',
      link_template: '',
    },
  });

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsEditorOpen(true);
  };

  const handleNewReportClick = () => setShowModal(true);

  const openDeleteModal = (agent: Template) => {
    setSelectedAgent(agent);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => setDeleteModalOpen(false);

  const handleCloseModal = () => {
    setShowModal(false);
    reset();
  };

  const handleAllReports = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/reporting`);
      setData(response.data?.reportings || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleAllReports();
  }, [isDeleteModalOpen]);

  const onSubmit: SubmitHandler<FormData> = async (formData) => {
    setSaving(true);
    try {
      await axios.post(`${apiPath}/api/reporting`, formData);
      notify('Email template created successfully');
      handleAllReports();
      setShowModal(false);
      reset();
    } catch (error: any) {
      notifyError(`Error saving template: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const deletePackage = async (id: string) => {
    try {
      await axios.delete(`${apiPath}/api/reporting/${id}`);
      notify('Template deleted successfully');
      closeDeleteModal();
      handleAllReports();
    } catch (error: any) {
      notifyError(`Error deleting template: ${error.message}`);
    }
  };

  const filteredTemplates = data.filter((item) =>
    (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()),
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
            placeholder="Search email notification templates..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={handleNewReportClick}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer self-start sm:self-auto text-xs sm:text-sm"
        >
          <MdAdd className="text-lg" />
          <span>New Email Template</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark bg-gray-2/50 dark:bg-meta-4/30 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5">Template Name</th>
                <th className="py-3.5 px-5">Delivery Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke dark:divide-strokedark text-sm">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-body dark:text-bodydark text-sm">
                    No email notification templates found. Click "New Email Template" to create one.
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((item) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-2/40 dark:hover:bg-meta-4/20 transition-colors"
                  >
                    {/* Name */}
                    <td
                      onClick={() => handleEditTemplate(item._id)}
                      className="py-3.5 px-5 font-bold text-black dark:text-white cursor-pointer hover:text-primary transition-colors flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-base shrink-0">
                        <MdEmail />
                      </div>
                      <span>{item.name || 'Unnamed Email Template'}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        <MdCheckCircle className="text-emerald-500" />
                        {item.status || 'Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditTemplate(item._id)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                          title="Edit Email Template"
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

      <EmailTemplateEditor
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        templateId={selectedTemplateId}
      />

      {/* New Email Template Modal */}
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
                <MdEmail />
              </div>
              <div>
                <h3 className="text-lg font-bold text-black dark:text-white">
                  Create Email Notification Template
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Draft automated messages for customer status updates
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Template Name */}
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5 flex items-center gap-1">
                  <MdDriveFileRenameOutline className="text-slate-400 text-sm" />
                  Template Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g. Booking Confirmation Email"
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
                  {saving ? 'Creating...' : 'Create Email Template'}
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
                Delete Email Template
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
                onClick={() => deletePackage(selectedAgent!._id)}
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

export default EmailTemplateList;

