import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import { MdReceipt, MdCheckCircle, MdSchedule, MdAttachMoney } from 'react-icons/md';

interface RecurringBillingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RecurringBillingModal: React.FC<RecurringBillingModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [pendingData, setPendingData] = useState<any>({
    pendingCount: 0,
    totalPendingAmount: 0,
    pendingItems: [],
  });

  const notify = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg, { autoClose: 2500 });

  const fetchPending = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/api/storages/pending-billing`);
      if (response.status === 200) {
        setPendingData(response.data || { pendingCount: 0, totalPendingAmount: 0, pendingItems: [] });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch pending recurring storage billings';
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchPending();
    }
  }, [open]);

  const handleProcessBilling = async () => {
    setProcessing(true);
    try {
      const response = await axios.post(`${apiPath}/api/storages/process-recurring-billing`, {});
      if (response.status === 200) {
        const result = response.data;
        notify(result.message || `Successfully processed ${result.processedCount} recurring billing invoice(s)!`);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to process recurring billing.';
      notifyError(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          maxHeight: 'calc(100vh - 60px)',
          margin: '16px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      <div className="bg-white flex flex-col max-h-[calc(100vh-60px)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <MdReceipt className="text-2xl" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                Recurring Storage Invoicing & Billing
              </h3>
              <p className="text-xs text-slate-500">
                Scan active storage leases, evaluate unbilled monthly cycles, and generate draft invoices
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg shrink-0"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>

        {/* Content */}
        <DialogContent className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
          {loading && <Loader />}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                <MdSchedule className="text-xl" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Pending Billing Cycles</span>
                <span className="text-xl font-bold text-slate-800">{pendingData.pendingCount || 0}</span>
              </div>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <MdAttachMoney className="text-xl" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Total Pending Value</span>
                <span className="text-xl font-bold text-emerald-700">
                  €{(Number(pendingData.totalPendingAmount) || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Pending Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Unbilled Storage Leases Ready for Invoicing
            </h4>

            {pendingData.pendingItems && pendingData.pendingItems.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Unit</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Warehouse</th>
                      <th className="py-2.5 px-3">Billing Cycle</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingData.pendingItems.slice(0, 10).map((item: any, idx: number) => (
                      <tr key={`${item.storageId}-${item.periodKey}-${idx}`} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-bold text-slate-800">
                          {item.storageCode}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {item.customer?.firstName} {item.customer?.lastName || ''}
                          <span className="block text-[10px] text-slate-400">{item.customer?.email || '—'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {item.warehouseName || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-primary">
                          {item.periodLabel}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          €{(item.financials?.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pendingData.pendingItems.length > 10 && (
                  <div className="p-2 bg-slate-50 text-center text-[11px] text-slate-500 border-t border-slate-200">
                    Showing first 10 of {pendingData.pendingItems.length} pending items
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MdCheckCircle className="text-3xl text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-slate-700 text-sm">All Storage Accounts Up to Date</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  No storage units currently have unbilled recurring periods due as of today.
                </p>
              </div>
            )}
          </div>
        </DialogContent>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Close
          </button>

          <button
            type="button"
            disabled={processing || pendingData.pendingCount === 0}
            onClick={handleProcessBilling}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-sm ${
              processing || pendingData.pendingCount === 0
                ? 'bg-slate-300 cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-opacity-90 shadow-primary/20 active:scale-[0.98] cursor-pointer'
            }`}
          >
            {processing ? (
              <span>Processing Invoices...</span>
            ) : (
              <>
                <MdReceipt className="text-base" />
                <span>Process {pendingData.pendingCount || 0} Invoice(s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default RecurringBillingModal;

