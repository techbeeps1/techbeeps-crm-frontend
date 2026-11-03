import React, { useState, useEffect, useContext } from 'react';
import { setFormField, resetForm } from '../Redux/formSlice';
import { useDispatch, useSelector } from 'react-redux';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import EditNewsItem from '../EditTemplateForm/Communication/editNewsItem';
import { toast } from 'react-toastify';
import { Dialog } from '@mui/material';
import { UserContext } from '../../UserContext';
import {
  MdArticle,
  MdAdd,
  MdSearch,
  MdEdit,
  MdDeleteOutline,
  MdCalendarToday,
  MdClose,
  MdWarningAmber,
  MdCheckCircle,
  MdSchedule,
  MdPerson,
  MdLock
} from 'react-icons/md';

function NewsItems() {
  const { userData, isAdmin, role }: any = useContext(UserContext) || {};
  const canManageNews = isAdmin || role === 'Admin' || role === 'Manager' || userData?.role === 'Admin' || userData?.role === 'Manager';

  const [showNewsItemsFrom, setShowNewsItemsFrom] = useState(false);
  const [newsItemList, setNewsItemList] = useState([] as any);
  const [selectedNewsItem, setSelectedNewsItem] = useState<any>(null);
  const [readOnlyModalItem, setReadOnlyModalItem] = useState<any>(null);
  const [totalNewsItem, setTotalNewsItem] = useState(0);
  const [currentNewsItemPage, setCurrentNewsItemPage] = useState(1);
  const [isNewsItemSelected, setIsNewsItemSelected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalItem, setDeleteModalItem] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const staffPageSize = 10;

  const newsItemsForm = 'newsItems';
  const formState = useSelector((state: any) => state.forms[newsItemsForm]);
  const dispatch = useDispatch();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  function getNewsItemList() {
    axios
      .get(
        `${apiPath}/Communication/newsItemsList?page=${currentNewsItemPage}&pageSize=${staffPageSize}`,
        { headers: getAuthHeaders() }
      )
      .then((response) => {
        setNewsItemList(response.data.newsItemsList || []);
        setTotalNewsItem(response.data.totalNewsItem || 0);
      })
      .catch((error) => {
        console.error('Error fetching news items:', error);
      });
  }

  useEffect(() => {
    getNewsItemList();
  }, [currentNewsItemPage]);

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    dispatch(
      setFormField({ formName: newsItemsForm, field: name, value } as any),
    );
  };

  const handleNewsItemClick = (newsItem: any) => {
    if (canManageNews) {
      setSelectedNewsItem(newsItem);
      setIsNewsItemSelected(true);
      setShowNewsItemsFrom(false);
    } else {
      setReadOnlyModalItem(newsItem);
    }
  };

  // create news item handler
  const handleFormSubmission = async (e: any) => {
    e.preventDefault();

    if (!canManageNews) {
      toast.error('Only Admin or Manager can publish news announcements');
      return;
    }

    if (!formState.title?.trim() || !formState.body?.trim() || !formState.publishAt?.trim()) {
      toast.error('Please fill all the required fields');
      return;
    }
    if (formState.title.length < 3 || formState.title.length > 120) {
      toast.error('News title should be between 3 and 120 characters long');
      return;
    }
    if (formState.body.length < 5 || formState.body.length > 5000) {
      toast.error('News content should be between 5 and 5000 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiPath}/Communication/createNewsItem`, {
        method: 'POST',
        body: JSON.stringify(formState),
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();
      if (response.ok && (data.success || data.status)) {
        toast.success('News item created successfully!');
        getNewsItemList();
        dispatch(resetForm({ formName: newsItemsForm }));
        setShowNewsItemsFrom(false);
      } else {
        toast.error(data.msg || data.message || 'Failed to create news item');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  // edit news item handler
  const handleEditSupplierSubmit = async (editedData: any) => {
    if (!canManageNews) {
      toast.error('Only Admin or Manager can edit news announcements');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${apiPath}/Communication/editNewsItem/${editedData._id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editedData),
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );
      const data = await response.json();
      if (response.ok && (data.success || data.status)) {
        toast.success('News item updated successfully!');
        getNewsItemList();
      } else {
        toast.error(data.msg || data.message || 'Failed to update news item');
      }
    } catch (error) {
      console.error('Error updating news item:', error);
      toast.error('Failed to update news item');
      throw error;
    }
    setIsNewsItemSelected(false);
  };

  // delete news item handler
  const deleteNewsItem = async (newsItemId: string) => {
    if (!canManageNews) {
      toast.error('Only Admin or Manager can delete news announcements');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${apiPath}/Communication/deleteNewsItem/${newsItemId}`,
        { headers: getAuthHeaders() }
      );
      if (response.data.status || response.data.success) {
        setNewsItemList(
          newsItemList.filter((newsItem: any) => newsItem._id !== newsItemId),
        );
        setIsNewsItemSelected(false);
        setDeleteModalItem(null);
        toast.success('News item deleted successfully');
      } else {
        toast.error(response.data.msg || 'Error deleting news item');
      }
    } catch (error: any) {
      console.error('Error deleting news item:', error);
      toast.error(error.response?.data?.msg || 'Failed to delete news item');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredNews = newsItemList.filter((item: any) =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner & Action Bar */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-md shadow-primary/20 text-2xl shrink-0">
            <MdArticle />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Company News & Announcements
              </h2>
              {!canManageNews && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  <MdLock className="text-xs" /> Read Only
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {canManageNews
                ? 'Publish internal news, staff updates, and schedule broadcast announcements'
                : 'Browse internal company announcements and official updates'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <MdSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search news..."
              className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <MdClose className="w-4 h-4" />
              </button>
            )}
          </div>

          {canManageNews && (
            <button
              type="button"
              onClick={() => {
                setShowNewsItemsFrom(true);
                setIsNewsItemSelected(false);
              }}
              className="px-4 py-2.5 bg-primary hover:bg-opacity-90 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm shadow-primary/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <MdAdd className="text-lg" />
              <span>Publish News</span>
            </button>
          )}
        </div>
      </div>

      {/* Split Layout: News List on Left + Form/Edit on Right */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: News Items Table / Card Container */}
        <div className={`bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden transition-all duration-300 ${
          (showNewsItemsFrom || isNewsItemSelected) ? 'lg:w-7/12 w-full' : 'w-full'
        }`}>
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">All Announcements</span>
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-full">
                {filteredNews.length}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Title & Summary</th>
                  <th className="py-3.5 px-4">Publisher</th>
                  <th className="py-3.5 px-4">Publish Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  {canManageNews && <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredNews.length === 0 ? (
                  <tr>
                    <td colSpan={canManageNews ? 5 : 4} className="py-16 text-center text-slate-400">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-3xl mx-auto mb-3">
                        <MdArticle />
                      </div>
                      <p className="font-bold text-slate-700 text-sm">No announcements found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {canManageNews
                          ? 'There are no news items matching your search. Click "Publish News" to create one.'
                          : 'No published announcements available at this time.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredNews.map((newsItem: any, index: number) => {
                    const isSelected = selectedNewsItem?._id === newsItem._id && isNewsItemSelected;
                    const isPublished = new Date(newsItem.publishAt) <= new Date();

                    return (
                      <tr
                        key={newsItem._id || index}
                        onClick={() => handleNewsItemClick(newsItem)}
                        className={`group transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? 'bg-primary/5 border-l-4 border-l-primary'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Title & Body Excerpt */}
                        <td className="py-4 px-4 sm:px-6">
                          <div className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm">
                            {newsItem.title}
                          </div>
                          {newsItem.body && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-md font-medium">
                              {newsItem.body}
                            </p>
                          )}
                        </td>

                        {/* Publisher Attribution */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <MdPerson className="text-slate-400 text-sm shrink-0" />
                            <span>{newsItem.publisherName || 'Management'}</span>
                          </div>
                        </td>

                        {/* Publish Date */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                            <MdCalendarToday className="text-slate-400 text-sm shrink-0" />
                            <span>
                              {newsItem.publishAt
                                ? new Date(newsItem.publishAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : '—'}
                            </span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                              : 'bg-amber-50 text-amber-700 border-amber-200/60'
                          }`}>
                            {isPublished ? <MdCheckCircle className="text-sm text-emerald-500" /> : <MdSchedule className="text-sm text-amber-500" />}
                            <span>{isPublished ? 'Published' : 'Scheduled'}</span>
                          </span>
                        </td>

                        {/* Actions (Only for Admin / Manager) */}
                        {canManageNews && (
                          <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNewsItemClick(newsItem);
                                }}
                                className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
                                title="Edit Article"
                              >
                                <MdEdit className="text-base" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteModalItem(newsItem);
                                }}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete Article"
                              >
                                <MdDeleteOutline className="text-base" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Create Form or Edit Form Container (Admin/Manager only) */}
        {canManageNews && (showNewsItemsFrom || isNewsItemSelected) && (
          <div className="lg:w-5/12 w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden sticky top-20">
            {/* Create News Item Card */}
            {showNewsItemsFrom && (
              <div>
                {/* Header */}
                <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold shadow-xs">
                      <MdArticle />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Create News Item</h3>
                      <p className="text-xs text-slate-500">Unpublished until scheduled date</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewsItemsFrom(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleFormSubmission} className="p-5 sm:p-6 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      News Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q3 Company Town Hall & Strategy Update"
                      name="title"
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Between 3 and 120 characters</p>
                  </div>

                  {/* Publish Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Publish On <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      name="publishAt"
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                    />
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
                      onChange={handleFormChange}
                      placeholder="Write announcement body and details for team members..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Between 5 and 5000 characters</p>
                  </div>

                  {/* Form Actions with Spacing */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewsItemsFrom(false)}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-primary hover:bg-opacity-90 text-white font-semibold text-sm shadow-sm shadow-primary/20 transition-all cursor-pointer active:scale-95"
                    >
                      Publish Announcement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Edit News Item Component */}
            {isNewsItemSelected && (
              <EditNewsItem
                newsItemData={selectedNewsItem}
                handleEditSubmit={handleEditSupplierSubmit}
                deleteNewsItem={deleteNewsItem}
                handleCloseEditForm={setIsNewsItemSelected}
              />
            )}
          </div>
        )}
      </div>

      {/* Read-Only Modal for Staff Users */}
      <Dialog
        open={Boolean(readOnlyModalItem)}
        onClose={() => setReadOnlyModalItem(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <div className="p-6 bg-white space-y-4">
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
                Official Announcement
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {readOnlyModalItem?.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>By <strong>{readOnlyModalItem?.publisherName || 'Management'}</strong></span>
                <span>•</span>
                <span>
                  {readOnlyModalItem?.publishAt
                    ? new Date(readOnlyModalItem.publishAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : '—'}
                </span>
              </p>
            </div>
            <button
              onClick={() => setReadOnlyModalItem(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MdClose className="text-xl" />
            </button>
          </div>

          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap py-2">
            {readOnlyModalItem?.body}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setReadOnlyModalItem(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteModalItem)}
        onClose={() => setDeleteModalItem(null)}
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
            Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteModalItem?.title}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => setDeleteModalItem(null)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => deleteNewsItem(deleteModalItem._id)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm shadow-rose-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default NewsItems;
