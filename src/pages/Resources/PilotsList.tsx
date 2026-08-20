import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Dialog, DialogContent, DialogActions, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Loader from '../../common/Loader';
import PilotsFrom from './Froms/PilotsFrom';
import { toast } from 'react-toastify';
import StorageLocation from './StorageLocation';
import { 
    MdWarehouse, 
    MdLocationOn, 
    MdDeleteOutline, 
    MdSearch, 
    MdToggleOn, 
    MdToggleOff, 
    MdInfoOutline,
    MdWarningAmber,
    MdHomeWork,
    MdCheckCircle,
    MdClose
} from 'react-icons/md';

const avatarColors = [
    'bg-primary text-white',
    'bg-emerald-600 text-white',
    'bg-blue-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-teal-600 text-white',
    'bg-indigo-600 text-white',
];

const getAvatarBg = (index: number) => avatarColors[index % avatarColors.length];

const PilotsList: React.FC = () => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [countries, setCountries] = useState<any>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const handleAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/api/warehouses`);
            setData(response["data"] || []);
            setSelectedStaff(null);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (agent: any, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedAgent(null);
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            const response = await axios.delete(`${apiPath}/api/warehouses/${selectedAgent._id}`);
            if (response.status === 200) {
                notify("Warehouse deleted successfully!");
                handleAllData();
                setSelectedStaff(null);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            closeDeleteModal();
            setLoading(false);
        }
    };

    const wareHouseHandlers = async (formdata: any) => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiPath}/api/warehouses/${formdata._id}`, { ...formdata });
            if (response.status === 201 || response.status === 200) {
                notify("Warehouse updated successfully!");
                handleAllData();
                setSelectedStaff(formdata);
            } else {
                notifyError(response.data.message);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/sale_group?type=country`);
            setCountries(response.data);
        } catch (err: any) {
            notifyError(`Failed to fetch Countries: ${err.message}`);
        }
    };

    useEffect(() => {
        handleAllData();
        fetchCountries();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        const query = searchTerm.toLowerCase();
        return data.filter((item: any) => 
            item.name?.toLowerCase().includes(query) ||
            item.city?.toLowerCase().includes(query) ||
            item.postcode?.toLowerCase().includes(query) ||
            item.street?.toLowerCase().includes(query)
        );
    }, [data, searchTerm]);

    if (loading && data.length === 0) {
        return <Loader />;
    }
    if (error) {
        return <div className="text-rose-500 text-center p-6 bg-rose-50 rounded-2xl border border-rose-200">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header Banner Card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-md shadow-primary/20 text-2xl">
                        <MdWarehouse />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Warehouses</h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Manage warehouse facilities, operational locations, and capacity
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-grow sm:w-64">
                        <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search warehouses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <MdClose className="text-sm" />
                            </button>
                        )}
                    </div>

                    <PilotsFrom handler={handleAllData} countries={countries} />
                </div>
            </div>

            {/* Split View Container: Table (Left) + Detail Drawer (Right) */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Left Table Container */}
                <div className={`bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden transition-all duration-300 ${
                    selectedStaff ? 'lg:w-7/12 w-full' : 'w-full'
                }`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-3.5 px-4 sm:px-6">Warehouse Name</th>
                                    <th className="py-3.5 px-4">Post Code</th>
                                    <th className="py-3.5 px-4">City</th>
                                    <th className="py-3.5 px-4">Ownership</th>
                                    <th className="py-3.5 px-4">Status</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <MdWarehouse className="text-4xl mx-auto mb-2 text-slate-300" />
                                            <p className="font-medium text-slate-600">No warehouses found</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Try searching with a different keyword or create a new warehouse</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item: any, index: number) => {
                                        const isSelected = selectedStaff?._id === item._id;
                                        const isEnabled = item.condition === 'Enable';
                                        return (
                                            <tr
                                                key={item._id || index}
                                                onClick={() => setSelectedStaff(item)}
                                                className={`group transition-all duration-150 cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-primary/5 border-l-4 border-l-primary'
                                                        : 'hover:bg-slate-50/80'
                                                }`}
                                            >
                                                {/* Name with Avatar */}
                                                <td className="py-3.5 px-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${getAvatarBg(index)} flex items-center justify-center font-bold text-xs shadow-xs`}>
                                                            {item.name ? item.name.slice(0, 2).toUpperCase() : 'WH'}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-xs text-slate-400 truncate max-w-[180px]">
                                                                {item.street} {item.houseNumber}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Post Code */}
                                                <td className="py-3.5 px-4 text-slate-600 font-medium font-mono text-xs">
                                                    {item.postcode || '—'}
                                                </td>

                                                {/* City */}
                                                <td className="py-3.5 px-4 text-slate-700 font-medium">
                                                    {item.city || '—'}
                                                </td>

                                                {/* Ownership */}
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md ${
                                                        item.isOwnWarehouse
                                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                                                            : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                                                    }`}>
                                                        {item.isOwnWarehouse ? 'Owned' : 'Rented'}
                                                    </span>
                                                </td>

                                                {/* Status Pill */}
                                                <td className="py-3.5 px-4">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                        isEnabled
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        {item.condition || 'Enable'}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 sm:px-6 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => openDeleteModal(item, e)}
                                                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Delete Warehouse"
                                                        >
                                                            <MdDeleteOutline className="text-lg" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Detail Drawer */}
                {selectedStaff && (
                    <div className="lg:w-5/12 w-full bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden sticky top-20">
                        {/* Drawer Header */}
                        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-primary/20">
                                    {selectedStaff.name ? selectedStaff.name.slice(0, 2).toUpperCase() : 'WH'}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                                        {selectedStaff.name}
                                    </h3>
                                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                        selectedStaff.condition === 'Enable'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-rose-100 text-rose-800'
                                    }`}>
                                        <span className={`w-1 h-1 rounded-full ${selectedStaff.condition === 'Enable' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                        {selectedStaff.condition || 'Enable'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => openDeleteModal(selectedStaff)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    title="Delete Warehouse"
                                >
                                    <MdDeleteOutline className="text-xl" />
                                </button>
                                <button
                                    onClick={() => setSelectedStaff(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                    title="Close Panel"
                                >
                                    <MdClose className="text-xl" />
                                </button>
                            </div>
                        </div>

                        {/* Drawer Tabs */}
                        <div className="flex border-b border-slate-100 px-5 pt-2 bg-slate-50/50 gap-4">
                            <button
                                onClick={() => setTabIndex(0)}
                                className={`py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                                    tabIndex === 0
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Overview & Shed
                            </button>
                            <button
                                onClick={() => setTabIndex(1)}
                                className={`py-2.5 font-bold text-xs uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                                    tabIndex === 1
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-400 hover:text-slate-700'
                                }`}
                            >
                                Storage Locations
                            </button>
                        </div>

                        {/* Drawer Body Content */}
                        <div className="p-5 max-h-[calc(100vh-280px)] overflow-y-auto space-y-5">
                            {tabIndex === 0 && (
                                <>
                                    {/* Quick Actions & Status Toggle */}
                                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Facility Status:</span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                                selectedStaff.condition === 'Enable' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                            }`}>
                                                {selectedStaff.condition}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => wareHouseHandlers({
                                                ...selectedStaff,
                                                condition: selectedStaff.condition === 'Enable' ? 'Disable' : 'Enable'
                                            })}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-xs cursor-pointer ${
                                                selectedStaff.condition === 'Enable'
                                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            }`}
                                        >
                                            {selectedStaff.condition === 'Enable' ? <MdToggleOff className="text-lg" /> : <MdToggleOn className="text-lg" />}
                                            <span>{selectedStaff.condition === 'Enable' ? 'Disable Facility' : 'Enable Facility'}</span>
                                        </button>
                                    </div>

                                    {/* Warehouse Info Card */}
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2">
                                            <MdInfoOutline className="text-primary text-base" />
                                            <span>Warehouse Specifications</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Warehouse Name</span>
                                                <span className="font-bold text-slate-800 text-sm">{selectedStaff.name}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Ownership</span>
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {selectedStaff.isOwnWarehouse ? 'Owned Property' : 'Rented / Third-Party'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Operational Condition</span>
                                                <span className={`font-bold text-xs px-2 py-0.5 rounded inline-block ${
                                                    selectedStaff.condition === 'Enable' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                    {selectedStaff.condition}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Postcode</span>
                                                <span className="font-bold text-slate-800 font-mono text-sm">{selectedStaff.postcode || '—'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address Card */}
                                    <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3 shadow-xs">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-100 pb-2">
                                            <MdLocationOn className="text-primary text-base" />
                                            <span>Location & Address</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-xs text-slate-700">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <MdHomeWork className="text-base" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">
                                                    {selectedStaff.street} {selectedStaff.houseNumber} {selectedStaff.addition || ''}
                                                </p>
                                                <p className="text-slate-500 font-medium mt-0.5">
                                                    {selectedStaff.city}, {selectedStaff.postcode}
                                                </p>
                                                {selectedStaff.country && (
                                                    <p className="text-slate-400 text-xs mt-0.5 font-medium">
                                                        {selectedStaff.country}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit Detail Button */}
                                    <div className="pt-2 flex justify-end">
                                        <PilotsFrom handler={handleAllData} data={selectedStaff} countries={countries} />
                                    </div>
                                </>
                            )}

                            {tabIndex === 1 && (
                                <div className="pt-1">
                                    <StorageLocation type="storage" warehouseId={selectedStaff._id} size="compact" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modern Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteModalOpen}
                onClose={closeDeleteModal}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                    }
                }}
            >
                <div className="p-6 bg-white flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-3xl mb-4">
                        <MdWarningAmber />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Confirm Warehouse Deletion
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6">
                        Are you sure you want to delete <span className="font-bold text-slate-800">{selectedAgent?.name}</span>? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={closeDeleteModal}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-sm shadow-rose-200 transition-all cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default PilotsList;

