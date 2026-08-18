import React, { useContext, useEffect, useState } from 'react';
import { Dialog } from '@mui/material';
import { useForm } from 'react-hook-form';
import ReactDatePicker from '../../../common/ReactDatepicker';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { EmailContext } from '../../../EmailProvider/EmailContext';
import { 
    MdFileDownload, 
    MdOutlineRemoveCircleOutline, 
    MdClose, 
    MdReceipt,
    MdWarningAmber 
} from 'react-icons/md';

interface FormData {
    lastInvoiceDate: Date | null;
    createInvoice: boolean;
    financialTemplate?: string;
}

const FreeupStorage: React.FC<any> = ({ storage, handler }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);
    const [templateList, setTemplate] = useState([]);
    const { settings } = useContext(EmailContext) as any;

    const [type, setType] = useState<string>('');
    const {
        control, register, formState: { errors },
        handleSubmit,
    } = useForm<FormData>({
        defaultValues: {
            lastInvoiceDate: null,
            createInvoice: true,
        },
    }) as any;

    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });
    const notify = (message: string) => toast.success(message);

    const handleOpen = (openType: string) => { 
        setType(openType);
        setOpen(true); 
    };
    const handleClose = () => setOpen(false);

    const onSubmit = (data: FormData) => {
        if (type === 'download') {
            downloadInvoice({ ...data, Id: storage._id });
        }
        if (type === 'send') {
            sendInvoice({ ...data, Id: storage._id, emailTemplateId: settings?.emailTemplates?.storageInovice });
        }
    };

    const storageHandlers = async () => {
        let path = `${apiPath}/api/empty-storage/${storage?._id}`;
        try {
            const response = await axios.put(path);
            if (response.status === 200) {
                handler();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        }
    };

    const sendInvoice = async (data: any) => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiPath}/api/storages-send`, data);
            if (response.status === 200) {
                handleClose();
                notify('Invoice sent successfully');
                storageHandlers();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handletemplate = async () => {
        try {
            let response = await axios.get(apiPath + "/api/templates?type=invoice");
            setTemplate(response.data || []);
        } catch (error: any) {
            console.error('Error fetching template:', error.message);
        }
    };

    useEffect(() => {
        handletemplate();
    }, []);

    const downloadInvoice = async (data: any) => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiPath}/api/storages-download`, data, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'invoice.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            handleClose();
        } catch (err: any) {
            notifyError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => handleOpen('send')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
                <MdOutlineRemoveCircleOutline className="w-4 h-4" />
                <span>Unload & Free Up</span>
            </button>

            <button
                type="button"
                onClick={() => handleOpen('download')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
                <MdFileDownload className="w-4 h-4" />
                <span>Download PDF</span>
            </button>

            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    }
                }}
            >
                {loading && <Loader />}

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-amber-50/20">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl ${type === 'send' ? 'bg-amber-600' : 'bg-indigo-600'} text-white flex items-center justify-center shadow-md`}>
                            {type === 'send' ? <MdWarningAmber className="w-5 h-5" /> : <MdFileDownload className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">
                                {type === 'send' ? 'Unload & Free Storage' : 'Download Storage Invoice'}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {type === 'send' ? 'Empty unit and create final invoice' : 'Export invoice PDF for this unit'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <MdClose className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-xs text-slate-600 leading-relaxed">
                        {type === 'send' 
                            ? 'You are about to cancel and empty this storage unit. This will immediately free up the storage and generate a draft invoice up to the date selected below.' 
                            : 'This action will generate and download an official PDF invoice for this storage period.'}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Last Invoice Date <span className="text-red-500">*</span>
                        </label>
                        <ReactDatePicker
                            control={control}
                            name="lastInvoiceDate"
                            rules={{ required: "Date is required" }}
                            placeholderText="Select Date"
                            minDate={storage?.invoicingStartDate ? new Date(storage.invoicingStartDate) : undefined}
                        />
                        {errors.lastInvoiceDate && <p className="text-red-500 text-xs mt-1">Date is required</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                            Financial Invoice Template <span className="text-red-500">*</span>
                        </label>
                        <select
                            className={`block w-full px-3.5 py-2.5 text-sm bg-white border ${
                                errors.financialTemplate ? 'border-red-500' : 'border-slate-300 focus:border-indigo-500'
                            } rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800`}
                            {...register('financialTemplate', { required: 'Financial Template is required' })}
                        >
                            <option value="">Select Template</option>
                            {templateList && templateList.map((item: any, index: number) => (
                                <option key={item._id || index} value={item._id}>{item.name}</option>
                            ))}
                        </select>
                        {errors.financialTemplate && (
                            <p className="text-red-500 text-xs mt-1">{errors.financialTemplate.message as string}</p>
                        )}
                    </div>

                    {/* Actions */}
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
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all ${
                                type === 'send'
                                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-500/20'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-500/20'
                            }`}
                        >
                            {type === 'send' ? 'Unload & Finalize' : 'Download PDF'}
                        </button>
                    </div>
                </form>
            </Dialog>
        </>
    );
};

export default FreeupStorage;
