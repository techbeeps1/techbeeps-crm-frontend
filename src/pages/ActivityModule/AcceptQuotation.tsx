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
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useCurrency, formatCurrency } from '../../utils/currencyUtil';
import { sanitizeHtml } from '../../utils/sanitizeUtil';

interface FormData {
    name: string;
    email: string;
    comments: string;
    isAccepted: boolean;
}

const formatDutchDate = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(val)) return val;
    try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return String(val);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    } catch {
        return String(val);
    }
};

const formatAddress = (addr: any): string => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    if (Array.isArray(addr)) {
        if (addr.length === 0) return '';
        addr = addr[0];
    }
    if (typeof addr === 'object' && addr !== null) {
        const street = [addr.street, addr.houseNumber, addr.addition].filter(Boolean).join(' ');
        const postCity = [addr.postalCode, addr.city].filter(Boolean).join(' ');
        const parts = [street, postCity, addr.country || 'Netherlands'].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : '';
    }
    return '';
};

const formatCleanAmount = (val: any): string => {
    const num = Number(val);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

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
    const [fetchError, setFetchError] = useState<string | null>(null);
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
        if (data && invoiceId) {
            const viewedKey = `viewed_quote_${invoiceId}`;
            const alreadyViewed = sessionStorage.getItem(viewedKey);
            if (!alreadyViewed) {
                const customerName = `${data.customer?.firstName || ''} ${data.customer?.lastName || ''}`.trim() || 'Client';
                const activityData = {
                    type: 'offer',
                    title: `Quotation # ${data.index || invoiceId} was viewed by ${customerName}`,
                    offer: invoiceId,
                    reference: 'Customer',
                    status: 'success',
                };
                handleActivity(activityData);
                sessionStorage.setItem(viewedKey, 'true');
            }
        }
    }, [data, invoiceId]);

    const fetchInvoice = async () => {
        setLoading(true);
        setFetchError(null);
        try {
            const response = await axios.get(`${apiPath}/finance/finance/${invoiceId}?template=required`);
            const invoiceData = response.data.finance;
            setData(invoiceData);
        } catch (error: any) {
            console.error('Error fetching invoice data:', error.message);
            const msg = error?.response?.data?.message || error?.message || 'Quotation not found or link has expired';
            setFetchError(msg);
            notifyError(msg);
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
            const customerFullName = `${data.customer.firstName || ''} ${data.customer.lastName || ''}`.trim() || data.customer.companyName || '';
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

    const handleQuote = async (formdata: FormData, message: string) => {
        try {
            const payload = {
                method: 'PUBLIC_LINK',
                name: formdata.name,
                email: formdata.email,
                comments: formdata.comments,
                version: data?.version || 1,
                customerSignature: 'DIGITALLY_CONFIRMED'
            };
            const response = await axios.post(`${apiPath}/finance/accept/${invoiceId}`, payload);
            if (message) {
                notify(message);
                navigate('/thankyou');
                sendMail();
            }
        } catch (error: any) {
            console.error('Error accepting quotation:', error);
            const errMsg = error?.response?.data?.message || error?.response?.data?.msg || 'Failed to accept quote. Please try again.';
            notifyError(errMsg);
            setIsSubmitting(false);
        }
    };

    const handleActivity = async (activityData: any) => {
        try {
            await axios.post(`${apiPath}/api/activities`, activityData);
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
        handleQuote(formdata, message);
    };

    const replacePlaceholders = (htmlContent: any, dataMap: any) => {
        if (!htmlContent || !dataMap) return htmlContent || '';
        let processed = htmlContent;

        // Strip any rogue literal ${...} or ${ placeholders
        processed = processed.replace(/\$\{[^}]*\}/g, '');

        // Evaluate {{...}} placeholders
        processed = processed.replace(/\{\{(.*?)\}\}/g, (match: any, placeholder: any) => {
            const cleanPlaceholder = placeholder.trim();
            const keys = cleanPlaceholder.split('.');

            if (cleanPlaceholder === 'currencySymbol') {
                return dataMap.currencySymbol || '€';
            }

            // Customer address resolution
            if (cleanPlaceholder === 'customer.address') {
                return formatAddress(dataMap.customer?.address);
            }

            // Customer phone resolution
            if (cleanPlaceholder === 'customer.phone' || cleanPlaceholder === 'customer.telephone' || cleanPlaceholder === 'customer.mobile') {
                return dataMap.customer?.phone || dataMap.customer?.telephone || dataMap.customer?.mobile || dataMap.customer?.contact || '';
            }

            // Customer name resolution
            if (cleanPlaceholder === 'customer.name') {
                return dataMap.customer?.name || `${dataMap.customer?.firstName || ''} ${dataMap.customer?.lastName || ''}`.trim() || '';
            }

            // Quote date & validity resolution
            if (cleanPlaceholder === 'invoice.dueDate' || cleanPlaceholder === 'invoice.expire_date' || cleanPlaceholder === 'invoice.validUntil') {
                return formatDutchDate(dataMap.invoice?.dueDate || dataMap.invoice?.expire_date || dataMap.invoice?.validUntil);
            }
            if (cleanPlaceholder === 'invoice.date') {
                return formatDutchDate(dataMap.invoice?.date || dataMap.invoice?.createdAt);
            }

            // Itemized table placeholder
            if (keys[0] === 'items') {
                const itemsList = dataMap.invoice?.items || [];
                if (!itemsList.length) {
                    return '<p style="color: #64748b; font-style: italic; padding: 12px 0;">No itemized services listed.</p>';
                }
                const rows = itemsList
                    .map((item: any, idx: number) => {
                        const rawQty = item.quantity;
                        const qty = (rawQty !== undefined && rawQty !== null && rawQty !== '') ? Number(rawQty) : 0;
                        const rawPrice = item.price;
                        const price = (rawPrice !== undefined && rawPrice !== null && rawPrice !== '') ? Number(rawPrice) : 0;
                        const lineTotal = item.lineTotal !== undefined ? Number(item.lineTotal) : (qty * price);
                        const btw = item.btw !== undefined && item.btw !== null ? item.btw : (item.tax || 21);
                        const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
                        return `
                          <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${bg};">
                            <td style="padding: 12px 14px; font-weight: 600; color: #1e293b; vertical-align: top;">${item.description || 'Moving Service'}</td>
                            <td style="padding: 12px 10px; text-align: center; color: #475569; width: 70px; vertical-align: top;">${qty}</td>
                            <td style="padding: 12px 14px; text-align: right; font-family: monospace; color: #475569; width: 110px; vertical-align: top;">${formatCurrency(price)}</td>
                            <td style="padding: 12px 14px; text-align: right; font-family: monospace; font-weight: 700; color: #0f172a; width: 120px; vertical-align: top;">${formatCurrency(lineTotal)}</td>
                            <td style="padding: 12px 12px; text-align: right; color: #64748b; width: 75px; vertical-align: top;">${btw}%</td>
                          </tr>
                        `;
                    })
                    .join('');

                return `
                  <div style="overflow-x: auto; margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                      <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 2px solid #3c50e0; color: #0f172a;">
                          <th style="padding: 12px 14px; font-weight: 700;">Description</th>
                          <th style="padding: 12px 10px; font-weight: 700; text-align: center; width: 70px;">Qty</th>
                          <th style="padding: 12px 14px; font-weight: 700; text-align: right; width: 110px;">Price</th>
                          <th style="padding: 12px 14px; font-weight: 700; text-align: right; width: 120px;">Total</th>
                          <th style="padding: 12px 12px; font-weight: 700; text-align: right; width: 75px;">BTW</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rows}
                      </tbody>
                    </table>
                  </div>
                `;
            }

            // Belastingdienst Tax Breakdown placeholder
            if (cleanPlaceholder === 'taxBreakdown' || cleanPlaceholder === 'btwSpecification') {
                const breakdown = dataMap.invoice?.taxBreakdown;
                if (!breakdown || !breakdown.rates || !breakdown.rates.length) return '';
                const bdRows = breakdown.rates.map((r: any) => `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 8px 12px; color: #1e293b; font-weight: 600;">BTW ${r.rate}%</td>
                      <td style="padding: 8px 12px; text-align: right; font-family: monospace;">${formatCurrency(r.taxableBase)}</td>
                      <td style="padding: 8px 12px; text-align: right; font-family: monospace; font-weight: 700;">${formatCurrency(r.vatAmount)}</td>
                    </tr>
                `).join('');
                return `
                  <div style="margin: 16px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #ffffff;">
                    <div style="background-color: #f8fafc; padding: 8px 12px; font-weight: 700; font-size: 11px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #e2e8f0;">
                      Belastingdienst Btw-Specificatie
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                      <thead>
                        <tr style="background-color: #f1f5f9; color: #475569; border-bottom: 1px solid #e2e8f0; font-size: 11px;">
                          <th style="padding: 8px 12px; text-align: left;">Tarief</th>
                          <th style="padding: 8px 12px; text-align: right;">Grondslag (Net)</th>
                          <th style="padding: 8px 12px; text-align: right;">Btw-Bedrag</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${bdRows}
                      </tbody>
                    </table>
                  </div>
                `;
            }

            // Complete Totals Breakdown Card placeholder
            if (cleanPlaceholder === 'totalsBreakdown' || cleanPlaceholder === 'totalsCard') {
                const subTotal = Number(dataMap.invoice?.subTotal || dataMap.invoice?.subtotal || 0);
                const discountPct = Number(dataMap.invoice?.discount || 0);
                const discountedPrice = Number(dataMap.invoice?.discountedPrice || (discountPct > 0 ? (subTotal * discountPct / 100) : 0));
                const net = Number(dataMap.invoice?.net !== undefined ? dataMap.invoice?.net : (subTotal - discountedPrice));
                const btw = Number(dataMap.invoice?.btw || dataMap.invoice?.totalVat || 0);
                const total = Number(dataMap.invoice?.total || 0);
                const hasDiscount = discountPct > 0 || discountedPrice > 0;

                return `
                  <div class="totals-card" style="margin-left: auto; width: 300px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 25px; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                    <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                      <span>Subtotal (Excl. BTW):</span>
                      <span style="font-weight: 600; color: #1e293b;">${formatCurrency(subTotal)}</span>
                    </div>
                    ${hasDiscount ? `
                    <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #dc2626;">
                      <span>Discount (${discountPct}%):</span>
                      <span style="font-weight: 600;">-${formatCurrency(discountedPrice)}</span>
                    </div>
                    <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569; border-top: 1px dashed #cbd5e1; margin-top: 2px; padding-top: 4px;">
                      <span>Net Taxable Base:</span>
                      <span style="font-weight: 600; color: #1e293b;">${formatCurrency(net)}</span>
                    </div>
                    ` : ''}
                    <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                      <span>BTW (Tax):</span>
                      <span style="font-weight: 600; color: #1e293b;">+${formatCurrency(btw)}</span>
                    </div>
                    <div class="total-row grand" style="display: flex; justify-content: space-between; border-top: 2px solid #3c50e0; margin-top: 8px; padding-top: 8px; font-size: 15px; font-weight: 800; color: #0f172a;">
                      <span>Total Amount:</span>
                      <span>${formatCurrency(total)}</span>
                    </div>
                  </div>
                `;
            }

            let value = dataMap;
            for (const key of keys) {
                value = value?.[key];
                if (value === undefined || value === null) return '';
                if (value === 0) return '0';
            }

            // ISO date formatting
            if (
                typeof value === 'string' &&
                cleanPlaceholder.toLowerCase().includes('date') &&
                value.includes('T')
            ) {
                return formatDutchDate(value);
            }

            // Amount / totals formatting (RETURN NUMERIC VALUE ONLY, never prepend extra currency symbol!)
            if (
                typeof value === 'number' &&
                (cleanPlaceholder.toLowerCase().includes('total') ||
                 cleanPlaceholder.toLowerCase().includes('amount') ||
                 cleanPlaceholder.toLowerCase().includes('price') ||
                 cleanPlaceholder.toLowerCase().includes('subtotal') ||
                 cleanPlaceholder.toLowerCase().includes('discount') ||
                 cleanPlaceholder.toLowerCase().includes('net') ||
                 cleanPlaceholder.toLowerCase().includes('vat'))
            ) {
                return formatCleanAmount(value);
            }

            // Safe object evaluation: prevent "[object Object]"
            if (typeof value === 'object' && value !== null) {
                if (Array.isArray(value)) {
                    if (value.length === 0) return '';
                    value = value[0];
                }
                if (typeof value === 'object' && value !== null) {
                    if (value.street || value.city || value.postalCode) {
                        return formatAddress(value);
                    }
                    if (value.firstName || value.lastName || value.companyName) {
                        return `${value.firstName || ''} ${value.lastName || ''}`.trim() || value.companyName || '';
                    }
                }
                return ''; // Never return String(value)
            }

            return value !== undefined && value !== null ? String(value) : '';
        });

        // Clean any leftover unresolved {{...}} placeholders
        processed = processed.replace(/\{\{[^}]*\}\}/g, '');

        // Upgrade single-line totals-card to full commercial breakdown
        if (processed.includes('<div class="totals-card">') || processed.includes('<div class="totals-card"')) {
            const subTotal = Number(dataMap.invoice?.subTotal || dataMap.invoice?.subtotal || 0);
            const discountPct = Number(dataMap.invoice?.discount || 0);
            const discountedPrice = Number(dataMap.invoice?.discountedPrice || (discountPct > 0 ? (subTotal * discountPct / 100) : 0));
            const net = Number(dataMap.invoice?.net !== undefined ? dataMap.invoice?.net : (subTotal - discountedPrice));
            const btw = Number(dataMap.invoice?.btw || dataMap.invoice?.totalVat || 0);
            const total = Number(dataMap.invoice?.total || 0);
            const hasDiscount = discountPct > 0 || discountedPrice > 0;

            const breakdownCard = `
              <div class="totals-card" style="margin-left: auto; width: 300px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 16px; margin-bottom: 25px; font-size: 13px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                  <span>Subtotal (Excl. BTW):</span>
                  <span style="font-weight: 600; color: #1e293b;">${formatCurrency(subTotal)}</span>
                </div>
                ${hasDiscount ? `
                <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #dc2626;">
                  <span>Discount (${discountPct}%):</span>
                  <span style="font-weight: 600;">-${formatCurrency(discountedPrice)}</span>
                </div>
                <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569; border-top: 1px dashed #cbd5e1; margin-top: 2px; padding-top: 4px;">
                  <span>Net Taxable Base:</span>
                  <span style="font-weight: 600; color: #1e293b;">${formatCurrency(net)}</span>
                </div>
                ` : ''}
                <div class="total-row" style="display: flex; justify-content: space-between; padding: 4px 0; color: #475569;">
                  <span>BTW (Tax):</span>
                  <span style="font-weight: 600; color: #1e293b;">+${formatCurrency(btw)}</span>
                </div>
                <div class="total-row grand" style="display: flex; justify-content: space-between; border-top: 2px solid #3c50e0; margin-top: 8px; padding-top: 8px; font-size: 15px; font-weight: 800; color: #0f172a;">
                  <span>Total Amount:</span>
                  <span>${formatCurrency(total)}</span>
                </div>
              </div>
            `;
            processed = processed.replace(/<div class="totals-card"[^>]*>[\s\S]*?<\/div>\s*<\/div>/i, breakdownCard.trim());
        }

        // Sanitize any duplicated currency signs (€ €, €EUR, EUR €, $ $, etc.)
        processed = processed
            .replace(/([€$£]\s*)+([€$£])/g, '$2')
            .replace(/(EUR|USD|GBP)\s*([€$£])/gi, '$2')
            .replace(/([€$£])\s*(EUR|USD|GBP)/gi, '$1')
            .replace(/€\s*€/g, '€');

        return processed;
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

    const effectiveCompany = companyDetail || {
        companyName: 'Universal Movers B.V.',
        companyAddress: 'Starterspand, H.J.E. Wenckebachweg 53-M',
        companyState: 'Amsterdam',
        companyPostalCode: '1096 AK',
        companyCountry: 'Netherlands',
        companyEmail: 'info@universalmovers.nl',
        companyPhone: '+31 20 123 4567',
        companyWebsite: 'https://universalmovers.nl',
        companyRegNumber: '81234567',
        companyVatNumber: 'NL861234567B01',
    };

    const customerObj = data?.customer || {};
    const customerFullName = customerObj.name || `${customerObj.firstName || ''} ${customerObj.lastName || ''}`.trim() || customerObj.companyName || 'Valued Customer';
    const customerFormattedAddress = formatAddress(customerObj.address);
    const customerContactPhone = customerObj.phone || customerObj.telephone || customerObj.mobile || customerObj.contact || '';

    const modifiedHtmlContent = replacePlaceholders(data?.financialTemplate?.htmlContent, {
        customer: {
            ...customerObj,
            name: customerFullName,
            firstName: customerObj.firstName || '',
            lastName: customerObj.lastName || '',
            address: customerFormattedAddress,
            phone: customerContactPhone,
            telephone: customerContactPhone,
            mobile: customerContactPhone,
            email: customerObj.email || '',
        },
        invoice: {
            ...data,
            date: formatDutchDate(data?.date || data?.createdAt),
            dueDate: formatDutchDate(data?.dueDate || data?.expire_date || data?.tokenExpiresAt || new Date(new Date(data?.date || data?.createdAt || Date.now()).getTime() + 30 * 86400000)),
            expire_date: formatDutchDate(data?.expire_date || data?.dueDate || data?.tokenExpiresAt || new Date(new Date(data?.date || data?.createdAt || Date.now()).getTime() + 30 * 86400000)),
            validUntil: formatDutchDate(data?.validUntil || data?.dueDate || data?.expire_date || new Date(new Date(data?.date || data?.createdAt || Date.now()).getTime() + 30 * 86400000)),
        },
        company: effectiveCompany,
        currencySymbol: currencySymbol || '€',
    });

    const sendMail = async () => {
        try {
            const payload: any = {
                Id: invoiceId,
                content: 'notRequired',
            };
            if (settings?.emailTemplates?.thankyou) {
                payload.emailTemplateId = settings.emailTemplates.thankyou;
            }
            const response = await axios.post(`${apiPath}/finance/send`, payload);
            if (response.status === 200) {
                const activityData = {
                    type: 'offer',
                    title: `Quotation # ${data?.index || invoiceId} confirmation email sent`,
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

    return (
        <>
            {loading && <Loader />}
            <div className="min-h-screen bg-slate-50 dark:bg-boxdark-2 text-slate-800 dark:text-white font-sans antialiased pb-16">
                {/* Top Navigation Bar */}
                <header className="sticky top-0 z-40 bg-white/90 dark:bg-boxdark/90 backdrop-blur-md border-b border-slate-200/80 dark:border-strokedark px-4 md:px-10 py-3.5 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                        {effectiveCompany?.logoUrl ? (
                            <div className="h-10 max-w-[150px] flex items-center">
                                <img
                                    src={effectiveCompany.logoUrl}
                                    alt={effectiveCompany.companyName || 'Logo'}
                                    className="max-h-full max-w-full object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="w-10 h-10 rounded-2xl bg-primary text-white font-black text-lg flex items-center justify-center shadow-md shadow-primary/20">
                                {effectiveCompany.companyName ? effectiveCompany.companyName.charAt(0) : 'U'}
                            </div>
                        )}
                        <div>
                            <span className="font-extrabold text-sm md:text-base text-slate-900 dark:text-white tracking-tight block">
                                {effectiveCompany.companyName}
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

                        {data && (
                            <button
                                type="button"
                                onClick={downloadInvoice}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs transition-all cursor-pointer active:scale-95"
                            >
                                <DownloadOutlinedIcon style={{ fontSize: 16 }} />
                                <span>Download PDF</span>
                            </button>
                        )}
                    </div>
                </header>

                {!loading && fetchError && !data ? (
                    <main className="max-w-[700px] mx-auto px-4 py-16">
                        <div className="bg-white dark:bg-boxdark rounded-3xl p-8 md:p-12 border border-slate-200/80 dark:border-strokedark shadow-xl text-center space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                                <ErrorOutlineIcon style={{ fontSize: 36 }} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Quotation Unavailable or Expired
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
                                    {fetchError}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 dark:border-strokedark text-xs text-slate-400">
                                Need assistance? Please reach out to <span className="font-semibold text-slate-600 dark:text-slate-300">{effectiveCompany.companyName}</span> at{' '}
                                <a href={`mailto:${effectiveCompany.companyEmail}`} className="text-primary hover:underline font-semibold">
                                    {effectiveCompany.companyEmail}
                                </a>{' '}
                                or call <span className="font-semibold text-slate-600 dark:text-slate-300">{effectiveCompany.companyPhone}</span>.
                            </div>
                        </div>
                    </main>
                ) : (
                    <>
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
                            {data?.financialTemplate?.htmlContent ? (
                                <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-sm overflow-hidden">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-4 mb-5 border-b border-slate-100 dark:border-strokedark flex items-center gap-2">
                                        <ReceiptLongOutlinedIcon fontSize="small" className="text-primary" />
                                        <span>Quotation Overview</span>
                                    </div>
                                    <div
                                        className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(modifiedHtmlContent) }}
                                    />
                                </div>
                            ) : (
                                /* Fallback Quotation Document Card when no HTML template is configured */
                                <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-sm space-y-6">
                                    {/* Company & Document Header */}
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200/80 dark:border-strokedark">
                                        <div className="space-y-1">
                                            {effectiveCompany?.logoUrl ? (
                                                <img src={effectiveCompany.logoUrl} alt={effectiveCompany.companyName} className="h-10 object-contain mb-2" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-primary text-white font-black flex items-center justify-center text-lg mb-2">
                                                    {effectiveCompany.companyName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            <h2 className="text-lg font-black text-slate-900 dark:text-white">{effectiveCompany.companyName}</h2>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {effectiveCompany.companyAddress}, {effectiveCompany.companyState}, {effectiveCompany.companyCountry}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                KVK: {effectiveCompany.companyRegNumber || '81234567'} | BTW: {effectiveCompany.companyVatNumber || 'NL861234567B01'}
                                            </p>
                                        </div>

                                        <div className="text-right sm:self-auto self-start bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1 min-w-[200px]">
                                            <span className="inline-block px-2 py-0.5 rounded font-extrabold text-[10px] uppercase bg-primary/10 text-primary mb-1">
                                                Quotation #{data?.index || invoiceId}
                                            </span>
                                            <div className="flex justify-between gap-3 text-slate-500">
                                                <span>Issue Date:</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                                    {formatDutchDate(data?.date || data?.createdAt)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-3 text-slate-500">
                                                <span>Valid Until:</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                                                    {formatDutchDate(data?.dueDate || data?.expire_date || data?.tokenExpiresAt)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Client & Move Particulars */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Customer Particulars</span>
                                            <span className="font-black text-slate-900 dark:text-white text-sm block">
                                                {data?.customer?.firstName || ''} {data?.customer?.lastName || ''}
                                            </span>
                                            {data?.customer?.companyName && (
                                                <span className="font-semibold text-slate-600 dark:text-slate-300 block">{data.customer.companyName}</span>
                                            )}
                                            <span className="text-slate-500 dark:text-slate-400 block">{data?.customer?.email}</span>
                                            <span className="text-slate-500 dark:text-slate-400 block">{data?.customer?.phone || data?.customer?.telephone || ''}</span>
                                        </div>

                                        <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Relocation Address</span>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                                                {formatAddress(data?.customer?.address) || 'Customer registered address'}
                                            </p>
                                            {data?.package?.name && (
                                                <span className="inline-block mt-1 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                    Package: {data.package.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Itemized Services Table */}
                                    <div className="overflow-x-auto border border-slate-200/80 dark:border-strokedark rounded-2xl">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-100/70 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-strokedark">
                                                    <th className="py-3 px-4">Description</th>
                                                    <th className="py-3 px-4 text-center w-20">Qty</th>
                                                    <th className="py-3 px-4 text-right w-28">Price</th>
                                                    <th className="py-3 px-4 text-right w-32">Total</th>
                                                    <th className="py-3 px-4 text-right w-20">BTW %</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-strokedark">
                                                {(data?.items || []).map((item: any, idx: number) => {
                                                    const rawQty = item.quantity;
                                                    const qty = (rawQty !== undefined && rawQty !== null && rawQty !== '') ? Number(rawQty) : 0;
                                                    const price = Number(item.price) || 0;
                                                    const lineTotal = item.lineTotal !== undefined ? Number(item.lineTotal) : (qty * price);
                                                    const btw = item.btw !== undefined && item.btw !== null ? item.btw : (item.tax || 21);
                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                                            <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{item.description || 'Moving Service'}</td>
                                                            <td className="py-3 px-4 text-center font-mono font-bold text-slate-600 dark:text-slate-300">{qty}</td>
                                                            <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">{formatCurrency(price)}</td>
                                                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(lineTotal)}</td>
                                                            <td className="py-3 px-4 text-right text-slate-500 font-mono">{btw}%</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="flex justify-end">
                                        <div className="w-full sm:w-80 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs">
                                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                <span>Subtotal (Net):</span>
                                                <span className="font-mono font-bold">{formatCurrency(data?.subtotal || data?.subTotal || 0)}</span>
                                            </div>
                                            {Number(data?.discount || 0) > 0 && (
                                                <div className="flex justify-between text-rose-600 font-semibold">
                                                    <span>Discount:</span>
                                                    <span className="font-mono">- {formatCurrency(data.discount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                <span>VAT / BTW:</span>
                                                <span className="font-mono font-bold">+ {formatCurrency(data?.totalVat || 0)}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-900 dark:text-white">
                                                <span>Total Amount:</span>
                                                <span className="font-mono text-primary text-base font-black">{formatCurrency(data?.total || 0)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Belastingdienst Btw-Specificatie Table Card */}
                            {data?.taxBreakdown?.rates?.length > 0 && (
                                <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-sm space-y-4">
                                    <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 dark:border-strokedark flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ReceiptLongOutlinedIcon fontSize="small" className="text-primary" />
                                            <span>Belastingdienst Btw-Specificatie</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                                            Dutch Tax Standard
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 border-b border-slate-200/60 dark:border-strokedark font-bold">
                                                    <th className="py-2.5 px-4">Tarief (VAT Rate)</th>
                                                    <th className="py-2.5 px-4 text-right">Grondslag (Taxable Base)</th>
                                                    <th className="py-2.5 px-4 text-right">Btw-Bedrag (VAT Amount)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-strokedark font-medium">
                                                {data.taxBreakdown.rates.map((r: any, idx: number) => (
                                                    <tr key={idx}>
                                                        <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                                                            {r.rate === 0 ? '0% (Exempt / Verlegd)' : `${r.rate}% BTW`}
                                                        </td>
                                                        <td className="py-2.5 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                                                            {formatCurrency(r.taxableBase)}
                                                        </td>
                                                        <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                                                            {formatCurrency(r.vatAmount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold border-t border-slate-200 dark:border-slate-700">
                                                    <td className="py-2.5 px-4 text-slate-900 dark:text-white">Totaal BTW</td>
                                                    <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                                                        {formatCurrency(data.taxBreakdown.totalBase || 0)}
                                                    </td>
                                                    <td className="py-2.5 px-4 text-right font-mono text-primary font-black">
                                                        {formatCurrency(data.taxBreakdown.totalVat || 0)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Commercial Terms & Conditions (AVV) Card */}
                            <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-strokedark shadow-sm space-y-4">
                                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-100 dark:border-strokedark flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <VerifiedUserOutlinedIcon fontSize="small" className="text-primary" />
                                        <span>Commercial Terms & Moving Conditions</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                                        AVV 2026
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                            <CalendarTodayOutlinedIcon fontSize="small" className="text-primary" />
                                            <span>30-Day Quotation Validity</span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                                            This quotation is guaranteed and valid for 30 calendar days from issuance ({formatDutchDate(data?.date || data?.createdAt)} until {formatDutchDate(data?.dueDate || data?.expire_date || data?.tokenExpiresAt)}).
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                            <ReceiptLongOutlinedIcon fontSize="small" className="text-primary" />
                                            <span>Deposit & Payment Schedule</span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                                            A 25% booking confirmation deposit is required to secure your moving schedule. The remaining 75% balance is payable prior to or upon completion.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                            <ShieldOutlinedIcon fontSize="small" className="text-emerald-600" />
                                            <span>Relocation Transit Insurance</span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                                            Executed under the <em>Algemene Voorwaarden voor Verhuizingen (AVV)</em>. Transit cargo is insured up to €100,000 statutory valuation with standard deductible.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-1.5">
                                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                                            <AccountBalanceOutlinedIcon fontSize="small" className="text-primary" />
                                            <span>Official Banking Details</span>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed">
                                            Bank: ABN AMRO Bank N.V.<br />
                                            IBAN: NL91 ABNA 0417 1643 00<br />
                                            BIC: ABNANL2A<br />
                                            Reference: Quote #{data?.index || invoiceId}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Online Acceptance & Signature Card (Optimal Form Width ~410px) */}
                        <div className="w-full lg:w-[410px] flex-shrink-0 sticky top-22">
                            {(() => {
                                const statusLower = (data?.Status || '').toLowerCase();
                                const isDraft = statusLower === 'draft';
                                const isAccepted = statusLower === 'accepted';
                                const isRevoked = ['revoked', 'cancelled', 'declined'].includes(statusLower);

                                if (isDraft) {
                                    return (
                                        <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-amber-200 dark:border-amber-800 shadow-xl relative overflow-hidden space-y-5">
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />
                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                                <ErrorOutlineIcon fontSize="medium" />
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    Draft Quotation
                                                </h2>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                                This quotation is currently an internal draft concept and has not yet been officially issued.
                                            </p>
                                            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-100 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 font-semibold leading-relaxed">
                                                Online acceptance is strictly disabled for unissued draft quotations. Please contact Universal Movers B.V. for an official offer.
                                            </div>
                                        </div>
                                    );
                                }

                                if (isAccepted) {
                                    const acceptedDateStr = data?.acceptance?.acceptedAt
                                        ? new Date(data.acceptance.acceptedAt).toLocaleDateString('en-GB')
                                        : (data?.acceptedAt ? new Date(data.acceptedAt).toLocaleDateString('en-GB') : 'Confirmed');
                                    const acceptedByName = data?.acceptance?.customerIdentity?.name ||
                                        `${data?.customer?.firstName || ''} ${data?.customer?.lastName || ''}`.trim() || 'Client';

                                    return (
                                        <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-emerald-200 dark:border-emerald-800 shadow-xl relative overflow-hidden space-y-5">
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500" />
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                                <CheckCircleRoundedIcon fontSize="medium" />
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    Quotation Accepted
                                                </h2>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                                Thank you! This quotation has been officially accepted and confirmed.
                                            </p>
                                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-strokedark space-y-2.5 text-xs">
                                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                                    <span>Accepted By:</span>
                                                    <span className="font-bold text-slate-900 dark:text-white">{acceptedByName}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                                    <span>Confirmation Date:</span>
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white">{acceptedDateStr}</span>
                                                </div>
                                                {data?.acceptance?.acknowledgementEvent?.eventId && (
                                                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                                                        <span>Reference ID:</span>
                                                        <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
                                                            {data.acceptance.acknowledgementEvent.eventId}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={downloadInvoice}
                                                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <DownloadOutlinedIcon fontSize="small" />
                                                <span>Download Quotation PDF</span>
                                            </button>
                                        </div>
                                    );
                                }

                                if (isRevoked) {
                                    return (
                                        <div className="bg-white dark:bg-boxdark rounded-3xl p-6 md:p-8 border border-rose-200 dark:border-rose-800 shadow-xl relative overflow-hidden space-y-5">
                                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />
                                            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                                                <ErrorOutlineIcon fontSize="medium" />
                                                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    Offer Not Available
                                                </h2>
                                            </div>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                                                This quotation has been {data?.Status?.toLowerCase() || 'closed'} and can no longer be accepted. Please contact us for further assistance.
                                            </p>
                                        </div>
                                    );
                                }

                                return (
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
                                );
                            })()}
                        </div>
                    </div>
                </main>
                    </>
                )}
            </div>
        </>
    );
};

export default AcceptOffer;
