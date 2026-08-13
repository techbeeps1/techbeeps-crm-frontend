import React, { useEffect, useState } from 'react';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import ChairIcon from '@mui/icons-material/Chair';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BuildIcon from '@mui/icons-material/Build';
import HandymanIcon from '@mui/icons-material/Handyman';
import CategoryIcon from '@mui/icons-material/Category';

const JobOfferRooms: React.FC<{ job: any; type: string }> = ({ type, job }) => {
  const [offerData, setOfferData] = useState<any>([]);
  const [valutionRoom, setValutionRoom] = useState<any>([]);
  const [showAllBoxes, setShowAllBoxes] = useState(false);
  const [showAllAssembled, setShowAllAssembled] = useState(false);
  const [showAllDismantled, setShowAllDismantled] = useState(false);
  const [showAllFurniture, setShowAllFurniture] = useState(false);

  useEffect(() => {
    if (type === 'offer') {
      setOfferData(job?.offer || []);
    }
    if (type === 'invoice') {
      setOfferData(job?.invoice || []);
    }
  }, [job, type]);

  const getAllValuationRooms = async (): Promise<any> => {
    try {
      const response = await axios.get(`${apiPath}/api/valuation/rooms?jobId=${job._id}`);
      if (response.status === 200) {
        setValutionRoom(response.data);
      } else {
        setValutionRoom([]);
      }
    } catch (error: any) {
      setValutionRoom([]);
    }
  };

  useEffect(() => {
    if (job?._id) {
      getAllValuationRooms();
    }
  }, [job]);

  const getNecessaryList = (item: any, j: any) => {
    const roomCandidates = [
      item?.necessary,
      item?.necessaryItems,
      item?.necessary_items,
      item?.materials,
      item?.supplies,
      item?.extraItems,
      item?.additionalItems,
      item?.neededItems,
      item?.packingMaterials,
    ];
    for (const cand of roomCandidates) {
      if (Array.isArray(cand) && cand.length > 0) return cand;
    }
    const jobCandidates = [
      j?.necessary,
      j?.necessaryItems,
      j?.materials,
      j?.supplies,
      j?.package?.necessary,
      j?.relocation?.necessary,
    ];
    for (const cand of jobCandidates) {
      if (Array.isArray(cand) && cand.length > 0) return cand;
    }
    return null;
  };

  const formatNecessaryStr = (nItem: any) => {
    if (nItem === null || nItem === undefined) return '';

    if (typeof nItem === 'string') return nItem.trim();
    if (typeof nItem === 'number' || typeof nItem === 'boolean') return String(nItem);

    if (typeof nItem === 'object') {
      const qty = nItem.quantity ?? nItem.qty ?? nItem.count ?? nItem.amount ?? 1;

      const directName =
        nItem.furnitureTypeName ||
        nItem.name ||
        nItem.itemName ||
        nItem.title ||
        nItem.label ||
        nItem.description ||
        nItem.text ||
        nItem.type ||
        nItem.materialName ||
        nItem.boxName ||
        nItem.packingName ||
        nItem.item_name ||
        nItem.serviceName ||
        nItem.inventoryTypeName ||
        nItem.item?.name ||
        nItem.item?.furnitureTypeName ||
        nItem.inventoryItem?.name ||
        nItem.furnitureType?.furnitureTypeName;

      if (directName && typeof directName === 'string' && directName.trim().length > 0) {
        const nameStr = directName.trim();
        if (nameStr.startsWith(String(qty) + ' ')) {
          return nameStr;
        }
        return `${qty} ${nameStr}`;
      }

      for (const val of Object.values(nItem)) {
        if (val && typeof val === 'object') {
          const nestedName = (val as any).name || (val as any).furnitureTypeName || (val as any).title;
          if (nestedName && typeof nestedName === 'string' && nestedName.trim().length > 0) {
            const nameStr = nestedName.trim();
            if (nameStr.startsWith(String(qty) + ' ')) {
              return nameStr;
            }
            return `${qty} ${nameStr}`;
          }
        }
      }

      const validStrValues = Object.entries(nItem)
        .filter(
          ([key, val]) =>
            typeof val === 'string' &&
            val.trim().length > 0 &&
            !['_id', 'id', '__v', 'service', 'checked', 'createdAt', 'updatedAt'].includes(key) &&
            !val.startsWith('http')
        )
        .map(([_, val]) => String(val).trim());

      if (validStrValues.length > 0) {
        const mainStr = validStrValues[0];
        if (mainStr.startsWith(String(qty) + ' ')) {
          return mainStr;
        }
        return `${qty} ${mainStr}`;
      }

      return JSON.stringify(nItem);
    }

    return String(nItem);
  };

  if (!valutionRoom || valutionRoom.length === 0) return null;

  return (
    <div className="my-6">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-strokedark">
        <MeetingRoomIcon className="text-primary" />
        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
          Valuation Rooms
        </h3>
      </div>

      <div className="space-y-4">
        {valutionRoom && valutionRoom.length > 0 ? (
          valutionRoom.map((item: any, index: number) => {
            const necessaryList = getNecessaryList(item, job);
            return (
              <div
                key={index}
                className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    {item.name || item.roomTypeName}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Furniture */}
                  {item.furnitureType && item.furnitureType.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
                        <ChairIcon fontSize="small" className="text-primary" />
                        <span>Furniture</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {item.furnitureType
                          .slice(0, showAllFurniture ? item.furnitureType.length : 4)
                          .map((furniture: any, fIdx: number) => (
                            <li key={`${index}-f-${fIdx}`} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                              <span>
                                {furniture.quantity} {furniture.furnitureTypeName}
                              </span>
                            </li>
                          ))}
                      </ul>
                      {item.furnitureType.length > 4 && (
                        <button
                          onClick={() => setShowAllFurniture(!showAllFurniture)}
                          className="text-xs font-bold text-primary mt-2 hover:underline cursor-pointer"
                        >
                          {showAllFurniture ? 'Show Less ▲' : 'Show More ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Boxes */}
                  {item.inventoryItems && item.inventoryItems.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
                        <Inventory2Icon fontSize="small" className="text-amber-500" />
                        <span>Boxes</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {item.inventoryItems
                          .slice(0, showAllBoxes ? item.inventoryItems.length : 4)
                          .map((furniture: any, fIdx: number) => (
                            <li key={`${index}-b-${fIdx}`} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              <span>
                                {furniture.quantity} {furniture.name}
                              </span>
                            </li>
                          ))}
                      </ul>
                      {item.inventoryItems.length > 4 && (
                        <button
                          onClick={() => setShowAllBoxes(!showAllBoxes)}
                          className="text-xs font-bold text-primary mt-2 hover:underline cursor-pointer"
                        >
                          {showAllBoxes ? 'Show Less ▲' : 'Show More ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Assembling */}
                  {item.assembledItems && item.assembledItems.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
                        <BuildIcon fontSize="small" className="text-emerald-500" />
                        <span>Assembling</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {item.assembledItems
                          .slice(0, showAllAssembled ? item.assembledItems.length : 4)
                          .map((furniture: any, fIdx: number) => (
                            <li key={`${index}-a-${fIdx}`} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              <span>{furniture.furnitureTypeName}</span>
                            </li>
                          ))}
                      </ul>
                      {item.assembledItems.length > 4 && (
                        <button
                          onClick={() => setShowAllAssembled(!showAllAssembled)}
                          className="text-xs font-bold text-primary mt-2 hover:underline cursor-pointer"
                        >
                          {showAllAssembled ? 'Show Less ▲' : 'Show More ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Disassembling */}
                  {item.dismantledItems && item.dismantledItems.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
                        <HandymanIcon fontSize="small" className="text-indigo-500" />
                        <span>Disassembling</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {item.dismantledItems
                          .slice(0, showAllDismantled ? item.dismantledItems.length : 4)
                          .map((furniture: any, fIdx: number) => (
                            <li key={`${index}-d-${fIdx}`} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                              <span>{furniture.furnitureTypeName}</span>
                            </li>
                          ))}
                      </ul>
                      {item.dismantledItems.length > 4 && (
                        <button
                          onClick={() => setShowAllDismantled(!showAllDismantled)}
                          className="text-xs font-bold text-primary mt-2 hover:underline cursor-pointer"
                        >
                          {showAllDismantled ? 'Show Less ▲' : 'Show More ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Necessary */}
                  {necessaryList && necessaryList.length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-700 dark:text-slate-200 mb-2 uppercase tracking-wider">
                        <CategoryIcon fontSize="small" className="text-purple-500" />
                        <span>Necessary</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        {necessaryList.map((nItem: any, nIdx: number) => {
                          const formatted = formatNecessaryStr(nItem);
                          if (!formatted) return null;
                          return (
                            <li key={`${index}-n-${nIdx}`} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                              <span>{formatted}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-xs font-medium text-slate-400">No rooms available</div>
        )}
      </div>
    </div>
  );
};

export default JobOfferRooms;
