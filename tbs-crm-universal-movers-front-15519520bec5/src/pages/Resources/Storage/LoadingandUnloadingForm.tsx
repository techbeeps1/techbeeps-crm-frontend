import React, { useState, useEffect } from 'react';

import {
    Button,
    IconButton,
    Modal,
    Box,
    Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, useFieldArray } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import Loader from '../../../common/Loader/index';
import ReactDatePicker from '../../../common/ReactDatepicker';

const LoadingandUnloadingForm: React.FC<any> = ({ handler, storageData }) => {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState([]);

    const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
        defaultValues: {
            rows: [{ description: '', itemCode: '', externalCode: '', contents: '', storageLocation: "", loadedOn: '', ReleasedOn: '', loadedByEmployee: null, ReleasedByEmployee: null, loadedByCustomer: false }],
        },
    }) as any;

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'rows',
    });

    const [handlingCost, setHandlingCost] = useState<any>('No');
    const [loading, setLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const handleClose = () => setOpen(false);

    const onSubmit = (data: any) => {
        storageHandlers({ ...data, percentageFill: ((totalVolume / storageData.cubicMeter) * 100).toFixed(2), events: data.rows, costAction: data.action })
    };

    const volumeHandler = watch('rows');

    const totalVolume = volumeHandler?.reduce((acc: any, item: any) => {
        if (item.contents) {
            return acc + Number(item.contents);
        }
        return acc;
    }, 0);

    useEffect(() => {
        if (storageData.cubicMeter < totalVolume) {
            alert(`Storage has only ${storageData.cubicMeter} m\u00B3 Space`);
        }
        setValue('totalVolume', totalVolume)
    }, [totalVolume])

    const storageHandlers = async (data: any) => {
        setLoading(true)
        let path = `${apiPath}/api/storages/${storageData?._id}`;
        try {
            const response = await axios.put(path, data);
            if (response.status === 201 || response.status === 200) {
                handler();
                setOpen(false);
                reset();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        reset({
            ...storageData,
            rows: storageData?.events.map((item: any) => ({
                ...item,
                loadedOn: new Date(item.loadedOn), // Convert to Date object
                ReleasedOn: new Date(item.ReleasedOn),
                loadedByEmployee: item.loadedByEmployee?._id,
                ReleasedByEmployee: item.ReleasedByEmployee?._id,
                storageLocation: item.storageLocation?._id
            })),
        });
    }, [storageData, reset, data,])

    const handleAllEmploye = async () => {
        try {
            const response = await axios.get(`${apiPath}/user/all`);
            let Employee = response["data"].map((team: any) => { return { label: team.username, value: team._id } });
            setData(Employee);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        handleAllEmploye();
    }, []);

    return (
        <>
            <div>
                <button
                    onClick={() => setOpen(true)}
                    className="px-3 py-2 h-auto text-lg font-semibold bg-sky-700 text-red-600 border border-red-600 rounded hover:bg-red-600 text-white transition duration-300"
                >
                    Loading and Unloading
                </button>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Modal open={open} onClose={handleClose}>
                        <Box className="bg-white p-5 rounded-lg shadow-lg mx-auto relative overflow-y-auto" style={{ maxHeight: '100vh' }}>
                            {loading && <Loader />}
                            <div className="flex justify-between items-center mb-3">
                                <div className='flex gap-8'>
                                    <Typography variant="h4" component="h2" className="pb-2">
                                        Loading and Unloading {storageData.storageCode}
                                    </Typography>
                                </div>
                                <IconButton
                                    onClick={handleClose}
                                    className="absolute top-0 right-2 text-gray hover:text-black"
                                >
                                    <CloseIcon />
                                </IconButton>
                            </div>
                            <div>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {activeStep === 0 && (
                                        <>
                                            <div style={{ margin: 'auto', minHeight: "76vh" }}>
                                                <div className="flex gap-3 my-4">
                                                    <div className='w-full'>
                                                        <label className="block font-medium text-lg mb-2">Notes</label>
                                                        <input
                                                            type="text"
                                                            className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                            {...register("notes")}
                                                            placeholder="Notes"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => append({ description: '', itemCode: '', externalCode: '', contents: '', storageLocation: null, loadedOn: '', ReleasedOn: null, loadedByEmployee: null, ReleasedByEmployee: null, loadedByCustomer: false })}
                                                        className="px-4 py-2 mb-3  bg-blue text-white border border-danger font-medium text-lg rounded hover:bg-blue"
                                                    >
                                                        Add Row
                                                    </button>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full bg-white">
                                                        <thead>
                                                            <tr>
                                                                <th className="p-2 border border-gray">Description</th>
                                                                <th className="p-2 border border-gray">Item Code</th>
                                                                <th className="p-2 border border-gray">External Code</th>
                                                                <th className="p-2 border border-gray">Contents</th>
                                                                <th className="p-2 border border-gray">Storage Location</th>
                                                                <th className="p-2 border border-gray">Loaded on</th>
                                                                <th className="p-2 border border-gray">Released On</th>
                                                                <th className="p-2 border border-gray">Loaded by Employee</th>
                                                                <th className="p-2 border border-gray">Released by Employee</th>
                                                                <th className="p-2 border border-gray">Loaded By Customer</th>
                                                                <th className="p-2 border border-gray">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {fields.map((field: any, index: any) => (
                                                                <tr key={field.id}>
                                                                    <td className="p-2 border border-gray">
                                                                        <input
                                                                            type="text"
                                                                            {...register(`rows.${index}.description`, { required: 'Description is required' })}
                                                                            className={`w-full p-2 border ${errors.rows?.[index]?.description ? 'border-red-500' : 'border-gray'}`}
                                                                        />
                                                                        {errors.rows?.[index]?.description && (
                                                                            <p className="text-red-500 text-sm">{errors.rows[index].description.message}</p>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <input
                                                                            type="text"
                                                                            {...register(`rows.${index}.itemCode`)}
                                                                            className="w-full p-2 border border-gray"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <input
                                                                            type="text"
                                                                            {...register(`rows.${index}.externalCode`)}
                                                                            className="w-full p-2 border border-gray"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <input
                                                                            type="number"
                                                                            min={0}
                                                                            {...register(`rows.${index}.contents`)}
                                                                            className="w-full p-2 border border-gray"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <select
                                                                            className="w-full p-2 border border-gray"
                                                                            {...register(`rows.${index}.storageLocation`, { required: 'Description is required' })}
                                                                        >
                                                                            {storageData && <option value={storageData?.storageLocation?._id || null}>{storageData?.storageLocation?.name}</option>}
                                                                        </select>
                                                                        {errors.rows?.[index]?.storageLocation && (
                                                                            <p className="text-red-500 text-sm">{errors.rows[index].storageLocation.message}</p>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <ReactDatePicker
                                                                            control={control}
                                                                            name={`rows.${index}.loadedOn`}
                                                                            rules={{ required: "Date is required" }}
                                                                            placeholderText=""
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <ReactDatePicker
                                                                            control={control}
                                                                            name={`rows.${index}.ReleasedOn`}
                                                                            placeholderText=""
                                                                        />
                                                                    </td>

                                                                    <td className="p-2 border border-gray">
                                                                        <select
                                                                            className="w-full p-2 border border-gray"
                                                                            {...register(`rows.${index}.loadedByEmployee`, { required: 'field is required' })}
                                                                        >
                                                                            {data && data.map((item: any) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                                                        </select>
                                                                        {errors.rows?.[index]?.loadedByEmployee && (
                                                                            <p className="text-red-500 text-sm">{errors.rows[index].loadedByEmployee.message}</p>
                                                                        )}
                                                                    </td>
                                                                    <td className="p-2 border border-gray">
                                                                        <select
                                                                            className="w-full p-2 border border-gray"
                                                                            {...register(`rows.${index}.ReleasedByEmployee`)}
                                                                        >
                                                                            {data && data.map((item: any) => <option key={item.value} value={item.value}>{item.label}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td className="p-2 border border-gray text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            {...register(`rows.${index}.loadedByCustomer`)}
                                                                            className="h-5 w-5"
                                                                        />
                                                                    </td>
                                                                    <td className="p-2 border border-gray text-center">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => remove(index)}
                                                                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                                        >
                                                                            Delete
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="flex w-full mt-6 gap-5">
                                                    <div className='w-full'>
                                                        <p className="font-bold text-xl mb-2">The cost of handling -</p>
                                                        <div className="mb-4">
                                                            <p className="font-medium text-lg mb-2">Do you want to invoice the handling costs ?</p>
                                                            <div className="flex space-x-2">
                                                                {['Yes', 'No'].map((option) => (
                                                                    <button
                                                                        type="button"
                                                                        key={option}
                                                                        className={`w-full px-4 py-2 border text-lg font-medium rounded ${handlingCost === option ? "bg-blue text-white" : "bg-gray"}`}
                                                                        onClick={() => setHandlingCost(option)}
                                                                    >
                                                                        {option}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {handlingCost === 'Yes' && <>
                                                            <div className='w-full mb-4'>
                                                                <label className="block font-medium text-lg mb-2">Description</label>
                                                                <input
                                                                    type="text"
                                                                    className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                    {...register("action.description")}
                                                                    placeholder="Description"
                                                                />
                                                            </div>
                                                            <div className="flex gap-3 my-4">
                                                                <div className='w-full'>
                                                                    <label className="block font-medium text-lg mb-2">Amount</label>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                        {...register("action.price")}
                                                                        placeholder="Enter price"
                                                                    />
                                                                </div>
                                                                <div className='w-full'>
                                                                    <label className="block font-medium text-lg mb-2">Quantity</label>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        className="w-full px-4 py-2 border border-gray rounded outline-none text-lg"
                                                                        {...register("action.quantity")}
                                                                        placeholder="Quantity"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <label className="block font-medium text-lg mb-2">Action Date</label>
                                                                <ReactDatePicker
                                                                    control={control}
                                                                    name="action.actionDate"
                                                                    rules={{ required: "Date is required" }}
                                                                    placeholderText="Select date"
                                                                />
                                                            </div>
                                                        </>}
                                                    </div>
                                                    <div className='w-full flex gap-5'>
                                                        {storageData.invoicePerVolume && <>
                                                            <p className="font-bold text-xl mb-2">Volume based billing -</p>
                                                            <p className="font-bold text-lg mb-2">Allowed</p>
                                                        </>}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <Box className="flex justify-end mt-6 mb-5">
                                        <Button
                                            variant="contained"
                                            disabled ={storageData.cubicMeter < totalVolume}
                                            color="primary"
                                            size='large'
                                            onClick={handleSubmit(onSubmit)}
                                        >
                                            {'Submit'}
                                        </Button>
                                    </Box>
                                </form>
                            </div>
                        </Box>
                    </Modal>
                </LocalizationProvider>

            </div>

        </>
    );
};

export default LoadingandUnloadingForm;
