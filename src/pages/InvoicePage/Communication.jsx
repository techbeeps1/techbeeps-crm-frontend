import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import {
    Modal,
    Box,
    IconButton,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { apiPath } from "../../../apiPath";
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from "react-router-dom";
import { 
    MdEmail, 
    MdPhone, 
    MdMessage, 
    MdChat, 
    MdAdd, 
    MdCalendarToday, 
    MdPerson, 
    MdFilterList,
    MdOutlineForum
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';

const CommunicationLog = ({ id }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();
    const [isPayModalOpen, setPayModalOpen] = useState(false);
    const { Id } = useParams();
    const [data, setData] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const LogsHandler = async (formData) => {
        try {
            setIsSubmitting(true);
            const response = await axios.post(apiPath + "/api/logCommunication", formData);
            closePayModal();
            handleAllLogs();
        } catch (error) {
            console.error("Error recording payment", error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const onSubmit = (formData) => {
        if (Id) {
            let finalData = { ...formData, invoiceId: Id };
            LogsHandler(finalData);
        } else {
            let finalData = { ...formData, invoiceId: id };
            LogsHandler(finalData);
        }
    };

    const openPayModal = () => {
        reset();
        setPayModalOpen(true);
    };

    const closePayModal = () => {
        setPayModalOpen(false);
    };

    const handleAllLogs = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/logCommunicationList?invoiceId=${Id ? Id : id}`);
            setData(response["data"]?.logList || []);
        } catch (err) {
            console.error(err.message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    useEffect(() => { 
        handleAllLogs(); 
    }, [Id, id]);

    const getTypeMeta = (type) => {
        const lower = (type || "").toLowerCase();
        switch (lower) {
            case "call":
                return {
                    label: "Call",
                    icon: <MdPhone className="w-5 h-5 text-emerald-600" />,
                    bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
                    badgeBg: "bg-emerald-500",
                    pillBg: "bg-emerald-100 text-emerald-800"
                };
            case "whatsapp":
                return {
                    label: "WhatsApp",
                    icon: <FaWhatsapp className="w-5 h-5 text-green-600" />,
                    bg: "bg-green-50 border-green-200 text-green-700",
                    badgeBg: "bg-green-500",
                    pillBg: "bg-green-100 text-green-800"
                };
            case "sms":
                return {
                    label: "SMS",
                    icon: <MdMessage className="w-5 h-5 text-purple-600" />,
                    bg: "bg-purple-50 border-purple-200 text-purple-700",
                    badgeBg: "bg-purple-500",
                    pillBg: "bg-purple-100 text-purple-800"
                };
            case "email":
            default:
                return {
                    label: "Email",
                    icon: <MdEmail className="w-5 h-5 text-indigo-600" />,
                    bg: "bg-indigo-50 border-indigo-200 text-indigo-700",
                    badgeBg: "bg-indigo-500",
                    pillBg: "bg-indigo-100 text-indigo-800"
                };
        }
    };

    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        if (activeFilter === "all") return data;
        return data.filter(item => (item.communicationType || "email").toLowerCase() === activeFilter);
    }, [data, activeFilter]);

    const filterCounts = useMemo(() => {
        const counts = { all: data?.length || 0, email: 0, call: 0, sms: 0, whatsapp: 0 };
        data?.forEach(item => {
            const t = (item.communicationType || "email").toLowerCase();
            if (counts[t] !== undefined) counts[t]++;
        });
        return counts;
    }, [data]);

    return (
        <div className="w-full max-w-6xl mx-auto py-2 px-1 sm:px-4">
            {/* Header section */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 mb-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                            <MdOutlineForum className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Communication History</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Track calls, emails, SMS and customer correspondences</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={openPayModal}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                >
                    <MdAdd className="w-5 h-5" />
                    <span>Log Communication</span>
                </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
                {[
                    { id: "all", label: "All Logs", count: filterCounts.all },
                    { id: "email", label: "Email", count: filterCounts.email },
                    { id: "call", label: "Calls", count: filterCounts.call },
                    { id: "whatsapp", label: "WhatsApp", count: filterCounts.whatsapp },
                    { id: "sms", label: "SMS", count: filterCounts.sms }
                ].map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            activeFilter === filter.id
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 border border-slate-200/50'
                        }`}
                    >
                        <span>{filter.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                            activeFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                            {filter.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Log Entries / Cards */}
            {filteredData && filteredData.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center my-6 max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                        <MdChat className="w-8 h-8 opacity-80" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No communication recorded yet</h3>
                    <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
                        {activeFilter === 'all' 
                            ? "Start logging conversations, phone calls, or emails with this customer."
                            : `No ${activeFilter} logs recorded. Switch filter or create a new log.`}
                    </p>
                    <button
                        onClick={openPayModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                    >
                        <MdAdd className="w-4 h-4" />
                        <span>Record First Log</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {filteredData.map((item, index) => {
                        const meta = getTypeMeta(item.communicationType);
                        return (
                            <div 
                                key={index} 
                                className="group relative bg-white border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.bg} border`}>
                                            {meta.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 text-sm">{item.sender || "System User"}</span>
                                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${meta.pillBg}`}>
                                                    {meta.label}
                                                </span>
                                            </div>
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                                <MdCalendarToday className="w-3.5 h-3.5" />
                                                {formatDate(item.date)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pl-13 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/60 p-3.5 rounded-xl border border-slate-100">
                                    {item.message}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modern Record Communication Modal */}
            <Modal open={isPayModalOpen} onClose={closePayModal}>
                <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closePayModal}></div>
                    
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 z-10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                                    <MdOutlineForum className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Record Communication</h3>
                                    <p className="text-xs text-slate-500">Log a call, email, or meeting note</p>
                                </div>
                            </div>
                            <button
                                onClick={closePayModal}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                <CloseIcon fontSize="small" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Communication Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                        errors.communicationType ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                                    } rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-800`}
                                    {...register("communicationType", { required: "Communication type is required" })}
                                >
                                    <option value="">Select Type</option>
                                    <option value="email">Email</option>
                                    <option value="call">Call</option>
                                    <option value="sms">SMS</option>
                                    <option value="whatsapp">WhatsApp</option>
                                </select>
                                {errors.communicationType && (
                                    <p className="text-red-500 text-xs mt-1">{errors.communicationType.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                            errors.date ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                                        } rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-800`}
                                        {...register("date", { required: "Date is required" })}
                                    />
                                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Sender / Logged By <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                            errors.sender ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                                        } rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-800`}
                                        {...register("sender", { required: "Sender is required" })}
                                    />
                                    {errors.sender && <p className="text-red-500 text-xs mt-1">{errors.sender.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Message Details <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Write communication summary or notes..."
                                    className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                        errors.message ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                                    } rounded-xl focus:outline-none focus:ring-2 transition-all font-medium text-slate-800 resize-none`}
                                    {...register("message", { required: "Message is required" })}
                                />
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={closePayModal}
                                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? "Saving..." : "Record Communication"}
                                </button>
                            </div>
                        </form>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default CommunicationLog;
