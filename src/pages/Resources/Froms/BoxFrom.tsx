import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from "../../../../apiPath";
import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../../../common/Loader";
import { useCurrency } from "../../../utils/currencyUtil";
import { MdAllInbox, MdLayers, MdAdd, MdEdit } from "react-icons/md";

const BoxFrom: React.FC<any> = ({ type, data, handler }) => {
    const { symbol: currencySymbol } = useCurrency();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm();

    const isBox = type === 'Box';
    const Icon = isBox ? MdAllInbox : MdLayers;

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
        }
        setValue('ownership', (data && data.ownership) || "false");
    }, [reset, data, setValue]);

    const wareHouseHandlers = async (formdata: any) => {
        setLoading(true);
        let path = `${apiPath}/api/box`;
        if (data && data._id) {
            path = `${path}/${data?._id}`;
        }
        try {
            const response = await axios.post(path, { ...formdata, inventoryType: type }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.status === 201 || response.status === 200) {
                notify(`${type} saved successfully!`);
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
                    <span>Edit {type}</span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={handleOpen}
                    className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-opacity-90 rounded-xl transition-all duration-200 shadow-sm shadow-primary/20 hover:shadow-md cursor-pointer"
                >
                    <MdAdd className="text-lg" />
                    <span>New {type}</span>
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
                                <Icon className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {data ? "Update" : "Create New"} {type} Item
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Configure dimensions, rental/selling price and inventory specifications
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

                        <form onSubmit={handleSubmit(onSubmit)} id="box-form" className="space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    {type} Name / Type <span className="text-rose-500">*</span>
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
                                            placeholder={`e.g. Standard Moving ${type}`}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    )}
                                />
                                {errors.name && (
                                    <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>
                                )}
                            </div>

                            {/* Pricing Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Rental Price ({currencySymbol}) <span className="text-rose-500">*</span>
                                    </label>
                                    <Controller
                                        name="rentalPrice"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Rental Price is a required field" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                step="any"
                                                placeholder="0.00"
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        )}
                                    />
                                    {errors.rentalPrice && (
                                        <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.rentalPrice.message)}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Selling Price ({currencySymbol}) <span className="text-rose-500">*</span>
                                    </label>
                                    <Controller
                                        name="sellingPrice"
                                        control={control}
                                        defaultValue=""
                                        rules={{ required: "Selling Price is a required field" }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="number"
                                                step="any"
                                                placeholder="0.00"
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        )}
                                    />
                                    {errors.sellingPrice && (
                                        <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.sellingPrice.message)}</p>
                                    )}
                                </div>
                            </div>

                            {/* Dimensions Grid (L x W x H) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Physical Dimensions (in cm)
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Length (cm) <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="length"
                                            defaultValue=""
                                            control={control}
                                            rules={{ required: "Length is required" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="number"
                                                    step="any"
                                                    placeholder="Length"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.length && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.length.message)}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Width (cm) <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="width"
                                            defaultValue=""
                                            control={control}
                                            rules={{ required: "Width is required" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="number"
                                                    step="any"
                                                    placeholder="Width"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.width && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.width.message)}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-medium text-slate-500 mb-1">
                                            Height (cm) <span className="text-rose-500">*</span>
                                        </label>
                                        <Controller
                                            name="height"
                                            control={control}
                                            defaultValue=""
                                            rules={{ required: "Height is required" }}
                                            render={({ field }) => (
                                                <input
                                                    {...field}
                                                    type="number"
                                                    step="any"
                                                    placeholder="Height"
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            )}
                                        />
                                        {errors.height && (
                                            <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.height.message)}</p>
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
                            {data ? `Update ${type}` : `Save ${type}`}
                        </button>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default BoxFrom;

