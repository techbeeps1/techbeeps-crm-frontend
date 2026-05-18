import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { apiPath, imageUrl } from '../../../apiPath';

const LogoUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const savedImageUrl = localStorage.getItem('logoUrl'); // Get from localStorage
    if (savedImageUrl) {
      setImageUrl(savedImageUrl); // Set the state if there's a saved image URL
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type !== 'image/png') {
        setError('Please upload a PNG file.');
        setSelectedFile(null);
        return;
      }
      setError(''); // Reset error message
      setSelectedFile(file); // Set the selected file for upload
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please upload a PNG file before submitting.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', selectedFile); // Name should be 'logo'

    setUploading(true);
    setSuccessMessage('');
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
        setImageUrl(data.fileUrl); // Update the state with the uploaded image URL
        // Save the uploaded URL in localStorage
        localStorage.setItem('logoUrl', data.fileUrl);
      }
      setSuccessMessage('Logo uploaded successfully');
      setSelectedFile(null); // Reset the file input
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-lg p-6 space-y-4"
    >
      <img
        src={imageUrl ? imageUrl : `${apiPath}/uploads/logo.png`}
        alt=""
        style={{ height: '85px', borderRadius: '20px' }}
      />
      <h2 className="text-lg font-semibold text-gray-800">Upload Your Logo</h2>
      <p className="text-gray-600 mb-4">
        Select a PNG file to upload as your company logo.
      </p>
      <div>
        <input
          accept=".png" // Ensure only JPG files can be selected
          type="file"
          id="file-upload"
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the default input
        />
        <label
          htmlFor="file-upload"
          className="block border-2 border-dashed border-blue-500 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition duration-200"
        >
          <CloudUpload className="mx-auto text-blue-500 text-4xl" />
          <p className="mt-2 text-blue-600 font-semibold">
            Click or drag to upload logo
          </p>
        </label>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>
      {selectedFile && (
        <div className="mt-4 text-center">
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected Logo Preview"
            className="w-32 h-32 object-cover rounded-md border-2 border-blue-500"
          />
          <p className="mt-2 text-gray-600">Preview of your logo</p>
        </div>
      )}
      {successMessage && (
        <p className="text-green-600 text-sm mt-2">{successMessage}</p>
      )}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        className="py-2 mt-4 rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Save Logo'}
      </Button>
    </form>
  );
};

export default LogoUploadForm;
