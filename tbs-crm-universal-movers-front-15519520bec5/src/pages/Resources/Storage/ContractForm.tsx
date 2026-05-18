import React, { useState, useEffect } from 'react';

import {
    Button,
    IconButton,
    Modal,
    Box,
    Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

import { useForm } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import Loader from '../../../common/Loader/index';
import ReactDatePicker from '../../../common/ReactDatepicker';

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


    const [activeStep, setActiveStep] = useState(0);

    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleClose = () => setOpen(false);
    const invoicingStartDate = watch('invoicingStartDate');

    useEffect(() => {
        setInvoicePeriod(storageData?.invoicePeriod || 'Monthly')
        setVatOption(storageData?.includingVat || "Including VAT" )
        setInvoicePerVolume(storageData?.invoicePerVolume || false)
        reset({ vatPercentage:storageData?.vatPercentage,price:storageData.price,salesGroup:storageData.salesGroup,storedForProject:storageData.storedForProject,invoiceReference:storageData.invoiceReference,invoicingStartDate:new Date(storageData.invoicingStartDate) || '',lastInvoicedDate:new Date(storageData.lastInvoicedDate)|| ''})
    }, [reset,storageData]);


    const onSubmit = (data: any) => {
        let finalData = {...data, invoicePerVolume: invoicePerVolume, invoicingPeriod: invoicePeriod, includingVat: vatOption, billStorageInAdvance: storageOption}
        storageHandlers(finalData)
    };

    const storageHandlers = async (data: any) => {
        setLoading(true)
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
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    };

    const handleAllJob = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/jobList?customer=${storageData.customer?._id || ''}`);
            let jobs = response["data"].jobList.map((job: any) => { return { label: job.customer?.firstName + " " + job.customer?.lastName + ` (${job.index})`, value: job._id } });
            setJobs(jobs);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if(storageData){
            handleAllJob()
        }
    }, [storageData])

    const salesGroupHandler = async () => {
        try {
            let response = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`)
            setSalesGroupOption(response.data);
        } catch (error) {
            console.error('Error fetching countries:', error);
        }
    }
    useEffect(() => {
        salesGroupHandler()
    }, []);

    return (
        <>
            <div>
                <IconButton
                    onClick={() => setOpen(true)}
                    className="absolute top-0 right-2 text-gray hover:text-black"
                >
                    <EditIcon />
                </IconButton>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Modal open={open} onClose={handleClose}>
                        <Box className="bg-white p-5 rounded-lg shadow-lg mx-auto relative overflow-y-auto" style={{ maxHeight: '100vh' }}>
                            {loading && <Loader />}
                            <div className="flex justify-between items-center mb-3">
                                <div className='flex gap-8'>
                                    <Typography variant="h4" component="h2" className="pb-2">
                                        Update Contract Information
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={handleClose}
                                    className="absolute top-0 right-2 text-gray hover:text-black"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </div>
                            <div>
                                {loading ? <p style={{ minHeight: "80vh", display: 'flex', justifyContent: "center", alignItems: "center" }} >loading...</p> :
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        {activeStep === 0 && (
                                            <>
                                                <div style={{ maxWidth: "800px", margin: 'auto', minHeight: "76vh" }}>
                                                    <div className="mb-6">
                                                        <p className="font-medium text-lg mb-2">Invoice period</p>
                                                        <div className="flex space-x-2">
                                                            {["Daily", "Weekly", "Monthly", "quarter", "Annual"].map((period) => (
                                                                <button
                                                                    type="button"
                                                                    key={period}
                                                                    className={`px-4 w-full py-2 text-lg font-medium border rounded ${invoicePeriod === period ? "bg-blue text-white" : "bg-gray"
                                                                        }`}
                                                                    onClick={() => setInvoicePeriod(period)}
                                                                >
                                                                    {period}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                        <div className="mb-4">
                                                            <p className="font-medium text-lg mb-2">Is the price inclusive or exclusive of VAT?</p>
                                                            <div className="flex space-x-2">
                                                                {["Including VAT", "Excluding VAT"].map((option) => (
                                                                    <button
                                                                        type="button"
                                                                        key={option}
                                                                        className={`w-full px-4 py-2 border text-lg font-medium rounded ${vatOption === option ? "bg-blue text-white" : "bg-gray"
                                                                            }`}
                                                                        onClick={() => setVatOption(option)}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="mb-4">
                                                            <p className="font-medium text-lg mb-2">Storage in advance or after invoicing?</p>
                                                            <div className="flex space-x-2">
                                                                {["In advance", "Afterwards"].map((option) => (
                                                                    <button
                                                                        type="button"
                                                                        key={option}
                                                                        className={`w-full px-4 py-2 border text-lg font-medium rounded ${storageOption === option ? "bg-blue text-white" : "bg-gray"
                                                                            }`}
                                                                        onClick={() => setStorageOption(option)}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                        <div className="mb-4">
                                                            <p className="font-medium text-lg mb-2">Invoice by volume?</p>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    type="button"
                                                                    className={`w-full px-4 py-2 border text-lg font-medium rounded ${invoicePerVolume ? "bg-blue text-white" : "bg-gray"
                                                                        }`}
                                                                    onClick={() => setInvoicePerVolume(true)}
                                                                >
                                                                    Yes
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`w-full px-4 py-2 border text-lg font-medium rounded ${!invoicePerVolume ? "bg-blue text-white" : "bg-gray"
                                                                        }`}
                                                                    onClick={() => setInvoicePerVolume(false)}
                                                                >
                                                                    No
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">VAT</label>
                                                            <select
                                                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                {...register("vatPercentage", { required: "VAT is required" })}
                                                            >
                                                                <option value="">Select Vat</option>
                                                                <option value="0">0%</option>
                                                                <option value="9">9%</option>
                                                                <option value="21">21%</option>
                                                            </select>
                                                            {errors.vatPercentage && <p className="text-red-500 text-sm">{errors.vatPercentage.message}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">{`Price per ${invoicePeriod} ${invoicePerVolume ? 'Per volume' : ""}`}</label>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                {...register("price", { required: "Price is required" })}
                                                                placeholder={`Enter price per ${invoicePeriod} ${invoicePerVolume ? 'Per volume' : ""}`}
                                                            />
                                                            {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">Sales group</label>
                                                            <select
                                                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                {...register("salesGroup")}
                                                            >
                                                                <option value="">Select Salesgroup</option>
                                                                {salesGroupOption && salesGroupOption.map((item: any) => <option key={item._id} value={item.name}>{item.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">Job</label>
                                                            <select
                                                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                {...register("storedForProject")}
                                                            >
                                                                <option value="">Select job</option>
                                                                {jobs && jobs.map((item: any) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">Invoice reference</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                {...register("invoiceReference")}
                                                                placeholder="Enter invoice reference"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">Start date</label>
                                                            <ReactDatePicker
                                                                control={control}
                                                                name="invoicingStartDate"
                                                                rules={{ required: "Date is required" }}
                                                                placeholderText="Select Start date"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block font-medium text-lg mb-2">Last invoiced date</label>
                                                            <ReactDatePicker
                                                                control={control}
                                                                name="lastInvoicedDate"
                                                                minDate={invoicingStartDate}
                                                                placeholderText="Select invoiced date"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <Box className="flex justify-end mt-6 mb-5">
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size='large'
                                                onClick={handleSubmit(onSubmit)}
                                            >
                                                Submit
                                            </Button>
                                        </Box>
                                    </form>
                                }
                            </div>

                        </Box>
                    </Modal>
                </LocalizationProvider>

            </div>

        </>
    );
};

export default ContractForm;
