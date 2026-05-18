import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
    Button,
    TextField,
    Select,
    Typography,
    MenuItem,
    InputLabel,
    FormControl,
    Modal,
    Box,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import EmailTemplateEditor from './EmailTemplateEditor';
import Loader from '../../../common/Loader';

interface Template {
    _id: string;
    name: string;
    status: string;
    templateType: string;
}

interface FormData {
    name: string;
    documentType: string;
    templateType: string;
    link_template?: string | null;
}

const EmailTemplateList: React.FC = () => {
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [data, setData] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedAgent, setSelectedAgent] = useState<Template | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<any>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        defaultValues: {
            documentType: '',
            templateType: '',
            name: '',
            link_template: '',
        },
    });

    const handleEditTemplate = (templateId: string) => {
        setSelectedTemplateId(templateId);
        setIsEditorOpen(true);
    };

    const handleNewReportClick = () => setShowModal(true);

    const openDeleteModal = (agent: Template) => {
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => setDeleteModalOpen(false);

    const handleCloseModal = () => {
        setShowModal(false);
        reset(); // Reset form fields when closing the modal
    };

    const handleAllReports = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/reporting`);
            const table = $('#emailTemplate').DataTable();
            if (table) {
            table.destroy();
            }
            setData(response.data.reportings);
            setTimeout(() => {
                $('#emailTemplate').DataTable();
            }, 0);
        } catch (err) {
            console.error('Failed to fetch templates:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        handleAllReports();
    }, [isDeleteModalOpen]);

    const onSubmit: SubmitHandler<FormData> = async (formData) => {
        try {
            const response = await axios.post(`${apiPath}/api/reporting`, formData);
            handleAllReports();
            setShowModal(false);
            reset();
        } catch (error) {
            console.error('Error saving template:', error);
        }
    };

    const deletePackage = async (id: string) => {
        try {
            await axios.delete(`${apiPath}/api/reporting/${id}`);
            alert('Deleted successfully');
            closeDeleteModal();
            handleAllReports();
        } catch (error) {
            console.error('Error deleting template:', error);
        }
    };
    const modalStyle: any = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '500px',
        bgcolor: 'background.paper',
        boxShadow: '24',
        p: 4,
        borderRadius: '10px',
    };

    return (
        <>
            {loading && <Loader />}
            <Button variant="contained" color="primary" onClick={handleNewReportClick}>
                New Reporting Template
            </Button>

            <div className="mt-6">
                <table id="emailTemplate">
                    <thead>
                        <tr>
                            <th className="border-b">Name</th>
                            <th className="border-b">Status</th>
                            <th className="border-b">action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((item) => (
                            <tr key={item._id} onClick={() => handleEditTemplate(item._id)}>
                                <td className="border-b font-medium text-lg">{item.name}</td>
                                <td className="border-b text-lg">{item.status}</td>
                                <td className="border-b text-lg">
                                    <DeleteIcon
                                        className="ms-4 my-1.5"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            openDeleteModal(item);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
                    <IconButton onClick={closeDeleteModal} className="absolute top-0 right-3">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className="mb-5">
                        Confirm Delete
                    </Typography>
                    <Typography className="mb-4">
                        Are you sure you want to delete reporting template: {selectedAgent?.name}?
                    </Typography>
                    <Box className="flex justify-end" style={{ gap: '10px' }}>
                        <Button variant="contained" color="secondary" onClick={() => deletePackage(selectedAgent!._id)}>
                            Yes
                        </Button>
                        <Button variant="outlined" onClick={closeDeleteModal}>
                            No
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <EmailTemplateEditor
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

                    <h2 id="modal-title" className="text-xl font-bold mb-3 ">Create New Reporting Email Template</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        <div className="">
                            <TextField
                                label="Name"
                                variant="standard" // Only bottom border for the input
                                fullWidth
                                {...register('name', { required: 'Name is required' })}
                                error={!!errors.name}
                                helperText={errors.name ? errors.name.message : ''}
                            />
                        </div>
                        <div className="">
                            <FormControl fullWidth variant="standard">
                                <InputLabel id="report-type-label">Based on</InputLabel>
                                <Select
                                    labelId="report-type-label"
                                    id="report-type-select"
                                    defaultValue=""
                                    {...register('link_template')}
                                    error={!!errors.link_template}
                                >
                                    {data && data.map((item, index) => <MenuItem key={index} value={item._id}>{item.name}</MenuItem>)}
                                </Select>
                                {errors.link_template && (
                                    <p className="text-red text-sm mt-1">{errors.link_template.message}</p>
                                )}
                            </FormControl>
                        </div>
                        <div className="flex justify-end space-x-2 mt-2">
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

export default EmailTemplateList;
