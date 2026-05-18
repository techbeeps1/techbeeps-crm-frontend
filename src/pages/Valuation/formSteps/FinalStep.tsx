import React from "react";
import { Controller, useFormContext } from "react-hook-form";

const FinalStep: React.FC<any> = () => {
    const { control, watch } = useFormContext() as any;

    const signWithCustomer = watch("signWithCustomer");

    return (
        <div className="p-10">
            <div className="mb-4">
                <label className="block text-xl mb-5 font-medium">Do you want to sign with the customer right away?</label>
                <div className="flex gap-2 w-full">
                    <Controller
                        name={`signWithCustomer`}
                        control={control}
                        render={({ field }) => (
                            <button
                                type="button"
                                {...field}
                                onClick={() => field.onChange(true)} // Set elevator to true
                                className={`px-5 py-3 w-full shadow text-xl font-medium ${field.value ? "bg-blue text-white" : "bg-white"}`}
                            >
                                Yes
                            </button>
                        )}
                    />
                    <Controller
                        name={`signWithCustomer`}
                        control={control}
                        render={({ field }) => (
                            <button
                                type="button"
                                {...field}
                                onClick={() => field.onChange(false)} // Set elevator to false
                                className={`px-5 py-3 w-full shadow text-xl font-medium ${!field.value ? "bg-blue text-white" : "bg-white"}`}>
                                No
                            </button>
                        )}
                    />
                </div>
            </div>
            {!signWithCustomer && <div className="mb-4">
                <label className="block text-xl mb-4 font-medium">Would you like to send the quote immediately ?</label>
                <div className="flex gap-2 w-full">
                    <Controller
                        name={`sendImmediately`}
                        control={control}
                        render={({ field }) => (
                            <button
                                type="button"
                                {...field}
                                onClick={() => field.onChange(true)} // Set elevator to true
                                className={`px-5 py-3 w-full shadow text-xl font-medium ${field.value ? "bg-blue text-white" : "bg-white"}`}
                            >
                                Yes
                            </button>
                        )}
                    />
                    <Controller
                        name={`sendImmediately`}
                        control={control}
                        render={({ field }) => (
                            <button
                                type="button"
                                {...field}
                                onClick={() => field.onChange(false)} // Set elevator to false
                                className={`px-5 py-3 w-full shadow text-xl font-medium ${!field.value ? "bg-blue text-white" : "bg-white"}`}>
                                No,Prepare Quotation
                            </button>
                        )}
                    />
                </div>
            </div>}
        </div>
    );
};

export default FinalStep;
