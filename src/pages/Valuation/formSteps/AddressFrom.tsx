import React from "react";
import { Controller, useFormContext } from "react-hook-form";

const AddressForm: React.FC<any> = ({ countries, type, property }) => {
    const { control, register, watch, formState: { errors } } = useFormContext() as any;

    const elevator = watch(`${type}.hasElevator`);
    const addressKnown = watch(`knownAddress`);

    return (
        <div className="p-10">
            {type === 'unload' && <div className="mb-4">
                <label className="block text-lg font-medium mb-2">Is the unloading address already known ?</label>
                <div className="flex gap-4">
                    <Controller
                        name={`knownAddress`}
                        control={control}
                        render={({ field }) => (
                            <button
                                type="button"
                                {...field}
                                onClick={() => field.onChange(true)} // Set elevator to true
                                className={`px-10 py-2 rounded-md ${field.value ? "bg-blue text-white" : "bg-white"}`}
                            >
                                Yes
                            </button>
                        )}
                    />
                    <Controller
                        name={`knownAddress`}
                        control={control}
                        render={({ field }) => (
                            <button
                                type="button"
                                {...field}
                                onClick={() => field.onChange(false)} // Set elevator to false
                                className={`px-10 py-2 rounded-md ${!field.value ? "bg-blue text-white" : "bg-white"}`}>
                                No
                            </button>
                        )}
                    />
                </div>
            </div>}
            {(!!addressKnown || type === 'load') && <div className="w-full">
                {/* Postcode */}
                <div className="mb-4">
                    <label htmlFor="postcode" className="block text-lg font-medium">Postcode*</label>
                    <input
                        {...register(`${type}.postcode`, { required: "Postcode is required." })}
                        type="text"
                        id="postcode"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    {errors[type]?.postcode && <p className="text-danger text-md mt-1">{errors[type]?.postcode.message}</p>}

                </div>

                {/* House Number */}
                <div className="mb-4">
                    <label htmlFor="houseNumber" className="block text-lg font-medium">House number*</label>
                    <input
                        {...register(`${type}.houseNumber`, { required: "House number is required." })}
                        type="text"
                        id="houseNumber"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    {errors[type]?.houseNumber && <p className="text-danger text-md mt-1">{errors[type]?.houseNumber?.message}</p>}
                </div>

                {/* Addition */}
                <div className="mb-4">
                    <label htmlFor="addition" className="block text-lg font-medium">Addition</label>
                    <input
                        {...register(`${type}.addition`)}
                        type="text"
                        id="addition"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="street" className="block text-lg font-medium">Street*</label>
                    <input
                        {...register(`${type}.street`, { required: "street is required." })}
                        type="text"
                        id="street"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    {errors[type]?.street && <p className="text-danger text-md mt-1">{errors[type]?.street?.message}</p>}
                </div>
                <div className="mb-4">
                    <label htmlFor="city" className="block text-lg font-medium">City*</label>
                    <input
                        {...register(`${type}.city`, { required: "city is required." })}
                        type="text"
                        id="city"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    {errors[type]?.city && <p className="text-danger text-md mt-1">{errors[type]?.city?.message}</p>}
                </div>

                {/* Land */}
                <div className="mb-4">
                    <label htmlFor="country" className="block text-lg font-medium">Country*</label>
                    <select
                        {...register(`${type}.country`, { required: "Please select a country." })}
                        id="country"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    >
                        <option value="">Select Country</option>
                        {countries.map((country: string) => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                    {errors[type]?.country && <p className="text-danger text-md mt-1">{errors[type]?.country?.message}</p>}
                </div>

                {/* Type of Property */}
                {/* <div className="mb-4">
                    <label htmlFor="typeOfProperty" className="block text-lg font-medium">Type of property*</label>
                    <input
                        {...register(`${type}.typeOfProperty`, { required: "Type of property is required." })}
                        type="text"
                        id="typeOfProperty"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    {errors[type]?.typeOfProperty && <p className="text-danger text-md mt-1">{errors[type]?.typeOfProperty?.message}</p>}
                </div> */}
                <div className="mb-4">
                    <label htmlFor="typeOfProperty" className="block text-lg font-medium">Type of property*</label>
                    <select
                        {...register(`${type}.typeOfProperty`, { required: "Type of property is required." })}
                        id="typeOfProperty"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    >
                        <option value="">Select property</option>
                        {property?.map((property: string) => (
                            <option key={property} value={property}>{property}</option>
                        ))}
                    </select>
                    {errors[type]?.typeOfProperty && <p className="text-danger text-md mt-1">{errors[type]?.typeOfProperty?.message}</p>}
                </div>

                {/* Floor */}
                <div className="mb-4">
                    <label htmlFor="floor" className="block text-lg font-medium">On which floor?*</label>
                    <input
                        {...register(`${type}.floor`, { required: "Floor information is required." })}
                        type="number"
                        id="floor"
                        className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                    />
                    {errors[type]?.floor && <p className="text-danger text-md mt-1">{errors[type]?.floor?.message}</p>}
                </div>

                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Is there an elevator?</label>
                    <div className="flex gap-4">
                        <Controller
                            name={`${type}.hasElevator`}
                            control={control}
                            render={({ field }) => (
                                <button
                                    type="button"
                                    {...field}
                                    onClick={() => field.onChange(true)} // Set elevator to true
                                    className={`px-10 py-2  rounded-md ${field.value ? "bg-blue text-white" : "bg-white"}`}
                                >
                                    Yes
                                </button>
                            )}
                        />
                        <Controller
                            name={`${type}.hasElevator`}
                            control={control}
                            render={({ field }) => (
                                <button
                                    type="button"
                                    {...field}
                                    onClick={() => field.onChange(false)} // Set elevator to false
                                    className={`px-10 py-2 rounded-md ${!field.value ? "bg-blue text-white" : "bg-white"}`}
                                >
                                    No
                                </button>
                            )}
                        />
                    </div>
                </div>

                {elevator && (
                    <>
                        <div className="mb-4">
                            <label htmlFor="distanceToLift" className="block text-lg font-medium">Distance from car to lift</label>
                            <input
                                {...register(`${type}.distanceToLift`, { required: "Distance from car to lift is required." })}
                                type="number"
                                min={0}
                                id="distanceToLift"
                                className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                            />
                            {errors[type]?.distanceToLift && <p className="text-danger text-md mt-1">{errors[type]?.distanceToLift?.message}</p>}
                        </div>

                        <div className="mb-5">
                            <label htmlFor="distanceToApartment" className="block text-lg font-medium">Distance from elevator to apartment</label>
                            <input
                                {...register(`${type}.distanceToApartment`, { required: "Distance to apartment is required." })}
                                type="number"
                                min={0}
                                id="distanceToApartment"
                                className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
                            />
                            {errors[type]?.distanceToApartment && (
                                <p className="text-danger text-md mt-1">{errors[type]?.distanceToApartment?.message}</p>
                            )}
                        </div>
                    </>
                )}


                {/* Traffic Signs */}
                <div className="mb-5">
                    <label className="block text-lg font-medium mb-2">Should traffic signs be placed?</label>
                    <div className="flex gap-4">
                        <Controller
                            name={`${type}.placingSigns`}
                            control={control}
                            render={({ field }) => (
                                <button
                                    type="button"
                                    {...field}
                                    onClick={() => field.onChange(true)} // Set elevator to true
                                    className={`px-10 py-2 rounded-md ${field.value ? "bg-blue text-white" : "bg-white"}`}
                                >
                                    Yes
                                </button>
                            )}
                        />
                        <Controller
                            name={`${type}.placingSigns`}
                            control={control}
                            render={({ field }) => (
                                <button
                                    type="button"
                                    {...field}
                                    onClick={() => field.onChange(false)} // Set elevator to false
                                    className={`px-10 py-2 rounded-md ${!field.value ? "bg-blue text-white" : "bg-white"}`}
                                >
                                    No
                                </button>
                            )}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-lg font-medium mb-2">Is a Permit Required?</label>
                    <div className="flex gap-4">
                        <Controller
                            name={`${type}.applyForPermit`}
                            control={control}
                            render={({ field }) => (
                                <button
                                    type="button"
                                    {...field}
                                    onClick={() => field.onChange(true)} // Set elevator to true
                                    className={`px-10 py-2 rounded-md ${field.value ? "bg-blue text-white" : "bg-white"}`}
                                >
                                    Yes
                                </button>
                            )}
                        />
                        <Controller
                            name={`${type}.applyForPermit`}
                            control={control}
                            render={({ field }) => (
                                <button
                                    type="button"
                                    {...field}
                                    onClick={() => field.onChange(false)} // Set elevator to false
                                    className={`px-10 py-2 rounded-md ${!field.value ? "bg-blue text-white" : "bg-white"}`}
                                >
                                    No
                                </button>
                            )}
                        />
                    </div>
                </div>
            </div>}

        </div>
    );
};

export default AddressForm;
