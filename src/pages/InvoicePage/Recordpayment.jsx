import axios from "axios";
import { useEffect, useState } from "react";
import {
    Button,
    Modal,
    TextField,
    Typography, Tabs, Tab, Box, IconButton,
    FormControl, InputLabel, Menu, Select, MenuItem
} from "@mui/material";
import { useForm } from "react-hook-form";
import { apiPath } from "../../../apiPath";
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from "react-router-dom";

const RecordPayment = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [isPayModalOpen, setPayModalOpen] = useState(false);
    const { Id } = useParams()
    const [data, setData] = useState([]);

    const paymentHandler = async (data) => {
        try {
            const response = await axios.post(apiPath + "/api/record-payment", data);
            closePayModal();
            handlePayments();
        } catch (error) {
            console.error("Error recording payment", error.message);
        }
    }

    const onSubmit = (data) => {
        let finalData = { ...data, invoiceId: Id }
        paymentHandler(finalData)
    };

    const openPayModal = (agent) => {
        setPayModalOpen(true);
    };

    const closePayModal = () => {
        setPayModalOpen(false);
    };

    const handlePayments = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/payments/${Id}`);
            setData(response["data"].payments);
            setTimeout(() => {
                $('#payments').DataTable();
            }, 0);
        } catch (err) {
            console.error(err.message);
        }
    };

    useEffect(() => { handlePayments() }, [Id]);

    return (
        <div className="mx-auto p-8 font-medium text-slate-600 bg-white shadow-lg" style={{fontSize:'17px',minHeight:'70vh'}}>
            <button onClick={(event) => { openPayModal() }} className="bg-blue-500 hover:bg-blue hover:text-white text-black border font-bold py-2 px-4 rounded focus:outline-none mb-10">
                Process Payment
            </button>
            {data && data.length === 0  && <p>No payments recorded yet.</p>}
            {data && data.length > 0 && 
            <table id="payments" className="">
            <thead>
                <tr>
                    <th className="border-b">Payment Mode</th>
                    <th className="border-b">Payment Date</th>
                    <th className="border-b">Amount</th>
                    <th className="border-b">Comment</th>
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td className="border-b">{item.paymentMode}</td>
                        <td className="border-b">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="border-b">$ {item.amount}</td>
                        <td className="border-b">{item.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
            }
            
            <Modal open={isPayModalOpen} onClose={closePayModal}>
                <Box className="bg-white p-6 rounded shadow-md mx-auto mt-15" style={{ maxWidth: "850px" }}>
                    <IconButton
                        onClick={closePayModal}
                        className="absolute top-0 right-3"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" component="h2" className="mb-5" style={{ margin: "5px 0" }}>
                        Record Payment for Invoice # 
                    </Typography>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-2 gap-4 mb-4">

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    className={`block w-full p-2 border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    {...register("date", { required: "Date is required" })}
                                />
                                {errors.date && <p className="text-red-500 text-xs italic mt-1">{errors.date.message}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                <input
                                    type="number"
                                    className={`block w-full p-2 border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    {...register("amount", { required: "Amount is required" })}
                                />
                                {errors.amount && <p className="text-red-500 text-xs italic mt-1">{errors.amount.message}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode</label>
                                <select
                                    className={`block w-full p-2 border ${errors.paymentMode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    {...register("paymentMode", { required: "Payment mode is required" })}
                                >
                                    <option value="">Select Payment Mode</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="online_payment">Online Payment</option>
                                </select>
                                {errors.paymentMode && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.paymentMode.message}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                                <input
                                    type="text"
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none"
                                    {...register("description")}
                                />
                            </div>
                            <div className="flex justify-between col-span-2">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-700 text-black border font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Record Payment
                                </button>
                                <button
                                    type="button"
                                    className="bg-gray-500 hover:bg-gray-700 text-black border font-bold py-2 px-4 rounded focus:outline-none"
                                    onClick={closePayModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                    </form>
                </Box>
            </Modal>
        </div>
    );
};

export default RecordPayment;
