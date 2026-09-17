import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { resolveLogoUrl, fetchCompanyLogo } from '../../utils/logoUtil';
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
  MdLogin,
  MdShield
} from 'react-icons/md';

interface SignInProps {
  signup: boolean;
  setsignup: (value: boolean) => void;
  onResetPassword: () => void;
}

interface LoginFormInputs {
  email: string;
  password: string;
  rememberMe?: boolean;
}

const SignIn: React.FC<SignInProps> = ({ signup, setsignup, onResetPassword }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('Techbeeps CRM');

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
      } catch (err) {
        // ignore
      }

      // Check for saved email in remember me
      const savedEmail = localStorage.getItem('remember_email');
      if (savedEmail) {
        setValue('email', savedEmail);
        setValue('rememberMe', true);
      }
    };
    loadBrand();

    const onLogoUpdate = (e: any) => {
      if (e.detail) {
        setLogoUrl(resolveLogoUrl(e.detail));
      }
    };
    window.addEventListener('logoUpdated', onLogoUpdate);
    return () => window.removeEventListener('logoUpdated', onLogoUpdate);
  }, [setValue]);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    if (!data.email || !data.password) {
      toast.error('Please enter both email and password.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(data.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (data.rememberMe) {
      localStorage.setItem('remember_email', data.email);
    } else {
      localStorage.removeItem('remember_email');
    }

    setLoading(true);
    try {
      const response = await axios.post(`${apiPath}/user/login`, {
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      toast.success('Signed in successfully!');
      setTimeout(() => {
        window.location.href = '/';
      }, 200);
    } catch (error: any) {
      console.error('Error during login:', error);
      const errMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        'Invalid email or password.';
      toast.error(`Login failed: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-7 animate-in fade-in duration-300">
      {/* Top Logo Container */}
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
          Welcome back
        </h2>
        <p className="text-xs sm:text-sm text-body dark:text-bodydark font-medium">
          Enter your credentials to access your administrative dashboard
        </p>
      </div>

      {/* Form Area */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
            <MdEmail className="text-primary text-sm" />
            <span>Email Address</span>
          </label>
          <div className="relative">
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              placeholder="name@company.com"
              className="w-full bg-gray-2/50 dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-3 pl-4 pr-11 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
            />
          </div>
          {errors.email && (
            <p className="text-meta-1 text-xs mt-1.5 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <MdLock className="text-primary text-sm" />
              <span>Password</span>
            </label>
            <button
              type="button"
              onClick={onResetPassword}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              placeholder="••••••••••••"
              className="w-full bg-gray-2/50 dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-3 pl-4 pr-11 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
            >
              {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-meta-1 text-xs mt-1.5 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('rememberMe')}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke dark:border-strokedark cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Remember my email
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-opacity-90 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-primary/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <MdLogin className="text-lg group-hover:translate-x-0.5 transition-transform" />
                <span>Sign In to CRM</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Info */}
      <div className="pt-4 border-t border-stroke dark:border-strokedark text-center text-xs text-body dark:text-bodydark">
        <p>
          Need an account or access rights?{' '}
          <span className="font-bold text-black dark:text-white">
            Contact your System Administrator
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
