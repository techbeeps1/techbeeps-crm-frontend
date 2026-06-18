import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from "../../../../apiPath";
import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../../../common/Loader";

const BoxFrom: React.FC<any> = ({ type, data, handler }) => {
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
        }
        setValue('ownership', data && data.ownership || "false")
    }, [reset, data, setValue])

    const wareHouseHandlers = async (Formdata: any) => {
        setLoading(true)
        let path = `${apiPath}/api/box`;
        if (data && data._id) {
            path = `${path}/${data?._id}`;
        }
        try {
            const response = await axios.post(path, {...Formdata,inventoryType:type}, {
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
                {data ? 'Edit Detail' : `New ${type}`}
            </Button>
            <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
                <div className="p-4">
                    <DialogTitle className="flex justify-between items-center">
                        <span className="font-semibold text-primary mb-1" style={{ fontSize: '28px' }}>{data ? "Update" : 'Create New'} {type} type</span>
                        <IconButton onClick={handleCancel}>
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>

                        {loading && <Loader />}
                        <div className="w-full mb-5 pt-2">
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
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-5">
                            <div>
                            <label className="block text-md font-medium pb-2">Rental Price*</label>

                                <Controller
                                    name="rentalPrice"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "Rental Price is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="Rental Price"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.rentalPrice && <p className="text-red-500 text-sm">{errors.rentalPrice.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">Selling Price*</label>

                                <Controller
                                    name="sellingPrice"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "Selling Price is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="Selling Price"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.sellingPrice && <p className="text-red-500 text-sm">{errors.sellingPrice.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                            <label className="block text-md font-medium pb-2">length*</label>

                                <Controller
                                    name="length"
                                    defaultValue=''
                                    control={control}
                                    rules={{ required: "length is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="length"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.length && <p className="text-red-500 text-sm">{errors.length.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">Width*</label>

                                <Controller
                                    name="width"
                                    defaultValue=''
                                    control={control}
                                    rules={{ required: "Width is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="Width"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.width && <p className="text-red-500 text-sm">{errors.width.message}</p>}
                            </div>
                            <div>
                            <label className="block text-md font-medium pb-2">Height*</label>

                                <Controller
                                    name="height"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "Height is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="number"
                                            placeholder="height"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.height && <p className="text-red-500 text-sm">{errors.height.message}</p>}
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
                                {data ? "Submit" : `Submit`}
                            </Button>
                        </div>
                    </DialogActions>
                </div >
            </Dialog >
        </>
    );
};

export default BoxFrom;
