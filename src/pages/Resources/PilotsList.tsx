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
import PilotsFrom from './Froms/PilotsFrom';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import StorageLocation from './StorageLocation';

const PilotsList: React.FC = () => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [countries, setCountries] = useState<any>([])

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
            const response = await axios.get(`${apiPath}/api/warehouses`);
            setData(response["data"]);
            setTimeout(() => {
                $('#warehouse').DataTable();
            }, 0);
            setSelectedStaff(null)
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
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
            const response = await axios.delete(`${apiPath}/api/warehouses/${selectedAgent._id}`);
            if (response.status == 200) {
                notify("Warehouse Deleted successfully!");
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

    const wareHouseHandlers = async (Formdata: any) => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiPath}/api/warehouses/${Formdata._id}`, { ...Formdata });
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

    const fetchCountries = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/sale_group?type=country`);
            setCountries(response.data);
        } catch (err: any) {
            notifyError(`Failed to fetch Countries: ${err.message}`);
        }
    };

    useEffect(() => {
        handleAllData();
        fetchCountries()
    }, []);

    if (loading) {
        return <Loader />;
    }
    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    return (
        <div className="flex flex-col md:flex-row p-0 pt-2" style={{ justifyContent: "flex-start", minHeight: "85vh" }}>
            <div className="md:w-1/2 bg-white p-4 overflow-auto">
                <PilotsFrom handler={handleAllData} countries={countries} />
                <div className="rounded-sm mt-5 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id="warehouse" className="">
                        <thead >
                            <tr>
                                <th className="border-b">Name</th>
                                <th className="border-b">Post code</th>
                                <th className="border-b">City</th>
                                {/* <th className="border-b">Own warehouse</th> */}
                                <th className="border-b">Enabled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any, index: number) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.name}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.postcode}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.city}</td>
                                    {/* <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.ownership}</td> */}
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold"><span className={`${item.condition === 'Enable' ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{item.condition}</span></td>
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
            <div className="relative md:w-1/2 bg-white border-l shadow border-gray">
                {selectedStaff &&
                    // <div className="absolute top-0 right-0 left-0 bottom-0 h-full w-full overflow-y-auto transition-transform p-4">
                      <div className={`${
          selectedStaff
            ? 'z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0'
            : 'w-full  h-full shadow border-l border-gray'
        } ${selectedStaff && '!left-0'} bg-white h-full overflow-auto `}
      >
                        <IconButton onClick={() => setSelectedStaff(null)} className="absolute top-0 left-0">
                            <CloseIcon />
                        </IconButton>
                        <div className="flex justify-between">
                            <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mt-2 mb-3 ms-1">{selectedStaff.name}</div>
                        </div>
                        <Tabs value={tabIndex} onChange={handleChange} variant="standard">
                            <Tab label="Shed" />
                            <Tab label="Storage Location" />
                        </Tabs>
                        <div className="p-4">
                            {tabIndex === 0 && (
                                <div className="">
                                    
                                    <div className="flex justify-between mb-3">
                                        <h2 className="text-xl font-bold mb-2 me-4">WareHouse Information</h2>
                                        <DeleteIcon onClick={() => openDeleteModal(selectedStaff)} />
                                    </div>
                                    <div className='flex gap-3 mb-3'>
                                        <Button onClick={() => wareHouseHandlers({ ...selectedStaff, condition: selectedStaff.condition === 'Enable' ? "Disable" : 'Enable' })}
                                            variant="contained"
                                            size="large"
                                        >{selectedStaff.condition === 'Enable' ? "Disable" : 'Enable'}</Button>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Name:</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.name}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Own WareHouse:</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.isOwnWarehouse ? "Own" : "Not Owner"}</p>
                                        </div><div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Condition:</p>
                                            <p className="w-full text-lg font-bold text-start "><span className={`${selectedStaff?.condition === 'Enable' ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{selectedStaff?.condition}</span></p>
                                        </div>
                                    </div>
                                    <hr className='text-gray my-2' />
                                    <div className="flex justify-between mt-3">
                                        <h2 className="text-xl font-bold mb-2 me-4">WareHouse Address</h2>
                                    </div>
                                    <div className=''>
                                        <p className="text-lg font-medium">{`${selectedStaff?.houseNumber} ${selectedStaff?.addition || ""} ${selectedStaff?.street} ${selectedStaff?.city} ${selectedStaff?.postcode}`}</p>
                                    </div>
                                    <div className="mt-5">
                                        <PilotsFrom handler={handleAllData} data={selectedStaff} countries={countries} />
                                    </div>
                                </div>
                            )}
                            {tabIndex === 1 && (
                                <StorageLocation type='storage' warehouseId={selectedStaff._id} size='compact' />
                            )}

                        </div>

                    </div>}
            </div>
        </div>
    );
};

export default PilotsList;
