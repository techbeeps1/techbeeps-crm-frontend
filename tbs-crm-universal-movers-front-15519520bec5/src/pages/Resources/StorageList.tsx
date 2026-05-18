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
import StorageForm from './Froms/StorageForm';
import LoadingForm from './Storage/LoadingForm';
import LoadingandUnloadingForm from './Storage/LoadingandUnloadingForm';
import FreeupStorage from './Storage/FreeupStorage';
import ContractForm from './Storage/ContractForm';
import { ApprovalOutlined, ElevatorOutlined, GifBoxOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StorageList: React.FC<any> = ({ customerId }) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [warehouse, setWarehouse] = useState<any>([]);

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const handleChange = (event: any, newValue: any) => {
        event.preventDefault();
        setTabIndex(newValue);
    };
    let navigate = useNavigate();

    const handleAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/api/storages?customer=${customerId || ''}`);
            setData(response["data"]);
            setTimeout(() => {
                $('#storageDetail').DataTable();
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
    useEffect(() => {
        $('#itemsData').DataTable();
        $('#actionData').DataTable();
    }, [tabIndex])

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
            const response = await axios.delete(`${apiPath}/api/storages/${selectedAgent._id}`);
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

    const wareHouseHandlers = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/warehouses`);
            if (response.status === 201 || response.status === 200) {
                setWarehouse(response.data);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        }
    };

    function formatDate(date: any) {
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }

    useEffect(() => {
        handleAllData();
        wareHouseHandlers()
    }, []);

    if (loading) {
        return <Loader />;
    }
    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    return (
        <div className="flex flex-col md:flex-row p-0 pt-2" style={{ justifyContent: "flex-start", minHeight: "85vh" }}>
            <div className="md:w-1/2 bg-white p-4">
                {!customerId && <StorageForm handler={handleAllData} warehouse={warehouse} />}
                <div className="rounded-sm mt-5 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id="storageDetail" className="">
                        <thead >
                            <tr>
                                <th className="border-b">Type</th>
                                <th className="border-b">Storage Number</th>
                                <th className="border-b">Status</th>
                                <th className="border-b">Contents</th>
                                <th className="border-b">Customer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any, index: number) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.storageType}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.storageCode}</td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold"><span className={`${item.storageStatus === 'free' ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{item.storageStatus}</span></td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.cubicMeter}m<sup>3</sup></td>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.customer?.firstName || ""}</td>
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
                                Are you sure you want to delete {selectedAgent?.storageCode}?
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
            <div className="relative w-full md:w-1/2 bg-white border-l shadow border-gray">
                {selectedStaff &&
                
                    // <div className="absolute top-0 right-0 left-0 bottom-0 h-full w-full overflow-y-auto transition-transform p-4">
                        <div
        className={`${
          customerId
            ? 'absolute z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0'
            : 'w-full  h-full shadow border-l border-gray'
        } ${selectedStaff && '!left-0'} bg-white h-full overflow-auto `}
      >
                        <div className="flex justify-between items-center p-3">
                            <div style={{ textTransform: "uppercase" }} className="flex items-center gap-3 text-3xl font-bold">{selectedStaff.storageCode} ({selectedStaff.storageType})
                                <span className='relative bg-sky-300 text-sm text-white' style={{ zIndex: '1', width: '100px', height: '28px', display: 'inline-block' }}>
                                    <span className='absolute bg-sky-900 max-w-full' style={{ zIndex: '-1', width: `${selectedStaff.percentageFill}%`, height: '28px', display: 'inline-block' }}>
                                    </span>
                                </span><span className='text-sm'>{selectedStaff.percentageFill}%</span></div>
                            <IconButton onClick={() => setSelectedStaff(null)} >
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <Tabs value={tabIndex} onChange={handleChange} variant="standard">
                            <Tab label="Storage" sx={{ fontSize: '15px', fontWeight: 'bold' }} />
                            <Tab label="Stored Items" sx={{ fontSize: '15px', fontWeight: 'bold' }} />
                            <Tab label="The cost of Action" sx={{ fontSize: '15px', fontWeight: 'bold' }} />
                        </Tabs>
                        <div className="p-4">
                            {tabIndex === 0 && (
                                <div className="text-base">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {selectedStaff.storageStatus === 'free' ? <LoadingForm storageData={selectedStaff} handler={handleAllData} /> :
                                            <LoadingandUnloadingForm storageData={selectedStaff} handler={handleAllData} />}
                                        {selectedStaff.storageStatus !== 'free' && <FreeupStorage handler={handleAllData} storage={selectedStaff} />}
                                        <button
                                            onClick={() => openDeleteModal(selectedStaff)}
                                            className="px-3 py-2 h-auto text-lg font-semibold text-red-600 bg-danger border border-red-600 rounded hover:bg-red-600 text-white transition duration-300"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                    <hr className='text-gray my-2' />

                                    <div className="flex justify-between mb-1">
                                        <h2 className="text-xl font-bold me-4">Specifications-</h2>
                                        <StorageForm handler={handleAllData} warehouse={warehouse} data={selectedStaff} />
                                    </div>
                                    <div>
                                        <div className="mb-2">
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff?.selfOwned ? "Own" : "Rented"}  {selectedStaff?.storageType}</p>
                                            <p className="w-full text-lg font-bold text-start">Contents: {selectedStaff?.cubicMeter}m<sup>3</sup></p>
                                        </div>
                                        <hr className='text-gray my-2' />
                                        <div className="flex justify-between mt-2">
                                            <h2 className="text-xl font-bold me-4">Warehouse-</h2>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <p className="w-full text-lg font-medium">Name:</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff.warehouse?.name}</p>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <p className="w-full text-lg font-medium">Own WareHouse:</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff.warehouse?.isOwnWarehouse ? "Own" : "Not Owner"}</p>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <p className="w-full text-lg font-medium">Condition:</p>
                                            <p className="w-full text-lg font-bold text-start "><span className={`${selectedStaff.warehouse?.condition === 'Enable' ? 'bg-sky-600' : "bg-danger"} rounded-2xl text-white px-2 py-1 shadow`}>{selectedStaff.warehouse?.condition}</span></p>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <p className="w-full text-lg font-medium">Address:</p>
                                            <p className="w-full text-start text-lg font-medium">{`${selectedStaff.warehouse?.houseNumber} ${selectedStaff.warehouse?.addition || ""} ${selectedStaff.warehouse?.street} ${selectedStaff.warehouse?.city} ${selectedStaff.warehouse?.postcode}`}</p>
                                        </div>
                                        <div className="flex justify-between mb-1">
                                            <p className="w-full text-lg font-medium">Storage Location:</p>
                                            <p className="w-full text-lg font-bold text-start">{selectedStaff.storageLocation?.name} {`(${selectedStaff.storageLocation?.code})`}</p>
                                        </div>
                                    </div>
                                    <div className="mx-auto mt-6">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-semibold text-gray-800">NOTES</h3>
                                            <p className="text-gray-600">{selectedStaff.notes || "No notes"}</p>
                                        </div>
                                        {selectedStaff?.customer && <>
                                            <div className="mb-4">
                                                <div className="flex justify-between">
                                                    <h3 className="text-xl font-semibold text-gray-800">CONTRACT</h3>
                                                    <ContractForm storageData={selectedStaff} handler={handleAllData} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Customer</p>
                                                        <p className="text-gray-600">{selectedStaff?.customer?.firstName} {selectedStaff?.customer?.lastName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Job</p>
                                                        <p className="text-gray-600">Loading storage</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Start date</p>
                                                        <p className="text-gray-600">{formatDate(selectedStaff.invoicingStartDate)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Last invoiced date</p>
                                                        <p className="text-gray-600">{selectedStaff?.lastInvoicedDate ? (formatDate(selectedStaff?.lastInvoicedDate)) : "Not available"}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Price</p>
                                                        <p className="text-gray-600">{selectedStaff.price || '00'} $</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Sales group</p>
                                                        <p className="text-gray-600">{selectedStaff.salesGroup}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Billing period</p>
                                                        <p className="text-gray-600">{selectedStaff.invoicingPeriod}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Billing</p>
                                                        <p className="text-gray-600">{selectedStaff.billStorageInAdvance}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Vat persentage</p>
                                                        <p className="text-gray-600">{selectedStaff.vatPercentage} %</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">VAT calculation</p>
                                                        <p className="text-gray-600">{selectedStaff.includingVat}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-600">Bill by volume</p>
                                                        <p className="text-gray-600">{selectedStaff.invoicePerVolume ? 'Yes' : 'No'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-6">
                                                <h3 className="text-xl font-semibold text-gray-800">CUSTOMER INFORMATION</h3>
                                                <div className="grid lg:grid-cols-2 md:grid-cols-1 mt-4">
                                                    <div className="space-y-1">
                                                        <h2 className="font-bold text-xl pb-2 capitalize">{selectedStaff?.customer?.type} Details :</h2>
                                                        <a className='text-lg cursor-pointer text-primary ' onClick={() => navigate(`/customers/${selectedStaff?.customer?._id}`)}>Go to customer</a>
                                                        {[
                                                            { label: 'Name', value: `${selectedStaff?.customer?.salutation || ''} ${selectedStaff?.customer?.firstName || ''} ${selectedStaff?.customer?.lastName || ''}` },
                                                            { label: 'Gender', value: selectedStaff?.customer?.gender },
                                                            { label: 'Contact', value: selectedStaff?.customer?.contact },
                                                            { label: 'Language', value: selectedStaff?.customer?.taal },
                                                            { label: 'Email', value: selectedStaff?.customer?.email },
                                                            { label: 'Type', value: selectedStaff?.customer?.typeOfCustomer },
                                                            { label: 'Contact No', value: selectedStaff?.customer?.contact },
                                                            { label: 'Mobile No.', value: selectedStaff?.customer?.mobile },
                                                        ].map(({ label, value }) => (
                                                            <div style={{ fontSize: '17px' }} className="flex gap-4 text-slate-600 font-medium" key={label}>
                                                                <p className="">{label}:</p>
                                                                <p className="text-slate-800 capitalize">{value || 'N/A'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {selectedStaff?.customer && selectedStaff?.customer?.address?.map((item: any, index: any) => (
                                                        <div key={index}>
                                                            <h2 className="font-bold text-xl pb-2 capitalize">Address :</h2>
                                                            <div className="flex items-center justify-between">
                                                                <h2 className="font-bold text-slate-500 capitalize">{item.addressType}</h2>
                                                            </div>
                                                            <div style={{ fontSize: '17px' }} className="text-lg text-slate-600 font-medium">
                                                                <p className="text-slate-800 capitalize max-w-100">
                                                                    {item.floor} Floor {item.houseNumber || '0'} {item.addition} {item.street} {item.city} {item.country}
                                                                </p>
                                                                <p className="text-slate-500">{item.typeOfProperty}</p>
                                                                <div className="flex gap-2">
                                                                    <span className="relative group">
                                                                        {item.hasElevator && <ElevatorOutlined fontSize="medium" />}
                                                                        <div className="absolute buttom-0 rounded w-100 hidden group-hover:flex flex-col gap-2 bg-slate-300 border border-gray p-2 shadow-lg">
                                                                            <p>Distance To Lift : {item.distanceToLift}m</p>
                                                                            <p>Distance To Apartment :{item.distanceToApartment}m</p>
                                                                        </div>
                                                                    </span>
                                                                    <span>{item.deliveringBoxes && <GifBoxOutlined fontSize='medium' />}</span>
                                                                    <span>{item.applyForPermit && <ApprovalOutlined fontSize='medium' />}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>}
                                    </div>

                                </div>
                            )}
                            {tabIndex === 1 && (
                                <>
                                    <div className='max-w-full overflow-auto'>
                                        <table style={{ paddingTop: "30px" }} id="itemsData">
                                            <thead >
                                                <tr>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Description</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Item Code</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">External Code</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Contents</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Storage Location</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Loaded on</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Released On</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Loaded by Employee</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Released by Employee</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Loaded By Customer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedStaff?.events.map((item: any, index: number) => (
                                                    <tr key={index}>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.description}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.itemCode}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.externalCode}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.contents}m<sup>3</sup></td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.storageLocation?.name}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{formatDate(item.loadedOn)}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{formatDate(item.ReleasedOn)}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.loadedByEmployee?.username}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.ReleasedByEmployee?.username}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.loadedByCustomer ? 'yes' : 'No'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                            {tabIndex === 2 && (
                                <>
                                    <div className='max-w-full overflow-auto'>
                                        <table style={{ paddingTop: "30px" }} id="actionData">
                                            <thead >
                                                <tr>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Description</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Date</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Amount</th>
                                                    <th className="border-b font-medium whitespace-nowrap px-4">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedStaff?.costAction.map((item: any, index: number) => (
                                                    <tr key={index}>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.description}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{formatDate(item?.actionDate)}</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.price} $</td>
                                                        <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item?.quantity}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                    </div>}
            </div>
        </div>
    );
};

export default StorageList;
