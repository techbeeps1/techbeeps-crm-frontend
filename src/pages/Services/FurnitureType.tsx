import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
    Button, Modal, Typography, Box, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import IconPicker from './IconPicker';
// import $ from 'jquery';
// import 'datatables.net-dt/css/jquery.dataTables.css'; // DataTable styles
// import 'datatables.net'; // Core DataTable script


const FurnitureType: React.FC = () => {
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSalesGroup, setSelectedSalesGroup] = useState<any>(null);
    const [icons, setIcons] = useState<any[]>([]);
    const [iconFileName, setIconFileName] = useState<string | null>(null);

    const handleFileNameChange = (name: string) => {
        setIconFileName(name);
        // console.log('SVG file name:', name);
    };

    const openModal = (group: any) => {
        setSelectedSalesGroup(group);
        setModalOpen(true);
        if (!group) {
            reset({ furnitureTypeName: '', price: '', icon: '', cubicMeter: '', weight: '' });
        }
        if (group) {
            reset({ furnitureTypeName: group?.furnitureTypeName, price: group?.price, icon: group?.icon, cubicMeter: group?.cubicMeter, weight: group?.weight, isDisassambled: group?.isDisassambled });
        }
        console.log("group=>",group)
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
            const response = await axios.get(`${apiPath}/api/furniture`);
            // Destroy DataTable if it already exists
             const table = $('#furniture').DataTable();
             if (table) {
             table.destroy();
             }
            setData(response.data);
            setTimeout(() => {
                $('#furniture').DataTable();
            }, 0);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // const fetchIcons = async () => {
    //     try {
    //         const response = await axios.get(`${apiPath}/api/icons`);
    //         setIcons(response.data);
    //     } catch (err: any) {
    //         notifyError(`Failed to fetch icons: ${err.message}`);
    //     }
    // };

    const onSubmit = async (formData: any) => {
        setLoading(true);
        try {
            if (selectedSalesGroup) {
                await axios.put(`${apiPath}/api/furniture/${selectedSalesGroup._id}`, {formData, iconFileName: iconFileName?iconFileName:''});
                notify('item updated successfully');
            } else {
                await axios.post(`${apiPath}/api/furniture`, { ...formData, type: 'furniture' , iconFileName: iconFileName?iconFileName:'' });
                notify('item saved successfully');
            }
            closeModal();
            fetchSalesGroups();
        } catch (error: any) {
            console.log("error",error);
            notifyError(`Failed to save:${error?.response?.data?.error}`);
        } finally {
            setLoading(false);
        }
    };

    const deleteSalesGroup = async () => {
        setLoading(true);
        try {
            await axios.delete(`${apiPath}/api/furniture/${selectedSalesGroup._id}`);
            closeDeleteModal();
            notify('item Delete successfully');
            fetchSalesGroups();
        } catch (error: any) {
            notifyError(`Error deleting : ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
// const fetchData = async () => {
//   try {
//     const response = await axios.get('https://phpstack-1499764-5738009.cloudwaysapps.com/api/globalsetting', {
//       headers: {
//         'Content-Type': 'application/json',
//         'X-API-KEY': 'tbs-6zQ6v8m4J2q9p3X7'
//       },
//     });

//     console.log('Response:', response);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// };
    useEffect(() => {
        fetchSalesGroups();
        // fetchData()
        // fetchIcons()
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
                New furniture
            </Button>
            <table id="furniture" className="w-full">
                <thead>
                    <tr>
                        <th className="border-b text-lg">Name</th>
                        <th className="border-b text-lg">Area</th>
                        <th className="border-b text-lg">Icon</th>
                        <th className="border-b text-lg">Disassambled</th>
                        <th className="border-b text-lg">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.map((group: any) => (
                        <tr key={group._id}>
                            <td className="border-b cursor-pointer text-lg font-medium p-0" onClick={() => openModal(group)}>
                                {group.furnitureTypeName}
                            </td>
                            <td className="border-b cursor-pointer p-0 text-lg" onClick={() => openModal(group)}>
                                {group.cubicMeter} m<sup>3</sup>
                            </td>
                            <td className="border-b cursor-pointer p-0" onClick={() => openModal(group)}>
                                <div
                                    style={{
                                        width: '35px',
                                        height: '35px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        overflow: 'hidden',
                                        padding: '4px'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: group?.icon }}
                                />
                            </td>
                             <td className="border-b cursor-pointer text-lg font-medium p-0" onClick={() => openModal(group)}>
                                {group.isDisassambled===false ? 'No': 'Yes'}
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
            <div className="flex items-center justify-center min-h-screen text-lg text-black">
                <div className="bg-white px-6 py-4 rounded shadow-md max-w-lg mx-auto w-full">
                    <IconButton onClick={closeModal} className="absolute top-0" style={{left:'92%'}}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h5" component="h2" marginTop={-4} paddingBottom={2} color={'blue'}>
                        {selectedSalesGroup ? 'Edit Furniture' : 'New Furniture'}
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 overflow-auto p-1">
                        <div className="flex flex-col">
                            <label htmlFor="furnitureTypeName" className="font-medium mb-2">
                                Furniture Name*
                            </label>
                            <input
                                {...register('furnitureTypeName', {
                                    required: 'furniture Name is required',
                                })}
                                id="furnitureTypeName"
                                type="text"
                                placeholder="Enter furniture name"
                                className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300 ${errors.furnitureTypeName ? 'border-red-500' : 'border-gray'
                                    }`}
                            />
                            {errors.furnitureTypeName && (
                                <p className="text-red-500 text-sm mt-1">{errors.furnitureTypeName.message}</p>
                            )}
                        </div>

                        {/* Service Charge Amount */}
                        <div className="flex flex-col">
                            <label htmlFor="cubicMeter" className="font-medium mb-2">
                                Area in cubic Meter*
                            </label>
                            <input
                                {...register('cubicMeter', {
                                    required: 'cubicMeter is required',
                                })}
                                id="cubicMeter"
                                type="text"
                                placeholder="Enter cubicMeter"
                                className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300 ${errors.cubicMeter ? 'border-red-500' : 'border-gray'
                                    }`}
                            />
                            {errors.cubicMeter && (
                                <p className="text-red-500 text-sm mt-1">{errors.cubicMeter.message}</p>
                            )}
                        </div>
                        {/* <div className="flex flex-col">
                            <label htmlFor="price" className="font-medium mb-2">
                                Service Charge Amount
                            </label>
                            <input
                                {...register('price', {
                                    valueAsNumber: true,
                                })}
                                id="price"
                                type="number"
                                placeholder="Enter service charge amount"
                                className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300 ${errors.price ? 'border-red-500' : 'border-gray'
                                    }`}
                            />
                            {errors.price && (
                                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                            )}
                        </div> */}
                        <div className="flex flex-col">
                            <label htmlFor="weight" className="font-medium mb-2">
                                Weight
                            </label>
                            <input
                                {...register('weight', {
                                    valueAsNumber: true,
                                })}
                                id="weight"
                                type="number"
                                placeholder="weight"
                                className={`border p-2 rounded focus:outline-none focus:ring focus:ring-blue-300 ${errors.weight ? 'border-red-500' : 'border-gray'
                                    }`}
                            />
                            {errors.weight && (
                                <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                            )}
                        </div>

                        {/* Service Icon */}
                        <div className="">
                            <IconPicker setValue={setValue} register={register} icons={icons} control={control} errors={errors}
                             selectedSalesGroup={selectedSalesGroup?selectedSalesGroup:''} onFileNameChange={handleFileNameChange}/>
                        </div>

                        <div className="mb-4">
                        <label className="block text-lg font-medium mb-2">Does need to be Disassambled ?</label>
                         <div className="flex gap-4">
                        <Controller
                       //   name="isDisassambled"
                       {...register('isDisassambled')}
                    control={control}
                    defaultValue={false}
                    render={({ field }) => (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => field.onChange(true)}
                          className={`px-10 py-2 rounded-md ${
                            field.value === true
                              ? 'bg-primary text-white'
                              : 'bg-white'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(false)}
                          className={`px-10 py-2 rounded-md ${
                            field.value === false
                              ? 'bg-primary text-white'
                              : 'bg-white'
                          }`}
                        >
                          No
                        </button>
                      </div>
                       )}
                       />
                         </div>
                        </div>

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
                            Are you sure you want to delete the item that named "{selectedSalesGroup?.furnitureTypeName}"?
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

export default FurnitureType;
