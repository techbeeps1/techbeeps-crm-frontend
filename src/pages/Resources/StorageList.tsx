import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
    Modal,
    Box,
    Tabs,
    Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import StorageForm from './Froms/StorageForm';
import LoadingForm from './Storage/LoadingForm';
import LoadingandUnloadingForm from './Storage/LoadingandUnloadingForm';
import FreeupStorage from './Storage/FreeupStorage';
import ContractForm from './Storage/ContractForm';
import { 
    MdWarehouse, 
    MdInventory2, 
    MdPerson, 
    MdReceipt, 
    MdElevator, 
    MdCardGiftcard, 
    MdVerified,
    MdWarningAmber,
    MdOpenInNew
} from 'react-icons/md';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useNavigate } from 'react-router-dom';

const avatarColors = [
    'bg-purple-600 text-white',
    'bg-emerald-600 text-white',
    'bg-blue-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
    'bg-indigo-600 text-white',
];

const getAvatarBg = (index: number) => avatarColors[index % avatarColors.length];

const getInitials = (first?: string, last?: string, fallback?: string) => {
    if (first && last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    if (fallback) return fallback.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || 'ST';
    return 'ST';
};

const StorageList: React.FC<any> = ({ customerId }) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [warehouse, setWarehouse] = useState<any>([]);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
        key: 'storageCode',
        direction: 'asc'
    });

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const handleChange = (event: any, newValue: any) => {
        if (event && event.preventDefault) event.preventDefault();
        setTabIndex(newValue);
    };
    let navigate = useNavigate();

    const handleAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/api/storages?customer=${customerId || ''}`);
            const storageItems = response["data"] || [];
            setData(storageItems);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (agent: any) => {
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedAgent(null);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await axios.delete(`${apiPath}/api/storages/${selectedAgent._id}`);
            if (response.status === 200) {
                notify("Storage unit deleted successfully!");
                handleAllData();
                setSelectedStaff(null);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            setIsDeleting(false);
            closeDeleteModal();
        }
    };

    const wareHouseHandlers = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/warehouses`);
            if (response.status === 201 || response.status === 200) {
                setWarehouse(response.data || []);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        }
    };

    function formatDate(date: any) {
        if (!date) return "N/A";
        const d = new Date(date);
        if (isNaN(d.getTime())) return "N/A";
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    }

    useEffect(() => {
        handleAllData();
        wareHouseHandlers();
    }, [customerId]);

    const handleSort = (key: string) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const filteredData = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return data.filter((item: any) => {
            const code = (item?.storageCode || '').toLowerCase();
            const type = (item?.storageType || '').toLowerCase();
            const customerName = `${item?.customer?.firstName || ''} ${item?.customer?.lastName || ''}`.toLowerCase();
            const email = (item?.customer?.email || '').toLowerCase();
            const contact = (item?.customer?.contact || item?.customer?.mobile || '').toLowerCase();
            const warehouseName = (item?.warehouse?.name || item?.warehouse?.city || '').toLowerCase();
            const country = (item?.customer?.address?.[0]?.country || '').toLowerCase();
            const query = searchTerm.toLowerCase();

            return (
                code.includes(query) ||
                type.includes(query) ||
                customerName.includes(query) ||
                email.includes(query) ||
                contact.includes(query) ||
                warehouseName.includes(query) ||
                country.includes(query)
            );
        });
    }, [data, searchTerm]);

    const sortedData = useMemo(() => {
        const sorted = [...filteredData];
        if (!sortConfig.key) return sorted;

        sorted.sort((a: any, b: any) => {
            let valA: any = '';
            let valB: any = '';

            if (sortConfig.key === 'storageCode') {
                valA = a?.storageCode || '';
                valB = b?.storageCode || '';
            } else if (sortConfig.key === 'name') {
                valA = a?.customer?.firstName ? `${a.customer.firstName} ${a.customer.lastName || ''}` : a?.storageCode || '';
                valB = b?.customer?.firstName ? `${b.customer.firstName} ${b.customer.lastName || ''}` : b?.storageCode || '';
            } else if (sortConfig.key === 'email') {
                valA = a?.customer?.email || a?.storageType || '';
                valB = b?.customer?.email || b?.storageType || '';
            } else if (sortConfig.key === 'contact') {
                valA = a?.customer?.contact || a?.customer?.mobile || a?.cubicMeter || '';
                valB = b?.customer?.contact || b?.customer?.mobile || b?.cubicMeter || '';
            } else if (sortConfig.key === 'country') {
                valA = a?.customer?.address?.[0]?.country || a?.warehouse?.city || a?.warehouse?.name || '';
                valB = b?.customer?.address?.[0]?.country || b?.warehouse?.city || b?.warehouse?.name || '';
            }

            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [filteredData, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / entriesPerPage) || 1;
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * entriesPerPage;
        return sortedData.slice(startIndex, startIndex + entriesPerPage);
    }, [sortedData, currentPage, entriesPerPage]);

    if (loading && data.length === 0) {
        return <Loader />;
    }
    if (error) {
        return (
            <div className="w-full max-w-6xl mx-auto py-8 px-4 text-center">
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 inline-block text-xs font-semibold">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto py-2 px-1 sm:px-2 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                <div className={`w-full ${selectedStaff ? 'lg:w-7/12' : 'w-full'} bg-white rounded-2xl border border-slate-200/80 shadow-sm transition-all duration-300 overflow-hidden`}>
                    
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                                <MdWarehouse className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Storage Units</h2>
                                <p className="text-xs text-slate-500">Manage storage spaces and allocations</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{ fontSize: 18 }} />
                                <input
                                    type="text"
                                    placeholder="Search storage, customer..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                />
                            </div>

                            {!customerId && (
                                <StorageForm handler={handleAllData} warehouse={warehouse} />
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50 select-none">
                                    <th
                                        onClick={() => handleSort('storageCode')}
                                        className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>NUMBER</span>
                                            <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('name')}
                                        className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>NAME</span>
                                            <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('email')}
                                        className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>EMAIL</span>
                                            <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('contact')}
                                        className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>CONTACT</span>
                                            <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                        </div>
                                    </th>
                                    <th
                                        onClick={() => handleSort('country')}
                                        className="py-3.5 px-4 text-left cursor-pointer hover:bg-slate-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-1">
                                            <span>COUNTRY</span>
                                            <UnfoldMoreIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                        </div>
                                    </th>
                                    <th className="py-3.5 px-4 text-center">ACTION</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: any, index: number) => {
                                        const isSelected = selectedStaff?._id === item._id;
                                        const initials = getInitials(
                                            item?.customer?.firstName,
                                            item?.customer?.lastName,
                                            item?.storageCode
                                        );
                                        const avatarBg = getAvatarBg(index);
                                        const countryName = item?.customer?.address?.[0]?.country || 
                                            item?.warehouse?.country || 
                                            item?.warehouse?.city || 
                                            item?.warehouse?.name || 
                                            (item?.storageStatus === 'free' ? 'Available' : 'In Use');

                                        return (
                                            <tr
                                                key={item._id || index}
                                                onClick={() => setSelectedStaff(item)}
                                                className={`group transition-colors cursor-pointer ${
                                                    isSelected ? 'bg-indigo-50/70 font-medium' : 'hover:bg-slate-50/70'
                                                }`}
                                            >
                                                <td className="py-3.5 px-4 font-semibold text-xs text-slate-500">
                                                    #{item?.storageCode || index + 1}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0 ${avatarBg}`}>
                                                            {initials}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-slate-800 group-hover:text-primary transition-colors capitalize">
                                                                {item?.customer?.firstName 
                                                                    ? `${item.customer.firstName} ${item.customer.lastName || ''}`
                                                                    : `${item?.storageCode} (${item?.storageType})`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4 text-slate-600">
                                                    {item?.customer?.email ? (
                                                        <div className="flex items-center gap-2">
                                                            <EmailIcon style={{ fontSize: 16 }} className="text-slate-400" />
                                                            <span className="truncate max-w-[180px]">{item.customer.email}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-400 italic text-xs">
                                                            <EmailIcon style={{ fontSize: 16 }} className="text-slate-300" />
                                                            <span>{item?.storageType ? `${item.storageType} Unit` : 'No email'}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-slate-600">
                                                    {item?.customer?.contact || item?.customer?.mobile ? (
                                                        <div className="flex items-center gap-2">
                                                            <PhoneIcon style={{ fontSize: 16 }} className="text-slate-400" />
                                                            <span>{item?.customer?.contact || item?.customer?.mobile}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                                                            <PhoneIcon style={{ fontSize: 16 }} className="text-slate-300" />
                                                            <span className="font-semibold text-slate-700">{item?.cubicMeter ? `${item.cubicMeter} m³` : 'No contact'}</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                                        <PublicIcon style={{ fontSize: 14 }} className="text-slate-400" />
                                                        <span>{countryName}</span>
                                                    </span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => setSelectedStaff(item)}
                                                            title="View Details"
                                                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm cursor-pointer"
                                                        >
                                                            <RemoveRedEyeIcon style={{ fontSize: 18 }} />
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openDeleteModal(item);
                                                            }}
                                                            title="Delete Storage Unit"
                                                            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm cursor-pointer"
                                                        >
                                                            <DeleteIcon style={{ fontSize: 18 }} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                            No storage units found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {sortedData.length > entriesPerPage && (
                        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                            <span>
                                Showing {(currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, sortedData.length)} of {sortedData.length} entries
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <KeyboardArrowLeftIcon style={{ fontSize: 18 }} />
                                </button>
                                <span className="px-2.5 font-bold text-slate-700">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                                >
                                    <KeyboardArrowRightIcon style={{ fontSize: 18 }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {selectedStaff && (
                    <div className="w-full lg:w-5/12 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                        {selectedStaff.storageCode}
                                    </h3>
                                    <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                                        {selectedStaff.storageType}
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                        selectedStaff.storageStatus === 'free' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                                    }`}>
                                        {selectedStaff.storageStatus}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Total Capacity: <span className="font-bold text-slate-700">{selectedStaff.cubicMeter} m³</span></p>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                                <div className="text-right">
                                    <span className="text-xs font-bold text-slate-700 block">Filled: {selectedStaff.percentageFill || 0}%</span>
                                    <div className="w-28 bg-slate-200 h-2.5 rounded-full overflow-hidden mt-1">
                                        <div 
                                            className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${Math.min(selectedStaff.percentageFill || 0, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedStaff(null)}
                                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                                >
                                    <CloseIcon fontSize="small" />
                                </button>
                            </div>
                        </div>

                        <div className="border-b border-slate-200">
                            <Tabs 
                                value={tabIndex} 
                                onChange={handleChange}
                                sx={{
                                    '& .MuiTab-root': {
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        textTransform: 'none',
                                        color: '#64748b',
                                        '&.Mui-selected': {
                                            color: '#4f46e5'
                                        }
                                    },
                                    '& .MuiTabs-indicator': {
                                        backgroundColor: '#4f46e5',
                                        height: 3,
                                        borderRadius: '3px 3px 0 0'
                                    }
                                }}
                            >
                                <Tab label="Overview" />
                                <Tab label={`Items (${selectedStaff?.events?.length || 0})`} />
                                <Tab label={`Costs (${selectedStaff?.costAction?.length || 0})`} />
                            </Tabs>
                        </div>

                        {tabIndex === 0 && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center gap-2.5 p-3 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    {selectedStaff.storageStatus === 'free' ? (
                                        <LoadingForm storageData={selectedStaff} handler={handleAllData} />
                                    ) : (
                                        <>
                                            <LoadingandUnloadingForm storageData={selectedStaff} handler={handleAllData} />
                                            <FreeupStorage storage={selectedStaff} handler={handleAllData} />
                                        </>
                                    )}
                                    <StorageForm data={selectedStaff} warehouse={warehouse} handler={handleAllData} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MdInventory2 className="w-5 h-5 text-indigo-600" />
                                            <h4 className="text-sm font-bold text-slate-900">Unit Specifications</h4>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                <span className="text-slate-500 font-medium">Storage Code</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.storageCode}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                <span className="text-slate-500 font-medium">Ownership</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.selfOwned ? "Self Owned" : "Rented"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                <span className="text-slate-500 font-medium">Storage Type</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.storageType}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-slate-500 font-medium">Volume Capacity</span>
                                                <span className="font-bold text-indigo-600">{selectedStaff?.cubicMeter} m³</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/60 rounded-2xl border border-slate-200/80 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <MdWarehouse className="w-5 h-5 text-sky-600" />
                                            <h4 className="text-sm font-bold text-slate-900">Warehouse Location</h4>
                                        </div>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                <span className="text-slate-500 font-medium">Warehouse</span>
                                                <span className="font-bold text-slate-800">{selectedStaff.warehouse?.name || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                                                <span className="text-slate-500 font-medium">Location Code</span>
                                                <span className="font-bold text-slate-800">{selectedStaff.storageLocation?.name || 'N/A'}</span>
                                            </div>
                                            <div className="py-1">
                                                <span className="text-slate-500 font-medium block mb-0.5">Address:</span>
                                                <span className="font-semibold text-slate-700">{`${selectedStaff.warehouse?.houseNumber || ''} ${selectedStaff.warehouse?.addition || ""} ${selectedStaff.warehouse?.street || ''}, ${selectedStaff.warehouse?.city || ''} ${selectedStaff.warehouse?.postcode || ''}`}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50/40 rounded-2xl border border-slate-200/60 p-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Notes</h4>
                                    <p className="text-xs text-slate-700 leading-relaxed">{selectedStaff.notes || "No special notes recorded."}</p>
                                </div>
                                {selectedStaff?.customer && (
                                    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                            <div className="flex items-center gap-2">
                                                <MdReceipt className="w-5 h-5 text-indigo-600" />
                                                <h4 className="text-sm font-bold text-slate-900">Contract & Billing Terms</h4>
                                            </div>
                                            <ContractForm storageData={selectedStaff} handler={handleAllData} />
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <span className="text-slate-400 font-medium block">Customer</span>
                                                <span className="font-bold text-slate-900 mt-0.5 block">{selectedStaff?.customer?.firstName} {selectedStaff?.customer?.lastName}</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <span className="text-slate-400 font-medium block">Start Date</span>
                                                <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(selectedStaff.invoicingStartDate)}</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <span className="text-slate-400 font-medium block">Last Invoiced</span>
                                                <span className="font-bold text-slate-900 mt-0.5 block">{formatDate(selectedStaff?.lastInvoicedDate)}</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <span className="text-slate-400 font-medium block">Price</span>
                                                <span className="font-bold text-indigo-600 mt-0.5 block">${selectedStaff.price || '00'}</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded-xl">
                                                <span className="text-slate-400 font-medium block">Billing Period</span>
                                                <span className="font-bold text-slate-900 mt-0.5 block">{selectedStaff.invoicingPeriod || 'Monthly'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {tabIndex === 1 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="p-3 text-left border-b border-slate-200">Description</th>
                                            <th className="p-3 text-left border-b border-slate-200">Item Code</th>
                                            <th className="p-3 text-left border-b border-slate-200">Contents</th>
                                            <th className="p-3 text-left border-b border-slate-200">Loaded On</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedStaff?.events?.map((item: any, index: number) => (
                                            <tr key={index} className="hover:bg-slate-50/80 text-xs">
                                                <td className="p-3 font-bold text-slate-800">{item.description}</td>
                                                <td className="p-3 font-semibold text-indigo-600">{item.itemCode}</td>
                                                <td className="p-3 font-semibold text-slate-700">{item.contents} m³</td>
                                                <td className="p-3 text-slate-500 whitespace-nowrap">{formatDate(item.loadedOn)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {tabIndex === 2 && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="p-3 text-left border-b border-slate-200">Description</th>
                                            <th className="p-3 text-left border-b border-slate-200">Date</th>
                                            <th className="p-3 text-left border-b border-slate-200">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {selectedStaff?.costAction?.map((item: any, index: number) => (
                                            <tr key={index} className="hover:bg-slate-50/80 text-xs">
                                                <td className="p-3 font-bold text-slate-800">{item?.description}</td>
                                                <td className="p-3 text-slate-500">{formatDate(item?.actionDate)}</td>
                                                <td className="p-3 font-bold text-emerald-600">${item?.price}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
                <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeDeleteModal}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 z-10">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
                            <MdWarningAmber className="w-7 h-7" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 text-center mb-1">Delete Unit</h3>
                        <p className="text-xs text-slate-500 text-center mb-6">Are you sure you want to delete {selectedAgent?.storageCode}? This action cannot be undone.</p>
                        <div className="flex items-center justify-center gap-3">
                            <button onClick={closeDeleteModal} className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
                            <button onClick={confirmDelete} disabled={isDeleting} className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all">{isDeleting ? "Deleting..." : "Delete"}</button>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default StorageList;
