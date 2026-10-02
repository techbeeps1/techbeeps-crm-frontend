import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

const PackingBox: React.FC<any> = () => {
    const { control, register, setValue, watch } = useFormContext() as any;

    const { fields } = useFieldArray({
        control,
        name: "packingBoxes",
    });

    const packingBoxes = watch("packingBoxes") || [];

    const incrementQuantity = (index: number) => {
        const currentQuantity = Number(packingBoxes[index]?.quantity) || 0;
        setValue(`packingBoxes.${index}.quantity`, currentQuantity + 1);
    };

    const decrementQuantity = (index: number) => {
        const currentQuantity = Number(packingBoxes[index]?.quantity) || 0;
        if (currentQuantity > 0) {
            setValue(`packingBoxes.${index}.quantity`, currentQuantity - 1);
        }
    };
  
    return (
        <div
            className="h-full overflow-auto px-5"
            style={{
                scrollbarWidth: "none",
            }}
        >
            {fields.map((field: any, index) => (
                <div key={field.id || field._id || index} className="w-full flex justify-between items-center py-3">
                    <div>
                        <label className="block text-white text-xl font-bold">{field.name}</label>
                        {field.cubicMeter && (
                            <span className="text-xs text-slate-300">
                                {Number(field.cubicMeter).toFixed(3)} m³ / unit
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => decrementQuantity(index)}
                            className="p-2 px-4 text-black text-xl bg-gray hover:bg-slate-200 rounded font-bold transition-colors cursor-pointer"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min={0}
                            onFocus={(e) => e.target.select()}
                            {...register(`packingBoxes.${index}.quantity`, { valueAsNumber: true, min: 0 })}
                            onChange={(e) => {
                                const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                                setValue(`packingBoxes.${index}.quantity`, val);
                            }}
                            className="w-16 font-medium text-xl p-2 text-right rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                            type="button"
                            onClick={() => incrementQuantity(index)}
                            className="p-2 px-4 text-black text-xl bg-gray hover:bg-slate-200 rounded font-bold transition-colors cursor-pointer"
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PackingBox;
