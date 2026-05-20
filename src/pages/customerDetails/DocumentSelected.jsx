import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  DeleteOutlineOutlined,
  DownloadForOfflineOutlined,
} from '@mui/icons-material';
import { apiPath } from '../../../apiPath';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';

const DocumentSelected = ({ id, isEmployee, email }) => {
  const [documentList, setDocumentList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    filename: '',
    documentType: '',
  });
  const [uploadProgress, setUploadProgress] = useState(0);

  const openDialog = () => setIsDialogOpen(true);

  const closeDialog = () => {
    setIsDialogOpen(false);
    setFile(null);
    setUploadFormData({ filename: '', documentType: '' });
    setUploadProgress(0);
  };

  const notifyError = (message) => toast.error(message, {
          autoClose: 2000,
      });

const handleDownload = async (fileUrl) => {
  try {
    // Fetch file from URL
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }

    // Convert response to blob
    const blob = await response.blob();

    // Create download URL
    const url = window.URL.createObjectURL(blob);

    // Extract filename from URL
    const fileName = fileUrl.split('/').pop();

    // Create anchor tag
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);

    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error downloading the file:', error);
  }
};
  const fetchDocumentList = async () => {
  setLoading(true);
  try {
    let response = null;

    if (id) {
      response = await axios.get(
        `${apiPath}/api/documentList?customer=${id}`
      );
    } else if (email && isEmployee) {
      response = await axios.get(
        `${apiPath}/api/documentList?email=${encodeURIComponent(email)}&isEmployee=${isEmployee}`
      );
    }

    if (response) {
      setDocumentList(response.data.documentList);
    } else {
      setDocumentList([]); // or handle "no request made"
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
  } finally {
    setLoading(false);
  }
  };

  const deleteDocument = async (documentId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this document?',
    );
    if (!isConfirmed) {
      return; // Do nothing if the user cancels
    }
    setLoading(true);
    try {
      const response = await axios.delete(
        `${apiPath}/api/documents/${documentId}`,
      );
      if (response.status === 200) {
        console.log('Document deleted successfully');
        fetchDocumentList();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadFormData({
        ...uploadFormData,
        filename: selectedFile.name,
        mimetype: selectedFile.type,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData({ ...uploadFormData, [name]: value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {return (notifyError("No file selected"))}
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', uploadFormData.filename);
    formData.append('customer', id || '');
    formData.append('documentType', uploadFormData.documentType);
    formData.append('email',email || '');
    formData.append('isEmployee', isEmployee || null);
    try {
      await axios.post(`${apiPath}/api/uploadDocument`, formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });
      setUploadFormData({ filename: '', documentType: '' });
      setFile(null);
      setUploadProgress(0);
      closeDialog();
      fetchDocumentList();
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  useEffect(() => {
    fetchDocumentList();
  }, []);

  return (
    <div className="p-6">
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={openDialog}
        className="mb-4"
      >
        Upload Document
      </Button>
      {loading && <Loader />}
      <div className="overflow-x-auto mt-3 text-slate-800">
        <table className="min-w-full bg-white border border-gray md:table hidden">
          <thead>
            <tr className="w-full bg-slate-300">
              <th className="px-4 py-2 text-left">File Name</th>
              <th className="px-4 py-2 text-center">Type</th>
              <th className="px-4 py-2 text-center">Uploaded On</th>
              <th className="px-4 py-2 text-left">action</th>
            </tr>
          </thead>
          <tbody>
            {documentList &&
              documentList.map((document) => (
                <tr key={document._id} className="border-b border-slate-300">
                  <td className="px-4 py-2 text-left">{document.fileName}</td>
                  <td className="px-4 py-2 text-center">
                    {document.documentType || ''}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {new Date(document.createdAt).toLocaleDateString('en-GB') ||
                      ''}
                  </td>
                  <td className="flex gap-3 px-4 py-2">
                    <IconButton onClick={() => handleDownload(document.path)}>
                      <DownloadForOfflineOutlined />
                    </IconButton>
                    <IconButton onClick={() => deleteDocument(document._id)}>
                      <DeleteOutlineOutlined />
                    </IconButton>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {/* Stacked view for mobile screens */}
        <div className="md:hidden block">
          {documentList &&
            documentList.map((document) => (
              <div
                key={document._id}
                className="border border-gray-300 p-4 mb-3 rounded-md bg-white shadow-sm"
              >
                <p>
                  <strong>File Name:</strong> {document.fileName}
                </p>
                <p>
                  <strong>Type:</strong> {document.documentType || ''}
                </p>
                <p>
                  <strong>Uploaded On:</strong>{' '}
                  {new Date(document.createdAt).toLocaleDateString('en-GB') ||
                    ''}
                </p>
                <div className="flex gap-3 mt-2">
                  <IconButton onClick={() => handleDownload(document.path)}>
                    <DownloadForOfflineOutlined />
                  </IconButton>
                  <IconButton onClick={() => deleteDocument(document._id)}>
                    <DeleteOutlineOutlined />
                  </IconButton>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle
          className="flex justify-between items-center"
          sx={{ marginY: 2 }}
        >
          <span className="text-xl font-semibold">Upload Document</span>
          <IconButton
            onClick={closeDialog}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="space-y-6">
            <div
              className="border-dashed border-2 border-gray-300 p-6 text-center cursor-pointer"
              onClick={() => document.getElementById('fileInput').click()}
            >
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={handleFileSelect}
              />
              <p className="text-gray-500">
                Drag & drop a file here, or click to select one
              </p>
            </div>

            {file && (
              <Typography variant="body2" className="text-gray-600">
                Selected File: {file.name}
              </Typography>
            )}

            <TextField
              label="File Name"
              variant="standard"
              name="filename"
              value={uploadFormData.filename}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Document Type"
              variant="standard"
              name="documentType"
              value={uploadFormData.documentType}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />

            {uploadProgress > 0 && (
              <div className="mt-4">
                <Typography variant="body2" className="text-gray-600">
                  Upload Progress: {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </div>
            )}
          </div>
        </DialogContent>

        <DialogActions>
          <div className="p-5">
            <Button
              onClick={closeDialog}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} variant="contained" color="primary">
              Save
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DocumentSelected;
