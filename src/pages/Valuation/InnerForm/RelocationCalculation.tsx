import React, { useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';

const RelocationCalculation: React.FC<any> = ({
  totalSum,
  priceAgreement,
  rooms,
}) => {
  const { setValue, control } = useFormContext() as any;

  const groupedInventoryItems = rooms
    ?.flatMap((item: any) => item?.inventoryItems)
    .reduce((acc: Record<string, any>, box: any) => {
      if (acc[box._id]) {
        acc[box._id].quantity += box.quantity; // Increment quantity if _id exists
      } else {
        acc[box._id] = { ...box }; // Add new entry if _id doesn't exist
      }
      return acc;
    }, {});

  const mergedInventoryItems = Object.values(groupedInventoryItems);

  useEffect(() => {
    const totalBoxes =
      mergedInventoryItems &&
      mergedInventoryItems.reduce((sum, box: any) => sum + box.quantity, 0);
    setValue('relocation.totalBoxes', totalBoxes);
  }, []);

  // return (
  //     <details className="group">
  //         <summary className="flex justify-between items-center p-4 bg-white cursor-pointer list-none">
  //             <h3 className="text-lg font-medium">Relocation</h3>
  //             <div className="flex items-center">
  //                 <span className="text-md font-bold mx-2">{totalSum && totalSum} $</span>
  //                 <span className="transform transition-transform group-open:rotate-180">
  //                     ▼
  //                 </span>
  //             </div>
  //         </summary>
  //         <div className="p-4 bg-white border-t border-gray">
  //             <div className="space-y-2">
  //                 <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
  //                     <span className="font-medium">Cubic meter</span>
  //                     <Controller
  //                         name="relocation.totalVolume"
  //                         control={control}
  //                         defaultValue="0"
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="number"
  //                                 min={0}
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />
  //                     {priceAgreement !== 'onhourly_basis' &&
  //                         <Controller
  //                             name="relocation.pricePerMeterCubic"
  //                             control={control}
  //                             defaultValue="0"
  //                             render={({ field }) => (
  //                                 <input
  //                                     {...field}
  //                                     type="number"
  //                                     min={0}
  //                                     className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                                 />
  //                             )}
  //                         />}
  //                 </div>
  //                 <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
  //                     <span className="font-medium">Hours</span>
  //                     <Controller
  //                         name="relocation.requiredHours"
  //                         control={control}
  //                         defaultValue=""
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="time"
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />
  //                     {priceAgreement === 'onhourly_basis' && <Controller
  //                         name="relocation.pricePerMeterCubic"
  //                         control={control}
  //                         defaultValue="0"
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="number"
  //                                 min={0}
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />}
  //                 </div>
  //                 <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
  //                     <span className="font-medium">Movers</span>
  //                     <Controller
  //                         name="relocation.movers"
  //                         control={control}
  //                         defaultValue="2"
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="number"
  //                                 min={0}
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />
  //                 </div>
  //                 <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
  //                     <span className="font-medium">Travel time</span>
  //                     <Controller
  //                         name="relocation.travelTime"
  //                         control={control}
  //                         defaultValue="0"
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="number"
  //                                 min={0}
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />
  //                     <Controller
  //                         name="relocation.pricePerHour"
  //                         control={control}
  //                         defaultValue="0"
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="number"
  //                                 min={0}
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />
  //                 </div>
  //                 <div className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
  //                     <span className="font-medium">Distance</span>
  //                     <Controller
  //                         name="relocation.distance"
  //                         control={control}
  //                         defaultValue="0"
  //                         rules={{
  //                             pattern: {
  //                                 value: /^[0-9]*\.?[0-9]*$/,
  //                                 message: 'Only numbers and decimals are allowed',
  //                             },
  //                         }}
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 type="text"
  //                                 inputMode="decimal"
  //                                 pattern="[0-9]*\.?[0-9]*"
  //                                 className="text-right font-medium bg-white rounded px-6 py-2 border border-gray text-lg outline-none"
  //                                 onInput={(e) => {
  //                                     e.currentTarget.value = e.currentTarget.value.replace(/[^0-9.]/g, '');
  //                                     if ((e.currentTarget.value.match(/\./g) || []).length > 1) {
  //                                         e.currentTarget.value = e.currentTarget.value.replace(/\.+$/, '');
  //                                     }
  //                                     field.onChange(e); // Ensure form state updates
  //                                 }}
  //                             />
  //                         )}
  //                     />
  //                     <Controller
  //                         name="relocation.pricePerKilometer"
  //                         control={control}
  //                         defaultValue="0"
  //                         render={({ field }) => (
  //                             <input
  //                                 {...field}
  //                                 min={0}
  //                                 type="number"
  //                                 className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                             />
  //                         )}
  //                     />
  //                 </div>
  //                 {mergedInventoryItems.map((box: any, index: number) => (
  //                     <div key={index} className="grid grid-cols-4 gap-3 items-center text-md border-b border-gray pb-2">
  //                         <span className="font-medium">{box.name}</span>
  //                         <input
  //                             type="number"
  //                             value={box.quantity}
  //                             readOnly
  //                             min={0}
  //                             className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                         />
  //                         <input
  //                             value={box.price}
  //                             readOnly
  //                             min={0}
  //                             type="number"
  //                             className="text-right font-medium bg-white rounded px-2 py-2 border border-gray text-lg outline-none"
  //                         />
  //                     </div>
  //                 ))}
  //             </div>
  //         </div>
  //     </details>
  // )

  return (
    <details className="group overflow-hidden  border border-slate-200 bg-white  transition-all duration-300">
      {/* Header */}
      <summary className="list-none cursor-pointer bg-gradient-to-r from-slate-50 to-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium">Relocation Calculation</h3>
          </div>

          <div className="flex items-center gap-4">
            <p className="text-lg font-bold">{totalSum || 0} $</p>

            <span className="transform transition-transform group-open:rotate-180">
              ▼
            </span>
          </div>
        </div>
      </summary>

      {/* Content */}
      <div className="bg-slate-50 p-6">
        <div className="space-y-6">
          {/* Cubic Meter */}
          <div className=" bg-white border border-slate-200 p-5 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-5">Cubic Meter</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Total Volume
                </label>
                <Controller
                  name="relocation.totalVolume"
                  control={control}
                  defaultValue="0"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Enter cubic volume"
                      className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>

              {priceAgreement !== 'onhourly_basis' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Price Per Cubic Meter
                  </label>

                  <Controller
                    name="relocation.pricePerMeterCubic"
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
              )}
            </div>
          </div>

          {/* Hours & Movers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-5">
                Working Hours
              </h4>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Required Hours
                  </label>

                  <Controller
                    name="relocation.requiredHours"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        placeholder="HH:MM"
                        pattern="^\d+:\d{2}$"
                        className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      />
                    )}
                  />
                </div>

                {priceAgreement === 'onhourly_basis' && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Hourly Price
                    </label>

                    <Controller
                      name="relocation.pricePerMeterCubic"
                      control={control}
                      defaultValue="0"
                      render={({ field }) => (
                        <input
                          {...field}
                          type="number"
                          min={0}
                          placeholder="Enter hourly rate"
                          className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        />
                      )}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 shadow-sm">
              <h4 className="font-semibold text-slate-800 mb-5">Team Setup</h4>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Movers
                </label>

                <Controller
                  name="relocation.movers"
                  control={control}
                  defaultValue="2"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Number of movers"
                      className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Travel & Distance */}
          <div className="bg-white border border-slate-200 p-5 shadow-sm">
            <h4 className="font-semibold text-slate-800 mb-5">
              Travel Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Travel Time
                </label>

                <Controller
                  name="relocation.travelTime"
                  control={control}
                  defaultValue="0"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Hours"
                      className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price Per Hour
                </label>

                <Controller
                  name="relocation.pricePerHour"
                  control={control}
                  defaultValue="0"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Hourly charge"
                      className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Distance (KM)
                </label>

                <Controller
                  name="relocation.distance"
                  control={control}
                  defaultValue="0"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter distance"
                      className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^0-9.]/g,
                          '',
                        );

                        if (
                          (e.currentTarget.value.match(/\./g) || []).length > 1
                        ) {
                          e.currentTarget.value = e.currentTarget.value.replace(
                            /\.+$/,
                            '',
                          );
                        }

                        field.onChange(e);
                      }}
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price Per KM
                </label>

                <Controller
                  name="relocation.pricePerKilometer"
                  control={control}
                  defaultValue="0"
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min={0}
                      placeholder="Rate per KM"
                      className="w-full rounded-[5px] border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  )}
                />
              </div>
            </div>
          </div>
{mergedInventoryItems.length > 0 && (
<div className="bg-white border border-slate-200 p-5 shadow-sm">
 
 <div className='flex justify-between'> <h4 className="mb-5 font-semibold text-slate-800">
    Inventory Items
  </h4> 
  <p> Total: {mergedInventoryItems.reduce((sum : number, box: any) => sum + (box.quantity * box.price), 0).toFixed(2)} $ </p>
</div>
  <div className="overflow-x-auto rounded-[5px] border border-slate-200">
    <table className="min-w-full border-collapse">
      {/* Header */}
      <thead className="bg-slate-100">
        <tr>
          <th className="px-5 py-4 text-left text-sm font-semibold text-slate-700">
            Item Name
          </th>

          <th className="px-5 py-4 text-center text-sm font-semibold text-slate-700">
            Quantity
          </th>

          <th className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
            Price
          </th>
           <th className="px-5 py-4 text-right text-sm font-semibold text-slate-700">
            Total
          </th>
        </tr>
      </thead>

      {/* Body */}
      <tbody className="divide-y divide-slate-200 bg-white">
        {mergedInventoryItems.map(
          (box: any, index: number) => (
            <tr
              key={index}
              className="transition-colors hover:bg-slate-50"
            >
              <td className="px-5 py-4 text-sm text-slate-800 capitalize">
                {box.name || '-'}
              </td>

              <td className="px-5 py-4 text-center text-sm text-slate-800">
                {box.quantity || 0}
              </td>

              <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                {box.price || 0} $
              </td>
              <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                {(box.quantity * box.price).toFixed(2) || 0} $
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  </div>
</div> )}
        </div>
      </div>
    </details>
  );
};

export default RelocationCalculation;
