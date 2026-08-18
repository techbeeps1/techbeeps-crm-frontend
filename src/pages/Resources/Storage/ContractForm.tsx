import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import Loader from '../../../common/Loader/index';
import ReactDatePicker from '../../../common/ReactDatepicker';
import { MdReceipt, MdClose, MdEdit } from 'react-icons/md';

const ContractForm: React.FC<any> = ({ handler, storageData }) => {
    const [open, setOpen] = useState(false);

    const { register, control, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm() as any;
    const [invoicePeriod, setInvoicePeriod] = useState("Monthly");
    const [vatOption, setVatOption] = useState("Including VAT");
    const [storageOption, setStorageOption] = useState("In advance");
    const [salesGroupOption, setSalesGroupOption] = useState<any>([]);
    const [jobs, setJobs] = useState<any>([]);
    const [invoicePerVolume, setInvoicePerVolume] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => setOpen(false);
    const invoicingStartDate = watch('invoicingStartDate');

    useEffect(() => {
        setInvoicePeriod(storageData?.invoicePeriod || 'Monthly');
        setVatOption(storageData?.includingVat || "Including VAT");
        setInvoicePerVolume(storageData?.invoicePerVolume || false);
        reset({ 
            vatPercentage: storageData?.vatPercentage,
            price: storageData?.price,
            salesGroup: storageData?.salesGroup,
            storedForProject: storageData?.storedForProject,
            invoiceReference: storageData?.invoiceReference,
            invoicingStartDate: storageData?.invoicingStartDate ? new Date(storageData.invoicingStartDate) : '',
            lastInvoicedDate: storageData?.lastInvoicedDate ? new Date(storageData.lastInvoicedDate) : ''
        });
    }, [reset, storageData]);

    const onSubmit = (data: any) => {
        let finalData = {
            ...data, 
            invoicePerVolume: invoicePerVolume, 
            invoicingPeriod: invoicePeriod, 
            includingVat: vatOption, 
            billStorageInAdvance: storageOption
        };
        storageHandlers(finalData);
    };

    const storageHandlers = async (data: any) => {
        setLoading(true);
        let path = `${apiPath}/api/storages/${storageData?._id}`;
        try {
            const response = await axios.post(path, data);
            if (response.status === 201 || response.status === 200) {
                handler();
                setOpen(false);
                reset();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleAllJob = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/jobList?customer=${storageData?.customer?._id || ''}`);
            let jobs = response["data"]?.jobList?.map((job: any) => { 
                return { 
                    label: `${job.customer?.firstName || ''} ${job.customer?.lastName || ''} (${job.index})`, 
                    value: job._id 
                }; 
            }) || [];
            setJobs(jobs);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (storageData) {
            handleAllJob();
        }
    }, [storageData]);

    const salesGroupHandler = async () => {
        try {
            let response = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`);
            setSalesGroupOption(response.data || []);
        } catch (error) {
            console.error('Error fetching sales groups:', error);
        }
    };

    useEffect(() => {
        salesGroupHandler();
    }, []);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
                <MdEdit className="w-3.5 h-3.5" />
                <span>Edit Contract</span>
            </button>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Modal open={open} onClose={handleClose}>
                    <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>

                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 z-10">
                            {loading && <Loader />}
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                                        <MdReceipt className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Update Contract Information</h3>
                                        <p className="text-xs text-slate-500">Configure billing cycle, rates, and tax terms</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <MdClose className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                                {/* Invoice Period Segmented Control */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Invoice Period
                                    </label>
                                    <div className="grid grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                        {["Daily", "Weekly", "Monthly", "quarter", "Annual"].map((period) => (
                                            <button
                                                type="button"
                                                key={period}
                                                className={`py-2 text-xs font-bold rounded-xl transition-all capitalize ${
                                                    invoicePeriod === period 
                                                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200/80" 
                                                        : "text-slate-600 hover:text-slate-900"
                                                }`}
                                                onClick={() => setInvoicePeriod(period)}
                                            >
                                                {period === 'quarter' ? 'Quarter' : period}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* VAT & Advance Options */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                            VAT Inclusion
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                            {["Including VAT", "Excluding VAT"].map((option) => (
                                                <button
                                                    type="button"
                                                    key={option}
                                                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                                        vatOption === option 
                                                            ? "bg-white text-indigo-600 shadow-sm border border-slate-200/80" 
                                                            : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                                    onClick={() => setVatOption(option)}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                            Billing Schedule
                                        </label>
                                        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                            {["In advance", "Afterwards"].map((option) => (
                                                <button
                                                    type="button"
                                                    key={option}
                                                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                                        storageOption === option 
                                                            ? "bg-white text-indigo-600 shadow-sm border border-slate-200/80" 
                                                            : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                                    onClick={() => setStorageOption(option)}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Volume based billing */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                        Invoice By Volume?
                                    </label>
                                    <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-xs">
                                        <button
                                            type="button"
                                            className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                                invoicePerVolume 
                                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/80" 
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                            onClick={() => setInvoicePerVolume(true)}
                                        >
                                            Yes
                                        </button>
                                        <button
                                            type="button"
                                            className={`py-2 text-xs font-bold rounded-xl transition-all ${
                                                !invoicePerVolume 
                                                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/80" 
                                                    : "text-slate-600 hover:text-slate-900"
                                            }`}
                                            onClick={() => setInvoicePerVolume(false)}
                                        >
                                            No
                                        </button>
                                    </div>
                                </div>

                                {/* Rates & Details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            VAT Percentage <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                                errors.vatPercentage ? 'border-red-500' : 'border-slate-300 focus:border-indigo-500'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800`}
                                            {...register("vatPercentage", { required: "VAT is required" })}
                                        >
                                            <option value="">Select VAT</option>
                                            <option value="0">0%</option>
                                            <option value="9">9%</option>
                                            <option value="21">21%</option>
                                        </select>
                                        {errors.vatPercentage && <p className="text-red-500 text-xs mt-1">{errors.vatPercentage.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Price per {invoicePeriod} {invoicePerVolume ? '(Per volume)' : ''} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            min={0}
                                            className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                                errors.price ? 'border-red-500' : 'border-slate-300 focus:border-indigo-500'
                                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800`}
                                            {...register("price", { required: "Price is required" })}
                                            placeholder="e.g. 150"
                                        />
                                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Sales Group
                                        </label>
                                        <select
                                            className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                                            {...register("salesGroup")}
                                        >
                                            <option value="">Select Sales Group</option>
                                            {salesGroupOption && salesGroupOption.map((item: any) => (
                                                <option key={item._id} value={item.name}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Associated Job
                                        </label>
                                        <select
                                            className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                                            {...register("storedForProject")}
                                        >
                                            <option value="">Select Job</option>
                                            {jobs && jobs.map((item: any) => (
                                                <option key={item.value} value={item.value}>{item.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Invoice Reference
                                        </label>
                                        <input
                                            type="text"
                                            className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                                            {...register("invoiceReference")}
                                            placeholder="Enter customer or job reference..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <ReactDatePicker
                                            control={control}
                                            name="invoicingStartDate"
                                            rules={{ required: "Start date is required" }}
                                            placeholderText="Select Start date"
                                        />
                                        {errors.invoicingStartDate && <p className="text-red-500 text-xs mt-1">{errors.invoicingStartDate.message}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                            Last Invoiced Date
                                        </label>
                                        <ReactDatePicker
                                            control={control}
                                            name="lastInvoicedDate"
                                            minDate={invoicingStartDate}
                                            placeholderText="Select Last Invoiced date"
                                        />
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all"
                                    >
                                        Save Contract
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Box>
                </Modal>
            </LocalizationProvider>
        </>
    );
};

export default ContractForm;
