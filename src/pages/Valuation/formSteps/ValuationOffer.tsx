import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import { Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { formatCurrency } from '../../../utils/currencyUtil';
import { calculateCommercialTotals } from '../../../utils/moneyCalculator';
import { getStandardTaxOptions } from '../../../utils/taxCatalog';
import { generateTargetLines, reconcilePackageLines, deriveComponentId } from '../../../utils/packageLineRebuilder';
import { convertToTimeFormat, handleTimeToQuantity } from '../../../utils/timeUtil';


const ValuationOffer: React.FC<any> = ({ packageData, setAppendedItems, appendedItemsRef, rooms, selectedServices }) => {
    const isServiceActive = (typeName: string) => {
        if (!Array.isArray(selectedServices)) return true;
        return selectedServices.some(
            (s: any) => s?.serviceTypeName === typeName || (s?.serviceName && s.serviceName.toLowerCase() === typeName.toLowerCase())
        );
    };

    const [templateList, setTemplate] = useState([]);
    const { register, control, watch, formState: { errors }, setValue } = useFormContext() as any;
    const initialVat = watch('offer.vat') || packageData?.vat || 'exclusive';
    const [vatSelected, setVatSelected] = useState(initialVat);
    const [salesgroup, setSales] = useState([]);
    const [inputField, setInputFields] = useState([]);
    const [estimateData, setEstimateData] = useState<any>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'offer.items',
    });
    const items = watch('offer.items');

    const relocation = watch('relocation');
    const movingLift = watch('movingLift');
    const packing = watch('packing');
    const unpacking = watch('unpacking');
    const assembling = watch('assembling');
    const certificate = watch('certificate');
    const disassembling = watch('disassembling');
    const storage = watch('storage');
    const insurance = watch('insurance');
    const movingPackages = watch('movingPackages');
    const materials = watch('materials');

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
            ...(isServiceActive('movingLift') ? convertTimeToQuantity(mergeWithPrefix(movingLift, 'movingLift')) : { movingLift_quantity: 0, movingLift_price: 0 }),
            ...(isServiceActive('packing') ? convertTimeToQuantity(mergeWithPrefix(packing, 'packing')) : { packing_requiredHours: 0, packing_appliedPrice: 0, packing_requiredPackers: 0 }),
            ...(isServiceActive('unpacking') ? convertTimeToQuantity(mergeWithPrefix(unpacking, 'unpacking')) : { unpacking_requiredHours: 0, unpacking_appliedPrice: 0, unpacking_requiredPackers: 0 }),
            ...(isServiceActive('assembling') ? convertTimeToQuantity(mergeWithPrefix(assembling, 'assembling')) : { assembling_requiredHours: 0, assembling_appliedPrice: 0, assembling_requiredHandyman: 0 }),
            ...(isServiceActive('certificate') ? convertTimeToQuantity(mergeWithPrefix(certificate, 'certificate')) : { certificate_quantity: 0, certificate_price: 0 }),
            ...(isServiceActive('disassembling') ? convertTimeToQuantity(mergeWithPrefix(disassembling, 'disassembling')) : { disassembling_requiredHours: 0, disassembling_appliedPrice: 0, disassembling_requiredHandyman: 0 }),
            ...(isServiceActive('storage') ? convertTimeToQuantity(mergeWithPrefix(storage, 'storage')) : { storage_storageVolume: 0, storage_appliedPrice: 0, storage_additionCharges: 0 }),
            ...(isServiceActive('insurance') ? convertTimeToQuantity(mergeWithPrefix(insurance, 'insurance')) : { insurance_quantity: 0, insurance_price: 0 }),
            total_handyman: (isServiceActive('assembling') ? Number(assembling?.requiredHandyman || 0) : 0) + (isServiceActive('disassembling') ? Number(disassembling?.requiredHandyman || 0) : 0)
        };
        setEstimateData(updatedEstimateData);
    }, [relocation, movingLift, packing, unpacking, assembling, certificate, disassembling, storage, insurance, selectedServices]);

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
        return value.replace(/{{(.*?)}}/g, (_, key) => {
            return data[key.trim()]?.toString() || "0";
        });
    };


    let handlerPreviewRules = (customSgList?: any[]) => {
        const availableSalesGroups = customSgList || salesgroup || [];
        const defaultSg = availableSalesGroups[0]?._id || '';

        const priceAgree = watch('priceAgree') || packageData?.priceAgree || '';

        // Deterministically generate target lines with stable component IDs
        const targetLines = generateTargetLines({
            packageData,
            priceAgree,
            relocation,
            movingLift,
            packing,
            unpacking,
            assembling,
            disassembling,
            storage,
            insurance,
            certificate,
            movingPackages,
            rooms,
            materials,
            selectedServices,
            defaultSalesGroup: defaultSg,
            estimateData,
        });

        const currentItems = watch('offer.items') || [];
        const reconciled = reconcilePackageLines(currentItems, targetLines);

        // Check if reconciled items differ from current items to avoid redundant state updates
        const isDifferent = reconciled.length !== currentItems.length ||
            reconciled.some((item, idx) => {
                const curr = currentItems[idx];
                if (!curr) return true;
                return curr.componentId !== item.componentId ||
                    curr.quantity !== item.quantity ||
                    curr.price !== item.price ||
                    curr.btw !== item.btw ||
                    curr.description !== item.description;
            });

        if (isDifferent) {
            setValue('offer.items', reconciled);
        }

        const compIds = new Set<string>(reconciled.map((it: any) => it.componentId || deriveComponentId(it)));
        setAppendedItems(compIds);
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

    const rawDiscount = watch('offer.discount');
    const discountPercentage = Math.min(Math.max(Number(rawDiscount) || 0, 0), 100);
    const selectedTemplate = watch(`offer.financialTemplate`) || "";

    const calcResult = calculateCommercialTotals({
        items: items || [],
        vat: vatSelected,
        discount: discountPercentage,
    });

    const subtotal = calcResult.subTotal;
    const discountAmount = calcResult.discountedPrice;
    const taxTotal = calcResult.totalVat;
    const total = calcResult.total;
    const discountedSubtotal = subtotal - discountAmount;

    useEffect(() => {
        setValue('offer.subTotal', subtotal?.toFixed(2));
        setValue('offer.discountedPrice', discountAmount?.toFixed(2));
        setValue('offer.btw', taxTotal?.toFixed(2));
        setValue('offer.total', total?.toFixed(2));
        setValue('offer.vat', vatSelected);
        setValue('estimateData', estimateData);
    }, [total, setValue, taxTotal, subtotal, discountAmount, vatSelected, estimateData]);


    const handlesalesgroup = async () => {
        try {
            let response = await axios.get(apiPath + "/api/sale_group?type=salesGroup");
            const sgList = response.data || [];
            setSales(sgList);

            const currentItems = watch('offer.items') || [];
            if (Array.isArray(currentItems) && currentItems.length > 0 && sgList.length > 0) {
                currentItems.forEach((it: any, idx: number) => {
                    let sgVal = it.salesgroup || it.salesGroup || '';
                    if (typeof sgVal === 'object' && sgVal !== null) {
                        sgVal = sgVal._id || '';
                    }
                    if (sgVal) {
                        const match = sgList.find(
                            (s: any) => s._id === sgVal || s.name?.trim().toLowerCase() === String(sgVal).trim().toLowerCase()
                        );
                        if (match) {
                            setValue(`offer.items.${idx}.salesgroup`, match._id);
                        } else {
                            setValue(`offer.items.${idx}.salesgroup`, sgVal);
                        }
                    } else if (sgList[0]?._id) {
                        setValue(`offer.items.${idx}.salesgroup`, sgList[0]._id);
                    }
                });
            }
            handlerPreviewRules(sgList);
        } catch (error) {
            console.error('Error fetching sales group:', error);
            handlerPreviewRules();
        }
    };

    const handleAllinputs = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`);
            setInputFields(response.data[0]?.extraFields || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handletemplate = async () => {
        try {
            let response = await axios.get(apiPath + "/api/templates?type=quote");
            const list = response.data || [];
            setTemplate(list);

            const currentTemplate = watch('offer.financialTemplate');
            let templateId = typeof currentTemplate === 'object' && currentTemplate !== null
                ? currentTemplate._id
                : currentTemplate;

            if (templateId && list.length > 0) {
                const found = list.find((t: any) => t._id === templateId || t.name === templateId);
                if (found) templateId = found._id;
            }

            if (!templateId && packageData?.offers?.financialTemplate) {
                const pkgTemplate = packageData.offers.financialTemplate;
                const pkgTemplateId = typeof pkgTemplate === 'object' && pkgTemplate !== null
                    ? pkgTemplate._id
                    : pkgTemplate;
                const found = list.find((t: any) => t._id === pkgTemplateId || t.name === pkgTemplateId);
                templateId = found ? found._id : pkgTemplateId;
            }

            if (!templateId && list.length > 0) {
                templateId = list[0]._id;
            }

            if (templateId) {
                setValue('offer.financialTemplate', templateId);
            }

            if (packageData?.offers?.discountDescription && !watch('offer.discount_description')) {
                setValue('offer.discount_description', packageData?.offers?.discountDescription);
            }
            if (packageData?.offers?.percentage !== undefined && (watch('offer.discount') === undefined || watch('offer.discount') === null)) {
                setValue('offer.discount', packageData?.offers?.percentage);
            }
        } catch (error) {
            console.error('Error fetching template/package:', error);
        }
    };

    useEffect(() => {
        if (selectedTemplate) {
            handleAllinputs();
        }
    }, [selectedTemplate]);

    useEffect(() => {
        handletemplate();
    }, [packageData]);

    useEffect(() => {
        handlesalesgroup();
    }, [estimateData, packageData]);

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
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-black border-gray'
                                }`}
                            onClick={() => handleVatSelect('inclusive')}
                        >
                            Including VAT
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-3 font-medium rounded-md border focus:outline-none ${vatSelected === 'exclusive'
                                ? 'bg-blue-500 text-white border-blue-500'
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
                                onFocus={(e) => e.target.select()}
                                {...register(`offer.items.${index}.quantity`, { valueAsNumber: true })}
                            />
                            <select
                                className={`col-span-1 p-3 shadow font-medium`}
                                {...register(`offer.items.${index}.btw`, { required: 'btw is required' })}
                            >

                                {getStandardTaxOptions().map((tax) => (
                                    <option key={tax.id} value={tax.code}>
                                        {tax.label}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Price"
                                min={0}
                                step="any"
                                onFocus={(e) => e.target.select()}
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
                        onClick={() => append({ salesgroup: (salesgroup && salesgroup[0]?._id) || '', description: '', quantity: 1, btw: "21", price: 0, isManual: true, componentId: `manual_${Date.now()}` })}
                        className="bg-blue-500 font-bold text-white px-4 py-2 shadow text-lg hover:bg-black"
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
                                placeholder='Discount Description'
                                type="text"
                                className="mt-1 block w-full p-3 shadow text-lg "
                                {...register('offer.discount_description')}
                            />
                        </div>
                        <div className="w-1/2">
                            <input
                                type="number"
                                placeholder='Discount % (0-100)'
                                min={0}
                                max={100}
                                onFocus={(e) => e.target.select()}
                                className="mt-1 block w-1/2 p-3 shadow text-lg"
                                {...register('offer.discount', { valueAsNumber: true, min: 0, max: 100 })}
                            />
                        </div>
                    </div>
                    <input
                        type="hidden"
                        min={0}
                        value={discountAmount.toFixed(2)}
                        className="mt-1 block w-1/2 p-3 shadow text-lg"
                        {...register('offer.discountedPrice', { valueAsNumber: true })}
                    />
                    <div className="grid grid-cols-2 mb-2">
                        <div className='text-lg font-semibold'>Discount :</div>
                        <div className='text-lg font-semibold'>- {formatCurrency(discountAmount)} </div>
                    </div>
                    {vatSelected === 'inclusive' ? (
                        <>
                            <div className="grid grid-cols-2 mb-2">
                                <div className='text-lg font-semibold'>Net (excl. VAT) :</div>
                                <div className='text-lg font-semibold'>{formatCurrency(Math.max(0, (discountedSubtotal - taxTotal)) || 0)} </div>
                            </div>
                            <div className="grid grid-cols-2 mb-2">
                                <div className='text-lg font-semibold'>Included VAT :</div>
                                <div className='text-lg font-semibold'>{formatCurrency(taxTotal || 0)} </div>
                            </div>
                            <div className="grid grid-cols-2 mb-2">
                                <div className='text-lg font-bold text-primary'>Total (incl. VAT):</div>
                                <div className='text-lg font-bold text-primary'>= {formatCurrency(total || 0)}</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 mb-2">
                                <div className='text-lg font-semibold'>Total tax (VAT) :</div>
                                <div className='text-lg font-semibold'>+ {formatCurrency(taxTotal || 0)} </div>
                            </div>
                            <div className="grid grid-cols-2 mb-2">
                                <div className='text-lg font-bold text-primary'>Total:</div>
                                <div className='text-lg font-bold text-primary'>= {formatCurrency(total || 0)}</div>
                            </div>
                        </>
                    )}
                </div>
            </div >
        </>
    );
};

export default ValuationOffer;
