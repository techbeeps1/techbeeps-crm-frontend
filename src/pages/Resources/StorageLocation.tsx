import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
    Button,
    Modal,
    Typography,
    Box,
    IconButton, Tabs, Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Loader from '../../common/Loader';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import StorageLocationForm from './Froms/StorageLocationForm';

const StorageLocation: React.FC<any> = ({ type, size, warehouseId }) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [warehouse, setWarehouse] = useState<any>([])

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const handleChange = (event: any, newValue: any) => {
        event.preventDefault();
        setTabIndex(newValue);
    };

    const handleAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/api/storage_loaction?warehouseId=${warehouseId && warehouseId || ''}`);
            console.log(response["data"], "storage location");
            setData(response["data"]);
            setTimeout(() => {
                $(`#${type}`).DataTable();
            }, 0);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const wareHouseHandlers = async (Formdata: any) => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiPath}/api/storage_loaction/${Formdata._id}`, { ...Formdata });
            if (response.status === 201 || response.status === 200) {
                notify("Request successfully!");
                handleAllData()
                
                setSelectedStaff(Formdata)
            } else {
                notifyError(response.data.message);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            setLoading(false)
        }
    };

    const openDeleteModal = (agent: any) => {
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedAgent(null);
    };

    const confirmDelete = async () => {
        setLoading(true)
        try {
            const response = await axios.delete(`${apiPath}/api/storage_loaction/${selectedAgent._id}`);
            if (response.status == 200) {
                notify("Data Deleted successfully!");
                handleAllData()
                setSelectedStaff(null)
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            closeDeleteModal();
            setLoading(false);
        }
    }

    const handleAllWarehouse = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/warehouses`);
            setWarehouse(response["data"]);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        }
    };

    useEffect(() => {
        handleAllData();
        handleAllWarehouse()
    }, [warehouseId]);

    if (loading) {
        return <Loader />;
    }
    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    return (
        <div className="flex md:flex-row flex-col p-0 pt-2" style={{ justifyContent: "flex-start", minHeight: "85vh" }}>
            <div className={` bg-white p-4 ${size ? 'w-full' : 'md:w-1/2'}`}>
                <StorageLocationForm warehouse={warehouse} type={type} handler={handleAllData} />
                <div className="rounded-sm mt-5 dark:border-strokedark dark:bg-boxdark overflow-auto">
                    <table style={{ paddingTop: "30px" }} id={type} className="">
                        <thead >
                            <tr>
                                <th className="border-b">Name</th>
                                <th className="border-b">Code</th>
                                <th className="border-b">Warehouse</th>
                                <th className="border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any, index: number) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.name}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.code}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.warehouse?.name}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold"><span className={`${item.status === 'Enable' ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{item.status}</span></td>
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
                                Are you sure you want to delete {selectedAgent?.name}?
                            </Typography>
                            <Box className="flex justify-end" style={{ margin: "5px 0", display: "flex", gap: "10px" }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={confirmDelete}
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
            </div>
            <div className={` ${!size ? 'relative md:w-1/2 border-l shadow border-gray' : "bg-white"} inset-0 bg-white `}>
                {selectedStaff &&
                    // <div className="absolute top-0 right-0 left-0 bottom-0 h-full w-full bg-white overflow-y-auto transition-transform p-4">
                        <div className={`${
          selectedStaff
            ? 'z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0'
            : 'w-full  h-full shadow border-l border-gray'
        } ${selectedStaff && '!left-0'} bg-white h-full overflow-auto `}
      >
                        <div className="flex justify-between items-center mb-3">
                            <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mt-2">{selectedStaff.name}</div>
                            <IconButton onClick={() => setSelectedStaff(null)} className=''>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <Tabs value={tabIndex} onChange={handleChange} variant="standard">
                            <Tab label='Storage Location' sx={{ fontSize: '1rem' }} />
                        </Tabs>
                        <div className="p-4">
                            {tabIndex === 0 && (
                                <div className="">
                                    <div className='flex gap-3 my-3'>
                                        <Button onClick={() => wareHouseHandlers({ ...selectedStaff, status: selectedStaff.status === 'Enable' ? "Disable" : 'Enable' })}
                                            variant="contained"
                                            size="large"
                                        >{selectedStaff.status === 'Enable' ? "Disable" : 'Enable'}</Button>
                                    </div>

                                    <div className="flex justify-between mb-3">
                                        <h2 className="text-xl font-bold mb-2 me-4">Details</h2>
                                        <DeleteIcon onClick={() => openDeleteModal(selectedStaff)} />
                                    </div>
                                    <hr className='text-gray my-2' />
                                    <div className='max-w-full'>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Name:</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.name}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Code :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.code}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Warehouse :</p>
                                            <p className="w-full text-lg font-bold text-start ">{selectedStaff?.warehouse?.name}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Status :</p>
                                            <p className="w-full text-lg font-bold text-start "><span className={`${selectedStaff?.status === 'Enable' ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{selectedStaff?.status}</span></p>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        <StorageLocationForm warehouse={warehouse} type={type} handler={() => { handleAllData(); setSelectedStaff(null); } } data={selectedStaff} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                }
            </div>

        </div>
    );
};

export default StorageLocation;
