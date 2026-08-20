import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from "../../../../apiPath";
import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../../../common/Loader";
import { MdWarehouse, MdAdd, MdEdit, MdCheck, MdLocationOn } from "react-icons/md";

const PilotsForm: React.FC<any> = ({ data, handler, countries }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm();

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const onSubmit = (Formdata: any) => {
        wareHouseHandlers(Formdata);
    };

    useEffect(() => {
        if (data) {
            reset(data);
            setValue('isOwnWarehouse', data.isOwnWarehouse);
        }
    }, [reset, data, setValue]);

    const wareHouseHandlers = async (formData: any) => {
        setLoading(true);
        let path = `${apiPath}/api/warehouses`;
        if (formData._id) {
            path = `${path}/${formData?._id}`;
        }
        if (!formData.name || formData.name.trim() === '') {
            notifyError("Name is a required field");
            setLoading(false);
            return;
        } else if (formData.name.length > 50 || formData.name.length < 2) {
            notifyError("Name must be between 2 and 50 characters");
            setLoading(false);
            return;
        }
        if (!formData.postcode || formData.postcode.trim() === '') {
            notifyError("Postcode is a required field");
            setLoading(false);
            return;
        } else if (formData.postcode.length > 12 || formData.postcode.length < 2) {
            notifyError("Postcode must be between 2 and 12 characters");
            setLoading(false);
            return;
        }
        if (!formData.houseNumber || formData.houseNumber.trim() === '') {
            notifyError("House number is a required field");
            setLoading(false);
            return;
        } else if (formData.houseNumber.length > 15 || formData.houseNumber.length < 1) {
            notifyError("House number must be between 1 and 15 characters");
            setLoading(false);
            return;
        }
        if (formData.addition && formData.addition.trim() !== '' && (formData.addition.length > 55 || formData.addition.length < 2)) {
            notifyError("Addition must be between 2 and 55 characters");
            setLoading(false);
            return;
        }
        if (!formData.street || formData.street.trim() === '') {
            notifyError("Street is a required field");
            setLoading(false);
            return;
        } else if (formData.street.length > 55 || formData.street.length < 2) {
            notifyError("Street must be between 2 and 55 characters");
            setLoading(false);
            return;
        }

        if (!formData.city || formData.city.trim() === '') {
            notifyError("City is a required field");
            setLoading(false);
            return;
        } else if (formData.city.length > 55 || formData.city.length < 2) {
            notifyError("City must be between 2 and 55 characters");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(path, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 201 || response.status === 200) {
                notify("Request successfully!");
                handler();
                setOpen(false);
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

    const handleCancel = () => {
        setOpen(false);
        reset();
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <>
            {data ? (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl transition-all duration-200 shadow-xs cursor-pointer"
                >
                    <MdEdit className="text-base" />
                    <span>Edit Warehouse</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-opacity-90 rounded-xl transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md cursor-pointer"
                >
                    <MdAdd className="text-lg" />
                    <span>New Warehouse</span>
                </button>
            )}

            <Dialog
                open={open}
                onClose={handleCancel}
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
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                                <MdWarehouse className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {data ? "Update Warehouse" : "Create New Warehouse"}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Configure warehouse details, location address and storage allocations
                                </p>
                            </div>
                        </div>
                        <IconButton
                            onClick={handleCancel}
                            size="small"
                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>

                    <DialogContent className="px-6 py-5">
                        {loading && <Loader />}

                        <form onSubmit={handleSubmit(onSubmit)} id="warehouse-form" className="space-y-5">
                            {/* Warehouse Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Warehouse Name <span className="text-rose-500">*</span>
                                </label>
                                <Controller
                                    name="name"
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: "Name is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="e.g. Main Distribution Center"
                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    )}
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>
                                )}
                            </div>

                            {/* Own Warehouse Segmented Button */}
                            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Warehouse Ownership
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Controller
                                        name="isOwnWarehouse"
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }) => (
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(true)}
                                                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all border cursor-pointer ${
                                                    field.value
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70"
                                                }`}
                                            >
                                                {field.value && <MdCheck className="text-base" />}
                                                <span>Owned Warehouse</span>
                                            </button>
                                        )}
                                    />
                                    <Controller
                                        name="isOwnWarehouse"
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }) => (
                                            <button
                                                type="button"
                                                onClick={() => field.onChange(false)}
                                                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all border cursor-pointer ${
                                                    !field.value
                                                        ? "bg-primary text-white border-primary shadow-xs"
                                                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100/70"
                                                }`}
                                            >
                                                {!field.value && <MdCheck className="text-base" />}
                                                <span>Rented / Third-Party</span>
                                            </button>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="pt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <MdLocationOn className="text-primary text-base" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                        Location & Address Details
                                    </h4>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Postcode */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Postcode <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="postcode"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: "Postcode is a required field" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="e.g. 1011 AB"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.postcode && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.postcode.message)}</p>
                                        )}
                                    </div>

                                    {/* House Number */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            House Number <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="houseNumber"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: "House number is a required field" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="e.g. 42"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.houseNumber && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.houseNumber.message)}</p>
                                        )}
                                    </div>

                                    {/* Addition */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Addition (Optional)
                                        </label>
                                        <Controller
                                            name="addition"
                                            defaultValue=""
                                            control={control}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="e.g. Suite B"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                    </div>

                                    {/* Street */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Street Name <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="street"
                                            defaultValue=""
                                            control={control}
                                            rules={{ required: "Street is a required field" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="e.g. Industrial Ave"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.street && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.street.message)}</p>
                                        )}
                                    </div>

                                    {/* City */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            City <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="city"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: "City is a required field" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="text"
                                                    placeholder="e.g. Amsterdam"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.city && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.city.message)}</p>
                                        )}
                                    </div>

                                    {/* Country */}
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Country <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="country"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: "Country is a required field" }}
                                            render={({ field }) => (
                                                <select
                                                    {...field}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                >
                                                    <option value="">Select Country</option>
                                                    {countries && countries.map((country: any) => (
                                                        <option key={country._id} value={country.name}>
                                                            {country.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        />
                                        {errors.country && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.country.message)}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </DialogContent>

                    {/* Actions Footer */}
                    <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-opacity-90 text-white font-semibold text-sm shadow-sm shadow-primary/20 transition-all cursor-pointer"
                        >
                            {data ? "Update Warehouse" : "Save Warehouse"}
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default PilotsForm;

