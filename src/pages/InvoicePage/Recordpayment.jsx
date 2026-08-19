import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PaymentsIcon from '@mui/icons-material/Payments';
import { apiPath } from '../../../apiPath';
import Loader from '../../common/Loader';

const RecordPayment = ({ invoiceData, fetchInvoice }) => {
  const { Id } = useParams();
  const [paymentsList, setPaymentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      paymentMode: 'bank_transfer',
      description: '',
    },
  });

  const handlePayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/payments/${Id}`);
      setPaymentsList(response.data?.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePayments();
  }, [Id]);

  // Calculations
  const invoiceTotal = Number(invoiceData?.total) || 0;
  const totalPaid = useMemo(() => {
    return (paymentsList || []).reduce(
      (acc, item) => acc + (Number(item?.amount) || 0),
      0
    );
  }, [paymentsList]);

  const balanceDue = Math.max(invoiceTotal - totalPaid, 0);

  const openPayModal = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      amount: balanceDue > 0 ? balanceDue.toFixed(2) : '',
      paymentMode: 'bank_transfer',
      description: '',
    });
    setPayModalOpen(true);
  };

  const closePayModal = () => {
    setPayModalOpen(false);
  };

  const paymentHandler = async (formData) => {
    const amt = Number(formData.amount);
    if (!amt || amt <= 0) {
      toast.error('Amount must be greater than zero.');
      return;
    }
    if (!formData.paymentMode) {
      toast.error('Please select a payment mode.');
      return;
    }
    if (!formData.date) {
      toast.error('Please select a payment date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalData = { ...formData, invoiceId: Id, amount: amt };
      const response = await axios.post(`${apiPath}/api/record-payment`, finalData);

      if (
        response.data?.message === 'Payment recorded successfully' ||
        response.status === 200 ||
        response.status === 201
      ) {
        toast.success('Payment recorded successfully!');
        closePayModal();
        handlePayments();
        if (fetchInvoice) fetchInvoice();
      } else {
        toast.error(response.data?.message || 'Failed to record payment');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'An error occurred while recording payment.'
      );
      console.error('Error recording payment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter payments by search query
  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return paymentsList;
    const q = searchTerm.toLowerCase();
    return paymentsList.filter(
      (p) =>
        p.paymentMode?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        String(p.amount).includes(q) ||
        (p.date && new Date(p.date).toLocaleDateString().includes(q))
    );
  }, [paymentsList, searchTerm]);

  // Payment Mode Badge Formatter
  const renderPaymentModeBadge = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <PaidOutlinedIcon style={{ fontSize: 14 }} />
            <span>Cash</span>
          </span>
        );
      case 'bank_transfer':
      case 'bank transfer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <AccountBalanceIcon style={{ fontSize: 14 }} />
            <span>Bank Transfer</span>
          </span>
        );
      case 'online_payment':
      case 'online payment':
      case 'ideal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CreditCardIcon style={{ fontSize: 14 }} />
            <span>Online / iDEAL</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
            <PaymentsIcon style={{ fontSize: 14 }} />
            <span>{mode || 'Payment'}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {loading && <Loader />}

      {/* Top 3 Payment KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Invoice Total */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <AccountBalanceWalletIcon style={{ fontSize: 15 }} />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-2 block">
            € {invoiceTotal.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Grand total of invoice
          </span>
        </div>

        {/* Total Paid */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Amount Received
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircleOutlineIcon style={{ fontSize: 15 }} />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2 block">
            € {totalPaid.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Recorded payments ({paymentsList.length} transactions)
          </span>
        </div>

        {/* Balance Due */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Balance Due
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${balanceDue > 0
                  ? 'bg-rose-500/10 text-rose-600'
                  : 'bg-emerald-500/10 text-emerald-600'
                }`}
            >
              <PaymentIcon style={{ fontSize: 15 }} />
            </div>
          </div>
          <span
            className={`text-2xl font-black font-mono mt-2 block ${balanceDue > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
              }`}
          >
            € {balanceDue.toFixed(2)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {balanceDue === 0 ? 'Invoice fully settled' : 'Payment pending from client'}
          </span>
        </div>
      </div>

      {/* Main Payment History Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 md:p-6 shadow-xs space-y-5">
        {/* Table Actions Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-strokedark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PaymentIcon fontSize="small" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Payment Transactions & History
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-60 pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <SearchIcon
                fontSize="small"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Process Payment Button */}
            <button
              type="button"
              onClick={openPayModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <AddCircleOutlineIcon fontSize="small" />
              <span>Process Payment</span>
            </button>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <PaymentsIcon fontSize="large" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No payments recorded yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Process Payment&quot; above to register a payment received for this invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/90 dark:bg-slate-800/70 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark">
                <tr>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Comment / Reference</th>
                  <th className="py-3.5 px-4 text-right">Amount Received</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      {renderPaymentModeBadge(item.paymentMode)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.date
                        ? new Date(item.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm whitespace-nowrap">
                      € {Number(item.amount || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modern Process Payment Modal */}
      <Modal
        open={isPayModalOpen}
        onClose={closePayModal}
        className="flex items-center justify-center p-4"
      >
        <Box className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark shadow-2xl w-full max-w-lg overflow-hidden outline-none animate-fadeIn">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-strokedark">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <PaidOutlinedIcon fontSize="small" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Record Payment
                </h3>
                <span className="text-[11px] text-slate-400">
                  Invoice #{invoiceData?.index || Id}
                </span>
              </div>
            </div>

            <IconButton
              onClick={closePayModal}
              size="small"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Balance Due Notice Banner */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-100 dark:border-strokedark flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Outstanding Balance Due
              </span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">
                € {balanceDue.toFixed(2)}
              </span>
            </div>
            {balanceDue > 0 && (
              <button
                type="button"
                onClick={() => setValue('amount', balanceDue.toFixed(2))}
                className="px-3 py-1 rounded-lg text-xs font-extrabold bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer"
              >
                Pay Full Balance
              </button>
            )}
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit(paymentHandler)} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CalendarMonthIcon style={{ fontSize: 13 }} className="text-slate-400" />
                  <span>Payment Date *</span>
                </label>
                <input
                  type="date"
                  className={`w-full p-2.5 rounded-xl border ${errors.date
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200/80 dark:border-strokedark'
                    } bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                  <p className="text-rose-500 text-[11px] font-bold mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Amount (€) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  className={`w-full p-2.5 rounded-xl border ${errors.amount
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200/80 dark:border-strokedark'
                    } bg-white dark:bg-boxdark text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                  {...register('amount', {
                    required: 'Amount is required',
                    min: { value: 0.01, message: 'Amount must be > 0' },
                  })}
                />
                {errors.amount && (
                  <p className="text-rose-500 text-[11px] font-bold mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Method *
              </label>
              <select
                className={`w-full p-2.5 rounded-xl border ${errors.paymentMode
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-200/80 dark:border-strokedark'
                  } bg-white dark:bg-boxdark text-xs font-medium text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs`}
                {...register('paymentMode', { required: 'Payment mode is required' })}
              >
                <option value="bank_transfer">Bank Transfer (Wire / SEPA)</option>
                <option value="cash">Cash Payment</option>
                <option value="online_payment">Online Payment / iDEAL / PIN</option>
                <option value="credit_card">Credit Card</option>
                <option value="other">Other / Cheque</option>
              </select>
              {errors.paymentMode && (
                <p className="text-rose-500 text-[11px] font-bold mt-1">
                  {errors.paymentMode.message}
                </p>
              )}
            </div>

            {/* Comment / Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Transaction Note / Comment
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via mobile banking ref #1234"
                className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                {...register('description')}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
              <button
                type="button"
                onClick={closePayModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleOutlineIcon fontSize="small" />
                <span>{isSubmitting ? 'Recording...' : 'Confirm Payment'}</span>
              </button>
            </div>
          </form>
        </Box>
      </Modal>
    </div>
  );
};

export default RecordPayment;
