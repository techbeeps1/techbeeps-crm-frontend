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
import BoxFrom from './Froms/BoxFrom';
import Supplier from './Froms/Supplier';
import StockForm from './Froms/StockForm';
import OrderList from './OrderList';

const BoxList: React.FC<{ type: string }> = ({ type }) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);

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
            const response = await axios.get(`${apiPath}/api/box?type=${type}`);
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
            const response = await axios.delete(`${apiPath}/api/box/${selectedAgent._id}`);
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
    const materilHandlers = async (Formdata: any) => {
        setLoading(true)
        let path = `${apiPath}/api/box/${Formdata?._id}`;
        try {
            const response = await axios.post(path, Formdata);
            if (response.status === 201 || response.status === 200) {
                notify("Request successfully!");
                handleAllData()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

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
                <BoxFrom type={type} handler={handleAllData} />
                <div className="rounded-sm mt-5 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id={type} className="">
                        <thead >
                            <tr>
                                <th className="border-b">Type/Name</th>
                                <th className="border-b">Stock</th>
                                <th className="border-b">Out</th>
                                <th className="border-b">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any, index: number) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.name}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.currentStock}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.outstanding}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold"><span className={`${Number(item.currentStock) > 0 ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{Number(item.currentStock) > 0 ? 'Normal' : "Attention"}</span></td>
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
                            <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mt-2">{selectedStaff.name}</div>
                            <IconButton onClick={() => setSelectedStaff(null)} className=''>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <Tabs value={tabIndex} onChange={handleChange} variant="standard">
                            <Tab label={type} sx={{ fontSize: '1rem' }} />
                            <Tab label="Suppliers" sx={{ fontSize: '1rem' }} />
                            <Tab label="Received" sx={{ fontSize: '1rem' }} />
                            <Tab label="Orders" sx={{ fontSize: '1rem' }} />
                        </Tabs>
                        <div className="p-4">
                            {tabIndex === 0 && (
                                <div className="">
                                    {selectedStaff.inventorySuppliers.length > 0 && 
                                    <StockForm handleAllData={handleAllData} supplier={selectedStaff} />}
                                    <div className="flex justify-between mb-3">
                                        <h2 className="text-xl font-bold mb-2 me-4">{type} specifications</h2>
                                        <DeleteIcon onClick={() => openDeleteModal(selectedStaff)} />
                                    </div>
                                    <div className='w-2/3 max-w-full'>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-lg font-medium">Name/Type:</p>
                                            <p className="text-lg font-bold text-start">{selectedStaff?.name}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-lg font-medium">Rental Price :</p>
                                            <p className="text-lg font-bold text-start">{selectedStaff?.rentalPrice}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-lg font-medium">Selling Price :</p>
                                            <p className="text-lg font-bold text-start ">{selectedStaff?.sellingPrice}</p>
                                        </div>
                                    </div>
                                    <hr className='text-gray my-2' />
                                    <div className='w-2/3 max-w-full'>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-lg font-medium">Dimensions :</p>
                                            <p className="text-lg font-bold text-start ">{`${selectedStaff?.length}cm x ${selectedStaff?.width}cm x ${selectedStaff?.height}cm `}</p>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <p className="text-lg font-medium">Contents :</p>
                                            <p className="text-lg font-bold text-start">
                                                {`${selectedStaff?.cubicMeter?.toFixed(3)}`}m<sup>3</sup>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-5">
                                        <BoxFrom type={type} handler={handleAllData} data={selectedStaff} />
                                    </div>
                                </div>
                            )}
                            {tabIndex === 1 && (
                                <Supplier materilHandlers={materilHandlers} material={selectedStaff} />
                            )}
                            {tabIndex === 2 && (
                                <OrderList type='Register' material={selectedStaff._id}/>
                            )}
                            {tabIndex === 3 && (
                                <OrderList type='Order' material={selectedStaff._id}/>
                            )}
                        </div>
                    </div>}
            </div>
        </div>
    );
};

export default BoxList;
