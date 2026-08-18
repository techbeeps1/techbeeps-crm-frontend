import React, { useState, useEffect } from 'react';
import {
    Modal,
    Box,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useForm, useFieldArray } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import Loader from '../../../common/Loader/index';
import ReactDatePicker from '../../../common/ReactDatepicker';
import { 
    MdOutlineSwapVert, 
    MdAdd, 
    MdClose, 
    MdDeleteOutline, 
    MdInventory2 
} from 'react-icons/md';

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
    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const onSubmit = (formData: any) => {
        storageHandlers({ 
            ...formData, 
            percentageFill: ((totalVolume / (storageData?.cubicMeter || 1)) * 100).toFixed(2), 
            events: formData.rows, 
            costAction: handlingCost === 'Yes' && formData.action ? [formData.action] : [] 
        });
    };

    const volumeHandler = watch('rows');

    const totalVolume = volumeHandler?.reduce((acc: any, item: any) => {
        if (item.contents) {
            return acc + Number(item.contents);
        }
        return acc;
    }, 0) || 0;

    useEffect(() => {
        if (storageData && storageData.cubicMeter < totalVolume) {
            alert(`Storage has only ${storageData.cubicMeter} m³ Space`);
        }
        setValue('totalVolume', totalVolume);
    }, [totalVolume]);

    const storageHandlers = async (formData: any) => {
        setLoading(true);
        let path = `${apiPath}/api/storages/${storageData?._id}`;
        try {
            const response = await axios.put(path, formData);
            if (response.status === 201 || response.status === 200) {
                handler();
                setOpen(false);
                reset();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Something went wrong. Please try again.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storageData?.events) {
            reset({
                ...storageData,
                rows: storageData?.events.map((item: any) => ({
                    ...item,
                    loadedOn: item.loadedOn ? new Date(item.loadedOn) : null,
                    ReleasedOn: item.ReleasedOn ? new Date(item.ReleasedOn) : null,
                    loadedByEmployee: item.loadedByEmployee?._id || item.loadedByEmployee,
                    ReleasedByEmployee: item.ReleasedByEmployee?._id || item.ReleasedByEmployee,
                    storageLocation: item.storageLocation?._id || item.storageLocation
                })),
            });
        }
    }, [storageData, reset]);

    const handleAllEmploye = async () => {
        try {
            const response = await axios.get(`${apiPath}/user/all`);
            let Employee = response["data"]?.map((team: any) => { 
                return { label: team.username, value: team._id }; 
            }) || [];
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
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
                <MdOutlineSwapVert className="w-4 h-4" />
                <span>Loading & Unloading</span>
            </button>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Modal open={open} onClose={handleClose}>
                    <Box className="fixed inset-0 flex items-center justify-center p-4 z-50">
                        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose}></div>

                        <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto border border-slate-100 z-10">
                            {loading && <Loader />}
                            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                                        <MdInventory2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            Loading & Unloading ({storageData?.storageCode})
                                        </h3>
                                        <p className="text-xs text-slate-500">Manage loaded inventory items and release records</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    <MdClose className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">Stored Items & Handling</h4>
                                        <p className="text-xs text-slate-500">
                                            Capacity filled: <span className="font-bold text-indigo-600">{totalVolume} m³</span> of {storageData?.cubicMeter} m³
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => append({ 
                                            description: '', 
                                            itemCode: '', 
                                            externalCode: '', 
                                            contents: '', 
                                            storageLocation: storageData?.storageLocation?._id || '', 
                                            loadedOn: '', 
                                            ReleasedOn: null, 
                                            loadedByEmployee: null, 
                                            ReleasedByEmployee: null, 
                                            loadedByCustomer: false 
                                        })}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                    >
                                        <MdAdd className="w-4 h-4" />
                                        <span>Add Item Row</span>
                                    </button>
                                </div>

                                {/* Items Table */}
                                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                                <th className="p-3 text-left">Description</th>
                                                <th className="p-3 text-left">Item Code</th>
                                                <th className="p-3 text-left">Ext Code</th>
                                                <th className="p-3 text-left">Vol (m³)</th>
                                                <th className="p-3 text-left">Loaded On</th>
                                                <th className="p-3 text-left">Released On</th>
                                                <th className="p-3 text-left">Loaded By</th>
                                                <th className="p-3 text-left">Released By</th>
                                                <th className="p-3 text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {fields.map((field: any, index: any) => (
                                                <tr key={field.id} className="hover:bg-slate-50/50">
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Description"
                                                            {...register(`rows.${index}.description`, { required: 'Required' })}
                                                            className="w-full min-w-[140px] px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Code"
                                                            {...register(`rows.${index}.itemCode`)}
                                                            className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Ext Code"
                                                            {...register(`rows.${index}.externalCode`)}
                                                            className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            min={0}
                                                            placeholder="0"
                                                            {...register(`rows.${index}.contents`)}
                                                            className="w-16 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <ReactDatePicker
                                                            control={control}
                                                            name={`rows.${index}.loadedOn`}
                                                            rules={{ required: "Date is required" }}
                                                            placeholderText="Loaded"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <ReactDatePicker
                                                            control={control}
                                                            name={`rows.${index}.ReleasedOn`}
                                                            placeholderText="Released"
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            {...register(`rows.${index}.loadedByEmployee`, { required: 'Required' })}
                                                            className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        >
                                                            <option value="">Loaded by</option>
                                                            {data && data.map((item: any) => (
                                                                <option key={item.value} value={item.value}>{item.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2">
                                                        <select
                                                            {...register(`rows.${index}.ReleasedByEmployee`)}
                                                            className="w-28 px-2 py-1.5 border border-slate-300 rounded-lg text-xs"
                                                        >
                                                            <option value="">Released by</option>
                                                            {data && data.map((item: any) => (
                                                                <option key={item.value} value={item.value}>{item.label}</option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete row"
                                                        >
                                                            <MdDeleteOutline className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                        Notes
                                    </label>
                                    <input
                                        type="text"
                                        className="block w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 focus:border-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-800"
                                        {...register("notes")}
                                        placeholder="Notes about loading or release..."
                                    />
                                </div>

                                {/* Handling Costs Section */}
                                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900">Handling Costs</h4>
                                            <p className="text-xs text-slate-500">Do you want to invoice additional handling costs?</p>
                                        </div>
                                        <div className="flex gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                                            {['Yes', 'No'].map((option) => (
                                                <button
                                                    type="button"
                                                    key={option}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                        handlingCost === option 
                                                            ? "bg-white text-indigo-600 shadow-sm" 
                                                            : "text-slate-600 hover:text-slate-900"
                                                    }`}
                                                    onClick={() => setHandlingCost(option)}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {handlingCost === 'Yes' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-200/60">
                                            <div className="sm:col-span-3">
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Handling Description
                                                </label>
                                                <input
                                                    type="text"
                                                    className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium"
                                                    {...register("action.description")}
                                                    placeholder="e.g. Unloading forklift handling fee"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Amount ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium"
                                                    {...register("action.price")}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Quantity
                                                </label>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    className="block w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl font-medium"
                                                    {...register("action.quantity")}
                                                    placeholder="1"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                                                    Action Date
                                                </label>
                                                <ReactDatePicker
                                                    control={control}
                                                    name="action.actionDate"
                                                    rules={{ required: "Date is required" }}
                                                    placeholderText="Select date"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={storageData?.cubicMeter < totalVolume}
                                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Box>
                </Modal>
            </LocalizationProvider>
        </>
    );
};

export default LoadingandUnloadingForm;
