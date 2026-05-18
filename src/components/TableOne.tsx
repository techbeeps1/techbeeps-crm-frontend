import React from 'react';

const DashboardProgress = () => {
  const progressData = {
    invoices: [
      { status: 'Draft', percentage: 0 },
      { status: 'Pending', percentage: 0 },
      { status: 'Unpaid', percentage: 0 },
      { status: 'Overdue', percentage: 0 },
      { status: 'Partially', percentage: 0 },
      { status: 'Paid', percentage: 100 },
    ],
    proformaInvoices: [
      { status: 'Draft', percentage: 0 },
      { status: 'Pending', percentage: 0 },
      { status: 'Sent', percentage: 100 },
      { status: 'Declined', percentage: 0 },
      { status: 'Accepted', percentage: 0 },
      { status: 'Expired', percentage: 0 },
    ],
    offers: [
      { status: 'Draft', percentage: 100 },
      { status: 'Pending', percentage: 0 },
      { status: 'Sent', percentage: 0 },
      { status: 'Declined', percentage: 0 },
      { status: 'Accepted', percentage: 0 },
      { status: 'Expired', percentage: 0 },
    ],
  };

  const getColorByPercentage = (percentage) => {
    if (percentage === 100) return 'bg-green-500';  // Full completion
    if (percentage >= 50) return 'bg-yellow-500';   // Midway completion
    if (percentage > 0) return 'bg-red-500';        // Low completion
    return 'bg-gray-300';                           // No progress
  };

  const renderProgressBars = (categoryData) => {
    return categoryData.map((item, index) => (
      <div key={index} className="my-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">{item.status}</span>
          <span className="text-gray-600">{item.percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
          <div
            className={`h-2.5 rounded-full ${getColorByPercentage(item.percentage)}`}
            style={{ width: `${item.percentage}%` }}
          ></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-purple-800 mb-4">Invoices</h2>
          {renderProgressBars(progressData.invoices)}
        </div>

        <div>
          <h2 className="text-xl font-semibold text-purple-800 mb-4">Proforma Invoices</h2>
          {renderProgressBars(progressData.proformaInvoices)}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-purple-800 mb-4">Offers</h2>
          {renderProgressBars(progressData.offers)}
        </div>
      </div>
    </div>
  );
};

export default DashboardProgress;
