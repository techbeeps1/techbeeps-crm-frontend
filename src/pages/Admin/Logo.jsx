import React, { useState, useEffect } from 'react';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import {
  MdCloudUpload,
  MdImage,
  MdCheckCircle,
  MdDeleteOutline,
  MdInfoOutline,
  MdSave
} from 'react-icons/md';

const LogoUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const savedImageUrl = localStorage.getItem('logoUrl');
    if (savedImageUrl) {
      setImageUrl(savedImageUrl);
    }
  }, []);

  const handleProcessFile = (file) => {
    if (!file) return;
    if (file.type !== 'image/png') {
      setError('Only PNG files with transparency are supported.');
      setSelectedFile(null);
      toast.error('Please upload a valid PNG image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      setSelectedFile(null);
      toast.error('File size must be under 5MB.');
      return;
    }
    setError('');
    setSelectedFile(file);
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
      setError('Please select a PNG logo before saving.');
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
        throw new Error('Error uploading the logo');
      }

      const data = await response.json();
      if (data.fileUrl) {
        setImageUrl(data.fileUrl);
        localStorage.setItem('logoUrl', data.fileUrl);
      }
      toast.success('Company logo uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'Failed to upload logo.');
      toast.error(err.message || 'Failed to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  const currentLogoSrc = imageUrl || `${apiPath}/uploads/logo.png`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Active Logo Showcase */}
      <div className="bg-gray-2/70 dark:bg-meta-4/20 p-5 rounded-2xl border border-stroke dark:border-strokedark flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-24 h-20 bg-white dark:bg-boxdark rounded-xl border border-stroke dark:border-strokedark p-2 flex items-center justify-center shadow-xs overflow-hidden">
            <img
              src={currentLogoSrc}
              alt="Current Logo"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                // Fallback placeholder if missing
                e.currentTarget.src = 'https://placehold.co/180x60/3c50e0/ffffff?text=TECHBEEPS';
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
              Printed on top-right of all PDF estimates and client invoices
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
          Upload New PNG Logo
        </label>
        <input
          accept="image/png"
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
            High-resolution PNG with transparent background recommended (Max file size: 5 MB)
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
      {selectedFile && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between gap-4 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-16 h-14 bg-white dark:bg-boxdark rounded-xl border border-primary/30 p-1 flex items-center justify-center shrink-0">
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Upload Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-black dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-[11px] text-body dark:text-bodydark">
                {(selectedFile.size / 1024).toFixed(1)} KB • PNG Format ready
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFile(null)}
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
          <li>Format: PNG (Portable Network Graphics) with alpha transparency</li>
          <li>Ideal dimensions: 400px × 120px (horizontal orientation preferred)</li>
          <li>Ensure strong contrast for both white and dark invoice backgrounds</li>
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

