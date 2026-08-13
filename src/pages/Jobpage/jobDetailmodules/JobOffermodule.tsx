import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const JobOffermodule: React.FC<{ job: any; type: string }> = ({ type, job }) => {
  const [offerData, setOfferData] = useState<any>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (type === 'offer') {
      setOfferData(job?.offer || []);
    }
    if (type === 'invoice') {
      setOfferData(job?.invoice || []);
    }
  }, [job, type]);

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(date)).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('accept')) {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 uppercase tracking-wider">
          Accepted
        </span>
      );
    }
    if (s.includes('draft')) {
      return (
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 uppercase tracking-wider">
          Draft
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 uppercase tracking-wider">
        {status || 'Pending'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Header Card */}
      <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Price Agreement Summary
          </h3>
          <p className="text-lg font-black text-slate-900 dark:text-white capitalize mt-0.5">
            {job?.package?.priceAgree || 'Standard Agreement'}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">
          <ReceiptIcon fontSize="small" className="text-primary" />
          <span>{type === 'offer' ? 'Quotes Overview' : 'Invoices Overview'}</span>
        </div>
      </div>

      {/* Quote / Invoice List */}
      {offerData && offerData.length > 0 ? (
        offerData.map((item: any) => (
          <div
            key={item._id}
            className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs hover:shadow-md transition-all overflow-hidden"
          >
            {/* Top Bar inside Card */}
            <div className="p-5 border-b border-slate-100 dark:border-strokedark flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-3">
                <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  #{item?.index || 'N/A'}
                </span>
                {getStatusBadge(item?.Status || item?.status)}
              </div>
              <button
                type="button"
                onClick={() =>
                  type === 'offer'
                    ? navigate(`/offer-detail/${item?._id}`)
                    : navigate(`/invoice-detail/${item?._id}`)
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <span>Go to {type === 'offer' ? 'Quote' : 'Invoice'}</span>
                <ArrowForwardIcon style={{ fontSize: 14 }} />
              </button>
            </div>

            {/* Content Details Grid */}
            <div className="p-5 space-y-5">
              {/* Financial Numbers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Subtotal
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                    € {item?.subTotal ?? '0.00'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    BTW (Tax)
                  </span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-white mt-1 block">
                    € {item?.btw ?? '0.00'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                    Total Amount
                  </span>
                  <span className="text-lg font-black text-primary mt-1 block">
                    € {item?.total ?? '0.00'}
                  </span>
                </div>
              </div>

              {/* Meta information row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <CalendarTodayIcon style={{ fontSize: 16 }} className="text-slate-400" />
                  <div>
                    <span className="block font-medium text-slate-400">Created On</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatDate(item?.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <EventAvailableIcon style={{ fontSize: 16 }} className="text-slate-400" />
                  <div>
                    <span className="block font-medium text-slate-400">Expiry Date</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {formatDate(item?.expire_date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <AttachMoneyIcon style={{ fontSize: 16 }} className="text-slate-400" />
                  <div>
                    <span className="block font-medium text-slate-400">BTW Scenario</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {item?.vat || 'Inclusive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <ReceiptIcon />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No linked {type === 'offer' ? 'quotation' : 'invoice'} found
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            There are no {type === 'offer' ? 'offers' : 'invoices'} created for this job yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobOffermodule;
