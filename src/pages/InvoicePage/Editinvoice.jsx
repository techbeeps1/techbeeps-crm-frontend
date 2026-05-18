import React, { useContext, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate, useParams } from 'react-router-dom';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { UserContext } from '../../UserContext';
import Loader from '../../common/Loader';

const EditInvoice = () => {
    const { id } = useContext(UserContext);
    const { Id } = useParams(); // Get invoiceId from the URL parameters
    const queryParams = new URLSearchParams(location.search);

    const type = queryParams.get('type');

    const [packageList, setPackage] = useState([]);
    const [templateList, setTemplate] = useState([]);
    const [vatSelected, setVatSelected] = useState('exclusive');
    const [salesgroup, setSales] = useState([]);
    const [inputField, setInputFields] = useState([]);
    const [loading, setLoading] = useState(true)

    const { register, handleSubmit, control, watch, setValue, formState: { errors },reset } = useForm({
        defaultValues: {
            items: [{ salesgroup: '', description: '', quantity: 1, btw: "", price: 0 }],
            discount: 0
        }
    });

    const handleVatSelect = (type) => {
        setVatSelected(type);
    };
    const [customer, setCustomer] = useState([]);

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'items'
    });

    const items = watch('items');
    const discountPercentage = watch('discount') || 0;
    const selectedTemplate = watch(`financialTemplate`) || "";


    const subtotal = items.reduce((acc, item) => {
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        return acc + quantity * price;
    }, 0);

    const taxTotal = items.reduce((acc, item) => {
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const btw = item.btw || 0;  // tax percentage for each item
        const itemTax = (price * quantity) * (btw / 100);
        return acc + itemTax;
    }, 0);

    const total = subtotal - (subtotal * (discountPercentage / 100)) + taxTotal;


    const navigate = useNavigate();

    const handleClient = async () => {
        try {
            const response = await axios.get(`${apiPath}/customer/customerList`);
            setCustomer(response.data.customers);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setTimeout(() => { fetchInvoice() }, 1);
        }
    };

    const fetchInvoice = async () => {
        try {
            const response = await axios.get(`${apiPath}/invoice/invoice/${Id}`);
            const invoiceData = response.data.invoice;
            reset()
            setValue('customer', invoiceData?.customer?._id);
            setValue('package', invoiceData?.package?._id);
            const formattedDate = new Date(invoiceData?.date).toISOString().split('T')[0];
            setValue('date', formattedDate);
            setValue('financialTemplate', invoiceData?.financialTemplate?._id);
            setValue('reference', invoiceData?.reference);
            setValue('Status', invoiceData?.Status);
            setVatSelected(invoiceData?.vat);
            setValue('ignoreRules', invoiceData?.ignoreRules);
            fields.forEach((_, index) => remove(index));
            if (invoiceData?.items && invoiceData?.items.length > 0) {
                invoiceData?.items.forEach(item => {
                    append({
                        salesgroup: item?.salesgroup?._id,  // Map salesgroup's name to the form field
                        description: item?.description || '',
                        quantity: item?.quantity || 1,
                        btw: item?.btw || '',
                        price: item?.price || 0
                    });
                });
            }
            function reverseRestructureData() {
                const result = {};
                if (invoiceData.jobinput) {
                    Object.keys(invoiceData.jobinput).forEach(key => {
                        result[`jobinput_${key}`] = invoiceData.jobinput[key];
                    });
                }
                Object.keys(result).forEach(key => {
                    setValue(key, result[key]);
                });
            }
            reverseRestructureData()
            
            setValue('discount_description', invoiceData.discount_description || '');
            setValue('discount', invoiceData.discount || 0);

        } catch (error) {
            console.error('Error fetching invoice data:', error);
        }finally{
            setLoading(false)
        }
    };
    const handlePackage = async () => {
        try {
            let response = await axios.get(apiPath + "/api/packages?type=Manual/No job")
            setPackage(response.data)
        } catch (error) {
            console.error('Error fetching package:', error.message);
        }
    }
    const handlesalesgroup = async () => {
        try {
            let response = await axios.get(apiPath + "/api/sale_group?type=salesGroup")
            setSales(response.data)
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
    const handletemplate = async () => {
        try {
            let response = await axios.get(apiPath + "/api/templates?type=invoice")
            setTemplate(response.data)
        } catch (error) {
            console.error('Error fetching package:', error.message);
        }
    }

    const handleInvoice = async (data) => {
        setLoading(true);
        let finalData = restructureData(data);
        try {
            const response = await axios.post(`${apiPath}/invoice/update/${Id}`, finalData);
            console.log('Invoice successfully updated:', response.data);
            alert("Invoice updated successfully");
            navigate(-1);
        } catch (error) {
            console.error('Error updating invoice:', error);
        }finally{
            setLoading(false)
        }
    };
    
    useEffect(() => {
        if (selectedTemplate) {
            handleAllinputs()
        }
    }, [selectedTemplate]);

    useEffect(() => {
        handleClient()
        handlePackage()
        handletemplate()
        handlesalesgroup()
    }, [])

    function restructureData(inputData) {
        const jobinput = {};
        const result = Object.keys(inputData).reduce((acc, key) => {
            if (key.startsWith("jobinput_")) {
                const newKey = key.replace("jobinput_", "");
                jobinput[newKey] = inputData[key];
            } else {
                acc[key] = inputData[key];
            }
            return acc;
        }, {});
        result.jobinput = jobinput;
        return result;
    }

    const onSubmit = (data) => {
        let finalData = { ...data, btw: taxTotal,discountedPrice:(subtotal * (discountPercentage / 100)).toFixed(2), vat: vatSelected, subTotal: subtotal.toFixed(2), total: total.toFixed(2), contactPerson: id}
        handleInvoice(finalData)
    };

    return (
        <>
        {loading && <Loader/>}
        <div className="mx-auto p-8 bg-white shadow-lg text-lg font-medium">
            <div className='flex'>
                <KeyboardBackspaceIcon
                    onClick={() => navigate(-1)}
                    style={{ fontSize: "35px", padding: "2px", border: "1px solid black", borderRadius: "20px", marginRight: "10px" }}
                />
                <h1 className="text-2xl font-bold mb-4">Edit {type == "Performa" ? "Performa" : "Invoice"}</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Invoice Header */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-black">Client</label>
                        <select
                            className={`mt-1 block w-full p-2 border ${errors.customer ? 'border-red' : 'border-gray'}`}
                            {...register('customer', { required: 'Client is required' })}
                        >
                            <option value="">Select Client</option>
                            {customer && customer.map((item, index) =>
                                <option key={index} value={item._id}>{item.firstName} {item.lastName} &nbsp; &nbsp;&nbsp; {item.email}</option>
                            )}
                        </select>
                        {errors.customer && <p className="text-red-500 text-xs">{errors.customer.message}</p>}
                    </div>

                    <div>
                        <label className="block  text-black">Package</label>
                        <select
                            className={`mt-1 block w-full p-2 border ${errors.package ? 'border-red' : 'border-gray'} `}
                            {...register('package')}
                        >
                            <option value="">Select Package</option>
                            {packageList && packageList.map((item, index) =>
                                <option key={index} value={item._id}>{item.name}</option>
                            )}
                        </select>
                        {errors.package && <p className="text-red-500 text-xs">{errors.package.message}</p>}
                    </div>

                    <div>
                        <label className="block  text-black">Date</label>
                        <input
                            type="date"
                            defaultValue={new Date().toISOString().split('T')[0]}  // Set current date by default}
                            className="mt-1 block w-full p-2 border border-gray "
                            {...register('date', { required: 'Date is required' })}
                        />
                    </div>

                    <div>
                        <label className="block  text-black">Financial Template</label>
                        <select
                            className={`mt-1 block w-full p-2 border ${errors.financialTemplate ? 'border-red' : 'border-gray'} `}
                            {...register('financialTemplate', { required: 'Financial Template is required' })}
                        >
                            <option value="">Select Template</option>
                            {templateList && templateList.map((item, index) =>
                                <option key={index} value={item._id}>{item.name}</option>
                            )}
                        </select>
                        {errors.financialTemplate && <p className="text-red-500 text-xs">{errors.financialTemplate.message}</p>}
                    </div>

                    <div>
                        <label className="block  text-black">Reference</label>
                        <input
                            type="text"
                            className="mt-1 block w-full p-2 border border-gray "
                            {...register('reference')}
                        />
                    </div>
                    <div>
                        <label className="block  text-black">Status</label>
                        <select defaultValue={"Draft"}
                            className={`mt-1 block w-full p-2 border ${errors.Status ? 'border-red' : 'border-gray'} `}
                            {...register('Status', { required: 'Status is required' })}
                        >
                            <option value="">Select Status</option>
                            <option value="Draft">Draft</option>
                            <option value="Pending">Pending</option>
                            <option value="Sent">Sent</option>
                            {type == "Performa" ? <><option value="Accepted">Accepted</option>
                                <option value="Declined">Declined</option></> : ""}

                        </select>
                        {errors.Status && <p className="text-red-500 text-xs">{errors.Status.message}</p>}
                    </div>
                </div>
                {selectedTemplate ? inputField && (
                    <div className="flex mt-2 mb-5" style={{ flexWrap: "wrap", gap: "18px" }}>
                        {inputField.map((field, index) => (
                            <div key={index} style={{ width: "49%" }} className=''>
                                <label className="block text-black pb-1">{field.label}</label>
                                <input
                                    {...register(`jobinput_${field.name}`, { required: field.required })}
                                    placeholder={field.label}
                                    type={field.type}
                                    className="w-full p-2 border border-gray"
                                />
                                {errors[`jobinput_${field.name}`] && <p className="text-red-500 text-xs">Field is required</p>}
                            </div>
                        ))}
                    </div>
                ) : ""}
                <div className="mb-4">
                    <label className="block font-bold text-sm mb-2">Is the price inclusive or exclusive of VAT?</label>
                    <div className="space-x-2">
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-md border focus:outline-none ${vatSelected === 'inclusive'
                                ? 'bg-blue text-white border-blue-500'
                                : 'bg-white text-black border-gray'
                                }`}
                            onClick={() => handleVatSelect('inclusive')}
                        >
                            Including VAT
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 rounded-md border focus:outline-none ${vatSelected === 'exclusive'
                                ? 'bg-blue text-white border-blue-500'
                                : 'bg-white text-black border-gray'
                                }`}
                            onClick={() => handleVatSelect('exclusive')}
                        >
                            Excluding VAT
                        </button>
                    </div>
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

                {/* Invoice Items */}
                <div>
                    <div className="flex gap-2 mb-2">
                        <h2 className="w-1/3 font-semibold mb-2">Sales Group</h2>
                        <h2 className="w-1/3 font-semibold mb-2">Description</h2>
                        <h2 className="w-1/12 font-semibold mb-2">Number</h2>
                        <h2 className="w-1/12 font-semibold mb-2">BTW</h2>
                        <h2 className="w-1/12 font-semibold mb-2">Unit price</h2>
                        <h2 className="w-1/12 font-semibold mb-2"></h2>
                    </div>
                    {fields.map((item, index) => (
                        <div className="flex gap-2 mb-4" key={item.id}>
                            <select
                                className={`w-1/3 p-2 border border-gray`}
                                {...register(`items.${index}.salesgroup`)}
                            >
                                <option value="">Select</option>
                                {salesgroup && salesgroup.map((item, index) =>
                                    <option key={index} value={item._id}>{item.name}</option>
                                )}
                            </select>
                            <input
                                type="text"
                                placeholder="Description"
                                className="w-1/3 p-2 border border-gray "
                                {...register(`items.${index}.description`)}
                            />
                            <input
                                type="number"
                                placeholder="Quantity"
                                className="w-1/12 p-2 border border-gray "
                                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            />
                            <select
                                className={`w-1/12 p-2 border border-gray`}
                                {...register(`items.${index}.btw`, { required: 'btw is required' })}
                            >
                                <option value="">Select</option>
                                <option value="0">0%</option>
                                <option value="9">9%</option>
                                <option value="21">21%</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Price"
                                className="w-1/12 p-2 border border-gray "
                                {...register(`items.${index}.price`, { valueAsNumber: true })}
                            />
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="w-1/12 border bg-gray text-black px-2 "
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => append({ salesgroup: '', description: '', quantity: 1, btw: "", price: 0 })}
                        className="border bg-blue text-white px-4 py-2  hover:bg-black"
                    >
                        + Add Item
                    </button>
                </div>

                {/* Invoice Summary */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Summary</h2>
                    <div className="grid grid-cols-2 mb-2">
                        <div>Subtotal:</div>
                        <div className='text-lg font-semibold'>$ {subtotal.toFixed(2)}</div>
                    </div>
                    <div className="flex justify-between mb-2">
                        <div className="w-1/2">
                            <input
                                placeholder='Discount Description:  '
                                type="text"
                                className="mt-1 block w-1/2 p-2 border border-gray "
                                {...register('discount_description')}
                            />
                        </div>
                        <div className="w-1/2">
                            <input
                                type="number"
                                className="mt-1 block w-1/2 p-2 border border-gray "
                                {...register('discount', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Discount :</div>
                        <div className='text-lg font-semibold'>- $ {(subtotal * (discountPercentage / 100)).toFixed(2)} </div>
                    </div>
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Total tax :</div>
                        <div className='text-lg font-semibold'>+ $ {taxTotal.toFixed(2)} </div>
                    </div>
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Total:</div>
                        <div className='text-lg font-semibold'>= $ {total.toFixed(2)}</div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-6 text-right">
                    <button
                        style={{ background: "blue", color: "white" }}
                        type="submit"
                        className="bg-green-500 text-black border px-6 py-2  hover:bg-green-600"
                    >
                        Save
                    </button>
                </div>
            </form>
        </div>
        </>

    );
};

export default EditInvoice;
