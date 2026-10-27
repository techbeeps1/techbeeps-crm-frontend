import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineSearchOff, MdHome, MdArrowBack } from 'react-icons/md';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white dark:bg-boxdark rounded-3xl border border-stroke dark:border-strokedark p-8 sm:p-12 text-center shadow-lg space-y-6">
        {/* Animated 404 Badge */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 animate-ping opacity-60" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary/10 via-primary/5 to-indigo-100 dark:from-meta-4/40 dark:to-boxdark border border-primary/25 text-primary flex items-center justify-center shadow-sm">
            <MdOutlineSearchOff className="text-4xl" />
          </div>
        </div>

        {/* 404 Text & Description */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
            Error 404 • Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-body dark:text-bodydark max-w-md mx-auto leading-relaxed">
            The link you followed may be broken, or the page may have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95"
          >
            <MdHome className="text-lg" />
            Back to Dashboard
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-meta-4/40 font-bold text-sm transition-all cursor-pointer"
          >
            <MdArrowBack className="text-lg" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
