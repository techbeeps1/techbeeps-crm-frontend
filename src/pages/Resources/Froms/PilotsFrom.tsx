import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from "../../../../apiPath";
import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../../../common/Loader";

const PilotsForm: React.FC<any> = ({ data, handler, countries }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { control, handleSubmit, setValue, formState: { errors }, reset } = useForm();

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const onSubmit = (Formdata: any) => {
        wareHouseHandlers(Formdata)
    };
    useEffect(() => {
        if (data) {
            reset(data);
            setValue('isOwnWarehouse', data.isOwnWarehouse)
        }
    }, [reset, data, setValue])

    const wareHouseHandlers = async (data: any) => {
        setLoading(true)
        let path = `${apiPath}/api/warehouses`;
        if (data._id) {
            path = `${path}/${data?._id}`;
        }
        if(data.name.trim() === ''){
            notifyError("Name is a required field")
            setLoading(false)
            return
        }else if(data.name.length > 50 || data.name.length < 2){
            notifyError("Name must be between 2 and 50 characters")
            setLoading(false)
            return
        }
        if(data.postcode.trim() === ''){
            notifyError("Postcode is a required field")
            setLoading(false)
            return
        }else if(data.postcode.length > 12 || data.postcode.length < 2){
            notifyError("Postcode must be between 2 and 12 characters")
            setLoading(false)
            return
        }
        if(data.houseNumber.trim() === ''){
            notifyError("House number is a required field")
            setLoading(false)
            return
        }else if(data.houseNumber.length > 15 || data.houseNumber.length < 1){
            notifyError("House number must be between 1 and 15 characters")
            setLoading(false)
            return
        }
if(data.addition.trim() !== '' && (data.addition.length > 55 || data.addition.length < 2)){
            notifyError("Addition must be between 2 and 55 characters")
            setLoading(false)
            return
        }
if(data.street.trim() === ''){
            notifyError("Street is a required field")
            setLoading(false)
            return
        }else if(data.street.length > 55 || data.street.length < 2){
            notifyError("Street must be between 2 and 55 characters")
            setLoading(false)
            return
        }

        if(data.city.trim() === ''){
            notifyError("City is a required field")
            setLoading(false)
            return
        }else if(data.city.length > 55 || data.city.length < 2){
            notifyError("City must be between 2 and 55 characters")
            setLoading(false)
            return
        }


        if(data.street.trim() === ''){
            notifyError("Street is a required field")
            setLoading(false)
            return
        }else if(data.street.length > 55 || data.street.length < 2){
            notifyError("Street must be between 2 and 55 characters")
            setLoading(false)
            return
        }
        try {
            const response = await axios.post(path, data, {
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

    const handleCancel = () => {
        setOpen(false);
        reset();
    };

    const handleOpen = () => {
        setOpen(true);
    };

    return (
        <>
            <Button
                onClick={handleOpen}
                variant="contained"
                size="large"
            >
                {data ? 'Edit Detail' : 'New Warehouse'}
            </Button>
            <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
                <div className="p-4">
                    <DialogTitle className="flex justify-between items-center">

                        <span className="font-semibold text-primary mb-1" style={{ fontSize: '28px' }}>{data ? "Update" : 'Create New'} warehouse</span>
                        <IconButton onClick={handleCancel}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <p className="mb-8">
                            Create a new warehouse, after which you can add locations to the warehouse.
                        </p>
                        {loading && <Loader />}
                        <div className="w-full">
                        <label className="block text-md font-medium pb-2">Name*</label>

                            <Controller
                                name="name"
                                control={control}
                                defaultValue=''
                                rules={{ required: "Name is a required field" }}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="text"
                                        placeholder="Name"
                                        className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

                            <div className="mb-4 mt-3">
                                <label className="block text-md font-medium pb-1">Own Warehouse ?</label>
                                <div className="flex gap-4">
                                    <Controller
                                        name='isOwnWarehouse'
                                        control={control}
                                        render={({ field }) => (
                                            <button
                                                type="button"
                                                {...field}
                                                onClick={() => field.onChange(true)} // Set elevator to true
                                                className={`px-10 shadow py-3 w-full border border-gray rounded ${field.value ? "bg-blue text-white" : "bg-white"}`}
                                            >
                                                Yes
                                            </button>
                                        )}
                                    />
                                    <Controller
                                        name='isOwnWarehouse'
                                        control={control}
                                        render={({ field }) => (
                                            <button
                                                type="button"
                                                {...field}
                                                onClick={() => field.onChange(false)} // Set elevator to false
                                                className={`px-10 py-3 shadow border border-gray rounded w-full ${!field.value ? "bg-blue text-white" : "bg-white"}`}>
                                                No
                                            </button>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                            <label className="block text-md font-medium pb-2">Postcode*</label>

                                <Controller
                                    name="postcode"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "Postcode is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Postcode"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.postcode && <p className="text-red-500 text-sm">{errors.postcode.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">House Number*</label>

                                <Controller
                                    name="houseNumber"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "House number is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="House number"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.houseNumber && <p className="text-red-500 text-sm">{errors.houseNumber.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">Addition</label>

                                <Controller
                                    name="addition"
                                    defaultValue=''
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Addition"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">Street*</label>

                                <Controller
                                    name="street"
                                    defaultValue=''
                                    control={control}
                                    rules={{ required: "Street is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Street"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.street && <p className="text-red-500 text-sm">{errors.street.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">City*</label>

                                <Controller
                                    name="city"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "City is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="City"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">Country*</label>
                                <Controller
                                    name="country"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "Country is a required field" }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Country</option>
                                            {countries && countries.map((country: any) =>
                                                <option key={country._id} value={country.name}>{country.name}</option>
                                            )}
                                        </select>
                                    )}
                                />
                                {errors.country && <p className="text-red-500 text-sm">{errors.country.message}</p>}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <div className="flex gap-3 p-3 pe-6">
                            <Button
                                onClick={handleCancel}
                                variant='outlined'
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit(onSubmit)}
                                variant="contained"
                                color="primary"
                            >
                                {data ? "Submit" : 'Submit'}
                            </Button>
                        </div>
                    </DialogActions>
                </div>

            </Dialog>
        </>
    );
};

export default PilotsForm;
