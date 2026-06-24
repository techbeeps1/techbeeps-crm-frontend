import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import {
    Button,
    Modal,
    TextField,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm, SubmitHandler } from 'react-hook-form';
import Loader from '../../../common/Loader';
import { toast } from 'react-toastify';
import { DataTable } from "simple-datatables"

interface SalesGroup {
    _id: string;
    name: string;
    code: string | number;
}

interface FormData {
    name: string;
    code: string;
}

const InputHander: React.FC<{ type: string }> = ({ type }) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
    const [data, setData] = useState<SalesGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isModalOpen, setModalOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedSalesGroup, setSelectedSalesGroup] = useState<SalesGroup | null>(null);

    const openModal = (group: SalesGroup | null = null) => {
        setSelectedSalesGroup(group);
        setModalOpen(true);
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

    const openDeleteModal = (group: SalesGroup) => {
        setSelectedSalesGroup(group);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
    };

    const fetchSalesGroups = async () => {
        setLoading(true);
        try {
            const tableId = `#${type}`;

             if ($.fn.DataTable.isDataTable(tableId)) {
                $(tableId).DataTable().destroy();
                 }
            const response = await axios.get<SalesGroup[]>(`${apiPath}/api/sale_group?type=${type}`);
            setData(response.data);
            // setTimeout(() => { new DataTable(tableId) }, 0)
         

                setTimeout(() => {
            $(tableId).DataTable({
                destroy: true
            });
        }, 100);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (formData) => {
        setLoading(true);
        try {
            if (selectedSalesGroup) {
                await axios.put(`${apiPath}/api/sale_group/${selectedSalesGroup._id}`, formData);
                notify('item updated successfully');
            } else {
                await axios.post(`${apiPath}/api/sale_group`, { ...formData, type: type });
                notify('item saved successfully');
            }
            closeModal();
            fetchSalesGroups();
        } catch (err: any) {
            notifyError(`Failed to save:${err?.response?.data?.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteSalesGroup = async () => {
        setLoading(true);
        try {
            if (selectedSalesGroup) {
                await axios.delete(`${apiPath}/api/sale_group/${selectedSalesGroup._id}`);
                closeDeleteModal();
                notify('item Delete successfully');
                fetchSalesGroups();
            }
        } catch (err: any) {
            notifyError(`Error deleting : ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesGroups();
        return () => setData([]);
    }, [type]);

    return (
        <div>
            {loading && <Loader />}
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => openModal()}
                style={{ marginBottom: '20px' }}
            >
                New {type}
            </Button>
            <table id={type} className="w-full">
                <thead>
                    <tr>
                        <th className="border-b">Name</th>
                        {type === 'country' && <th className="border-b">Country Code</th>}
                        {type === 'tax' && <th className="border-b">Tax Persentage</th>}
                        <th className="border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((group) => (
                        <tr key={group._id}>
                            <td className="border-b cursor-pointer p-0" onClick={() => openModal(group)}>
                                {group.name}
                            </td>
                            {(type === 'country' || type === 'tax') && (
                                <td className="border-b cursor-pointer p-0" onClick={() => openModal(group)}>
                                    {group.code}
                                </td>
                            )}
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
                <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
                    <IconButton onClick={closeModal} className="absolute top-0 right-3">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" component="h2" className="mb-5">
                        {selectedSalesGroup ? `Edit ${type}` : `Add New ${type}`}
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <TextField
                            {...register('name', {required: `${type} name is required`})}
                            label={`${type} Name`}
                            fullWidth
                            margin="normal"
                            defaultValue={selectedSalesGroup?.name || ''}
                        />
                        {errors.name && (
                                 <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
                                 {errors?.name.message}</p>)}
                        {type === 'country' && <><TextField
                            {...register('code', { required: `${type} code is required` })}
                            label={`${type} Code`}
                            fullWidth
                            margin="normal"
                            defaultValue={selectedSalesGroup?.code || ''}
                        />
                        {errors?.code && (
                                 <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
                                 {errors?.code.message}</p>)}
                                 </>
                        }
                        {type === 'tax' && (<>
                            <TextField 
                                {...register('code', {
                                    required: `Tax is required`,
                                    valueAsNumber: true,
                                    validate: (value:any) => value >= 0 || 'Value must be non-negative',
                                })}
                                label={`${type} Percentage`}
                                fullWidth
                                type="text"
                                margin="normal"
                                InputProps={{
                                    inputProps: { min: 0 }, // Enforces non-negative input
                                    endAdornment: <span>%</span>, // Adds the '%' dynamically
                                }}
                                onInput={(e) => {
                                    const input = e.target as HTMLInputElement;
                                    if (Number(input.value) < 0) {
                                        input.value = '0'; // Reset to zero if negative
                                    }
                                }}
                                defaultValue={selectedSalesGroup?.code || ''}
                            />
                            {errors?.code && (
                                 <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
                                 {errors?.code.message}</p>)}
                                 </>
                        )}
                        <Box className="flex justify-end mt-4">
                            <Button type="submit" variant="contained" color="primary">
                                {selectedSalesGroup ? 'Update' : 'Add'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Modal>
            <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
                    <IconButton onClick={closeDeleteModal} className="absolute top-0 right-3">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" component="h2" className="mb-5">
                        Confirm Delete
                    </Typography>
                    <Typography className="mb-4">
                        Are you sure you want to delete the {type} named "{selectedSalesGroup?.name}"?
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
    );
};

export default InputHander;

