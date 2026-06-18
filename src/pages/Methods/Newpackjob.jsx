import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Divider, TextField, Select, MenuItem, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useForm } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Checkbox } from '@mui/material';
import OffersForm from './Forms/Offerform';
import { apiPath } from '../../../apiPath';
import axios from 'axios';

const NewPackjob = ({ open, onClose }) => {
    const [selectedForm, setSelectedForm] = useState('');
    const [vatSelected, setVatSelected] = useState(null);
    const [priceAgree, setPriceAgree] = useState();
    const [template, setTemplate] = useState([]);
    const { register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm();

    const handleFormChange = (event) => {
        setSelectedForm(event.target.value);
    };

    const handleVatSelect = (type) => {
        setVatSelected(type);
    };

    const createPackage = async (packageData) => {
        if (!packageData.name) {
            alert('Package name is required');
            return;
        }
        if (packageData.name.length < 2 || packageData.name.length > 55) {
            alert('Package name must be between 2 and 55 characters');
            return;
        }
        if(packageData?.invoice?.discountDescription.trim()===''){
alert('Please enter a discount description for the invoice');
return;
        }
         if(packageData?.invoice?.discountDescription.length < 5 || packageData?.invoice?.discountDescription.length > 100){
            alert('Discount description must be between 5 and 100 characters');
            return;
        }
        try {
            const response = await axios.post(`${apiPath}/api/packages`, packageData);
            alert('Form submitted successfully');
            onClose();
            reset();
        } catch (error) {
            console.error('Error creating package:', error.response.data.message || 'Unknown error');
        }
    };

    function formatApiData(data) {
        const formattedData = {
            name: data.name,
            ignoreRules: data.ignoreRules,
            type_job: data.type_job,
            priceAgree: data.priceAgree,
            vat: data.vat
        };
        const sections = ['offers', 'invoice', 'start_job', 'Storage', 'appointment'];
        sections.forEach(section => {
            formattedData[section] = {};
            Object.keys(data).forEach(key => {
                if (key.startsWith(`${section}_`)) {
                    const newKey = key.replace(`${section}_`, '');
                    formattedData[section][newKey] = data[key];
                }
            });
            if (data[`${section}rules`]) {
                formattedData[section].rules = data[`${section}rules`];
            }
        });
        createPackage(formattedData)
    }

    const onSubmit = (data) => {
        let finalData = { ...data, priceAgree: priceAgree, vat: vatSelected };
        formatApiData(finalData);
    };

    return (
        <Dialog open={open} onClose={() => { onClose(); reset() }} maxWidth="xl" fullWidth>
            <div className='p-6'>
                <DialogTitle>
                    <div className="flex justify-between items-center">
                        <span>New Package With Job</span>
                        <IconButton onClick={() => { onClose(); reset() }}>
                            <CloseIcon />
                        </IconButton>
                    </div>
                </DialogTitle>

                <DialogContent className="px-6 py-4">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-4">
                            <label className="block font-bold text-sm mb-2">Name</label>
                            <input
                                {...register('name', { required: true })}
                                className="w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter package name"
                            />
                            {errors.name && <p className="text-red-500 text-sm">Name is required</p>}
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    {...register('ignoreRules')}
                                    className="h-4 w-4"
                                />
                                <span>Ignore rules with a count of 0</span>
                            </label>
                        </div>
                        <div className="mb-4">
                            <select
                                {...register(`type_job`)}
                                className="w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Type</option>
                                <option value="relocation">Relocation</option>
                                <option value="transport">Transport</option>
                                <option value="moving_lift">Moving lift Job</option>

                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold text-sm mb-2">Is the price inclusive or exclusive of VAT?</label>
                            <div className="space-x-2">
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-md border focus:outline-none ${vatSelected === 'inclusive'
                                        ? 'bg-blue text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray'
                                        }`}
                                    onClick={() => handleVatSelect('inclusive')}
                                >
                                    Including VAT
                                </button>
                                <button
                                    type="button"
                                    className={`px-4 py-2 rounded-md border focus:outline-none ${vatSelected === 'exclusive'
                                        ? 'bg-blue text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray'
                                        }`}
                                    onClick={() => handleVatSelect('exclusive')}
                                >
                                    Excluding VAT
                                </button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold text-sm mb-2">Price agreement ?</label>
                            <div className="space-x-2">
                                <button
                                    type='button'
                                    className={`px-4 py-2 rounded-md border focus:outline-none ${priceAgree === 'accepted_job'
                                        ? 'bg-blue text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray'
                                        }`}
                                    onClick={() => setPriceAgree('accepted_job')}
                                >
                                    Accepted Job
                                </button>
                                <button
                                    type='button'

                                    className={`px-4 py-2 rounded-md border focus:outline-none ${priceAgree === 'onhourly_basis'
                                        ? 'bg-blue text-white border-blue-500'
                                        : 'bg-white text-gray-700 border-gray'
                                        }`}
                                    onClick={() => setPriceAgree('onhourly_basis')}
                                >
                                    On an hourly basis
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-evenly mb-10 mt-10 mx-6">
                            {/* Offers Option */}
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors me-4 duration-300 ${selectedForm === 'offers' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('offers')}
                            >
                                <div className={`flex items-center justify-center p-6 border rounded-full ${selectedForm === 'offers' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <DescriptionIcon fontSize="large" />
                                </div>
                                <Radio
                                    checked={selectedForm === 'offers'}
                                    value="offers"
                                    style={{ display: "none" }}
                                    className="p-0 mt-2"
                                    size="small"
                                />
                                <span className="text-sm font-medium">Offers</span>
                            </div>

                            {/* Connecting Line */}
                            <div className="w-30 mb-4 h-1 bg-gray relative">
                                <div className="absolute inset-0 bg-blue" />
                            </div>

                            {/* Invoice Option */}
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${selectedForm === 'invoice' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('invoice')}
                            >
                                <div className={`border p-6 flex items-center justify-center rounded-full ${selectedForm === 'invoice' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <ReceiptIcon fontSize="large" />
                                </div>
                                <Radio
                                    checked={selectedForm === 'invoice'}
                                    value="invoice"
                                    style={{ display: "none" }}

                                    className="p-0 mt-2"
                                    size="small"
                                />
                                <span className="text-sm font-medium">Acceptance of offer</span>
                            </div>
                            <div className="w-30 mb-4 h-1 bg-gray relative">
                                <div className="absolute inset-0 bg-blue" />
                            </div>

                            {/* Invoice Option */}
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${selectedForm === 'start_job' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('start_job')}
                            >
                                <div className={`border p-6 flex items-center justify-center rounded-full ${selectedForm === 'start_job' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <ReceiptIcon fontSize="large" />
                                </div>
                                <Radio
                                    checked={selectedForm === 'start_job'}
                                    value="start_job"
                                    style={{ display: "none" }}

                                    className="p-0 mt-2"
                                    size="small"
                                />
                                <span className="text-sm font-medium">Start job</span>
                            </div>
                            <div className="w-30 mb-4 h-1 bg-gray relative">
                                <div className="absolute inset-0 bg-blue" />
                            </div>

                            {/* Invoice Option */}
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${selectedForm === 'Storage' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('Storage')}
                            >
                                <div className={`border p-6 flex items-center justify-center rounded-full ${selectedForm === 'Storage' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <ReceiptIcon fontSize="large" />
                                </div>
                                <Radio
                                    checked={selectedForm === 'Storage'}
                                    value="Storage"
                                    style={{ display: "none" }}

                                    className="p-0 mt-2"
                                    size="small"
                                />
                                <span className="text-sm font-medium">Storage loaded</span>
                            </div>
                            <div className="w-30 mb-4 h-1 bg-gray relative">
                                <div className="absolute inset-0 bg-blue" />
                            </div>

                            {/* Invoice Option */}
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${selectedForm === 'appointment' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('appointment')}
                            >
                                <div className={`border p-6 flex items-center justify-center rounded-full ${selectedForm === 'appointment' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <ReceiptIcon fontSize="large" />
                                </div>
                                <Radio
                                    checked={selectedForm === 'appointment'}
                                    value="appointment"
                                    style={{ display: "none" }}
                                    className="p-0 mt-2"
                                    size="small"
                                />
                                <span className="text-sm font-medium">After last appointment</span>
                            </div>
                        </div>
                        <div style={{ display: selectedForm === 'offers' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="offers" watch={watch} setValue={setValue} />
                        </div>
                        <div style={{ display: selectedForm === 'invoice' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="invoice" watch={watch} setValue={setValue} />
                        </div>
                        <div style={{ display: selectedForm === 'start_job' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="start_job" watch={watch} setValue={setValue} />
                        </div>
                        <div style={{ display: selectedForm === 'Storage' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="Storage" watch={watch} setValue={setValue} />
                        </div>
                        <div style={{ display: selectedForm === 'appointment' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="appointment" watch={watch} setValue={setValue} />
                        </div>
                        <div>
                            <DialogActions>
                                <Button onClick={onClose} variant="outlined">Cancel</Button>
                                <Button type="submit" variant="contained" color="primary">New Package</Button>
                            </DialogActions>
                        </div>
                    </form>
                </DialogContent>
            </div>
        </Dialog>
    );
};

export default NewPackjob;
