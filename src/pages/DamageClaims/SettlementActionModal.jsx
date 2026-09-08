import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Dialog, IconButton } from '@mui/material';
import {
  FiX,
  FiCheck,
  FiSliders,
  FiDollarSign,
  FiShield,
  FiCreditCard,
  FiAlertCircle,
  FiXCircle,
  FiCheckCircle,
  FiClock,
  FiFileText,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const STATUS_OPTIONS = [
  { id: 'Reported', label: 'Reported', color: 'blue', icon: FiClock },
  { id: 'Under Review', label: 'Under Review', color: 'amber', icon: FiClock },
  { id: 'Inspection Scheduled', label: 'Inspection Scheduled', color: 'purple', icon: FiClock },
  { id: 'Approved', label: 'Approved', color: 'emerald', icon: FiCheckCircle },
  { id: 'Partially Approved', label: 'Partially Approved', color: 'emerald', icon: FiCheckCircle },
  { id: 'Settled', label: 'Settled / Paid', color: 'teal', icon: FiCreditCard },
  { id: 'Rejected', label: 'Rejected', color: 'rose', icon: FiXCircle },
  { id: 'Closed', label: 'Closed', color: 'slate', icon: FiCheck },
];

const SETTLEMENT_TYPES = [
  'Direct Bank Transfer',
  'Repair / Restoration',
  'Replacement Purchase',
  'Invoice Credit / Offset',
  'Cash Voucher',
  'Insurance Direct Payout',
];

const REJECTION_REASONS = [
  'Pre-existing Damage (Noted prior to move)',
  'Items not packed by movers (PBO clause)',
  'Uncovered High-Value Item without declaration',
  'Claim filed after reporting deadline',
  'Wear and tear / Cosmetic aging',
  'Customer cancelled claim request',
  'Other (Details in comment)',
];

export default function SettlementActionModal({ open, onClose, claim, onSuccess }) {
  const { symbol: currencySymbol } = useCurrency();
  const [targetStatus, setTargetStatus] = useState('Approved');
  const [reviewerComment, setReviewerComment] = useState('');

  // Settlement financials
  const [approvedAmount, setApprovedAmount] = useState('');
  const [deductibleApplied, setDeductibleApplied] = useState('');
  const [settlementType, setSettlementType] = useState('Direct Bank Transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [settlementNotes, setSettlementNotes] = useState('');
  const [releaseAgreementSigned, setReleaseAgreementSigned] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (claim && open) {
      setTargetStatus(claim.status || 'Under Review');
      setReviewerComment(claim.reviewerComment || '');

      const initialApproved =
        claim.totalApprovedAmount !== undefined && claim.totalApprovedAmount > 0
          ? String(claim.totalApprovedAmount)
          : String(claim.totalClaimedAmount || '');
      setApprovedAmount(initialApproved);

      setDeductibleApplied(
        claim.deductibleApplied !== undefined && claim.deductibleApplied > 0
          ? String(claim.deductibleApplied)
          : claim.deductibleAmount !== undefined
          ? String(claim.deductibleAmount)
          : '0'
      );

      setSettlementType(claim.settlementType && claim.settlementType !== 'None' ? claim.settlementType : 'Direct Bank Transfer');
      setPaymentReference(
        claim.paymentReference || `SETTLE-${new Date().getFullYear()}-${claim.jobIndex || claim.claimNumber?.slice(-4) || 'PAY'}`
      );
      setSettlementNotes(claim.settlementNotes || '');
      setReleaseAgreementSigned(Boolean(claim.releaseAgreementSigned));
      setRejectionReason(claim.rejectionReason || '');
    }
  }, [claim, open]);

  // Calculate Net Settlement Amount
  const numApproved = parseFloat(approvedAmount) || 0;
  const numDeductible = parseFloat(deductibleApplied) || 0;
  const netSettlement = Math.max(0, numApproved - numDeductible);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!claim) return;

    if (
      ['Approved', 'Partially Approved', 'Settled'].includes(targetStatus) &&
      numApproved <= 0
    ) {
      toast.error('Approved amount must be greater than 0');
      return;
    }

    if (targetStatus === 'Rejected' && !rejectionReason && !reviewerComment.trim()) {
      toast.error('Please specify a reason for rejecting the claim');
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        status: targetStatus,
        reviewerComment: reviewerComment.trim(),
        totalApprovedAmount: numApproved,
        deductibleApplied: numDeductible,
        settlementType,
        paymentReference: paymentReference.trim(),
        settlementNotes: settlementNotes.trim(),
        releaseAgreementSigned,
        rejectionReason: rejectionReason.trim(),
      };

      const res = await axios.put(
        `${apiPath}/api/damage-claims/${claim._id || claim.id}/settlement`,
        payload,
        { headers }
      );

      if (res.data?.success) {
        toast.success(`Claim status updated to ${targetStatus}`);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Error updating settlement:', err);
      toast.error(err.response?.data?.message || 'Failed to update status & settlement');
    } finally {
      setProcessing(false);
    }
  };

  if (!claim) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          borderRadius: '24px',
          backgroundColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      <div className="bg-white dark:bg-boxdark rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-primary/20">
              <FiSliders />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Claim Decision & Settlement: {claim.claimNumber}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Customer: {claim.customerName} · Claimed: {formatCurrency(claim.totalClaimedAmount || 0)}
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <FiX />
          </IconButton>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 overflow-y-auto space-y-6">
          {/* Target Status Selector */}
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5">
              Select Target Workflow Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map((st) => {
                const Icon = st.icon;
                const isSelected = targetStatus === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setTargetStatus(st.id)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/25 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="text-base" />
                    <span className="text-xs">{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Settlement & Payout Calculation (For Approved, Partially Approved, Settled) */}
          {['Approved', 'Partially Approved', 'Settled'].includes(targetStatus) && (
            <div className="bg-emerald-50/70 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                <FiDollarSign className="text-emerald-600 text-sm" />
                <span>Settlement Financial Breakdown</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Total Approved Amount */}
                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                    Approved Gross Amount ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-boxdark border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    Claimed: {formatCurrency(claim.totalClaimedAmount || 0)}
                  </span>
                </div>

                {/* Deductible Applied */}
                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                    Deductible / Policy Excess ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={deductibleApplied}
                    onChange={(e) => setDeductibleApplied(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-boxdark border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Policy Deductible: {formatCurrency(claim.deductibleAmount || 0)}
                  </span>
                </div>

                {/* Net Settlement Display */}
                <div>
                  <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                    Net Settlement Payable ({currencySymbol})
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl text-sm font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 flex items-center justify-between">
                    <span>{currencySymbol}</span>
                    <span>{netSettlement.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                    Net amount paid to customer
                  </span>
                </div>
              </div>

              {/* Additional Disbursement Details for Settled Status */}
              {targetStatus === 'Settled' && (
                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Settlement Type */}
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                        Settlement Method / Type
                      </label>
                      <select
                        value={settlementType}
                        onChange={(e) => setSettlementType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                      >
                        {SETTLEMENT_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Reference */}
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1">
                        Payment / Bank Reference Number
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. TRF-NL-2026-9901"
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Release waiver checkbox */}
                  <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={releaseAgreementSigned}
                      onChange={(e) => setReleaseAgreementSigned(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      Customer signed damage settlement & liability release agreement
                    </span>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Section: Rejection Reasons (For Rejected Status) */}
          {targetStatus === 'Rejected' && (
            <div className="bg-rose-50/80 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-rose-900 dark:text-rose-200 uppercase tracking-wider">
                <FiXCircle className="text-rose-600 text-sm" />
                <span>Claim Rejection Details</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-rose-900 dark:text-rose-200 mb-1">
                  Primary Rejection Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-boxdark border border-rose-300 dark:border-rose-800 text-slate-900 dark:text-white focus:outline-hidden focus:border-rose-500"
                >
                  <option value="">-- Select Rejection Reason --</option>
                  {REJECTION_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Reviewer / Decision Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reviewer Notes / Decision Explanation
            </label>
            <textarea
              rows={3}
              value={reviewerComment}
              onChange={(e) => setReviewerComment(e.target.value)}
              placeholder="Provide context regarding this decision, adjuster assessment details, or settlement terms..."
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-primary resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/25 disabled:opacity-50 cursor-pointer transition-all active:scale-95"
            >
              {processing ? (
                <span>Saving Decision...</span>
              ) : (
                <>
                  <FiCheck className="text-sm" />
                  <span>Update Status & Settlement</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
