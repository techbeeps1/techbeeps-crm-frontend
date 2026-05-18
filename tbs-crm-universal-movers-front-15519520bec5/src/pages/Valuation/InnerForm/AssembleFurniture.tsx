import React, { useState } from 'react';

const AssembleFurniture: React.FC<any> = ({type, items,setItems}) => {

    const [selectAll, setSelectAll] = useState<boolean>(true);

    const toggleSelectAll = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        setItems(items.map((item: any) => ({ furnitureTypeName: item.furnitureTypeName, _id: item._id, checked: newSelectAll,service:type,cubicMeter:item.cubicMeter })));
    };

    const toggleItem = (id: number) => {
        const updatedItems = items.map((item:any, index) =>
            index === id ? { furnitureTypeName: item.furnitureTypeName, _id: item._id, checked: !item.checked,service:type, cubicMeter : item.cubicMeter} : item
        );
        setItems(updatedItems);
        setSelectAll(updatedItems.every((item:any) => item.checked));
    };

    return (
        <div className="rounded-lg px-5 pt-3 h-full overflow-y-auto">
            <div
                className="bg-blue text-white text-center p-4 font-bold rounded cursor-pointer mb-4"
                onClick={toggleSelectAll}
            >
                Select All
            </div>

            {items.map((item:any, index) => (
                <div key={index} className="bg-white flex items-center p-4 mb-2 rounded cursor-pointer">
                    <label className="flex items-center gap-3 w-full cursor-pointer">
                        <input
                            type="checkbox"
                            checked={item.checked ?? false}
                            onChange={() => toggleItem(index)}
                            className="w-6 h-6 border-2 border-blue-500 rounded cursor-pointer"
                        />
                        <span className="font-bold text-black text-xl">{item.furnitureTypeName}</span>
                    </label>
                </div>
            ))}
        </div>
    );
};

export default AssembleFurniture;
