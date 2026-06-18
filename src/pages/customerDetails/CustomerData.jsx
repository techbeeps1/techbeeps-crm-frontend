import { useEffect, useState } from 'react';
import EditCustomer from '../EditTemplateForm/editCustomer.jsx';
import { apiPath } from '../../../apiPath.tsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, IconButton } from '@mui/material'; // Material UI components
import { useForm } from 'react-hook-form'; // React Hook Form
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { ApprovalOutlined, DeleteOutline, EditOutlined, ElevatorOutlined, GifBoxOutlined } from '@mui/icons-material';
import CustomerAddress from './CustomerAddress.tsx';
import { toast } from 'react-toastify';

const CustomerData = ({ customerData, handleCustomer }) => {
    const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
    const [originalCustomerId, setOriginalCustomerId] = useState('');
    const [customersList, setCustomersList] = useState([]);
    const { register, handleSubmit, reset } = useForm(); // Hook form methods
    const [type, setType] = useState(customerData?.type || 'Customer')
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    let navigateTo = useNavigate();

    const closeRemoveModal = () => {
        setIsRemoveModalOpen(false);
    };

    const deleteCustomer = async () => {
        try {
            const response = await axios.delete(`${apiPath}/customer/deleteCustomer/${customerData._id}`);
            if (response.data.status) {
                closeRemoveModal();
                handleCustomer();
                navigateTo(-1);
            } else {
                console.error('Error deleting customer:', response.data.msg);
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
        }
    };

    async function fetchCustomers() {
        try {
            const response = await axios.get(`${apiPath}/customer/customerList`);
            setCustomersList(response.data.customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    }

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleEditSubmit = async (editedData) => {
        try {
            const response = await fetch(
                `${apiPath}/customer/editCustomer/${editedData._id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify(editedData),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );
            if (response.ok) {
                handleCustomer();
            } else {
                console.error('Error updating customer:', response.statusText);
            }
        } catch (error) {
            console.error('Error updating customer:', error);
        }
    };

    const handleMerge = async () => {
        try {
            const response = await axios.post(`${apiPath}/customer/mergeCustomer`, {
                originalCustomerId: originalCustomerId,
                selectedCustomerId: customerData._id,
            });
            if(response.data.success) {
toast.success('Customers merged successfully!');
                closeMergeModal();
                handleCustomer();
            }else {
                toast.error( response.data.message ?? 'Error merging customers');
            }
           
        } catch (error) {
            toast.error(error.response?.data.message ?? error.message ?? 'Error merging customers');
            console.error('Error merging customers:', error.response?.data ?? error.message);
        }
    };

    const openMergeModal = () => {
        setIsMergeModalOpen(true);
    };

    const closeMergeModal = () => {
        setIsMergeModalOpen(false);
    };
    const handleClickOutside = (event) => {
        if (event.target.id === 'modalBackdrop') {
            closeRemoveModal();
        }
    };

    return (
        <>
            <div className='h-full overflow-auto p-4 max-w-screen-lg mx-auto'>
                <div className="flex flex-wrap justify-center md:justify-end gap-2">
                    <Button
                        variant="contained"
                        color="primary"
                        size='large'
                        onClick={() => openMergeModal()}
                    >
                        Merge {type}
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        size='large'
                        onClick={() => { setIsRemoveModalOpen(true); }}
                        style={{ marginLeft: '10px' }}
                    >
                        Remove {type}
                    </Button>
                    <EditCustomer
                        customerData={customerData}
                        handleEditSubmit={handleEditSubmit}
                        formType='customer'
                        handleCustomer={handleCustomer}
                    />
                </div>

                <div className="space-y-3 mt-4">
                    <h2 className='font-bold text-black text-xl pb-2 capitalize'>{type} Details :</h2>
                    {[
                        { label: 'Name', value: `${customerData?.salutation} ${customerData?.firstName} ${customerData?.lastName}` },
                        { label: 'Gender', value: customerData?.gender },
                        { label: 'Contact', value: customerData?.contact },
                        { label: 'Language', value: customerData?.taal },
                        { label: 'Email', value: customerData?.email },
                        { label: 'Type', value: customerData?.typeOfCustomer },
                        { label: 'Contact No', value: customerData?.contact },
                        { label: 'Mobile No.', value: customerData?.mobile },
                    ].map(({ label, value }) => (
                        <div className="flex flex-col sm:flex-row gap-4 text-slate-600 font-medium text-base sm:text-lg" key={label}>
                            <p className="text-slate-700">{label}:</p>
                            <p className="text-slate-800 capitalize">{value}</p>
                        </div>
                    ))}
                </div>
                <div className="flex flex-wrap mt-6 items-center justify-between">
                    <h2 className='font-bold text-black text-lg sm:text-xl capitalize'>Addresses :</h2>
                    <EditCustomer
                        customerData={customerData && customerData}
                        handleEditSubmit={handleEditSubmit}
                        formType='address'
                        handleCustomer={handleCustomer}
                    />
                </div>
                <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
                    {customerData && customerData?.address.map((item, index) => (
                        <div key={index} className="">
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-slate-500 capitalize">{item.addressType}</h2>
                                <span className='flex'>
                                    <CustomerAddress handleCustomer={handleCustomer} address={item} customerId={customerData._id}/>
                                </span>
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

            {/* Remove Customer Dialog */}
            {isRemoveModalOpen && (
                <div
                    id="modalBackdrop"
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80"
                    onClick={handleClickOutside}
                >
                    <div className="bg-white p-5 rounded-lg shadow-lg z-50 text-lg max-w-3xl" onClick={(e) => e.stopPropagation()}>
                        <h1 className="font-extrabold text-danger pt-5 pb-3">
                            Delete {type} {customerData.firstName} {customerData.lastName}
                        </h1>
                        <p>Please note that if your {type} deletes {customerData.firstName} {customerData.lastName}, all associated information will be retained but will be anonymous.</p>
                        <div className="flex justify-end mt-4">
                            <button
                                className="text-red bg-gray-200 font-bold uppercase px-5 py-2 text-sm mr-2"
                                onClick={closeRemoveModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="text-red bg-red-600 text-white font-bold uppercase text-sm px-5 py-2 rounded"
                                onClick={() => deleteCustomer()}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Merge Modal */}
            <Dialog
                open={isMergeModalOpen}
                onClose={closeMergeModal}
                aria-labelledby="merge-dialog-title"
                aria-describedby="merge-dialog-description"
                
            >
                <DialogTitle>Merge Customers</DialogTitle>
                <DialogContent >
                    <form onSubmit={handleSubmit(handleMerge)}>
                        <div>
                            <input
                                {...register("originalCustomerId")}
                                type="text"
                                className="border border-[#ccc] p-1 rounded w-full mb-4"
                                placeholder="Enter Customer UUID"
                                value={originalCustomerId}
                                onChange={(e) => setOriginalCustomerId(e.target.value)}
                                required
                            />
                        </div>
                        <DialogActions>
                              <Button variant="contained" color="inherit" onClick={closeMergeModal}>Cancel</Button>
                            <Button variant="contained" color="primary" type="submit">Merge</Button>
                          
                            
                        </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default CustomerData;
