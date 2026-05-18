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
import axios from 'axios';
import { apiPath } from '../../../apiPath';

const NewPackageModal = ({ open, onClose}) => {
    const [selectedForm, setSelectedForm] = useState('');
    const [vatSelected, setVatSelected] = useState(null);
    const [rules, setRules] = useState([]);
    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();

    const handleFormChange = (event) => {
        setSelectedForm(event.target.value);
    };

    const handleVatSelect = (type) => {
        setVatSelected(type);
    };

    const addFixedRule = () => {
        setRules([...rules, { description: '', number: '', unitPrice: '', btw: '' }]);
    };

    const deleteRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const toggleClockIcon = (index) => {
        setRules(rules.map((rule, i) =>
            i === index ? { ...rule, isClockSelected: !rule.isClockSelected } : rule
        ));
    };

    const createPackage = async (packageData) => {
        try {
            const response = await axios.post(`${apiPath}/api/packages`, packageData);
            console.log('Package created:', response.data);
            alert('Form submitted successfully');
            reset()
            onClose();
        } catch (error) {
            console.error('Error creating package:', error.response.data.message || 'Unknown error');
        }
    };

    function formatApiData(data) {
        const formattedData = {
            name: data.name,
            ignoreRules: data.ignoreRules,
            vat: data.vat
        };
        const sections = ['offers', 'invoice'];
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
        let finalData = { ...data, vat: vatSelected };
        formatApiData(finalData);
    };

    return (
        <Dialog open={open} onClose={()=>{onClose();reset()}} maxWidth="xl" fullWidth>
            <div className='p-6'>
                <DialogTitle>
                    <div className="flex justify-between items-center">
                        <span>New Package without Job</span>
                        <IconButton onClick={()=>{onClose();reset()}}>
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
                                    className="h-5 w-5"
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
                        <div style={{ display: selectedForm === 'offers' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="offers" watch={watch} setValue={setValue} />
                        </div>
                        <div style={{ display: selectedForm === 'invoice' ? 'block' : 'none' }}>
                            <OffersForm register={register} errors={errors} type="invoice" watch={watch} setValue={setValue} />
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

export default NewPackageModal;
