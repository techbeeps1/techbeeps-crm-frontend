import React, { useState, useEffect } from 'react';
import DragCloseDrawer from '../DragCloseDrawer';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import {
    Button
} from '@mui/material';
import CustomFurniture from './CustomFurniture';
import Loader from '../../../common/Loader';

const FurnitureSelection: React.FC<any> = ({ setFurnitures, data, setData }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isCustomOpen, setCustomOpen] = useState(false);
    const [furniture, setFurniture] = useState<any[]>([]);
    const [selectedFurniture, setSelectedFurniture] = useState<any>([]);
    const [loading,setLoading] = useState<boolean>(false);

    const fetchFurniture = async () => {
        setLoading(true)
        try {
            const response = await axios.get(`${apiPath}/api/furniture`);
            setFurniture(response.data);
        } catch (err: any) {
            console.log(`Failed to fetch: ${err.message}`);
        }finally{
            setLoading(false)
        }
    };
    const toggleFurnitureSelection = (item: any) => {
        setSelectedFurniture((prevSelected: any) => {
            if (prevSelected.some((furniture: any) => furniture._id === item._id)) {
                return prevSelected.filter((furniture: any) => furniture._id !== item._id);
            } else {
                return [...prevSelected, item];
            }
        });
    };
    const handleSubmit = () => {
        handleUpdate(selectedFurniture)
    };

    const handleUpdate = async (item: any[]) => {
        try {
            setData((prevData: any) => {
                const newItems = item.filter(
                    (newItem) => !prevData.some((existingItem: any) => existingItem._id === newItem._id)
                );
                return [...prevData, ...newItems];
            });
            setSelectedFurniture([]);
            setModalOpen(false)
        } catch (error: any) {
            console.error(`Error: ${error.message}`);
        }
    };

    const addCustomFurniture = (customFurniture: any) => {
        setData((prevData: any[]) => [
            ...prevData,
            { ...customFurniture, _id: `custom-${Date.now()}`, custom: true, quantity: 1 },
        ]);
    };

    useEffect(() => {
        fetchFurniture()
    }, []);

    const toggleThumb = (id: string) => {
        setData((prevItems: any) =>
            prevItems.map((item: any) =>
                item._id === id && item.quantity > 0
                    ? { ...item, done: !item.done }
                    : item
            )
        );
    };

    const increaseQuantity = (id: string) => {
        setData((prevItems: any) =>
            prevItems.map((item: any) =>
                item._id === id ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decreaseQuantity = (id: string) => {
        setData((prevItems: any) =>
            prevItems.map((item: any) =>
                item._id === id && item.quantity > 0
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
    };
    useEffect(() => {
        const filteredFurnitureItems = data.map(({ _id, quantity, cubicMeter,done, furnitureTypeName, isDisassambled,icon }: any) => ({ _id, quantity,done, cubicMeter, furnitureTypeName,isDisassambled, icon }));
        setFurnitures(filteredFurnitureItems)
    }, [data])

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full px-4 py-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                {loading && <Loader/>}
                <div
                    className="bg-sky-500 flex flex-col items-center justify-center h-45 w-full rounded-lg shadow-md cursor-pointer"
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

                <div
                    className="bg-sky-500 flex flex-col items-center justify-center h-45 w-full rounded-lg shadow-md cursor-pointer"
                    onClick={() => setCustomOpen(true)}
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
                    <p className="text-center text-black text-lg font-medium">Custom Furniture</p>
                </div>
                {data.map((item: any) => (
                    <div
                        key={item._id}
                        className={`relative overflow-hidden w-full h-45 flex flex-col justify-center items-center bg-gray rounded-lg shadow-lg 
                    ${item.done ? 'bg-primary text-white' : ''}
                    ${item?.custom ? 'bg-sky-200 text-white' : 'bg-gray'}`}
                        onClick={() => toggleThumb(item._id)}
                    >
                        {item.done && (
                            <div
                                className="flex flex-col justify-center items-center w-full h-full text-white bg-success"
                                style={{ zIndex: 9, top: 0, bottom: 0, left: 0, position: 'absolute' }}
                            >
                                <div
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: '5px',
                                        marginBottom: '1px',
                                        color: 'white'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: item?.icon }}
                                />
                                <div className="text-lg mt-1 font-bold">{item?.furnitureTypeName}</div>
                                <div className="text-3xl mt-1 text-white">✓</div>
                            </div>
                        )}
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '5px',
                                marginBottom: '1px',
                            }}
                            dangerouslySetInnerHTML={{ __html: item?.icon }}
                        />
                        <div className="text-lg font-bold text-black">{item?.furnitureTypeName}</div>
                        {!item?.custom && (
                            <div className="flex items-center mt-3 space-x-2 border">
                                <button
                                    type="button"
                                    className="text-xl w-8 bg-black text-white font-bold"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop click event from bubbling up
                                        decreaseQuantity(item._id);
                                    }}
                                >
                                    -
                                </button>
                                <div className="text-black text-lg font-bold">{item?.quantity || 0}</div>
                                <button
                                    type="button"
                                    className="text-xl bg-black text-white w-8 font-bold"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop click event from bubbling up
                                        increaseQuantity(item._id);
                                    }}
                                >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <DragCloseDrawer open={isModalOpen} setOpen={setModalOpen}>
                <div className="flex justify-center align-center flex-col h-full space-y-4 text-neutral-400" style={{ minWidth: '700px' }}>
                    <h3 className="text-white text-center font-bold text-xl">
                        Add Furniture
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full px-4 py-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>

                        {furniture && furniture.map((item: any, index: number) => (
                            <div
                                key={index}
                                className={`flex flex-col items-center justify-center h-45 w-full rounded shadow-md cursor-pointer ${selectedFurniture.some((furniture: any) => furniture._id === item._id) ? 'bg-primary text-white' : 'bg-gray text-black'}`}
                                onClick={() => toggleFurnitureSelection({...item,quantity: item.quantity || 0, done: item.done || false,})}
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
                            disabled={!(selectedFurniture.length > 0)}
                            onClick={handleSubmit}
                        >
                            Submit
                        </Button>
                    </div>
                </div>
            </DragCloseDrawer>
            <CustomFurniture setModelOpen={setCustomOpen} open={isCustomOpen} addCustomFurniture={addCustomFurniture} />
        </>
    );
};

export default FurnitureSelection;
