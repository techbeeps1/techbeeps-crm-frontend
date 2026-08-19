import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  FilterList as FilterListIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Visibility as VisibilityIcon
} from "@mui/icons-material";
import CloseIcon from '@mui/icons-material/Close';
import axios from "axios";
import { apiPath } from "../../../apiPath";
import { toast } from 'react-toastify';
import Loader from "../../common/Loader";

interface Activity {
  _id?: string;
  type: string;
  title: string;
  comment: string;
  description: string;
  date: string;
  status?: string;
  sender: string;
  email: string;
}

const QuotesActivity: React.FC<{ invoiceData: any }> = ({ invoiceData }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [emailData, setEmailData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [emailLoading, setEmailLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<string>('all');

  const notifyError = (message: string) => toast.error(message, {
    autoClose: 2000,
  });

  const handleActivity = async () => {
    setLoading(true);

    if (!invoiceData?._id) {
      setActivities([]);
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`${apiPath}/api/activities?offer=${invoiceData?._id}`);
      setActivities(response.data.toReversed() || []);
    } catch (error: any) {
      notifyError(`Error: ${error.message || error}`);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmail = async (emailId: string) => {
    setEmailLoading(true);
    setIsModalOpen(true);
    try {
      let response = await axios.get(`${apiPath}/api/emails/${emailId}`);
      setEmailData(response.data);
    } catch (error: any) {
      notifyError(`Error fetching email: ${error.message}`);
    } finally {
      setEmailLoading(false);
    }
  };

  function formatDate(dateString: string): string {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  useEffect(() => {
    handleActivity();
  }, [invoiceData?._id]);

  const filteredActivities = useMemo(() => {
    if (!activities || !Array.isArray(activities)) return [];
    if (filterType === 'all') return activities;
    if (filterType === 'emails') {
      return activities.filter((a) => a.email || (a.type || '').toLowerCase().includes('email') || (a.title || '').toLowerCase().includes('email'));
    }
    if (filterType === 'updates') {
      return activities.filter((a) => !a.email && !(a.type || '').toLowerCase().includes('email'));
    }
    return activities;
  }, [activities, filterType]);

  const getActivityStyle = (activity: Activity) => {
    const status = (activity.status || activity.type || '').toLowerCase();
    const title = (activity.title || '').toLowerCase();

    if (activity.email || status.includes('email') || title.includes('email')) {
      return {
        icon: <CheckCircleIcon style={{ fontSize: 18 }} />,
        iconBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',

        badge: 'Success',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
      };

    }
    if (status.includes('success') || status.includes('accept') || title.includes('accepted') || title.includes('sent')) {
      return {
        icon: <EmailIcon style={{ fontSize: 18 }} />,
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        badge: 'Sending ',
        badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
      };
    }
    if (status.includes('error') || status.includes('warn') || status.includes('reject')) {
      return {
        icon: <WarningIcon style={{ fontSize: 18 }} />,
        iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
        badge: 'Notice',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
      };
    }
    return {
      icon: <TimelineIcon style={{ fontSize: 18 }} />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
      badge: 'Activity',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* Header with Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80 dark:border-strokedark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <TimelineIcon />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Activity Timeline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trail of quotation events, email deliveries, and status updates
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all'
              ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            All ({activities.length})
          </button>
          <button
            onClick={() => setFilterType('emails')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'emails'
              ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            Emails
          </button>
          <button
            onClick={() => setFilterType('updates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'updates'
              ? 'bg-white dark:bg-boxdark text-primary shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
          >
            Updates
          </button>
        </div>
      </div>

      {loading && <Loader />}

      {/* Modern Activity Feed List */}
      {!loading && filteredActivities.length > 0 && (
        <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {filteredActivities.map((activity, index) => {
            const style = getActivityStyle(activity);
            return (
              <div key={activity._id || index} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-6 md:-left-8 top-1.5 w-7 h-7 rounded-full flex items-center justify-center shadow-xs z-10 ${style.iconBg}`}>
                  {style.icon}
                </div>

                {/* Activity Card */}
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 shadow-xs hover:shadow-md transition-all group-hover:border-primary/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badgeColor}`}>
                        {style.badge}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                        {activity.title || "Quotation Event"}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      <AccessTimeIcon style={{ fontSize: 14 }} />
                      <span>{formatDate(activity.date)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    {activity.description && (
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                        {activity.description}
                      </p>
                    )}
                    {activity.comment && (
                      <p className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 italic">
                        "{activity.comment}"
                      </p>
                    )}
                  </div>

                  {/* Footer / Sender & Email Trigger */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    {activity.sender ? (
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <PersonIcon style={{ fontSize: 14 }} />
                        <span>By <strong className="text-slate-700 dark:text-slate-300">{activity.sender}</strong></span>
                      </div>
                    ) : <div />}

                    {activity.email && (
                      <button
                        onClick={() => fetchEmail(activity.email)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs text-primary bg-primary/10 hover:bg-primary hover:text-white dark:bg-primary/20 dark:hover:bg-primary transition-all cursor-pointer shadow-xs"
                      >
                        <VisibilityIcon style={{ fontSize: 15 }} />
                        <span>View Email Message</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <TimelineIcon style={{ fontSize: 32 }} />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Activities Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {filterType === 'all'
              ? 'No activity logs have been recorded for this quotation yet.'
              : `No ${filterType} match your current filter.`}
          </p>
        </div>
      )}

      {/* Modern Superhuman/Gmail-Style Email Reader Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center bg-slate-50 dark:bg-boxdark border-b border-slate-200/80 dark:border-strokedark p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <MarkEmailReadIcon />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {emailData?.subject || "Email Preview"}
              </h3>
              <p className="text-xs text-slate-400">
                {emailData ? formatDate(emailData.sentAt) : 'Loading message details...'}
              </p>
            </div>
          </div>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-5 sm:p-6 space-y-4">
          {emailLoading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : (
            <>
              {/* Sender & Recipient Box */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">From:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{emailData?.from || 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-primary font-bold text-[11px] hover:underline"
                  >
                    {showDetails ? 'Hide Details' : 'View Headers'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500">To:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{emailData?.recipient || 'N/A'}</span>
                </div>

                {showDetails && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-500 text-[11px] space-y-1">
                    <p><strong className="text-slate-700 dark:text-slate-300">Message ID:</strong> {emailData?._id}</p>
                    <p><strong className="text-slate-700 dark:text-slate-300">Delivered:</strong> {formatDate(emailData?.sentAt)}</p>
                  </div>
                )}
              </div>

              {/* Email Rendered Content */}
              <div className="p-4 bg-white dark:bg-boxdark rounded-2xl border border-slate-200/60 dark:border-strokedark text-slate-800 dark:text-slate-100 text-sm leading-relaxed overflow-x-auto min-h-[160px]">
                {emailData?.htmlContent ? (
                  <div dangerouslySetInnerHTML={{ __html: emailData.htmlContent }} />
                ) : (
                  <p className="text-slate-400 italic">No message content available.</p>
                )}
              </div>
            </>
          )}
        </DialogContent>

        <DialogActions className="p-4 bg-slate-50 dark:bg-boxdark border-t border-slate-200/80 dark:border-strokedark">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 transition-colors"
          >
            Close
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QuotesActivity;
