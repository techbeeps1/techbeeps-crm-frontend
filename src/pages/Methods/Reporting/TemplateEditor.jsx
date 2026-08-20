import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@mui/material';
import axios from 'axios';
import EmailEditor from 'react-email-editor';
import { apiPath } from '../../../../apiPath';
import { useForm, Controller } from 'react-hook-form';
import {
  MdClose,
  MdDescription,
  MdEdit,
  MdSave,
  MdLayers,
  MdTranslate,
  MdTimer,
  MdLink,
  MdCategory,
  MdArticle
} from 'react-icons/md';

const TemplateEditor = ({ open, onClose, templateId }) => {
  const emailEditorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [designJson, setDesignJson] = useState(null);
  const [isEditorLoaded, setIsEditorLoaded] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [data, setData] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { control, handleSubmit, reset } = useForm();

  const fetchTemplate = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/templates/${templateId}`);
      setDesignJson(response.data.htmlDesign);
      setData(response.data);
      reset(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching template:', error);
      setIsLoading(false);
    }
  };

  const loadDesign = () => {
    if (emailEditorRef.current && designJson && isEditorLoaded) {
      emailEditorRef.current.editor.loadDesign(designJson);
    }
  };

  useEffect(() => {
    if (open && templateId) {
      fetchTemplate();
    }
  }, [open, templateId]);

  useEffect(() => {
    loadDesign();
  }, [designJson, isEditorLoaded]);

  const handleSave = () => {
    setSaving(true);
    emailEditorRef.current.editor.exportHtml((exportData) => {
      const { design, html } = exportData;
      axios
        .put(`${apiPath}/api/templates/${templateId}`, {
          htmlDesign: design,
          htmlContent: html,
        })
        .then((response) => {
          setSaving(false);
          onClose();
        })
        .catch((error) => {
          console.error('Error saving template:', error);
          setSaving(false);
        });
    });
  };

  const handleEditDetailOpen = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditDetailClose = () => {
    setIsEditDialogOpen(false);
  };

  const onSubmit = (formData) => {
    axios
      .put(`${apiPath}/api/templates/${templateId}`, formData)
      .then((response) => {
        setData(formData);
        handleEditDetailClose();
      })
      .catch((error) => {
        console.error('Error updating template details:', error);
      });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullScreen
        PaperProps={{
          className: 'bg-slate-50 dark:bg-boxdark-2 text-black dark:text-white',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header Bar */}
          <div className="bg-white dark:bg-boxdark border-b border-stroke dark:border-strokedark px-6 py-4 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                <MdArticle />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white leading-tight">
                  {data?.name || 'Document Template Editor'}
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Document ID: {templateId}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-gray-2/60 dark:bg-meta-4/20 p-1 rounded-xl border border-stroke dark:border-strokedark">
              <button
                type="button"
                onClick={() => setTabIndex(0)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tabIndex === 0
                    ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <MdLayers className="text-sm" />
                <span>Template Details</span>
              </button>
              <button
                type="button"
                onClick={() => setTabIndex(1)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tabIndex === 1
                    ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                <MdTranslate className="text-sm" />
                <span>Visual Designer (English)</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {tabIndex === 1 && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-primary hover:bg-opacity-90 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <MdSave className="text-base" />
                  <span>{saving ? 'Saving...' : 'Save Template'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors cursor-pointer"
                title="Close Editor"
              >
                <MdClose className="text-xl" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow overflow-auto p-6">
            {tabIndex === 0 && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Meta details card */}
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-stroke dark:border-strokedark">
                    <div>
                      <h4 className="text-base font-bold text-black dark:text-white">
                        Template Specifications
                      </h4>
                      <p className="text-xs text-body dark:text-bodydark">
                        Overview of configuration parameters and linked resources
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleEditDetailOpen}
                      className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold py-2 px-3.5 rounded-xl border border-primary/20 transition-all cursor-pointer"
                    >
                      <MdEdit className="text-sm" />
                      <span>Edit Specifications</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MdArticle className="text-base" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Template Name
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black dark:text-white">
                        {data?.name || 'Untitled Template'}
                      </p>
                    </div>

                    <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MdLink className="text-base" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Linked Email
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black dark:text-white">
                        {data?.link_template || 'Not Linked'}
                      </p>
                    </div>

                    <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MdTimer className="text-base" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Expiration Period
                        </span>
                      </div>
                      <p className="text-sm font-bold text-black dark:text-white">
                        {data?.expiryPeriod ? `${data.expiryPeriod} Days` : 'None specified'}
                      </p>
                    </div>

                    <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MdCategory className="text-base" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Document Type
                        </span>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary capitalize mt-0.5">
                        {data?.documentType || 'Invoice'}
                      </span>
                    </div>

                    <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MdLayers className="text-base" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                          Template Layout
                        </span>
                      </div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-meta-4 text-slate-700 dark:text-slate-300 capitalize mt-0.5">
                        {data?.templateType || 'Basic'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Languages card */}
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-stroke dark:border-strokedark p-6 shadow-xs">
                  <h4 className="text-base font-bold text-black dark:text-white mb-1">
                    Available Languages
                  </h4>
                  <p className="text-xs text-body dark:text-bodydark mb-4">
                    Rendered content language variants
                  </p>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                      <MdTranslate /> English (Default)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {tabIndex === 1 && (
              <div className="h-full min-h-[650px] bg-white rounded-2xl border border-stroke dark:border-strokedark overflow-hidden shadow-xs">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-sm font-semibold text-body">Loading template editor...</p>
                  </div>
                ) : (
                  <EmailEditor
                    ref={emailEditorRef}
                    onLoad={() => setIsEditorLoaded(true)}
                    minHeight="700px"
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Edit Details Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={handleEditDetailClose}
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
            onClick={handleEditDetailClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-black dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>

          <div className="flex items-center gap-3 mb-6 border-b border-stroke dark:border-strokedark pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
              <MdEdit />
            </div>
            <div>
              <h3 className="text-lg font-bold text-black dark:text-white">
                Edit Template Details
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Update document metadata and classification
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Template Name <span className="text-meta-1">*</span>
              </label>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    required
                    placeholder="Enter template name"
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Expiration Period (Days)
              </label>
              <Controller
                name="expiryPeriod"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    placeholder="e.g. 30"
                    type="number"
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Document Type <span className="text-meta-1">*</span>
              </label>
              <Controller
                name="documentType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select
                    {...field}
                    required
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  >
                    <option value="invoice">Invoice</option>
                    <option value="quote">Quote</option>
                    <option value="contract">Contract</option>
                  </select>
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                Template Layout Style <span className="text-meta-1">*</span>
              </label>
              <Controller
                name="templateType"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <select
                    {...field}
                    required
                    className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                  >
                    <option value="basic">Basic</option>
                    <option value="detailed">Detailed</option>
                    <option value="custom">Custom</option>
                  </select>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
              <button
                type="button"
                onClick={handleEditDetailClose}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer"
              >
                <MdSave className="text-base" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </>
  );
};

export default TemplateEditor;

