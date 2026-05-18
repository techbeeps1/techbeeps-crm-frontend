import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobOffermodule: React.FC<{ job: any, type: string }> = ({ type, job }) => {

    const [offerData, setOfferData] = useState<any>([]);
    const [valutionRoom, setValutionRoom] = useState<any>([]);
    const [showAllBoxes, setShowAllBoxes] = useState(false);
    const [showAllAssembled, setShowAllAssembled] = useState(false);
    const [showAllDismantled, setShowAllDismantled] = useState(false);
    const [showAllFurniture, setShowAllFurniture] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        if (type === "offer") {
            setOfferData(job?.offer)
        }
        if (type === "invoice") {
            setOfferData(job?.invoice)
        }
    }, [job])

    const formatDate = (date: any) => {
        if (date) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
            const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(new Date(date));
            return formattedDate.toUpperCase(); // Convert month to uppercase
        }
    };

    const getAllValuationRooms = async (): Promise<any> => {
        try {
            const response = await axios.get(`${apiPath}/api/valuation/rooms?jobId=${job._id}`);
            if (response.status === 200) {
                setValutionRoom(response.data);
            } else {
                setValutionRoom([])
            }
        } catch (error: any) {
            setValutionRoom([])
        }
    };

    useEffect(() => {
        getAllValuationRooms();
    }, [job])

    return (
        <Box sx={{ paddingX: 3, lineHeight: 1.5 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
                SUMMARY
            </Typography>
            <Box display="flex" justifyContent="space-between">
                <Typography>Price agreement</Typography>
                <Typography>{job.package?.priceAgree}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            {/* Quote Details */}
            {offerData.length > 0 ? offerData.map((offerData: any) =>
                <div className='mb-4' key={offerData._id}>
                    <div>
                        <h6 className="text-lg font-semibold mb-2">
                            # {offerData && offerData?.index}
                        </h6>
                        <p onClick={()=>{type === "offer" ? navigate(`/offer-detail/${offerData?._id}`) : navigate(`/invoice-detail/${offerData?._id}`)}} className="text-primary cursor-pointer mb-2">
                            Go to {type === "offer" ? 'Quote' : 'Invoice'}
                        </p>
                        <div className="flex justify-between mb-1">
                            <span className="">Subtotal</span>
                            <span className=" font-medium">$ {offerData?.subTotal}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="">BTW</span>
                            <span className=" font-medium">$ {offerData?.btw}</span>
                        </div>
                        <div className="flex justify-between font-bold mb-1">
                            <span className="">Total</span>
                            <span className="">$ {offerData?.total}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="">BTW-scenario</span>
                            <span className="">{offerData?.vat}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="">Created On</span>
                            <span className="">{formatDate(offerData?.createdAt)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="">Expiry date</span>
                            <span className="">{formatDate(offerData?.expire_date)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span className="">Status</span>
                            <span className="">{offerData?.Status}</span>
                        </div>
                    </div>
                    <div className="">
                        {valutionRoom &&
                            valutionRoom.map((item: any, index: number) => (
                                <div
                                    key={index}
                                    className="bg-white mt-4"
                                >
                                    <Divider sx={{ my: 2 }} />

                                    <h4 className="text-xl bg-gray py-2 font-bold mb-2 text-black">
                                        {item.name || item.roomTypeName}
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {item.furnitureType.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-black">Furniture</h4>
                                                <ul>
                                                    {item.furnitureType
                                                        .slice(0, showAllFurniture ? item.furnitureType.length : 4)
                                                        .map((furniture: any, furnitureIndex: number) => (
                                                            <li
                                                                key={`${index}-furniture-${furnitureIndex}`}
                                                            >
                                                                {furniture.quantity} {furniture.furnitureTypeName}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {item.furnitureType.length > 4 && (
                                                    <button
                                                        onClick={() => setShowAllFurniture(!showAllFurniture)}
                                                        className="text-blue mt-2 flex items-center"
                                                    >
                                                        {showAllFurniture ? 'Show Less ▲' : 'Show More ▼'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {item.inventoryItems.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-black">Boxes</h4>
                                                <ul>
                                                    {item.inventoryItems
                                                        .slice(0, showAllBoxes ? item.inventoryItems.length : 4)
                                                        .map((furniture: any, furnitureIndex: number) => (
                                                            <li
                                                                key={`${index}-inventory-${furnitureIndex}`}
                                                            >
                                                                {furniture.quantity} {furniture.name}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {item.inventoryItems.length > 4 && (
                                                    <button
                                                        onClick={() => setShowAllBoxes(!showAllBoxes)}
                                                        className="text-blue mt-2 flex items-center"
                                                    >
                                                        {showAllBoxes ? 'Show Less ▲' : 'Show More ▼'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Assembling Items */}
                                        {item.assembledItems.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-black">Assembling</h4>
                                                <ul>
                                                    {item.assembledItems
                                                        .slice(0, showAllAssembled ? item.assembledItems.length : 4)
                                                        .map((furniture: any, furnitureIndex: number) => (
                                                            <li
                                                                key={`${index}-assembled-${furnitureIndex}`}
                                                            >
                                                                {furniture.furnitureTypeName}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {item.assembledItems.length > 4 && (
                                                    <button
                                                        onClick={() => setShowAllAssembled(!showAllAssembled)}
                                                        className="text-blue mt-2 flex items-center"
                                                    >
                                                        {showAllAssembled ? 'Show Less ▲' : 'Show More ▼'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {item.dismantledItems.length > 0 && (
                                            <div>
                                                <h4 className="text-lg font-semibold text-black">Disassembling</h4>
                                                <ul>
                                                    {item.dismantledItems
                                                        .slice(0, showAllDismantled ? item.dismantledItems.length : 4)
                                                        .map((furniture: any, furnitureIndex: number) => (
                                                            <li
                                                                key={`${index}-dismantled-${furnitureIndex}`}
                                                            >
                                                                {furniture.furnitureTypeName}
                                                            </li>
                                                        ))}
                                                </ul>
                                                {item.dismantledItems.length > 4 && (
                                                    <button
                                                        onClick={() => setShowAllDismantled(!showAllDismantled)}
                                                        className="text-blue mt-2 flex items-center"
                                                    >
                                                        {showAllDismantled ? 'Show Less ▲' : 'Show More ▼'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                    </div>
                                </div>
                            ))}
                    </div>
                </div>)
                : <> No Linked Quotaion </>}
        </Box>
    );
};

export default JobOffermodule;
