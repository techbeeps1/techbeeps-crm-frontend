import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import axios from 'axios';
import { toast } from 'react-toastify';
import { apiPath } from '../../../apiPath';

interface LinkQuotePopupProps {
  type?: string;
  quotationData: any;
  fetchInvoice?: () => void;
  className?: string;
}

const LinkQuotePopup: React.FC<LinkQuotePopupProps> = ({
  type,
  quotationData,
  fetchInvoice,
  className,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [jobData, setJobData] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedJob('');
  };

  const handleAllJob = async () => {
    if (!quotationData?.customer?._id) return;
    try {
      const response = await axios.get(
        `${apiPath}/api/jobList?customer=${quotationData.customer._id}`
      );
      setJobData(response.data?.jobList || []);
    } catch (err) {
      console.error('Error fetching customer jobs:', err);
    }
  };

  const handleLink = async () => {
    if (!selectedJob) {
      toast.error('Please select a job to connect.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint =
        type !== 'invoice'
          ? `${apiPath}/finance/update/${quotationData._id}`
          : `${apiPath}/invoice/update/${quotationData._id}`;

      const response = await axios.post(endpoint, { job: selectedJob });

      if (response.status === 200) {
        toast.success(
          `${type === 'invoice' ? 'Invoice' : 'Quote'} connected to job successfully!`
        );
        handleClose();
        if (fetchInvoice) fetchInvoice();

        if (type === 'invoice') {
          await updateJobSchedule(selectedJob, { invoice: quotationData._id });
        } else {
          await updateJobSchedule(selectedJob, { offer: quotationData._id });
        }
      } else {
        toast.error('Failed to link job');
      }
    } catch (error: any) {
      console.error('Error connecting to job:', error);
      toast.error(
        error.response?.data?.message || error.message || 'Error connecting to job'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateJobSchedule = async (jobId: string, updatedData: any) => {
    try {
      await axios.put(`${apiPath}/api/job-schedule/${jobId}`, updatedData);
    } catch (error: any) {
      console.error(
        'Error updating job schedule:',
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    if (quotationData?.customer) {
      handleAllJob();
    }
  }, [quotationData]);

  return (
    <div>
      <button
        type="button"
        onClick={handleOpen}
        className={
          className ||
          'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs'
        }
      >
        <LinkIcon fontSize="small" className="text-amber-600 dark:text-amber-400" />
        <span>Connect to Job</span>
      </button>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: '1rem',
            overflow: 'hidden',
          },
        }}
      >
        <div className="bg-white dark:bg-boxdark text-slate-800 dark:text-slate-100 p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <WorkOutlineIcon fontSize="small" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Connect {type === 'invoice' ? 'Invoice' : 'Quote'} #{quotationData?.index} to Job
                </h3>
                <span className="text-[11px] text-slate-400">
                  Select a registered job for client {quotationData?.customer?.firstName} {quotationData?.customer?.lastName}
                </span>
              </div>
            </div>

            <IconButton
              onClick={handleClose}
              size="small"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Body */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Select Destination Job *
            </label>

            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="">-- Choose Job --</option>
              {jobData && jobData.length > 0 ? (
                jobData.map((job) => (
                  <option key={job._id} value={job._id}>
                    Job #{job.index || job._id?.slice(-6)} - {job.customer?.firstName} {job.customer?.lastName} ({job.stage || 'Active'})
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No available jobs found for this customer
                </option>
              )}
            </select>

            {jobData.length === 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Note: No existing jobs found for this client. Create a job first if needed.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLink}
              disabled={!selectedJob || isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircleOutlineIcon fontSize="small" />
              <span>{isSubmitting ? 'Linking...' : 'Connect to Job'}</span>
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default LinkQuotePopup;
