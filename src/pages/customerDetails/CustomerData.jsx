import React, { useEffect, useState } from 'react';
import EditCustomer from '../EditTemplateForm/editCustomer.jsx';
import { apiPath } from '../../../apiPath.tsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import WcIcon from '@mui/icons-material/Wc';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ElevatorIcon from '@mui/icons-material/Elevator';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CustomerAddress from './CustomerAddress.tsx';
import toast from 'react-hot-toast';

const CustomerData = ({ customerData, handleCustomer }) => {
  const [customersList, setCustomersList] = useState([]);
  const [type, setType] = useState(customerData?.type || 'Customer');
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const navigateTo = useNavigate();

  const closeRemoveModal = () => {
    setIsRemoveModalOpen(false);
  };

  const deleteCustomer = async () => {
    try {
      const response = await axios.delete(`${apiPath}/customer/deleteCustomer/${customerData._id}`);
      if (response.data.status) {
        closeRemoveModal();
        handleCustomer();
        toast.success('Customer deleted successfully!');
        navigateTo(-1);
      } else {
        toast.error('Error deleting customer');
        console.error('Error deleting customer:', response.data.msg);
      }
    } catch (error) {
      toast.error('Error deleting customer');
      console.error('Error deleting customer:', error);
    }
  };

  async function fetchCustomers() {
    try {
      const response = await axios.get(`${apiPath}/customer/customerList`);
      setCustomersList(response.data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleEditSubmit = async (editedData) => {
    try {
      const response = await fetch(
        `${apiPath}/customer/editCustomer/${editedData._id}`,
        {
          method: 'PUT',
          body: JSON.stringify(editedData),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.ok) {
        handleCustomer();
        toast.success('Customer updated successfully!');
      } else {
        console.error('Error updating customer:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleClickOutside = (event) => {
    if (event.target.id === 'modalBackdrop') {
      closeRemoveModal();
    }
  };

  // Helper for Name Initials
  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return (f + l) || 'C';
  };

  return (
    <div className="w-full min-h-[calc(100vh-84px)] bg-slate-50/50 dark:bg-boxdark-2 p-4 md:p-6 space-y-6 font-sans">
      {/* Top Header & Executive Action Bar */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Back Button & Customer Name */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('/customers')}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all shadow-xs cursor-pointer"
            title="Back to Customers"
          >
            <ArrowBackIcon style={{ fontSize: 20 }} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                {customerData?.salutation} {customerData?.firstName} {customerData?.lastName}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active Customer
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Customer ID #{customerData?.customerIndex || customerData?._id}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Start New Valuation */}
          <button
            onClick={() => navigateTo(`/intake/customer/${customerData._id}`)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <AssessmentIcon style={{ fontSize: 18 }} />
            <span>Start New Valuation</span>
          </button>

          {/* Edit Customer Trigger */}
          <EditCustomer
            customerData={customerData}
            handleEditSubmit={handleEditSubmit}
            formType="customer"
            handleCustomer={handleCustomer}
          />

          {/* Remove Customer Button */}
          <button
            onClick={() => setIsRemoveModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <DeleteIcon style={{ fontSize: 18 }} />
            <span>Remove Customer</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-6 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-emerald-600 text-white text-2xl font-extrabold flex items-center justify-center mx-auto shadow-md shadow-primary/20">
            {getInitials(customerData?.firstName, customerData?.lastName)}
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">
              {customerData?.salutation} {customerData?.firstName} {customerData?.lastName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
              {customerData?.typeOfCustomer || 'Individual'} Customer
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-strokedark flex justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800">
              {customerData?.typeOfCustomer || 'Customer'}
            </span>
          </div>
        </div>

        {/* Right Columns: Detailed Info & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-strokedark pb-3">
              Contact & Profile Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Email */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <EmailIcon style={{ fontSize: 16 }} />
                  <span>Email Address</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {customerData?.email || 'N/A'}
                </p>
              </div>

              {/* Contact */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <PhoneIcon style={{ fontSize: 16 }} />
                  <span>Contact Phone</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {customerData?.contact || 'N/A'}
                </p>
              </div>

              {/* Mobile */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <SmartphoneIcon style={{ fontSize: 16 }} />
                  <span>Mobile Number</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {customerData?.mobile || 'N/A'}
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

              {/* Customer Type */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                  <BusinessIcon style={{ fontSize: 16 }} />
                  <span>Type</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                  {customerData?.typeOfCustomer || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-strokedark pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Registered Addresses
              </h3>
              <EditCustomer
                customerData={customerData}
                handleEditSubmit={handleEditSubmit}
                formType="address"
                handleCustomer={handleCustomer}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customerData?.address && customerData.address.length > 0 ? (
                customerData.address.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {item.addressType || 'Primary'} Address
                      </span>
                      <CustomerAddress
                        handleCustomer={handleCustomer}
                        address={item}
                        customerId={customerData._id}
                      />
                    </div>

                    <div className="text-xs text-slate-700 dark:text-slate-200 space-y-1">
                      <p className="font-semibold text-sm">
                        {item.street} {item.houseNumber} {item.addition}
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        {item.postcode} {item.city}, {item.country}
                      </p>
                      {item.typeOfProperty && (
                        <p className="text-xs text-slate-400 italic">
                          Property: {item.typeOfProperty} {item.floor ? `(${item.floor} Floor)` : ''}
                        </p>
                      )}
                    </div>

                    {/* Facility Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/40 dark:border-slate-700/50">
                      {item.hasElevator && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300">
                          <ElevatorIcon style={{ fontSize: 12 }} /> Elevator
                        </span>
                      )}
                      {item.deliveringBoxes && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-300">
                          <CardGiftcardIcon style={{ fontSize: 12 }} /> Boxes
                        </span>
                      )}
                      {item.applyForPermit && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300">
                          <VerifiedUserIcon style={{ fontSize: 12 }} /> Permit
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-6 text-center text-slate-400 text-xs italic">
                  No addresses registered for this customer.
                </div>
              )}
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
              Delete Customer?
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
                onClick={closeRemoveModal}
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
    </div>
  );
};

export default CustomerData;

