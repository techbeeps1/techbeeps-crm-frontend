import React, { useContext, useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { Button, TextField, Select, Typography, MenuItem, InputLabel, FormControl, Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import TemplateEditor from './TemplateEditor';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';

const Reporting = () => {
    const [showModal, setShowModal] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(null);
    const [validationMsg, setValidationMsg] = useState('');
    const notify = (message) => toast.success(message);
    const notifyError = (message) => toast.error(message, {
      autoClose: 2000,
    });

    const handleEditTemplate = (templateId) => {
        setSelectedTemplateId(templateId);
        setIsEditorOpen(true);
    };


    const { register, handleSubmit, formState: { errors }, reset, setError } = useForm();

    const handleNewReportClick = () => {
        setShowModal(true);
    };

    const openDeleteModal = (agent) => {
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        reset(); // Reset form fields when closing the modal
    };

    const handleAllPackage = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/templates`);
            const table = $('#template').DataTable();
            if (table) {
            table.destroy();
            }
            setData(response["data"]);
            setTimeout(() => {
                $('#template').DataTable();
            }, 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    // console.log(data)
    useEffect(() => {
        handleAllPackage();
    }, [isDeleteModalOpen]);

  

    const onSubmit = async (data) => {
        try {
            const response = await axios.post(`${apiPath}/api/templates`, data);
            console.log("Template Saved:", response.data);
            handleAllPackage();
            setShowModal(false);
            reset();
        } catch (error) {
            const errorName= error?.response?.data?.error?.errors?.name?.name;
            const errorMsg = error?.response?.data?.error?.errors?.name?.message;
            notifyError(`${errorName}: ${errorMsg}` )
            setError('name', {
                type: 'manual',
                message: errorMsg
            });
            // console.error("Error saving template:", error);
        }
        // setShowModal(false);
        // reset();
    };

    const handleChange = () => {
        setValidationMsg('');
    };

    useEffect(() => {
        if (errors.name) {
            setValidationMsg(errors.name.message);
        } else {
            setValidationMsg('');
        }
    }, [errors]);

    const deletePackage = async (id) => {
        try {
            await axios.delete(`${apiPath}/api/templates/${id}`);
            alert('deleted successfully');
            closeDeleteModal();
            handleAllPackage();
        } catch (error) {
            console.error('Error deleting package:', error.response.data.message || 'Unknown error');
        }
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: '10px',
    };

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <Button
                variant="contained"
                color="primary"
                size='large'
                onClick={handleNewReportClick}
                className="bg-blue text-white"
            >
                New Template
            </Button>

            <div className="mt-6">
                <table id="template" className="">
                    <thead>
                        <tr>
                            <th className="border-b">Name</th>
                            <th className="border-b">Type document</th>
                            <th className="border-b">Type template</th>
                            <th className="border-b">Available in</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((item, index) => (
                            <tr key={index} onClick={() => handleEditTemplate(item._id)}>
                                <td className="border-b font-medium text-lg">{item.name}</td>
                                <td className="border-b text-lg">{item.documentType}</td>
                                <td className="border-b text-lg">{item.templateType}</td>
                                <td className="border-b text-lg">
                                    <div className="flex gap-4 py-1.5">
                                        <span>English
                                        </span>
                                        <DeleteIcon className='ms-4' onClick={(event) => { event.stopPropagation(); openDeleteModal(); setSelectedAgent(item) }} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
                        <IconButton
                            onClick={closeDeleteModal}
                            className="absolute top-0 right-3"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" component="h2" className="mb-5" style={{ margin: "5px 0" }}>
                            Confirm Delete
                        </Typography>
                        <Typography className="mb-4" style={{ margin: "5px 0" }}>
                            Are you sure you want to delete template that Name : {selectedAgent?.name} ?
                        </Typography>
                        <Box className="flex justify-end" style={{ margin: "5px 0", display: "flex", gap: "10px" }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={() => deletePackage(selectedAgent._id)}
                                className="mr-2"
                            >
                                Yes
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={closeDeleteModal}
                            >
                                No
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
            <TemplateEditor
                open={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                templateId={selectedTemplateId}
            />
            <Modal
                open={showModal}
                onClose={handleCloseModal}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={modalStyle} className="relative rounded-lg shadow-lg">
                    <IconButton
                        aria-label="close"
                        onClick={handleCloseModal}
                        className="absolute top-0 left-100"
                    >
                        <CloseIcon />
                    </IconButton>

                    <h2 id="modal-title" className="text-xl font-bold mb-3 ">Create New Document Template</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <div className="mb-4">
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="document-type-label">Document Type*</InputLabel>
                                <Select
                                    labelId="document-type-label"
                                    id="document-type-select"
                                    defaultValue=""
                                    {...register('documentType', { required: 'Please select a document type' })}
                                    error={!!errors.documentType} >
                                    <MenuItem value="invoice">Invoice</MenuItem>
                                    <MenuItem value="quote">Quote</MenuItem>
                                    <MenuItem value="contract">Contract</MenuItem>
                                </Select>
                                {errors.documentType && (
                                    <p className="text-red text-sm mt-1">{errors.documentType.message}</p>
                                )}
                            </FormControl>
                        </div>

                        <div className="mb-4">
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="template-type-label">Template Type*</InputLabel>
                                <Select
                                    labelId="template-type-label"
                                    id="template-type-select"
                                    defaultValue=""
                                    {...register('templateType', { required: 'Please select a template type' })}
                                    error={!!errors.templateType}
                                >
                                    <MenuItem value="basic">Basic</MenuItem>
                                    <MenuItem value="detailed">Detailed</MenuItem>
                                    <MenuItem value="custom">Custom</MenuItem>
                                </Select>
                                {errors.templateType && (
                                    <p className="text-red text-sm mt-1">{errors.templateType.message}</p>
                                )}
                            </FormControl>
                        </div>
                        <div className="mb-4">
                            <TextField
                                label="Name*"
                                variant="standard" // Only bottom border for the input
                                fullWidth
                                {...register('name', {
                        required: 'Name is required',
                        minlength: { value: 2, message: 'Name must be at least 2 characters long' },
                        maxlength: { value: 55, message: 'Name must be at most 55 characters long' }
                    })}
                    error={!!errors.name}
                    helperText={validationMsg || (errors.name ? errors.name.message : '')}
                    onBlur={handleChange} // Reset validation message on change
                            />
                        </div>
                        <div className="mb-4">
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="report-type-label">Based on</InputLabel>
                                <Select
                                    labelId="report-type-label"
                                    id="report-type-select"
                                    defaultValue=""
                                    {...register('link_template')} 
                                    error={!!errors.reportType}
                                >
                                    {data && data.map((item, index) => <MenuItem key={index} value={item._id}>{item.name}</MenuItem>)}
                                </Select>
                                {errors.link_template && (
                                    <p className="text-red text-sm mt-1">{errors.link_template.message}</p>
                                )}
                            </FormControl>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleCloseModal}
                                className="bg-gray"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                className="bg-blue"
                            >
                                Create
                            </Button>
                        </div>
                    </form>
                </Box>
            </Modal>
        </>
    );
};

export default Reporting;
