import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdAdd,
  MdDeleteOutline,
  MdClose,
  MdChair,
  MdOutlineMeetingRoom,
  MdSearch,
  MdCheck,
  MdOutlineInventory2,
  MdDoneAll,
  MdArrowBack,
  MdSelectAll,
  MdDeselect,
  MdLayers,
  MdOutlineScale,
  MdOutlineFilterAlt,
} from 'react-icons/md';

interface FurnitureDrawerProps {
  selectItem: any;
  setSelectItem: (item: any) => void;
  furniture: any[];
}

export const FurnitureDrawer: React.FC<FurnitureDrawerProps> = ({
  selectItem,
  setSelectItem,
  furniture = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [isDeleteFurniture, setDeleteFurniture] = useState<string[]>([]);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogueSearch, setCatalogueSearch] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'bulky' | 'marked'>('all');
  const [catalogueFilterTab, setCatalogueFilterTab] = useState<'all' | 'available' | 'in_room'>('all');

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  // Fetch room data when a room is selected
  useEffect(() => {
    if (selectItem?._id) {
      fetchRoomInner();
      setDeleteFurniture([]);
      setSelectedFurniture([]);
      setSearchQuery('');
      setCatalogueSearch('');
      setActiveFilterTab('all');
      setCatalogueFilterTab('all');
      setIsCatalogueOpen(false);
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

  const handleAssignFurniture = async () => {
    if (selectedFurniture.length === 0) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiPath}/api/room/${selectItem?._id}`,
        { furnitureTypeIds: selectedFurniture },
      );
      if (response.status === 200) {
        notify(
          `${selectedFurniture.length} furniture item(s) assigned to ${selectItem?.roomTypeName}`,
        );
        setIsCatalogueOpen(false);
        setSelectedFurniture([]);
        fetchRoomInner();
      }
    } catch (error: any) {
      notifyError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (isDeleteFurniture.length === 0) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiPath}/api/room/remove/${selectItem?._id}`,
        { furnitureTypeIds: isDeleteFurniture },
      );
      if (response.status === 200) {
        notify(
          `${isDeleteFurniture.length} furniture item(s) removed from ${selectItem?.roomTypeName}`,
        );
        setDeleteFurniture([]);
        fetchRoomInner();
      }
    } catch (error: any) {
      notifyError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Assigned items calculation
  const assignedItems: any[] = useMemo(() => {
    return data?.furnitureType || [];
  }, [data]);

  const assignedItemIds = useMemo(() => {
    return new Set(assignedItems.map((item: any) => item._id));
  }, [assignedItems]);

  const filteredAssignedItems = useMemo(() => {
    return assignedItems.filter((item: any) => {
      const matchesSearch = (item.furnitureTypeName || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilterTab === 'bulky') {
        return (parseFloat(item.cubicMeter) || 0) >= 0.5;
      }
      if (activeFilterTab === 'marked') {
        return isDeleteFurniture.includes(item._id);
      }
      return true;
    });
  }, [assignedItems, searchQuery, activeFilterTab, isDeleteFurniture]);

  const totalAssignedVolume = useMemo(() => {
    return assignedItems.reduce(
      (sum, item) => sum + (parseFloat(item.cubicMeter) || 0),
      0,
    );
  }, [assignedItems]);

  const totalAssignedWeight = useMemo(() => {
    return assignedItems.reduce(
      (sum, item) => sum + (parseFloat(item.weight) || 0),
      0,
    );
  }, [assignedItems]);

  const selectedDeleteVolume = useMemo(() => {
    return assignedItems
      .filter((item) => isDeleteFurniture.includes(item._id))
      .reduce((sum, item) => sum + (parseFloat(item.cubicMeter) || 0), 0);
  }, [assignedItems, isDeleteFurniture]);

  // Catalogue filtered items
  const filteredCatalogue = useMemo(() => {
    return furniture.filter((item: any) => {
      const matchesSearch = (item.furnitureTypeName || '')
        .toLowerCase()
        .includes(catalogueSearch.toLowerCase());
      if (!matchesSearch) return false;

      const isAlreadyInRoom = assignedItemIds.has(item._id);
      if (catalogueFilterTab === 'available') {
        return !isAlreadyInRoom;
      }
      if (catalogueFilterTab === 'in_room') {
        return isAlreadyInRoom;
      }
      return true;
    });
  }, [furniture, catalogueSearch, catalogueFilterTab, assignedItemIds]);

  const selectedAddVolume = useMemo(() => {
    return furniture
      .filter((item) => selectedFurniture.includes(item._id))
      .reduce((sum, item) => sum + (parseFloat(item.cubicMeter) || 0), 0);
  }, [furniture, selectedFurniture]);

  // Batch action handlers
  const handleSelectAllForDelete = () => {
    if (isDeleteFurniture.length === filteredAssignedItems.length) {
      setDeleteFurniture([]);
    } else {
      setDeleteFurniture(filteredAssignedItems.map((item) => item._id));
    }
  };

  const handleSelectAllCatalogue = () => {
    const unassignedCatalogueItems = filteredCatalogue.filter(
      (item) => !assignedItemIds.has(item._id),
    );
    if (selectedFurniture.length === unassignedCatalogueItems.length) {
      setSelectedFurniture([]);
    } else {
      setSelectedFurniture(unassignedCatalogueItems.map((item) => item._id));
    }
  };

  const handleClose = () => {
    setSelectItem(null);
    setIsCatalogueOpen(false);
    setDeleteFurniture([]);
    setSelectedFurniture([]);
  };

  if (!selectItem) return null;

  return (
    <>
      {loading && <Loader />}
      <AnimatePresence>
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
          />

          {/* Main Modal Card (Premium Light Theme) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.08 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl max-h-[92vh] bg-white dark:bg-boxdark text-slate-800 dark:text-slate-100 rounded-3xl border border-slate-200 dark:border-strokedark shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col z-10"
          >
            {/* Top decorative gradient accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-sky-400 shrink-0" />

            {!isCatalogueOpen ? (
              /* ================= VIEW 1: ROOM INVENTORY MAPPING (PREMIUM LIGHT) ================= */
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header Banner */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-strokedark bg-gradient-to-r from-slate-50/90 via-white to-blue-50/30 dark:from-meta-4/30 dark:via-boxdark dark:to-boxdark flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-4">
                    {/* Room Icon Pill */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-indigo-100/50 dark:bg-primary/20 border border-primary/25 flex items-center justify-center text-primary shadow-sm shrink-0">
                      {selectItem?.icon ? (
                        <div
                          className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-primary text-primary"
                          dangerouslySetInnerHTML={{ __html: selectItem.icon }}
                        />
                      ) : (
                        <MdOutlineMeetingRoom className="text-3xl text-primary" />
                      )}
                    </div>

                    <div>
                      {/* Top Badges Row */}
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Room Inventory
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          {assignedItems.length} {assignedItems.length === 1 ? 'item' : 'items'}
                        </span>
                        {totalAssignedVolume > 0 && (
                          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/40">
                            📦 {totalAssignedVolume.toFixed(2)} m³ volume
                          </span>
                        )}
                        {totalAssignedWeight > 0 && (
                          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                            ⚖️ {totalAssignedWeight.toFixed(0)} kg
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        {selectItem?.roomTypeName || 'Room'}
                      </h2>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-2.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsCatalogueOpen(true)}
                      className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <MdAdd className="text-lg" />
                      <span>Add Furniture</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleClose}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200/80 dark:border-strokedark transition-all cursor-pointer"
                      title="Close"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Sub-header Toolbar (Search, Filter Tabs & Batch Actions) */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50/60 dark:bg-boxdark border-b border-slate-100 dark:border-strokedark flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                  {/* Left: Search & Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                      <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Search in ${selectItem?.roomTypeName}...`}
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-form-input text-slate-800 dark:text-white placeholder-slate-400 rounded-xl border border-slate-200 dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium shadow-2xs transition-all"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    {assignedItems.length > 0 && (
                      <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setActiveFilterTab('all')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            activeFilterTab === 'all'
                              ? 'bg-white dark:bg-meta-4 text-primary dark:text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          All ({assignedItems.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveFilterTab('bulky')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            activeFilterTab === 'bulky'
                              ? 'bg-white dark:bg-meta-4 text-primary dark:text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          Large ({assignedItems.filter((i) => (parseFloat(i.cubicMeter) || 0) >= 0.5).length})
                        </button>
                        {isDeleteFurniture.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setActiveFilterTab('marked')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                              activeFilterTab === 'marked'
                                ? 'bg-primary text-white shadow-2xs'
                                : 'text-primary font-bold hover:text-primary/80'
                            }`}
                          >
                            Selected ({isDeleteFurniture.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Quick Selection Controls */}
                  {assignedItems.length > 0 && (
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        type="button"
                        onClick={handleSelectAllForDelete}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                      >
                        {isDeleteFurniture.length === filteredAssignedItems.length && filteredAssignedItems.length > 0 ? (
                          <>
                            <MdDeselect className="text-sm text-primary" />
                            <span>Deselect All</span>
                          </>
                        ) : (
                          <>
                            <MdSelectAll className="text-sm text-primary" />
                            <span>Select All</span>
                          </>
                        )}
                      </button>

                      {isDeleteFurniture.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setDeleteFurniture([])}
                          className="text-xs font-bold text-primary hover:text-primary/80 px-2 py-1 transition-colors cursor-pointer"
                        >
                          Clear ({isDeleteFurniture.length})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Grid Content */}
                <div
                  className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden min-h-[300px] max-h-[56vh] bg-[#F8FAFC] dark:bg-[#1A222C]"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 transparent',
                  }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {/* Add New Card (First tile) */}
                    <div
                      onClick={() => setIsCatalogueOpen(true)}
                      className="group flex flex-col items-center justify-center h-48 rounded-2xl border-2 border-dashed border-primary/40 hover:border-primary bg-gradient-to-b from-primary/[0.02] to-primary/[0.06] hover:bg-primary/10 dark:bg-boxdark dark:hover:bg-primary/10 cursor-pointer transition-all duration-200 p-4 text-center hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/15 shadow-2xs"
                    >
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-2xl mb-2.5 shadow-md shadow-primary/30 group-hover:scale-110 transition-transform">
                        <MdAdd />
                      </div>
                      <p className="text-slate-900 dark:text-white font-black text-sm">
                        Add Furniture
                      </p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        From Catalogue
                      </span>
                      <span className="mt-2 text-[10px] font-extrabold text-primary bg-primary/10 dark:bg-primary/20 px-2.5 py-0.5 rounded-full border border-primary/20">
                        {furniture.length} available
                      </span>
                    </div>

                    {/* Assigned Items Cards */}
                    {filteredAssignedItems.map((item: any) => {
                      const isMarkedForDelete = isDeleteFurniture.includes(
                        item._id,
                      );
                      const volume = item?.cubicMeter
                        ? `${parseFloat(item.cubicMeter).toFixed(2)} m³`
                        : null;

                      return (
                        <div
                          key={item._id}
                          onClick={() => toggleFurnitureDelete(item._id)}
                          className={`group relative flex flex-col justify-between items-center h-48 rounded-2xl cursor-pointer transition-all duration-200 p-3.5 text-center border select-none ${
                            isMarkedForDelete
                              ? 'bg-primary/5 dark:bg-primary/20 border-primary ring-2 ring-primary/30 shadow-md shadow-primary/10 scale-[0.99]'
                              : 'bg-white dark:bg-boxdark hover:bg-slate-50/80 dark:hover:bg-meta-4/30 border-slate-200/90 dark:border-strokedark hover:border-primary/40 dark:hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] shadow-2xs'
                          }`}
                        >
                          {/* Top Badges */}
                          <div className="w-full flex items-center justify-between">
                            {volume ? (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  isMarkedForDelete
                                    ? 'bg-primary/10 text-primary border-primary/20'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {volume}
                              </span>
                            ) : (
                              <span />
                            )}

                            {/* Selection state badge */}
                            {isMarkedForDelete ? (
                              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-md shadow-primary/30">
                                <MdCheck className="text-sm font-bold" />
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-primary/60 transition-colors" />
                            )}
                          </div>

                          {/* Icon */}
                          <div
                            className={`w-15 h-15 rounded-2xl border flex items-center justify-center p-2.5 my-1 group-hover:scale-105 transition-all shrink-0 ${
                              isMarkedForDelete
                                ? 'bg-primary/10 border-primary/25 text-primary'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/60 group-hover:bg-primary/5 group-hover:border-primary/20'
                            }`}
                          >
                            {item?.icon ? (
                              <div
                                className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current ${
                                  isMarkedForDelete
                                    ? 'text-primary'
                                    : 'text-slate-700 dark:text-slate-200 group-hover:text-primary'
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html: item.icon,
                                }}
                              />
                            ) : (
                              <MdChair
                                className={`text-3xl ${
                                  isMarkedForDelete
                                    ? 'text-primary'
                                    : 'text-slate-600 dark:text-slate-400 group-hover:text-primary'
                                }`}
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="w-full">
                            <p
                              className={`font-bold text-xs sm:text-sm truncate w-full ${
                                isMarkedForDelete
                                  ? 'text-primary dark:text-white font-bold'
                                  : 'text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors'
                              }`}
                              title={item?.furnitureTypeName}
                            >
                              {item?.furnitureTypeName || 'Unnamed Item'}
                            </p>
                            <span
                              className={`text-[10px] block mt-0.5 font-medium ${
                                isMarkedForDelete
                                  ? 'text-primary font-semibold'
                                  : 'text-slate-400 dark:text-slate-400'
                              }`}
                            >
                              {isMarkedForDelete
                                ? 'Selected for Removal'
                                : item?.weight
                                ? `${item.weight} kg`
                                : 'Assigned'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty Search / Items State */}
                  {filteredAssignedItems.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark flex items-center justify-center text-3xl text-slate-400 mb-3 shadow-xs">
                        <MdOutlineInventory2 />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                        {searchQuery
                          ? 'No matching furniture found'
                          : 'No furniture assigned yet'}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                        {searchQuery
                          ? `No items match "${searchQuery}". Try clearing your search filter.`
                          : `This room category doesn't have any default furniture pieces mapped to it yet.`}
                      </p>
                      {searchQuery ? (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-white border border-slate-200 dark:border-strokedark transition-colors"
                        >
                          Clear Search Filter
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsCatalogueOpen(true)}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 text-xs font-bold text-white shadow-md shadow-primary/25 transition-all cursor-pointer"
                        >
                          <MdAdd className="text-base" />
                          <span>Browse Catalogue & Add Items</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-strokedark bg-white dark:bg-boxdark flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                    {isDeleteFurniture.length > 0 ? (
                      <span className="text-primary font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        {isDeleteFurniture.length} item(s) selected for removal
                        {selectedDeleteVolume > 0 &&
                          ` (${selectedDeleteVolume.toFixed(2)} m³ volume freed)`}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium">
                        💡 Tip: Click items above to select them for removal, or click "+ Add Furniture" to assign new pieces.
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-strokedark transition-all cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      disabled={isDeleteFurniture.length === 0}
                      onClick={handleRemove}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-primary hover:bg-opacity-90 text-white shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MdDeleteOutline className="text-base" />
                      <span>
                        Remove Selected ({isDeleteFurniture.length})
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ================= VIEW 2: CATALOGUE SELECTION MODAL (PREMIUM LIGHT) ================= */
              <div className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-strokedark bg-gradient-to-r from-slate-50/90 via-white to-blue-50/30 dark:from-meta-4/30 dark:via-boxdark dark:to-boxdark flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                  <div className="flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCatalogueOpen(false);
                        setSelectedFurniture([]);
                      }}
                      className="p-2.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-strokedark shadow-2xs transition-all cursor-pointer shrink-0"
                      title="Back to Room"
                    >
                      <MdArrowBack className="text-xl" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          Catalogue Selection
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Assigning to <strong className="text-slate-800 dark:text-white">{selectItem?.roomTypeName}</strong>
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Select Pieces from Catalogue
                      </h2>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCatalogueOpen(false);
                      setSelectedFurniture([]);
                    }}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white border border-slate-200/80 dark:border-strokedark transition-all cursor-pointer self-end sm:self-auto"
                    title="Close"
                  >
                    <MdClose className="text-xl" />
                  </button>
                </div>

                {/* Subheader Toolbar */}
                <div className="px-5 sm:px-6 py-3 bg-slate-50/60 dark:bg-boxdark border-b border-slate-100 dark:border-strokedark flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
                  {/* Search Bar & Filter Tabs */}
                  <div className="flex flex-wrap items-center gap-3 flex-1">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                      <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                      <input
                        type="text"
                        value={catalogueSearch}
                        onChange={(e) => setCatalogueSearch(e.target.value)}
                        placeholder="Search furniture in catalogue..."
                        className="w-full pl-9 pr-8 py-2 bg-white dark:bg-form-input text-slate-800 dark:text-white placeholder-slate-400 rounded-xl border border-slate-200 dark:border-strokedark outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-xs sm:text-sm font-medium shadow-2xs transition-all"
                      />
                      {catalogueSearch && (
                        <button
                          type="button"
                          onClick={() => setCatalogueSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setCatalogueFilterTab('all')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          catalogueFilterTab === 'all'
                            ? 'bg-white dark:bg-meta-4 text-primary dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        All ({furniture.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCatalogueFilterTab('available')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          catalogueFilterTab === 'available'
                            ? 'bg-white dark:bg-meta-4 text-primary dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Available ({furniture.filter((i) => !assignedItemIds.has(i._id)).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setCatalogueFilterTab('in_room')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          catalogueFilterTab === 'in_room'
                            ? 'bg-white dark:bg-meta-4 text-primary dark:text-white shadow-2xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        In Room ({furniture.filter((i) => assignedItemIds.has(i._id)).length})
                      </button>
                    </div>
                  </div>

                  {/* Selection Actions */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      type="button"
                      onClick={handleSelectAllCatalogue}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer"
                    >
                      <MdDoneAll className="text-sm text-primary" />
                      <span>
                        {selectedFurniture.length > 0
                          ? 'Deselect All'
                          : 'Select All Available'}
                      </span>
                    </button>

                    {selectedFurniture.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedFurniture([])}
                        className="text-xs font-bold text-primary hover:text-primary/80 px-2 py-1 transition-colors cursor-pointer"
                      >
                        Clear ({selectedFurniture.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Catalogue Grid */}
                <div
                  className="flex-1 p-4 sm:p-6 overflow-y-auto overflow-x-hidden min-h-[300px] max-h-[56vh] bg-[#F8FAFC] dark:bg-[#1A222C]"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 transparent',
                  }}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                    {filteredCatalogue.map((item: any) => {
                      const isAlreadyAssigned = assignedItemIds.has(item._id);
                      const isSelected = selectedFurniture.includes(item._id);
                      const volume = item?.cubicMeter
                        ? `${parseFloat(item.cubicMeter).toFixed(2)} m³`
                        : null;

                      return (
                        <div
                          key={item._id}
                          onClick={() => {
                            if (!isAlreadyAssigned) {
                              toggleFurnitureSelection(item._id);
                            }
                          }}
                          className={`group relative flex flex-col justify-between items-center h-48 rounded-2xl transition-all duration-200 p-3.5 text-center border select-none ${
                            isAlreadyAssigned
                              ? 'bg-slate-100/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'bg-gradient-to-b from-primary/10 to-indigo-50/50 dark:bg-primary/20 border-primary ring-2 ring-primary/30 shadow-md shadow-primary/15 scale-[1.02] cursor-pointer'
                              : 'bg-white dark:bg-boxdark hover:bg-slate-50/80 dark:hover:bg-meta-4/30 border-slate-200/90 dark:border-strokedark hover:border-primary/40 dark:hover:border-primary/50 hover:-translate-y-1 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.08)] shadow-2xs cursor-pointer'
                          }`}
                        >
                          {/* Top Tag & Checkmark */}
                          <div className="w-full flex items-center justify-between">
                            {volume ? (
                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                {volume}
                              </span>
                            ) : (
                              <span />
                            )}

                            {isAlreadyAssigned ? (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700/50 px-1.5 py-0.5 rounded-md">
                                In Room
                              </span>
                            ) : isSelected ? (
                              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center text-sm shadow-md shadow-primary/30">
                                <MdCheck />
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 group-hover:border-primary/60 transition-colors" />
                            )}
                          </div>

                          {/* Icon */}
                          <div
                            className={`w-15 h-15 rounded-2xl border flex items-center justify-center p-2.5 my-1 group-hover:scale-105 transition-all shrink-0 ${
                              isAlreadyAssigned
                                ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                                : isSelected
                                ? 'bg-white dark:bg-slate-800 border-primary/30 shadow-inner'
                                : 'bg-slate-50 dark:bg-slate-800/80 border-slate-100 dark:border-slate-700/60 group-hover:bg-primary/5 group-hover:border-primary/20'
                            }`}
                          >
                            {item?.icon ? (
                              <div
                                className={`w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:fill-current ${
                                  isAlreadyAssigned
                                    ? 'text-slate-400'
                                    : isSelected
                                    ? 'text-primary'
                                    : 'text-slate-700 dark:text-slate-200 group-hover:text-primary'
                                }`}
                                dangerouslySetInnerHTML={{
                                  __html: item.icon,
                                }}
                              />
                            ) : (
                              <MdChair
                                className={`text-3xl ${
                                  isAlreadyAssigned
                                    ? 'text-slate-400'
                                    : isSelected
                                    ? 'text-primary'
                                    : 'text-slate-600 dark:text-slate-400 group-hover:text-primary'
                                }`}
                              />
                            )}
                          </div>

                          {/* Name & Subtitle */}
                          <div className="w-full">
                            <p
                              className={`font-bold text-xs sm:text-sm truncate w-full ${
                                isAlreadyAssigned
                                  ? 'text-slate-400'
                                  : isSelected
                                  ? 'text-primary font-black'
                                  : 'text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors'
                              }`}
                              title={item?.furnitureTypeName}
                            >
                              {item?.furnitureTypeName || 'Unnamed Item'}
                            </p>
                            <span
                              className={`text-[10px] block mt-0.5 font-medium ${
                                isAlreadyAssigned
                                  ? 'text-slate-400'
                                  : isSelected
                                  ? 'text-primary font-bold'
                                  : 'text-slate-400 dark:text-slate-400'
                              }`}
                            >
                              {isAlreadyAssigned
                                ? 'Already in Room'
                                : isSelected
                                ? 'Selected to Add'
                                : item?.weight
                                ? `${item.weight} kg`
                                : 'Catalogue'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredCatalogue.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-boxdark border border-slate-200 dark:border-strokedark flex items-center justify-center text-3xl text-slate-400 mb-3 shadow-xs">
                        <MdSearch />
                      </div>
                      <h4 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                        No catalogue items found
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                        No furniture in your catalogue matches your search filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCatalogueSearch('');
                          setCatalogueFilterTab('all');
                        }}
                        className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-white border border-slate-200 dark:border-strokedark transition-colors"
                      >
                        Reset Catalogue Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Action Bar */}
                <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-strokedark bg-white dark:bg-boxdark flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                    {selectedFurniture.length > 0 ? (
                      <span className="text-primary font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                        {selectedFurniture.length} item(s) selected to assign
                        {selectedAddVolume > 0 &&
                          ` (+${selectedAddVolume.toFixed(2)} m³ added volume)`}
                      </span>
                    ) : (
                      <span>Select furniture pieces from the catalogue above to assign them</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCatalogueOpen(false);
                        setSelectedFurniture([]);
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-strokedark transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={selectedFurniture.length === 0}
                      onClick={handleAssignFurniture}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white shadow-md shadow-primary/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <MdAdd className="text-base" />
                      <span>
                        Assign Selected ({selectedFurniture.length})
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
};
