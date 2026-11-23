import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Modal, Box, IconButton, Tooltip } from '@mui/material';
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
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { apiPath } from '../../../apiPath';
import Loader from '../../common/Loader';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const RecordPayment = ({ invoiceData, fetchInvoice }) => {
  const { Id } = useParams();
  const { symbol: currencySymbol } = useCurrency();
  const [paymentsList, setPaymentsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const [isCreditModalOpen, setCreditModalOpen] = useState(false);
  const [isReverseModalOpen, setReverseModalOpen] = useState(false);
  const [selectedPaymentForReversal, setSelectedPaymentForReversal] = useState(null);
  const [reversalReason, setReversalReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Payment Form
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

  // Credit Note Form
  const {
    register: registerCredit,
    handleSubmit: handleSubmitCredit,
    setValue: setValueCredit,
    reset: resetCredit,
    formState: { errors: creditErrors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      amount: '',
      reason: '',
    },
  });

  const handlePayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${apiPath}/api/payments/${Id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
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

  // Calculations aligning with backend financial ledger
  const invoiceTotal = Number(invoiceData?.total) || 0;

  const totalReceived = useMemo(() => {
    return (paymentsList || [])
      .filter((p) => (p.type === 'payment' || !p.type) && p.status !== 'reversed')
      .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);
  }, [paymentsList]);

  const totalCredited = useMemo(() => {
    return (paymentsList || [])
      .filter((p) => p.type === 'credit_note' && p.status !== 'reversed')
      .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);
  }, [paymentsList]);

  const balanceDue = Math.max(invoiceTotal - (totalReceived + totalCredited), 0);

  // Payment Modal
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

  // Credit Note Modal
  const openCreditModal = () => {
    resetCredit({
      date: new Date().toISOString().split('T')[0],
      amount: balanceDue > 0 ? balanceDue.toFixed(2) : '',
      reason: '',
    });
    setCreditModalOpen(true);
  };

  const closeCreditModal = () => {
    setCreditModalOpen(false);
  };

  // Reversal Modal
  const openReverseModal = (payment) => {
    setSelectedPaymentForReversal(payment);
    setReversalReason('');
    setReverseModalOpen(true);
  };

  const closeReverseModal = () => {
    setSelectedPaymentForReversal(null);
    setReversalReason('');
    setReverseModalOpen(false);
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
      const token = localStorage.getItem('token');
      const idempotencyKey = `KEY-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const finalData = { ...formData, invoiceId: Id, amount: amt, idempotencyKey };
      const response = await axios.post(`${apiPath}/api/record-payment`, finalData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Idempotency-Key': idempotencyKey,
        }
      });

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

  const creditNoteHandler = async (formData) => {
    const amt = Number(formData.amount);
    if (!amt || amt <= 0) {
      toast.error('Credit Note amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const idempotencyKey = `KEY-CN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const payload = {
        invoiceId: Id,
        amount: amt,
        reason: formData.reason || 'Credit Note adjustment',
        date: formData.date || new Date().toISOString(),
        idempotencyKey,
      };

      const response = await axios.post(`${apiPath}/api/issue-credit-note`, payload, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'X-Idempotency-Key': idempotencyKey,
        }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || 'Credit note issued successfully!');
        closeCreditModal();
        handlePayments();
        if (fetchInvoice) fetchInvoice();
      } else {
        toast.error(response.data?.message || 'Failed to issue credit note');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'An error occurred while issuing credit note.'
      );
      console.error('Error issuing credit note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReversePayment = async () => {
    if (!selectedPaymentForReversal) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const paymentId = selectedPaymentForReversal._id;
      const response = await axios.post(
        `${apiPath}/api/payment/reverse/${paymentId}`,
        { reason: reversalReason || 'Payment reversal requested by user' },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data?.message || 'Payment reversed successfully!');
        closeReverseModal();
        handlePayments();
        if (fetchInvoice) fetchInvoice();
      } else {
        toast.error(response.data?.message || 'Failed to reverse payment');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'An error occurred while reversing payment.'
      );
      console.error('Error reversing payment:', error);
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
        p.creditNoteNumber?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        String(p.amount).includes(q) ||
        (p.date && new Date(p.date).toLocaleDateString().includes(q))
    );
  }, [paymentsList, searchTerm]);

  // Payment Mode Badge Formatter
  const renderPaymentModeBadge = (item) => {
    const mode = item.paymentMode;
    const type = item.type;

    if (type === 'credit_note') {
      const cnNum = item.creditNoteIndex || item.creditNoteNumber;
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <ReceiptLongIcon style={{ fontSize: 14 }} />
          <span>Credit Note {cnNum ? `(${cnNum})` : ''}</span>
        </span>
      );
    }

    if (type === 'reversal') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <RotateLeftIcon style={{ fontSize: 14 }} />
          <span>Reversal</span>
        </span>
      );
    }

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
      case 'credit_deduction':
      case 'credit_note':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ReceiptLongIcon style={{ fontSize: 14 }} />
            <span>Credit Note</span>
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

      {/* Top 4 Financial KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Invoiced */}
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
            {formatCurrency(invoiceTotal)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Grand total of invoice
          </span>
        </div>

        {/* Total Received */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Received
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircleOutlineIcon style={{ fontSize: 15 }} />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2 block">
            {formatCurrency(totalReceived)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Valid payments received
          </span>
        </div>

        {/* Total Credited */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Credited
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <ReceiptLongIcon style={{ fontSize: 15 }} />
            </div>
          </div>
          <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-2 block">
            {formatCurrency(totalCredited)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Credit notes issued
          </span>
        </div>

        {/* Outstanding Balance Due */}
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Balance Due
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                balanceDue > 0
                  ? 'bg-rose-500/10 text-rose-600'
                  : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              <PaymentIcon style={{ fontSize: 15 }} />
            </div>
          </div>
          <span
            className={`text-2xl font-black font-mono mt-2 block ${
              balanceDue > 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {formatCurrency(balanceDue)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {balanceDue === 0 ? 'Invoice fully settled' : 'Remaining balance due'}
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
                className="w-44 sm:w-56 pl-8 pr-3 py-2 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <SearchIcon
                fontSize="small"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            {/* Issue Credit Note Button */}
            <button
              type="button"
              onClick={openCreditModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <NoteAddIcon fontSize="small" />
              <span>Issue Credit Note</span>
            </button>

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
              No transactions recorded yet
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click &quot;Process Payment&quot; or &quot;Issue Credit Note&quot; above to record transactions for this invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-strokedark">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50/90 dark:bg-slate-800/70 text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-strokedark">
                <tr>
                  <th className="py-3.5 px-4">Type / Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Reference / Description</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((item, index) => {
                  const isReversible =
                    item.type === 'payment' &&
                    item.status !== 'reversed' &&
                    Number(item.amount) > 0;

                  return (
                    <tr
                      key={item._id || index}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        {renderPaymentModeBadge(item)}
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
                        {item.description || item.reason || '—'}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-mono font-black text-sm whitespace-nowrap ${
                          item.status === 'reversed' || Number(item.amount) < 0
                            ? 'text-rose-600 dark:text-rose-400 line-through'
                            : item.type === 'credit_note'
                            ? 'text-purple-600 dark:text-purple-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {item.type === 'credit_note' ? '-' : ''}
                        {formatCurrency(item.amount || 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.status === 'reversed' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            Reversed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isReversible ? (
                          <Tooltip title="Reverse this payment transaction" arrow>
                            <button
                              type="button"
                              onClick={() => openReverseModal(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer active:scale-95"
                            >
                              <RotateLeftIcon style={{ fontSize: 13 }} />
                              <span>Reverse</span>
                            </button>
                          </Tooltip>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                {formatCurrency(balanceDue)}
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
                  className={`w-full p-2.5 rounded-xl border ${
                    errors.date
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
                  Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  className={`w-full p-2.5 rounded-xl border ${
                    errors.amount
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
                className={`w-full p-2.5 rounded-xl border ${
                  errors.paymentMode
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

      {/* Issue Credit Note Modal */}
      <Modal
        open={isCreditModalOpen}
        onClose={closeCreditModal}
        className="flex items-center justify-center p-4"
      >
        <Box className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark shadow-2xl w-full max-w-lg overflow-hidden outline-none animate-fadeIn">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-strokedark">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <NoteAddIcon fontSize="small" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Issue Credit Note
                </h3>
                <span className="text-[11px] text-slate-400">
                  Credit reduction for Invoice #{invoiceData?.index || Id}
                </span>
              </div>
            </div>

            <IconButton
              onClick={closeCreditModal}
              size="small"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Credit Note Info Banner */}
          <div className="bg-purple-50/50 dark:bg-purple-900/20 p-4 border-b border-purple-100 dark:border-purple-800/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                Current Balance Due
              </span>
              <span className="text-lg font-black text-purple-700 dark:text-purple-300 font-mono">
                {formatCurrency(balanceDue)}
              </span>
            </div>
            {balanceDue > 0 && (
              <button
                type="button"
                onClick={() => setValueCredit('amount', balanceDue.toFixed(2))}
                className="px-3 py-1 rounded-lg text-xs font-extrabold bg-purple-600 text-white hover:bg-purple-700 transition-all cursor-pointer"
              >
                Credit Full Balance
              </button>
            )}
          </div>

          {/* Credit Note Form */}
          <form onSubmit={handleSubmitCredit(creditNoteHandler)} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Credit Note Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CalendarMonthIcon style={{ fontSize: 13 }} className="text-slate-400" />
                  <span>Issue Date *</span>
                </label>
                <input
                  type="date"
                  className={`w-full p-2.5 rounded-xl border ${
                    creditErrors.date
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200/80 dark:border-strokedark'
                  } bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs`}
                  {...registerCredit('date', { required: 'Date is required' })}
                />
                {creditErrors.date && (
                  <p className="text-rose-500 text-[11px] font-bold mt-1">
                    {creditErrors.date.message}
                  </p>
                )}
              </div>

              {/* Credit Note Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Credit Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  className={`w-full p-2.5 rounded-xl border ${
                    creditErrors.amount
                      ? 'border-rose-500 ring-1 ring-rose-500'
                      : 'border-slate-200/80 dark:border-strokedark'
                  } bg-white dark:bg-boxdark text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs`}
                  {...registerCredit('amount', {
                    required: 'Credit amount is required',
                    min: { value: 0.01, message: 'Amount must be > 0' },
                  })}
                />
                {creditErrors.amount && (
                  <p className="text-rose-500 text-[11px] font-bold mt-1">
                    {creditErrors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Credit Note Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Reason for Credit Note *
              </label>
              <input
                type="text"
                placeholder="e.g. Return of damaged part, pricing correction, goodwill discount"
                className={`w-full p-2.5 rounded-xl border ${
                  creditErrors.reason
                    ? 'border-rose-500 ring-1 ring-rose-500'
                    : 'border-slate-200/80 dark:border-strokedark'
                } bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs`}
                {...registerCredit('reason', { required: 'Reason is required' })}
              />
              {creditErrors.reason && (
                <p className="text-rose-500 text-[11px] font-bold mt-1">
                  {creditErrors.reason.message}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
              <button
                type="button"
                onClick={closeCreditModal}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircleOutlineIcon fontSize="small" />
                <span>{isSubmitting ? 'Issuing...' : 'Issue Credit Note'}</span>
              </button>
            </div>
          </form>
        </Box>
      </Modal>

      {/* Payment Reversal Confirmation Modal */}
      <Modal
        open={isReverseModalOpen}
        onClose={closeReverseModal}
        className="flex items-center justify-center p-4"
      >
        <Box className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark shadow-2xl w-full max-w-md overflow-hidden outline-none animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-strokedark">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <WarningAmberIcon fontSize="small" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  Reverse Payment
                </h3>
                <span className="text-[11px] text-slate-400">
                  Undo recorded payment
                </span>
              </div>
            </div>

            <IconButton
              onClick={closeReverseModal}
              size="small"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>

          {/* Reversal Details */}
          <div className="p-5 space-y-4">
            <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-xs space-y-2">
              <p className="font-bold text-rose-700 dark:text-rose-300">
                Are you sure you want to reverse this payment?
              </p>
              <div className="text-slate-600 dark:text-slate-300 space-y-1">
                <div>
                  <span className="font-medium">Amount: </span>
                  <span className="font-bold font-mono text-rose-600 dark:text-rose-400">
                    {formatCurrency(selectedPaymentForReversal?.amount || 0)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Method: </span>
                  <span className="font-semibold capitalize">
                    {selectedPaymentForReversal?.paymentMode || 'Payment'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Date: </span>
                  <span>
                    {selectedPaymentForReversal?.date
                      ? new Date(selectedPaymentForReversal.date).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                This will mark the payment as reversed and restore the outstanding balance due on this invoice.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Reason for Reversal
              </label>
              <input
                type="text"
                placeholder="e.g. Bounced cheque, accidental duplicate entry, client refund"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-white dark:bg-boxdark text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
              <button
                type="button"
                onClick={closeReverseModal}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleReversePayment}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <RotateLeftIcon fontSize="small" />
                <span>{isSubmitting ? 'Reversing...' : 'Confirm Reversal'}</span>
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default RecordPayment;
