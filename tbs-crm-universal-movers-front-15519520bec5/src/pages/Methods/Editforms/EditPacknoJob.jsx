import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Radio } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useForm } from 'react-hook-form';
import EditForm from '../Forms/EditForm';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';

const EditPacknoJob = ({ open, onClose, data }) => {
    const [selectedForm, setSelectedForm] = useState('');
    const [vatSelected, setVatSelected] = useState(null);
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

    useEffect(() => {
        reset();
        if (data) {
            const reversedData = reverseApiData(data);
            Object.keys(reversedData).forEach(key => {
                setValue(key, reversedData[key]);
            });
            setVatSelected(data.vat);
        }
    }, [data, setValue]);

    const handleFormChange = (event) => {
        setSelectedForm(event.target.value);
    };

    const handleVatSelect = (type) => {
        setVatSelected(type);
    };
    function formatApiData(data) {
        const formattedData = {
            name: data.name,
            ignoreRules: data.ignoreRules,
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
        updatePackage(formattedData)
    }

    const updatePackage = async (packageData) => {
        console.log(packageData)
        try {
            const response = await axios.post(`${apiPath}/api/packages/${data._id}`, packageData);
            console.log('Package updated:', response.data);
            reset();
            alert('Form submitted successfully');
            onClose();
        } catch (error) {
            console.error('Error updating package:', error.response.data.message || 'Unknown error');
        }
    };

    const onSubmit = (formData) => {
        let finalData = { ...formData, vat: vatSelected };
        formatApiData(finalData);
    };

    function reverseApiData(formattedData) {
        const data = {
            name: formattedData.name,
            ignoreRules: formattedData.ignoreRules,
            type_job: formattedData.type_job,
            priceAgree: formattedData.priceAgree,
            vat: formattedData.vat
        };

        const sections = ['offers', 'invoice'];
        sections.forEach(section => {
            if (formattedData[section]) {
                Object.keys(formattedData[section]).forEach(key => {
                    if (key !== 'rules') {
                        data[`${section}_${key}`] = formattedData[section][key];
                    }
                });
                if (formattedData[section].rules) {
                    data[`${section}rules`] = formattedData[section].rules;
                }
            }
        });
        return data;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
            <div className='p-6'>
                <DialogTitle>
                    <div className="flex justify-between items-center">
                        <span>Package</span>
                        <IconButton onClick={onClose}>
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

                        {/* Select Offer or Invoice */}
                        <div className="flex items-center justify-center mb-6">
                            {/* Offers Option */}
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors me-4 duration-300 ${selectedForm === 'offers' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('offers')}
                            >
                                <div className={`flex items-center justify-center p-5 border rounded-full ${selectedForm === 'offers' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <DescriptionIcon style={{fontSize:'45px'}}/>
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
                            <div className="w-30 mb-3 h-1 bg-gray relative">
                                <div className="absolute inset-0 bg-blue" />
                            </div>
                            <div
                                className={`flex flex-col items-center cursor-pointer transition-colors duration-300 ${selectedForm === 'invoice' ? 'text-blue' : 'text-black'}`}
                                onClick={() => setSelectedForm('invoice')}
                            >
                                <div className={`border p-5 flex items-center justify-center rounded-full ${selectedForm === 'invoice' ? 'bg-blue text-white' : 'bg-green text-black'}`}>
                                    <ReceiptIcon style={{fontSize:'45px'}}/>
                                </div>
                                <Radio
                                    checked={selectedForm === 'invoice'}
                                    value="invoice"
                                    style={{ display: "none" }}
                                    className="p-0 mt-2"
                                    size="small"
                                />
                                <span className="text-sm font-medium">Invoice without job</span>
                            </div>
                        </div>

                        {/* Conditional Forms */}
                        <div style={{ display: selectedForm === 'offers' ? 'block' : 'none' }}>
                            <EditForm register={register} errors={errors} type="offers" watch={watch} setValue={setValue} data={data?.offers} />
                        </div>
                        <div style={{ display: selectedForm === 'invoice' ? 'block' : 'none' }}>
                            <EditForm register={register} errors={errors} type="invoice" watch={watch} setValue={setValue} data={data?.invoice} />
                        </div>

                        <DialogActions>
                            <Button onClick={onClose} variant="outlined">Cancel</Button>
                            <Button type="submit" variant="contained" color="primary">Update</Button>
                        </DialogActions>
                    </form>
                </DialogContent>
            </div>
        </Dialog>
    );
};

export default EditPacknoJob;
