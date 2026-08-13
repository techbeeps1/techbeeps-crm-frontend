import React, { useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import Loader from '../../common/Loader';
import InvoicePopup from '../InvoicePage/Invoicing';
import LinkQuotePopup from './LinkQuotePopup';
import { toast } from 'react-toastify';

const Offer = ({ data, notes, fetchInvoice }) => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [openPopup, setOpenPopup] = useState(false);

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
    if (s === 'accepted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Accepted
        </span>
      );
    }
    if (s === 'sent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-300">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          Sent
        </span>
      );
    }
    if (s === 'pending') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          Pending
        </span>
      );
    }
    if (s === 'declined') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          Declined
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        {status || 'Draft'}
      </span>
    );
  };

  const clientFullName = `${data.customer?.salutation || ''} ${data.customer?.firstName || ''} ${data.customer?.lastName || ''}`.trim();

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

          {!data.job && (
            <LinkQuotePopup
              type={'quotes'}
              quotationData={data}
              fetchInvoice={fetchInvoice}
            />
          )}

          <button
            type="button"
            onClick={() => navigate(`/offer/${Id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-all cursor-pointer"
          >
            <EditIcon fontSize="small" />
            <span>Edit</span>
          </button>

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
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Status</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
            {data.Status || 'Draft'}
          </span>
        </div>

        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Subtotal</span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 block font-mono">
            $ {(parseFloat(data.subTotal) || 0).toFixed(2)}
          </span>
        </div>

        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">VAT / Tax</span>
          <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block font-mono">
            + $ {(parseFloat(data.btw) || 0).toFixed(2)}
          </span>
        </div>

        <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl border border-primary/20">
          <span className="text-xs font-bold uppercase tracking-wider text-primary block">Grand Total</span>
          <span className="text-2xl font-black text-primary mt-1 block font-mono">
            $ {(parseFloat(data.total) || 0).toFixed(2)}
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
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {data.vat || 'Including VAT'}
              </span>
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
              { label: 'Email', value: data.customer?.email },
              { label: 'Contact Phone', value: data.customer?.contact },
              { label: 'Mobile No', value: data.customer?.mobile },
              { label: 'Language', value: data.customer?.taal },
              { label: 'Customer Type', value: data.customer?.typeOfCustomer },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-boxdark p-2.5 rounded-lg border border-slate-200/60 dark:border-strokedark">
                <span className="text-slate-400 font-medium block">{label}</span>
                <span className="font-bold text-slate-800 dark:text-slate-100 capitalize mt-0.5 block truncate">
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
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-center">BTW %</th>
                <th className="py-3 px-4 text-right">Total ($)</th>
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
                    $ {(parseFloat(item?.price) || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">
                    {item?.btw}%
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    $ {((parseFloat(item?.price) || 0) * (parseFloat(item?.quantity) || 1)).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary Footer */}
        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-strokedark">
          <div className="w-full max-w-xs space-y-2 text-xs font-semibold">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono text-slate-900 dark:text-white">$ {(parseFloat(data?.subTotal) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>VAT / Tax Total</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">+ $ {(parseFloat(data?.btw) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Discount</span>
              <span className="font-mono text-rose-500">- $ {(((parseFloat(data?.subTotal) || 0) * (parseFloat(data?.discount) || 0)) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-strokedark text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Grand Total</span>
              <span className="font-mono text-primary text-base">$ {(parseFloat(data?.total) || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
