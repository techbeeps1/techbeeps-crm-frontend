import React, { useEffect } from 'react'
import { useFormContext, Controller } from "react-hook-form";

const AssemblingCalculation: React.FC<any> = ({ packingCharges, type, price }) => {
    const { control, setValue } = useFormContext() as any;

    useEffect(() => {
        setValue(`${type}.appliedPrice`, price);
    }, [setValue, price])

    return (
      <details className="group overflow-hidden border border-slate-200 bg-white transition-all duration-300">
  {/* Header */}
  <summary className="list-none cursor-pointer bg-gradient-to-r from-slate-50 to-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-medium capitalize">
          {type}
        </h3>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-lg font-bold">
          {packingCharges || 0} $
        </p>

        <span className="transform transition-transform group-open:rotate-180">
          ▼
        </span>
      </div>
    </div>
  </summary>

  {/* Content */}
  <div className="bg-slate-50 p-6">
    <div className="space-y-6">

      {/* Working Hours */}
      <div className="bg-white border border-slate-200 p-5 shadow-sm">
        <h4 className="font-semibold text-slate-800 mb-5 capitalize">
          {type} Working Details
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {/* Required Hours */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700 capitalize">
              Required {type} Hours
            </label>

            <Controller
              name={`${type}.requiredHours`}
              control={control}
              defaultValue={0}
              render={({ field }) => (
                <input
                  {...field}
                   type="text"
                        placeholder="HH:MM"
                        pattern="^\d+:\d{2}$"
                  className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              )}
            />
          </div>

          {/* Applied Price */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Applied Price
            </label>

            <Controller
              name={`${type}.appliedPrice`}
              control={control}
              defaultValue="0"
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="Enter amount"
                  className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Handyman Setup */}
      <div className="bg-white border border-slate-200 p-5 shadow-sm">
        <h4 className="font-semibold text-slate-800 mb-5">
          Team Setup
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Required Handyman
            </label>

            <Controller
              name={`${type}.requiredHandyman`}
              control={control}
              defaultValue="1"
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="Enter handyman count"
                  className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              )}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</details>
    )
}

export default AssemblingCalculation