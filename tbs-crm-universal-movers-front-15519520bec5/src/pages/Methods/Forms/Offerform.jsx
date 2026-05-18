import React, { useEffect, useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Button, Divider, TextField, Select, MenuItem, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionIcon from '@mui/icons-material/Description';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useForm } from 'react-hook-form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Checkbox } from '@mui/material';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';

const OffersForm = ({ register, errors, type, watch, setValue }) => {
    const [rules, setRules] = useState([]);
    const [vatSelected, setVatSelected] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [template, setTemplate] = useState([]);
    const [inputField, setInputFields] = useState([]);
    const [salesgroup, setSales] = useState([]);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleVatSelect = (item) => {
        setVatSelected(item);
    };

    const handleTemplateChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedTemplate(selectedValue);
    };

    const addFixedRule = (isCalculated) => {
        setRules([...rules, {
            salesGroup: '',
            description: '',
            number: '',
            unitPrice: '',
            btw: '',
            enabled: true,
            isCalculated: isCalculated, // Flag to determine dropdown or input
        }
        ]);
    };


    const deleteRule = (index) => {
        setRules(rules.filter((_, i) => i !== index));
    };

    const handletemplate = async () => {
        try {
            let response = await axios.get(apiPath + `/api/templates?type=${type == 'offers' ? 'quote' : 'invoice'}`)
            setTemplate(response.data)
        } catch (error) {
            console.error('Error fetching package:', error.message);
        }
    }
    const handleAllinputs = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`);
            setInputFields(response.data[0]?.extraFields)
        } catch (err) {
            console.error(err);
        }
    };
    const handlesalesgroup = async () => {
        try {
            let response = await axios.get(apiPath + "/api/sale_group?type=salesGroup")
            setSales(response.data)
        } catch (error) {
            console.error('Error fetching package:', error.message);
        }
    }
    useEffect(() => {
        if (selectedTemplate) {
            handleAllinputs()
        }
    }, [selectedTemplate]);

    useEffect(() => {
        handletemplate();
        handlesalesgroup()
    }, [])

    const toggleClockIcon = (index) => {
        setRules(rules.map((rule, i) =>
            i === index ? { ...rule, isClockSelected: !rule.isClockSelected } : rule
        ));
    };

    return (
        <>
            <div className="mx-5">
                <div className="mb-4">
                    <label className="block font-bold text-sm mb-2">Use Invoice moment ?</label>
                    <div className="space-x-2">
                        <button
                            type='button'
                            className={`px-4 py-2 rounded-md border focus:outline-none ${showConfirmation
                                ? 'bg-blue text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray'
                                }`}
                            onClick={() => setShowConfirmation(true)}
                        >
                            Yes
                        </button>
                        <button
                            type='button'

                            className={`px-4 py-2 rounded-md border focus:outline-none ${!showConfirmation
                                ? 'bg-blue text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray'
                                }`}
                            onClick={() => setShowConfirmation(false)}
                        >
                            No
                        </button>
                    </div>
                </div>

                {showConfirmation && <div>
                    <div>
                        <div className="w-full mb-3">
                            <label className="block font-bold text-sm mb-2">Financial Template</label>
                            <select
                                {...register(`${type}_financialTemplate`)}
                                onChange={handleTemplateChange}
                                className="w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Template</option>
                                {template && template.map((item, index) =>
                                    <option key={index} value={item._id}>{item.name}</option>
                                )}
                            </select>
                            {selectedTemplate && inputField && (
                                <div className="flex mt-4 mb-5" style={{ flexWrap: "wrap", gap: "18px" }}>
                                    {inputField.map((field, index) => (
                                        <div key={index} style={{ width: "49%" }} className=''>
                                            <label className="block text-black pb-1">{field.label}</label>
                                            <input
                                                {...register(`${type}_${field.name}`)}
                                                placeholder={field.label}
                                                type={field.type}
                                                className="w-full p-2 border border-gray"
                                            />
                                            {errors[`jobinput_${field.name}`] && <p className="text-red-500 text-xs">Field is required</p>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex mb-4 space-x-4">
                            <div className="w-1/2">
                                <label className="block font-bold text-sm mb-2">Discount Description</label>
                                <input
                                    {...register(`${type}_discountDescription`)}
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter discount description"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block font-bold text-sm mb-2">Percentage</label>
                                <input
                                    {...register(`${type}_percentage`)}
                                    className="w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter %"
                                    type="number"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray">
                                    <th className="border border-gray w-1/8 py-3">Sales Group</th>
                                    <th className="border border-gray w-1/3 py-3">Description</th>
                                    <th className="border border-gray w-1/6 py-3">Quantity</th>
                                    <th className="border border-gray w-1/6 py-3">Unit Price</th>
                                    <th className="border border-gray w-1/15 py-3">BTW</th>
                                    <th className="border border-gray w-1/15 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rules.map((rule, index) => (
                                    <tr key={index} className="hover:bg-gray">
                                        <td className="">
                                            <select
                                                className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                {...register(`${type}rules[${index}].salesGroup`)}
                                            >
                                                <option value="">Select</option>
                                                {salesgroup && salesgroup.map((item, i) => (
                                                    <option key={i} value={item._id}>{item.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="">
                                            <textarea
                                                {...register(`${type}rules[${index}].description`)}
                                                className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Description"
                                            ></textarea>
                                        </td>
                                        <td className="">
                                            {rule.isCalculated ? (
                                                <select
                                                    {...register(`${type}rules[${index}].number`)}
                                                    className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Which Part should be use for Qunatity</option>
                                                    <option value="{{relocation_totalVolume}}">Total Volume</option>
                                                    <option value="{{relocation_movers}}">Movers</option>
                                                    <option value="{{relocation_requiredHours}}">Hours</option>
                                                    <option value="{{relocation_totalBoxes}}">Box Quantity</option>
                                                    <option value="{{relocation_travelTime}}">Travel Time</option>
                                                    <option value="{{relocation_distance}}">Distance</option>
                                                    <option value="{{movingLift_quantity}}">Moving Lift</option>
                                                    <option value="{{assembling_requiredHours}}">Assembling Hour</option>
                                                    <option value="{{disassembling_requiredHours}}">dismantle Hour</option>
                                                    <option value="{{total_handyman}}">Number of Handyman</option>
                                                    <option value="{{packing_requiredHours}}">Packing Hours</option>
                                                    <option value="{{packing_requiredPackers}}">Packers</option>
                                                    <option value="{{unpacking_requiredHours}}">Unpacking hours</option>
                                                    <option value="{{unpacking_requiredPackers}}">Unpackers</option>
                                                    <option value="{{certificate_quantity}}">Warranty Certificate</option>
                                                    <option value="{{insurance_quantity}}">Insurance</option>
                                                    <option value="{{storage_storageVolume}}">Storage Volume</option>
                                                </select>
                                            ) : (
                                                <input
                                                    {...register(`${type}rules[${index}].number`)}
                                                    className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Number"
                                                    type="number"
                                                />
                                            )}
                                        </td>
                                        <td className="">
                                            {rule.isCalculated ? (
                                                <select
                                                    {...register(`${type}rules[${index}].unitPrice`)}
                                                    className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="">Which component is use for Price</option>
                                                    <option value="{{relocation_pricePerMeterCubic}}">Total Volume</option>
                                                    <option value="{{moverPrice}}">Movers</option>
                                                    <option value="{{relocation_pricePerMeterCubic}}">Hours</option>
                                                    <option value="{{boxCharges}}">Box Quantity</option>
                                                    <option value="{{relocation_pricePerHour}}">Travel Time</option>
                                                    <option value="{{relocation_pricePerKilometer}}">Distance</option>
                                                    <option value="{{movingLift_price}}">Moving Lift</option>
                                                    <option value="{{assembling_appliedPrice}}">Assembling Hour</option>
                                                    <option value="{{disassembling_appliedPrice}}">dismantle Hour</option>
                                                    <option value="{{handymanCharge}}">Number of Handyman</option>
                                                    <option value="{{packing_appliedPrice}}">Packing Hours</option>
                                                    <option value="{{packersCharge}}">Packers</option>
                                                    <option value="{{unpacking_appliedPrice}}">Unpacking hours</option>
                                                    <option value="{{packerCharge}}">Unpackers</option>
                                                    <option value="{{certificate_price}}">Warranty Certificate</option>
                                                    <option value="{{insurance_price}}">Insurance</option>
                                                    <option value="{{storage_appliedPrice}}">Storage Volume</option>
                                                </select>
                                            ) : (
                                                <input
                                                    {...register(`${type}rules[${index}].unitPrice`)}
                                                    className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Unit Price"
                                                    type="number"
                                                />
                                            )}

                                        </td>
                                        <td className="">
                                            <select
                                                className="w-full p-2 border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                {...register(`${type}rules[${index}].btw`)}
                                            >
                                                <option value="">Select</option>
                                                <option value="0">0%</option>
                                                <option value="9">9%</option>
                                                <option value="21">21%</option>
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <Checkbox
                                                {...register(`${type}rules[${index}].enabled`)}
                                                defaultChecked
                                            />
                                            <input
                                                type="hidden"
                                                {...register(`${type}rules[${index}].isCalculated`)}
                                                value={rule.isCalculated}
                                            />
                                            {/* <IconButton onClick={() => toggleClockIcon(index)}>
                                                <AccessTimeIcon className={`${rule.isClockSelected ? 'text-blue' : 'text-black'}`} />
                                            </IconButton> */}
                                            <IconButton onClick={() => deleteRule(index)}>
                                                <DeleteIcon className="text-red" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={() => addFixedRule(true)}>
                            Add Calculated Rule
                        </Button>
                        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />} onClick={() => addFixedRule(false)}>
                            Add Fixed Rule
                        </Button>
                    </div>

                </div>}
            </div>
        </>
    );
};

export default OffersForm;
