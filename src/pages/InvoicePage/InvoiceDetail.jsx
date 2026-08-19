import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../apiPath';
import Loader from '../../common/Loader';
import InvoicePopup from './Invoicing';
import LinkQuotePopup from '../Quotes/LinkQuotePopup';

const Invoice = ({ data, notes, fetchInvoice }) => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

  const downloadInvoice = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiPath}/invoice/download`,
        { Id: Id },
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${data?.index || Id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to download invoice PDF');
    } finally {
      setLoading(false);
    }
  };

  const SendInvoice = async (templateId) => {
    setLoading(true);
    let activityData = {
      type: 'offer',
      title: `Invoice is being sent to ${data?.customer?.email || 'customer'}`,
      offer: Id,
      reference: 'admin',
      status: 'pending',
    };
    handleActivity(activityData);

    try {
      const response = await axios.post(`${apiPath}/invoice/send`, {
        Id: Id,
        emailTemplateId: templateId,
      });
      setOpenPopup(false);
      handleActivity({
        type: 'offer',
        title: `Invoice sent successfully to ${data?.customer?.email || 'customer'}`,
        offer: Id,
        reference: 'admin',
        status: 'success',
        email: response.data,
      });
      toast.success('Invoice email sent successfully!');
      if (fetchInvoice) fetchInvoice();
    } catch (error) {
      handleActivity({
        type: 'offer',
        title: `Error sending invoice to ${data?.customer?.email || 'customer'}`,
        offer: Id,
        reference: 'admin',
        status: 'error',
        description: error.message,
      });
      toast.error(error.message || 'Failed to send invoice email');
    } finally {
      setLoading(false);
    }
  };

  const handleActivity = async (activityData) => {
    try {
      await axios.post(`${apiPath}/api/activities`, activityData);
    } catch (error) {
      console.error('Activity error:', error);
    }
  };

  if (!data) {
    return (
      <div className="p-8 text-center bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark">
        <p className="text-sm font-semibold text-slate-500">No invoice details found.</p>
      </div>
    );
  }

  const subTotalNum = Number(data?.subTotal) || 0;
  const totalNum = Number(data?.total) || 0;
  const paidNum = Number(data?.paid) || 0;
  const balanceDue = Math.max(totalNum - paidNum, 0);
  const discountAmount =
    data?.discountedPrice !== undefined
      ? Number(data?.discountedPrice)
      : (subTotalNum * (Number(data?.discount) || 0)) / 100;

  // Status Badge Colors
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'sent':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'pending':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {loading && <Loader />}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-strokedark flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
            title="Go Back"
          >
            <ArrowBackIcon fontSize="small" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Invoice #{data?.index || '...'}
              </h1>
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadge(
                  data?.Status
                )}`}
              >
                {data?.Status || 'Draft'}
              </span>
              {data?.reference && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  Ref: {data.reference}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
              Issued on{' '}
              {data?.date
                ? new Date(data.date).toLocaleDateString('en-GB')
                : new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={downloadInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <PictureAsPdfIcon fontSize="small" className="text-rose-500" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => setOpenPopup(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs"
          >
            <SendIcon fontSize="small" className="text-primary" />
            <span>{data?.Status === 'Sent' ? 'Resend Invoice' : 'Send Invoice'}</span>
          </button>

          {!data?.job && (
            <LinkQuotePopup
              type="invoice"
              quotationData={data}
              fetchInvoice={fetchInvoice}
            />
          )}

          <button
            onClick={() => navigate(`/invoice/${Id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <EditIcon fontSize="small" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Subtotal
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            € {subTotalNum.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Discount: -€ {discountAmount.toFixed(2)}
          </span>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Tax (BTW)
          </span>
          <span className="text-xl font-black text-slate-900 dark:text-white font-mono mt-1 block">
            € {Number(data?.btw || 0).toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 capitalize mt-1 block">
            VAT: {data?.vat || 'exclusive'}
          </span>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Amount
          </span>
          <span className="text-xl font-black text-primary font-mono mt-1 block">
            € {totalNum.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total invoice billing
          </span>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Amount Paid / Balance
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              € {paidNum.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / Due: € {balanceDue.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{
                width: `${totalNum > 0 ? Math.min((paidNum / totalNum) * 100, 100) : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 2-Column Info Grid: Invoice Details & Customer Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Invoice Information */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-strokedark">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ReceiptLongIcon fontSize="small" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Invoice Specifications
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Financial Template</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {data?.financialTemplate?.name || 'Standard Invoice'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">VAT Scenario</span>
              <span className="font-bold text-slate-800 dark:text-white capitalize">
                {data?.vat || 'Exclusive'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Creation Date</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {data?.createdAt
                  ? new Date(data.createdAt).toLocaleDateString('en-GB')
                  : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Issue Date</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {data?.date ? new Date(data.date).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Expiry / Due Date</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {data?.expire_date
                  ? new Date(data.expire_date).toLocaleDateString('en-GB')
                  : '14 days after issue'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Package</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {data?.package?.name || 'Manual / Custom'}
              </span>
            </div>
          </div>

          {data?.discount_description && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark text-xs">
              <span className="text-slate-400 font-bold block mb-0.5">Discount Applied:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {data.discount_description} ({data.discount || 0}%)
              </span>
            </div>
          )}

          {data?.remark && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark text-xs">
              <span className="text-slate-400 font-bold block mb-0.5">Terms / Notes:</span>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {data.remark}
              </p>
            </div>
          )}
        </div>

        {/* Right Card: Customer Information */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <PersonOutlineIcon fontSize="small" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Customer & Client Details
              </h3>
            </div>

            {data?.customer?._id && (
              <button
                onClick={() => navigate(`/customers/${data.customer._id}`)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                View Profile →
              </button>
            )}
          </div>

          {/* Customer Avatar & Main Info */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary font-black flex items-center justify-center text-sm shadow-2xs">
              {(data?.customer?.firstName?.[0] || 'C') +
                (data?.customer?.lastName?.[0] || 'U')}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">
                {data?.customer?.salutation || ''} {data?.customer?.firstName || ''}{' '}
                {data?.customer?.lastName || ''}
              </h4>
              <span className="text-xs text-slate-400">
                {data?.customer?.email || 'No email provided'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-2.5 text-xs pt-1">
            <div>
              <span className="text-slate-400 font-medium block">Phone / Mobile</span>
              <span className="font-bold text-slate-800 dark:text-white">
                {data?.customer?.mobile || data?.customer?.contact || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Customer Type</span>
              <span className="font-bold text-slate-800 dark:text-white capitalize">
                {data?.customer?.typeOfCustomer || data?.customer?.type || 'Individual'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Language</span>
              <span className="font-bold text-slate-800 dark:text-white uppercase">
                {data?.customer?.taal || 'EN'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block">Gender</span>
              <span className="font-bold text-slate-800 dark:text-white capitalize">
                {data?.customer?.gender || 'N/A'}
              </span>
            </div>
          </div>

          {/* Customer Addresses snippet */}
          {data?.customer?.address && data?.customer?.address.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-strokedark">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Address Information:
              </span>
              {data.customer.address.map((addr, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark text-xs flex items-start gap-2.5"
                >
                  <LocationOnOutlinedIcon
                    fontSize="small"
                    className="text-slate-400 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 dark:text-white">
                      {addr.street} {addr.houseNumber} {addr.addition}, {addr.city}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5">
                      <span>{addr.country}</span>
                      {addr.floor && <span>• Floor {addr.floor}</span>}
                      {addr.hasElevator && (
                        <span className="inline-flex items-center gap-0.5 text-primary font-bold">
                          <ElevatorOutlinedIcon style={{ fontSize: 13 }} />
                          <span>Elevator</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Extra Moving Details / Template Custom Inputs */}
      {data?.jobinput && Object.keys(data.jobinput).filter((k) => k !== '_id').length > 0 && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-strokedark">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Inventory2OutlinedIcon fontSize="small" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Template Specific & Moving Specifications
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(data.jobinput)
              .filter(([key]) => key !== '_id')
              .map(([key, value]) => {
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();
                return (
                  <div
                    key={key}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      {formattedKey}
                    </span>
                    <span className="font-black text-xs text-slate-900 dark:text-white mt-0.5 block truncate">
                      {String(value)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Job Notes if linked */}
      {data?.job && (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-strokedark">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <DescriptionOutlinedIcon fontSize="small" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Job Notes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                General Notes
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {notes?.genralNotes || 'No notes available'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                For the Employee
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {notes?.employeeNotes || 'No notes available'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                For the Customer
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {notes?.customerNotes || 'No notes available'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Lines Table & Financial Summary */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-strokedark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ReceiptLongIcon fontSize="small" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Invoice Line Items ({data?.items?.length || 0})
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            EUR (€)
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50/90 dark:bg-slate-800/70 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark">
              <tr>
                <th className="py-3 px-4 w-2/5">Description</th>
                <th className="py-3 px-4 text-center w-24">Quantity</th>
                <th className="py-3 px-4 text-right w-32">Unit Price</th>
                <th className="py-3 px-4 text-center w-24">BTW</th>
                <th className="py-3 px-4 text-right w-36">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.items?.map((item, index) => {
                const qty = Number(item?.quantity) || 1;
                const price = Number(item?.price) || 0;
                const lineTotal = qty * price;
                return (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {item?.description || 'Item description'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600 dark:text-slate-300">
                      {qty}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-600 dark:text-slate-300">
                      € {price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                        {item?.btw !== undefined ? `${item.btw}%` : '21%'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white">
                      € {lineTotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Executive Billing Statement Breakdown */}
        <div className="flex flex-col md:flex-row justify-end">
          <div className="w-full md:w-96 bg-gradient-to-b from-white to-slate-50/80 dark:from-boxdark dark:to-slate-900/60 rounded-2xl border border-slate-200/90 dark:border-strokedark p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 dark:border-strokedark">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                TAX INVOICE STATEMENT
              </span>
              <span className="text-[10px] font-bold text-slate-400">EUR (€)</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  € {subTotalNum.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Discount</span>
                <span
                  className={`font-bold font-mono ${
                    discountAmount > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {discountAmount > 0 ? `- € ${discountAmount.toFixed(2)}` : '€ 0.00'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Total BTW / Tax</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">
                  + € {Number(data?.btw || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  TOTAL DUE
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white border border-white/15">
                  {data?.vat === 'inclusive' ? 'Incl. BTW' : 'Excl. BTW'}
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-400">Total Payable</span>
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  € {totalNum.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Send Popup */}
      <InvoicePopup
        type="invoice"
        status={data?.Status}
        expireDate={data?.expire_date}
        index={data?.index}
        date={data?.date}
        open={openPopup}
        SendInvoice={SendInvoice}
        onClose={() => setOpenPopup(false)}
      />
    </div>
  );
};

export default Invoice;
