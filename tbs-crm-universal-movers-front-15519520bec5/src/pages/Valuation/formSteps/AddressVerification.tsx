import React, { useState } from "react";
import { AddressDrawer } from "./AddressDrawer";

const AddressSection: React.FC<any> = ({
    title,
    address,
    postalCode,
    city,
    notice
}) => {


    return (
        <div className="mt-5">
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <div className="rounded-lg p-4 shadow-md bg-white">
                <div className="flex items-start space-x-3 mb-4">
                    <span className="text-blue pt-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-7 w-7"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 2C8.686 2 6 4.686 6 8c0 3.92 5.22 9.278 5.511 9.578a.999.999 0 001.478 0C12.78 17.278 18 11.92 18 8c0-3.314-2.686-6-6-6zM12 11a3 3 0 110-6 3 3 0 010 6z"
                            />
                        </svg>
                    </span>
                    <div className="text-lg" style={{ fontWeight: '500' }}>
                        <p>{address}</p>
                        <p>
                            {postalCode} {city}
                        </p>
                    </div>
                </div>
                {notice && (
                    <div className="flex items-start space-x-3">
                        <span className="text-blue">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-7 w-7"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10l1.5 1.5a9 9 0 0013.5 0L21 10m0 0v7a3 3 0 01-3 3H6a3 3 0 01-3-3v-7m0 0L9 4m6 0h0a2 2 0 114 0m-10 0a2 2 0 114 0"
                                />
                            </svg>
                        </span>
                        <p className="text-lg" style={{ fontWeight: '500' }}>{notice}</p>
                    </div>
                )}
            </div>

        </div>
    );
};

const AddressVerification: React.FC<any> = ({ watch, type, mode, countries }) => {

    let load = watch('load');
    let unload = watch('unload');
    let customer = watch('customer');
    const [loadAddress, setLoadAddress] = useState<boolean>(false)
    const [selectItem, setSelectItem] = useState<boolean>(false)
    const addressKnown = watch(`knownAddress`);

    return (
        <div className="px-10">
            {type === 'customer' && <AddressSection
                title="Customer Details"
                address={`${customer?.salutation} ${customer?.firstName} ${customer?.lastName}`}
                postalCode={customer?.mobile}
                city={`${load?.city} ${load?.country}`}
                notice={customer?.email}
            />}
            {type === 'load' && <><AddressSection
                title="Load"
                address={`${load?.houseNumber} ${load?.street} ${load?.addition}`}
                postalCode={load?.postalCode}
                city={`${load?.city} ${load?.country}`}
                notice={load?.typeOfProperty}
                mode={mode}
            />
                {mode === 'add' &&
                    <>
                        <div onClick={() => setLoadAddress(true)} className="px-4 py-2 mt-2 border-dashed border-2 border-primary rounded-md flex items-center space-x-2">
                            <span className="text-lg">➕</span>
                            <span className="font-bold text-lg">Edit Address</span>
                        </div>
                        <AddressDrawer selectItem={loadAddress} setSelectItem={setLoadAddress} countries={countries} type={type} />
                    </>
                }
                {!addressKnown && <AddressSection
                    title="Unload"
                    address={`${unload?.houseNumber} ${unload?.street} ${unload?.addition}`}
                    postalCode={unload?.postalCode}
                    city={`${unload?.city} ${unload?.country}`}
                    notice={unload?.typeOfProperty}
                    mode={mode}
                />}

                {mode === 'add' &&
                    <>
                        <div onClick={() => setSelectItem(true)} className="px-4 py-2 mt-2 border-dashed border-2 border-primary rounded-md flex items-center space-x-2">
                            <span className="text-lg">➕</span>
                            <span className="font-bold text-lg">Edit Address</span>
                        </div>
                        <AddressDrawer selectItem={selectItem} setSelectItem={setSelectItem} countries={countries} type={type} />
                    </>
                }
            </>}
        </div>
    );
};

export default AddressVerification;
