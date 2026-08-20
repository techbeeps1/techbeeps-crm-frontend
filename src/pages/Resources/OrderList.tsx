import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { MdCalendarToday, MdBusiness, MdInbox, MdShoppingCart } from 'react-icons/md';

const OrderList: React.FC<any> = ({ type, material }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const fetchSalesGroups = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/material-stock?type=${type}&material=${material}`);
            setData(response.data || []);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesGroups();
    }, [material, type]);

    const isRegister = type === 'Register';

    return (
        <div className="space-y-3">
            {loading && <Loader />}
            
            <div className="overflow-hidden border border-slate-200/80 rounded-xl bg-white shadow-xs">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Supplier</th>
                            <th className="py-3 px-4">{isRegister ? "Received Qty" : "Order Qty"}</th>
                            <th className="py-3 px-4 text-right">{isRegister ? "Received On" : "Order On"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="py-8 text-center text-slate-400">
                                    {isRegister ? (
                                        <MdInbox className="text-3xl mx-auto mb-1 text-slate-300" />
                                    ) : (
                                        <MdShoppingCart className="text-3xl mx-auto mb-1 text-slate-300" />
                                    )}
                                    <p className="font-semibold text-slate-600">No {isRegister ? "received shipments" : "orders"} recorded</p>
                                    <p className="text-[11px] text-slate-400">Records will appear once registered</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((group: any) => {
                                const qty = isRegister ? group?.quantity || 0 : group?.orderQuantity || 0;
                                const dateVal = isRegister ? group?.receivedOn : group?.orderOn;
                                const formattedDate = dateVal ? new Date(dateVal).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
                                return (
                                    <tr key={group._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-slate-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                                                    <MdBusiness className="text-xs" />
                                                </div>
                                                <span>{group?.supplier?.name || "Unknown Supplier"}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[11px] ${
                                                isRegister 
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                                                    : 'bg-primary/10 text-primary border border-primary/20'
                                            }`}>
                                                {qty} units
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-right text-slate-500 font-medium">
                                            <span className="inline-flex items-center gap-1">
                                                <MdCalendarToday className="text-slate-400 text-xs" />
                                                {formattedDate}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrderList;

