import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import { Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { formatCurrency } from '../../../utils/currencyUtil';


const ValuationOffer: React.FC<any> = ({ packageData, setAppendedItems, appendedItemsRef }) => {
    const [templateList, setTemplate] = useState([]);
    const [vatSelected, setVatSelected] = useState('inclusive');
    const [salesgroup, setSales] = useState([]);
    const [inputField, setInputFields] = useState([]);
    const [estimateData, setEstimateData] = useState<any>();

    const { register, control, watch, formState: { errors }, setValue } = useFormContext() as any;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'offer.items',
    });
    const items = watch('offer.items');

    const handleTimeToQuantity = (timeInput: any) => {
        const [hours, minutes] = timeInput.split(":").map((time: any) => parseInt(time, 10));
        const totalQuantity = hours + minutes / 60; // Convert minutes to fraction of an hour
        return totalQuantity;
    };

    const relocation = watch('relocation');
    const movingLift = watch('movingLift');
    const packing = watch('packing');
    const unpacking = watch('unpacking');
    const assembling = watch('assembling');
    const certificate = watch('certificate');
    const disassembling = watch('disassembling');
    const storage = watch('storage');
    const insurance = watch('insurance');

    useEffect(() => {
        const mergeWithPrefix = (obj: any, prefix: string) => {
            if (!obj || typeof obj !== 'object') {
                return {};
            }
            return Object.fromEntries(
                Object.entries(obj).map(([key, value]) => [`${prefix}_${key}`, value])
            );
        };

        const convertTimeToQuantity = (data: Record<string, any>) => {
            return Object.fromEntries(
                Object.entries(data).map(([key, value]) => {
                    if (typeof value === 'string' && value === 'NaN:NaN') {
                        return [key, 0];
                    }
                    if (typeof value === 'string' && /^\d{1,2}:\d{2}$/.test(value)) {
                        return [key, handleTimeToQuantity(value)];
                    }
                    if (typeof value === 'number' && isNaN(value)) {
                        return [key, 0];
                    }
                    return [key, value || 0];
                })
            );
        };

        const updatedEstimateData = {
            ...convertTimeToQuantity(mergeWithPrefix(relocation, 'relocation')),
            ...convertTimeToQuantity(mergeWithPrefix(movingLift, 'movingLift')),
            ...convertTimeToQuantity(mergeWithPrefix(packing, 'packing')),
            ...convertTimeToQuantity(mergeWithPrefix(unpacking, 'unpacking')),
            ...convertTimeToQuantity(mergeWithPrefix(assembling, 'assembling')),
            ...convertTimeToQuantity(mergeWithPrefix(certificate, 'certificate')),
            ...convertTimeToQuantity(mergeWithPrefix(disassembling, 'disassembling')),
            ...convertTimeToQuantity(mergeWithPrefix(storage, 'storage')),
            ...convertTimeToQuantity(mergeWithPrefix(insurance, 'insurance')),
            total_handyman: Number(assembling?.requiredHandyman || 0) + Number(disassembling?.requiredHandyman || 0)
        };
        setEstimateData(updatedEstimateData);
    }, [relocation, movingLift, packing, unpacking, assembling, certificate, disassembling, storage, insurance]);

    // const relocationAdded = useRef(false);
    // const packingAdded = useRef(false);
    // const unpackingAdded = useRef(false);
    // const movingLiftAdded = useRef(false);
    // const assemblingAdded = useRef(false);
    // const disassemblingAdded = useRef(false);
    // const certificateAdded = useRef(false);
    // const storageAdded = useRef(false);
    // const insuranceAdded = useRef(false);
    // const distancesAdded = useRef(false);
    // const totalTraveled = useRef(false);


    const replacePlaceholders = (value: string, data: Record<string, string | number>): string => {
        return value.replace(/{{(.*?)}}/g, (_ , key) => {
            return data[key.trim()]?.toString() || "0";
        });
    };


    let handlerPreviewRules = () => {
        if (packageData && estimateData) {
            if (Array.isArray(packageData?.offers?.rules)) {
                let newItems = new Set(appendedItemsRef);
                packageData?.offers?.rules.forEach((item: any) => {
                    const uniqueKey = `${item.description}/${item.unitPrice}`;
                    if (!newItems.has(uniqueKey)) {
                        const resolvedNumber = typeof item.number === 'string'
                            ? replacePlaceholders(item.number, estimateData || {})
                            : item.number;
                        const resolvedPrice = typeof item.unitPrice === 'string'
                            ? replacePlaceholders(item.unitPrice, estimateData || {})
                            : item.unitPrice;

                        append({
                            salesgroup: item.salesGroup,
                            description: item.description,
                            quantity: resolvedNumber,
                            btw: item.btw,
                            price: resolvedPrice,
                        });

                        newItems.add(uniqueKey);
                    }
                });

                setAppendedItems(newItems); // Update the state with the new Set
            }
        }
    };


    // useEffect(() => {
    //     if (insurance && !insuranceAdded.current) {
    //         const insuranceExists = items?.some((item: any) => item.description === 'Insurance');
    //         if (!insuranceExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Insurance',
    //                 quantity: insurance?.quantity,
    //                 btw: 21,
    //                 price: insurance?.price,
    //             });
    //             insuranceAdded.current = true;
    //         }
    //     }
    //     if (storage && !storageAdded.current) {
    //         const storageExists = items?.some((item: any) => item.description === 'Storage Cost');
    //         if (!storageExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Storage Cost',
    //                 quantity: storage?.storageVolume,
    //                 btw: 21,
    //                 price: storage?.appliedPrice,
    //             });
    //             storageAdded.current = true;
    //         }
    //     }
    //     if (certificate?.quantity && !certificateAdded.current) {
    //         const certificateExists = items?.some((item: any) => item.description === 'Warranty Certificate');
    //         if (!certificateExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Warranty Certificate',
    //                 quantity: certificate?.quantity,
    //                 btw: 21,
    //                 price: certificate?.price,
    //             });
    //             certificateAdded.current = true;
    //         }
    //     }
    //     if (disassembling?.appliedPrice && !disassemblingAdded.current) {
    //         const disassemblingExists = items?.some((item: any) => item.description === 'Furniture Disassembly service');
    //         if (!disassemblingExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Furniture Disassembly service',
    //                 quantity: handleTimeToQuantity(disassembling?.requiredHours),
    //                 btw: 21,
    //                 price: disassembling?.appliedPrice,
    //             });
    //             disassemblingAdded.current = true;
    //         }
    //     };
    //     if (assembling?.appliedPrice && !assemblingAdded.current) {
    //         const assemblingExists = items?.some((item: any) => item.description === 'Furniture Assembly service');
    //         if (!assemblingExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Furniture Assembly service',
    //                 quantity: handleTimeToQuantity(assembling?.requiredHours),
    //                 btw: 21,
    //                 price: assembling?.appliedPrice,
    //             });
    //             assemblingAdded.current = true;
    //         }
    //     };
    //     // Unpacking service
    //     if (unpacking?.appliedPrice && !unpackingAdded.current) {
    //         const unpackingExists = items?.some((item: any) => item.description === 'Unpacking service');
    //         if (!unpackingExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Unpacking service',
    //                 quantity: handleTimeToQuantity(unpacking?.requiredHours),
    //                 btw: 21,
    //                 price: unpacking?.appliedPrice,
    //             });
    //             unpackingAdded.current = true;
    //         }
    //     }

    //     // Packing service
    //     if (packing?.appliedPrice && !packingAdded.current) {
    //         const packingExists = items?.some((item: any) => item.description === 'Packing service');
    //         if (!packingExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Packing service',
    //                 quantity: handleTimeToQuantity(packing?.requiredHours),
    //                 btw: 21,
    //                 price: packing?.appliedPrice,
    //             });
    //             packingAdded.current = true;
    //         }
    //     }

    //     // Moving Lift service
    //     if (movingLift?.quantity && !movingLiftAdded.current) {
    //         const liftExists = items?.some((item: any) => item.description === 'Moving Lift: XXX m³ lift, XXX experienced movers, and a total of XXX work hours');
    //         if (!liftExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Moving Lift: XXX m³ lift, XXX experienced movers, and a total of XXX work hours',
    //                 quantity: movingLift?.quantity,
    //                 btw: 21,
    //                 price: movingLift?.price,
    //             });
    //             movingLiftAdded.current = true;
    //         }
    //     }

    //     // Relocation service
    //     if (relocation && !relocationAdded.current) {
    //         const relocationExists = items?.some((item: any) => item.description === 'Moving Service: Loading, Transporting, and Unloading according to the inventory list, including a XXX m³ moving truck, XXX experienced movers, and a total of XXX work hours');
    //         if (!relocationExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Moving Service: Loading, Transporting, and Unloading according to the inventory list, including a XXX m³ moving truck, XXX experienced movers, and a total of XXX work hours',
    //                 quantity: relocation?.totalVolume,
    //                 btw: 21,
    //                 price: relocation?.pricePerMeterCubic,
    //             });
    //             relocationAdded.current = true;
    //         }
    //     }
    //     if (relocation && !distancesAdded.current) {
    //         const relocationExists = items?.some((item: any) => item.description === 'Total travel time');
    //         if (!relocationExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'Total travel time',
    //                 quantity: relocation?.travelTime,
    //                 btw: 21,
    //                 price: relocation?.pricePerHour,
    //             });
    //             distancesAdded.current = true;
    //         }
    //     }
    //     if (relocation && !totalTraveled.current) {
    //         const relocationExists = items?.some((item: any) => item.description === 'kilometer');
    //         if (!relocationExists) {
    //             append({
    //                 salesgroup: '',
    //                 description: 'kilometer',
    //                 quantity: relocation?.distance,
    //                 btw: 21,
    //                 price: relocation?.pricePerKilometer,
    //             });
    //             totalTraveled.current = true;
    //         }
    //     }
    // }, [append, relocation, packing, assembling, disassembling, unpacking, movingLift]);


    const handleVatSelect = (type: any) => {
        setVatSelected(type);
    };

    const discountPercentage = watch('offer.discount') || 0;
    const selectedTemplate = watch(`offer.financialTemplate`) || "";

    const subtotal = items?.reduce((acc: any, item: any) => {
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        return acc + quantity * price;
    }, 0);

    const taxTotal = items?.reduce((acc: any, item: any) => {
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const btw = item.btw || 0;
        const itemTax = (price * quantity) * (btw / 100);
        return acc + itemTax;
    }, 0);

    const total = subtotal - (subtotal * (discountPercentage / 100)) + taxTotal;

    useEffect(() => {
        setValue('offer.subTotal', subtotal?.toFixed(2));
        setValue('offer.btw', taxTotal?.toFixed(2));
        setValue('offer.total', total?.toFixed(2));
        setValue('offer.vat', vatSelected);
        setValue('estimateData', estimateData);
    }, [total, setValue, taxTotal, subtotal, vatSelected, estimateData]);


    const handlesalesgroup = async () => {
        try {
            let response = await axios.get(apiPath + "/api/sale_group?type=salesGroup")
            setSales(response.data)
        } catch (error) {
            console.error('Error fetching package:');
        } finally {
            handlerPreviewRules()
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
            let response = await axios.get(apiPath + "/api/templates?type=quote")
            setTemplate(response.data)
            setValue('offer.financialTemplate', packageData?.offers?.financialTemplate);
            setValue('offer.discount_description', packageData?.offers?.discountDescription);
            setValue('offer.discount', packageData?.offers?.percentage);
        } catch (error) {
            console.error('Error fetching package:');
        }
    }

    useEffect(() => {
        if (selectedTemplate) {
            handleAllinputs()
            console.log('function selectedTemplate')
        }
    }, [selectedTemplate]);

    useEffect(() => {
        handletemplate()
        if (estimateData) {
            handlesalesgroup()
        }
    }, [estimateData])

    return (
        <>
            <div className='px-10 py-5'>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-lg font-medium text-black pb-2">Financial Template*</label>
                        <select
                            className={`mt-1 block w-full p-3 text-lg shadow`}
                            {...register('offer.financialTemplate', { required: 'Financial Template is required' })}
                        >
                            <option value="">Select Template</option>
                            {templateList && templateList.map((item: any, index) =>
                                <option key={index} value={item._id}>{item.name}</option>
                            )}
                        </select>
                        {errors?.offer?.financialTemplate && <p className="text-red-500 text-md">{errors?.offer?.financialTemplate.message}</p>}
                    </div>
                    <div>
                        <label className="block text-lg font-medium text-black pb-2">Expiry Date</label>
                        <input
                            type="date"
                            defaultValue={new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().split('T')[0]}
                            className="mt-1 block w-full bg-white p-3 shadow"
                            {...register('offer.expire_date', { required: 'Expiry date is required' })}
                        />
                        {errors?.expire_date && <p className="text-red-500 text-md">{errors.expire_date.message}</p>}
                    </div>
                </div>

                {selectedTemplate ? inputField && (
                    <div className="flex mt-2 mb-5" style={{ flexWrap: "wrap", gap: "16px" }}>
                        {inputField.map((field: any, index: number) => (
                            <div key={index} style={{ width: "49.44%" }} className=''>
                                <label className="block text-lg text-black font-medium pb-2">{field.label}</label>
                                <input
                                    {...register(`offer.jobinput.${field.name}`, { required: field.required })}
                                    placeholder={field.label}
                                    type={field.type}
                                    className="w-full p-3 shadow"
                                />
                                {errors[`jobinput.${field.name}`] && <p className="text-red-500 text-md">Field is required</p>}
                            </div>
                        ))}
                    </div>
                ) : ""}
                <div className="mb-4">
                    <label className="block font-bold text-lg mb-2">Is the price inclusive or exclusive of VAT?</label>
                    <div className="space-x-2">
                        <button
                            type="button"
                            className={`px-4 py-3 font-medium rounded-md border focus:outline-none ${vatSelected === 'inclusive'
                                ? 'bg-blue text-white border-blue-500'
                                : 'bg-white text-black border-gray'
                                }`}
                            onClick={() => handleVatSelect('inclusive')}
                        >
                            Including VAT
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-3 font-medium rounded-md border focus:outline-none ${vatSelected === 'exclusive'
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
                            {...register('offer.ignoreRules')}
                            className="h-5 w-5"
                        />
                        <span className='text-lg font-medium'>Ignore rules with a count of 0</span>
                    </label>
                </div>
                <div>
                    <div className="grid grid-cols-8 gap-2 mb-4 font-bold">
                        <h2 className="col-span-1">Sales Group</h2>
                        <h2 className="col-span-3">Description</h2>
                        <h2 className="col-span-1">Number</h2>
                        <h2 className="col-span-1">BTW</h2>
                        <h2 className="col-span-1">price</h2>
                        <h2 className="col-span-1"></h2>
                    </div>

                    {fields.map((item, index) => (
                        <div key={index} className="grid items-start grid-cols-8 gap-2 mb-4">
                            <select
                                className={`col-span-1 p-3 shadow font-medium`}
                                {...register(`offer.items.${index}.salesgroup`)}
                            >
                                <option value="">Select</option>
                                {salesgroup && salesgroup.map((item: any, index) =>
                                    <option className='font-medium' key={index} value={item._id}>{item.name}</option>
                                )}
                            </select>
                            <textarea
                                placeholder="Description"
                                className="col-span-3 p-3 shadow font-medium resize-none"
                                {...register(`offer.items.${index}.description`)}
                                onInput={(e) => {
                                    e.currentTarget.style.height = 'auto'; // Reset height to auto before adjusting
                                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`; // Set height to the scrollHeight
                                }}
                            ></textarea>
                            <input
                                type="number"
                                placeholder="Quantity"
                                className="col-span-1 p-3 shadow font-medium"
                                min={0}
                                {...register(`offer.items.${index}.quantity`, { valueAsNumber: true })}
                            />
                            <select
                                className={`col-span-1 p-3 shadow font-medium`}
                                {...register(`offer.items.${index}.btw`, { required: 'btw is required' })}
                            >
                               
                               <option value="0">0%</option>
                                <option value="9">9%</option>
                                <option value="21">21%</option>
                            </select>
                            <input
                                type="number"
                                placeholder="Price"
                                min={0}
                                className="col-span-1 p-3 shadow font-medium"
                                {...register(`offer.items.${index}.price`, { valueAsNumber: true })}
                            />
                            <div className='col-span-1'>
                                <Checkbox
                                    {...register(`offer.items.[${index}].enabled`)}
                                    className="text-blue"
                                    defaultChecked
                                />
                                <IconButton onClick={() => remove(index)}>
                                    <DeleteIcon className="text-red" />
                                </IconButton>
                            </div>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => append({ salesgroup: '', description: '', quantity: 1, btw: "", price: 0 })}
                        className="bg-blue font-bold text-white px-4 py-2 shadow text-lg hover:bg-black"
                    >
                        + Add Item
                    </button>
                </div>

                <div className="mt-6 ms-auto">
                    <h2 className="font-bold text-xl mb-2">Summary</h2>
                    <div className="grid grid-cols-2 mb-2 text-lg font-semibold">
                        <div>Subtotal:</div>
                        <div className='text-lg font-semibold'>{formatCurrency(subtotal || 0)}</div>
                    </div>
                    <div className="flex justify-between mb-2 gap-5">
                        <div className="w-1/2">
                            <input
                                placeholder='Discount Description:  '
                                type="text"
                                className="mt-1 block w-full p-3 shadow text-lg "
                                {...register('offer.discount_description')}
                            />
                        </div>
                        <div className="w-1/2">
                            <input
                                type="number"
                                placeholder='Percentage'
                                min={0}
                                className="mt-1 block w-1/2 p-3 shadow text-lg"
                                {...register('offer.discount', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                    <input
                        type="hidden"
                        min={0}
                        value={(subtotal * (discountPercentage / 100)).toFixed(2)}
                        className="mt-1 block w-1/2 p-3 shadow text-lg"
                        {...register('offer.discountedPrice', { valueAsNumber: true })}
                    />
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Discount :</div>
                        <div className='text-lg font-semibold'>- {formatCurrency(subtotal * (discountPercentage / 100))} </div>
                    </div>
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Total tax :</div>
                        <div className='text-lg font-semibold'>+ {formatCurrency(taxTotal || 0)} </div>
                    </div>
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Total:</div>
                        <div className='text-lg font-semibold'>= {formatCurrency(total || 0)}</div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default ValuationOffer;
