import React, { useContext, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
    Button,
    IconButton,
    TextField,
    Tabs,
    Tab, Typography, Chip, Dialog,
    DialogTitle, Box,
} from '@mui/material';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate, useParams } from 'react-router-dom';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import Loader from '../../common/Loader';
import InvoicePopup from '../InvoicePage/Invoicing';
import LinkQuotePopup from './LinkQuotePopup';
import { toast } from 'react-toastify';
import { ApprovalOutlined, ElevatorOutlined, GifBoxOutlined } from '@mui/icons-material';

const Offer = ({ data, notes, fetchInvoice }) => {

    console.log('offer data', data)
    const { Id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get('type');
    const [openPopup, setOpenPopup] = useState(false);

    const notify = (message) => toast(message);
    const notifyError = (message) => toast.error(message, {
        autoClose: 2000,
    });

    const downloadInvoice = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiPath}/finance/download`, { Id: Id }, {
                responseType: 'blob' // Important for downloading files
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quatation #${data && data.index}.pdf`); // Filename for the downloaded PDF
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
            notifyError(err.message);
        } finally {
            setLoading(false)
        }
    };
    const SendInvoice = async (templateId) => {
        setLoading(true)
        let activityData = { type: 'offer', title: `Quotation has been sending on ${data.customer?.email}`, offer: Id, reference: 'admin', status: 'success' };
        handleActivity(activityData)
        try {
            const response = await axios.post(`${apiPath}/finance/send`, { Id: Id, emailTemplateId: templateId });
            setOpenPopup(false)
            if (response.status === 200) {
                let activityData = { type: 'offer', title: `Quotation has been send successfully on ${data.customer?.email}`, offer: Id, reference: 'admin', status: 'success', email: response.data };
                handleActivity(activityData)
            }
            notify('Quotation send successfully')
        } catch (error) {
            console.error('Error fetching invoice data:', error);
            notifyError(error.message);
            let activityData = { type: 'offer', title: `Error in Quotation sending on ${data.customer?.email}`, offer: Id, reference: 'admin', status: 'error', description: error.message };
            handleActivity(activityData)
        } finally {
            setLoading(false)
        }
    };
    const handleActivity = async (activityData) => {
        try {
            const response = await axios.post(`${apiPath}/api/activities`, activityData);
        } catch (error) {
            console.error('Error', error);
        }
    };

    return (
        <div style={{ fontSize: '17px' }} className="mx-auto p-8 bg-white shadow-lg text-lg font-medium text-slate-600">
            {loading && <Loader />}
            <div className='md:flex items-center'>
                <KeyboardBackspaceIcon
                    className='hover:bg-blue hover:text-white p-1 bg-gray'
                    onClick={() => navigate(-1)}
                    style={{ fontSize: "40px", borderRadius: "50%", marginRight: "10px" }}
                />
                <h1 className="text-2xl uppercase font-bold">Offer # {data && data.index}</h1>
                <div className="ml-auto flex gap-2 flex-wrap">
                    <button onClick={() => navigate(-1)} className="bg-danger text-white px-4 py-2 rounded-md shadow-lg">
                        Close
                    </button>
                    <button onClick={() => downloadInvoice()} className="bg-danger text-white px-4 py-2 rounded-md shadow-lg">
                        Download PDF
                    </button>
                    <button onClick={() => setOpenPopup(true)} className="bg-danger text-white py-2 px-4 rounded-md shadow-lg">
                        {data.Status == 'Sent' ? 'Resend Quotation' : 'Send Quotation'}
                    </button>
                    <button onClick={() => ""} className="bg-danger text-white py-2 px-4 rounded-md shadow-lg">
                        Invoicing
                    </button>
                    {!data.job && <LinkQuotePopup type={'quotes'} quotationData={data} fetchInvoice={fetchInvoice} />}
                    <button onClick={() => navigate(`/offer/${Id}`)} className="bg-danger text-white py-2 px-4 rounded-md shadow-lg">
                        Edit
                    </button>
                </div>
                <InvoicePopup type={'quote'} status={data?.Status} index={data?.index} date={data?.date} expireDate={data?.expire_date} open={openPopup} SendInvoice={SendInvoice} onClose={() => setOpenPopup(false)} />
            </div>
            <div className="px-6 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-2 pt-2 border-t border-gray-300">
                    <div className='flex flex-col md:flex-row items-center gap-3 text-center md:text-left'>
                        <h2 className="text-lg">Status :</h2>
                        <p className="py-2 text-2xl">{data && data.Status}</p>
                    </div>
                    <div className='flex flex-col md:flex-row items-center gap-3 text-center md:text-left'>
                        <h2 className="text-lg ">Subtotal :</h2>
                        <p className="py-2 text-2xl">$ {data && data.subTotal}</p>
                    </div>
                    <div className='flex flex-col md:flex-row items-center gap-3 text-center md:text-left'>
                        <h2 className="text-lg ">Total :</h2>
                        <p className="py-2 text-2xl">$ {data && data.total}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray py-4">
                    <div className="border-t border-gray text-slate-600 w-full max-w-xl mx-auto" >
                        <h2 className="text-xl font-bold mb-2">Quotation details : </h2>
                        <p className="py-1">Template : {data && data.financialTemplate?.name}</p>
                        <p className="py-1">BTW-scenario : {data && data.vat}</p>
                        <p className="py-1 ">Created on : {data && new Date(data.createdAt).toLocaleDateString('en-GB')}</p>
                        <p className="py-1 ">Offered : {data && new Date(data.date).toLocaleDateString('en-GB')}</p>
                        <p className="py-1 ">Expiry Date : {data && new Date(data.expire_date).toLocaleDateString('en-GB')}</p>
                        <p className="py-1 ">Accepted On : Not yet shipped</p>
                    </div>
                    <div className="border-t border-gray w-full max-w-xl mx-auto">
                        <div className="space-y-1">
                            <h2 className="font-bold text-xl pb-2 capitalize text-slate-600">{data?.customer?.type} Details :</h2>
                            <a className='cursor-pointer text-primary ' onClick={() => navigate(`/customers/${data?.customer?._id}`)}>Go to customer</a>
                            {[
                                { label: 'Name', value: `${data?.customer?.salutation || ''} ${data?.customer?.firstName || ''} ${data?.customer?.lastName || ''}` },
                                { label: 'Gender', value: data?.customer?.gender },
                                { label: 'Contact', value: data?.customer?.contact },
                                { label: 'Language', value: data?.customer?.taal },
                                { label: 'Email', value: data?.customer?.email },
                                { label: 'Type', value: data?.customer?.typeOfCustomer },
                                { label: 'Contact No', value: data?.customer?.contact },
                                { label: 'Mobile No.', value: data?.customer?.mobile },
                            ].map(({ label, value }) => (
                                <div className="flex flex-col md:flex-row gap-4 text-slate-600 font-medium text-lg" key={label}>
                                    <p className="">{label}:</p>
                                    <p className="capitalize">{value || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {data?.customer && data?.customer?.address.map((item, index) => (
                    <div key={index} className='my-3'>
                        <h2 className="font-bold text-xl pb-2 capitalize">Address :</h2>
                        <div className="flex items-center justify-between">
                            <h2 className="font-bold text-slate-500 capitalize">{item.addressType}</h2>
                        </div>
                        <div className="text-lg text-slate-600 font-medium space-y-1">
                            <p className="tcapitalize max-w-100">
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

                {data.job && <div className="mb-4">
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-300 pt-5'>
                        <Typography variant="h5" className="text-lg font-bold text-slate-700">
                            Job Notes
                        </Typography>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                        <div>
                            <div className="text-xl">General --</div>
                            <div className="my-1">{notes?.genralNotes || "No Notes"} </div>
                        </div>
                        <div>
                            <div className="">For the employee --</div>
                            <div className="my-1">{notes?.employeeNotes || "No Notes"}</div>
                        </div>
                        <div>
                            <div className="md:col-span-2">For the Customer --</div>
                            <div className="my-1">{notes?.customerNotes || "No Notes"}</div>
                        </div>
                    </div>
                </div>}

                <div className="border-t border-gray py-4">
                    <h2 className="mb-3 text-2xl">Moving details : </h2>
                    {data && data.jobinput ? (
                        Object.entries(data.jobinput)
                            .filter(([key]) => key !== "_id")
                            .map(([key, value]) => {
                                const formattedKey = key
                                    .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
                                    .replace(/^./, (str) => str.toUpperCase()) // Capitalize the first letter
                                    .trim();

                                return (
                                    <p key={key} className="mb-3">
                                        <span className="font-semibold">{formattedKey}</span>: {value}
                                    </p>
                                );
                            })
                    ) : (
                        <p>No job input data available.</p>
                    )}
                </div>

                {/* Product Table */}
                <div className="mt-3">
                    <h2 className="text-2xl mb-4">Quotation Rules:</h2>
                    <div className="overflow-x-auto md:overflow-hidden rounded-lg">
                    <table className="min-w-full w-full text-center border-collapse">
                        <thead className='border bg-gray border-gray'>
                            <tr className=''>
                                <th className="py-3 px-2 w-1/3">Description</th>
                                <th className="py-3 px-2 w-1/12">Number</th>
                                <th className="py-3 px-2 w-1/12">Price</th>
                                <th className="py-3 px-2 w-1/12">BTW</th>
                                <th className="py-3 px-2 w-1/12">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.items?.map((item, index) => (
                                <tr key={index} className="hover:bg-gray border-b border-gray">
                                    <td className="py-3 px-2 text-left break-words">{item?.description}</td>
                                    <td className="py-3 whitespace-nowrap">* {item?.quantity}</td>
                                    <td className="py-3 whitespace-nowrap">$ {item?.price}</td>
                                    <td className="py-3 whitespace-nowrap">{item?.btw} %</td>
                                    <td className="py-3 whitespace-nowrap">$ {(item?.price * item?.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                </div>

                <div className="mt-4 font-bold pt-2">
                    <div className="flex flex-wrap mb-2">
                        <span className="w-full sm:w-1/2">Sub Total:</span>
                        <span>$ {data && data?.subTotal}</span>
                    </div>
                    <div className="flex flex-wrap mb-2">
                        <span className="w-full sm:w-1/2">Total Tax :</span>
                        <span>+ $ {data?.btw}</span>
                    </div>
                    <div className="flex flex-wrap mb-2">
                        <span className="w-full sm:w-1/2">Discount :</span>
                        <span>- $ {((data?.subTotal * data?.discount) / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap mb-2">
                        <span className='w-full sm:w-1/2'>Total:</span>
                        <span>$ {data && data?.total}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Offer;
