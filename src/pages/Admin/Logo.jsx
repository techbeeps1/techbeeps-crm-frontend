import React, { useState, useEffect } from 'react';
import { apiPath } from '../../../apiPath';
import { resolveLogoUrl, fetchCompanyLogo } from '../../utils/logoUtil';
import { toast } from 'react-toastify';
import {
  MdCloudUpload,
  MdImage,
  MdCheckCircle,
  MdDeleteOutline,
  MdInfoOutline,
  MdSave,
  MdRefresh
} from 'react-icons/md';

const LogoUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const loadCurrentLogo = async () => {
    const logo = await fetchCompanyLogo();
    if (logo) {
      setImageUrl(logo);
    }
  };

  useEffect(() => {
    loadCurrentLogo();
  }, []);

  const handleProcessFile = (file) => {
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (PNG, JPG, SVG, WebP).');
      setSelectedFile(null);
      setPreviewUrl('');
      toast.error('Only PNG, JPG, SVG, or WebP images are supported.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10MB limit.');
      setSelectedFile(null);
      setPreviewUrl('');
      toast.error('File size must be under 10MB.');
      return;
    }
    setError('');
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleProcessFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleProcessFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file before saving.');
      toast.error('Please select a logo file.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', selectedFile);

    setUploading(true);
    setError('');

    try {
      const response = await fetch(`${apiPath}/api/upload-logo`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Error uploading the logo');
      }

      const data = await response.json();
      const newUrl = resolveLogoUrl(data.fileUrl || data.logoUrl);
      if (newUrl) {
        setImageUrl(newUrl);
        localStorage.setItem('logoUrl', newUrl);
        window.dispatchEvent(new CustomEvent('logoUpdated', { detail: newUrl }));
      }
      toast.success('Company logo uploaded and updated successfully!');
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (err) {
      setError(err.message || 'Failed to upload logo.');
      toast.error(err.message || 'Failed to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  const currentLogoSrc = imageUrl || resolveLogoUrl('/uploads/logo.png');

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Active Logo Showcase */}
      <div className="bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-28 h-20 bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark p-2 flex items-center justify-center shadow-xs overflow-hidden">
            <img
              src={currentLogoSrc}
              alt="Current Logo"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/180x60/3c50e0/ffffff?text=COMPANY+LOGO';
              }}
            />
          </div>
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
              Active Brand Logo
            </span>
            <p className="text-sm font-bold text-black dark:text-white mt-0.5">
              Live Company Emblem
            </p>
            <p className="text-xs text-body dark:text-bodydark">
              Displayed on Login, Sidebar, Quotes, Invoices & PDFs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-success/10 text-success self-start md:self-auto border border-success/20">
          <MdCheckCircle className="text-sm" />
          Active In System
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-2">
          Upload New Logo
        </label>
        <input
          accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
          type="file"
          id="logo-file-upload"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
            isDragOver
              ? 'border-primary bg-primary/10 scale-[1.01]'
              : 'border-stroke dark:border-strokedark bg-white dark:bg-boxdark hover:border-primary/60 hover:bg-gray-2/50 dark:hover:bg-meta-4/20'
          }`}
          onClick={() => document.getElementById('logo-file-upload')?.click()}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mx-auto mb-3 shadow-xs">
            <MdCloudUpload />
          </div>
          <h4 className="text-sm sm:text-base font-bold text-black dark:text-white">
            Click or drag & drop new logo here
          </h4>
          <p className="text-xs text-body dark:text-bodydark mt-1 max-w-sm mx-auto">
            High-resolution PNG/SVG with transparent background recommended (Max file size: 10 MB)
          </p>
        </div>

        {error && (
          <p className="text-meta-1 text-xs mt-2 font-medium flex items-center gap-1">
            <MdInfoOutline className="text-sm" />
            {error}
          </p>
        )}
      </div>

      {/* Selected File Live Preview Card */}
      {selectedFile && previewUrl && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-20 h-16 bg-white dark:bg-boxdark rounded-xl border border-primary/30 p-1 flex items-center justify-center shrink-0 shadow-xs">
              <img
                src={previewUrl}
                alt="Upload Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-body dark:text-bodydark">
                {(selectedFile.size / 1024).toFixed(1)} KB • Ready to publish
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl('');
            }}
            className="p-2 text-slate-400 hover:text-meta-1 hover:bg-meta-1/10 rounded-lg transition-colors cursor-pointer"
            title="Remove selection"
          >
            <MdDeleteOutline className="text-xl" />
          </button>
        </div>
      )}

      {/* Guidelines Box */}
      <div className="p-4 rounded-xl bg-gray-2 dark:bg-meta-4/30 border border-stroke dark:border-strokedark text-xs text-body dark:text-bodydark space-y-1">
        <p className="font-bold text-black dark:text-white text-xs mb-1 flex items-center gap-1.5">
          <MdInfoOutline className="text-primary text-sm" />
          Logo Specifications & Recommendations:
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
          <li>Format: PNG with alpha transparency, SVG, WebP, or high-res JPG</li>
          <li>Ideal dimensions: 400px × 120px (horizontal aspect ratio preferred)</li>
          <li>Automatically synced with the Login screen, Invoices, Quotations, and Sidebar</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={uploading || !selectedFile}
          className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-7 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MdSave className="text-lg" />
          {uploading ? 'Uploading Logo...' : 'Save & Publish Logo'}
        </button>
      </div>
    </form>
  );
};

export default LogoUploadForm;
