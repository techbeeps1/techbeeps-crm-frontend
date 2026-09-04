import React from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const ThankYouPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-50 dark:from-boxdark-2 dark:via-boxdark dark:to-boxdark-2 flex flex-col justify-between font-sans text-slate-800 dark:text-white relative overflow-hidden selection:bg-primary/20">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-primary/10 via-emerald-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[400px] h-[300px] bg-primary/5 blur-3xl pointer-events-none rounded-full" />



      {/* Main Hero Card */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 z-10">
        <div className="w-full max-w-xl bg-white/95 dark:bg-boxdark/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 dark:shadow-black/40 border border-slate-200/80 dark:border-strokedark p-6 md:p-10 relative overflow-hidden text-center">
          {/* Top Gradient Stripe */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-emerald-500 to-blue-500" />

          {/* Animated Success Badge */}
          <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
              <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
            </div>
          </div>

          {/* Titles */}
          <div className="space-y-2">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Acceptance Successful
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Quotation Accepted!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed pt-1">
              Thank you for confirming your quote. Your booking is officially registered in our system and our dispatch team has initiated preparation.
            </p>
          </div>





          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs md:text-sm shadow-lg shadow-primary/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <HomeOutlinedIcon fontSize="small" />
              <span>Go to Homepage</span>
              <ArrowForwardRoundedIcon fontSize="small" />
            </button>
          </div>

          {/* Subtle Trust Footer */}
          <div className="mt-7 pt-5 border-t border-slate-100 dark:border-strokedark flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <VerifiedUserOutlinedIcon style={{ fontSize: 14 }} className="text-emerald-500" />
            <span>256-bit encrypted online acceptance confirmation</span>
          </div>
        </div>
      </main>


    </div>
  );
};

export default ThankYouPage;
