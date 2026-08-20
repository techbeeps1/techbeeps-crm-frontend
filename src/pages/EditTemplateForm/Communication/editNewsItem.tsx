import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setNewsItemsEditedData } from '../../Redux/formSlice';
import { resetForm, setFormField } from '../../Redux/formSlice';
import { toast } from 'react-toastify';
import {
  MdEdit,
  MdClose,
  MdDeleteOutline,
  MdSave,
  MdCalendarToday,
  MdCheckCircle,
  MdSchedule,
  MdWarningAmber
} from 'react-icons/md';
import { Dialog } from '@mui/material';

function EditNewsItem({
  newsItemData,
  handleEditSubmit,
  handleCloseEditForm,
  deleteNewsItem,
}: any) {
  const dispatch = useDispatch();
  const newsItemsForm = 'newsItems';
  const newsItemEditedData = useSelector(
    (state: any) => state.forms[newsItemsForm],
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const updateEditedData = async () => {
      if (newsItemData) {
        dispatch(
          setFormField({
            formName: newsItemsForm,
            field: 'editedData',
            value: newsItemData,
          }),
        );
      }
    };
    updateEditedData();
  }, [dispatch, newsItemData, newsItemsForm]);

  const handleNewsItemFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setNewsItemsEditedData({
        ...newsItemEditedData.editedData,
        [name]: value,
      }),
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    const data = newsItemEditedData?.editedData;
    if (!data?.title?.trim() || !data?.body?.trim()) {
      toast.error('Please fill all the required fields');
      return;
    }
    if (data.title.length < 5 || data.title.length > 100) {
      toast.error('News title should be between 5 and 100 characters long');
      return;
    }
    if (data.body.length > 1000 || data.body.length < 10) {
      toast.error('News content should be between 10 and 1000 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      await handleEditSubmit(data);
      dispatch(resetForm({ formName: newsItemsForm }));
    } catch (error) {
      console.error('Error during form submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPublished = newsItemData?.publishAt
    ? new Date(newsItemData.publishAt) <= new Date()
    : false;

  return (
    <div>
      {/* Header */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shadow-xs">
            <MdEdit />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Edit Announcement</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60'
              }`}>
                {isPublished ? <MdCheckCircle className="text-xs" /> : <MdSchedule className="text-xs" />}
                <span>
                  {isPublished
                    ? `Published on ${new Date(newsItemData?.publishAt).toLocaleDateString()}`
                    : `Scheduled for ${new Date(newsItemData?.publishAt).toLocaleDateString()}`}
                </span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleCloseEditForm(false)}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <MdClose className="text-xl" />
        </button>
      </div>

      {/* Form Content */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            News Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            placeholder="Enter announcement title..."
            value={newsItemEditedData?.editedData?.title || ''}
            onChange={handleNewsItemFormChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
          <p className="text-[11px] text-slate-400 mt-1">Between 5 and 100 characters</p>
        </div>

        {/* Publish Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Publish Date
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="publishAt"
              value={
                newsItemEditedData?.editedData?.publishAt
                  ? new Date(newsItemEditedData.editedData.publishAt).toISOString().split('T')[0]
                  : ''
              }
              onChange={handleNewsItemFormChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            News Content <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="body"
            rows={5}
            required
            value={newsItemEditedData?.editedData?.body || ''}
            onChange={handleNewsItemFormChange}
            placeholder="Write announcement body and details..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Between 10 and 1000 characters</p>
        </div>

        {/* Footer Actions with Generous Spacing */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <MdDeleteOutline className="text-base" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleCloseEditForm(false)}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-opacity-90 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-primary/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <MdSave className="text-base" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <div className="p-6 bg-white flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mb-4">
            <MdWarningAmber />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Delete Announcement
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Are you sure you want to delete this announcement? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                deleteNewsItem(newsItemData._id);
                setShowDeleteConfirm(false);
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm shadow-rose-200 transition-all cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default EditNewsItem;

