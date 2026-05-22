import React from 'react';

const MaterialsCalculation: React.FC<any> = ({
  totalSum,
materials=[]
}) => {


const materialsCharge = materials.filter(
  (box: any) => box.quantity > 0
);


  return (
    <details className="group overflow-hidden  border border-slate-200 bg-white  transition-all duration-300">
      {/* Header */}
      <summary className="list-none cursor-pointer bg-gradient-to-r from-slate-50 to-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium">Materials Calculation</h3>
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
          {materialsCharge.length > 0 && (
            <div className="bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex justify-between">
                {' '}
                <h4 className="mb-5 font-semibold text-slate-800">
                  Material Items
                </h4>
                <p>
                  {' '}
                  Total:{' '}
                  
                  ${totalSum.toFixed(2) || 0}
                </p>
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
                    {materialsCharge.map((box: any, index: number) => (
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
                          {box.sellingPrice || 0} $
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                          {(box.quantity * box.sellingPrice).toFixed(2) || 0} $
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </details>
  );
};

export default MaterialsCalculation;
