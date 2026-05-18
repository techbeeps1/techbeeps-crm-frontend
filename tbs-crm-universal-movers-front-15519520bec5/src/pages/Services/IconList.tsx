import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
    Button, Modal, Typography, Box, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';

const IconList: React.FC = () => {
    const [icons, setIcons] = useState([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSalesGroup, setSelectedSalesGroup] = useState<any>(null);

    const openModal = (group: any) => {
        setSelectedSalesGroup(group);
        setModalOpen(true);
        if (!group) {
            reset({ name: '' });
        }
        if (group) {
            reset({ name: group.name });
        }
    };
    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const closeModal = () => {
        setModalOpen(false);
        setSelectedSalesGroup(null);
        reset();
    };

    const openDeleteModal = (group: any) => {
        setSelectedSalesGroup(group);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
    };

    const onSubmit = async (formData: any) => {
        setLoading(true);
        try {
            const iconData = new FormData(); // Use FormData for file upload
            iconData.append('name', formData.name); // Append the icon name
            if (formData.svg?.[0]) {
                iconData.append('icon', formData.svg[0]); // Append the SVG file
            }
            if (selectedSalesGroup) {
                await axios.put(`${apiPath}/api/icons/${selectedSalesGroup._id}`, iconData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                notify('Icon updated successfully');
            } else {
                await axios.post(`${apiPath}/api/icons/upload`, iconData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                notify('Icon saved successfully');
            }
            reset();
            closeModal();
            fetchIcons(); // Fetch updated list of icons
        } catch (error: any) {
            notifyError(`Failed to save icon: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const deleteSalesGroup = async () => {
        setLoading(true);
        try {
            await axios.delete(`${apiPath}/api/icons/${selectedSalesGroup._id}`);
            closeDeleteModal();
            fetchIcons()
            notify('item Delete successfully');
        } catch (error: any) {
            notifyError(`Error deleting : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchIcons = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/icons`);
            setIcons(response.data);
            setTimeout(() => {
                $('#icon').DataTable();
            }, 0);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIcons()
    }, []);



    return (
        <>
            <div>
                {loading && <Loader />}
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => openModal(null)}
                    style={{ marginBottom: "20px" }}
                >
                    New Icon
                </Button>
                <table id="icon" className="w-full">
                    <thead>
                        <tr>
                            <th className="border-b">Name</th>
                            <th className="border-b">Icon</th>
                            <th className="border-b">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {icons && icons.map((group: any) => (
                            <tr key={group._id}>
                                <td className="border-b cursor-pointer p-0" onClick={() => openModal(group)}>
                                    {group.name}
                                </td>
                                <td className="border-b cursor-pointer p-0" onClick={() => openModal(group)}>
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '35px', height: '35px', overflow: 'hidden', padding: '3px' }}
                                        dangerouslySetInnerHTML={{ __html: group.svg }}
                                    />
                                </td>
                                <td className="border-b p-0 flex gap-4">
                                    <IconButton onClick={() => openDeleteModal(group)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Modal open={isModalOpen} onClose={closeModal}>
                    <div className="bg-white px-6 py-4 rounded shadow-md max-w-md mx-auto mt-30">
                        <IconButton onClick={closeModal} className="absolute top-0 left-90">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" component="h2" marginTop={-4} paddingBottom={2}>
                            {selectedSalesGroup ? 'Edit Icon' : 'Add New Icon'}
                        </Typography>
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="mx-auto"
                        >
                            {/* Icon Name */}
                            <div className="flex flex-col">
                                <label htmlFor="name" className="font-medium mb-2">
                                    Icon Name
                                </label>
                                <input
                                    {...register('name', {
                                        required: 'Icon name is required',
                                    })}
                                    id="name"
                                    type="text"
                                    placeholder="Enter icon name"
                                    className={`border rounded p-3 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.name ? 'border-red-500' : 'border-gray'
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {/* SVG Upload */}
                            <div className="flex flex-col mt-4">
                                <label htmlFor="svg" className="font-medium mb-2">
                                    Upload SVG
                                </label>
                                <input
                                    {...register('svg', {
                                        required: selectedSalesGroup ? false : 'SVG file is required',
                                    })}
                                    id="iconSvg"
                                    type="file"
                                    accept=".svg"
                                    className={`border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${errors.svg ? 'border-red-500' : 'border-gray'
                                        }`}
                                />
                                {errors.svg && (
                                    <p className="text-red-500 text-sm mt-1">{errors.svg.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end mt-6">
                                <button
                                    type="submit"
                                    className="bg-primary text-white font-medium px-6 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                                >
                                    {selectedSalesGroup ? 'Update Icon' : 'Add Icon'}
                                </button>
                            </div>
                        </form>


                    </div>
                </Modal>

                {/* Delete Confirmation Modal */}
                <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                    <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
                        <IconButton onClick={closeDeleteModal} className="absolute top-0 right-3">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" component="h2" className="mb-5">
                            Confirm Delete
                        </Typography>
                        <Typography className="mb-4">
                            Are you sure you want to delete item "{selectedSalesGroup?.name}"?
                        </Typography>
                        <Box className="flex justify-end" style={{ gap: '10px' }}>
                            <Button variant="contained" color="secondary" onClick={deleteSalesGroup}>
                                Yes
                            </Button>
                            <Button variant="outlined" onClick={closeDeleteModal}>
                                No
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </div>
        </>

    );
};

export default IconList;
