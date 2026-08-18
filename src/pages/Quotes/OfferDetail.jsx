import React, { useEffect, useState, useMemo } from 'react';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import Offer from './Offerdel';
import CommunicationLog from '../InvoicePage/Communication';
import QuotesActivity from './QuotesActivity';
import Loader from '../../common/Loader';
import TaskPage from '../Taskcomponent/TaskPage';
import JobDetailPage from '../Jobpage/JobDetailPage';

const OfferDetail = () => {
  const [activeTabKey, setActiveTabKey] = useState('proposal');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { Id } = useParams();
  const [notes, setNotes] = useState(null);
  const navigate = useNavigate();

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/finance/finance/${Id}`);
      const invoiceData = response.data?.finance || response.data;
      setData(invoiceData);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Id) {
      fetchInvoice();
    }
  }, [Id]);

  const handleNotes = async () => {
    if (!data?.job?._id) return;
    try {
      const response = await axios.get(
        `${apiPath}/api/notesListByJobId?jobId=${data.job._id}`
      );
      setNotes(response.data?.notesListByJobId);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    if (data?.job) {
      handleNotes();
    }
  }, [data]);

  // Tab definitions with icons and keys
  const navTabs = useMemo(() => {
    const tabs = [
      {
        key: 'proposal',
        label: 'Offer Proposal',
        icon: RequestQuoteIcon,
      },
      {
        key: 'activity',
        label: 'Activity',
        icon: TimelineIcon,
      },
    ];

    if (data?.job) {
      tabs.push({
        key: 'job',
        label: 'Linked Job',
        icon: WorkIcon,
      });
      tabs.push({
        key: 'tasks',
        label: 'Tasks',
        icon: AssignmentIcon,
      });
    }

    tabs.push({
      key: 'communication',
      label: 'Communication Log',
      icon: ForumIcon,
    });

    return tabs;
  }, [data?.job]);

  if (loading && !data) {
    return <Loader />;
  }

  const quoteNumber = data?.invoiceNumber || data?.index || Id?.slice(-6) || '';
  const customerName = data?.customer 
    ? `${data.customer.firstName || ''} ${data.customer.lastName || ''}`.trim() 
    : '';

  return (
    <div className="min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 font-sans text-slate-800 dark:text-white transition-colors">
      {/* Modern Top Navigation Bar */}
      <div className="bg-white dark:bg-boxdark border-b border-slate-200/80 dark:border-strokedark shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 md:pt-0">
          
          {/* Tabs Menu List */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTabKey === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTabKey(tab.key)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
                    isActive
                      ? 'text-primary bg-primary/10 dark:bg-primary/20 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    style={{ fontSize: 18 }}
                    className={isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}
                  />
                  <span>{tab.label}</span>

                  {/* Active bottom highlight bar */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Quote Info Pill on right */}
          <div className="hidden lg:flex items-center gap-2.5 pb-2 md:pb-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-400 font-normal">Quotation:</span>
              <span className="font-bold text-primary">#{quoteNumber}</span>
            </span>
            {customerName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/50 capitalize truncate max-w-[200px]">
                {customerName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-3 sm:p-6 max-w-7xl mx-auto">
        {activeTabKey === 'proposal' && (
          <Offer fetchInvoice={fetchInvoice} data={data} notes={notes} />
        )}
        
        {activeTabKey === 'activity' && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-6 shadow-sm min-h-[60vh]">
            <QuotesActivity invoiceData={data} />
          </div>
        )}
        
        {activeTabKey === 'job' && data?.job && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-6 shadow-sm">
            <JobDetailPage offer={data?._id} />
          </div>
        )}
        
        {activeTabKey === 'tasks' && data?.job && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-6 shadow-sm min-h-[75vh]">
            <TaskPage jobId={data?.job?._id} />
          </div>
        )}
        
        {activeTabKey === 'communication' && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-6 shadow-sm min-h-[75vh]">
            <CommunicationLog id={data?._id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferDetail;