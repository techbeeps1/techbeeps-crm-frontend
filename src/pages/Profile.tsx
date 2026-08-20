import React, { useContext, useState } from 'react';
import { Dialog } from '@mui/material';
import { UserContext } from '../UserContext';
import { useForm, Controller } from 'react-hook-form';
import DatePickerComponent from '../common/Datepicker';
import { apiPath } from '../../apiPath';
import axios from 'axios';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';
import {
  MdEdit,
  MdSave,
  MdClose,
  MdPerson,
  MdEmail,
  MdPhone,
  MdHome,
  MdLocationOn,
  MdPublic,
  MdApartment,
  MdMarkunreadMailbox,
  MdCake,
  MdLanguage,
  MdBoy,
  MdVerified,
  MdContentCopy,
  MdCheckCircle,
  MdAccountCircle,
  MdLockOutline,
  MdLocationCity,
  MdSignpost,
} from 'react-icons/md';

const Profile: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { userData, fetchProfile } = useContext(UserContext) as any;
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const notify = (message: string) =>
    toast.success(message, {
      autoClose: 2000,
    });
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    notify(`${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: userData?.username || '',
      dob: userData?.dob || '',
      telephone: userData?.telephone || '',
      email: userData?.email || '',
      houseNumber: userData?.houseNumber || '',
      street: userData?.street || '',
      city: userData?.city || '',
      country: userData?.country || '',
      postCode: userData?.postCode || '',
    },
  });

  const handleOpen = () => {
    reset({
      username: userData?.username || '',
      dob: userData?.dob || '',
      telephone: userData?.telephone || '',
      email: userData?.email || '',
      houseNumber: userData?.houseNumber || '',
      street: userData?.street || '',
      city: userData?.city || '',
      country: userData?.country || '',
      postCode: userData?.postCode || '',
    });
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const onSubmit = (data: any) => {
    updateProfile({ id: userData._id, ...data });
  };

  const updateProfile = async (data: any): Promise<any> => {
    setLoading(true);
    if (data.username.trim() === '') {
      notifyError('Username cannot be empty');
      setLoading(false);
      return;
    }
    if (data.username.length < 3 || data.username.length > 20) {
      notifyError('Username must be between 3 and 20 characters');
      setLoading(false);
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(data.telephone)) {
      notifyError('Invalid telephone number');
      setLoading(false);
      return;
    }
    if (data.city.trim() === '') {
      notifyError('City cannot be empty');
      setLoading(false);
      return;
    }
    if (data.city.length < 2 || data.city.length > 50) {
      notifyError('City must be between 2 and 50 characters');
      setLoading(false);
      return;
    }
    if (data.country.trim() === '') {
      notifyError('Country cannot be empty');
      setLoading(false);
      return;
    }
    if (data.country.length < 2 || data.country.length > 50) {
      notifyError('Country must be between 2 and 50 characters');
      setLoading(false);
      return;
    }
    if (data.houseNumber.length > 10 || data.houseNumber.length < 1) {
      notifyError('House number must be between 1 and 10 characters');
      setLoading(false);
      return;
    }
    if (data.street.length > 56 || data.street.length < 2) {
      notifyError('Street must be between 2 and 56 characters');
      setLoading(false);
      return;
    }
    if (data.postCode.length > 12 || data.postCode.length < 3) {
      notifyError('Postal code must be between 3 and 12 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.post(`${apiPath}/user/update`, data);
      handleClose();
      await fetchProfile();
      notify('Profile updated successfully');
    } catch (error: any) {
      notifyError(`Failed to update profile. ${error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'TB';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const fullAddress = [
    userData?.houseNumber,
    userData?.street,
    userData?.addition,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {loading && <Loader />}

      {/* 1. Hero Profile Header Card */}
      <div className="bg-white dark:bg-boxdark rounded-3xl border border-stroke dark:border-strokedark shadow-sm overflow-hidden relative">
        {/* Dynamic Gradient Cover Banner */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-primary via-indigo-600 to-purple-700 relative overflow-hidden">
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-4 right-5 flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-semibold border border-white/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-meta-3 animate-pulse"></span>
            <span>Techbeeps CRM Staff Portal</span>
          </div>
        </div>

        {/* Profile Main Body */}
        <div className="px-6 sm:px-8 pb-6 relative">
          {/* Top Avatar & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* Avatar overlapping banner cleanly */}
            <div className="relative -mt-14 sm:-mt-16 shrink-0 self-center sm:self-auto">
              <div className="w-24 h-24 sm:w-30 sm:h-30 rounded-2xl p-1 bg-gradient-to-tr from-primary to-purple-600 shadow-xl">
                <div className="w-full h-full rounded-xl bg-white dark:bg-boxdark flex items-center justify-center overflow-hidden">
                  <span className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    {getInitials(userData?.username)}
                  </span>
                </div>
              </div>
              <div
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-6.5 h-6.5 rounded-full bg-meta-3 border-2 border-white dark:border-boxdark shadow-md text-white"
                title="Active Account"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              </div>
            </div>

            {/* Action CTA on Right */}
            <div className="flex items-center justify-center sm:justify-end shrink-0 pt-2 sm:pt-0">
              <button
                onClick={handleOpen}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs sm:text-sm cursor-pointer"
              >
                <MdEdit className="text-base" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* User Identity & Info Chips Row */}
          <div className="mt-3.5 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-black dark:text-white tracking-tight">
                {userData?.username || 'Techbeeps Admin'}
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/20">
                <MdVerified className="text-sm" />
                {userData?.role || 'Admin'}
              </span>
            </div>

            {/* Quick Info Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-body dark:text-bodydark pt-0.5">
              <button
                type="button"
                onClick={() => copyToClipboard(userData?.email, 'Email')}
                className="flex items-center gap-1.5 bg-gray-2/60 dark:bg-meta-4/30 px-3 py-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-stroke/50 dark:border-strokedark"
                title="Click to copy email"
              >
                <MdEmail className="text-slate-400 text-sm" />
                <span className="font-medium">{userData?.email || 'N/A'}</span>
                {copiedField === 'Email' ? (
                  <MdCheckCircle className="text-meta-3 text-xs ml-1" />
                ) : (
                  <MdContentCopy className="text-slate-400 text-xs ml-1 opacity-60" />
                )}
              </button>

              {userData?.telephone && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(userData?.telephone, 'Phone')}
                  className="flex items-center gap-1.5 bg-gray-2/60 dark:bg-meta-4/30 px-3 py-1 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer border border-stroke/50 dark:border-strokedark"
                  title="Click to copy phone"
                >
                  <MdPhone className="text-slate-400 text-sm" />
                  <span className="font-medium">{userData.telephone}</span>
                  {copiedField === 'Phone' ? (
                    <MdCheckCircle className="text-meta-3 text-xs ml-1" />
                  ) : (
                    <MdContentCopy className="text-slate-400 text-xs ml-1 opacity-60" />
                  )}
                </button>
              )}

              {userData?.city && (
                <span className="flex items-center gap-1.5 bg-gray-2/60 dark:bg-meta-4/30 px-3 py-1 rounded-lg border border-stroke/50 dark:border-strokedark">
                  <MdLocationOn className="text-slate-400 text-sm" />
                  <span className="font-medium">
                    {userData.city}
                    {userData.country ? `, ${userData.country}` : ''}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Two-Column Specification Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Personal Particulars */}
        <div className="bg-white dark:bg-boxdark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
                <MdPerson />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Personal Particulars
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Individual identity details and communication channels
                </p>
              </div>
            </div>
            <button
              onClick={handleOpen}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MdEdit className="text-sm" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdPerson className="text-primary text-sm" />
                <span>Full Name</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5 truncate">
                {userData?.username || '—'}
              </p>
            </div>

            {/* Gender */}
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdBoy className="text-primary text-sm" />
                <span>Gender</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5 capitalize">
                {userData?.gender || 'Not specified'}
              </p>
            </div>

            {/* Date of Birth */}
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdCake className="text-primary text-sm" />
                <span>Date of Birth</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5">
                {userData?.dob
                  ? new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  }).format(new Date(userData.dob))
                  : 'N/A'}
              </p>
            </div>

            {/* Preferred Language */}
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdLanguage className="text-primary text-sm" />
                <span>Language</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5 capitalize">
                {userData?.language || 'English (EN)'}
              </p>
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2 bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <MdEmail className="text-primary text-sm" />
                  <span>Email Address</span>
                </div>
                <p className="text-sm font-bold text-black dark:text-white pl-5.5 truncate">
                  {userData?.email || 'N/A'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(userData?.email, 'Email')}
                className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                title="Copy Email"
              >
                <MdContentCopy className="text-base" />
              </button>
            </div>

            {/* Phone Number */}
            <div className="sm:col-span-2 bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <MdPhone className="text-primary text-sm" />
                  <span>Telephone Number</span>
                </div>
                <p className="text-sm font-bold text-black dark:text-white pl-5.5 font-mono">
                  {userData?.telephone || 'Not provided'}
                </p>
              </div>
              {userData?.telephone && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(userData?.telephone, 'Phone')}
                  className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                  title="Copy Phone"
                >
                  <MdContentCopy className="text-base" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Registered Address */}
        <div className="bg-white dark:bg-boxdark rounded-3xl border border-stroke dark:border-strokedark p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-stroke dark:border-strokedark">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl shrink-0">
                <MdHome />
              </div>
              <div>
                <h3 className="text-base font-bold text-black dark:text-white">
                  Registered Address
                </h3>
                <p className="text-xs text-body dark:text-bodydark">
                  Physical location and correspondence headquarters
                </p>
              </div>
            </div>
            <button
              onClick={handleOpen}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <MdEdit className="text-sm" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Street Address */}
            <div className="sm:col-span-2 bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdLocationOn className="text-indigo-500 text-sm" />
                <span>Street & House No.</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5 truncate">
                {fullAddress || 'Not specified'}
              </p>
            </div>

            {/* City */}
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdApartment className="text-indigo-500 text-sm" />
                <span>City / State</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5">
                {userData?.city || 'Not specified'}
              </p>
            </div>

            {/* Country */}
            <div className="bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 space-y-1">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <MdPublic className="text-indigo-500 text-sm" />
                <span>Country</span>
              </div>
              <p className="text-sm font-bold text-black dark:text-white pl-5.5">
                {userData?.country || 'Not specified'}
              </p>
            </div>

            {/* Postal Code */}
            <div className="sm:col-span-2 bg-gray-2/40 dark:bg-meta-4/20 p-3.5 rounded-2xl border border-stroke/60 dark:border-strokedark/60 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <MdMarkunreadMailbox className="text-indigo-500 text-sm" />
                  <span>Postal / ZIP Code</span>
                </div>
                <p className="text-sm font-extrabold text-primary pl-5.5 font-mono">
                  {userData?.postCode || 'Not specified'}
                </p>
              </div>
              {userData?.postCode && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(userData?.postCode, 'Postal Code')}
                  className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer shrink-0"
                  title="Copy Postal Code"
                >
                  <MdContentCopy className="text-base" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Clean & Consistent Edit Profile Modal Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          className:
            'rounded-2xl bg-white dark:bg-boxdark border border-stroke dark:border-strokedark shadow-xl overflow-hidden',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-lg">
              <MdEdit />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-black dark:text-white">
                Edit Profile
              </h3>
              <p className="text-xs text-body dark:text-bodydark">
                Update your personal and address details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-black dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-meta-4 transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto">
            {/* Section 1: Personal Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1 border-b border-stroke/60 dark:border-strokedark/60">
                Personal Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Full Name <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Enter full name"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Date of Birth <span className="text-meta-1">*</span>
                  </label>
                  <div className="px-3 py-0.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl">
                    <DatePickerComponent
                      name="dob"
                      control={control}
                      maxDate={new Date()}
                      label=""
                      rules={{ required: 'field is required' }}
                      errors={errors}
                      textFieldProps={{
                        variant: 'standard',
                        InputProps: {
                          disableUnderline: true,
                          style: { fontSize: '14px' },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="telephone"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="e.g. +31 6 12345678"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>

                {/* Email Address (Read-only) */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <Controller
                    name="email"
                    control={control}
                    disabled
                    render={({ field }) => (
                      <input
                        {...field}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-gray-2 dark:bg-boxdark text-slate-500 border border-slate-200 dark:border-strokedark rounded-xl text-sm cursor-not-allowed"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Address Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1 border-b border-stroke/60 dark:border-strokedark/60">
                Address Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* House Number */}
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    House Number <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="houseNumber"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="e.g. 42A"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>

                {/* Street */}
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Street Name <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="e.g. Main Street"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    City <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="e.g. Amsterdam"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Country <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="e.g. Netherlands"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>

                {/* Postal Code */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-black dark:text-white uppercase tracking-wider mb-1.5">
                    Postal / ZIP Code <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="postCode"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="e.g. 1015 CJ"
                        className="w-full px-3.5 py-2.5 bg-slate-50/70 dark:bg-form-input border border-slate-200 dark:border-strokedark rounded-xl text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-stroke dark:border-strokedark bg-gray-2/30 dark:bg-meta-4/10">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-strokedark transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Profile;
