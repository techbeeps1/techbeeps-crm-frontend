import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';
import { 
    MdDirectionsCar, 
    MdLocalShipping, 
    MdElevator, 
    MdAdd, 
    MdEdit, 
    MdCheck, 
    MdCreditCard, 
    MdBuild, 
    MdBadge, 
    MdArrowForward, 
    MdArrowBack 
} from 'react-icons/md';

const VehicleForm: React.FC<any> = ({ license, data, handler }) => {
    const { control, handleSubmit, reset, setValue, formState: { errors }, watch } = useForm<any>();
    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    useEffect(() => {
        if (data) {
            reset(data);
            const formatDateForInput = (dateString: any) => {
                if (!dateString) return '';
                const date = new Date(dateString);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            };
            setValue('purchasingDate', formatDateForInput(data?.purchasingDate));
            setValue('maintenance.nextInspection', formatDateForInput(data?.maintenance?.nextInspection));
            setValue('maintenance.maintenanceRequired', formatDateForInput(data?.maintenance?.maintenanceRequired));
        }
    }, [reset, data, setValue]);

    const isTowBar = watch('isTowBar');
    const vehicleType = watch('vehicleType');

    const handleNext = () => {
        handleSubmit(() => {
            setActiveStep((prev) => prev + 1);
        })();
    };
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleClose = () => {
        setOpen(false);
        setActiveStep(0);
        reset();
    };

    const steps = [
        { label: 'Vehicle Specs', icon: MdDirectionsCar },
        { label: 'Driving License', icon: MdBadge },
        { label: 'Maintenance', icon: MdBuild },
        { label: 'Fuel Card', icon: MdCreditCard },
    ];

    const onSubmit = (formData: any) => {
        vehicleHandlers(formData);
    };

    const vehicleHandlers = async (formData: any) => {
        setLoading(true);
        let path = `${apiPath}/api/vehicles`;
        if (data && data._id) {
            path = `${path}/${data?._id}`;
        }
        try {
            const response = await axios.post(path, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 201 || response.status === 200) {
                notify("Vehicle saved successfully!");
                handler();
                setOpen(false);
                setActiveStep(0);
                reset();
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

    return (
        <>
            {data ? (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all duration-200 shadow-xs cursor-pointer"
                >
                    <MdEdit className="text-base" />
                    <span>Edit Vehicle</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-opacity-90 rounded-xl transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md cursor-pointer"
                >
                    <MdAdd className="text-lg" />
                    <span>New Vehicle</span>
                </button>
            )}

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                    },
                }}
            >
                <div className="bg-white flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                                <MdDirectionsCar className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {data ? 'Update' : 'Create New'} Vehicle
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Configure vehicle fleet specifications, licenses, maintenance & fuel card
                                </p>
                            </div>
                        </div>
                        <IconButton
                            onClick={handleClose}
                            size="small"
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>

                    {/* Stepper Header */}
                    <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = activeStep > index;
                            const isCurrent = activeStep === index;
                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        if (index <= activeStep) setActiveStep(index);
                                    }}
                                    disabled={index > activeStep}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                                        isCurrent
                                            ? 'bg-primary text-white shadow-xs'
                                            : isCompleted
                                            ? 'bg-primary/5 text-primary hover:bg-primary/10 cursor-pointer'
                                            : 'text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        isCurrent
                                            ? 'bg-white text-primary'
                                            : isCompleted
                                            ? 'bg-primary/20 text-primary'
                                            : 'bg-slate-200 text-slate-500'
                                    }`}>
                                        {isCompleted ? <MdCheck className="text-xs" /> : index + 1}
                                    </div>
                                    <StepIcon className="text-sm" />
                                    <span>{step.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Step Body */}
                    <DialogContent className="px-6 py-5 max-h-[calc(100vh-280px)] overflow-y-auto">
                        {loading && <Loader />}

                        <form onSubmit={handleSubmit(onSubmit)} id="vehicle-form" className="space-y-4">
                            {/* Step 0: Vehicle Specs */}
                            {activeStep === 0 && (
                                <div className="space-y-4">
                                    {/* Vehicle Type Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            Vehicle Classification <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Controller
                                                name="vehicleType"
                                                rules={{ required: "Vehicle classification is required" }}
                                                control={control}
                                                defaultValue="vehicle"
                                                render={({ field }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange('vehicle')}
                                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            field.value === 'vehicle'
                                                                ? 'bg-primary text-white border-primary shadow-xs'
                                                                : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <MdDirectionsCar className="text-base" />
                                                        <span>Passenger / Van</span>
                                                    </button>
                                                )}
                                            />
                                            <Controller
                                                name="vehicleType"
                                                control={control}
                                                render={({ field }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange('truck')}
                                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            field.value === 'truck'
                                                                ? 'bg-primary text-white border-primary shadow-xs'
                                                                : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <MdLocalShipping className="text-base" />
                                                        <span>Freight Truck</span>
                                                    </button>
                                                )}
                                            />
                                            <Controller
                                                name="vehicleType"
                                                control={control}
                                                render={({ field }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange('movingLift')}
                                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            field.value === 'movingLift'
                                                                ? 'bg-primary text-white border-primary shadow-xs'
                                                                : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <MdElevator className="text-base" />
                                                        <span>Moving Lift</span>
                                                    </button>
                                                )}
                                            />
                                        </div>
                                        {errors.vehicleType && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.vehicleType.message)}</p>}
                                    </div>

                                    {/* Primary Specs Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Vehicle Name / Identifier <span className="text-rose-500">*</span>
                                            </label>
                                            <Controller
                                                name="name"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Vehicle Name is required" }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. Ford Transit Fleet 01"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                License Plate <span className="text-rose-500">*</span>
                                            </label>
                                            <Controller
                                                name="licensePlate"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "License Plate is required" }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. AB-123-CD"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {errors.licensePlate && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.licensePlate.message)}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Price Per Kilometer ($) <span className="text-rose-500">*</span>
                                            </label>
                                            <Controller
                                                name="pricePerKilometer"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Price per km is required" }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="number"
                                                        step="any"
                                                        placeholder="0.00"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {errors.pricePerKilometer && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.pricePerKilometer.message)}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Price Per Hour ($) <span className="text-rose-500">*</span>
                                            </label>
                                            <Controller
                                                name="pricePerHour"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Price per hour is required" }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="number"
                                                        step="any"
                                                        placeholder="0.00"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {errors.pricePerHour && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.pricePerHour.message)}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Model</label>
                                            <Controller
                                                name="model"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. 2024 Turbo Edition"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Fuel Type</label>
                                            <Controller
                                                name="fuelType"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <select
                                                        {...field}
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    >
                                                        <option value="">Select Fuel</option>
                                                        <option value="Petrol">Petrol</option>
                                                        <option value="Diesel">Diesel</option>
                                                        <option value="Electric">Electric</option>
                                                        <option value="Hydrogen">Hydrogen</option>
                                                        <option value="Unknown">Unknown</option>
                                                    </select>
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Transmission Type</label>
                                            <Controller
                                                name="transmissionType"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <select
                                                        {...field}
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    >
                                                        <option value="">Select Transmission</option>
                                                        <option value="Automatic">Automatic</option>
                                                        <option value="Manual">Manual</option>
                                                        <option value="Unknown">Unknown</option>
                                                    </select>
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Date of Purchasing</label>
                                            <Controller
                                                name="purchasingDate"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="date"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Tow bar Toggle */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                            Tow Bar Attached?
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Controller
                                                name="isTowBar"
                                                control={control}
                                                defaultValue={false}
                                                render={({ field }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange(true)}
                                                        className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            field.value
                                                                ? 'bg-primary text-white border-primary shadow-xs'
                                                                : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        Yes
                                                    </button>
                                                )}
                                            />
                                            <Controller
                                                name="isTowBar"
                                                control={control}
                                                defaultValue={false}
                                                render={({ field }) => (
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange(false)}
                                                        className={`py-2 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                                            !field.value
                                                                ? 'bg-primary text-white border-primary shadow-xs'
                                                                : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        No
                                                    </button>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {isTowBar && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Draw Weight (kg) <span className="text-rose-500">*</span>
                                            </label>
                                            <Controller
                                                name="drawWeight"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Draw weight is required" }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="number"
                                                        placeholder="e.g. 2500"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {errors.drawWeight && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.drawWeight.message)}</p>}
                                        </div>
                                    )}

                                    {/* Type specific dimensions */}
                                    {vehicleType === 'movingLift' && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                    Max Floors <span className="text-rose-500">*</span>
                                                </label>
                                                <Controller
                                                    name="floors"
                                                    control={control}
                                                    defaultValue=""
                                                    rules={{ required: "Floors is required", pattern: { value: /^[0-9]+$/, message: "Must be a number" } }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="e.g. 8"
                                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        />
                                                    )}
                                                />
                                                {errors.floors && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.floors.message)}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                    Length (m) <span className="text-rose-500">*</span>
                                                </label>
                                                <Controller
                                                    name="length"
                                                    control={control}
                                                    defaultValue=""
                                                    rules={{ required: "Length is required" }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="Length in meters"
                                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        />
                                                    )}
                                                />
                                                {errors.length && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.length.message)}</p>}
                                            </div>
                                        </div>
                                    )}

                                    {vehicleType === 'truck' && (
                                        <div className="space-y-4 pt-2 border-t border-slate-100">
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Length (m) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <Controller
                                                        name="length"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{ required: "Length is required" }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="L"
                                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            />
                                                        )}
                                                    />
                                                    {errors.length && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.length.message)}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Width (m) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <Controller
                                                        name="width"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{ required: "Width is required" }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="W"
                                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            />
                                                        )}
                                                    />
                                                    {errors.width && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.width.message)}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Height (m) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <Controller
                                                        name="height"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{ required: "Height is required" }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="H"
                                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            />
                                                        )}
                                                    />
                                                    {errors.height && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.height.message)}</p>}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Cargo Contents / Capacity <span className="text-rose-500">*</span>
                                                    </label>
                                                    <Controller
                                                        name="contents"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{ required: "Contents is required" }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="e.g. 20 m³"
                                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            />
                                                        )}
                                                    />
                                                    {errors.contents && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.contents.message)}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                                        Tail Lift Length (m) <span className="text-rose-500">*</span>
                                                    </label>
                                                    <Controller
                                                        name="tailLiftLength"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{ required: "Tail lift length is required" }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="Tail Lift Length"
                                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                            />
                                                        )}
                                                    />
                                                    {errors.tailLiftLength && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.tailLiftLength.message)}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {vehicleType === 'vehicle' && (
                                        <div className="pt-2 border-t border-slate-100">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Cargo Contents / Capacity <span className="text-rose-500">*</span>
                                            </label>
                                            <Controller
                                                name="contents"
                                                control={control}
                                                defaultValue=""
                                                rules={{ required: "Contents is required" }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. 5 Passengers / 2m³ luggage"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {errors.contents && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.contents.message)}</p>}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 1: Driving license */}
                            {activeStep === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                            Required Driving Licenses <span className="text-rose-500">*</span>
                                        </label>
                                        <p className="text-xs text-slate-500 mb-4">
                                            Select all driver license classes eligible to operate this vehicle
                                        </p>

                                        <Controller
                                            name="requiredLicense"
                                            control={control}
                                            rules={{
                                                required: "At least one license must be selected",
                                                validate: (value) =>
                                                    (value && value.length > 0) || "Select at least one license",
                                            }}
                                            defaultValue={[]}
                                            render={({ field }) => (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                    {license && license.map((item: any, index: number) => {
                                                        const isChecked = field.value && field.value.some((val: any) => val === item.name);
                                                        return (
                                                            <div
                                                                key={index}
                                                                onClick={() => {
                                                                    const val = item.name;
                                                                    if (field.value && field.value.includes(val)) {
                                                                        field.onChange(field.value.filter((v: any) => v !== val));
                                                                    } else {
                                                                        field.onChange([...(field.value || []), val]);
                                                                    }
                                                                }}
                                                                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                                                    isChecked
                                                                        ? 'bg-primary/5 border-primary text-primary shadow-xs'
                                                                        : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                                                        isChecked ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                                                                    }`}>
                                                                        {item.name ? item.name.slice(0, 2) : 'LC'}
                                                                    </div>
                                                                    <span className="font-bold text-xs">{item.name}</span>
                                                                </div>
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                                                    isChecked ? 'bg-primary text-white' : 'border border-slate-300'
                                                                }`}>
                                                                    {isChecked && <MdCheck className="text-[10px]" />}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        />
                                        {errors.requiredLicense && (
                                            <p className="text-rose-500 text-xs mt-2 font-medium">
                                                {String(errors.requiredLicense.message)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Maintenance */}
                            {activeStep === 2 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Authorized Dealer
                                            </label>
                                            <Controller
                                                name="maintenance.dealer"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. Official Mercedes Dealership"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Leasing Company
                                            </label>
                                            <Controller
                                                name="maintenance.leasingCompany"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. LeasePlan Corp"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Next Inspection Date
                                            </label>
                                            <Controller
                                                name="maintenance.nextInspection"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="date"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Maintenance Required On
                                            </label>
                                            <Controller
                                                name="maintenance.maintenanceRequired"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="date"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Fuel Card */}
                            {activeStep === 3 && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Card Supplier / Issuer
                                            </label>
                                            <Controller
                                                name="fuelCard.supplier"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="e.g. Shell Fleet Fuel"
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                16-Digit Card Number
                                            </label>
                                            <Controller
                                                name="fuelCard.cardNumber"
                                                control={control}
                                                defaultValue=""
                                                rules={{
                                                    pattern: {
                                                        value: /^[0-9]{16}$/,
                                                        message: "Card Number must be 16 digits",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="1234567890123456"
                                                        maxLength={16}
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {(errors?.fuelCard as any)?.cardNumber && (
                                                <p className="text-rose-500 text-xs mt-1 font-medium">{String((errors?.fuelCard as any)?.cardNumber?.message)}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                CVC Code
                                            </label>
                                            <Controller
                                                name="fuelCard.cvc"
                                                control={control}
                                                defaultValue=""
                                                rules={{
                                                    pattern: {
                                                        value: /^[0-9]{3}$/,
                                                        message: "CVC must be 3 digits",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="123"
                                                        maxLength={3}
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {(errors?.fuelCard as any)?.cvc && (
                                                <p className="text-rose-500 text-xs mt-1 font-medium">{String((errors?.fuelCard as any)?.cvc?.message)}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                PIN Code
                                            </label>
                                            <Controller
                                                name="fuelCard.pincode"
                                                control={control}
                                                defaultValue=""
                                                rules={{
                                                    pattern: {
                                                        value: /^[0-9]{4,6}$/,
                                                        message: "PIN must be 4 to 6 digits",
                                                    },
                                                }}
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="password"
                                                        placeholder="••••"
                                                        maxLength={6}
                                                        className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                    />
                                                )}
                                            />
                                            {(errors?.fuelCard as any)?.pincode && (
                                                <p className="text-rose-500 text-xs mt-1 font-medium">{String((errors?.fuelCard as any)?.pincode?.message)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </DialogContent>

                    {/* Footer Actions */}
                    <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                                activeStep === 0
                                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                                    : 'border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer'
                            }`}
                        >
                            <MdArrowBack className="text-base" />
                            <span>Previous Step</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary hover:bg-opacity-90 text-white font-semibold text-sm shadow-sm shadow-primary/20 transition-all cursor-pointer"
                            >
                                <span>{activeStep === steps.length - 1 ? (data ? 'Update Vehicle' : 'Create Vehicle') : 'Next Step'}</span>
                                {activeStep < steps.length - 1 && <MdArrowForward className="text-base" />}
                            </button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default VehicleForm;

