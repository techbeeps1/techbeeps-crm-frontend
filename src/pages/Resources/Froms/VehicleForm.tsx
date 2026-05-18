import React, { useEffect, useState } from 'react';

import {
    Button,
    IconButton,
    Dialog,
    Box,
    Tabs,
    Tab, FormControlLabel, Checkbox,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';

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
            setValue('maintenance.nextInspection', formatDateForInput(data?.maintenance?.nextInspection))
            setValue('maintenance.maintenanceRequired', formatDateForInput(data?.maintenance?.maintenanceRequired))
        }
    }, [reset, data, setValue])

    const isTowBar = watch('isTowBar');
    const vehicleType = watch('vehicleType');

    const handleNext = () => {
        handleSubmit(() => {
            setActiveStep((prev) => prev + 1);
        })();
    };
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleClose = () => setOpen(false);

    const steps = [
        { label: 'Vehicle' },
        { label: 'Driving license' },
        { label: 'Maintenance' },
        { label: 'Fuel Card' },
    ];

    const onSubmit = (data: any) => {
        vehicleHandlers(data)
    };

    const vehicleHandlers = async (Formdata: any) => {
        setLoading(true)
        let path = `${apiPath}/api/vehicles`;
        if (data && data._id) {
            path = `${path}/${data?._id}`;
        }
        try {
            const response = await axios.post(path, Formdata, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 201 || response.status === 200) {
                notify("Request successfully!");
                handler()
                setOpen(false);
                reset();
            } else {
                notifyError(response.data.message);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            notifyError(errorMessage);
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
           
            <div className="">
                <button
                    onClick={() => setOpen(true)}
                    className="px-6 py-2 h-auto text-lg font-semibold text-red-600 border border-red-600 rounded hover:bg-primary hover:text-white transition duration-300"
                >
                    {data ? 'Edit' : 'New'} Vehicle
                </button>
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
                    <div className="p-8">
                    {loading && <Loader />}
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-primary mb-1" style={{ fontSize: '25px' }}>{data ? 'Edit' : 'Create New'} Vehicle</span>
                            <IconButton onClick={handleClose}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <Tabs
                            value={activeStep}
                            className="mb-4"
                            onChange={(e, val) => {
                                if (val <= activeStep) {
                                    setActiveStep(val);
                                }
                            }}
                        >
                            {steps.map((step, index) => (
                                <Tab
                                    label={step.label}
                                    key={index}
                                    sx={{ fontWeight: '600', fontSize: '15px' }}
                                />
                            ))}
                        </Tabs>

                        <div >
                            <form onSubmit={handleSubmit(onSubmit)}>
                                {/* Form Fields */}
                                {activeStep === 0 && (
                                    <>
                                        <div className="mb-4 mt-3">
                                            <label className="block text-lg font-medium pb-2">Vehicle type ?</label>
                                            <div className="flex gap-4">
                                                <Controller
                                                    name='vehicleType'
                                                    rules={{ required: "field is a required field" }}
                                                    control={control}
                                                    render={({ field }) => (
                                                        <button
                                                            type="button"
                                                            {...field}
                                                            onClick={() => field.onChange('vehicle')} // Set elevator to true
                                                            className={`px-10 py-3 w-full border border-gray rounded ${field.value === 'vehicle' ? "bg-blue text-white" : "bg-white"}`}
                                                        >
                                                            Vehicle
                                                        </button>
                                                    )}
                                                />
                                                <Controller
                                                    name='vehicleType'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <button
                                                            type="button"
                                                            {...field}
                                                            onClick={() => field.onChange('truck')} // Set elevator to false
                                                            className={`px-10 py-3 border border-gray rounded w-full ${field.value === 'truck' ? "bg-blue text-white" : "bg-white"}`}>
                                                            Truck
                                                        </button>
                                                    )}
                                                />
                                                <Controller
                                                    name='vehicleType'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <button
                                                            type="button"
                                                            {...field}
                                                            onClick={() => field.onChange('movingLift')} // Set elevator to false
                                                            className={`px-10 py-3 border border-gray rounded w-full ${field.value === 'movingLift' ? "bg-blue text-white" : "bg-white"}`}>
                                                            Moving Lift
                                                        </button>
                                                    )}
                                                />
                                            </div>
                                            {errors.vehicleType && <p className="text-red-500 text-sm">{errors.vehicleType.message}</p>}

                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Vehicle Name *</label>
                                                <Controller
                                                    name="name"
                                                    control={control}
                                                    defaultValue=''
                                                    rules={{ required: "field is a required field" }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="Vehicle Name"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                                {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Price Per Kilometer *</label>
                                                <Controller
                                                    name="pricePerKilometer"
                                                    control={control}
                                                    defaultValue=''
                                                    rules={{ required: "field is a required field" }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="number"
                                                            placeholder="Price Per Kilometer"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                                {errors.pricePerKilometer && <p className="text-red-500 text-sm">{errors.pricePerKilometer.message}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Price Per Hour *</label>
                                                <Controller
                                                    name="pricePerHour"
                                                    control={control}
                                                    defaultValue=''
                                                    rules={{ required: "field is a required field" }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="number"
                                                            placeholder="Price Per Hour"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                                {errors.pricePerHour && <p className="text-red-500 text-sm">{errors.pricePerHour.message}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-lg font-medium pb-2">License plate *</label>
                                                <Controller
                                                    name="licensePlate"
                                                    control={control}
                                                    defaultValue=''
                                                    rules={{ required: "field is a required field" }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="License Plate"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                                {errors.licensePlate && <p className="text-red-500 text-sm">{errors.licensePlate.message}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Model</label>
                                                <Controller
                                                    name="model"
                                                    control={control}
                                                    defaultValue=''
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="Model"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Fuel Type</label>
                                                <Controller
                                                    name="fuelType"
                                                    control={control}
                                                    defaultValue=''
                                                    render={({ field }) => (
                                                        <select
                                                            {...field}
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select</option>
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
                                                <label className="block text-lg font-medium pb-2">Transmission Type</label>
                                                <Controller
                                                    name="transmissionType"
                                                    control={control}
                                                    defaultValue=''
                                                    render={({ field }) => (
                                                        <select
                                                            {...field}
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Automatic">Automatic</option>
                                                            <option value="Manual">Manual</option>
                                                            <option value="Unknown">Unknown</option>
                                                        </select>
                                                    )}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Date of Purchasing</label>
                                                <Controller
                                                    name="purchasingDate"
                                                    control={control}
                                                    defaultValue=''
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="date"
                                                            placeholder="Date of Purchasing"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="">
                                                <label className="block text-lg font-medium pb-2">Does the vehicle have a tow bar ?</label>
                                                <div className="flex gap-4">
                                                    <Controller
                                                        name='isTowBar'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <button
                                                                type="button"
                                                                {...field}
                                                                onClick={() => field.onChange(true)} // Set elevator to true
                                                                className={`px-10 py-3 w-full border border-gray rounded ${field.value ? "bg-blue text-white" : "bg-white"}`}
                                                            >
                                                                Yes
                                                            </button>
                                                        )}
                                                    />
                                                    <Controller
                                                        name='isTowBar'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <button
                                                                type="button"
                                                                {...field}
                                                                onClick={() => field.onChange(false)} // Set elevator to false
                                                                className={`px-10 py-3 border border-gray rounded w-full ${!field.value ? "bg-blue text-white" : "bg-white"}`}>
                                                                No
                                                            </button>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            {isTowBar && <div>
                                                <label className="block text-lg font-medium pb-2">Draw weight *</label>
                                                <Controller
                                                    name="drawWeight"
                                                    control={control}
                                                    defaultValue=''
                                                    rules={{ required: "field is a required field" }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="number"
                                                            placeholder="Draw weight"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                                {errors.drawWeight && <p className="text-red-500 text-sm">{errors.drawWeight.message}</p>}
                                            </div>}
                                            {vehicleType === 'movingLift' && <>
                                                <div className="mb-3">
                                                    <label className="block text-lg font-medium pb-2">Floors *</label>
                                                    <Controller
                                                        name="floors"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{
                                                            required: "Floors is a required field",
                                                            pattern: {
                                                                value: /^[0-9]+$/,
                                                                message: "Floors must be a number",
                                                            },
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="Number of Floors"
                                                                className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        )}
                                                    />
                                                    {errors.floors && <p className="text-red-500 text-sm">{errors.floors.message}</p>}
                                                </div>
                                                <div>
                                                    <label className="block text-lg font-medium pb-2">Length (m) *</label>
                                                    <Controller
                                                        name="length"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{
                                                            required: "Length is a required field",
                                                            pattern: {
                                                                value: /^[0-9]+(\.[0-9]+)?$/,
                                                                message: "Length must be a valid number",
                                                            },
                                                        }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="Length"
                                                                className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        )}
                                                    />
                                                    {errors.length && <p className="text-red-500 text-sm">{errors.length.message}</p>}
                                                </div>
                                            </>
                                            }
                                            {vehicleType === 'truck' &&
                                                <>
                                                    <div>
                                                        <label className="block text-lg font-medium pb-2">Length (m) *</label>
                                                        <Controller
                                                            name="length"
                                                            control={control}
                                                            defaultValue=""
                                                            rules={{
                                                                required: "Length is a required field",
                                                                pattern: {
                                                                    value: /^[0-9]+(\.[0-9]+)?$/,
                                                                    message: "Length must be a valid number",
                                                                },
                                                            }}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder="Length"
                                                                    className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            )}
                                                        />
                                                        {errors.length && <p className="text-red-500 text-sm">{errors.length.message}</p>}
                                                    </div>

                                                    <div>
                                                        <label className="block text-lg font-medium pb-2">Width (m) *</label>
                                                        <Controller
                                                            name="width"
                                                            control={control}
                                                            defaultValue=""
                                                            rules={{
                                                                required: "Width is a required field",
                                                                pattern: {
                                                                    value: /^[0-9]+(\.[0-9]+)?$/,
                                                                    message: "Width must be a valid number",
                                                                },
                                                            }}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder="Width"
                                                                    className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            )}
                                                        />
                                                        {errors.width && <p className="text-red-500 text-sm">{errors.width.message}</p>}
                                                    </div>

                                                    {/* Height */}
                                                    <div>
                                                        <label className="block text-lg font-medium pb-2">Height (m) *</label>
                                                        <Controller
                                                            name="height"
                                                            control={control}
                                                            defaultValue=""
                                                            rules={{
                                                                required: "Height is a required field",
                                                                pattern: {
                                                                    value: /^[0-9]+(\.[0-9]+)?$/,
                                                                    message: "Height must be a valid number",
                                                                },
                                                            }}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder="Height"
                                                                    className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            )}
                                                        />
                                                        {errors.height && <p className="text-red-500 text-sm">{errors.height.message}</p>}
                                                    </div> {/* Contents */}
                                                    <div className="mb-3">
                                                        <label className="block text-lg font-medium pb-2">Contents *</label>
                                                        <Controller
                                                            name="contents"
                                                            control={control}
                                                            defaultValue=""
                                                            rules={{ required: "Contents is a required field" }}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder="Contents"
                                                                    className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            )}
                                                        />
                                                        {errors.contents && <p className="text-red-500 text-sm">{errors.contents.message}</p>}
                                                    </div>

                                                    {/* Tail Lift Length */}
                                                    <div className="mb-3">
                                                        <label className="block text-lg font-medium pb-2">Tail Lift Length (m) *</label>
                                                        <Controller
                                                            name="tailLiftLength"
                                                            control={control}
                                                            defaultValue=""
                                                            rules={{
                                                                required: "Tail Lift Length is a required field",
                                                                pattern: {
                                                                    value: /^[0-9]+(\.[0-9]+)?$/,
                                                                    message: "Tail Lift Length must be a valid number",
                                                                },
                                                            }}
                                                            render={({ field }) => (
                                                                <input
                                                                    {...field}
                                                                    type="text"
                                                                    placeholder="Tail Lift Length"
                                                                    className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                />
                                                            )}
                                                        />
                                                        {errors.tailLiftLength && (
                                                            <p className="text-red-500 text-sm">{errors.tailLiftLength.message}</p>
                                                        )}
                                                    </div>
                                                </>}
                                            {vehicleType === 'vehicle' &&
                                                <div className="mb-3">
                                                    <label className="block text-lg font-medium pb-2">Contents *</label>
                                                    <Controller
                                                        name="contents"
                                                        control={control}
                                                        defaultValue=""
                                                        rules={{ required: "Contents is a required field" }}
                                                        render={({ field }) => (
                                                            <input
                                                                {...field}
                                                                type="text"
                                                                placeholder="Contents"
                                                                className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        )}
                                                    />
                                                    {errors.contents && <p className="text-red-500 text-sm">{errors.contents.message}</p>}
                                                </div>
                                                }
                                        </div>
                                    </>
                                )}

                                {activeStep === 1 && (
                                    <>

                                        <div className="mb-4">
                                            <Controller
                                                name="requiredLicense"
                                                control={control}
                                                rules={{
                                                    required: "At least one license must be selected",
                                                    validate: (value) =>
                                                        value.length > 0 || "Select at least one license",
                                                }}
                                                defaultValue={[]} // Default to an empty array
                                                render={({ field }) => (
                                                    <div className="w-full p-4">
                                                        <label className="block font-medium text-black mb-6">
                                                            Select Licenses*
                                                        </label>
                                                        <div className="flex flex-wrap gap-3 p-2 rounded-lg">
                                                            {license && license.map((license: any, index: number) => (
                                                                <FormControlLabel
                                                                    key={index}
                                                                    control={
                                                                        <Checkbox
                                                                            checked={field.value.some(
                                                                                (item: any) => item === license.name
                                                                            )}
                                                                            onChange={() => {
                                                                                const value = license.name;
                                                                                if (field.value.includes(value)) {
                                                                                    field.onChange(
                                                                                        field.value.filter(
                                                                                            (item: any) => item !== value
                                                                                        )
                                                                                    );
                                                                                } else {
                                                                                    field.onChange([...field.value, value]);
                                                                                }
                                                                            }}
                                                                            value={license.name}
                                                                            style={{ display: "none" }}
                                                                        />
                                                                    }
                                                                    label={
                                                                        <span
                                                                            className={`px-4 py-4 shadow border rounded-lg transition-colors cursor-pointer ${field.value.includes(license.name)
                                                                                ? "bg-gray text-black border-blue"
                                                                                : "bg-white text-black border-gray"
                                                                                }`}
                                                                        >
                                                                            {license.name}
                                                                        </span>
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                        {errors.requiredLicense && (
                                                            <p
                                                                style={{
                                                                    color: "red",
                                                                    fontSize: "0.8rem",
                                                                    marginTop: "4px",
                                                                }}
                                                            >
                                                                {errors.requiredLicense.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            />

                                        </div>
                                    </>
                                )}

                                {activeStep === 2 && (
                                    <>
                                        <div className='mb-3'>
                                            <label className="block text-lg font-medium pb-2">Dealer</label>
                                            <Controller
                                                name="maintenance.dealer"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="Dealer Name"
                                                        className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className='mb-3'>
                                            <label className="block text-lg font-medium pb-2">Leasing Company</label>
                                            <Controller
                                                name="maintenance.leasingCompany"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="Leasing Company"
                                                        className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Next Inspection</label>
                                                <Controller
                                                    name="maintenance.nextInspection"
                                                    control={control}
                                                    defaultValue=""
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="date"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            {/* Maintenance Required */}
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Maintenance Required</label>
                                                <Controller
                                                    name="maintenance.maintenanceRequired"
                                                    control={control}
                                                    defaultValue=""
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="date"
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeStep === 3 && (
                                    <>
                                        {/* Supplier */}
                                        <div className="mb-3">
                                            <label className="block text-lg font-medium pb-2">Supplier</label>
                                            <Controller
                                                name="fuelCard.supplier"
                                                control={control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <input
                                                        {...field}
                                                        type="text"
                                                        placeholder="Supplier Name"
                                                        className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )}
                                            />
                                        </div>

                                        {/* Card Number */}
                                        <div className="mb-3">
                                            <label className="block text-lg font-medium pb-2">Card Number</label>
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
                                                        placeholder="1234 5678 9012 3456"
                                                        maxLength={16}
                                                        className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                )}
                                            />
                                            {errors['fuelCard']?.cardNumber && <p className="text-red-500 text-sm">{errors['fuelCard']?.cardNumber?.message}</p>}
                                        </div>


                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-lg font-medium pb-2">CVC</label>
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
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                            </div>

                                            {/* Pincode */}
                                            <div>
                                                <label className="block text-lg font-medium pb-2">Pincode</label>
                                                <Controller
                                                    name="fuelCard.pincode"
                                                    control={control}
                                                    defaultValue=""
                                                    rules={{
                                                        pattern: {
                                                            value: /^[0-9]{5,6}$/,
                                                            message: "Pincode must be 5 or 6 digits",
                                                        },
                                                    }}
                                                    render={({ field }) => (
                                                        <input
                                                            {...field}
                                                            type="text"
                                                            placeholder="123456"
                                                            maxLength={6}
                                                            className="w-full p-3 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                                {/* Step Navigation Buttons */}
                                <Box className="flex justify-between mt-6">
                                    <Button
                                        variant="outlined"
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        size='large'
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size='large'
                                        onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                                    >
                                        {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
                                    </Button>
                                </Box>
                            </form>
                        </div>

                    </div>
                </Dialog>
            </div>

        </>
    );
};

export default VehicleForm;
