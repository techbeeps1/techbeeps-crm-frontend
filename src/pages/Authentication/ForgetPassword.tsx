import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import { resolveLogoUrl, fetchCompanyLogo } from '../../utils/logoUtil';
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowBack,
  MdCheckCircle,
  MdVpnKey,
  MdClose
} from 'react-icons/md';

interface ResetPasswordFormInputs {
  email: string;
  new_password: string;
  confirm_newPassword: string;
}

interface ResetPasswordProps {
  handler: () => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ handler }) => {
  const [newpasswordVisible, setnewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [userData, setUserdata] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('Techbeeps CRM');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>();

  const new_password = watch('new_password');

  useEffect(() => {
    const loadBrand = async () => {
      const logo = await fetchCompanyLogo();
      if (logo) setLogoUrl(logo);
      try {
        const res = await fetch(`${apiPath}/api/company-details`);
        if (res.ok) {
          const data = await res.json();
          if (data?.companyName) setCompanyName(data.companyName);
          if (data?.logoUrl) setLogoUrl(resolveLogoUrl(data.logoUrl));
        }
      } catch (e) {
        // ignore
      }
    };
    loadBrand();
  }, []);

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiPath}/user/reset_password`,
        { email: userData.email, otp, newPassword: userData.newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        toast.success('Password reset successfully! You can now sign in.');
        setErrorMessage('');
        setShowOtpPopup(false);
        setTimeout(() => {
          handler();
        }, 300);
      }
    } catch (error: any) {
      const msg = error.response?.data?.msg || 'Failed to verify OTP.';
      toast.error(msg);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    if (data.new_password !== data.confirm_newPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!data.email || !/^\S+@\S+$/i.test(data.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (data.new_password.length < 6 || data.new_password.length > 30) {
      toast.error('Password must be between 6 and 30 characters long');
      return;
    }

    setLoading(true);
    const finalData = {
      email: data.email,
      newPassword: data.confirm_newPassword,
    };
    try {
      const response = await axios.post(
        `${apiPath}/email/send-otp`,
        { email: data.email },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status === 200) {
        setUserdata(finalData);
        setShowOtpPopup(true);
        setOtp('');
        toast.success('Verification OTP code sent to your email.');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.msg || `Failed to send OTP: ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="max-h-14 max-w-[220px] object-contain"
              onError={() => setLogoUrl('')}
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-black shadow-md shadow-primary/30">
                {companyName.charAt(0)}
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-black dark:text-white">
                {companyName}
              </span>
            </div>
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
          Reset password
        </h2>
        <p className="text-xs sm:text-sm text-body dark:text-bodydark font-medium">
          Enter your registered email and choose a new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <MdEmail className="text-primary text-sm" />
            <span>Email Address</span>
          </label>
          <input
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Please enter a valid email address',
              },
            })}
            type="email"
            placeholder="name@company.com"
            className="w-full bg-gray-2/50 dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-3 px-4 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
          />
          {errors.email && (
            <p className="text-meta-1 text-xs mt-1.5 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <MdLock className="text-primary text-sm" />
            <span>New Password</span>
          </label>
          <div className="relative">
            <input
              {...register('new_password', {
                required: 'New Password is required',
                minLength: { value: 6, message: 'Minimum 6 characters required' },
              })}
              type={newpasswordVisible ? 'text' : 'password'}
              placeholder="••••••••••••"
              className="w-full bg-gray-2/50 dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-3 pl-4 pr-11 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setnewPasswordVisible(!newpasswordVisible)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              {newpasswordVisible ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
            </button>
          </div>
          {errors.new_password && (
            <p className="text-meta-1 text-xs mt-1.5 font-medium">{errors.new_password.message}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <MdCheckCircle className="text-primary text-sm" />
            <span>Confirm New Password</span>
          </label>
          <div className="relative">
            <input
              {...register('confirm_newPassword', {
                required: 'Please confirm your new password',
                validate: (value) => value === new_password || 'Passwords do not match',
              })}
              type={confirmPasswordVisible ? 'text' : 'password'}
              placeholder="••••••••••••"
              className="w-full bg-gray-2/50 dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-3 pl-4 pr-11 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              {confirmPasswordVisible ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
            </button>
          </div>
          {errors.confirm_newPassword && (
            <p className="text-meta-1 text-xs mt-1.5 font-medium">
              {errors.confirm_newPassword.message}
            </p>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Send Verification Code'}
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handler}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer"
          >
            <MdArrowBack />
            <span>Back to Sign In</span>
          </button>
        </div>
      </form>

      {/* OTP Verification Modal */}
      {showOtpPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-boxdark p-6 sm:p-7 rounded-2xl border border-stroke dark:border-strokedark shadow-2xl w-full max-w-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stroke dark:border-strokedark">
              <div className="flex items-center gap-2 text-primary text-xl">
                <MdVpnKey />
                <h3 className="text-base font-bold text-black dark:text-white">
                  Enter Security OTP
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOtpPopup(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-black dark:hover:text-white hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <p className="text-xs text-body dark:text-bodydark leading-relaxed">
              We have sent a 6-digit verification code to{' '}
              <strong className="text-black dark:text-white">{userData.email}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setErrorMessage('');
                  setOtp(e.target.value.trim());
                }}
                placeholder="123456"
                className="w-full tracking-widest text-center font-mono text-lg bg-gray-2/50 dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary font-bold"
              />
              {errorMessage && (
                <p className="text-meta-1 text-xs mt-1.5 font-medium">{errorMessage}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowOtpPopup(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={loading || !otp}
                onClick={handleVerifyOTP}
                className="py-2.5 px-5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-opacity-90 transition-all shadow-md shadow-primary/25 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
