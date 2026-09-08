import React, { useContext, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import { EmailContext } from '../../EmailProvider/EmailContext';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';

interface FormData {
    name: string;
    email: string;
    comments: string;
    isAccepted: boolean;
}

const AcceptOffer: React.FC = () => {
    const { symbol: currencySymbol } = useCurrency();
    const {
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        defaultValues: {
            name: '',
            email: '',
            comments: '',
            isAccepted: false,
        },
    });
    const { invoiceId } = useParams();
    const [data, setData] = useState<any>(null);
    const [companyDetail, setCompanyDetail] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { settings } = useContext(EmailContext) as any;

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) =>
        toast.error(message, {
            autoClose: 2500,
        });

    useEffect(() => {
        if (data) {
            const open = localStorage.getItem('open') || false;
            if (!open) {
                const activityData = {
                    type: 'offer',
                    title: `Quotation # ${data && data.index} has been opened by ${data && data.customer?.firstName} ${data && data.customer?.lastName}`,
                    offer: invoiceId,
                    reference: 'Customer',
                    status: 'success',
                };
                handleActivity(activityData);
                handleQuote('Processing', '');
            }
        }
    }, [data]);

    const fetchInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/finance/finance/${invoiceId}?template=required`);
            const invoiceData = response.data.finance;
            setData(invoiceData);
        } catch (error: any) {
            console.error('Error fetching invoice data:', error.message);
            notifyError(`Request failed: ${error?.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoice();
    }, [invoiceId]);

    // Autofill customer name and email when quote data loads
    useEffect(() => {
        if (data?.customer) {
            const customerFullName = `${data.customer.firstName || ''} ${data.customer.lastName || ''}`.trim();
            if (customerFullName) {
                setValue('name', customerFullName, { shouldValidate: true });
            }
            if (data.customer.email) {
                setValue('email', data.customer.email, { shouldValidate: true });
            }
        }
    }, [data, setValue]);

    const downloadInvoice = async () => {
        setLoading(true);
        try {
            const response = await axios.post(
                `${apiPath}/finance/download`,
                { Id: invoiceId },
                { responseType: 'blob' }
            );
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quotation_${data?.index || invoiceId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            const activityData = {
                type: 'offer',
                title: `Quotation # ${data?.index} downloaded by ${data?.customer?.firstName} ${data?.customer?.lastName}`,
                offer: invoiceId,
                reference: 'Customer',
                status: 'success',
            };
            handleActivity(activityData);
        } catch (err: any) {
            console.error(err);
            notifyError(`Failed to download: ${err?.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleQuote = async (status: string, message: string) => {
        try {
            const response = await axios.post(`${apiPath}/finance/update/${invoiceId}`, { Status: status });
            if (message) {
                notify(message);
                navigate('/thankyou');
                sendMail();
            }
        } catch (error) {
            console.error('Error updating invoice:', error);
        }
    };

    const handleActivity = async (activityData: any) => {
        try {
            await axios.post(`${apiPath}/api/activities`, activityData);
            localStorage.setItem('open', 'true');
        } catch (error) {
            console.error('Error logging activity', error);
        }
    };

    const onSubmit = (formdata: FormData) => {
        if (!formdata.isAccepted) {
            notifyError('Please confirm that you accept the quotation.');
            return;
        }
        setIsSubmitting(true);
        const message = 'Thank you for accepting the quotation, we will contact you soon';
        const activityData = {
            type: 'offer',
            title: `Quotation # ${data?.index} has been accepted by ${data?.customer?.firstName} ${data?.customer?.lastName}`,
            offer: invoiceId,
            reference: formdata.name,
            status: 'success',
            comment: formdata.comments,
            sender: formdata.email,
        };
        handleActivity(activityData);
        handleQuote('Accepted', message);
    };

    const replacePlaceholders = (htmlContent: any, dataMap: any) => {
        if (!htmlContent || !dataMap) return htmlContent;
        return htmlContent.replace(/\{\{(.*?)\}\}/g, (match: any, placeholder: any) => {
            const keys = placeholder.trim().split('.');
            let value = dataMap;
            if (keys[0] === 'items' && dataMap.invoice?.items) {
                return dataMap.invoice?.items
                    .map(
                        (item: any) => `
             <tr style="display: flex; flex-wrap: wrap; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; width: 100%;">
                <td style="flex: 1; min-width: 50%; font-weight: 600;">${item.description}</td>
                <td style="width: 10%; text-align: center;">${item.quantity}</td>
                <td style="width: 15%; text-align: right;">${formatCurrency(item.price || 0)}</td>
                <td style="width: 15%; text-align: right; font-weight: 700;">${formatCurrency((item.quantity || 0) * (item.price || 0))}</td>
                <td style="width: 10%; text-align: right; color: #64748b;">${item.btw || 0}%</td>
              </tr>
        `
                    )
                    .join('');
            }
            for (const key of keys) {
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
                const compData = await response.json();
                setCompanyDetail(compData);
            } catch (error) {
                console.error('Error fetching company details:', error);
            }
        };
        fetchCompanyDetails();
    }, []);

    const modifiedHtmlContent = replacePlaceholders(data?.financialTemplate?.htmlContent, {
        customer: data?.customer,
        invoice: data,
        company: companyDetail,
    });

    const sendMail = async () => {
        try {
            const response = await axios.post(`${apiPath}/finance/send`, {
                Id: invoiceId,
                emailTemplateId: settings?.emailTemplates?.thankyou,
                content: 'notRequired',
            });
            if (response.status === 200) {
                const activityData = {
                    type: 'offer',
                    title: `Quotation # ${data?.index} confirmation email sent`,
                    offer: invoiceId,
                    status: 'success',
                    email: response.data,
                };
                handleActivity(activityData);
            }
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
    };

    const discountAmount =
        data && data.discount ? ((Number(data.subTotal || 0) * Number(data.discount)) / 100).toFixed(2) : '0.00';

    return (
        <>
            {loading && <Loader />}
            <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-white font-sans antialiased pb-16">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 bg-white/90 dark:bg-boxdark/90 backdrop-blur-md border-b border-slate-200/80 dark:border-strokedark px-4 md:px-10 py-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center shadow-md shadow-primary/20">
                            {companyDetail?.companyName ? companyDetail.companyName.charAt(0) : 'M'}
                        </div>
                        <div>
                            <span className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white tracking-tight block">
                                {companyDetail?.companyName || 'Relocation & Logistics'}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 block -mt-0.5">
                                Official Quotation Portal
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {data?.index && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs font-bold border border-slate-200 dark:border-slate-700">
                                <ReceiptLongOutlinedIcon style={{ fontSize: 15 }} />
                                #{data.index}
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={downloadInvoice}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
                        >
                            <DownloadOutlinedIcon style={{ fontSize: 16 }} />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </header>

                {/* Hero Header Banner */}
                <div className="bg-gradient-to-b from-white to-slate-50 dark:from-boxdark dark:to-boxdark-2 border-b border-slate-200/80 dark:border-strokedark py-8 px-4 md:px-8">
                    <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue/10 text-primary border border-blue/20">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Quotation
                                </span>
                                {data?.index && (
                                    <span className="text-xs font-bold text-slate-400 font-mono">
                                        #{data.index}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                Review & Accept Quotation
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mt-1">
                                Prepared specifically for{' '}
                                <span className="font-bold text-slate-700 dark:text-slate-200">
                                    {data?.customer?.firstName} {data?.customer?.lastName}
                                </span>{' '}
                                • {data?.customer?.email || ''}
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-white dark:bg-boxdark p-3 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs self-start md:self-auto">
                            <div className="text-right">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Total Amount
                                </span>
                                <span className="text-xl md:text-2xl font-black text-primary">
                                    {formatCurrency(data?.total || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Container */}
                <main className="max-w-[1400px] mx-auto px-4 md:px-8 mt-8">
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        {/* Left / Main Column: Template Document & Line Items Breakdown (Spacious) */}
                        <div className="flex-1 min-w-0 space-y-6">
                            {/* Document Template Preview Card */}
                            {data?.financialTemplate?.htmlContent && (
                                <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-4 mb-5 border-b border-slate-100 dark:border-strokedark flex items-center gap-2">
                                        <ReceiptLongOutlinedIcon fontSize="small" className="text-primary" />
                                        <span>Quotation Overview</span>
                                    </div>
                                    <div
                                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: modifiedHtmlContent }}
                                    />
                                </div>
                            )}

                            {/* Line Items Table Card */}
                            {data?.items && data.items.length > 0 && (
                                <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-sm space-y-4">
                                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-strokedark flex items-center justify-between">
                                        <span>Itemized Breakdown</span>
                                        <span className="text-xs font-semibold text-slate-400">
                                            {data.items.length} {data.items.length === 1 ? 'item' : 'items'}
                                        </span>
                                    </h3>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 dark:border-strokedark text-slate-400 font-extrabold uppercase tracking-wider">
                                                    <th className="pb-2.5">Description</th>
                                                    <th className="pb-2.5 text-center">Qty</th>
                                                    <th className="pb-2.5 text-right">Price</th>
                                                    <th className="pb-2.5 text-right">BTW</th>
                                                    <th className="pb-2.5 text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-strokedark">
                                                {data.items.map((item: any, idx: number) => (
                                                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                                                        <td className="py-3 pr-2 font-bold text-slate-800 dark:text-white">
                                                            {item.description}
                                                        </td>
                                                        <td className="py-3 px-2 text-center text-slate-600 dark:text-slate-300">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="py-3 px-2 text-right font-mono text-slate-600 dark:text-slate-300">
                                                            {formatCurrency(item.price || 0)}
                                                        </td>
                                                        <td className="py-3 px-2 text-right text-slate-400">
                                                            {item.btw || 0}%
                                                        </td>
                                                        <td className="py-3 pl-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                            {formatCurrency(Number(item.quantity || 0) * Number(item.price || 0))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Financial Summary Calculation */}
                                    <div className="pt-4 border-t border-slate-200/80 dark:border-strokedark space-y-2 text-xs">
                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>Subtotal</span>
                                            <span className="font-mono font-semibold">
                                                {formatCurrency(data?.subTotal || 0)}
                                            </span>
                                        </div>

                                        {Number(data?.discount || 0) > 0 && (
                                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                                <span>Discount ({data.discount}%)</span>
                                                <span className="font-mono font-semibold">- {formatCurrency(discountAmount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                            <span>BTW / Tax</span>
                                            <span className="font-mono font-semibold">
                                                + {formatCurrency(data?.btw || 0)}
                                            </span>
                                        </div>

                                        <div className="pt-2 border-t border-slate-200/80 dark:border-strokedark flex justify-between items-center text-sm font-black text-slate-900 dark:text-white">
                                            <span>Total (incl. BTW)</span>
                                            <span className="text-base text-primary font-black font-mono">
                                                {formatCurrency(data?.total || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Online Acceptance & Signature Card (Optimal Form Width ~410px) */}
                        <div className="w-full lg:w-[410px] flex-shrink-0 sticky top-22">
                            <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-xl relative overflow-hidden space-y-5">
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-emerald-500" />

                                <div>
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                                        <VerifiedUserOutlinedIcon fontSize="small" />

                                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                            Accept & Confirm Offer
                                        </h2>
                                    </div>

                                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                                        Please provide your name, email and confirmation below to accept this quotation online.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    {/* Name Input (Autofill & ReadOnly) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Your Full Name <span className="text-rose-500">*</span>
                                            </label>

                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <PersonOutlineOutlinedIcon fontSize="small" />
                                            </div>
                                            <Controller
                                                name="name"
                                                control={control}
                                                rules={{ required: 'Full Name is required' }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        readOnly
                                                        placeholder="Customer Name"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-100/90 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-not-allowed select-none focus:outline-none"
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="text-rose-500 text-[11px] font-semibold mt-1">
                                                {errors.name.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email Input (Autofill & ReadOnly) */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                                Email Address <span className="text-rose-500">*</span>
                                            </label>

                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                                <EmailOutlinedIcon fontSize="small" />
                                            </div>
                                            <Controller
                                                name="email"
                                                control={control}
                                                rules={{
                                                    required: 'Email address is required',
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: 'Enter a valid email address',
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="email"
                                                        readOnly
                                                        placeholder="customer@example.com"
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-100/90 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-not-allowed select-none focus:outline-none"
                                                    />
                                                )}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="text-rose-500 text-[11px] font-semibold mt-1">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Comments Input */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                            Special Notes or Comments{' '}
                                            <span className="text-slate-400 font-normal">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                                                <ChatBubbleOutlineOutlinedIcon fontSize="small" />
                                            </div>
                                            <Controller
                                                name="comments"
                                                control={control}
                                                render={({ field }) => (
                                                    <textarea
                                                        {...field}
                                                        rows={3}
                                                        placeholder="Any specific scheduling or delivery remarks..."
                                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Agreement Checkbox */}
                                    <div className="pt-2">
                                        <Controller
                                            name="isAccepted"
                                            control={control}
                                            rules={{
                                                validate: (value) =>
                                                    value || 'You must confirm that you accept the quotation',
                                            }}
                                            render={({ field }) => (
                                                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                        className="mt-0.5 rounded text-primary focus:ring-primary/20 cursor-pointer"
                                                    />
                                                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                                        I confirm that I have reviewed the details above and hereby{' '}
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            accept this quotation
                                                        </span>
                                                        .
                                                    </span>
                                                </label>
                                            )}
                                        />
                                        {errors.isAccepted && (
                                            <p className="text-rose-500 text-[11px] font-semibold mt-1.5">
                                                {errors.isAccepted.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || loading}
                                        className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircleRoundedIcon fontSize="small" />
                                        <span>{isSubmitting ? 'Confirming Acceptance...' : 'Accept & Confirm Quotation'}</span>
                                    </button>


                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
};

export default AcceptOffer;
