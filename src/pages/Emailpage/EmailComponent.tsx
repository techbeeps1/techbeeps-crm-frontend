import React, { useState, useEffect } from 'react';
import { Typography, TablePagination } from '@mui/material';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import EmailItem from '../../components/EmailList';
import { 
  MdSearch, 
  MdInbox, 
  MdSend, 
  MdDrafts, 
  MdDeleteOutline, 
  MdReportGmailerrorred,
  MdMailOutline,
  MdRefresh
} from 'react-icons/md';

const EmailLayout = ({ customerId, offerId }: any) => {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalEmails, setTotalEmails] = useState(0);
  const [activeFolder, setActiveFolder] = useState('Inbox');

  const fetchEmails = async (page: number, rowsPerPage: number, query: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/emails`, {
        params: {
          page: page + 1,
          rowsPerPage,
          search: query,
          customerId: customerId,
          offerId: offerId
        }
      });
      setEmails(response.data.emails || []);
      setTotalEmails(response.data.totalEmails || 0);
    } catch (error) {
      console.error("Error fetching emails", error);
    }
    setLoading(false);
  };

  const handleChangePage = (event: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSideButtonClick = (folder: string) => {
    setActiveFolder(folder);
    console.log(folder);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    fetchEmails(0, rowsPerPage, event.target.value);
  };

  useEffect(() => {
    fetchEmails(page, rowsPerPage, searchQuery);
  }, [page, rowsPerPage, searchQuery]);

  const folderIcons: Record<string, any> = {
    'Inbox': <MdInbox className="w-5 h-5" />,
    'Sent': <MdSend className="w-5 h-5" />,
    'Concepts': <MdDrafts className="w-5 h-5" />,
    'Waste paper basket': <MdDeleteOutline className="w-5 h-5" />,
    'Spam': <MdReportGmailerrorred className="w-5 h-5" />
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-2 px-1 sm:px-4">
      {/* Top Search & Stats Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-5 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <MdMailOutline className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Email Messages</h2>
            <p className="text-xs text-slate-500 mt-0.5">Inbox, sent communications and correspondence</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-72">
            <MdSearch className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by subject or sender..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 whitespace-nowrap">
            {totalEmails} {totalEmails === 1 ? 'Email' : 'Emails'}
          </div>

          <button
            onClick={() => fetchEmails(page, rowsPerPage, searchQuery)}
            className="p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-all"
            title="Refresh emails"
          >
            <MdRefresh className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Sidebar for standalone mode */}
        {!customerId && (
          <div className="w-full md:w-60 bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm flex flex-col space-y-1">
            {['Inbox', 'Sent', 'Concepts', 'Waste paper basket', 'Spam'].map((folder) => {
              const isActive = activeFolder === folder;
              return (
                <button
                  key={folder}
                  onClick={() => handleSideButtonClick(folder)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20' 
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {folderIcons[folder] || <MdInbox className="w-5 h-5" />}
                  </span>
                  <span>{folder === 'Waste paper basket' ? 'Trash' : folder}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Email List container */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div className="col-span-1 text-center">Type</div>
            <div className="col-span-8 sm:col-span-8">Subject & Content</div>
            <div className="col-span-3 text-right">Date / Time</div>
          </div>

          {/* Email Items or Empty / Loading */}
          <div className="divide-y divide-slate-100 flex-1">
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs font-medium text-slate-500">Loading emails...</p>
              </div>
            ) : emails && emails.filter(email => email !== null).length > 0 ? (
              emails.filter(email => email !== null).map((email: any, index) => (
                <EmailItem
                  key={email._id || index}
                  fetchEmails={() => fetchEmails(page, rowsPerPage, searchQuery)}
                  id={email._id}
                  recived_from={email.from}
                  subject={email.subject}
                  message={email.htmlContent}
                  time={email.sentAt}
                  recipient={email.recipient}
                />
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200/60">
                  <MdMailOutline className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">No emails found</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  {searchQuery ? "No emails matching your search query." : "There are no email conversations recorded for this customer."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-4">
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalEmails}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                border: 'none',
                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#64748b',
                },
                '.MuiTablePagination-select': {
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  padding: '4px 8px',
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailLayout;
