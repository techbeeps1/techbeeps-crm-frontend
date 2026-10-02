import axios from "axios";
import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { apiPath } from "../../../../apiPath";

const PriceAgree: React.FC<any> = ({ setPackageData, setAppendedItems }) => {
    const [packageList, setPackageList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const {
        control,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();

    const priceAgreement = watch("priceAgree");
    const selectedPackage = watch("package");
    const prevPackageRef = React.useRef<string | null>(null);

    const fetchPackages = async () => {
        if (priceAgreement) {
            setLoading(true);
            setFetchError(null);
            try {
                const response = await axios.get(
                    `${apiPath}/api/packages?priceAgree=${priceAgreement}&withJob=true`
                );
                const rawList = Array.isArray(response.data) ? response.data : [];
                // Intake / Valuation is a move job with details: exclude Manual/No job standalone packages
                const jobPackages = rawList.filter(
                    (item: any) => item.type_job && item.type_job !== 'Manual/No job' && item.type_job !== ''
                );
                setPackageList(jobPackages);
            } catch (error: any) {
                console.error("Error fetching packages:", error.message);
                setFetchError(error.message || "Failed to load packages");
                setPackageList([]);
            } finally {
                setLoading(false);
            }
        } else {
            setPackageList([]);
            setLoading(false);
            setFetchError(null);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, [priceAgreement]);

    useEffect(() => {
        if (selectedPackage) {
            const selectedPackageData = packageList.find(
                (item: any) => item._id === selectedPackage
            );
            setPackageData(selectedPackageData || null);

            // Only clear items if user explicitly switched package
            if (prevPackageRef.current !== null && prevPackageRef.current !== selectedPackage) {
                setValue('offer.items', []);
                setAppendedItems(new Set());
            }
            prevPackageRef.current = selectedPackage;
        } else {
            setPackageData(null);
            if (prevPackageRef.current !== null) {
                setValue('offer.items', []);
                setAppendedItems(new Set());
            }
        }
    }, [selectedPackage, packageList, setPackageData, setValue, setAppendedItems]);

    return (
        <div className="p-10 mb-10">
            <div className="mb-6">
                <label className="block text-lg font-medium mb-2">Price Agreement*</label>
                <div className="md:flex gap-3">
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
                                    className={`w-full py-3 px-4 rounded-xl text-lg font-medium transition-all shadow-sm ${field.value === "fixed_price"
                                        ? "bg-primary text-white shadow-primary/20"
                                        : "bg-white hover:bg-slate-50 border border-slate-200"
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
                                    className={`w-full py-3 px-4 rounded-xl text-lg font-medium transition-all shadow-sm ${field.value === "onhourly_basis"
                                        ? "bg-primary text-white shadow-primary/20"
                                        : "bg-white hover:bg-slate-50 border border-slate-200"
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
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-lg font-medium">Select Package*</label>
                    {loading && (
                        <span className="text-xs text-primary font-medium flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                            Loading packages...
                        </span>
                    )}
                </div>

                <Controller
                    name="package"
                    control={control}
                    rules={{ required: "Package is required" }}
                    render={({ field }) => (
                        <select
                            {...field}
                            disabled={!priceAgreement || loading}
                            className={`block w-full px-4 py-2.5 rounded-xl text-base shadow-sm border transition-all ${
                                !priceAgreement || loading
                                    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                                    : "bg-white border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                            }`}
                        >
                            {!priceAgreement && (
                                <option value="">-- First select Price Agreement above --</option>
                            )}
                            {priceAgreement && loading && (
                                <option value="">-- Loading packages... --</option>
                            )}
                            {priceAgreement && !loading && fetchError && (
                                <option value="">-- Failed to load packages --</option>
                            )}
                            {priceAgreement && !loading && !fetchError && packageList.length === 0 && (
                                <option value="">-- No packages available for this agreement --</option>
                            )}
                            {priceAgreement && !loading && packageList.length > 0 && (
                                <option value="">-- Select a Package ({packageList.length} available) --</option>
                            )}
                            {packageList.map((item: any) => (
                                <option key={item._id} value={item._id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                    )}
                />

                {/* Helpful status feedback */}
                {!loading && priceAgreement && packageList.length === 0 && !fetchError && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                        ⚠️ No packages found for <strong>{priceAgreement === 'fixed_price' ? 'Fixed Price' : 'Hourly Basis'}</strong>. Please configure packages in Settings or choose another price agreement.
                    </div>
                )}

                {fetchError && (
                    <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
                        <span>Failed to fetch packages: {fetchError}</span>
                        <button
                            type="button"
                            onClick={fetchPackages}
                            className="ml-3 px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {errors.package && (
                    <span className="text-sm text-red-500 mt-1 block">{errors.package.message}</span>
                )}
            </div>
        </div>
    );
};

export default PriceAgree;
