import React, { useContext, useState } from 'react';
import { UserContext } from '../../UserContext';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import ElevatorOutlined from '@mui/icons-material/ElevatorOutlined';
import GifBoxOutlined from '@mui/icons-material/GifBoxOutlined';
import ApprovalOutlined from '@mui/icons-material/ApprovalOutlined';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import Loader from '../../common/Loader';
import InvoicePopup from '../InvoicePage/Invoicing';
import LinkQuotePopup from './LinkQuotePopup';
import { toast } from 'react-toastify';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const Offer = ({ data, notes, fetchInvoice }) => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [revising, setRevising] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const [openOnSiteModal, setOpenOnSiteModal] = useState(false);
  const [onSiteCustomerName, setOnSiteCustomerName] = useState('');
  const [onSiteNotes, setOnSiteNotes] = useState('');
  const [onSiteSubmitting, setOnSiteSubmitting] = useState(false);
  const { symbol: currencySymbol } = useCurrency();

  const { role, userData, isAdmin } = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const notify = (message) => toast.success(message);
  const notifyError = (message) =>
    toast.error(message, { autoClose: 2000 });

  const downloadInvoice = async () => {
    if (!Id) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiPath}/finance/download`,
        { Id: Id },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Quotation #${data?.index || 'proposal'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify('PDF downloaded successfully');
    } catch (err) {
      console.error(err);
      notifyError(err.message || 'Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const SendInvoice = async (templateId) => {
    if (!Id) return;
    setLoading(true);
    const activityData = {
      type: 'offer',
      title: `Quotation is sending to ${data?.customer?.email || 'client'}`,
      offer: Id,
      reference: 'admin',
      status: 'success',
    };
    handleActivity(activityData);

    try {
      const response = await axios.post(`${apiPath}/finance/send`, {
        Id: Id,
        emailTemplateId: templateId,
      });
      setOpenPopup(false);
      if (response.status === 200) {
        const successActivity = {
          type: 'offer',
          title: `Quotation sent successfully to ${data?.customer?.email || 'client'}`,
          offer: Id,
          reference: 'admin',
          status: 'success',
          email: response.data,
        };
        handleActivity(successActivity);
      }
      notify('Quotation sent successfully');
    } catch (error) {
      console.error('Error sending quotation:', error);
      notifyError(error.message || 'Failed to send quotation');
      const errorActivity = {
        type: 'offer',
        title: `Error in Quotation sending to ${data?.customer?.email || 'client'}`,
        offer: Id,
        reference: 'admin',
        status: 'error',
        description: error.message,
      };
      handleActivity(errorActivity);
    } finally {
      setLoading(false);
    }
  };

  const handleOnSiteAcceptance = async () => {
    if (!Id) return;
    setOnSiteSubmitting(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      await axios.post(
        `${apiPath}/finance/on-site-accept/${Id}`,
        {
          name: onSiteCustomerName || clientFullName,
          comments: onSiteNotes,
          method: 'ON_SITE_SIGNATURE',
          customerSignature: 'ON_SITE_STAFF_VERIFIED',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      notify('On-site quotation acceptance successfully recorded');
      setOpenOnSiteModal(false);
      if (typeof fetchInvoice === 'function') fetchInvoice();
    } catch (err) {
      console.error('Error in on-site acceptance:', err);
      notifyError(err.response?.data?.message || err.message || 'Failed to record on-site acceptance');
    } finally {
      setOnSiteSubmitting(false);
    }
  };

  const handleCreateRevision = async () => {
    if (!Id) return;
    if (!window.confirm(`Create a new revision of Quotation #${data?.index || ''}? This will freeze the current version and generate version ${(data?.version || 1) + 1}.`)) {
      return;
    }
    setRevising(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${apiPath}/finance/revise/${Id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      notify(`Revision created: #${response.data?.newQuote?.index || 'New revision'}`);
      if (typeof fetchInvoice === 'function') fetchInvoice();
      navigate(`/offer/${response.data?.newQuote?._id}`);
    } catch (err) {
      console.error('Error creating revision:', err);
      notifyError(err.response?.data?.message || err.message || 'Failed to create revision');
    } finally {
      setRevising(false);
    }
  };

  const handleActivity = async (activityData) => {
    try {
      await axios.post(`${apiPath}/api/activities`, activityData);
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  };

  if (!data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-boxdark rounded-2xl shadow-sm border border-slate-200 dark:border-strokedark text-slate-500">
        Loading quotation details...
      </div>
    );
  }

  const getStatusBadge = (status = '') => {
    const s = (status || '').toLowerCase();
    if (data?.isSuperseded || s === 'superseded') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          Superseded (v{data?.version || 1})
        </span>
      );
    }
    if (s === 'rejected' || s === 'declined') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Rejected
        </span>
      );
    }
    if (s === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Accepted {data?.version > 1 ? `(v${data.version})` : ''}
        </span>
      );
    }
    if (s === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Sent {data?.version > 1 ? `(v${data.version})` : ''}
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Pending {data?.version > 1 ? `(v${data.version})` : ''}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        {status || 'Draft'} {data?.version > 1 ? `(v${data.version})` : ''}
      </span>
    );
  };

  const clientFullName = `${data.customer?.salutation || ''} ${data.customer?.firstName || ''} ${data.customer?.lastName || ''}`.trim();

  // Financial & VAT Transparency calculations
  const vatStr = String(data?.vat || '').toLowerCase();
  const isInclusive = vatStr === 'inclusive' || vatStr.includes('incl');

  const subTotalNum = parseFloat(data?.subTotal) || 0;
  const discountPct = parseFloat(data?.discount) || 0;
  const discountAmount = (subTotalNum * discountPct) / 100;
  const discountedSubtotal = Math.max(0, subTotalNum - discountAmount);
  const taxAmount = parseFloat(data?.btw) || 0;
  const totalAmount = parseFloat(data?.total) || (isInclusive ? discountedSubtotal : discountedSubtotal + taxAmount);
  const netAmount = isInclusive ? Math.max(0, discountedSubtotal - taxAmount) : discountedSubtotal;

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-4 md:p-8 font-sans text-slate-800 dark:text-white space-y-6">
      {loading && <Loader />}

      {/* Top Action Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-200 dark:border-strokedark">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all cursor-pointer shadow-xs"
          >
            <KeyboardBackspaceIcon fontSize="small" />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Quotation #{data.index || 'N/A'}
              </h1>
              {getStatusBadge(data.Status)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Created for <span className="font-bold text-slate-800 dark:text-slate-200">{clientFullName}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={downloadInvoice}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <PictureAsPdfIcon fontSize="small" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setOpenPopup(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <SendIcon fontSize="small" />
            <span>{data.Status === 'Sent' ? 'Resend Quotation' : 'Send Quotation'}</span>
          </button>

          {isUserAdmin && !data.job && (
            <LinkQuotePopup
              type={'quotes'}
              quotationData={data}
              fetchInvoice={fetchInvoice}
            />
          )}

          {isUserAdmin && (
            <button
              type="button"
              disabled={data.Status === 'Accepted' || data.isSuperseded}
              title={
                data.Status === 'Accepted'
                  ? 'Accepted quotation is frozen. Click "Create Revision" to propose changes.'
                  : data.isSuperseded
                  ? 'Superseded quotation cannot be edited. Please view active revision.'
                  : 'Edit Offer'
              }
              onClick={() => {
                if (data.Status === 'Accepted' || data.isSuperseded) return;
                navigate(`/offer/${Id}`);
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs transition-all ${
                data.Status === 'Accepted' || data.isSuperseded
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 pointer-events-auto'
                  : 'border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
              }`}
            >
              <EditIcon fontSize="small" />
              <span>Edit</span>
            </button>
          )}

          {isUserAdmin && !data.isSuperseded && (
            <button
              type="button"
              onClick={handleCreateRevision}
              disabled={revising}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <HistoryIcon fontSize="small" />
              <span>{revising ? 'Revising...' : 'Create Revision'}</span>
            </button>
          )}

          {isUserAdmin && data.Status !== 'Accepted' && (
            <button
              type="button"
              onClick={() => {
                setOnSiteCustomerName(clientFullName);
                setOpenOnSiteModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <ApprovalOutlined fontSize="small" />
              <span>On-Site Acceptance</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

        <InvoicePopup
          type={'quote'}
          status={data?.Status}
          index={data?.index}
          date={data?.date}
          expireDate={data?.expire_date}
          open={openPopup}
          SendInvoice={SendInvoice}
          onClose={() => setOpenPopup(false)}
        />

        {/* On-Site Acceptance Dialog */}
        <Dialog
          open={openOnSiteModal}
          onClose={() => !onSiteSubmitting && setOpenOnSiteModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <div className="p-6 bg-white dark:bg-boxdark font-sans">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-strokedark">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <ApprovalOutlined />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Record On-Site Acceptance
                </h3>
              </div>
              <IconButton
                size="small"
                onClick={() => setOpenOnSiteModal(false)}
                disabled={onSiteSubmitting}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                Record the customer's on-site agreement and freeze the eligible version with staff provenance.
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Signatory Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={onSiteCustomerName}
                  onChange={(e) => setOnSiteCustomerName(e.target.value)}
                  placeholder="Full name of customer accepting"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  On-Site Notes / Agreed Instructions
                </label>
                <textarea
                  rows={3}
                  value={onSiteNotes}
                  onChange={(e) => setOnSiteNotes(e.target.value)}
                  placeholder="Notes on client consent, agreed start time or on-site remarks..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-200 text-[11px] font-semibold leading-relaxed">
                By confirming, you verify that the customer reviewed and accepted the quotation. An immutable agreement snapshot and staff actor record will be permanently generated.
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpenOnSiteModal(false)}
                disabled={onSiteSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOnSiteAcceptance}
                disabled={onSiteSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {onSiteSubmitting ? 'Recording Acceptance...' : 'Confirm & Freeze Quotation'}
              </button>
            </div>
          </div>
        </Dialog>
      </div>

      {/* Superseded Warning Banner */}
      {data.isSuperseded && (
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-purple-900 dark:text-purple-200">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0 animate-pulse"></span>
            <div>
              <p className="font-bold">This quotation version (v{data.version || 1}) has been superseded.</p>
              <p className="text-purple-700 dark:text-purple-300">
                {data.supersededBy?.index
                  ? `Active revision is #${data.supersededBy.index} (v${data.supersededBy.version || 2}).`
                  : 'A newer revision has superseded this document.'}
              </p>
            </div>
          </div>
          {data.supersededBy?._id && (
            <button
              type="button"
              onClick={() => navigate(`/offer-detail/${data.supersededBy._id}`)}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              View Active Revision
            </button>
          )}
        </div>
      )}

      {/* Predecessor Link Banner */}
      {data.parentQuote && (
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-strokedark rounded-2xl p-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Revision Lineage:</span>
            <span>Created from predecessor Quotation #{data.parentQuote?.index || 'N/A'} (v{data.parentQuote?.version || 1})</span>
          </div>
          {data.parentQuote?._id && (
            <button
              type="button"
              onClick={() => navigate(`/offer-detail/${data.parentQuote._id}`)}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              View Predecessor
            </button>
          )}
        </div>
      )}

      {/* Rejection Banner */}
      {(data.Status === 'Rejected' || data.Status === 'Declined') && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center gap-2.5 text-xs text-rose-900 dark:text-rose-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0"></span>
          <div>
            <p className="font-bold">Quotation Declined / Rejected</p>
            <p className="text-rose-700 dark:text-rose-300">
              Reason: {data.rejectionReason || 'Customer declined proposal'}
              {data.rejectedAt ? ` (${new Date(data.rejectedAt).toLocaleDateString('en-GB')})` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Acceptance Provenance & Audit Card (Shown when quote is Accepted) */}
      {data.Status === 'Accepted' && (
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Legally Bound & Accepted Quotation</span>
            </div>
            {data.acceptance?.acknowledgementEvent?.eventId && (
              <span className="text-[11px] font-mono bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded font-bold border border-emerald-200 dark:border-emerald-800">
                Ref: {data.acceptance.acknowledgementEvent.eventId}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/90 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Accepted By</span>
              <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">
                {data.acceptance?.customerIdentity?.name || clientFullName || 'Client'}
              </span>
              <span className="text-slate-400 text-[11px] block">{data.acceptance?.customerIdentity?.email || data.customer?.email}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Acceptance Method</span>
              <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">
                {data.acceptance?.method === 'ON_SITE_SIGNATURE' ? '✍️ On-Site Signature' : '🌐 Customer Public Link'}
              </span>
              {data.acceptance?.staffActor?.name && (
                <span className="text-purple-600 dark:text-purple-400 text-[11px] font-semibold block">
                  Staff: {data.acceptance.staffActor.name} ({data.acceptance.staffActor.role})
                </span>
              )}
            </div>
            <div className="bg-white/90 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Confirmation Timestamp</span>
              <span className="font-mono font-bold text-slate-800 dark:text-white mt-0.5 block">
                {data.acceptance?.acceptedAt ? new Date(data.acceptance.acceptedAt).toLocaleString('en-GB') : (data.acceptedAt ? new Date(data.acceptedAt).toLocaleString('en-GB') : 'Recorded')}
              </span>
              <span className="text-slate-400 text-[11px] block">Version: v{data.acceptance?.acceptedVersion || data.version || 1}</span>
            </div>
            <div className="bg-white/90 dark:bg-slate-800/80 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Frozen Total</span>
              <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm mt-0.5 block">
                {formatCurrency(data.acceptance?.immutableAgreementSnapshot?.total || totalAmount)}
              </span>
              <span className="text-slate-400 text-[10px] block">Snapshot immutable</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Status</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
            {data.Status || 'Draft'}
          </span>
        </div>

        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Subtotal {isInclusive ? '(Gross)' : '(Net)'}
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block font-mono">
            {formatCurrency(subTotalNum)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {isInclusive ? 'Prices include VAT' : 'Before VAT calculation'}
          </span>
        </div>

        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            {isInclusive ? 'Included VAT / BTW' : 'Added VAT / BTW'}
          </span>
          <span
            className={`text-xl font-extrabold mt-1 block font-mono ${isInclusive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-blue-600 dark:text-blue-400'
              }`}
          >
            {isInclusive ? formatCurrency(taxAmount) : `+ ${formatCurrency(taxAmount)}`}
          </span>
          <span
            className={`text-[11px] font-semibold mt-0.5 inline-flex items-center gap-1 ${isInclusive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-blue-600 dark:text-blue-400'
              }`}
          >
            {isInclusive ? '✓ Already in Subtotal' : '+ Added to total'}
          </span>
        </div>

        <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl border border-primary/20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">
            Grand Total (Incl. VAT)
          </span>
          <span className="text-2xl font-black text-primary mt-1 block font-mono">
            {formatCurrency(totalAmount)}
          </span>
          <span className="text-[11px] font-bold text-primary/80 mt-0.5 block">
            Final payable amount
          </span>
        </div>
      </div>

      {/* 2-Column Grid: Quotation & Customer Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Details */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200/60 dark:border-strokedark">
            <DescriptionIcon fontSize="small" className="text-primary" />
            <span>Quotation Parameters</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
              <span className="text-slate-400 font-semibold block">Template</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {data.financialTemplate?.name || 'Standard Template'}
              </span>
            </div>

            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
              <span className="text-slate-400 font-semibold block">VAT Scenario</span>
              <div className="mt-1 flex items-center">
                {isInclusive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Including VAT (Inclusive)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300 dark:border-blue-600/40">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Excluding VAT (Exclusive)
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
              <span className="text-slate-400 font-semibold block">Created Date</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>

            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
              <span className="text-slate-400 font-semibold block">Offered Date</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                {data.date ? new Date(data.date).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>

            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
              <span className="text-slate-400 font-semibold block">Expiry Date</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                {data.expire_date ? new Date(data.expire_date).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>

            <div className="bg-white dark:bg-boxdark p-3 rounded-xl border border-slate-200/60 dark:border-strokedark">
              <span className="text-slate-400 font-semibold block">Accepted Date</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {data.Status === 'Accepted' ? 'Accepted' : 'Not yet accepted'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Profile & Registered Address */}
        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-strokedark">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <PersonIcon fontSize="small" className="text-primary" />
              <span>Customer Details ({data.customer?.type || 'Customer'})</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate(`/customers/${data?.customer?._id}`)}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Go to Customer Profile →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Name', value: clientFullName },
              { label: 'Gender', value: data.customer?.gender },
              { label: 'Email', value: data.customer?.email, noCapitalize: true },
              { label: 'Contact Phone', value: data.customer?.contact, noCapitalize: true },
              { label: 'Mobile No', value: data.customer?.mobile, noCapitalize: true },
              { label: 'Language', value: data.customer?.taal, noCapitalize: false },
              { label: 'Customer Type', value: data.customer?.typeOfCustomer, noCapitalize: false },
            ].map(({ label, value, noCapitalize }) => (
              <div key={label} className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                <span className="text-slate-400 font-medium block">{label}</span>
                <span className={`font-bold text-slate-800 dark:text-slate-100 ${noCapitalize ? '' : 'capitalize'} mt-0.5 block truncate`}>
                  {value || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Addresses */}
      {data?.customer?.address?.length > 0 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <LocationOnIcon fontSize="small" className="text-primary" />
            <span>Customer Registered Addresses</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.customer.address.map((item, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase text-slate-500">{item.addressType || 'Head Address'}</span>
                  <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{item.typeOfProperty || 'Property'}</span>
                </div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm capitalize">
                  Floor {item.floor || '0'}, House {item.houseNumber || '0'} {item.addition || ''} {item.street} {item.city} {item.country}
                </p>
                <div className="flex items-center gap-3 text-slate-500 pt-1 border-t border-slate-200/60 dark:border-strokedark">
                  {item.hasElevator && <span className="inline-flex items-center gap-1"><ElevatorOutlined fontSize="small" /> Lift Available</span>}
                  {item.deliveringBoxes && <span className="inline-flex items-center gap-1"><GifBoxOutlined fontSize="small" /> Box Delivery</span>}
                  {item.applyForPermit && <span className="inline-flex items-center gap-1"><ApprovalOutlined fontSize="small" /> Permit Required</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Template Inputs (Moving Details) */}
      {data.jobinput && Object.keys(data.jobinput).length > 0 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Relocation & Service Requirements
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(data.jobinput)
              .filter(([key]) => key !== '_id')
              .map(([key, value]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();

                return (
                  <div key={key} className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-400 font-medium block">{formattedKey}</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Itemized Line Items Table */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden space-y-4 p-5">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Itemized Quotation Line Items
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-strokedark bg-slate-100/70 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-1/2">Description</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">
                  <span>Unit Price</span>
                  <span className="normal-case text-[10px] text-slate-400 block font-normal">
                    {isInclusive ? '(Incl. VAT)' : '(Excl. VAT)'}
                  </span>
                </th>
                <th className="py-3 px-4 text-center">BTW %</th>
                <th className="py-3 px-4 text-right">
                  <span>Total ({currencySymbol})</span>
                  <span className="normal-case text-[10px] text-slate-400 block font-normal">
                    {isInclusive ? '(Incl. VAT)' : '(Excl. VAT)'}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-strokedark font-medium">
              {data?.items?.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-meta-4/30 transition-colors">
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-semibold">{item?.description}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                    {item?.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {formatCurrency(item?.price || 0)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">
                    {item?.btw}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item?.lineTotal !== undefined ? item.lineTotal : ((parseFloat(item?.price) || 0) * (item?.quantity !== undefined && item?.quantity !== null && item?.quantity !== '' ? Number(item?.quantity) : 0)))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Footer */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-6 border-t border-slate-200/80 dark:border-strokedark">
          {/* Explanatory Tax Policy Note */}
          <div className="max-w-md p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">

          </div>

          {/* Detailed Breakdown Card */}
          <div className="w-full max-w-sm bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2.5 text-xs font-semibold">
            {/* Subtotal */}
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Subtotal {isInclusive ? '(Gross / Incl. VAT)' : '(Net / Excl. VAT)'}</span>
              <span className="font-mono text-slate-900 dark:text-white font-bold">{formatCurrency(subTotalNum)}</span>
            </div>

            {/* Discount */}
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-rose-600 dark:text-rose-400">
                <span>Discount ({discountPct}%)</span>
                <span className="font-mono font-bold">- {formatCurrency(discountAmount)}</span>
              </div>
            )}

            {/* Net Amount & Tax Line */}
            {isInclusive ? (
              <>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-1.5 border-t border-dashed border-slate-200 dark:border-slate-700">
                  <span>Net Amount (Excl. VAT)</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{formatCurrency(netAmount)}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>✓</span> Included VAT / BTW
                  </span>
                  <span className="font-mono font-black">{formatCurrency(taxAmount)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span>+</span> Added VAT / BTW
                  </span>
                  <span className="font-mono font-black">+ {formatCurrency(taxAmount)}</span>
                </div>
              </>
            )}

            {/* Grand Total */}
            <div className="flex justify-between items-center pt-2.5 border-t-2 border-slate-300 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
              <div className="flex flex-col">
                <span>Grand Total</span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {isInclusive ? '(Inclusive of VAT)' : '(Incl. calculated VAT)'}
                </span>
              </div>
              <span className="font-mono text-primary text-xl font-black">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
