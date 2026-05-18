import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, IconButton, DialogTitle, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form'; // Import useForm and Controller from react-hook-form
import ReactDatePicker from '../../../common/ReactDatepicker';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { EmailContext } from '../../../EmailProvider/EmailContext';

interface FormData {
    lastInvoiceDate: Date | null;
    createInvoice: boolean;
}

const FreeupStorage: React.FC<any> = ({ storage, handler }) => {
    const [open, setOpen] = useState<boolean>(false); // State to control popup visibility
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

    const handleOpen = (type: string) => { setOpen(true); setType(type) };
    const handleClose = () => setOpen(false);

    const onSubmit = (data: FormData) => {
        if (type === 'download') {
            downloadInvoice({ ...data, Id: storage._id })
        }
        if (type === 'send') {
            sendInvoice({ ...data, Id: storage._id, emailTemplateId: settings?.emailTemplates?.storageInovice })
        }
    };

    const storageHandlers = async () => {
        let path = `${apiPath}/api/empty-storage/${storage?._id}`;
        try {
            const response = await axios.put(path);
            if (response.status === 200) {
                handler()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage)
        }
    };

    const sendInvoice = async (data: any) => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiPath}/api/storages-send`, data);
            if (response.status === 200) {
                console.log(response)
                handleClose();
                notify('invoice send successfully')
                storageHandlers()
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
            console.log(error)
        } finally {
            setLoading(false)
        }
    };

    const handletemplate = async () => {
        try {
            let response = await axios.get(apiPath + "/api/templates?type=invoice")
            setTemplate(response.data)
        } catch (error: any) {
            console.error('Error fetching package:', error.message);
        }
    }
    useEffect(() => {
        handletemplate()
    }, [])

    const downloadInvoice = async (data: any) => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiPath}/api/storages-download`, data, {
                responseType: 'blob' // Important for downloading files
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'invoice.pdf'); // Filename for the downloaded PDF
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            handleClose();
        } catch (err: any) {
            notifyError(err.message);
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            <button
                onClick={() => handleOpen('send')}
                className="px-3 py-2 h-auto text-lg font-semibold text-red-600 bg-primary border border-red-600 rounded hover:bg-red-600 text-white transition duration-300"
            >
                Unload and Free up storage
            </button>
            <button
                onClick={() => handleOpen('download')}
                className="px-3 py-2 h-auto text-lg font-semibold text-red-600 bg-primary border border-red-600 rounded hover:bg-red-600 text-white transition duration-300"
            >
                Download Pdf
            </button>
            <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
                {loading && <Loader />}

                <DialogTitle className="flex justify-between items-center">
                    <span className="font-semibold text-primary mb-1 mt-4" style={{ fontSize: '28px' }}>{type === 'send' ? 'Unload and Free' : 'Download Invoice'}</span>
                    <IconButton onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <p>
                        {type === 'send' ? 'You are about to cancel the storage. This will immediately empty the storage and prepare a draft invoice for up to the date entered below.' : 'This action will download a PDF invoice for the storage.'}
                    </p>
                    <div className='h-80'>
                        {/* <FormControlLabel
                            control={
                                <Controller
                                    name="createInvoice"
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox
                                            {...field}
                                            color="primary"
                                        />
                                    )}
                                    defaultValue={true}
                                />
                            }
                            label="Create invoice"
                            className="my-4"
                        /> */}
                        <div className='mb-3 mt-6'>
                            <label className="block font-medium text-lg mb-2">Invoice Last Date</label>
                            <ReactDatePicker
                                control={control}
                                name="lastInvoiceDate"
                                rules={{ required: "Date is required" }}
                                placeholderText="Select Date"
                                minDate={new Date(storage.invoicingStartDate)}
                            />
                        </div>
                        <div>
                            <label className="block font-medium text-lg mb-2">Financial Template</label>
                            <select
                                className={`mt-1 block w-full p-3 border text-lg ${errors.financialTemplate ? 'border-red' : ' border-gray'} `}
                                {...register('financialTemplate', { required: 'Financial Template is required' })}
                            >
                                {templateList && templateList.map((item: any, index: number) =>
                                    <option key={index} value={item._id}>{item.name}</option>
                                )}
                            </select>
                            {errors.financialTemplate && <p className="text-red-500 text-xs">{errors.financialTemplate.message}</p>}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <div className="flex gap-3 p-4 pe-6">
                        <Button onClick={handleClose} variant='outlined'>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)} // Use handleSubmit for form submission
                            color="primary"
                            variant="contained"
                        >
                            Submit
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default FreeupStorage;
