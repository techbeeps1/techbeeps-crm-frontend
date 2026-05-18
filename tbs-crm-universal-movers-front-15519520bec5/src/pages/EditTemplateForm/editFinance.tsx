import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {apiPath} from '../../../apiPath';
import useClickOutside from '../../clickoutsider/clickOutside';

function EditFinance({
  financeData,
  handleEditSubmit,
  handleCloseEditForm,
}: any) {
  const [editedData, setEditedData] = useState(financeData || {});
  const [customers, setCustomers] = useState([] as any);
  const [currentPage] = useState(1);
  const pageSize = 20; // Set the page size

  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(modalRef, () => {
    handleCloseEditForm([] as any);
  });

  useEffect(() => {
    // Make an API request to fetch customer data when the component mounts
    axios
      .get(
        `${apiPath}/customer/customerList?page=${currentPage}&pageSize=${pageSize}`,
      )
      .then((response) => {
        setCustomers(response.data.customers);
      })
      .catch((error) => {
        console.error('Error fetching customer data:', error);
      });
  }, []);

  useEffect(() => {
    if (financeData) {
      setEditedData(financeData);
    }
  }, [financeData]);

  // Define the handleFieldChange function to update the edited data
  const handleFieldChange = (fieldName: any, value: any) => {
    const updatedData = { ...editedData, [fieldName]: value };

    // Update the state with the updated data
    setEditedData(updatedData);
  };

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Call the parent component's handleEditSubmit function with the updated data
    handleEditSubmit(editedData);
  };
  return (
    <>
      <div className="fixed inset-0 bg-black opacity-80"></div>
      <div className="inset-0 flex items-center justify-center z-50 h-80">
        <div
          className=" bg-white p-4 rounded-lg shadow-lg overflow-auto h-125 w-3/5 sm:w-3/5 lg:w-4/5"ref={modalRef}>
          <button
            className="bg-blue-200 text-black active:bg-gray-500 
            font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
            onClick={() => {
              handleCloseEditForm();
            }}
          >
            &times; Close
          </button>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Reject quotation {editedData.quotationNumber || ''} and create a
                new version
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
              <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Road
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="rode"
                      value={editedData.rode || ''}
                      onChange={(e) =>
                        handleFieldChange('rode', e.target.value)
                      }
                    >
                      <option value=""> Select </option>
                      <option value="No reason"> No reason </option>
                      <option value="Adjustement to quotation"> Adjustement to quotation </option>
                      <option value="Too expensive"> Too expensive </option>
                      <option value="Date is not convenient"> Date is not convenient </option>
                      <option value=" Will arrange it yourself"> Will arrange it yourself </option>
                      <option value="Competitor chosen"> Competitor chosen </option>
                      <option value="No reaction"> No reaction </option>
                    </select>
                  </div>
                </div>

                <div className="mb-4.5">
                  <input
                    type="checkbox"
                    placeholder="Refference.."
                  /> &nbsp; Cancel job and delete appointments
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Customer
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="customer"
                      value={editedData.customer || ''}
                      onChange={(e) =>
                        handleFieldChange('customer', e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select Customer
                      </option>
                      {customers.map((customer: any) => (
                        <option key={customer._id} value={customer._id}>
                          {customer.firstName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Quotation contact person
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="contactPerson"
                      value={editedData.contactPerson || ''}
                      onChange={(e) =>
                        handleFieldChange('contactPerson', e.target.value)
                      }
                    >
                      {' '}
                      <option value="" disabled>
                        Select contact
                      </option>
                      {customers.map((customer: any) => (
                        <option key={customer._id} value={customer.firstName}>
                          {customer.firstName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Quotation address
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="address"
                      value={editedData.address || ''}
                      onChange={(e) =>
                        handleFieldChange('address', e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select Address
                      </option>
                      {customers.map((customer: any) => (
                        <option
                          key={customer._id}
                          value={customer.selectedCountry}
                        >
                          {customer.city}, {customer.selectedCountry}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Financial Template
                  </label>
                  <div className="relative z-20 bg-transparent dark:bg-form-input">
                    <select
                      className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      value={editedData.financialTemplate || ''}
                      name="financialTemplate"
                      onChange={(e) =>
                        handleFieldChange('financialTemplate', e.target.value)
                      }
                    >
                      <option value="">Select template</option>
                      <option value="Fixed price offer">
                        Fixed price offer
                      </option>
                      <option value="Fixed price full template">
                        Fixed price full template
                      </option>
                    </select>
                  </div>
                </div>
                <div className="mb-4.5">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Refference
                  </label>
                  <input
                    type="text"
                    placeholder="Refference.."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    name="refferance"
                    value={editedData.refferance || ''}
                    onChange={(e) =>
                      handleFieldChange('refferance', e.target.value)
                    }
                  />
                </div>

                <div className="w-100 p-4">
                  <label
                    htmlFor="input2"
                    className="block mb-2 text-gray-600 dark:text-white"
                  >
                    Moving hours
                  </label>
                  <input
                    type="number"
                    id="input2"
                    className="w-35 sm:w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter hours"
                    name="movingHours"
                    value={editedData.movingHours || ''}
                    onChange={(e) =>
                      handleFieldChange('movingHours', e.target.value)
                    }
                  />
                </div>
                <span className="ml-4">
                  Does the price include or exclude VAT?
                </span>
                <div className="container mb-5 ml-4">
                  <Link
                    to="#"
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-primary py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
                  >
                    <span>
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                          fill=""
                        />
                        <path
                          d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                          fill=""
                        />
                        <path
                          d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                          fill=""
                        />
                      </svg>
                    </span>
                    Including VAT
                  </Link>

                  <Link
                    to="#"
                    className="inline-flex items-center justify-center gap-2.5 rounded-md bg-meta-3 py-4 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10 ml-0 sm:ml-10"
                  >
                    <span>
                      <svg
                        className="fill-current"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18.0758 0.849976H16.0695C15.819 0.851233 15.5774 0.942521 15.3886 1.10717C15.1999 1.27183 15.0766 1.49887 15.0414 1.74685L14.4789 5.80935H13.3976V3.4031C13.3952 3.1654 13.3002 2.93802 13.1327 2.76935C12.9652 2.60068 12.7384 2.50403 12.5008 2.49998H10.082C10.0553 2.27763 9.94981 2.07221 9.78472 1.92089C9.61964 1.76956 9.40584 1.68233 9.18202 1.67498H6.45389C6.32885 1.67815 6.20571 1.70632 6.09172 1.75782C5.97773 1.80932 5.8752 1.8831 5.79017 1.97484C5.70513 2.06657 5.63932 2.17439 5.59659 2.29195C5.55387 2.40951 5.5351 2.53443 5.54139 2.65935V3.32498H3.15077C2.91396 3.32162 2.68544 3.41207 2.51507 3.57659C2.3447 3.7411 2.24632 3.96632 2.24139 4.2031V5.81248C2.0999 5.81539 1.96078 5.84937 1.83387 5.91201C1.70697 5.97466 1.59538 6.06443 1.50702 6.17498C1.41616 6.29094 1.35267 6.42593 1.32128 6.56986C1.2899 6.7138 1.29143 6.86297 1.32577 7.00623C1.32443 7.02182 1.32443 7.0375 1.32577 7.0531L3.23827 12.9375C3.29323 13.1432 3.4153 13.3247 3.58513 13.4532C3.75496 13.5818 3.96282 13.6499 4.17577 13.6468H13.3883C13.7379 13.6464 14.0756 13.5197 14.3391 13.29C14.6027 13.0603 14.7744 12.7431 14.8226 12.3968L16.2508 2.09998H18.0726C18.2384 2.09998 18.3974 2.03413 18.5146 1.91692C18.6318 1.79971 18.6976 1.64074 18.6976 1.47498C18.6976 1.30922 18.6318 1.15024 18.5146 1.03303C18.3974 0.915824 18.2384 0.849976 18.0726 0.849976H18.0758ZM12.1383 5.79373H10.0945V3.74998H12.1476L12.1383 5.79373ZM6.79139 2.9156H8.84452V3.39998V5.7906H6.79139V2.9156ZM3.49139 4.5656H5.54139V5.79373H3.49139V4.5656ZM13.5851 12.225C13.579 12.2727 13.5556 12.3166 13.5193 12.3483C13.4831 12.38 13.4364 12.3972 13.3883 12.3968H4.37577L2.65389 7.04998H14.3039L13.5851 12.225Z"
                          fill=""
                        />
                        <path
                          d="M5.31172 15.1125C4.9118 15.1094 4.51997 15.2252 4.18594 15.4451C3.85191 15.665 3.59073 15.9792 3.43553 16.3478C3.28034 16.7164 3.23813 17.1228 3.31425 17.5154C3.39037 17.908 3.58139 18.2692 3.86309 18.5531C4.14478 18.837 4.50445 19.0308 4.89647 19.11C5.28849 19.1891 5.6952 19.1501 6.06499 18.9978C6.43477 18.8454 6.75099 18.5867 6.97351 18.2544C7.19603 17.9221 7.31483 17.5312 7.31485 17.1312C7.31608 16.8671 7.26522 16.6053 7.16518 16.3608C7.06515 16.1164 6.91789 15.894 6.73184 15.7065C6.5458 15.519 6.3246 15.3701 6.08092 15.2681C5.83725 15.1662 5.57586 15.1133 5.31172 15.1125ZM5.31172 17.9C5.15905 17.9031 5.00891 17.8607 4.88045 17.7781C4.75199 17.6955 4.65103 17.5766 4.59045 17.4364C4.52986 17.2962 4.51239 17.1412 4.54026 16.9911C4.56814 16.8409 4.64009 16.7025 4.74695 16.5934C4.85382 16.4843 4.99075 16.4096 5.14028 16.3786C5.28981 16.3477 5.44518 16.3619 5.58656 16.4196C5.72794 16.4773 5.84894 16.5758 5.93412 16.7026C6.0193 16.8293 6.06481 16.9785 6.06484 17.1312C6.06651 17.3329 5.9882 17.5271 5.84705 17.6712C5.70589 17.8152 5.51341 17.8975 5.31172 17.9Z"
                          fill=""
                        />
                        <path
                          d="M12.9504 15.1125C12.5505 15.1094 12.1586 15.2252 11.8246 15.4451C11.4906 15.665 11.2294 15.9792 11.0742 16.3478C10.919 16.7164 10.8768 17.1228 10.9529 17.5154C11.029 17.908 11.2201 18.2692 11.5018 18.5531C11.7835 18.837 12.1431 19.0308 12.5351 19.11C12.9272 19.1891 13.3339 19.1501 13.7037 18.9978C14.0734 18.8454 14.3897 18.5867 14.6122 18.2544C14.8347 17.9221 14.9535 17.5312 14.9535 17.1312C14.9552 16.598 14.7452 16.086 14.3696 15.7075C13.994 15.329 13.4836 15.115 12.9504 15.1125ZM12.9504 17.9C12.7977 17.9031 12.6476 17.8607 12.5191 17.7781C12.3907 17.6955 12.2897 17.5766 12.2291 17.4364C12.1685 17.2962 12.1511 17.1412 12.1789 16.9911C12.2068 16.8409 12.2788 16.7025 12.3856 16.5934C12.4925 16.4843 12.6294 16.4096 12.779 16.3786C12.9285 16.3477 13.0838 16.3619 13.2252 16.4196C13.3666 16.4773 13.4876 16.5758 13.5728 16.7026C13.658 16.8293 13.7035 16.9785 13.7035 17.1312C13.7052 17.3329 13.6269 17.5271 13.4857 17.6712C13.3446 17.8152 13.1521 17.8975 12.9504 17.9Z"
                          fill=""
                        />
                      </svg>
                    </span>
                    Exclusive of VAT
                  </Link>
                </div>
                {/* {showInputs && ( */}
                <div className="inline-block sm:flex">
                  <div className="w-50 p-4">
                    <label
                      htmlFor="input1"
                      className="block mb-2 text-gray-600 dark:text-white"
                    >
                      Sales Group
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <select
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="salesGroup"
                        value={editedData.salesGroup || ''}
                        onChange={(e) =>
                          handleFieldChange('salesGroup', e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select package
                        </option>
                        <option value="No">No</option>
                        <option value="Management Activities">
                          Management Activities
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="w-100 p-4">
                    <label
                      htmlFor="input2"
                      className="block mb-2 text-gray-600 dark:text-white"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      id="input2"
                      className="w-35 sm:w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Description"
                      name="description"
                      value={editedData.description || ''}
                      onChange={(e) =>
                        handleFieldChange('description', e.target.value)
                      }
                    />
                  </div>
                  <div className="w-35 p-4">
                    <label
                      htmlFor="input2"
                      className="block mb-2 text-gray-600 dark:text-white"
                    >
                      Number
                    </label>
                    <input
                      type="number"
                      id="input2"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="123"
                      name="number"
                      value={editedData.number || ''}
                      onChange={(e) =>
                        handleFieldChange('number', e.target.value)
                      }
                    />
                  </div>
                  <div className="w-25 p-4">
                    <label
                      htmlFor="input2"
                      className="block mb-2 text-gray-600 dark:text-white"
                    >
                      BTW
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <select
                        className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        value={editedData.btw || ''}
                        name="btw"
                        onChange={(e) =>
                          handleFieldChange('btw', e.target.value)
                        }
                      >
                        <option value="" disabled>
                          00
                        </option>
                        <option value="9">9</option>
                        <option value="21">21</option>
                        <option value="0">0</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-30 p-4">
                    <label
                      htmlFor="input2"
                      className="block mb-2 text-gray-600 dark:text-white"
                    >
                      Unit price
                    </label>
                    <input
                      type="number"
                      id="input2"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="00"
                      value={editedData.unitPrice || ''}
                      name="unitPrice"
                      onChange={(e) =>
                        handleFieldChange('unitPrice', e.target.value)
                      }
                    />
                  </div>
                  
                  <div className="w-5 p-4 mt-10">🕙</div>
                  <div className="w-5 p-4 mt-10">✅</div>
                  <div className="w-5 p-4 mt-10">🗑️</div>
                </div>
                {/* // )} */}

                <Link
                  to="#"
                  className="w-full inline-flex items-center justify-center  rounded-full border border-primary py-4 px-10 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10"
                  // onClick={toggleInputs}
                >
                  <span>
                    <svg
                      className="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_182_46495)">
                        <path
                          d="M18.875 11.4375C18.3125 10.8438 17.5625 10.5312 16.75 10.5312C16.125 10.5312 15.5625 10.7188 15.0625 11.0938C15 11.125 14.9688 11.1562 14.9062 11.2188C14.8438 11.1875 14.8125 11.125 14.75 11.0938C14.25 10.7188 13.6875 10.5312 13.0625 10.5312C12.9062 10.5312 12.7812 10.5312 12.6562 10.5625C11.7188 9.5 10.5625 8.75 9.3125 8.40625C10.625 7.75 11.5312 6.40625 11.5312 4.875C11.5312 2.6875 9.75 0.9375 7.59375 0.9375C5.40625 0.9375 3.65625 2.71875 3.65625 4.875C3.65625 6.4375 4.5625 7.78125 5.875 8.40625C4.5625 8.78125 3.40625 9.53125 2.4375 10.6562C1.125 12.2188 0.375 14.4062 0.3125 16.7812C0.3125 17.0312 0.4375 17.25 0.65625 17.3438C1.5 17.75 4.4375 19.0938 7.59375 19.0938C9.28125 19.0938 10.8438 18.8125 10.9062 18.8125C11.25 18.75 11.4688 18.4375 11.4062 18.0938C11.3438 17.75 11.0312 17.5312 10.6875 17.5938C10.6875 17.5938 9.15625 17.875 7.59375 17.875C5.0625 17.8438 2.65625 16.875 1.5625 16.375C1.65625 14.4375 2.3125 12.7187 3.375 11.4375C4.46875 10.125 5.96875 9.40625 7.59375 9.40625C9.03125 9.40625 10.375 10 11.4375 11.0312C11.2812 11.1562 11.125 11.2812 11 11.4062C10.4688 11.9688 10.1875 12.75 10.1875 13.5938C10.1875 14.4375 10.5 15.2188 11.1562 16C11.6875 16.6562 12.4375 17.2812 13.2812 18L13.3125 18.0312C13.5937 18.25 13.9062 18.5312 14.2188 18.8125C14.4062 19 14.6875 19.0938 14.9375 19.0938C15.1875 19.0938 15.4687 19 15.6562 18.8125C16 18.5312 16.3125 18.25 16.5938 18C17.4375 17.2812 18.1875 16.6562 18.7188 16C19.375 15.2188 19.6875 14.4375 19.6875 13.5938C19.6875 12.7812 19.4062 12.0312 18.875 11.4375ZM4.875 4.875C4.875 3.375 6.09375 2.1875 7.5625 2.1875C9.0625 2.1875 10.25 3.40625 10.25 4.875C10.25 6.375 9.03125 7.5625 7.5625 7.5625C6.09375 7.5625 4.875 6.34375 4.875 4.875ZM17.75 15.2188C17.2812 15.7812 16.5938 16.375 15.7812 17.0625C15.5312 17.2812 15.2188 17.5312 14.9062 17.7812C14.625 17.5312 14.3438 17.2812 14.0938 17.0938L14.0625 17.0625C13.25 16.375 12.5625 15.7812 12.0938 15.2188C11.625 14.6562 11.4062 14.1562 11.4062 13.625C11.4062 13.0937 11.5938 12.625 11.9062 12.2812C12.2188 11.9375 12.6563 11.75 13.0938 11.75C13.4375 11.75 13.75 11.8438 14 12.0625C14.125 12.1562 14.2188 12.25 14.3125 12.375C14.5938 12.7188 15.1875 12.7188 15.5 12.375C15.5938 12.25 15.7187 12.1562 15.8125 12.0625C16.0937 11.8438 16.4062 11.75 16.7188 11.75C17.1875 11.75 17.5938 11.9375 17.9062 12.2812C18.2188 12.625 18.4062 13.0937 18.4062 13.625C18.4375 14.1875 18.2188 14.6562 17.75 15.2188Z"
                          fill=""
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_182_46495">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  Add rule
                </Link>
                <div className="inline-block sm:flex">
                  <div className="w-full p-4">
                    <label
                      htmlFor="input1"
                      className="block mb-2 text-gray-600 dark:text-white"
                    >
                      Discount Description
                    </label>
                    <input
                      type="text"
                      id="input1"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="Discount Description"
                      value={editedData.discountDescription || ''}
                      name="discountDescription"
                      onChange={(e) =>
                        handleFieldChange('discountDescription', e.target.value)
                      }
                    />
                  </div>
                  <div className="container mt-4">
                    <div className="mb-3">
                      <label
                        htmlFor="input1"
                        className="block mb-2 text-gray-600 dark:text-white"
                      >
                        Percentage
                      </label>
                      <input
                        type="number"
                        placeholder="%"
                        className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="percentage"
                        value={editedData.discountDescription || ''}
                        onChange={(e) =>
                          handleFieldChange('percentage', e.target.value)
                        }
                      />

                      <input
                        type="number"
                        placeholder="$000"
                        className="w-50 rounded ml-10 border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        // value={searchData.contact}
                        name="contact"
                        // onChange={handleSearchInputChange}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Subtotal"
                        className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        // value={searchData.postcode}
                        name="postcode"
                        // onChange={handleSearchInputChange}
                      />

                      <input
                        type="number"
                        placeholder="0000"
                        className="w-50 ml-10 rounded border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        // value={searchData.clientNumber}
                        name="clientNumber"
                        // onChange={handleSearchInputChange}
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <input
                        type="email"
                        placeholder="Total"
                        className="w-50 rounded border-[1.5px] border-stroke py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        // value={searchData.email}
                        name="email"
                        // onChange={handleSearchInputChange}
                        disabled
                      />

                      <input
                        type="text"
                        placeholder="0000"
                        className="w-50 ml-10 rounded border-[1.5px] border-stroke  py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        // value={searchData.city}
                        name="city"
                        // onChange={handleSearchInputChange}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                <button
                  className="text-red background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                  type="button"
                  onClick={() => handleCloseEditForm()}
                >
                  Close
                </button>
                <button
                  className="text-black bg-yellow-500 active:bg-yellow-700 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditFinance;
