import React, { useEffect, useState } from 'react';

const AssembleFurniture: React.FC<any> = ({
  type,
  items,
  setItems,
}) => {
  const [selectAll, setSelectAll] = useState(false);

  // Sync selectAll state when items change
  useEffect(() => {
    const allSelected =
      items.length > 0 &&
      items.every((item: any) => item.checked);

    setSelectAll(allSelected);
  }, [items]);

  const toggleSelectAll = () => {
    const newValue = !selectAll;

    setItems(
      items.map((item: any) => ({
        ...item, // keep all existing properties
        checked: newValue,
        service: type,
      }))
    );

    setSelectAll(newValue);
  };

  const toggleItem = (id: string) => {
    const updatedItems = items.map((item: any) =>
      item._id === id
        ? {
            ...item,
            checked: !item.checked,
            service: type,
          }
        : item
    );

    setItems(updatedItems);
  };

  return (
    <div className="rounded-lg px-5 pt-3 h-full overflow-y-auto">
      <div
        className="bg-blue text-white text-center p-4 font-bold rounded cursor-pointer mb-4"
        onClick={toggleSelectAll}
      >
        {selectAll ? 'Unselect All' : 'Select All'}
      </div>

      {items.map((item: any) => (
        <div
          key={item._id}
          className="bg-white flex items-center p-4 mb-2 rounded"
        >
          <label className="flex items-center gap-3 w-full cursor-pointer">
            <input
              type="checkbox"
              checked={item.checked ?? false}
              onChange={() => toggleItem(item._id)}
              className="w-6 h-6 border-2 border-blue-500 rounded cursor-pointer"
            />

            <span className="font-bold text-black text-xl">
              {item.furnitureTypeName}
            </span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default AssembleFurniture;