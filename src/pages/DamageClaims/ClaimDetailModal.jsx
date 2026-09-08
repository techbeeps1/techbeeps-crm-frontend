import React, { useState } from 'react';
import { Dialog, IconButton } from '@mui/material';
import {
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiUser,
  FiTruck,
  FiCalendar,
  FiShield,
  FiPaperclip,
  FiImage,
  FiCheck,
  FiLayers,
  FiEdit2,
  FiCreditCard,
  FiFileText,
  FiSliders,
} from 'react-icons/fi';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Reported':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    case 'Under Review':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    case 'Inspection Scheduled':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    case 'Approved':
    case 'Partially Approved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    case 'Settled':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    case 'Closed':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (e) {
    return 'N/A';
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return 'N/A';
  }
};

export default function ClaimDetailModal({
  open,
  onClose,
  claim,
  onOpenSettlementModal,
  onEditClaim,
}) {
  const { symbol: currencySymbol } = useCurrency();
  const [activePhoto, setActivePhoto] = useState(null);

  if (!claim) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
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
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-primary/20">
                <FiFileText />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Damage Claim: {claim.claimNumber || 'N/A'}
                  </h2>
                  <span
                    className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                      claim.status
                    )}`}
                  >
                    {claim.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Reported on {formatDate(claim.reportedDate || claim.createdAt)} · By{' '}
                  {claim.reportedByName || claim.reportedBy}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettlementModal?.(claim);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-md shadow-primary/25 cursor-pointer transition-all active:scale-95"
              >
                <FiSliders />
                <span>Manage Status & Settlement</span>
              </button>

              <IconButton
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <FiX />
              </IconButton>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-5 md:p-6 overflow-y-auto space-y-6">
            {/* 1. Status Progress Tracker */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div
                  className={`p-2.5 rounded-xl border ${
                    ['Reported', 'Under Review', 'Approved', 'Partially Approved', 'Settled'].includes(
                      claim.status
                    )
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase block tracking-wider font-semibold">
                    Step 1
                  </span>
                  <span className="text-xs font-black">Reported</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    ['Under Review', 'Inspection Scheduled', 'Approved', 'Partially Approved', 'Settled'].includes(
                      claim.status
                    )
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase block tracking-wider font-semibold">
                    Step 2
                  </span>
                  <span className="text-xs font-black">Under Review</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    ['Approved', 'Partially Approved', 'Settled'].includes(claim.status)
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase block tracking-wider font-semibold">
                    Step 3
                  </span>
                  <span className="text-xs font-black">Approved</span>
                </div>

                <div
                  className={`p-2.5 rounded-xl border ${
                    claim.status === 'Settled'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold'
                      : claim.status === 'Rejected'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] uppercase block tracking-wider font-semibold">
                    Step 4
                  </span>
                  <span className="text-xs font-black">
                    {claim.status === 'Rejected' ? 'Rejected' : 'Settled / Closed'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Top Info Cards (Customer, Move Job, Financial Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Customer Info Card */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <FiUser className="text-primary" />
                  <span>Customer Details</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {claim.customerName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {claim.customerEmail || 'No email specified'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {claim.customerPhone || 'No phone specified'}
                  </p>
                </div>
              </div>

              {/* Move & Incident Details Card */}
              <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  <FiTruck className="text-primary" />
                  <span>Move & Incident Context</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-bold">Job Reference:</span>{' '}
                    <span className="font-mono bg-white dark:bg-boxdark px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {claim.jobIndex || claim.jobId?.index || 'N/A'}
                    </span>
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-bold">Incident Date:</span>{' '}
                    {formatDate(claim.incidentDate)}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300">
                    <span className="font-bold">Stage:</span> {claim.incidentStage}
                  </p>
                  {claim.incidentLocation && (
                    <p className="text-slate-700 dark:text-slate-300 truncate">
                      <span className="font-bold">Location:</span> {claim.incidentLocation}
                    </p>
                  )}
                </div>
              </div>

              {/* Financial & Settlement Card */}
              <div className="bg-slate-900 dark:bg-slate-800 text-white p-4 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Financial Settlement
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      claim.settlementStatus === 'Settled'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {claim.settlementStatus}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Total Claimed:</span>
                    <span className="font-bold text-white">
                      {formatCurrency(claim.totalClaimedAmount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Approved Amount:</span>
                    <span className="font-bold text-emerald-400">
                      {formatCurrency(claim.totalApprovedAmount || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Deductible Applied:</span>
                    <span className="font-bold text-rose-400">
                      - {formatCurrency(claim.deductibleApplied || 0)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-sm font-extrabold text-white">
                    <span>Net Settlement:</span>
                    <span className="text-emerald-400 text-base">
                      {formatCurrency(claim.netSettlementAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Incident Description */}
            {claim.incidentDescription && (
              <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Incident Narrative & Description:
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {claim.incidentDescription}
                </p>
              </div>
            )}

            {/* 4. Itemized Damaged Items Breakdown */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-rose-500" />
                  <span>Damaged Line Items ({claim.items?.length || 0})</span>
                </h3>
              </div>

              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Item & Category</th>
                      <th className="py-3 px-3">Damage Type</th>
                      <th className="py-3 px-3 text-center">Qty</th>
                      <th className="py-3 px-3 text-right">Est. Value</th>
                      <th className="py-3 px-3 text-right">Claimed ({currencySymbol})</th>
                      <th className="py-3 px-3 text-right">Approved ({currencySymbol})</th>
                      <th className="py-3 px-4 text-center">Evidence Photos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {claim.items?.map((it, idx) => (
                      <tr key={it._id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 dark:text-white">{it.itemName}</p>
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {it.itemCategory} {it.notes ? `· ${it.notes}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900">
                            {it.damageType}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                          {it.quantity}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400">
                          {formatCurrency(it.estimatedOriginalValue || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(it.claimedAmount || 0)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(it.approvedAmount || 0)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {it.evidencePhotos && it.evidencePhotos.length > 0 ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              {it.evidencePhotos.map((p, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => setActivePhoto(p.url)}
                                  className="w-7 h-7 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                  title="Click to view photo"
                                >
                                  <img
                                    src={p.url}
                                    alt="Evidence"
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No photos</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. Settlement & Payout Details (If Settled) */}
            {claim.status === 'Settled' && (
              <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  <FiCheckCircle className="text-emerald-600" />
                  <span>Settlement Disbursement Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                  <div>
                    <span className="font-bold block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase">
                      Settlement Method
                    </span>
                    <span>{claim.settlementType || 'Direct Bank Transfer'}</span>
                  </div>
                  <div>
                    <span className="font-bold block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase">
                      Settlement Date
                    </span>
                    <span>{formatDate(claim.settlementDate)}</span>
                  </div>
                  <div>
                    <span className="font-bold block text-[10px] text-emerald-700 dark:text-emerald-400 uppercase">
                      Payment / Reference ID
                    </span>
                    <span className="font-mono">{claim.paymentReference || 'N/A'}</span>
                  </div>
                </div>
                {claim.settlementNotes && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 pt-1 border-t border-emerald-200 dark:border-emerald-800">
                    <span className="font-bold">Settlement Notes:</span> {claim.settlementNotes}
                  </p>
                )}
              </div>
            )}

            {/* 6. Status Audit History Timeline */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FiClock className="text-primary" />
                <span>Status & Audit Trail Timeline</span>
              </h3>

              <div className="space-y-2.5">
                {claim.statusHistory && claim.statusHistory.length > 0 ? (
                  claim.statusHistory.map((h, idx) => (
                    <div
                      key={h._id || idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(
                              h.status
                            )}`}
                          >
                            {h.status}
                          </span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {h.action || 'Status Updated'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            by {h.changedByName || 'Admin'}
                          </span>
                        </div>
                        {h.comment && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                            "{h.comment}"
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDateTime(h.timestamp)}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No activity recorded yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditClaim?.(claim);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <FiEdit2 />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog>

      {/* Image Lightbox Preview Modal */}
      {activePhoto && (
        <Dialog
          open={Boolean(activePhoto)}
          onClose={() => setActivePhoto(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '24px',
              padding: '12px',
            },
          }}
        >
          <div className="relative flex flex-col items-center justify-center p-2">
            <IconButton
              onClick={() => setActivePhoto(null)}
              className="absolute top-2 right-2 text-white bg-white/20 hover:bg-white/40"
            >
              <FiX />
            </IconButton>
            <img
              src={activePhoto}
              alt="Damage Evidence Large View"
              className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
