import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath.tsx';
import { useParams, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WcIcon from '@mui/icons-material/Wc';
import ExploreIcon from '@mui/icons-material/Explore';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

import Loader from '../../common/Loader/index.tsx';
import toast from 'react-hot-toast';

import EditUserLead from './EditUserLead.jsx';
import ConvertAsCustomer from './ConvertAsCustomer.jsx';

const LeadDetail = () => {
  const [customerData, setcustomerData] = useState<any>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const handleCustomer = async () => {
    try {
      const response = await fetch(`${apiPath}/leads/lead/${id}`);
      const data = await response.json();

      if (data.success === true) {
        setcustomerData(data.data);
      } else {
        navigate('/leads');
      }
    } catch (error) {
      console.error('Error fetching lead detail:', error);
      navigate('/leads');
    }
  };

  useEffect(() => {
    handleCustomer();
  }, [id]);

  const handleClickOutside = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setIsRemoveModalOpen(false);
    }
  };

  const deleteCustomer = async () => {
    try {
      const response = await axios.delete(`${apiPath}/leads/lead/${id}`);
      if (response.data.success) {
        toast.success('Lead deleted successfully!');
        setIsRemoveModalOpen(false);
        navigate('/leads');
      } else {
        toast.error('Error deleting lead');
        console.error('Error deleting lead:', response.data.msg);
      }
    } catch (error) {
      toast.error('Error deleting lead');
      console.error('Error deleting lead:', error);
    }
  };

  if (customerData == null) {
    return <Loader />;
  }

  // Dynamic Avatar Initials
  const getInitials = (firstName?: string, lastName?: string) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'L';
  };

  // Dynamic Status Badge renderer
  const getStatusBadge = (status?: string) => {
    const s = status ? status.toString().trim().toLowerCase() : '';
    if (s === 'converted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          Converted
        </span>
      );
    } else if (s === 'new') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          New
        </span>
      );
    } else if (s === 'contacted' || s === 'in progress') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60">
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          {status}
        </span>
      );
    } else if (s === 'lost' || s === 'rejected' || s === 'not interested') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          {status}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          {status || 'Pending'}
        </span>
      );
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 p-4 md:p-6 space-y-6 font-sans">
      {/* Top Navigation & Executive Action Header */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Back Button & Lead Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-xs cursor-pointer"
            title="Back to Leads"
          >
            <ArrowBackIcon style={{ fontSize: 20 }} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {customerData?.firstName} {customerData?.lastName}
              </h1>
              {getStatusBadge(customerData?.status)}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Lead #{customerData?.leadIndex || customerData?.customerIndex || id}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Convert Button */}
          <button
            disabled={customerData?.status === 'Converted'}
            onClick={() => customerData?.status !== 'Converted' && setIsMergeModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <SwapHorizIcon style={{ fontSize: 18 }} />
            <span>Convert as Customer</span>
          </button>

          {/* Edit Lead Button */}
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <EditIcon style={{ fontSize: 18 }} />
            <span>Edit Lead</span>
          </button>

          {/* Delete Lead Button */}
          <button
            onClick={() => setIsRemoveModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <DeleteIcon style={{ fontSize: 18 }} />
            <span>Remove Lead</span>
          </button>
        </div>
      </div>

      {/* Hidden Edit Lead Modal Wrapper */}
      <EditUserLead
        setOpen={setOpen}
        open={open}
        handler={handleCustomer}
        customerData={customerData}
      />

      {/* Main Details Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-600 text-white text-2xl font-extrabold flex items-center justify-center mx-auto shadow-md shadow-primary/20">
            {getInitials(customerData?.firstName, customerData?.lastName)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
              {customerData?.firstName} {customerData?.lastName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {customerData?.typeOfCustomer || 'Individual'} Lead
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-strokedark flex justify-center gap-2">
            {getStatusBadge(customerData?.status)}
          </div>
        </div>

        {/* Right Columns: Detailed Information Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-3">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <EmailIcon style={{ fontSize: 18 }} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Email Address</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {customerData?.email || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <PhoneIcon style={{ fontSize: 18 }} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase">Contact Number</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {customerData?.contact || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal & Address Details Card */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-3">
              Personal & Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Type */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <BusinessIcon style={{ fontSize: 16 }} />
                  <span>Customer Type</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {customerData?.typeOfCustomer || 'N/A'}
                </p>
              </div>

              {/* Gender */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <WcIcon style={{ fontSize: 16 }} />
                  <span>Gender</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {customerData?.gender || 'N/A'}
                </p>
              </div>

              {/* City */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <LocationOnIcon style={{ fontSize: 16 }} />
                  <span>City</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {customerData?.city || 'N/A'}
                </p>
              </div>

              {/* Postal Code */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <LocationOnIcon style={{ fontSize: 16 }} />
                  <span>Postal Code</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {customerData?.postcode || 'N/A'}
                </p>
              </div>

              {/* Source / Find Us */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <ExploreIcon style={{ fontSize: 16 }} />
                  <span>Source (Find Us)</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {customerData?.findUs || 'N/A'}
                </p>
              </div>

              {/* Language */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <LanguageIcon style={{ fontSize: 16 }} />
                  <span>Language</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {customerData?.taal || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glassmorphism Remove Customer Dialog */}
      {isRemoveModalOpen && (
        <div
          id="modalBackdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 transition-all"
          onClick={handleClickOutside}
        >
          <div
            className="bg-white dark:bg-boxdark rounded-2xl shadow-2xl border border-slate-100 dark:border-strokedark p-6 max-w-md w-full animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 mx-auto mb-4">
              <DeleteIcon style={{ fontSize: 30 }} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
              Delete Lead?
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {customerData?.firstName} {customerData?.lastName}
              </span>
              ? All associated information will be retained as anonymous data.
            </p>

            <div className="flex items-center gap-3">
              <button
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                onClick={() => setIsRemoveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
                onClick={() => deleteCustomer()}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert As Customer Modal */}
      <ConvertAsCustomer
        setOpen={setIsMergeModalOpen}
        open={isMergeModalOpen}
        handler={handleCustomer}
        customerData={customerData}
      />
    </div>
  );
};

export default LeadDetail;

