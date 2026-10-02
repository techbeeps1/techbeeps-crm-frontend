import React, { useState } from 'react';
import { AddressDrawer } from './AddressDrawer';

const AddressSection: React.FC<any> = ({
  title,
  address,
  postalCode,
  city,
  notice,
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold mb-2 text-slate-800">
        {title}
      </h3>
      <div className="rounded border border-slate-200 p-4 bg-white shadow-xs">
        <div>
          <p className="text-base font-bold text-slate-800">{address}</p>
          <p className="text-sm text-slate-600 mt-1">
            {postalCode} {city}
          </p>
        </div>
        {notice && (
          <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Property Notice: <strong className="text-slate-800">{notice}</strong></span>
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
  const [loadAddress, setLoadAddress] = useState<boolean>(false);
  const [selectItem, setSelectItem] = useState<boolean>(false);
  const addressKnown = watch(`knownAddress`);

  const customerFullName =
    `${customer?.salutation ? customer?.salutation + ' ' : ''}${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() ||
    '—';
  const loadStreetAddress =
    `${load?.street || ''} ${load?.houseNumber || ''} ${load?.addition || ''}`.trim() ||
    `${load?.houseNumber || ''} ${load?.street || ''}`.trim() ||
    '—';
  const unloadStreetAddress =
    `${unload?.street || ''} ${unload?.houseNumber || ''} ${unload?.addition || ''}`.trim() ||
    `${unload?.houseNumber || ''} ${unload?.street || ''}`.trim() ||
    '—';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {type === 'customer' && (
        <div className="space-y-4">
          {/* Card 1: Customer Details */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Full Name */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Full Name
                </span>
                <span className="text-base font-semibold text-slate-800 capitalize truncate block">
                  {customerFullName}
                </span>
              </div>

              {/* Customer Type */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Customer Type
                </span>
                <span className="text-base font-semibold text-slate-800 block">
                  {customer?.typeOfCustomer || 'Individual'}
                </span>
              </div>

              {/* Gender */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Gender
                </span>
                <span className="text-base font-semibold text-slate-800 capitalize block">
                  {customer?.gender || '—'}
                </span>
              </div>

              {/* Language */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Language
                </span>
                <span className="text-base font-semibold text-slate-800 block">
                  {customer?.taal || 'English'}
                </span>
              </div>
            </div>

            {/* Commercial Company */}
            {customer?.companyName && (
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Company Name
                </span>
                <p className="text-base font-semibold text-slate-800">
                  {customer.companyName}
                </p>
              </div>
            )}
          </div>

          {/* Card 2: Contact Information */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Mobile */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Mobile Number
                </span>
                <p className="text-base font-semibold text-slate-800">
                  {customer?.mobile || '—'}
                </p>
              </div>

              {/* Telephone */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Telephone
                </span>
                <p className="text-base font-semibold text-slate-800">
                  {customer?.contact || '—'}
                </p>
              </div>

              {/* Email */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-xs uppercase font-medium text-slate-500 block mb-1">
                  Email Address
                </span>
                <p className="text-base font-semibold text-slate-800 break-all">
                  {customer?.email || '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Move Addresses Summary */}
          <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">
              Move Addresses
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin (Load Address) */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-600 block mb-2">
                    Pickup Address (Load)
                  </span>

                  <h4 className="text-base font-bold text-slate-800">
                    {loadStreetAddress}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">
                    {`${load?.postcode || load?.postalCode || ''} ${load?.city || ''} ${load?.country || ''}`.trim() || '—'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                  {load?.typeOfProperty && (
                    <span>Property: <strong className="text-slate-800">{load.typeOfProperty}</strong></span>
                  )}
                  {load?.floor && (
                    <span>Floor: <strong className="text-slate-800">{load.floor}</strong></span>
                  )}
                  <span>Elevator: <strong className="text-slate-800">{load?.hasElevator ? 'Yes' : 'No'}</strong></span>
                </div>
              </div>

              {/* Destination (Unload Address) */}
              {addressKnown ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between">
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-600 block mb-2">
                      Delivery Address (Unload)
                    </span>

                    <h4 className="text-base font-bold text-slate-800">
                      {unloadStreetAddress}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {`${unload?.postcode || unload?.postalCode || ''} ${unload?.city || ''} ${unload?.country || ''}`.trim() || '—'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600">
                    {unload?.typeOfProperty && (
                      <span>Property: <strong className="text-slate-800">{unload.typeOfProperty}</strong></span>
                    )}
                    {unload?.floor && (
                      <span>Floor: <strong className="text-slate-800">{unload.floor}</strong></span>
                    )}
                    <span>Elevator: <strong className="text-slate-800">{unload?.hasElevator ? 'Yes' : 'No'}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded flex flex-col items-center justify-center text-center min-h-[140px]">
                  <p className="text-sm font-semibold text-slate-600">
                    Destination Address Not Yet Specified
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Client will provide the delivery address prior to moving day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {type === 'load' && (
        <>
          <AddressSection
            title="Load"
            address={loadStreetAddress}
            postalCode={load?.postcode || load?.postalCode}
            city={`${load?.city || ''} ${load?.country || ''}`.trim()}
            notice={load?.typeOfProperty}
            mode={mode}
          />
          {mode === 'add' && (
            <>
              <div
                onClick={() => setLoadAddress(true)}
                className="px-4 py-2 mt-2 border-dashed border-2 border-primary rounded-md flex items-center space-x-2 cursor-pointer"
              >
                <span className="text-lg">➕</span>
                <span className="font-bold text-lg">Edit Address</span>
              </div>
              <AddressDrawer
                selectItem={loadAddress}
                setSelectItem={setLoadAddress}
                countries={countries}
                type={type}
              />
            </>
          )}
          {!!addressKnown && (
            <AddressSection
              title="Unload"
              address={unloadStreetAddress}
              postalCode={unload?.postcode || unload?.postalCode}
              city={`${unload?.city || ''} ${unload?.country || ''}`.trim()}
              notice={unload?.typeOfProperty}
              mode={mode}
            />
          )}

          {mode === 'add' && (
            <>
              <div
                onClick={() => setSelectItem(true)}
                className="px-4 py-2 mt-2 border-dashed border-2 border-primary rounded-md flex items-center space-x-2 cursor-pointer"
              >
                <span className="text-lg">➕</span>
                <span className="font-bold text-lg">Edit Address</span>
              </div>
              <AddressDrawer
                selectItem={selectItem}
                setSelectItem={setSelectItem}
                countries={countries}
                type={type}
              />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AddressVerification;
