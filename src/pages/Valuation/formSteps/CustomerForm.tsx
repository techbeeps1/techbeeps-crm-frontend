import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { apiPath } from '../../../../apiPath';
const CustomerForm: React.FC<any> = ({ type, customerid }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext() as any;

  const [customerMode, setCustomerMode] = useState<'new' | 'existing' | null>(
    null,
  );

  const [searchCustomer, setSearchCustomer] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchAddresses = async (id: string) => {
    try {
      const response = await fetch(`${apiPath}/customer/address/${id}`);
      const data = await response.json();
      if (data.success && data.address) {
        setValue(`load.postcode`, data.address.postcode || '');
        setValue(`load.houseNumber`, data.address.houseNumber || '');
        setValue(`load.street`, data.address.street || '');
        setValue(`load.addition`, data.address.addition || '');
        setValue(`load.city`, data.address.city || '');
        setValue(`load.country`, data.address.country || '');
        setValue(`load.typeOfProperty`, data.address.typeOfProperty || '');
        setValue(`load.floor`, data.address.floor || '');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };


  useEffect(() => {
  if (
    
    customerid &&
    customers.length > 0
  ) {
    setCustomerMode("existing");
    handleCustomerSelect(customerid);
  }
  
}, [customers, customerid]);


  useEffect(() => {


    const fetchCustomers = async () => {
      try {
        const response = await fetch(apiPath + '/customer/customerList');
        const data = await response.json();
        setCustomers(data.customers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const readOnly = customerMode === 'existing';

  const handleCustomerSelect = (id: string) => {
    const customer = customers.find((item: any) => item._id === id);

    if (customer) {
      if (customer.address && customer.address.length > 0) {
        fetchAddresses(customer.address[0]?._id);
      }
      setSelectedCustomer(customer);
      setValue(`${type}.customerId`, customer._id || '');
      setValue(`${type}.typeOfCustomer`, customer.typeOfCustomer || '');
      setValue(`${type}.gender`, customer.gender || '');
      setValue(`${type}.salutation`, customer.salutation || '');
      setValue(`${type}.taal`, customer.taal || '');
      setValue(`${type}.firstName`, customer.firstName || '');
      setValue(`${type}.lastName`, customer.lastName || '');
      setValue(`${type}.email`, customer.email || '');
      setValue(`${type}.mobile`, customer.mobile || '');
      setValue(`${type}.contact`, customer.contact || '');
      setValue(`${type}.findUs`, customer.findUs || '');
    } else {
      setSelectedCustomer(null);
      setValue(`${type}.typeOfCustomer`, '');
      setValue(`${type}.gender`, '');
      setValue(`${type}.salutation`, '');
      setValue(`${type}.taal`, '');
      setValue(`${type}.firstName`, '');
      setValue(`${type}.lastName`, '');
      setValue(`${type}.email`, '');
      setValue(`${type}.mobile`, '');
      setValue(`${type}.contact`, '');
      setValue(`${type}.findUs`, '');
    }
  };

  return (
    <div className="p-10 w-full">
      {/* Customer Type Selection */}
      {!customerMode && (
        <div className="bg-white rounded-[30px] shadow-lg p-8 lg:min-h-[400px] ">
          <h2 className="text-2xl font-semibold mb-5 text-center">
            Select Customer Type
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div
              onClick={() => {
                handleCustomerSelect('');
                setCustomerMode('new');
              }}
              className="group cursor-pointer bg-gradient-to-br from-sky-50 to-white rounded-[28px] p-8  hover:shadow-2xl transition duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue text-white flex items-center justify-center mx-auto shadow-lg">
                <PersonAddAlt1Icon style={{ fontSize: 34 }} />
              </div>

              <h3 className="text-2xl font-bold text-center mt-5">
                New Customer
              </h3>
            </div>

            <div
              onClick={() => {
                handleCustomerSelect('');
                setCustomerMode('existing');
              }}
              className="group cursor-pointer bg-gradient-to-br from-green-50 to-white rounded-[28px] p-8 border border-green-100 hover:shadow-2xl transition duration-300 hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-600 text-white flex items-center justify-center mx-auto shadow-lg">
                <ManageAccountsIcon style={{ fontSize: 34 }} />
              </div>

              <h3 className="text-2xl font-bold text-center mt-5">
                Existing Customer
              </h3>
            </div>
          </div>
        </div>
      )}

      {customerMode === 'existing' && !selectedCustomer && (
        <div className="mb-6 relative">
          <div className="flex items-center justify-between ">
            <button
              type="button"
              onClick={() => setCustomerMode(null)}
              className="mb-4 text-blue font-medium"
            >
              ← Back
            </button>

            <label className="block text-lg font-medium mb-2">
              Select Existing Customer
            </label>
          </div>

          <input
            type="text"
            placeholder="Search customer..."
            value={searchCustomer}
            onChange={(e) => {
              setSearchCustomer(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
          />

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 right-0 bg-white border border-gray shadow-lg rounded mt-1 max-h-72 overflow-auto z-50">
              {(searchCustomer
                ? customers.filter(
                    (customer: any) =>
                      `${customer.firstName} ${customer.lastName}`
                        .toLowerCase()
                        .includes(searchCustomer.toLowerCase()) ||
                      customer.email
                        ?.toLowerCase()
                        .includes(searchCustomer.toLowerCase()) ||
                      customer.mobile?.includes(searchCustomer),
                  )
                : customers
              ).map((customer: any) => (
                <div
                  key={customer._id}
                  onClick={() => {
                    handleCustomerSelect(customer._id);

                    setSearchCustomer(
                      `${customer.firstName} ${customer.lastName}`,
                    );

                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray cursor-pointer border-2 border-b border-gray"
                >
                  <p className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </p>

                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              ))}

              {(searchCustomer
                ? customers.filter(
                    (customer: any) =>
                      `${customer.firstName} ${customer.lastName}`
                        .toLowerCase()
                        .includes(searchCustomer.toLowerCase()) ||
                      customer.email
                        ?.toLowerCase()
                        .includes(searchCustomer.toLowerCase()) ||
                      customer.mobile?.includes(searchCustomer),
                  )
                : customers
              ).length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  No customer found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Show Form */}
      {(customerMode === 'new' || selectedCustomer) && (
        <>
          <button
            type="button"
            onClick={() => {
              setCustomerMode(null);
              setSelectedCustomer(null);
            }}
            className="mb-4 text-blue font-medium"
          >
            ← Change Customer Type
          </button>

          {/* Customer Type */}
          <div className="mb-4">
            <label
              htmlFor="typeOfCustomer"
              className="block text-lg font-medium"
            >
              Customer type*
            </label>

            <select
              disabled={readOnly}
              {...register(`${type}.typeOfCustomer`, {
                required: 'Customer type is required.',
              })}
              id="typeOfCustomer"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="">Select Customer Type</option>
              <option value="Individual">Individual</option>
              <option value="Commerical">Commerical</option>
            </select>

            {errors[type]?.typeOfCustomer && (
              <p className="text-red-600 text-sm mt-1">
                {errors[type].typeOfCustomer?.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label htmlFor="gender" className="block text-lg font-medium">
              Gender*
            </label>

            <select
              disabled={readOnly}
              {...register(`${type}.gender`, {
                required: 'Gender is required.',
              })}
              id="gender"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Salutation */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Salutation</label>

            <select
              disabled={readOnly}
              {...register(`${type}.salutation`)}
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="">Select Salutation</option>
              <option value="Mr">Mr.</option>
              <option value="Ms">Ms.</option>
              <option value="Mrs">Mrs.</option>
            </select>
          </div>

          {/* Language */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Language*</label>

            <select
              disabled={readOnly}
              {...register(`${type}.taal`)}
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
            >
              <option value="">Select Language</option>
              <option value="Dutch">Dutch</option>
              <option value="English">English</option>
              <option value="German">German</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-lg font-medium">First name*</label>

            <input
              readOnly={readOnly}
              {...register(`${type}.firstName`, {
                required: 'First name is required.',
              })}
              type="text"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none"
            />
          </div>

          {/* Surname */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Surname*</label>

            <input
              readOnly={readOnly}
              {...register(`${type}.lastName`, {
                required: 'Surname is required.',
              })}
              type="text"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Email address*</label>

            <input
              readOnly={readOnly}
              {...register(`${type}.email`)}
              type="email"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none"
            />
          </div>

          {/* Mobile */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Mobile</label>

            <input
              readOnly={readOnly}
              {...register(`${type}.mobile`)}
              type="text"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none"
            />
          </div>

          {/* Telephone */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Telephone</label>

            <input
              readOnly={readOnly}
              {...register(`${type}.contact`)}
              type="text"
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none"
            />
          </div>

          {/* Find Us */}
          <div className="mb-4">
            <label className="block text-lg font-medium">
              How did you find us?*
            </label>

            <select
              disabled={readOnly}
              {...register(`${type}.findUs`)}
              className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none"
            >
              <option value="">Select Option</option>
              <option value="social_media">Social Media</option>
              <option value="Google">Google</option>
              <option value="Friend">Friend</option>
              <option value="Website">Website</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerForm;
