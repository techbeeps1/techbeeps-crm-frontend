import React, { useEffect } from 'react'
import { useFormContext, Controller } from "react-hook-form";

const PackingCalculation: React.FC<any> = ({ packingCharges, type, price }) => {
    const { control, setValue } = useFormContext() as any;

    useEffect(() => {
        setValue(`${type}.appliedPrice`, price);
    }, [setValue, price])

    return (
        <details className="group mt-1">
            <summary className="flex justify-between items-center p-4 bg-white cursor-pointer list-none">
                <h3 className="text-lg font-medium capitalize">{type}</h3>
                <div className="flex items-center">
                    <span className="text-md font-bold mx-2">{packingCharges && packingCharges} $</span>
                    <span className="transform transition-transform group-open:rotate-180">
                        ▼
                    </span>
                </div>
            </summary>
            <div className="p-4 bg-white border-t border-gray">
                <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
                        <span className="font-medium">Hours</span>
                        <Controller
                            name={`${type}.requiredHours`}
                            control={control}
                            defaultValue={0}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    type="time"
                                    className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
                                />
                            )}
                        />
                        <Controller
                            name={`${type}.appliedPrice`}
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
                        <span className="font-medium">{type === 'packing' ? "Packers" : "Unpackers"}</span>
                        <Controller
                            name={`${type}.requiredPackers`}
                            control={control}
                            defaultValue="3"
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
                </div>
            </div>
        </details>
    )
}

export default PackingCalculation