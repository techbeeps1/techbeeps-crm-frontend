import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

const PackingBox: React.FC<any> = ( ) => {
    const { control, register, setValue, watch } = useFormContext() as any;

    const { fields } = useFieldArray({
        control,
        name: "packingBoxes",
    });

    const packingBoxes = watch("packingBoxes");

    const incrementQuantity = (index: number) => {
        const currentQuantity = packingBoxes[index]?.quantity || 0;
        setValue(`packingBoxes.${index}.quantity`, Number(currentQuantity) + 1);
    };

    const decrementQuantity = (index: number) => {
        const currentQuantity = packingBoxes[index]?.quantity || 0;
        if (currentQuantity > 0) {
            setValue(`packingBoxes.${index}.quantity`, Number(currentQuantity) - 1);
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
                <div key={field._id} className="w-full flex justify-between items-center py-3">
                    <label className="block text-white text-xl font-bold ">{field.name}</label>
                    <div className="flex items-center space-x-2">
                        <button
                            type="button"
                            onClick={() => decrementQuantity(index)}
                            className="p-2 px-4 text-black text-xl bg-gray rounded"
                        >  - </button>
                        <input
                            type="number"
                            {...register(`packingBoxes.${index}.quantity`)}
                            className="w-15 font-medium text-xl p-2 text-right rounded bg-white"
                            readOnly
                        />
                        <button
                            type="button"
                            onClick={() => incrementQuantity(index)}
                            className="p-2 px-4 text-black text-xl bg-gray rounded"
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
