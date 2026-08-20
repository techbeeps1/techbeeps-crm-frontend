import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import DragCloseDrawer from '../Valuation/DragCloseDrawer';
import {
  MdAdd,
  MdDeleteOutline,
  MdClose,
  MdCheckCircle,
  MdChair,
  MdOutlineMeetingRoom
} from 'react-icons/md';

export const FurnitureDrawer: React.FC<any> = ({
  selectItem,
  setSelectItem,
  furniture,
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [isDeleteFurniture, setDeleteFurniture] = useState<string[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<any>();

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const toggleFurnitureSelection = (id: string) => {
    setSelectedFurniture((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id],
    );
  };

  const toggleFurnitureDelete = (id: string) => {
    setDeleteFurniture((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id],
    );
  };

  const handleSubmit = () => {
    setLoading(true);
    handleUpdate();
  };

  useEffect(() => {
    if (selectItem) {
      fetchRoomInner();
    }
  }, [selectItem]);

  const fetchRoomInner = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiPath}/api/room/${selectItem?._id}`,
      );
      setData(response.data);
    } catch (err: any) {
      notifyError(`Failed to fetch room furniture: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.post(
        `${apiPath}/api/room/${selectItem?._id}`,
        { furnitureTypeIds: selectedFurniture },
      );
      if (response.status === 200) {
        notify(
          `Furniture assigned successfully to ${selectItem?.roomTypeName}`,
        );
        setModalOpen(false);
        fetchRoomInner();
        setSelectedFurniture([]);
      }
    } catch (error: any) {
      notifyError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      const response = await axios.post(
        `${apiPath}/api/room/remove/${selectItem?._id}`,
        { furnitureTypeIds: isDeleteFurniture },
      );
      if (response.status === 200) {
        notify(
          `Selected furniture removed from ${selectItem?.roomTypeName}`,
        );
        fetchRoomInner();
        setDeleteFurniture([]);
      }
    } catch (error: any) {
      notifyError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="grid place-content-center">
        {/* Main Room Furniture Drawer */}
        <DragCloseDrawer open={selectItem} setOpen={setSelectItem}>
          <div
            className="flex flex-col h-full space-y-4 text-slate-200 p-2 sm:p-4 max-w-3xl w-full mx-auto"
            style={{ minWidth: '320px' }}
          >
            {/* Header */}
            <div className="text-center border-b border-white/10 pb-4">
              <span className="text-xs uppercase tracking-widest text-primary font-extrabold block">
                Room Inventory Mapping
              </span>
              <h3 className="text-white font-black text-xl sm:text-2xl mt-1 flex items-center justify-center gap-2">
                <MdOutlineMeetingRoom className="text-primary" />
                {selectItem?.roomTypeName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select items to remove, or click "Add Furniture" to assign new pieces.
              </p>
            </div>

            {/* Grid of assigned items */}
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 h-full px-2 py-2 overflow-y-auto max-h-[55vh]"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* Add New Card */}
              <div
                className="bg-primary/10 hover:bg-primary/20 border-2 border-dashed border-primary/40 flex flex-col items-center justify-center h-36 rounded-2xl cursor-pointer transition-all p-3 text-center group"
                onClick={() => setModalOpen(true)}
              >
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center text-2xl mb-2 shadow-md shadow-primary/30 group-hover:scale-110 transition-transform">
                  <MdAdd />
                </div>
                <p className="text-white font-bold text-xs sm:text-sm">
                  Add Furniture
                </p>
                <span className="text-[10px] text-slate-400">From Catalogue</span>
              </div>

              {data &&
                data?.furnitureType?.map((item: any, index: number) => {
                  const isMarkedForDelete = isDeleteFurniture.includes(item._id);
                  return (
                    <div
                      key={index}
                      onClick={() => toggleFurnitureDelete(item._id)}
                      className={`flex flex-col items-center justify-center h-36 rounded-2xl cursor-pointer transition-all p-3 text-center relative border ${
                        isMarkedForDelete
                          ? 'bg-meta-1/20 border-meta-1 text-white shadow-md shadow-meta-1/20'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                    >
                      {isMarkedForDelete && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-meta-1 text-white flex items-center justify-center text-xs font-bold">
                          ✕
                        </div>
                      )}
                      <div
                        className="w-12 h-12 flex items-center justify-center p-1.5 mb-2 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-slate-200"
                        dangerouslySetInnerHTML={{ __html: item?.icon }}
                      />
                      <p className="font-bold text-xs sm:text-sm truncate w-full">
                        {item?.furnitureTypeName}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {item?.cubicMeter ? `${item.cubicMeter} m³` : ''}
                      </span>
                    </div>
                  );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-3">
              <button
                type="button"
                onClick={() => setSelectItem(null)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
              <button
                type="button"
                disabled={isDeleteFurniture.length === 0}
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-meta-1 hover:bg-opacity-90 text-white shadow-md shadow-meta-1/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <MdDeleteOutline className="text-base" />
                Remove Selected ({isDeleteFurniture.length})
              </button>
            </div>
          </div>
        </DragCloseDrawer>

        {/* Add Furniture Modal Drawer */}
        <DragCloseDrawer open={isModalOpen} setOpen={setModalOpen}>
          <div
            className="flex flex-col h-full space-y-4 text-slate-200 p-2 sm:p-4 max-w-3xl w-full mx-auto"
            style={{ minWidth: '320px' }}
          >
            <div className="text-center border-b border-white/10 pb-4">
              <span className="text-xs uppercase tracking-widest text-primary font-extrabold block">
                Catalogue Selection
              </span>
              <h3 className="text-white font-black text-xl sm:text-2xl mt-1 flex items-center justify-center gap-2">
                <MdChair className="text-primary" />
                Assign Items to {selectItem?.roomTypeName}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tap the furniture items you want to include in this room category
              </p>
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 h-full px-2 py-2 overflow-y-auto max-h-[55vh]"
              style={{ scrollbarWidth: 'none' }}
            >
              {furniture &&
                furniture.map((item: any, index: number) => {
                  const isSelected = selectedFurniture.includes(item._id);
                  return (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center h-36 rounded-2xl cursor-pointer transition-all p-3 text-center relative border ${
                        isSelected
                          ? 'bg-primary/20 border-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                      }`}
                      onClick={() => toggleFurnitureSelection(item._id)}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-primary text-lg">
                          <MdCheckCircle />
                        </div>
                      )}
                      <div
                        className="w-12 h-12 flex items-center justify-center p-1.5 mb-2 [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current text-slate-200"
                        dangerouslySetInnerHTML={{ __html: item?.icon }}
                      />
                      <p className="font-bold text-xs sm:text-sm truncate w-full">
                        {item?.furnitureTypeName}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {item?.cubicMeter ? `${item.cubicMeter} m³` : ''}
                      </span>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedFurniture.length === 0}
                onClick={handleSubmit}
                className="flex items-center gap-1.5 px-6 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-primary hover:bg-opacity-90 text-white shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Assign Selected ({selectedFurniture.length})
              </button>
            </div>
          </div>
        </DragCloseDrawer>
      </div>
    </>
  );
};

