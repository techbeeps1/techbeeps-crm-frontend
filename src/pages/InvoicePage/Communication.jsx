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
import { MdEmail } from 'react-icons/md';

const CommunicationLog = ({ id }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
    const [isPayModalOpen, setPayModalOpen] = useState(false);
    const { Id } = useParams()
    const [data, setData] = useState([]);

    const LogsHandler = async (data) => {
        try {
            const response = await axios.post(apiPath + "/api/logCommunication", data);
            closePayModal();
            handleAllLogs();
        } catch (error) {
            console.error("Error recording payment", error.message);
        }
    }

    const onSubmit = (data) => {
        if (Id) {
            let finalData = { ...data, invoiceId: Id }
            LogsHandler(finalData)
        }
        else {
            let finalData = { ...data, invoiceId: id }
            LogsHandler(finalData)
        }

    };

    const openPayModal = (agent) => {
        setPayModalOpen(true);
    };

    const closePayModal = () => {
        setPayModalOpen(false);
    };

    const handleAllLogs = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/logCommunicationList?invoiceId=${Id ? Id : id}`);
            setData(response["data"].logList);
        } catch (err) {
            console.error(err.message);
        }
    };
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // en-GB formats as dd/MM/yyyy
    };

    useEffect(() => { handleAllLogs() }, [Id, id]);

    return (
        <div className="mx-auto h-full p-4 sm:p-6 bg-white max-w-screen-lg">
            <button onClick={(event) => { openPayModal() }} className="bg-blue hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none mb-5 w-full sm:w-auto">
                Communication Log
            </button>
            {data && data.length === 0 ? <p className="text-center text-gray-600">No communication recorded yet.</p> :
                data.map((item, index) =>
                    <div key={index} className="bg-gray border border-gray p-4 rounded-lg shadow mx-auto">
                        <div className="flex justify-between items-center mb-2">
                            <span className="">{formatDate(item.date)}</span>
                            <MdEmail className="" size={24} />
                        </div>
                        <p className="text-slate-800 mb-4">{item.message}
                        </p>
                        <p className="font-bold">{item.sender}</p>
                    </div>
                )
            }

            <Modal open={isPayModalOpen} onClose={closePayModal}>
                <Box className="bg-white p-6 rounded shadow-md mx-auto mt-5 max-h-screen text-lg text-slate-800 font-medium overflowY-auto" style={{ maxWidth: "800px", maxHeight: "90vh"}}>
                    <div className="flex justify-between mb-5">
                        <Typography variant="h6" component="h2" style={{ margin: "5px 0" }}>
                            Communication Logs
                        </Typography>
                        <IconButton
                            onClick={closePayModal}
                            className="absolute top-0 right-3"
                        >
                            <CloseIcon />
                        </IconButton>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Communication Type</label>
                                <select
                                    className={`block w-full p-2 border ${errors.communicationType ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    {...register("communicationType", { required: "Communication type is required" })}
                                >
                                    <option value="">Select Communication Type</option>
                                    <option value="email">Email</option>
                                    <option value="call">Call</option>
                                    <option value="sms">SMS</option>
                                    <option value="whatsapp">WhatsApp</option>
                                </select>
                                {errors.communicationType && (
                                    <p className="text-red-500 text-xs italic mt-1">{errors.communicationType.message}</p>
                                )}
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sender</label>
                                <input
                                    type="text"
                                    className={`block w-full p-2 border ${errors.sender ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    {...register("sender", { required: "Sender is required" })}
                                />
                                {errors.sender && <p className="text-red-500 text-xs italic mt-1">{errors.sender.message}</p>}
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <input
                                    type="text"
                                    className={`block w-full p-2 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none`}
                                    {...register("message", { required: "Message is required" })}
                                />
                                {errors.message && <p className="text-red-500 text-xs italic mt-1">{errors.message.message}</p>}
                            </div>

                            <div className="flex justify-between col-span-2 mt-4">
                                <button
                                    type="submit"
                                    className="hover:bg-blue text-black border font-bold py-2 px-4 rounded focus:outline-none"
                                >
                                    Record Communication
                                </button>
                                <button
                                    type="button"
                                    className="hover:bg-gray text-black border font-bold py-2 px-4 rounded focus:outline-none"
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

export default CommunicationLog;
