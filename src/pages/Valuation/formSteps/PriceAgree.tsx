import axios from "axios";
import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { apiPath } from "../../../../apiPath";

const PriceAgree: React.FC<any> = ({ setPackageData, setAppendedItems }) => {
    const [packageList, setPackageList] = useState([]);
    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const priceAgreement = watch("priceAgree");
    const selectedPackage = watch("package");

    useEffect(() => {

        console.log("priceAgreement", priceAgreement)
        console.log("selectedPackage", selectedPackage)
        const fetchPackages = async () => {
            if (priceAgreement) {
                try {
                    const response = await axios.get(
                        `${apiPath}/api/packages?priceAgree=${priceAgreement}`
                    );
                    setPackageList(response.data);
                } catch (error: any) {
                    console.error("Error fetching packages:", error.message);
                }
            } else {
                setPackageList([]);
            }
        };
        fetchPackages();
    }, [priceAgreement]);

    useEffect(() => {
        setValue('offer.items', []);
        setAppendedItems([]);
        if (selectedPackage) {
            const selectedPackageData = packageList.find(
                (item: any) => item._id === selectedPackage
            );
            setPackageData(selectedPackageData || null);
        } else {
            setPackageData(null); // Reset if no package selected
        }
    }, [selectedPackage, packageList, setPackageData]);


    return (
        <div className="p-10 mb-10">
            <div className="mb-6">
                <label className="block text-lg font-medium mb-2">Price Agreement*</label>
                <div className="md:flex">
                    <Controller
                        name="priceAgree"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        field.onChange("fixed_price");
                                        setValue("package", ""); // Reset package on change
                                    }}
                                    className={`w-full py-2 px-4 text-lg font-medium shadow ${field.value === "fixed_price"
                                        ? "bg-blue text-white"
                                        : "bg-white hover:bg-gray"
                                        }`}
                                >
                                    Fixed Price
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        field.onChange("onhourly_basis");
                                        setValue("package", ""); // Reset package on change
                                    }}
                                    className={`w-full py-2 px-4 text-lg font-medium shadow ${field.value === "onhourly_basis"
                                        ? "bg-blue text-white"
                                        : "bg-white hover:bg-gray"
                                        }`}
                                >
                                    On an Hourly Basis
                                </button>
                            </>
                        )}
                    />
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-lg font-medium mb-2">Select Package*</label>
                <Controller
                    name="package"
                    control={control}
                    rules={{ required: "Package is required" }}
                    render={({ field }) => (
                        <select
                            {...field}
                            disabled={!priceAgreement}
                            className={`block w-full px-4 py-2 text-lg shadow ${!priceAgreement
                                ? "bg-gray cursor-not-allowed"
                                : "bg-white focus:ring focus:ring-blue"
                                }`}
                        >
                            <option value="">-- Select a Package --</option>
                            {packageList.map((item: any) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    )}
                />
                {errors.package && (
                    <span className="text-sm text-red-500 mt-1">{errors.package.message}</span>
                )}
            </div>
        </div>
    );
};

export default PriceAgree;
