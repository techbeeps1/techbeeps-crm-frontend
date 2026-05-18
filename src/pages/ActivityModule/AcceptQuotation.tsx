import React, { useContext, useEffect, useState } from "react";
import {
    Box,
    TextField,
    Typography,
    Button, Checkbox, FormControlLabel
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiPath } from "../../../apiPath";
import Loader from "../../common/Loader";
import { toast } from 'react-toastify';
import { EmailContext } from "../../EmailProvider/EmailContext";

interface FormData {
    name: string;
    email: string;
    comments: string;
    isAccepted: boolean;
}

const AcceptOffer: React.FC = () => {
    const {
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: "",
            email: "",
            comments: "",
            isAccepted: false,
        },
    });
    const { invoiceId } = useParams();
    const [data, setData] = useState<any>(null);
    const [companyDetail, setCompanyDetail] = useState<string>();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { settings } = useContext(EmailContext) as any

    const notify = (message: string) => toast(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    useEffect(() => {
        if (data) {
            let open = localStorage.getItem('open') || false;
            if (!open) {
                let activityData = { type: 'offer', title: `Quotation # ${data && data.index} has been open by ${data && data.customer?.firstName} ${data && data.customer?.lastName}`, offer: invoiceId, reference: 'Customer', status: 'success' };
                handleActivity(activityData)
                handleQuote('Processing', '')
            }
        }
    }, [data])

    const fetchInvoice = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${apiPath}/finance/finance/${invoiceId}?template=required`);
            const invoiceData = response.data.finance;
            setData(invoiceData)
        } catch (error: any) {
            console.error('Error fetching invoice data:', error.message);
            notifyError(`Request failed : ${error?.message}`)
        } finally {
            setLoading(false)
        }
    };
    useEffect(() => {
        fetchInvoice();
    }, [invoiceId])

    const downloadInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiPath}/finance/download`, { Id: invoiceId }, {
                responseType: 'blob'
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quatation# ${data && data.index}.pdf`); // Filename for the downloaded PDF
            document.body.appendChild(link);
            link.click(); // Simulate click to download
            link.remove(); // Clean up
            window.URL.revokeObjectURL(url);
            let activityData = { type: 'offer', title: `Quotation # ${data && data.index} has been download by ${data && data.customer?.firstName} ${data && data.customer?.lastName}`, offer: invoiceId, reference: 'Customer', status: 'success' };
            handleActivity(activityData)
        } catch (err: any) {
            console.error(err);
            notifyError(`Request failed : ${err?.message}`)
        } finally {
            setLoading(false);
        }
    };

    const handleQuote = async (status: string, message: string) => {
        try {
            const response = await axios.post(`${apiPath}/finance/update/${invoiceId}`, { Status: status });
            if (message) {
                console.log(response.status)
                notify(message)
                navigate('/thankyou')
                sendMail()
            }
        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };
    const handleActivity = async (activityData: any) => {
        try {
            const response = await axios.post(`${apiPath}/api/activities`, activityData);
            console.log(response.status)
            localStorage.setItem('open', "true");
        } catch (error) {
            console.error('Error', error);
        }
    };

    const onSubmit = (formdata: FormData) => {
        if (!formdata.isAccepted) {
            alert("Please confirm that you accept the quotation.");
            return;
        }
        const message = 'Thank you for the Accept the quotation ,we will contact you soon'
        let activityData = { type: 'offer', title: `Quotation # ${data && data.index} has been accepted by ${data && data.customer?.firstName} ${data && data.customer?.lastName}`, offer: invoiceId, reference: formdata.name, status: 'success', comment: formdata.comments, sender: formdata.email };
        handleActivity(activityData)
        handleQuote('Accepted', message)
    };

    const replacePlaceholders = (htmlContent: any, data: any) => {
        if (!htmlContent || !data) return htmlContent;
        return htmlContent.replace(/\{\{(.*?)\}\}/g, (match: any, placeholder: any) => {
            const keys = placeholder.trim().split('.');
            let value = data;
            if (keys[0] === 'items' && data.invoice?.items) {
                const itemsHtml = data.invoice?.items.map((item: any) => `
             <tr style="display: flex; flex-wrap: wrap; justify-content: space-between; padding: 15px 0; width: 100%;">
                <td style="flex: 1; padding: 15px 0; min-width: 60%;">${item.description}</td>
                <td style="flex: 1; padding: 15px 0; min-width: 10%;">${item.quantity}</td>
                <td style="flex: 1; padding: 15px 0; min-width: 10%;">${item.price.toFixed(2)}</td>
                <td style="flex: 1; padding: 15px 0; min-width: 10%;">${(item.quantity * item.price).toFixed(2)}</td>
                <td style="flex: 1; padding: 15px 0; min-width: 10%;">${(item.btw)}%</td>
              </tr>
        `).join('');
                return itemsHtml
            }
            for (let key of keys) {
                value = value?.[key];
                if (value == undefined || value == null) return '';
                if (value == 0) return value;
            }
            return value || match;
        });
    };
    useEffect(() => {
        const fetchCompanyDetails = async () => {
            try {
                const response = await fetch(`${apiPath}/api/company-details`);
                const data = await response.json();
                setCompanyDetail(data);
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };
        fetchCompanyDetails();
    }, []);

    const modifiedHtmlContent = replacePlaceholders(
        data?.financialTemplate?.htmlContent,
        { customer: data?.customer, invoice: data, company: companyDetail }
    );

    const sendMail = async () => {
        try {
            const response = await axios.post(`${apiPath}/finance/send`, { Id: invoiceId, emailTemplateId: settings?.emailTemplates?.thankyou, content: 'notRequired' });
            if (response.status === 200) {
                let activityData = { type: 'offer', title: `Quotation # ${data && data.index} has been accept and a confirmation email send him`, offer: invoiceId, status: 'success', email: response.data };
                handleActivity(activityData)
            }
        } catch (error) {
            console.error('Error fetching invoice data:', error);
        }
    };

    return (
        <>
            {loading && <Loader />}
            <div className="bg-gray-100 p-10">
                <div className="rounded-lg mx-auto" style={{ maxWidth: '850px' }}>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Quote #{data && data.index} for {data && data.customer?.firstName} {data && data.customer?.lastName}</h1>
                        </div>
                        <Button
                            onClick={downloadInvoice}
                            disabled={loading}
                            variant="contained"
                            color="primary"
                            size="large"
                        >Download
                        </Button>
                    </div>
                    <div className="my-10 font-bold">
                        {data && data.financialTemplate?.htmlContent && (
                            <div
                                dangerouslySetInnerHTML={{ __html: modifiedHtmlContent }}
                            />
                        )}
                    </div>
                    <Box>
                        <Typography variant="h5" className="font-bold" marginBottom={1}>
                            Accept offer
                        </Typography>
                        <Typography marginBottom={5}>
                            Please ensure the desired optional quote lines are selected below and
                            provide your online signature to accept this quote.
                        </Typography>
                        <Box>
                            {data && data.items.map((item: any, index: number) =>
                                <div key={index}>
                                    <Box className="grid grid-cols-9 text-gray-800 text-sm font-medium" marginTop={2} marginBottom={3}>
                                        <Typography>{item.quantity}*</Typography>
                                        <Typography className="col-span-5">
                                            {item.description}
                                        </Typography>
                                        <Typography className="text-right">{item.price.toFixed(2)}</Typography>
                                        <Typography className="text-right">{(item.quantity * item.price).toFixed(2)}</Typography>
                                        <Typography className="text-right">{(item.btw)}%</Typography>
                                    </Box>
                                </div>
                            )}

                            <Box className="grid grid-cols-5 text-sm font-medium border-t pt-4" style={{ borderColor: "skyblue" }}>
                                <Typography className="col-span-4 text-center text-gray-800">
                                    Subtotal
                                </Typography>
                                <Typography className="text-right">{data && data.subTotal}</Typography>
                            </Box>
                            <Box className="grid grid-cols-5 text-sm font-medium mt-2">
                                <Typography className="col-span-4 text-center text-gray-800">
                                    Discount
                                </Typography>
                                <Typography className="text-right"> - {data && (data.subTotal*data.discount/100).toFixed(2)}</Typography>
                            </Box>
                            <Box className="grid grid-cols-5 text-sm mt-2">
                                <Typography className="col-span-4 text-center text-gray-800">
                                    BTW
                                </Typography>
                                <Typography className="text-right">+ {data && data.btw}</Typography>
                            </Box>
                            <Box className="grid grid-cols-5 text-lg font-bold mt-2">
                                <Typography className="col-span-4 text-center font-bold text-gray-800">
                                    Total
                                </Typography>
                                <Typography className="text-right text-red-600">= {data && data.total}</Typography>
                            </Box>
                        </Box>
                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            className="mt-3"
                        >
                            <Box className="mt-6">
                                <Controller
                                    name="name"
                                    control={control}
                                    rules={{ required: "Name is a required field" }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Name"
                                            variant="standard"
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="email"
                                    control={control}
                                    rules={{
                                        required: "Email address is a required field",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Please enter a valid email address",
                                        },
                                    }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Email address"
                                            variant="standard"
                                            fullWidth
                                            margin="normal"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="comments"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Comments"
                                            variant="standard"
                                            fullWidth
                                            margin="normal"
                                            multiline
                                            rows={2}
                                        />
                                    )}
                                />
                            </Box>
                            <Box className="mt-4">
                                <Controller
                                    name="isAccepted"
                                    control={control}
                                    rules={{
                                        validate: (value) =>
                                            value || "You must confirm that you accept the quotation",
                                    }}
                                    render={({ field }) => (
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value}
                                                    color="primary"
                                                />
                                            }
                                            label="I confirm that I accept the quotation"
                                        />
                                    )}
                                />
                                {errors.isAccepted && (
                                    <p className="text-red-600 text-sm">
                                        {errors.isAccepted.message}
                                    </p>
                                )}
                            </Box>
                            <Box className="mt-6 text-right">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                >
                                    Accept Offer
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </div>

            </div>
        </>
    );
};

export default AcceptOffer;
