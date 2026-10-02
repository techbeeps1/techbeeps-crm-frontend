import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { isValidPhoneNumber } from '../../../utils/phoneUtil';

const CustomerForm: React.FC<any> = ({ type, customerid }) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useFormContext() as any;

  const [customerMode, setCustomerMode] = useState<'new' | 'existing' | null>(
    null,
  );

  const [searchCustomer, setSearchCustomer] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [initialLockedFields, setInitialLockedFields] = useState<Record<string, boolean>>({});

  // Helper to calculate which fields already had data when customer was loaded from DB
  const computeInitialLockedFields = (cust: any) => {
    if (!cust || typeof cust !== 'object') return {};
    const locked: Record<string, boolean> = {};
    [
      'typeOfCustomer',
      'companyName',
      'gender',
      'salutation',
      'taal',
      'firstName',
      'lastName',
      'email',
      'mobile',
      'contact',
      'findUs',
    ].forEach((field) => {
      const val = cust[field];
      if (val !== undefined && val !== null && String(val).trim().length > 0) {
        locked[field] = true;
      }
    });
    return locked;
  };

  // Helper: A field is locked ONLY IF customer is existing and was already in DB initially
  const isFieldLocked = (fieldName: string) => {
    if (customerMode === 'new') return false;
    return Boolean(initialLockedFields[fieldName]);
  };

  const getFieldStyle = (fieldName: string, isSelect = false) => {
    const locked = isFieldLocked(fieldName);
    if (!locked) {
      return { backgroundColor: '#ffffff', color: '#1e293b' };
    }
    return {
      backgroundColor: '#e2e8f0', // Thoda gray color
      color: '#475569',
      cursor: 'not-allowed',
      ...(isSelect ? { pointerEvents: 'none' as const } : {}),
    };
  };

  const getWrapperStyle = (fieldName: string) => {
    return isFieldLocked(fieldName) ? { cursor: 'not-allowed' } : {};
  };

  const fetchAddresses = async (id: string) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${apiPath}/customer/address/${id}`, { headers });
      const data = response.data;
      if (data && data.success && data.address) {
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

  // Safe auto-detection of existing customer data from form context without infinite loops
  useEffect(() => {
    const cust = getValues ? getValues(type) : null;
    if (cust && (cust._id || cust.firstName || cust.email)) {
      setCustomerMode((prev) => prev || 'existing');
      setSelectedCustomer((prev: any) => prev || cust);
      setInitialLockedFields((prev) => (Object.keys(prev).length > 0 ? prev : computeInitialLockedFields(cust)));
    }
  }, []);

  useEffect(() => {
    if (!customerid) return;
    const safeCustomers = Array.isArray(customers) ? customers : [];
    const found = safeCustomers.find((item: any) => item._id === customerid);
    if (found) {
      setCustomerMode('existing');
      handleCustomerSelect(found);
    } else {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      axios
        .post(`${apiPath}/customer/customerdetial`, { id: customerid }, { headers })
        .then((res) => {
          if (res.data?.customer) {
            setCustomerMode('existing');
            handleCustomerSelect(res.data.customer);
          }
        })
        .catch((err) => console.error('Error fetching customer for CustomerForm:', err));
    }
  }, [customerid, customers.length]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiPath}/customer/customerList`, { headers });
        const list = response.data?.customers || response.data || [];
        setCustomers(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerSelect = (target: any) => {
    const id = typeof target === 'string' ? target : target?._id;
    const safeCustomers = Array.isArray(customers) ? customers : [];
    let customer = id ? safeCustomers.find((item: any) => item._id === id) : null;
    if (!customer && typeof target === 'object' && target !== null) {
      customer = target;
    }

    if (customer) {
      setInitialLockedFields(computeInitialLockedFields(customer));
      if (customer.address && customer.address.length > 0) {
        const addrId = typeof customer.address[0] === 'string' ? customer.address[0] : customer.address[0]?._id;
        if (addrId) {
          fetchAddresses(addrId);
        } else if (customer.address[0]?.postcode || customer.address[0]?.city) {
          const addr = customer.address[0];
          setValue(`load.postcode`, addr.postcode || '');
          setValue(`load.houseNumber`, addr.houseNumber || '');
          setValue(`load.street`, addr.street || '');
          setValue(`load.addition`, addr.addition || '');
          setValue(`load.city`, addr.city || '');
          setValue(`load.country`, addr.country || '');
          setValue(`load.typeOfProperty`, addr.typeOfProperty || '');
          setValue(`load.floor`, addr.floor || '');
        }
      }
      setSelectedCustomer(customer);
      setValue(`${type}._id`, customer._id || '');
      setValue(`${type}.customerId`, customer._id || '');
      setValue(`${type}.typeOfCustomer`, customer.typeOfCustomer || '');
      setValue(`${type}.companyName`, customer.companyName || '');
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
      setInitialLockedFields({});
      setValue(`${type}._id`, '');
      setValue(`${type}.customerId`, '');
      setValue(`${type}.typeOfCustomer`, '');
      setValue(`${type}.companyName`, '');
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
              <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-lg">
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
              {(() => {
                const safeCustomers = Array.isArray(customers) ? customers : [];
                const filtered = searchCustomer
                  ? safeCustomers.filter(
                      (customer: any) =>
                        `${customer.firstName || ''} ${customer.lastName || ''}`
                          .toLowerCase()
                          .includes(searchCustomer.toLowerCase()) ||
                        customer.email
                          ?.toLowerCase()
                          .includes(searchCustomer.toLowerCase()) ||
                        customer.mobile?.includes(searchCustomer),
                    )
                  : safeCustomers;

                if (filtered.length === 0) {
                  return (
                    <div className="p-4 text-center text-gray-500">
                      No customer found
                    </div>
                  );
                }

                return filtered.map((customer: any) => (
                  <div
                    key={customer._id}
                    onClick={() => {
                      handleCustomerSelect(customer._id);
                      setSearchCustomer(
                        `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
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
                ));
              })()}
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
              setInitialLockedFields({});
            }}
            className="mb-4 text-blue font-medium cursor-pointer"
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

            <div style={getWrapperStyle('typeOfCustomer')} className={isFieldLocked('typeOfCustomer') ? 'cursor-not-allowed' : ''}>
              <select
                {...register(`${type}.typeOfCustomer`, {
                  required: 'Customer type is required.',
                })}
                id="typeOfCustomer"
                tabIndex={isFieldLocked('typeOfCustomer') ? -1 : 0}
                style={getFieldStyle('typeOfCustomer', true)}
                className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none focus:ring-2 focus:ring-blue ${isFieldLocked('typeOfCustomer') ? 'cursor-not-allowed pointer-events-none select-none' : ''}`}
              >
                <option value="">Select Customer Type</option>
                <option value="Individual">Individual</option>
                <option value="Commercial">Commercial</option>
                {watch(`${type}.typeOfCustomer`) === 'Commerical' && (
                  <option value="Commerical" style={{ display: 'none' }}>Commercial</option>
                )}
              </select>
            </div>

            {errors[type]?.typeOfCustomer && (
              <p className="text-red-600 text-sm mt-1">
                {errors[type].typeOfCustomer?.message}
              </p>
            )}
          </div>

          {/* Company Name (for Commercial customer type) */}
          {(watch(`${type}.typeOfCustomer`) === 'Commerical' || watch(`${type}.typeOfCustomer`) === 'Commercial') && (
            <div className="mb-4">
              <label className="block text-lg font-medium">Company Name*</label>
              <input
                readOnly={isFieldLocked('companyName')}
                {...register(`${type}.companyName`, {
                  required: (watch(`${type}.typeOfCustomer`) === 'Commerical' || watch(`${type}.typeOfCustomer`) === 'Commercial') ? 'Company name is required for commercial customers.' : false,
                  validate: (value) => {
                    if (watch(`${type}.typeOfCustomer`) === 'Commerical' || watch(`${type}.typeOfCustomer`) === 'Commercial') {
                      return (typeof value === 'string' && value.trim().length > 0) || 'Company name cannot be blank or spaces only.';
                    }
                    return true;
                  },
                })}
                type="text"
                placeholder="e.g. Acme Corp B.V."
                style={getFieldStyle('companyName')}
                className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none ${isFieldLocked('companyName') ? 'cursor-not-allowed select-none' : ''}`}
              />
              {errors[type]?.companyName && (
                <p className="text-red-600 text-sm mt-1">{errors[type].companyName?.message}</p>
              )}
            </div>
          )}

          {/* Gender (Optional as per business policy) */}
          <div className="mb-4">
            <label htmlFor="gender" className="block text-lg font-medium">
              Gender
            </label>

            <div style={getWrapperStyle('gender')} className={isFieldLocked('gender') ? 'cursor-not-allowed' : ''}>
              <select
                {...register(`${type}.gender`)}
                id="gender"
                tabIndex={isFieldLocked('gender') ? -1 : 0}
                style={getFieldStyle('gender', true)}
                className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none focus:ring-2 focus:ring-blue ${isFieldLocked('gender') ? 'cursor-not-allowed pointer-events-none select-none' : ''}`}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Salutation */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Salutation</label>

            <div style={getWrapperStyle('salutation')} className={isFieldLocked('salutation') ? 'cursor-not-allowed' : ''}>
              <select
                {...register(`${type}.salutation`)}
                tabIndex={isFieldLocked('salutation') ? -1 : 0}
                style={getFieldStyle('salutation', true)}
                className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none focus:ring-2 focus:ring-blue ${isFieldLocked('salutation') ? 'cursor-not-allowed pointer-events-none select-none' : ''}`}
              >
                <option value="">Select Salutation</option>
                <option value="Mr">Mr.</option>
                <option value="Ms">Ms.</option>
                <option value="Mrs">Mrs.</option>
              </select>
            </div>
          </div>

          {/* Language (Optional) */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Language</label>

            <div style={getWrapperStyle('taal')} className={isFieldLocked('taal') ? 'cursor-not-allowed' : ''}>
              <select
                {...register(`${type}.taal`)}
                tabIndex={isFieldLocked('taal') ? -1 : 0}
                style={getFieldStyle('taal', true)}
                className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none focus:ring-2 focus:ring-blue ${isFieldLocked('taal') ? 'cursor-not-allowed pointer-events-none select-none' : ''}`}
              >
                <option value="">Select Language</option>
                <option value="Dutch">Dutch</option>
                <option value="English">English</option>
                <option value="German">German</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>

          {/* First Name */}
          <div className="mb-4">
            <label className="block text-lg font-medium">First name*</label>

            <input
              readOnly={isFieldLocked('firstName')}
              {...register(`${type}.firstName`, {
                required: 'First name is required.',
                validate: (value) => (typeof value === 'string' && value.trim().length > 0) || 'First name cannot be blank or spaces only.',
              })}
              type="text"
              style={getFieldStyle('firstName')}
              className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none ${isFieldLocked('firstName') ? 'cursor-not-allowed select-none' : ''}`}
            />
            {errors[type]?.firstName && (
              <p className="text-red-600 text-sm mt-1">{errors[type].firstName?.message}</p>
            )}
          </div>

          {/* Surname */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Surname*</label>

            <input
              readOnly={isFieldLocked('lastName')}
              {...register(`${type}.lastName`, {
                required: 'Surname is required.',
                validate: (value) => (typeof value === 'string' && value.trim().length > 0) || 'Surname cannot be blank or spaces only.',
              })}
              type="text"
              style={getFieldStyle('lastName')}
              className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none ${isFieldLocked('lastName') ? 'cursor-not-allowed select-none' : ''}`}
            />
            {errors[type]?.lastName && (
              <p className="text-red-600 text-sm mt-1">{errors[type].lastName?.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Email address*</label>

            <input
              readOnly={isFieldLocked('email')}
              {...register(`${type}.email`, {
                required: 'Email address is required.',
                validate: (value) => (typeof value === 'string' && value.trim().length > 0) || 'Email address cannot be blank.',
              })}
              type="email"
              style={getFieldStyle('email')}
              className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none ${isFieldLocked('email') ? 'cursor-not-allowed select-none' : ''}`}
            />
            {errors[type]?.email && (
              <p className="text-red-600 text-sm mt-1">{errors[type].email?.message}</p>
            )}
          </div>

          {/* Mobile */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Mobile</label>

            <input
              readOnly={isFieldLocked('mobile')}
              {...register(`${type}.mobile`, {
                validate: (value) => {
                  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                    return true; // Optional on intake unless entered
                  }
                  return (
                    isValidPhoneNumber(value) ||
                    'Please enter a valid mobile number (e.g. 06 12345678 or +31 6 12345678).'
                  );
                },
              })}
              type="text"
              placeholder="e.g. 06 12345678 or +31 6 12345678"
              style={getFieldStyle('mobile')}
              className={`mt-1 font-medium block w-full px-4 py-2 border ${errors[type]?.mobile ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} shadow focus:outline-none ${isFieldLocked('mobile') ? 'cursor-not-allowed select-none' : ''}`}
            />
            {errors[type]?.mobile && (
              <p className="text-red-600 text-sm mt-1">{errors[type].mobile?.message}</p>
            )}
          </div>

          {/* Telephone */}
          <div className="mb-4">
            <label className="block text-lg font-medium">Telephone</label>

            <input
              readOnly={isFieldLocked('contact')}
              {...register(`${type}.contact`, {
                validate: (value) => {
                  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
                    return true; // Optional empty telephone does not block
                  }
                  return (
                    isValidPhoneNumber(value) ||
                    'Please enter a valid telephone number (e.g. 010 1234567 or +31 10 1234567).'
                  );
                },
              })}
              type="text"
              placeholder="e.g. 010 1234567 or +31 10 1234567"
              style={getFieldStyle('contact')}
              className={`mt-1 font-medium block w-full px-4 py-2 border ${errors[type]?.contact ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'} shadow focus:outline-none ${isFieldLocked('contact') ? 'cursor-not-allowed select-none' : ''}`}
            />
            {errors[type]?.contact && (
              <p className="text-red-600 text-sm mt-1">{errors[type].contact?.message}</p>
            )}
          </div>

          {/* Find Us (Optional) */}
          <div className="mb-4">
            <label className="block text-lg font-medium">
              How did you find us?
            </label>

            <div style={getWrapperStyle('findUs')} className={isFieldLocked('findUs') ? 'cursor-not-allowed' : ''}>
              <select
                {...register(`${type}.findUs`)}
                tabIndex={isFieldLocked('findUs') ? -1 : 0}
                style={getFieldStyle('findUs', true)}
                className={`mt-1 font-medium block w-full px-4 py-2 border border-slate-300 shadow focus:outline-none ${isFieldLocked('findUs') ? 'cursor-not-allowed pointer-events-none select-none' : ''}`}
              >
                <option value="">Select Option</option>
                <option value="social_media">Social Media</option>
                <option value="Google">Google</option>
                <option value="Friend">Friend</option>
                <option value="Website">Website</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerForm;
