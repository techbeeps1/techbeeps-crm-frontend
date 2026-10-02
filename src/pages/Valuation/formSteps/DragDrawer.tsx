import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import FurntureSelection from '../InnerForm/FurntureSelection';
import PackingBox from '../InnerForm/PackingBox';
import DragCloseDrawer from '../DragCloseDrawer';
import { useFieldArray, useFormContext } from 'react-hook-form';
import AssembleFurniture from '../InnerForm/AssembleFurniture';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';

export const DragDrawer: React.FC<any> = ({
  selectItem,
  setSelectItem,
  services,
  selectedRoom
}) => {

  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<any>();
  const [roomName, setRoomName] = useState<string>('');
  const [furnitureItems, setFurnitureItems] = useState<[]>([]);

  const { setValue, watch } = useFormContext() as any;

  const [steps, setSteps] = useState<any>([]);

  const { append } = useFieldArray({
    name: 'packingBoxes',
  });


  const [dismantledItems, setDismantledItems] = useState<any>([]);
  const [assembledItems, setAssembledItems] = useState<any>([]);
  const [storageItems, setStorageItems] = useState<any>([]);

  useEffect(() => {
    if (!selectItem) return;

    const itemsWithQuantity = furnitureItems.filter(
      (item: any) => item.quantity > 0,
    );

    // 1. Storage items for THIS room
    const savedStorage = selectItem.storageItems || [];
    const allStorageList = [
      ...itemsWithQuantity,
      ...savedStorage.filter(
        (saved: any) =>
          !itemsWithQuantity.some(
            (it: any) =>
              it._id === saved._id ||
              it.furnitureTypeName === saved.furnitureTypeName,
          ),
      ),
    ];

    setStorageItems((prevStorage: any[]) => {
      return allStorageList.map((item: any) => {
        const prevItem = (prevStorage || []).find(
          (p: any) =>
            p._id === item._id || p.furnitureTypeName === item.furnitureTypeName,
        );
        const isChecked =
          prevItem !== undefined
            ? prevItem.checked
            : savedStorage.some(
                (saved: any) =>
                  saved._id === item._id ||
                  saved.furnitureTypeName === item.furnitureTypeName,
              );
        return {
          ...item,
          checked: !!isChecked,
        };
      });
    });

    // 2. Disassembling eligible items for THIS room (ONLY isDisassambled === true)
    const savedDismantled = selectItem.dismantledItems || [];
    const eligibleDisassembly = itemsWithQuantity.filter(
      (item: any) => item.isDisassambled === true,
    );
    const allDismantleList = [
      ...eligibleDisassembly,
      ...savedDismantled.filter(
        (saved: any) =>
          !eligibleDisassembly.some(
            (it: any) =>
              it._id === saved._id ||
              it.furnitureTypeName === saved.furnitureTypeName,
          ),
      ),
    ];

    setDismantledItems((prevDismantled: any[]) => {
      return allDismantleList.map((item: any) => {
        const prevItem = (prevDismantled || []).find(
          (p: any) =>
            p._id === item._id || p.furnitureTypeName === item.furnitureTypeName,
        );
        const isChecked =
          prevItem !== undefined
            ? prevItem.checked
            : savedDismantled.some(
                (saved: any) =>
                  saved._id === item._id ||
                  saved.furnitureTypeName === item.furnitureTypeName,
              );
        return {
          ...item,
          checked: !!isChecked,
          isDisassambled: true,
        };
      });
    });

    // 3. Assembling eligible items for THIS room (ONLY isDisassambled === true)
    const savedAssembled = selectItem.assembledItems || [];
    const eligibleAssembly = itemsWithQuantity.filter(
      (item: any) => item.isDisassambled === true,
    );
    const allAssembleList = [
      ...eligibleAssembly,
      ...savedAssembled.filter(
        (saved: any) =>
          !eligibleAssembly.some(
            (it: any) =>
              it._id === saved._id ||
              it.furnitureTypeName === saved.furnitureTypeName,
          ),
      ),
    ];

    setAssembledItems((prevAssembled: any[]) => {
      return allAssembleList.map((item: any) => {
        const prevItem = (prevAssembled || []).find(
          (p: any) =>
            p._id === item._id || p.furnitureTypeName === item.furnitureTypeName,
        );
        const isChecked =
          prevItem !== undefined
            ? prevItem.checked
            : savedAssembled.some(
                (saved: any) =>
                  saved._id === item._id ||
                  saved.furnitureTypeName === item.furnitureTypeName,
              );
        return {
          ...item,
          checked: !!isChecked,
          isDisassambled: true,
        };
      });
    });
  }, [furnitureItems, selectItem]);

  useEffect(() => {
    if (data && data.length > 0) {
      const filteredFurnitureItems = data.map(
        ({ _id, quantity, cubicMeter, done, furnitureTypeName, isDisassambled, icon }: any) => ({
          _id,
          quantity,
          done,
          cubicMeter,
          furnitureTypeName,
          isDisassambled,
          icon,
        }),
      );
      setFurnitureItems(filteredFurnitureItems);
    } else {
      setFurnitureItems([]);
    }
  }, [data]);

  const fetchRoomInner = async () => {
    try {
      let masterFurniture: any[] = [];
      try {
        const res = await axios.get(`${apiPath}/api/furniture`);
        masterFurniture = res.data || [];
      } catch (e) {
        console.error('Error fetching master furniture:', e);
      }

      setData(
        (selectItem?.furnitureType || []).map((item: any) => {
          let isDis = item.isDisassambled;
          if ((isDis === undefined || isDis === null) && masterFurniture.length > 0) {
            const match = masterFurniture.find(
              (m: any) =>
                m._id === item._id ||
                (m.furnitureTypeName &&
                  item.furnitureTypeName &&
                  m.furnitureTypeName.trim().toLowerCase() ===
                    item.furnitureTypeName.trim().toLowerCase()),
            );
            isDis = match ? match.isDisassambled : false;
          }
          return {
            ...item,
            quantity: item.quantity || 0,
            done: item.done || false,
            isDisassambled: !!isDis,
          };
        }),
      );
    } catch (err: any) {
      console.error('Failed to fetch room inner:', err);
    }
  };

  useEffect(() => {
    setRoomName(selectItem?.name || selectItem?.roomTypeName || '');
    if (selectItem) {
      fetchRoomInner();
    }
  }, [selectItem]);

  useEffect(() => {
    setSteps(() => {
      const newSteps = [
        {
          label: `Do you want to give the ${selectItem?.roomTypeName} a custom name?`,
          id: 'name',
        },
        { label: `What furniture is in the ${roomName}?`, id: 'furniture' },
        { label: 'What materials are needed?', id: 'material' },
      ];
      if (
        services.find(
          (service: any) => service.serviceTypeName === 'disassembling',
        ) &&
        dismantledItems &&
        dismantledItems.length > 0
      ) {
        newSteps.push({
          label: 'Does anything need to be disassembled?',
          id: 'disassembling',
        });
      }
      if (
        services.find(
          (service: any) => service.serviceTypeName === 'assembling',
        ) &&
        assembledItems &&
        assembledItems.length > 0
      ) {
        newSteps.push({
          label: 'Does anything need to be assembled?',
          id: 'assembling',
        });
      }
      if (
        services.find(
          (service: any) => service.serviceTypeName === 'storage',
        ) &&
        storageItems &&
        storageItems.length > 0
      ) {
        newSteps.push({
          label: 'Does anything need to go in storage ?',
          id: 'storage',
        });
      }
      return newSteps;
    });
  }, [
    services,
    selectItem,
    roomName,
    dismantledItems?.length,
    assembledItems?.length,
    storageItems?.length,
  ]);

  useEffect(() => {
    if (steps.length > 0 && activeStep >= steps.length) {
      setActiveStep(Math.max(0, steps.length - 1));
    }
  }, [steps.length, activeStep]);

  const handleBack = () => setActiveStep((prev) => Math.max(0, prev - 1));

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  const handleClose = () => {
    setActiveStep(0);
    setSelectItem(null);
  };

  const packingBoxes = watch('packingBoxes');

  const onSubmit = () => {
    setSelectItem({
      ...selectItem,
      storageItems: storageItems.filter((item: any) => item.checked),
      assembledItems: assembledItems.filter((item: any) => item.checked),
      dismantledItems: dismantledItems.filter((item: any) => item.checked),
      name: roomName,
      done: selectItem.done,
      furnitureType: furnitureItems,
      inventoryItems: packingBoxes?.filter((box: any) => box.quantity > 0),
      finished: true,
    });
    setTimeout(() => {
      handleClose();
      setValue('packingBoxes', null);
    }, 1);
  };
  const handleAllData = async () => {
    if (!selectItem) return;

    try {
      const response = await axios.get(`${apiPath}/api/box?type=Box`);
      const rawBoxes = Array.isArray(response.data) ? response.data : [];

      const initialBoxes = rawBoxes.map((box: any) => {
        const existing = selectItem.inventoryItems?.find(
          (item: any) => item._id === box._id
        );
        let cm = Number(box.cubicMeter) || 0;
        // AutoLock moving boxes catalogue volume fix (UM-017): standard moving box is ~0.055 m³, not 1 m³
        if (box.name?.toLowerCase().includes('autolock') && (cm >= 1 || cm === 0)) {
          cm = 0.055;
        }
        return {
          _id: box._id,
          name: box.name,
          quantity: existing ? (Number(existing.quantity) || 0) : 0,
          storageQuantity: existing ? (Number(existing.storageQuantity) || 0) : 0,
          price: box.sellingPrice,
          cubicMeter: cm,
        };
      });

      setValue('packingBoxes', initialBoxes);
    } catch (err) {
      console.error('Error fetching boxes:', err);
    }
  };

  useEffect(() => {
    if (selectItem) {
      handleAllData();
    }
  }, [selectItem?._id]);

  return (
    <div className="grid place-content-center">
      <DragCloseDrawer open={selectItem} setOpen={setSelectItem}>
        <div
          className="flex justify-center align-center flex-col h-full space-y-2 text-neutral-400"
          style={{ width: '720px', maxWidth: '90vw' }}
        >
          <h3 className="text-white text-center font-bold text-xl mb-1 flex flex-col">
            {steps[activeStep]?.label}
          </h3>
          {steps[activeStep]?.id === 'furniture' && (
            <span className="text-sm text-gray-100 block mt-1 text-right">
              Total {roomName}:{' '}
              {furnitureItems
                .reduce(
                  (total: number, item: any) =>
                    total + (item.quantity || 0) * (item.cubicMeter || 0),
                  0,
                )
                .toFixed(2)}{' '}
              m³
            </span>
          )}
          {steps[activeStep]?.id === 'name' && (
            <>
              <div className="mb-4 h-full">
                <label
                  htmlFor="name"
                  className="block mb-3 text-white text-lg font-medium"
                >
                  Name
                </label>
                <input
                  type="text"
                  defaultValue={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  id="name"
                  className="font-medium text-lg w-full px-4 py-2 border-b border-gray bg-black shadow outline-none"
                />
                {(!roomName || !roomName.trim()) && (
                  <p className="text-white text-sm mt-1">Name is Required</p>
                )}
              </div>
            </>
          )}
          {steps[activeStep]?.id === 'furniture' && (
            <FurntureSelection
              roomId={selectItem?._id}
            
              data={data}
              setData={setData}
              handler={fetchRoomInner}
            />
          )}
          {steps[activeStep]?.id === 'material' && (
            <>
              <div className='text-right pe-5'>
                Total Boxes:{' '}
                {packingBoxes?.reduce(
                  (total: number, box: any) =>
                    total + (box.quantity || 0) * (box.cubicMeter || 0),
                  0,
                )} {'m³'}
              </div>
              <PackingBox  />
            </>
          )}
          {steps[activeStep]?.id === 'disassembling' && (
            <AssembleFurniture
              type="disassemble"
              items={dismantledItems}
              setItems={setDismantledItems}
            />
          )}
          {steps[activeStep]?.id === 'assembling' && (
            <AssembleFurniture
              type="assemble"
              items={assembledItems}
              setItems={setAssembledItems}
            />
          )}
          {steps[activeStep]?.id === 'storage' && (
            <AssembleFurniture
              type="storage"
              items={storageItems}
              setItems={setStorageItems}
            />
          )}

          <div className="bg-sky-900 flex justify-between">
            <Button
              variant="contained"
              color="primary"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <div
              className="flex justify-center gap-2"
              style={{ alignItems: 'center' }}
            >
              {steps.map((_: any, index: number) => (
                <div
                  key={index}
                  onClick={() => index <= activeStep && setActiveStep(index)}
                  className={`w-1 h-3 rounded-full cursor-pointer transition-colors ${
                    index === activeStep ? 'bg-danger' : 'bg-primary'
                  }`}
                ></div>
              ))}
            </div>
            <Button
              variant="contained"
              color="primary"
              disabled={!roomName || !roomName.trim()}
              type="button"
              onClick={activeStep === steps.length - 1 ? onSubmit : handleNext}
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </div>
      </DragCloseDrawer>
    </div>
  );
};
