import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';

const getFileIcon = (fileName = '') => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return { icon: '🖼️', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' };
  if (['pdf'].includes(ext)) return { icon: '📄', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
  if (['doc','docx'].includes(ext)) return { icon: '📝', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' };
  if (['xls','xlsx','csv'].includes(ext)) return { icon: '📊', color: '#10b981', bg: 'rgba(16,185,129,0.12)' };
  if (['zip','rar','7z'].includes(ext)) return { icon: '🗜️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };
  return { icon: '📁', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' };
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const DocumentSelected = ({ id, isEmployee = '', email = '' }) => {
  const [dragActive, setDragActive] = useState(false);
  const [documentList, setDocumentList] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({ filename: '', documentType: '' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStarted, setUploadStarted] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => {
    setIsDialogOpen(false);
    setFile(null);
    setUploadFormData({ filename: '', documentType: '' });
    setUploadProgress(0);
    setUploadStarted(false);
  };

  const notifyError = (msg) => toast.error(msg, { autoClose: 2000 });
  const notifySuccess = (msg) => toast.success(msg, { autoClose: 2000 });

  const handleDownload = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const fileName = fileUrl.split('/').pop();
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      notifyError('Download failed');
    }
  };

  const fetchDocumentList = async () => {
    setLoading(true);
    try {
      let response = null;
      if (id) {
        response = await axios.get(`${apiPath}/api/documentList?customer=${id}`);
      } else if (email && isEmployee) {
        response = await axios.get(`${apiPath}/api/documentList?email=${encodeURIComponent(email)}&isEmployee=${isEmployee}`);
      }
      if (response) setDocumentList(response.data.documentList);
      else setDocumentList([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setDeletingId(documentId);
    try {
      const response = await axios.delete(`${apiPath}/api/documents/${documentId}`);
      if (response.status === 200) {
        notifySuccess('Document deleted');
        fetchDocumentList();
      }
    } catch (error) {
      notifyError('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setUploadFormData((prev) => ({ ...prev, filename: droppedFile.name, mimetype: droppedFile.type }));
    }
  };

  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadFormData({ ...uploadFormData, filename: selectedFile.name, mimetype: selectedFile.type });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadFormData({ ...uploadFormData, [name]: value });
  };

  const handleUpload = async (e) => {
    if (uploadStarted) return;
    setUploadStarted(true);
    e.preventDefault();
    if (!file) { notifyError('No file selected'); setUploadStarted(false); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', uploadFormData.filename);
    formData.append('customer', id || '');
    formData.append('documentType', uploadFormData.documentType);
    formData.append('email', email || '');
    formData.append('isEmployee', isEmployee || null);
    try {
      await axios.post(`${apiPath}/api/uploadDocument`, formData, {
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        },
      });
      notifySuccess('Document uploaded!');
      closeDialog();
      fetchDocumentList();
    } catch (error) {
      notifyError('Upload failed');
      setUploadStarted(false);
    }
  };

  useEffect(() => { fetchDocumentList(); }, [id, email, isEmployee]);

  return (
    <>
      <style>{`
        .dt-wrap { padding: 0; }
        .dt-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .dt-title { font-size:18px; font-weight:700; color:#1e293b; }
        .dt-title span { color:#6366f1; }
        .dt-count { font-size:12px; color:#94a3b8; margin-top:2px; }
        .dt-upload-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:9px 18px; border-radius:10px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);
          color:#fff; font-size:13px; font-weight:600;
          box-shadow:0 4px 14px rgba(99,102,241,0.35);
          transition:all 0.2s ease; font-family:inherit;
        }
        .dt-upload-btn:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(99,102,241,0.45); }

        .dt-table-wrap {
          border-radius:14px; border:1px solid #e2e8f0;
          overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.06);
        }
        .dt-table { width:100%; border-collapse:collapse; background:#fff; }
        .dt-table thead tr {
          background:#f1f5f9;
        }
        .dt-table thead th {
          padding:13px 18px; text-align:left;
          font-size:11px; font-weight:700; letter-spacing:0.07em;
          text-transform:uppercase; color:#6366f1;
          border-bottom:1px solid #e2e8f0;
          white-space:nowrap;
        }
        .dt-table thead th:last-child { text-align:center; }

        .dt-table tbody tr {
          border-bottom:1px solid #f1f5f9;
          transition:background 0.15s;
        }
        .dt-table tbody tr:last-child { border-bottom:none; }
        .dt-table tbody tr:hover { background:#f8faff; }

        .dt-table td { padding:13px 18px; font-size:13.5px; color:#334155; vertical-align:middle; }

        .dt-file-cell { display:flex; align-items:center; gap:12px; }
        .dt-file-icon { width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .dt-file-name { font-weight:600; color:#1e293b; font-size:13px; max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .dt-file-ext { font-size:11px; color:#94a3b8; margin-top:2px; text-transform:uppercase; }

        .dt-badge {
          display:inline-flex; align-items:center;
          padding:3px 10px; border-radius:20px;
          font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;
        }
        .dt-date { font-size:13px; color:#64748b; white-space:nowrap; }

        .dt-actions { display:flex; align-items:center; justify-content:center; gap:6px; }
        .dt-btn {
          display:inline-flex; align-items:center; gap:5px;
          padding:5px 12px; border-radius:8px; border:none; cursor:pointer;
          font-size:12px; font-weight:600; transition:all 0.15s; font-family:inherit;
        }
        .dt-btn.dl { background:rgba(99,102,241,0.1); color:#6366f1; }
        .dt-btn.dl:hover { background:rgba(99,102,241,0.2); }
        .dt-btn.del { background:rgba(239,68,68,0.08); color:#ef4444; }
        .dt-btn.del:hover { background:rgba(239,68,68,0.18); }
        .dt-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .dt-empty { padding:60px 24px; text-align:center; background:#fff; }
        .dt-empty-icon { font-size:48px; opacity:0.4; margin-bottom:12px; }
        .dt-empty-text { font-size:15px; font-weight:600; color:#cbd5e1; }
        .dt-empty-sub { font-size:13px; color:#e2e8f0; margin-top:4px; }

        /* Modal */
        .dt-overlay {
          position:fixed; inset:0; background:rgba(0,0,0,0.5);
          backdrop-filter:blur(4px); z-index:9999;
          display:flex; align-items:center; justify-content:center; padding:20px;
          animation:dtFade 0.15s ease;
        }
        @keyframes dtFade { from{opacity:0} to{opacity:1} }
        @keyframes dtUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .dt-modal {
          background:#fff; border-radius:18px; width:100%; max-width:500px;
          box-shadow:0 24px 80px rgba(0,0,0,0.2); animation:dtUp 0.2s ease; overflow:hidden;
        }
        .dt-modal-head {
          display:flex; align-items:center; justify-content:space-between;
          padding:22px 24px 18px;
          background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff;
        }
        .dt-modal-head-title { font-size:17px; font-weight:700; }
        .dt-modal-close {
          width:30px; height:30px; border-radius:50%;
          background:rgba(255,255,255,0.2); border:none; cursor:pointer;
          color:#fff; display:flex; align-items:center; justify-content:center;
          transition:background 0.15s;
        }
        .dt-modal-close:hover { background:rgba(255,255,255,0.35); }
        .dt-modal-body { padding:22px; display:flex; flex-direction:column; gap:16px; }

        .dt-dropzone {
          border:2px dashed #c7d2fe; border-radius:12px; padding:28px 20px;
          text-align:center; cursor:pointer; transition:all 0.2s; background:#f8faff;
        }
        .dt-dropzone.drag { border-color:#6366f1; background:rgba(99,102,241,0.06); }
        .dt-dropzone:hover { border-color:#818cf8; }
        .dt-drop-icon { font-size:32px; margin-bottom:8px; }
        .dt-drop-text { font-size:13px; color:#64748b; font-weight:500; }
        .dt-drop-sub { font-size:12px; color:#94a3b8; margin-top:3px; }

        .dt-file-ok { display:flex; align-items:center; gap:8px; padding:9px 12px; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:9px; font-size:13px; color:#10b981; font-weight:500; }
        .dt-input-grp { display:flex; flex-direction:column; gap:5px; }
        .dt-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; }
        .dt-input { padding:9px 13px; border-radius:9px; border:1.5px solid #e2e8f0; font-size:13px; color:#1e293b; outline:none; font-family:inherit; transition:border-color 0.15s; }
        .dt-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.1); }

        .dt-prog-bar { height:5px; background:#e2e8f0; border-radius:99px; overflow:hidden; }
        .dt-prog-fill { height:100%; background:linear-gradient(90deg,#6366f1,#a78bfa); border-radius:99px; transition:width 0.3s ease; }

        .dt-modal-foot { padding:14px 22px 22px; display:flex; justify-content:flex-end; gap:10px; }
        .dt-cancel { padding:9px 18px; border-radius:9px; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
        .dt-cancel:hover { background:#f8fafc; }
        .dt-save { padding:9px 22px; border-radius:9px; border:none; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; font-size:13px; font-weight:600; cursor:pointer; font-family:inherit; box-shadow:0 4px 12px rgba(99,102,241,0.3); transition:all 0.2s; }
        .dt-save:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(99,102,241,0.4); }
        .dt-save:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
      `}</style>

      <div className="dt-wrap">
        {/* Header */}
        <div className="dt-header">
          <div>
            <div className="dt-title">Documents <span>&amp; Files</span></div>
            <div className="dt-count">{documentList.length} file{documentList.length !== 1 ? 's' : ''} uploaded</div>
          </div>
          <button className="dt-upload-btn" onClick={openDialog}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload Document
          </button>
        </div>

        {loading && <Loader />}

        {/* Table */}
        {!loading && (
          <div className="dt-table-wrap">
            <table className="dt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Uploaded On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documentList.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="dt-empty">
                        <div className="dt-empty-icon">📂</div>
                        <div className="dt-empty-text">No documents uploaded yet</div>
                        <div className="dt-empty-sub">Click "Upload Document" to add files</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  documentList.map((doc, idx) => {
                    const { icon, color, bg } = getFileIcon(doc.fileName);
                    return (
                      <tr key={doc._id}>
                        <td style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, width: '40px' }}>{idx + 1}</td>
                        <td>
                          <div className="dt-file-cell">
                            <div className="dt-file-icon" style={{ background: bg }}>{icon}</div>
                            <div>
                              <div className="dt-file-name" title={doc.fileName}>{doc.fileName}</div>
                              <div className="dt-file-ext">{doc.fileName.split('.').pop()}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {doc.documentType ? (
                            <span className="dt-badge" style={{ background: bg, color }}>{doc.documentType}</span>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td className="dt-date">{formatDate(doc.createdAt)}</td>
                        <td>
                          <div className="dt-actions">
                            <button className="dt-btn dl" onClick={() => handleDownload(doc.path)}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                              Download
                            </button>
                            <button className="dt-btn del" onClick={() => deleteDocument(doc._id)} disabled={deletingId === doc._id}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                              </svg>
                              {deletingId === doc._id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isDialogOpen && (
        <div className="dt-overlay" onClick={(e) => e.target === e.currentTarget && closeDialog()}>
          <div className="dt-modal">
            <div className="dt-modal-head">
              <div className="dt-modal-head-title">Upload Document</div>
              <button className="dt-modal-close" onClick={closeDialog}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="dt-modal-body">
              <div
                className={`dt-dropzone${dragActive ? ' drag' : ''}`}
                onClick={() => document.getElementById('dtFileInput').click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" id="dtFileInput" style={{ display: 'none' }} onChange={handleFileSelect} />
                <div className="dt-drop-icon">☁️</div>
                <div className="dt-drop-text">Drag &amp; Drop your file here</div>
                <div className="dt-drop-sub">or click to browse from your device</div>
              </div>
              {file && (
                <div className="dt-file-ok">
                  <span>✅</span>
                  <span style={{ flex: 1 }}>{file.name}</span>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>{formatSize(file.size)}</span>
                </div>
              )}
              <div className="dt-input-grp">
                <label className="dt-label">File Name</label>
                <input className="dt-input" name="filename" value={uploadFormData.filename} onChange={handleInputChange} placeholder="Enter file name" />
              </div>
              <div className="dt-input-grp">
                <label className="dt-label">Document Type</label>
                <input className="dt-input" name="documentType" value={uploadFormData.documentType} onChange={handleInputChange} placeholder="e.g. Invoice, Quote, Test…" />
              </div>
              {uploadProgress > 0 && (
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#64748b', marginBottom:'5px' }}>
                    <span>Uploading…</span><span>{uploadProgress}%</span>
                  </div>
                  <div className="dt-prog-bar">
                    <div className="dt-prog-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
            <div className="dt-modal-foot">
              <button className="dt-cancel" onClick={closeDialog}>Cancel</button>
              <button className="dt-save" onClick={handleUpload} disabled={uploadStarted}>
                {uploadStarted ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentSelected;
