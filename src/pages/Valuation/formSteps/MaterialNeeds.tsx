import axios from "axios";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { apiPath } from "../../../../apiPath";
import Loader from "../../../common/Loader";

const MaterialNeeds: React.FC<any> = ({ useFieldArray }) => {

    const { register, control, setValue, watch } = useFormContext() as any;
    const [loading,setLoading] = useState<boolean>(false);
    const { fields ,replace } = useFieldArray({
        control,
        name: "materials",
    });


    const handleAllData = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${apiPath}/api/box?type=Material`);
             const existingMaterials = watch("materials") || [];

    const merged = response.data.map((box: any) => {
      const existing = existingMaterials.find(
        (item: any) =>
          item.material?._id === box._id || item._id === box._id
      );

      return {
        _id: box._id,
        material: {
          _id: box._id,
          name: box.name,
        },
        name: box.name,
        quantity: existing?.quantity ?? 0,
        sellingPrice: box.sellingPrice,
        storageQuantity: existing?.storageQuantity ?? 0,
        cubicMeter: box.cubicMeter,
      };
    });
    
    replace(merged);

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
            console.error(errorMessage);
        }finally{
            setLoading(false)
        }
    };

    useEffect(() => {
        handleAllData();
    }, []);

    const materials = watch("materials");
   

    const incrementQuantity = (index: number) => {
        const currentQuantity = materials[index]?.quantity || 0;
        setValue(`materials.${index}.quantity`, Number(currentQuantity) + 1);
    };

    const decrementQuantity = (index: number) => {
        const currentQuantity = materials[index]?.quantity || 0;
        if (currentQuantity > 0) {
            setValue(`materials.${index}.quantity`, Number(currentQuantity) - 1);
        }
    };

    return (
        <div className="p-10">
            {loading && <Loader/>}
            {fields.map((field:any, index: number) => (
                <div key={index} className="flex justify-between items-center py-2">
                    <label className="block text-xl font-bold">{field.name}</label>
                    <div className="flex items-center space-x-1">
                        <button
                            type="button"
                            onClick={() => decrementQuantity(index)}
                            className="px-5 p-2 font-bold text-xl text-white bg-sky-500 rounded"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            {...register(`materials.${index}.quantity`)}
                            className="max-w-15 font-bold text-xl p-2 text-end rounded bg-white"
                            readOnly
                        />
                        <button
                            type="button"
                            onClick={() => incrementQuantity(index)}
                            className="px-5 p-2 font-bold text-xl text-white bg-green-500 rounded"
                        >
                            +
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MaterialNeeds;
