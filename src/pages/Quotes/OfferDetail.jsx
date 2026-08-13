import React, { useEffect, useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ForumIcon from '@mui/icons-material/Forum';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import Offer from './Offerdel';
import CommunicationLog from '../InvoicePage/Communication';
import QuotesActivity from './QuotesActivity';
import Loader from '../../common/Loader';
import TaskPage from '../Taskcomponent/TaskPage';
import JobDetailPage from '../Jobpage/JobDetailPage';

const OfferDetail = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { Id } = useParams();
  const [notes, setNotes] = useState(null);

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

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading && !data) {
    return <Loader />;
  }

  return (
    <div className="min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 font-sans text-slate-800 dark:text-white transition-colors">
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-boxdark border-b border-slate-200/80 dark:border-strokedark shadow-xs px-4 md:px-6">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: '48px',
            '& .MuiTab-root': {
              minHeight: '48px',
              fontWeight: 700,
              fontSize: '13px',
              textTransform: 'none',
            },
          }}
        >
          <Tab icon={<RequestQuoteIcon fontSize="small" />} iconPosition="start" label="Offer Proposal" />
          <Tab icon={<TimelineIcon fontSize="small" />} iconPosition="start" label="Activity" />
          {data?.job && <Tab icon={<WorkIcon fontSize="small" />} iconPosition="start" label="Linked Job" />}
          {data?.job && <Tab icon={<AssignmentIcon fontSize="small" />} iconPosition="start" label="Tasks" />}
          <Tab icon={<ForumIcon fontSize="small" />} iconPosition="start" label="Communication Log" />
        </Tabs>
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {activeTab === 0 && (
          <Offer fetchInvoice={fetchInvoice} data={data} notes={notes} />
        )}
        {activeTab === 1 && <QuotesActivity invoiceData={data} />}
        {activeTab === 2 && (
          <>
            {data?.job ? (
              <JobDetailPage offer={data?._id} />
            ) : (
              <CommunicationLog id={data?._id} />
            )}
          </>
        )}
        {activeTab === 3 && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark p-4 min-h-[75vh]">
            <TaskPage jobId={data?.job?._id} />
          </div>
        )}
        {activeTab === 4 && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark p-4 min-h-[75vh]">
            <CommunicationLog id={data?._id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OfferDetail;