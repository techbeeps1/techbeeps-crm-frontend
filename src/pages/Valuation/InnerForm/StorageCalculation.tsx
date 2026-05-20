import React, { useEffect } from 'react'
import { useFormContext, Controller } from "react-hook-form";

const StorageCalculation: React.FC<any> = ({ packingCharges, type, price }) => {
    const { control, setValue } = useFormContext() as any;

    useEffect(() => {
        setValue(`${type}.appliedPrice`, price);
    }, [setValue, price])

    return (
        // <details className="group mt-1">
        //     <summary className="flex justify-between items-center p-4 bg-white cursor-pointer list-none">
        //         <h3 className="text-lg font-medium capitalize">Storage</h3>
        //         <div className="flex items-center">
        //             <span className="text-md font-bold mx-2">{packingCharges && packingCharges} $</span>
        //             <span className="transform transition-transform group-open:rotate-180">
        //                 ▼
        //             </span>
        //         </div>
        //     </summary>
        //     <div className="p-4 bg-white border-t border-gray">
        //         <div className="space-y-2">
        //             <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
        //                 <span className="font-medium">Storage charge</span>
        //                 <Controller
        //                     name={`${type}.storageVolume`}
        //                     control={control}
        //                     defaultValue="0"
        //                     render={({ field }) => (
        //                         <input
        //                             {...field}
        //                             type="number"
        //                             min={0}
        //                             className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
        //                         />
        //                     )}
        //                 />
        //                 <Controller
        //                     name={`${type}.appliedPrice`}
        //                     control={control}
        //                     defaultValue="0"
        //                     render={({ field }) => (
        //                         <input
        //                             {...field}
        //                             type="number"
        //                             min={0}
        //                             className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
        //                         />
        //                     )}
        //                 />
        //             </div>
        //             <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
        //                 <span className="font-medium">Addition charges (exa - Handling charge)</span>
        //                 <span></span>
        //                 <Controller
        //                     name={`${type}.additionCharges`}
        //                     control={control}
        //                     defaultValue="0"
        //                     render={({ field }) => (
        //                         <input
        //                             {...field}
        //                             type="number"
        //                             min={0}
        //                             className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
        //                         />
        //                     )}
        //                 />
        //             </div>

        //         </div>
        //     </div>
        // </details>

        <details className="group overflow-hidden border border-slate-200 bg-white transition-all duration-300">
  {/* Header */}
  <summary className="list-none cursor-pointer bg-gradient-to-r from-slate-50 to-gray-100 p-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-xl font-medium">Storage</h3>
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
      {/* Storage Charges */}
      <div className="bg-white border border-slate-200 p-5 shadow-sm">
        <h4 className="mb-5 font-semibold text-slate-800">
          Storage Charges
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Storage Volume
            </label>

            <Controller
              name={`${type}.storageVolume`}
              control={control}
              defaultValue="0"
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="Enter storage volume"
                  className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              )}
            />
          </div>

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

      {/* Additional Charges */}
      <div className="bg-white border border-slate-200 p-5 shadow-sm">
        <h4 className="mb-5 font-semibold text-slate-800">
          Additional Charges
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Additional Charges
              <span className="text-slate-500 text-xs ml-1">
                (e.g. Handling Charge)
              </span>
            </label>

            <Controller
              name={`${type}.additionCharges`}
              control={control}
              defaultValue="0"
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  min={0}
                  placeholder="Enter additional charges"
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

export default StorageCalculation