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
import { toast } from 'react-toastify';
import VehicleForm from './Froms/VehicleForm';
const Vehicles: React.FC<{ type: string }> = ({ type }) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [license, setLicense] = useState<any>(null)

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
            const response = await axios.get(`${apiPath}/api/vehicles`);
            setData(response["data"]);
            setTimeout(() => {
                $(`#${type}`).DataTable();
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
            const response = await axios.delete(`${apiPath}/api/vehicles/${selectedAgent._id}`);
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

    const fetchInputs = async (type) => {
        try {
            const response = await axios.get(`${apiPath}/api/sale_group?type=${type}`);
            if (type === 'Licence') setLicense(response.data);
        } catch (err) {
            notifyError(`Failed to fetch Countries: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchInputs('Licence')
    }, []);

    useEffect(() => {
        handleAllData();
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
                <VehicleForm handler={handleAllData} license={license} />
                <div className="rounded-sm mt-5 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id={type} className="">
                        <thead >
                            <tr>
                                <th className="border-b">Name</th>
                                <th className="border-b">License Plate</th>
                                <th className="border-b">Model</th>
                                <th className="border-b">Extra</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data && data.map((item: any, index: number) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.name}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.licensePlate}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.model}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.vehicleType === 'movingLift' ? `${item?.floors} floor` : `${item?.contents} m³`}</td>
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
                        <div className="flex justify-between items-center mb-3">
                            <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mt-2">{selectedStaff.name} ({selectedStaff?.licensePlate})</div>
                            <IconButton onClick={() => setSelectedStaff(null)} className=''>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <Tabs value={tabIndex} onChange={handleChange} variant="scrollable">
                            <Tab label={type} sx={{ fontSize: '1rem' }} />
                            <Tab label="Trip Registration" sx={{ fontSize: '1rem' }} />
                        </Tabs>
                        <div className="p-4">
                            {tabIndex === 0 && (
                                <div>
                                    <div className='flex items-center gap-4 mb-3'>
                                        <button
                                            onClick={() => openDeleteModal(selectedStaff)}
                                            className="px-6 py-2 h-auto text-lg font-semibold text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition duration-300"
                                        >
                                            Remove Vehicle
                                        </button>
                                        <VehicleForm data={selectedStaff} handler={handleAllData} license={license} />
                                    </div>

                                    <div className="mb-3">
                                        <h2 className="text-xl font-bold mb-2 me-4">Vehicle Data -</h2>
                                    </div>
                                    <div className='max-w-full'>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Name :</p>
                                            <p className="w-full text-lg font-bold text-left">{selectedStaff?.name}</p>
                                        </div>
                                        {selectedStaff?.vehicleType !== 'movingLift' &&
                                            <div className="flex justify-between mb-2">
                                                <p className="w-full text-lg font-medium">Price per kilometer :</p>
                                                <p className="w-full text-lg font-bold text-left">{selectedStaff?.pricePerKilometer} $</p>
                                            </div>}
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Price per hour :</p>
                                            <p className="w-full text-lg font-bold text-start ">{selectedStaff?.pricePerHour} $</p>
                                        </div>
                                        {selectedStaff?.vehicleType === 'movingLift' &&
                                            <div className="flex justify-between mb-2">
                                                <p className="w-full text-lg font-medium">Floor :</p>
                                                <p className="w-full text-lg font-bold text-start ">{selectedStaff?.floors} floor</p>
                                            </div>}
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Model :</p>
                                            <p className="w-full text-lg font-bold text-start ">{selectedStaff?.model}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">fuel :</p>
                                            <p className="w-full text-lg font-bold text-start ">{selectedStaff?.fuelType}</p>
                                        </div>
                                        {selectedStaff?.vehicleType !== 'movingLift' &&
                                            <div className="flex justify-between mb-2">
                                                <p className="w-full text-lg font-medium">Transmission :</p>
                                                <p className="w-full text-lg font-bold text-start ">{selectedStaff?.transmissionType}</p>
                                            </div>}
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Year of Purchasing :</p>
                                            <p className="w-full text-lg font-bold text-start ">{selectedStaff?.purchasingDate ? new Date(selectedStaff.purchasingDate).toLocaleDateString('en-GB') : ''}
                                            </p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Tow bar :</p>
                                            <p className="w-full text-lg font-bold text-start ">{selectedStaff?.isTowBar ? 'YES' : "NO"}</p>
                                        </div>
                                        {selectedStaff?.vehicleType !== 'movingLift' &&
                                            <div className="flex justify-between mb-2">
                                                <p className="w-full text-lg font-medium">Contents :</p>
                                                <p className="w-full text-lg font-bold text-start ">{selectedStaff?.contents}m<sup>3</sup></p>
                                            </div>}
                                    </div>
                                    <hr className='text-gray my-2' />
                                    <div className="mb-3">
                                        <h2 className="text-xl font-bold mb-3">Driving license -</h2>
                                    </div>
                                    <div className="max-w-full flex gap-3">
                                        {selectedStaff && selectedStaff?.requiredLicense.map((item: any) =>
                                            <span key={item}
                                                className={`px-4 py-2 shadow border rounded-lg transition-colors cursor-pointer bg-gray font-medium text-black border-blue`}>
                                                {item}
                                            </span>
                                        )}
                                    </div>
                                    <hr className='text-gray my-2' />
                                    <div className="mb-3">
                                        <h2 className="text-xl font-bold mb-3">Maintenance -</h2>
                                    </div>
                                    <div className='max-w-full'>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Dealer :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.maintenance?.dealer}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Leasing company :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.maintenance?.leasingCompany}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Next Inspection :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.maintenance?.nextInspection ? new Date(selectedStaff?.maintenance?.nextInspection).toLocaleDateString('en-GB') : ''}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Maintenance :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.maintenance?.maintenanceRequired ? new Date(selectedStaff?.maintenance?.maintenanceRequired).toLocaleDateString('en-GB') : ''}</p>
                                        </div>
                                    </div>
                                    <hr className='text-gray my-2' />
                                    <div className="mb-3">
                                        <h2 className="text-xl font-bold mb-3">Fuel Card -</h2>
                                    </div>
                                    <div className='max-w-full'>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Supplier :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.fuelCard?.supplier}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Card Number :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.fuelCard?.cardNumber}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">CVC :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.fuelCard?.cvc}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="w-full text-lg font-medium">Pincode :</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.fuelCard?.pincode}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {tabIndex === 1 && (
                                <div className="text-centee">working on it</div>
                            )}
                        </div>
                    </div>}
            </div>
        </div>
    );
};

export default Vehicles;
