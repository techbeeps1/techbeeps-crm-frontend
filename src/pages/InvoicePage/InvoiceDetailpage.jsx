import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentIcon from '@mui/icons-material/Payment';
import TimelineIcon from '@mui/icons-material/Timeline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import Invoice from './InvoiceDetail';
import RecordPayment from './Recordpayment';
import CommunicationLog from './Communication';
import QuotesActivity from '../Quotes/QuotesActivity';
import Loader from '../../common/Loader';
import TaskPage from '../Taskcomponent/TaskPage';
import JobDetailPage from '../Jobpage/JobDetailPage';

const InvoiceDetailpage = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/invoice/invoice/${Id}`);
      setData(response.data?.invoice || null);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [Id]);

  const handleNotes = async () => {
    if (!data?.job?._id) return;
    try {
      const response = await axios.get(
        `${apiPath}/api/notesListByJobId?jobId=${data.job._id}`
      );
      setNotes(response.data?.notesListByJobId || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    if (data?.job) {
      handleNotes();
    }
  }, [data]);

  // Tab definitions
  const tabs = [
    { id: 0, label: 'Invoice', icon: <ReceiptLongIcon style={{ fontSize: 18 }} /> },
    { id: 1, label: 'Payments', icon: <PaymentIcon style={{ fontSize: 18 }} /> },
    { id: 2, label: 'Activity', icon: <TimelineIcon style={{ fontSize: 18 }} /> },
    ...(data?.job
      ? [
          { id: 3, label: 'Job Details', icon: <WorkOutlineIcon style={{ fontSize: 18 }} /> },
          { id: 4, label: 'Tasks', icon: <AssignmentTurnedInIcon style={{ fontSize: 18 }} /> },
        ]
      : []),
    { id: 5, label: 'Communication', icon: <ChatBubbleOutlineIcon style={{ fontSize: 18 }} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 flex flex-col font-sans">
      {loading && <Loader />}

      {/* Modern Top Navigation Bar */}
      <div className="bg-white dark:bg-boxdark border-b border-slate-200/80 dark:border-strokedark sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center overflow-x-auto no-scrollbar gap-2 py-2.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 0 && (
          <Invoice fetchInvoice={fetchInvoice} data={data} notes={notes} />
        )}

        {activeTab === 1 && (
          <RecordPayment invoiceData={data} fetchInvoice={fetchInvoice} />
        )}

        {activeTab === 2 && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs">
            <QuotesActivity invoiceData={data} />
          </div>
        )}

        {activeTab === 3 && data?.job && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs">
            <JobDetailPage invoice={data?._id} />
          </div>
        )}

        {activeTab === 4 && data?.job && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs min-h-[70vh]">
            <TaskPage jobId={data?.job?._id} />
          </div>
        )}

        {(activeTab === 5 || (activeTab === 3 && !data?.job)) && (
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs min-h-[70vh]">
            <CommunicationLog id={data?._id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetailpage;