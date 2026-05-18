import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import axios from "axios";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';

import { Dialog, DialogTitle, IconButton, DialogContent, DialogActions, Button } from "@mui/material";
import { apiPath } from "../../../../apiPath";

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
    purchasePrice: string
    type: string;
    supplier:string;
};

const Supplier: React.FC<any> = ({ material, materilHandlers }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [data, setData] = useState<any>([]);
    const [editForm, setEditForm] = useState<any>()
    const { register, handleSubmit, reset, watch, formState: { errors }, control } = useForm<SupplierFormInputs>();

    let type = watch('type')

    const onSubmit: SubmitHandler<SupplierFormInputs> = async (data) => {
        let path = `${apiPath}/api/supplier`
        if (editForm){
            path = `${apiPath}/api/supplier/${editForm.supplier._id}`
        }
        try {
            if (type === 'new' || editForm ) {
                const response = await axios.post(path, data);
                await materilHandlers({ ...material, supplier: response.data?._id, purchasePrice: data.purchasePrice })
            } else {
                await materilHandlers({ ...material, ...data })
            }
            reset();
            setIsOpen(false);
        } catch (error) {
            console.error("Error creating supplier:", error);
            alert("Failed to create supplier.");
        }
    };

    const handleAllData = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/supplier`);
            setData(response["data"]);
        } catch (err: any) {
            console.log(err)
        }
    };
    // const deleteHandler = async (id) => {
    //     try {
    //         const response = await axios.delete(`${apiPath}/api/supplier/${id}`);
    //         alert('Successfully deleted')
    //     } catch (err: any) {
    //         console.log(err)
    //     }
    // };
    useEffect(() => {
        handleAllData()
    }, [])

    useEffect(() => {
        if (editForm) {
            reset({ ...editForm?.supplier, ...editForm });
        } else {
            reset((fields) => Object.keys(fields).reduce((acc, key) => ({ ...acc, [key]: null }), {}));
        }
    }, [editForm, reset]);
    

    return (
        <div>
            <div className="flex justify-between mb-3">
                <h2 className="text-xl font-bold mb-2 me-4">Suppilers</h2>
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex justify-center items-center h-10 w-10 text-xl font-bold text-red-600 border border-red-600 rounded-full hover:bg-primary hover:text-white transition duration-300"
                >+</button>
            </div>
            {material?.inventorySuppliers && material?.inventorySuppliers.map((item: any) =>
                <>
                    <div className='relative max-w-full border border-gray p-3 mb-2 shadow'>
                        <div className="absolute top-1 right-1">
                            <IconButton onClick={() => { setIsOpen(true); setEditForm(item) }}>
                                <EditIcon />
                            </IconButton>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Name :</p>
                            <p className="w-full text-lg font-bold text-start">{item.supplier?.name}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Purchase price :</p>
                            <p className="w-full text-lg font-bold text-start">{item.purchasePrice} $</p>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Phone Number :</p>
                            <p className="w-full text-lg font-bold text-start">{item.supplier?.phoneNumber}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Mobile Number :</p>
                            <p className="w-full text-lg font-bold text-start">{item.supplier?.mobileNumber}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Email :</p>
                            <p className="w-full text-lg font-bold text-start">{item.supplier?.emailAddress}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Website :</p>
                            <p className="w-full text-lg font-bold text-start">{item.supplier?.website}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                            <p className="w-full text-lg font-medium">Address :</p>
                            <p className="w-full text-lg font-bold text-start">{`${item.supplier?.houseNumber} ${item.supplier?.addition} ${item.supplier?.streetName} ${item.supplier?.city} ${item.supplier?.zipCode} ${item.supplier?.country}`}</p>
                        </div>

                    </div>
                </>
            )}

            <Dialog open={isOpen} onClose={() => { setIsOpen(false), setEditForm(null) }} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <div className="flex justify-between p-3">
                        <span className="text-2xl font-bold text-primary">{editForm ? 'Update': 'Create New'} Supplier</span>
                        <IconButton onClick={() => { setIsOpen(false), setEditForm(null) }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-3">
                        {!editForm && <div className="mb-4 mt-3">
                            <label className="block text-lg font-medium pb-2">Supplier ?</label>
                            <div className="flex gap-4">
                                <Controller
                                    name='type'
                                    rules={{ required: "field is a required field" }}
                                    control={control}
                                    render={({ field }) => (
                                        <button
                                            type="button"
                                            {...field}
                                            onClick={() => field.onChange('new')} // Set elevator to true
                                            className={`px-10 py-3 w-full border border-gray rounded ${field.value === 'new' ? "bg-blue text-white" : "bg-white"}`}
                                        >
                                            New Supplier
                                        </button>
                                    )}
                                />
                                <Controller
                                    name='type'
                                    control={control}
                                    render={({ field }) => (
                                        <button
                                            type="button"
                                            {...field}
                                            onClick={() => field.onChange('exist')} // Set elevator to false
                                            className={`px-10 py-3 border border-gray rounded w-full ${field.value === 'exist' ? "bg-blue text-white" : "bg-white"}`}>
                                            Existing Supplier
                                        </button>
                                    )}
                                />
                            </div>
                            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
                        </div>
                        }

                        {(type === 'new' || editForm) && (
                            <>
                                <div>
                                    <label className="block text-md font-medium">Company Name</label>
                                    <input
                                        type="text"
                                        {...register("name", { required: "Name is required" })}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                    {errors.name && <p className="text-red-500 text-md">{errors.name.message}</p>}
                                </div>

                                {/* Website */}
                                <div>
                                    <label className="block text-md font-medium">Website</label>
                                    <input
                                        type="text"
                                        {...register("website")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-md font-medium">Purchasing Price</label>
                                    <input
                                        type="number"
                                        {...register("purchasePrice", { required: 'purchasePrice is required' })}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                    {errors.purchasePrice && <p className="text-red-500 text-md">{errors.purchasePrice.message}</p>}
                                </div>

                                {/* First Name */}
                                <div>
                                    <label className="block text-md font-medium">First Name</label>
                                    <input
                                        type="text"
                                        {...register("firstName", { required: "First Name is required" })}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                    {errors.firstName && <p className="text-red-500 text-md">{errors.firstName.message}</p>}
                                </div>

                                {/* Last Name */}
                                <div>
                                    <label className="block text-md font-medium">Last Name</label>
                                    <input
                                        type="text"
                                        {...register("lastName")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-md font-medium">Phone Number</label>
                                    <input
                                        type="text"
                                        {...register("phoneNumber")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-md font-medium">Mobile Number</label>
                                    <input
                                        type="text"
                                        {...register("mobileNumber")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-md font-medium">Email Address</label>
                                    <input
                                        type="email"
                                        {...register("emailAddress", { required: "Email is required" })}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                    {errors.emailAddress && <p className="text-red-500 text-md">{errors.emailAddress.message}</p>}
                                </div>

                                {/* Address Fields */}
                                <div>
                                    <label className="block text-md font-medium">House Number</label>
                                    <input
                                        type="text"
                                        {...register("houseNumber")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-md font-medium">Street Name</label>
                                    <input
                                        type="text"
                                        {...register("streetName")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-md font-medium">Addition</label>
                                    <input
                                        type="text"
                                        {...register("addition")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-md font-medium">ZIP Code</label>
                                    <input
                                        type="text"
                                        {...register("zipCode")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-md font-medium">Country</label>
                                    <input
                                        type="text"
                                        {...register("country")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block text-md font-medium">City</label>
                                    <input
                                        type="text"
                                        {...register("city")}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                </div>
                            </>
                        )}
                        {type === 'exist' && (
                            <>
                                <div>
                                    <label className="block text-md font-medium">Supplier</label>
                                    <select
                                        {...register("supplier", { required: 'supplier is required' })}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    >   <option value="">select</option>
                                        {data && data.map((item: any) =>
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        )}

                                    </select>
                                    {errors.supplier && <p className="text-red-500 text-md">{errors.supplier.message}</p>}
                                </div>
                                <div>
                                    <label className="block text-md font-medium">Purchasing Price</label>
                                    <input
                                        type="number"
                                        {...register("purchasePrice", { required: 'purchasePrice is required' })}
                                        className="w-full px-3 py-2 border border-gray rounded"
                                    />
                                    {errors.purchasePrice && <p className="text-red-500 text-md">{errors.purchasePrice.message}</p>}
                                </div>
                            </>
                        )}


                    </form>
                </DialogContent>
                <DialogActions>
                    <div className="p-3 flex gap-3 mx-4">
                        <Button onClick={() => setIsOpen(false)} variant="outlined" color="secondary">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            variant="contained"
                            color="primary"
                        >
                            Submit
                        </Button>
                    </div>

                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Supplier;
