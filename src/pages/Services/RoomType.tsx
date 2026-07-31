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
import { FurnitureDrawer } from './FurnitureDrawer';
import IconPicker from './IconPicker';

const RoomType: React.FC = () => {
    const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm();
    const [data, setData] = useState([]);
      const [removeicon, setremoveIcon] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSalesGroup, setSelectedSalesGroup] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState<any>(null);
    const [icons, setIcons] = useState<any[]>([]);
    const [furniture, setFurniture] = useState<any[]>([]);


    const openModal = (group: any) => {
        setSelectedSalesGroup(group);
         setremoveIcon(false);
        setModalOpen(true);
        if (!group) {
            reset({ roomTypeName: '', icon: null });
        }
        if (group) {
            reset({ roomTypeName: group?.roomTypeName, icon: group?.icon });
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

    const fetchSalesGroups = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/room`);
            const table = $('#room').DataTable();
             if (table) {
             table.destroy();
             }
            setData(response.data);
            setTimeout(() => {
                $('#room').DataTable();
            }, 0);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };


    const onSubmit = async (formData: any) => {
    
        if(formData.roomTypeName.trim() === ''){
            notifyError('Room type name is required');
            return;
        }
        if(formData.roomTypeName.length > 55 || formData.roomTypeName.length < 2){
            notifyError('Room type name must be between 2 and 55 characters');
            return;
        }
        setLoading(true);
        try {
            if (selectedSalesGroup) {
                await axios.put(`${apiPath}/api/room/${selectedSalesGroup._id}`, formData);
                notify('item updated successfully');
                reset()
            } else {
                await axios.post(`${apiPath}/api/room`, { ...formData, type: 'room' });
                notify('item saved successfully');
                reset()
            }
            closeModal();
            fetchSalesGroups();
        } catch (error: any) {
            notifyError(`Failed to save:${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteSalesGroup = async () => {
        setLoading(true);
        try {
            await axios.delete(`${apiPath}/api/room/${selectedSalesGroup._id}`);
            closeDeleteModal();
            fetchSalesGroups();
            notify('item Delete successfully');
        } catch (error: any) {
            notifyError(`Error deleting : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchFurniture = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/furniture`);
            setFurniture(response.data);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchSalesGroups();
        // fetchIcons();
        fetchFurniture();
    }, []);

    return (
        <div>
            {loading && <Loader />}
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => openModal(null)}
                style={{ marginBottom: "20px" }}
            >
                New Room
            </Button>
            <table id="room" className="w-full">
                <thead>
                    <tr>
                        <th className="border-b text-lg">Name</th>
                        <th className="border-b text-lg">Icon</th>
                        <th className="border-b text-lg">Furniture</th>
                        <th className="border-b text-lg">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((group: any) => (
                        <tr key={group._id}>
                            <td className="border-b cursor-pointer p-0 text-lg font-medium" onClick={() => openModal(group)}>
                                {group.roomTypeName}
                            </td>
                            <td className="border-b cursor-pointer p-0" onClick={() => openModal(group)}>
                                <div
                                    style={{
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '3px'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: group?.icon }}
                                />
                            </td>
                            <td className="border-b cursor-pointer p-0" onClick={() => setIsDrawerOpen(group)} >
                                <button className="bg-gray text-black shadow font-medium px-6 py-2 rounded hover:bg-blue focus:outline-none">
                                    Edit Furniture
                                </button>
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

            <FurnitureDrawer furniture={furniture && furniture} selectItem={isDrawerOpen} setSelectItem={setIsDrawerOpen} />

            <Modal open={isModalOpen} onClose={closeModal}>
                <div className="flex items-center justify-center min-h-screen text-lg text-black">
                    <div className="bg-white px-6 py-4 rounded shadow-md max-w-lg mx-auto w-full">
                        <IconButton onClick={closeModal} className="absolute top-0" style={{ left: '92%' }}>
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h5" component="h2" marginTop={-4} paddingBottom={2} color={'blue'}>
                            {selectedSalesGroup ? 'Edit Room type' : 'New Room Type'}
                        </Typography>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-7 overflow-auto p-1">
                            <div className="flex flex-col">
                                <label htmlFor="roomTypeName" className="font-medium mb-2">
                                    Room Type
                                </label>
                                <input
                                    {...register('roomTypeName', {
                                        required: 'Room type is required',
                                    })}
                                    id="roomTypeName"
                                    type="text"
                                    placeholder="Enter name"
                                    className={`border p-3 rounded focus:outline-none focus:ring focus:ring-blue-300 ${errors.roomTypeName ? 'border-red-500' : 'border-gray'}`}
                                />
                                {errors.roomTypeName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.roomTypeName.message}</p>
                                )}
                            </div>

                            {  selectedSalesGroup && !removeicon ? 
              <div className="flex flex-col ">
              
                  <label htmlFor="price" className="font-medium mb-2">
                    Icon
                  </label>
                    <div className='flex gap-2'>
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      overflow: 'hidden',
                      padding: '2px',
                    }}
                    dangerouslySetInnerHTML={{
                      __html: selectedSalesGroup?.icon,
                    }}
                  />
                  
                  <div className='flex items-center cursor-pointer text-blue'
                    onClick={() => setremoveIcon(true)}
                  >
                {' Change '}
                  </div>
                </div>
              </div>
            :
                            <div className="">
                                <IconPicker setValue={setValue} register={register} icons={icons} control={control} errors={errors} />
                            </div> }
                            {/* Submit Button */}
                            <div className="flex justify-end mt-4">
                                <button
                                    type="submit"
                                    className="bg-primary border border-1 uppercase border-success shadow-lg text-white font-medium px-6 py-1 rounded hover:bg-blue focus:outline-none"
                                >
                                    {selectedSalesGroup ? 'Update' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                <div className="flex items-center justify-center min-h-screen">
                    <Box className="bg-white p-10 rounded shadow-md max-w-md mx-auto">
                        <div className="flex justify-between mb-5">
                            <Typography variant="h5" component="h2" color={'blue'}>
                                Confirm Delete
                            </Typography>
                            <IconButton onClick={closeDeleteModal}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <Typography marginBottom={2} variant='h6'>
                            Are you sure you want to delete the item that named "{selectedSalesGroup?.roomTypeName}"?
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
                </div>
            </Modal>
        </div>
    );
};

export default RoomType;
