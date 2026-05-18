import React, { useState, useEffect } from "react";
import {
  Button,
} from '@mui/material';
import FurntureSelection from "../InnerForm/FurntureSelection";
import PackingBox from "../InnerForm/PackingBox";
import DragCloseDrawer from "../DragCloseDrawer";
import { useFieldArray, useFormContext } from "react-hook-form";
import AssembleFurniture from "../InnerForm/AssembleFurniture";
import axios from "axios";
import { apiPath } from "../../../../apiPath";

export const DragDrawer: React.FC<any> = ({ selectItem, setSelectItem, services }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [data, setData] = useState<any>();
  const [roomName, setRoomName] = useState<string>('')
  const [furnitureItems, setFurnitureItems] = useState<[]>([])
  const [packingItems, setPackingItems] = useState<[]>([])
  const { setValue, watch } = useFormContext() as any;

  const [steps, setSteps] = useState<any>([])

  const { append } = useFieldArray({
    name: "packingBoxes",
  });

  useEffect(() => {
    const itemsWithQuantity = furnitureItems
      .filter((item: any) => item.quantity && item.quantity > 0)
      .flatMap((item: any) => Array.from({ length: item.quantity }, () => item));
    setDismantledItems(itemsWithQuantity);
    setStorageItems(itemsWithQuantity)
    setAssembledItems(itemsWithQuantity);
  }, [furnitureItems])

  const [dismantledItems, setDismantledItems] = useState<any>([]);
  const [assembledItems, setAssembledItems] = useState<any>([]);
  const [storageItems, setStorageItems] = useState<any>([]);

  const fetchRoomInner = async () => {
    try {
      setData(selectItem?.furnitureType.map((item: any) => ({
        ...item,
        quantity: item.quantity || 0,
        done: item.done || false,
      })));
    } catch (err: any) {
      console.error('Failed to fetch room inner:', err);
    }
  };

  useEffect(() => {
    setRoomName(selectItem?.name || selectItem?.roomTypeName);
    if (selectItem) {
      fetchRoomInner();
    }
  }, [selectItem])

  useEffect(() => {
    setSteps(() => {
      const newSteps = [{ label: `Do You want to give the ${selectItem?.roomTypeName} a different Name ?` },
      { label: `What furniture is in the ${selectItem?.roomTypeName} ?` },
      { label: 'What Material is Needed ?' }];
      if (services.find((service: any) => service.serviceTypeName === "disassembling") &&
        !newSteps.some(step => step.label === 'Does anything need to be Disassambled ?')) {
        newSteps.push({ label: 'Does anything need to be Disassambled ?' });
      }
      if (services.find((service: any) => service.serviceTypeName === "assembling") &&
        !newSteps.some(step => step.label === 'Does anything need to be Installed ?')) {
        newSteps.push({ label: 'Does anything need to be Installed ?' });
      }
      if (services.find((service: any) => service.serviceTypeName === "storage") &&
        !newSteps.some(step => step.label === 'Does anything need to go in storage ?')) {
        newSteps.push({ label: 'Does anything need to go in storage ?' });
      }
      return newSteps;
    });
  }, [services, selectItem]);


  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  const handleClose = () => {
    setActiveStep(0)
    setSelectItem(null);
  };

  const packingBoxes = watch("packingBoxes");

  const onSubmit = () => {
    setSelectItem({ ...selectItem, storageItems: storageItems.filter((item: any) => item.checked), assembledItems: assembledItems.filter((item: any) => item.checked), dismantledItems: dismantledItems.filter((item: any) => item.checked), name: roomName, done: selectItem.done, furnitureType: furnitureItems, inventoryItems: packingBoxes?.filter((box: any) => box.quantity > 0), finished: true })
    setTimeout(() => {
      handleClose()
      setValue('packingBoxes', null)
    }, 1);
  };

  const handleAllData = async () => {
    if (!selectItem) return; 
    try {
      const response = await axios.get(`${apiPath}/api/box?type=Box`);
      const packingBoxes = watch("packingBoxes");
      if (!packingBoxes || packingBoxes.length === 0) {
        append(response.data.map((box: any) => ({
          _id: box._id,
          name: box.name,
          quantity: 0, // Default quantity
          storageQuantity: 0,
          price: box.sellingPrice,
          cubicMeter: box.cubicMeter,
        })));
      }
      if (selectItem?.inventoryItems?.length > 0) {
        selectItem.inventoryItems.forEach((item: any) => {
          const boxIndex = packingBoxes.findIndex((box: any) => box._id === item._id);
          if (boxIndex !== -1) {
            setValue(`packingBoxes.${boxIndex}.quantity`, Number(item.quantity) || 0);
          }
        });
      }
      packingBoxes.forEach((box: any, index: number) => {
        const isBoxInSelectItem = selectItem?.inventoryItems?.some((item: any) => item._id === box._id);
        if (!isBoxInSelectItem) {
          setValue(`packingBoxes.${index}.quantity`, 0); // Set quantity to 0 if not in selectItem
        }
      });
    } catch (err: any) {
      console.error('Failed to fetch packing boxes:');
    }
  };

  useEffect(() => {
    if (selectItem) {
      handleAllData();
    }
  }, [selectItem]);

  return (
    <div className="grid place-content-center">
      <DragCloseDrawer open={selectItem} setOpen={setSelectItem}>
        <div className="flex justify-center align-center flex-col h-full space-y-2 text-neutral-400" style={{ width: '720px', maxWidth: '90vw' }}>
          <h3 className="text-white text-center font-bold text-xl mb-1">
            {steps[activeStep]?.label}
          </h3>
          {activeStep === 0 && <>
            <div className="mb-4 h-full">
              <label htmlFor="name" className="block mb-3 text-white text-lg font-medium">
                Name
              </label>
              <input
                type="text"
                defaultValue={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                id="name"
                className="font-medium text-lg w-full px-4 py-2 border-b border-gray bg-black shadow outline-none"
              />
              {!roomName && (
                <p className="text-white text-sm mt-1">Name is Required</p>
              )}
            </div>
          </>}
          {activeStep === 1 && <FurntureSelection roomId={selectItem?._id} setFurnitures={setFurnitureItems} data={data} setData={setData} handler={fetchRoomInner} />}
          {activeStep === 2 && <PackingBox selectItem={selectItem} setBoxes={setPackingItems} />}
          {services.find((service: any) => service.serviceTypeName === "disassembling") &&
            activeStep === 3 && <AssembleFurniture type='disassemble' items={dismantledItems} setItems={setDismantledItems} />}
          {services.find((service: any) => service.serviceTypeName === "assembling") &&
            activeStep === (services.find((service: any) => service.serviceTypeName === "disassembling") ? 4 : 3) && <AssembleFurniture type='assemble' items={assembledItems} setItems={setAssembledItems} />}
          {services.find((service: any) => service.serviceTypeName === "storage") && (
            activeStep === (services.find((service: any) => service.serviceTypeName === "disassembling") && services.find((service: any) => service.serviceTypeName === "assembling") ? 5 :
              (services.find((service: any) => service.serviceTypeName === "disassembling" || "assembling") ? 4 : 3)) &&
            <AssembleFurniture type="storage" items={storageItems} setItems={setStorageItems} />
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
            <div className="flex justify-center gap-2" style={{ alignItems: "center" }}>
              {steps.map((_: any, index:number) => (
                <div
                  key={index}
                  onClick={() => index <= activeStep && setActiveStep(index)}
                  className={`w-1 h-3 rounded-full cursor-pointer transition-colors ${index === activeStep ? 'bg-danger' : 'bg-primary'
                    }`}
                ></div>
              ))}
            </div>
            <Button
              variant="contained"
              color="primary"
              disabled={!roomName}
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



