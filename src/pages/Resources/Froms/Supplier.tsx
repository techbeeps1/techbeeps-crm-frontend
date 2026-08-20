import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import axios from "axios";
import CloseIcon from '@mui/icons-material/Close';
import { Dialog, DialogContent, DialogActions, IconButton } from "@mui/material";
import { apiPath } from "../../../../apiPath";
import { 
    MdBusiness, 
    MdPhone, 
    MdSmartphone, 
    MdEmail, 
    MdLanguage, 
    MdLocationOn, 
    MdAttachMoney, 
    MdAdd, 
    MdEdit, 
    MdCheck 
} from "react-icons/md";

type SupplierFormInputs = {
    name: string;
    website: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    mobileNumber: string;
    emailAddress: string;
    houseNumber: string;
    streetName: string;
    addition: string;
    zipCode: string;
    country: string;
    city: string;
    purchasePrice: string;
    type: string;
    supplier: string;
};

const initialSupplierValues: SupplierFormInputs = {
    name: "",
    website: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    mobileNumber: "",
    emailAddress: "",
    houseNumber: "",
    streetName: "",
    addition: "",
    zipCode: "",
    country: "",
    city: "",
    purchasePrice: "",
    type: "new",
    supplier: "",
};

const Supplier: React.FC<any> = ({ material, materilHandlers }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [data, setData] = useState<any>([]);
    const [editForm, setEditForm] = useState<any>();
    const { register, handleSubmit, reset, watch, formState: { errors }, control } = useForm<SupplierFormInputs>({
        defaultValues: initialSupplierValues,
    });

    let type = watch('type');

    const onSubmit: SubmitHandler<SupplierFormInputs> = async (formData) => {
        let path = `${apiPath}/api/supplier`;
        if (editForm) {
            path = `${apiPath}/api/supplier/${editForm.supplier._id}`;
        }
        try {
            if (type === 'new' || editForm) {
                const response = await axios.post(path, formData);
                await materilHandlers({ ...material, supplier: response.data?._id, purchasePrice: formData.purchasePrice });
            } else {
                await materilHandlers({ ...material, ...formData });
            }
            reset(initialSupplierValues);
            setIsOpen(false);
            setEditForm(null);
        } catch (error) {
            console.error("Error creating supplier:", error);
            alert("Failed to create supplier.");
        }
    };

    const handleAllData = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/supplier`);
            setData(response["data"] || []);
        } catch (err: any) {
            console.log(err);
        }
    };

    useEffect(() => {
        handleAllData();
    }, []);

    useEffect(() => {
        if (editForm) {
            reset({ ...initialSupplierValues, ...editForm?.supplier, ...editForm });
        } else {
            reset(initialSupplierValues);
        }
    }, [editForm, reset]);

    const handleClose = () => {
        setIsOpen(false);
        setEditForm(null);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                        Assigned Suppliers
                    </h3>
                    <p className="text-xs text-slate-400">
                        Suppliers providing inventory for this item
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setEditForm(null); setIsOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-opacity-90 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                    <MdAdd className="text-base" />
                    <span>Add Supplier</span>
                </button>
            </div>

            {/* Supplier Cards List */}
            {material?.inventorySuppliers && material?.inventorySuppliers.length > 0 ? (
                <div className="space-y-3">
                    {material.inventorySuppliers.map((item: any, idx: number) => (
                        <div
                            key={idx}
                            className="bg-white border border-slate-200/80 rounded-xl p-4 relative shadow-xs hover:border-primary/30 transition-all space-y-3"
                        >
                            {/* Card Top */}
                            <div className="flex items-center justify-between pr-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                        <MdBusiness className="text-lg" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-800">
                                            {item.supplier?.name || "Unknown Supplier"}
                                        </h4>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                                            <MdAttachMoney className="text-xs" />
                                            Purchase Price: ${item.purchasePrice || '0.00'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => { setEditForm(item); setIsOpen(true); }}
                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors cursor-pointer absolute top-3 right-3"
                                    title="Edit Supplier"
                                >
                                    <MdEdit className="text-base" />
                                </button>
                            </div>

                            {/* Contact Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                                {item.supplier?.phoneNumber && (
                                    <div className="flex items-center gap-1.5">
                                        <MdPhone className="text-slate-400 text-sm" />
                                        <span>{item.supplier.phoneNumber}</span>
                                    </div>
                                )}
                                {item.supplier?.mobileNumber && (
                                    <div className="flex items-center gap-1.5">
                                        <MdSmartphone className="text-slate-400 text-sm" />
                                        <span>{item.supplier.mobileNumber}</span>
                                    </div>
                                )}
                                {item.supplier?.emailAddress && (
                                    <div className="flex items-center gap-1.5">
                                        <MdEmail className="text-slate-400 text-sm" />
                                        <span className="truncate">{item.supplier.emailAddress}</span>
                                    </div>
                                )}
                                {item.supplier?.website && (
                                    <div className="flex items-center gap-1.5">
                                        <MdLanguage className="text-slate-400 text-sm" />
                                        <span className="truncate text-primary font-medium">{item.supplier.website}</span>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            {(item.supplier?.streetName || item.supplier?.city) && (
                                <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 p-2 rounded-lg">
                                    <MdLocationOn className="text-slate-400 text-sm shrink-0 mt-0.5" />
                                    <span>
                                        {item.supplier?.houseNumber} {item.supplier?.addition || ""} {item.supplier?.streetName}, {item.supplier?.city} {item.supplier?.zipCode} {item.supplier?.country}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <MdBusiness className="text-3xl mx-auto text-slate-300 mb-1" />
                    <p className="text-xs font-semibold text-slate-600">No suppliers assigned yet</p>
                    <p className="text-[11px] text-slate-400">Add a supplier to enable stock ordering</p>
                </div>
            )}

            {/* Add / Edit Supplier Dialog */}
            <Dialog
                open={isOpen}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: "16px",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        overflow: "hidden",
                    }
                }}
            >
                <div className="bg-white flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                                <MdBusiness className="text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    {editForm ? "Update Supplier" : "Link Supplier"}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Assign a supplier and configure purchasing pricing
                                </p>
                            </div>
                        </div>
                        <IconButton onClick={handleClose} size="small" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogContent className="px-6 py-5 space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {/* New vs Existing Supplier Toggle (Only if not editing) */}
                            {!editForm && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                        Supplier Mode <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Controller
                                            name="type"
                                            rules={{ required: "Select supplier type" }}
                                            control={control}
                                            defaultValue="new"
                                            render={({ field }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange('new')}
                                                    className={`py-2.5 px-4 rounded-xl font-semibold text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                                                        field.value === 'new'
                                                            ? "bg-primary text-white border-primary shadow-xs"
                                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {field.value === 'new' && <MdCheck className="text-sm" />}
                                                    <span>New Supplier</span>
                                                </button>
                                            )}
                                        />
                                        <Controller
                                            name="type"
                                            control={control}
                                            render={({ field }) => (
                                                <button
                                                    type="button"
                                                    onClick={() => field.onChange('exist')}
                                                    className={`py-2.5 px-4 rounded-xl font-semibold text-xs transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                                                        field.value === 'exist'
                                                            ? "bg-primary text-white border-primary shadow-xs"
                                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    {field.value === 'exist' && <MdCheck className="text-sm" />}
                                                    <span>Existing Supplier</span>
                                                </button>
                                            )}
                                        />
                                    </div>
                                    {errors.type && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.type.message)}</p>}
                                </div>
                            )}

                            {/* Existing Supplier Option */}
                            {type === 'exist' && !editForm && (
                                <div className="space-y-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Select Supplier <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            {...register("supplier", { required: "Supplier selection is required" })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        >
                                            <option value="">Choose Supplier</option>
                                            {data && data.map((item: any) => (
                                                <option key={item._id} value={item._id}>{item.name}</option>
                                            ))}
                                        </select>
                                        {errors.supplier && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.supplier.message)}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                            Purchasing Price ($) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="any"
                                            placeholder="0.00"
                                            {...register("purchasePrice", { required: "Purchasing price is required" })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                        {errors.purchasePrice && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.purchasePrice.message)}</p>}
                                    </div>
                                </div>
                            )}

                            {/* New Supplier Form Fields */}
                            {(type === 'new' || editForm) && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Company Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Company Name"
                                                {...register("name", { required: "Name is required" })}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                            {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                Purchasing Price ($) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                placeholder="0.00"
                                                {...register("purchasePrice", { required: 'Purchasing price is required' })}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                            {errors.purchasePrice && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.purchasePrice.message)}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Website
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="https://example.com"
                                            {...register("website")}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                First Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="First Name"
                                                {...register("firstName", { required: "First Name is required" })}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                            {errors.firstName && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.firstName.message)}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Last Name"
                                                {...register("lastName")}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Phone Number"
                                                {...register("phoneNumber")}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                                Mobile Number
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Mobile Number"
                                                {...register("mobileNumber")}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Email Address <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            placeholder="supplier@company.com"
                                            {...register("emailAddress", { required: "Email is required" })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                        {errors.emailAddress && <p className="text-rose-500 text-xs mt-1 font-medium">{String(errors.emailAddress.message)}</p>}
                                    </div>

                                    {/* Address Details */}
                                    <div className="pt-2 border-t border-slate-100">
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">House Number</label>
                                                <input
                                                    type="text"
                                                    placeholder="House Number"
                                                    {...register("houseNumber")}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Addition</label>
                                                <input
                                                    type="text"
                                                    placeholder="Addition"
                                                    {...register("addition")}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-slate-600 mb-1">Street Name</label>
                                            <input
                                                type="text"
                                                placeholder="Street Name"
                                                {...register("streetName")}
                                                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">ZIP Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="ZIP"
                                                    {...register("zipCode")}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    {...register("city")}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    placeholder="Country"
                                                    {...register("country")}
                                                    className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </DialogContent>

                        {/* Actions */}
                        <div className="px-6 py-4.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-opacity-90 text-white font-semibold text-sm shadow-sm shadow-primary/20 transition-all cursor-pointer"
                            >
                                {editForm ? "Update Supplier" : "Save Supplier"}
                            </button>
                        </div>
                    </form>
                </div>
            </Dialog>
        </div>
    );
};

export default Supplier;

