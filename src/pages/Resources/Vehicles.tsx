import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import VehicleForm from './Froms/VehicleForm';
import { 
    MdDirectionsCar, 
    MdLocalShipping, 
    MdElevator, 
    MdDeleteOutline, 
    MdSearch, 
    MdWarningAmber, 
    MdClose, 
    MdBuild, 
    MdCreditCard, 
    MdBadge, 
    MdInfoOutline,
    MdCalendarToday,
    MdAttachMoney,
    MdSpeed,
    MdRoute
} from 'react-icons/md';

const avatarColors = [
    'bg-primary text-white',
    'bg-blue-600 text-white',
    'bg-emerald-600 text-white',
    'bg-amber-600 text-white',
    'bg-rose-600 text-white',
    'bg-indigo-600 text-white',
    'bg-teal-600 text-white',
];

const getAvatarBg = (index: number) => avatarColors[index % avatarColors.length];

const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
        case 'truck':
            return MdLocalShipping;
        case 'movingLift':
            return MdElevator;
        default:
            return MdDirectionsCar;
    }
};

const Vehicles: React.FC<{ type: string }> = ({ type }) => {
    const [data, setData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);
    const [selectedAgent, setSelectedAgent] = useState<any>(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [tabIndex, setTabIndex] = useState<number>(0);
    const [license, setLicense] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const handleAllData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/api/vehicles`);
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
            const response = await axios.delete(`${apiPath}/api/vehicles/${selectedAgent._id}`);
            if (response.status === 200) {
                notify("Vehicle deleted successfully!");
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

    const fetchInputs = async (inputCategory: string) => {
        try {
            const response = await axios.get(`${apiPath}/api/sale_group?type=${inputCategory}`);
            if (inputCategory === 'Licence') setLicense(response.data);
        } catch (err: any) {
            notifyError(`Failed to fetch license inputs: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchInputs('Licence');
        handleAllData();
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return data;
        const query = searchTerm.toLowerCase();
        return data.filter((item: any) => 
            item.name?.toLowerCase().includes(query) ||
            item.licensePlate?.toLowerCase().includes(query) ||
            item.model?.toLowerCase().includes(query)
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
            {/* Header Banner */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white flex items-center justify-center shadow-md shadow-primary/20 text-2xl">
                        <MdDirectionsCar />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Fleet & Vehicles</h2>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Manage fleet cars, trucks, lifts, maintenance schedules & fuel cards
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-grow sm:w-64">
                        <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search vehicles, plates..."
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

                    <VehicleForm handler={handleAllData} license={license} />
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
                                    <th className="py-3.5 px-4 sm:px-6">Vehicle Name</th>
                                    <th className="py-3.5 px-4">License Plate</th>
                                    <th className="py-3.5 px-4">Model & Fuel</th>
                                    <th className="py-3.5 px-4">Capacity / Extra</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-slate-400">
                                            <MdDirectionsCar className="text-4xl mx-auto mb-2 text-slate-300" />
                                            <p className="font-medium text-slate-600">No vehicles found</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Add a new vehicle to build your fleet</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((item: any, index: number) => {
                                        const isSelected = selectedStaff?._id === item._id;
                                        const VehicleIcon = getVehicleIcon(item.vehicleType);
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
                                                {/* Vehicle Name with Icon */}
                                                <td className="py-3.5 px-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${getAvatarBg(index)} flex items-center justify-center font-bold text-sm shadow-xs`}>
                                                            <VehicleIcon className="text-base" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                                                                {item.name}
                                                            </div>
                                                            <div className="text-xs text-slate-400 capitalize">
                                                                {item.vehicleType || 'Vehicle'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* License Plate */}
                                                <td className="py-3.5 px-4">
                                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-md font-mono text-xs font-bold tracking-wider">
                                                        {item.licensePlate || '—'}
                                                    </span>
                                                </td>

                                                {/* Model & Fuel */}
                                                <td className="py-3.5 px-4 text-slate-600 text-xs">
                                                    <div className="font-medium text-slate-800">{item.model || '—'}</div>
                                                    <div className="text-slate-400">{item.fuelType || 'Fuel: Standard'}</div>
                                                </td>

                                                {/* Extra / Capacity */}
                                                <td className="py-3.5 px-4">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                                                        {item?.vehicleType === 'movingLift'
                                                            ? `${item?.floors || 0} Floors`
                                                            : `${item?.contents || 0} m³`}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-3.5 px-4 sm:px-6 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => openDeleteModal(item, e)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                                        title="Delete Vehicle"
                                                    >
                                                        <MdDeleteOutline className="text-lg" />
                                                    </button>
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
                                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-primary/20">
                                    {React.createElement(getVehicleIcon(selectedStaff.vehicleType))}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                                        {selectedStaff.name}
                                    </h3>
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-mono text-xs font-bold">
                                        {selectedStaff.licensePlate}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => openDeleteModal(selectedStaff)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    title="Delete Vehicle"
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

                        {/* Modern Tab Bar */}
                        <div className="px-5 pt-3 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
                            <button
                                type="button"
                                onClick={() => setTabIndex(0)}
                                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    tabIndex === 0
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <MdDirectionsCar className="text-sm" />
                                <span>Vehicle Overview</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabIndex(1)}
                                className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                    tabIndex === 1
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <MdRoute className="text-sm" />
                                <span>Trip Registration</span>
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="p-5 max-h-[calc(100vh-280px)] overflow-y-auto space-y-5">
                            {tabIndex === 0 && (
                                <div className="space-y-4">
                                    {/* Action buttons */}
                                    <div className="flex items-center justify-between pb-1">
                                        <button
                                            type="button"
                                            onClick={() => openDeleteModal(selectedStaff)}
                                            className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all cursor-pointer"
                                        >
                                            Remove Vehicle
                                        </button>
                                        <VehicleForm data={selectedStaff} handler={handleAllData} license={license} />
                                    </div>

                                    {/* Specifications Card */}
                                    <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-2">
                                            <MdInfoOutline className="text-primary text-base" />
                                            <span>Vehicle Specifications</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Price / Km</span>
                                                <span className="font-bold text-slate-800 text-sm">
                                                    ${selectedStaff?.pricePerKilometer || '0.00'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Price / Hour</span>
                                                <span className="font-bold text-slate-800 text-sm">
                                                    ${selectedStaff?.pricePerHour || '0.00'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Model</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.model || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Fuel Type</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.fuelType || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Transmission</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.transmissionType || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Purchase Date</span>
                                                <span className="font-bold text-slate-800">
                                                    {selectedStaff?.purchasingDate ? new Date(selectedStaff.purchasingDate).toLocaleDateString('en-GB') : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Tow Bar</span>
                                                <span className={`font-bold text-xs px-2 py-0.5 rounded inline-block ${
                                                    selectedStaff?.isTowBar ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {selectedStaff?.isTowBar ? 'YES' : 'NO'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Cargo Capacity</span>
                                                <span className="font-bold text-slate-800">
                                                    {selectedStaff?.vehicleType === 'movingLift' ? `${selectedStaff?.floors} Floors` : `${selectedStaff?.contents || 0} m³`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Driving Licenses Card */}
                                    <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-2">
                                            <MdBadge className="text-primary text-base" />
                                            <span>Required Driving Licenses</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {selectedStaff?.requiredLicense && selectedStaff.requiredLicense.length > 0 ? (
                                                selectedStaff.requiredLicense.map((item: any) => (
                                                    <span
                                                        key={item}
                                                        className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-lg border border-primary/20 shadow-2xs"
                                                    >
                                                        {item}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">No licenses linked</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Maintenance Schedule Card */}
                                    <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-2">
                                            <MdBuild className="text-primary text-base" />
                                            <span>Maintenance & Inspection</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Dealer</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.maintenance?.dealer || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Leasing Company</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.maintenance?.leasingCompany || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Next Inspection</span>
                                                <span className="font-bold text-slate-800">
                                                    {selectedStaff?.maintenance?.nextInspection ? new Date(selectedStaff?.maintenance?.nextInspection).toLocaleDateString('en-GB') : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Maintenance Due</span>
                                                <span className="font-bold text-slate-800">
                                                    {selectedStaff?.maintenance?.maintenanceRequired ? new Date(selectedStaff?.maintenance?.maintenanceRequired).toLocaleDateString('en-GB') : '—'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fuel Card Card */}
                                    <div className="bg-slate-50/70 rounded-xl border border-slate-200/80 p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider border-b border-slate-200/60 pb-2">
                                            <MdCreditCard className="text-primary text-base" />
                                            <span>Assigned Fuel Card</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Card Supplier</span>
                                                <span className="font-bold text-slate-800">{selectedStaff?.fuelCard?.supplier || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">Card Number</span>
                                                <span className="font-bold text-slate-800 font-mono">
                                                    {selectedStaff?.fuelCard?.cardNumber ? `•••• ${selectedStaff.fuelCard.cardNumber.slice(-4)}` : '—'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">CVC</span>
                                                <span className="font-bold text-slate-800 font-mono">{selectedStaff?.fuelCard?.cvc || '—'}</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block font-medium mb-0.5">PIN</span>
                                                <span className="font-bold text-slate-800 font-mono">••••</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tabIndex === 1 && (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <MdRoute className="text-4xl mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm font-semibold text-slate-700">Trip Registration Module</p>
                                    <p className="text-xs text-slate-400 mt-0.5">Track odometer readings and route trips for this vehicle</p>
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
                        Confirm Vehicle Deletion
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mb-6">
                        Are you sure you want to delete vehicle <span className="font-bold text-slate-800">{selectedAgent?.name}</span>?
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

export default Vehicles;

