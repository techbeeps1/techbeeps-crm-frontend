import React, {useEffect, useState } from "react";

import {
    Button,
} from '@mui/material';
import axios from "axios";
import { apiPath } from "../../../apiPath";
import { toast } from 'react-toastify';
import Loader from "../../common/Loader";
import DragCloseDrawer from "../Valuation/DragCloseDrawer";

export const FurnitureDrawer: React.FC<any> = ({ selectItem, setSelectItem, furniture }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
    const [isDeleteFurniture, setDeleteFurniture] = useState<string[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [data, setData] = useState<any>();

    const steps = [
        { label: `What furniture is in the ${selectItem?.roomTypeName} ?` },
    ];

    const notify = (message: string) => toast.success(message);
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const toggleFurnitureSelection = (id: string) => {
        setSelectedFurniture((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };
    const toggleFurnitureDelete = (id: string) => {
        setDeleteFurniture((prevSelected) =>
            prevSelected.includes(id)
                ? prevSelected.filter((item) => item !== id)
                : [...prevSelected, id]
        );
    };

    const handleSubmit = () => {
        setLoading(true)
        handleUpdate()
    };

    useEffect(() => {
        if (selectItem) {
            fetchRoomInner()
        }
    }, [selectItem])


    const fetchRoomInner = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiPath}/api/room/${selectItem?._id}`);
            setData(response.data);
            console.log(response.data);
        } catch (err: any) {
            notifyError(`Failed to fetch: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            let response = await axios.post(`${apiPath}/api/room/${selectItem?._id}`, { furnitureTypeIds: selectedFurniture });
            if (response.status === 200) {
                notify(`Furniture updated successfully for ${selectItem?.roomTypeName}`);
                setModalOpen(false)
                fetchRoomInner()
                setSelectedFurniture([])
            }
        } catch (error: any) {
            notifyError(`Error: ${error.message}`);
        } finally {
            setLoading(false)
        }
    }
    const handleRemove = async () => {
        try {
            let response = await axios.post(`${apiPath}/api/room/remove/${selectItem?._id}`, { furnitureTypeIds: isDeleteFurniture });
            if (response.status === 200) {
                notify(`Furniture Delete successfully for ${selectItem?.roomTypeName}`);
                fetchRoomInner();
                setDeleteFurniture([]);
            }
        } catch (error: any) {
            notifyError(`Error: ${error.message}`);
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {loading && <Loader />}
            <div className="grid place-content-center">
                <DragCloseDrawer open={selectItem} setOpen={setSelectItem}>
                    <div className="flex justify-center align-center flex-col h-full space-y-4 text-neutral-400" style={{ minWidth: '650px' }}>
                        <h3 className="text-white text-center font-bold text-xl">
                            {steps[activeStep].label}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full px-4 py-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            <div
                                className="bg-gray flex flex-col items-center justify-center h-45 w-full rounded shadow-md cursor-pointer"
                                onClick={() => setModalOpen(true)}
                            >
                                <div style={{
                                    width: '65px',
                                    height: '65px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    padding: '10px',
                                    marginBottom: '10px',
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z" /></svg>
                                </div>
                                <p className="text-center text-black text-lg font-medium">Add Furniture</p>
                            </div>
                            {data && data?.furnitureType.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    onClick={() => toggleFurnitureDelete(item._id)}
                                    className={`flex flex-col items-center justify-center h-45 w-full rounded shadow-md cursor-pointer ${isDeleteFurniture.includes(item._id) ? 'bg-danger text-white' : 'bg-gray text-black'} `}
                                >
                                    <div
                                        style={{
                                            width: '65px',
                                            height: '65px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                            padding: '10px',
                                            marginBottom: '10px',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: item?.icon }}
                                    />
                                    <p className="text-center text-lg font-medium">{item?.furnitureTypeName}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-sky-900 flex justify-between">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setSelectItem(null)}
                            >
                                close
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!isDeleteFurniture.length > 0}
                                onClick={() => handleRemove()}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DragCloseDrawer>
                <DragCloseDrawer open={isModalOpen} setOpen={setModalOpen}>
                    <div className="flex justify-center align-center flex-col h-full space-y-4 text-neutral-400" style={{ minWidth: '650px' }}>
                        <h3 className="text-white text-center font-bold text-xl">
                            Add Furniture in the {selectItem?.roomTypeName}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full px-4 py-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

                            {furniture && furniture.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className={`flex flex-col items-center justify-center h-45 w-full rounded shadow-md cursor-pointer ${selectedFurniture.includes(item._id) ? 'bg-primary text-white' : 'bg-gray text-black'}`}
                                    onClick={() => toggleFurnitureSelection(item._id)}
                                >
                                    <div
                                        style={{
                                            width: '65px',
                                            height: '65px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                            padding: '10px',
                                            marginBottom: '10px',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: item?.icon }}
                                    />
                                    <p className="text-center text-lg font-medium">{item?.furnitureTypeName}</p>
                                </div>
                            ))}
                        </div>
                        <div className="bg-sky-900 flex justify-between">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setModalOpen(false)}
                            >
                                close
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!selectedFurniture.length > 0}
                                onClick={handleSubmit}
                            >
                                {activeStep === steps.length - 1 ? 'Submit' : 'Submit'}
                            </Button>
                        </div>
                    </div>
                </DragCloseDrawer>
            </div>
        </>
    );
};
