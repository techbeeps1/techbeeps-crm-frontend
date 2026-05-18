import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { apiPath } from "../../../../apiPath";
import axios from "axios";
import { toast } from 'react-toastify';
import Loader from "../../../common/Loader";

const StorageLocationForm: React.FC<any> = ({ warehouse, type, data, handler }) => {
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
            setValue('warehouse', data && data.warehouse?._id || "")
        }
    }, [reset, data])

    const wareHouseHandlers = async (Formdata: any) => {
        setLoading(true)
        let path = `${apiPath}/api/storage_loaction`;
        if (data && data._id) {
            path = `${path}/${data?._id}`;
        }
        try {
            const response = await axios.post(path, { ...Formdata}, {
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
                {data ? 'Edit Detail' : `New location`}
            </Button>
            <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
                <div className="p-4">
                    <DialogTitle>
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-primary mb-1" style={{ fontSize: '28px' }}>{data ? "Update" : 'Create New'} {type} location</span>
                            <IconButton onClick={handleCancel}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                        <p className="text-sm">Create a new storage location, after which you can link items and storage to the storage location.</p>
                    </DialogTitle>
                    <DialogContent>
                        {loading && <Loader />}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-5 mb-5">
                            <div>
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
                            <div>
                                <label className="block text-md font-medium pb-2">Code*</label>

                                <Controller
                                    name="code"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "Code is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="Code"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
                            </div>
                            <div>
                                <label className="block text-md font-medium pb-2">Description*</label>

                                <Controller
                                    name="description"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "description is a required field" }}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            type="text"
                                            placeholder="description"
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    )}
                                />
                                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
                            </div>
                            <div>
                                <label className="block text-md font-medium pb-2">Warehouse*</label>

                                <Controller
                                    name="warehouse"
                                    control={control}
                                    defaultValue=''
                                    rules={{ required: "warehouse is a required field" }}
                                    render={({ field }) => (
                                        <select
                                            {...field}
                                            className="w-full p-3 shadow border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select warehouse</option>
                                            {warehouse && warehouse.map((item:any) =>
                                                <option key={item._id} value={item._id}>{item.name}</option>
                                            )}
                                        </select>
                                    )}
                                />
                                {errors.warehouse && <p className="text-red-500 text-sm">{errors.warehouse.message}</p>}
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
                </div >
            </Dialog >
        </>
    );
};

export default StorageLocationForm;
