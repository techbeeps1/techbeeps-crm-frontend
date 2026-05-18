import React, { useEffect } from 'react'
import { useFormContext, Controller } from "react-hook-form";

const RelocationCalculation: React.FC<any> = ({ totalSum, priceAgreement, rooms }) => {
    const { setValue,control } = useFormContext() as any;

    const groupedInventoryItems = rooms?.flatMap((item: any) => item?.inventoryItems)
        .reduce((acc: Record<string, any>, box: any) => {
            if (acc[box._id]) {
                acc[box._id].quantity += box.quantity; // Increment quantity if _id exists
            } else {
                acc[box._id] = { ...box }; // Add new entry if _id doesn't exist
            }
            return acc;
        }, {});

    const mergedInventoryItems = Object.values(groupedInventoryItems);

    useEffect(() => {
        const totalBoxes = mergedInventoryItems && mergedInventoryItems.reduce((sum, box: any) => sum + box.quantity, 0);
        setValue('relocation.totalBoxes', totalBoxes); 
    }, []);

    return (
        <details className="group">
            <summary className="flex justify-between items-center p-4 bg-white cursor-pointer list-none">
                <h3 className="text-lg font-medium">Relocation</h3>
                <div className="flex items-center">
                    <span className="text-md font-bold mx-2">{totalSum && totalSum} $</span>
                    <span className="transform transition-transform group-open:rotate-180">
                        ▼
                    </span>
                </div>
            </summary>
            <div className="p-4 bg-white border-t border-gray">
                <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                        <span className="font-medium">Cubic meter</span>
                        <Controller
                            name="relocation.totalVolume"
                            control={control}
                            defaultValue="0"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min={0}
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                        {priceAgreement !== 'onhourly_basis' &&
                            <Controller
                                name="relocation.pricePerMeterCubic"
                                control={control}
                                defaultValue="0"
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="number"
                                        min={0}
                                        className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                    />
                                )}
                            />}
                    </div>
                    <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                        <span className="font-medium">Hours</span>
                        <Controller
                            name="relocation.requiredHours"
                            control={control}
                            defaultValue=""
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="time"
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                        {priceAgreement === 'onhourly_basis' && <Controller
                            name="relocation.pricePerMeterCubic"
                            control={control}
                            defaultValue="0"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min={0}
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />}
                    </div>
                    <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                        <span className="font-medium">Movers</span>
                        <Controller
                            name="relocation.movers"
                            control={control}
                            defaultValue="2"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min={0}
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                        <span className="font-medium">Travel time</span>
                        <Controller
                            name="relocation.travelTime"
                            control={control}
                            defaultValue="0"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min={0}
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                        <Controller
                            name="relocation.pricePerHour"
                            control={control}
                            defaultValue="0"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="number"
                                    min={0}
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                        <span className="font-medium">Distance</span>
                        <Controller
                            name="relocation.distance"
                            control={control}
                            defaultValue="0"
                            rules={{
                                pattern: {
                                    value: /^[0-9]*\.?[0-9]*$/,
                                    message: 'Only numbers and decimals are allowed',
                                },
                            }}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="text"
                                    inputMode="decimal"
                                    pattern="[0-9]*\.?[0-9]*"
                                    className="text-right font-medium bg-white rounded px-6 py-2 border border-gray text-lg outline-none"
                                    onInput={(e) => {
                                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.]/g, '');
                                        if ((e.currentTarget.value.match(/\./g) || []).length > 1) {
                                            e.currentTarget.value = e.currentTarget.value.replace(/\.+$/, '');
                                        }
                                        field.onChange(e); // Ensure form state updates
                                    }}
                                />
                            )}
                        />
                        <Controller
                            name="relocation.pricePerKilometer"
                            control={control}
                            defaultValue="0"
                            render={({ field }) => (
                                <input
                                    {...field}
                                    min={0}
                                    type="number"
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                    </div>
                    {mergedInventoryItems.map((box: any, index: number) => (
                        <div key={index} className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                            <span className="font-medium">{box.name}</span>
                            <input
                                type="number"
                                value={box.quantity}
                                readOnly
                                min={0}
                                className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                            />
                            <input
                                value={box.price}
                                readOnly
                                min={0}
                                type="number"
                                className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </details>
    )
}

export default RelocationCalculation