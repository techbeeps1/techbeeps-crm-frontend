import React, { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { apiPath } from '../../../../apiPath';
import { Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton } from '@mui/material';
import axios from 'axios';
import { formatCurrency } from '../../../utils/currencyUtil';


const ValuationOffer: React.FC<any> = ({ packageData, setAppendedItems, appendedItemsRef, rooms }) => {
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

    const convertToTimeFormat = (value: number): string => {
        if (!Number.isFinite(value) || value <= 0) return '00:00';
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const handleTimeToQuantity = (timeInput: any) => {
        if (!timeInput) return 0;
        if (typeof timeInput === 'number') return timeInput;
        if (typeof timeInput === 'string') {
            if (timeInput.includes(':')) {
                const [hours, minutes] = timeInput.split(':').map((time: any) => parseInt(time, 10));
                return (hours || 0) + (minutes || 0) / 60;
            }
            const parsed = parseFloat(timeInput);
            return !isNaN(parsed) ? parsed : 0;
        }
        return 0;
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
        return value.replace(/{{(.*?)}}/g, (_, key) => {
            return data[key.trim()]?.toString() || "0";
        });
    };


    let handlerPreviewRules = (customSgList?: any[]) => {
        const availableSalesGroups = customSgList || salesgroup || [];
        const defaultSg = availableSalesGroups[0]?._id || '';

        const hasPackageRules = Array.isArray(packageData?.offers?.rules) && packageData.offers.rules.length > 0;
        const isFixedPackage = packageData?.priceAgree === 'fixed' || packageData?.priceAgree === 'fixed_price';

        // Clean up invalid or obsolete calculated lines if present in offer.items
        const priceAgree = watch('priceAgree') || packageData?.priceAgree || '';
        const isHourlyAgreement = String(priceAgree).toLowerCase().includes('hour');
        const pkgQuantity = Number(movingPackages?.quantity) || 0;

        let existingItems = watch('offer.items') || [];
        let filteredItems = existingItems.filter((it: any) => {
            // Remove Moving Packages Service if actual quantity is 0
            if (it.description === 'Moving Packages Service' && pkgQuantity === 0) {
                return false;
            }
            // Remove old Volume-based Moving Service if the agreement is Hourly
            if (isHourlyAgreement && typeof it.description === 'string' && it.description.startsWith('Moving Service (Volume:')) {
                return false;
            }
            // Remove old Hourly Moving Service if the agreement is Fixed/Volume
            if (!isHourlyAgreement && typeof it.description === 'string' && it.description.startsWith('Moving Service (Hourly:')) {
                return false;
            }
            return true;
        });

        if (filteredItems.length !== existingItems.length) {
            setValue('offer.items', filteredItems);
        }

        let newItems = new Set(appendedItemsRef instanceof Set ? appendedItemsRef : []);
        filteredItems.forEach((it: any) => {
            if (it.description && it.price !== undefined) {
                newItems.add(`${it.description}/${it.price}`);
            }
        });

        if (hasPackageRules && isFixedPackage) {
            // Apply fixed package rules with evaluated tokens
            packageData.offers.rules.forEach((item: any) => {
                const uniqueKey = `${item.description}/${item.unitPrice}`;
                if (!newItems.has(uniqueKey)) {
                    const resolvedNumber = typeof item.number === 'string'
                        ? replacePlaceholders(item.number, estimateData || {})
                        : item.number;
                    const resolvedPrice = typeof item.unitPrice === 'string'
                        ? replacePlaceholders(item.unitPrice, estimateData || {})
                        : item.unitPrice;

                    const rawSg = item.salesGroup || item.salesgroup || '';
                    let matchedSgId = '';
                    if (typeof rawSg === 'object' && rawSg !== null) {
                        matchedSgId = rawSg._id || '';
                    } else if (rawSg) {
                        const found = availableSalesGroups.find(
                            (s: any) => s._id === rawSg || s.name?.trim().toLowerCase() === String(rawSg).trim().toLowerCase()
                        );
                        matchedSgId = found ? found._id : rawSg;
                    }
                    if (!matchedSgId) matchedSgId = defaultSg;

                    append({
                        salesgroup: matchedSgId,
                        description: item.description,
                        quantity: Number(resolvedNumber) || 1,
                        btw: item.btw || '21',
                        price: Number(resolvedPrice) || 0,
                    });
                    newItems.add(uniqueKey);
                }
            });
        } else {
            // Populate traceable calculated lines directly from the customer's move estimate
            const calculatedLines: Array<{ desc: string; qty: number; price: number; btw: string }> = [];

            if (relocation && (Number(relocation?.totalVolume) > 0 || Number(relocation?.appliedPrice) > 0 || Number(relocation?.priceCalculation) > 0)) {
                if (isHourlyAgreement) {
                    const hourlyRate = Number(relocation?.pricePerMeterCubic) || Number(relocation?.appliedPrice) || 0;
                    const reqHours = typeof relocation?.requiredHours === 'string'
                        ? handleTimeToQuantity(relocation.requiredHours)
                        : Number(relocation?.requiredHours) || 0;
                    const fallbackHours = (Number(relocation?.totalVolume) || 0) / 3;
                    const finalHours = reqHours > 0 ? reqHours : fallbackHours;

                    if (finalHours > 0 && hourlyRate > 0) {
                        calculatedLines.push({
                            desc: `Moving Service (Hourly: ${relocation?.requiredHours || convertToTimeFormat(finalHours)} hrs)`,
                            qty: finalHours,
                            price: hourlyRate,
                            btw: '21',
                        });
                    }
                } else {
                    calculatedLines.push({
                        desc: `Moving Service (Volume: ${relocation?.totalVolume || 0} m³)`,
                        qty: Number(relocation?.totalVolume) || 1,
                        price: Number(relocation?.pricePerMeterCubic) || Number(relocation?.appliedPrice) || 0,
                        btw: '21',
                    });
                }

                if (Number(relocation?.travelTime) > 0 || (typeof relocation?.travelTime === 'string' && relocation?.travelTime !== '0:00' && relocation?.travelTime !== '0')) {
                    const travelHrs = typeof relocation.travelTime === 'string' ? handleTimeToQuantity(relocation.travelTime) : Number(relocation.travelTime);
                    if (travelHrs > 0 && Number(relocation?.pricePerHour) > 0) {
                        calculatedLines.push({
                            desc: 'Total Travel Time',
                            qty: travelHrs,
                            price: Number(relocation?.pricePerHour) || 0,
                            btw: '21',
                        });
                    }
                }
                if (Number(relocation?.distance) > 0 && Number(relocation?.pricePerKilometer) > 0) {
                    calculatedLines.push({
                        desc: 'Travel Distance (km)',
                        qty: Number(relocation.distance),
                        price: Number(relocation.pricePerKilometer) || 0,
                        btw: '21',
                    });
                }
                if (Number(relocation?.propertySurcharge) > 0) {
                    calculatedLines.push({
                        desc: 'Property Location Surcharge',
                        qty: 1,
                        price: Number(relocation.propertySurcharge),
                        btw: '21',
                    });
                }
            }

            // Inventory moving boxes configured in rooms (part of Relocation calculation in Step 11)
            if (Array.isArray(rooms)) {
                const groupedBoxes = rooms
                    ?.flatMap((item: any) => item?.inventoryItems || [])
                    .reduce((acc: Record<string, any>, box: any) => {
                        if (!box) return acc;
                        const key = box._id || box.name;
                        if (!key) return acc;
                        if (acc[key]) {
                            acc[key].quantity += (Number(box.quantity) || 0);
                        } else {
                            acc[key] = { ...box, quantity: Number(box.quantity) || 0 };
                        }
                        return acc;
                    }, {});

                Object.values(groupedBoxes || {}).forEach((box: any) => {
                    const qty = Number(box.quantity) || 0;
                    const price = Number(box.price) || 0;
                    if (qty > 0 && price > 0) {
                        calculatedLines.push({
                            desc: `Moving Item: ${box.name || 'Moving Box'}`,
                            qty: qty,
                            price: price,
                            btw: '21',
                        });
                    }
                });
            }

            if (packing && Number(packing?.appliedPrice) > 0) {
                const packingHrs = typeof packing.requiredHours === 'string' ? handleTimeToQuantity(packing.requiredHours) : Number(packing.requiredHours) || 0;
                if (packingHrs > 0) {
                    calculatedLines.push({
                        desc: 'Packing Service',
                        qty: packingHrs,
                        price: Number(packing.appliedPrice),
                        btw: '21',
                    });
                }
            }

            if (unpacking && Number(unpacking?.appliedPrice) > 0) {
                const unpackingHrs = typeof unpacking.requiredHours === 'string' ? handleTimeToQuantity(unpacking.requiredHours) : Number(unpacking.requiredHours) || 0;
                if (unpackingHrs > 0) {
                    calculatedLines.push({
                        desc: 'Unpacking Service',
                        qty: unpackingHrs,
                        price: Number(unpacking.appliedPrice),
                        btw: '21',
                    });
                }
            }

            if (assembling && Number(assembling?.appliedPrice) > 0) {
                const assembleHrs = typeof assembling.requiredHours === 'string' ? handleTimeToQuantity(assembling.requiredHours) : Number(assembling.requiredHours) || 0;
                if (assembleHrs > 0) {
                    calculatedLines.push({
                        desc: 'Furniture Assembly Service',
                        qty: assembleHrs,
                        price: Number(assembling.appliedPrice),
                        btw: '21',
                    });
                }
            }

            if (disassembling && Number(disassembling?.appliedPrice) > 0) {
                const disHrs = typeof disassembling.requiredHours === 'string' ? handleTimeToQuantity(disassembling.requiredHours) : Number(disassembling.requiredHours) || 0;
                if (disHrs > 0) {
                    calculatedLines.push({
                        desc: 'Furniture Disassembly Service',
                        qty: disHrs,
                        price: Number(disassembling.appliedPrice),
                        btw: '21',
                    });
                }
            }

            if (movingLift && Number(movingLift?.quantity) > 0 && (Number(movingLift?.appliedPrice) > 0 || Number(movingLift?.price) > 0)) {
                calculatedLines.push({
                    desc: 'Moving Lift Service',
                    qty: Number(movingLift?.quantity),
                    price: Number(movingLift?.price) || Number(movingLift?.appliedPrice) || 0,
                    btw: '21',
                });
            }

            const storageQty = Number(storage?.storageVolume) || Number(storage?.quantity) || 0;
            if (storage && storageQty > 0 && (Number(storage?.appliedPrice) > 0 || Number(storage?.price) > 0)) {
                calculatedLines.push({
                    desc: 'Storage Service',
                    qty: storageQty,
                    price: Number(storage?.appliedPrice) || Number(storage?.price) || 0,
                    btw: '21',
                });
            }

            if (insurance && Number(insurance?.quantity) > 0 && (Number(insurance?.price) > 0 || Number(insurance?.appliedPrice) > 0)) {
                calculatedLines.push({
                    desc: 'Insurance Coverage',
                    qty: Number(insurance?.quantity),
                    price: Number(insurance?.price) || Number(insurance?.appliedPrice) || 0,
                    btw: '21',
                });
            }

            if (certificate && Number(certificate?.quantity) > 0 && (Number(certificate?.price) > 0 || Number(certificate?.appliedPrice) > 0)) {
                calculatedLines.push({
                    desc: 'Certificate Service',
                    qty: Number(certificate?.quantity),
                    price: Number(certificate?.price) || Number(certificate?.appliedPrice) || 0,
                    btw: '21',
                });
            }

            if (movingPackages && Number(movingPackages?.quantity) > 0 && (Number(movingPackages?.price) > 0 || Number(movingPackages?.appliedPrice) > 0)) {
                calculatedLines.push({
                    desc: 'Moving Packages Service',
                    qty: Number(movingPackages?.quantity),
                    price: Number(movingPackages?.price) || Number(movingPackages?.appliedPrice) || 0,
                    btw: '21',
                });
            }

            if (Array.isArray(materials)) {
                materials.forEach((mat: any) => {
                    const qty = Number(mat.quantity) || 0;
                    const price = Number(mat.sellingPrice) || Number(mat.price) || 0;
                    if (qty > 0 && price > 0) {
                        calculatedLines.push({
                            desc: `Packing Material: ${mat.name || 'Moving Item'}`,
                            qty: qty,
                            price: price,
                            btw: '21',
                        });
                    }
                });
            }

            calculatedLines.forEach((cLine) => {
                const uniqueKey = `${cLine.desc}/${cLine.price}`;
                if (!newItems.has(uniqueKey)) {
                    append({
                        salesgroup: defaultSg,
                        description: cLine.desc,
                        quantity: cLine.qty,
                        btw: cLine.btw,
                        price: cLine.price,
                    });
                    newItems.add(uniqueKey);
                }
            });
        }

        setAppendedItems(newItems);
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

    const subtotal = items?.reduce((acc: any, item: any) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return acc + quantity * price;
    }, 0);

    const discountMultiplier = Math.max(0, 1 - (discountPercentage / 100));
    const discountAmount = subtotal * (discountPercentage / 100);
    const discountedSubtotal = subtotal - discountAmount;

    let taxTotal = 0;
    let total = 0;

    if (vatSelected === 'inclusive') {
        // Including VAT: line item prices already include VAT.
        // Tax is extracted from the discounted gross base: gross * (btw / (100 + btw))
        taxTotal = items?.reduce((acc: any, item: any) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const btw = Number(item.btw) || 0;
            const discountedLineGross = (price * quantity) * discountMultiplier;
            const itemTax = btw > 0 ? discountedLineGross * (btw / (100 + btw)) : 0;
            return acc + itemTax;
        }, 0);
        total = discountedSubtotal;
    } else {
        // Excluding VAT (standard): prices are net. Discount applies before tax.
        taxTotal = items?.reduce((acc: any, item: any) => {
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const btw = Number(item.btw) || 0;
            const discountedLineNet = (price * quantity) * discountMultiplier;
            const itemTax = discountedLineNet * (btw / 100);
            return acc + itemTax;
        }, 0);
        total = discountedSubtotal + taxTotal;
    }

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

                                <option value="0">0%</option>
                                <option value="9">9%</option>
                                <option value="21">21%</option>
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
                        onClick={() => append({ salesgroup: '', description: '', quantity: 1, btw: "", price: 0 })}
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
