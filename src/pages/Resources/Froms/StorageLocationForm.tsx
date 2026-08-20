import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from "../../../../apiPath";
import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../../../common/Loader";
import { MdPlace, MdAdd, MdEdit } from "react-icons/md";

const StorageLocationForm: React.FC<any> = ({ warehouse, type, data, handler }) => {
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
            setValue('warehouse', (data && data.warehouse?._id) || "");
        }
    }, [reset, data, setValue]);

    const wareHouseHandlers = async (formdata: any) => {
        setLoading(true);
        let path = `${apiPath}/api/storage_loaction`;
        if (data && data._id) {
            path = `${path}/${data?._id}`;
        }
        try {
            const response = await axios.post(path, { ...formdata }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 201 || response.status === 200) {
                notify("Storage location saved successfully!");
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
                    <span>Edit Location</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-opacity-90 rounded-xl transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md cursor-pointer"
                >
                    <MdAdd className="text-lg" />
                    <span>New Location</span>
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
                                <MdPlace className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {data ? "Update" : "Create New"} {type || "Storage"} Location
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Configure location zone details and link to a warehouse facility
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

                        <form onSubmit={handleSubmit(onSubmit)} id="storage-loc-form" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Location Name <span className="text-rose-500">*</span>
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
                                                placeholder="e.g. Zone A - Rack 01"
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        )}
                                    />
                                    {errors.name && (
                                        <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>
                                    )}
                                </div>

                                {/* Code */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Location Code <span className="text-rose-500">*</span>
                                    </label>
                                    <Controller
                                        name="code"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Code is a required field" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                placeholder="e.g. ZA-R01"
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        )}
                                    />
                                    {errors.code && (
                                        <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.code.message)}</p>
                                    )}
                                </div>

                                {/* Warehouse Selector */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Assigned Warehouse <span className="text-rose-500">*</span>
                                    </label>
                                    <Controller
                                        name="warehouse"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Warehouse is a required field" }}
                                        render={({ field }) => (
                                            <select
                                                {...field}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            >
                                                <option value="">Select warehouse</option>
                                                {warehouse && warehouse.map((item: any) => (
                                                    <option key={item._id} value={item._id}>
                                                        {item.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                    />
                                    {errors.warehouse && (
                                        <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.warehouse.message)}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Description <span className="text-rose-500">*</span>
                                    </label>
                                    <Controller
                                        name="description"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Description is a required field" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="text"
                                                placeholder="e.g. Ground floor pallet area"
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        )}
                                    />
                                    {errors.description && (
                                        <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.description.message)}</p>
                                    )}
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
                            {data ? "Update Location" : "Save Location"}
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default StorageLocationForm;

