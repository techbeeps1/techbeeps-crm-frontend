import { useEffect, useState } from 'react';
import CountryDropdown from '../CountryDropdown';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { resetForm, setFormField } from '../Redux/formSlice';
import { setSupplierEditedData } from '../Redux/formSlice';

function EditSupplier({
  supplierData,
  handleEditSubmit,
  handleCloseEditForm,
}: any) {
  const supplierForm = 'supplier';
  const dispatch = useDispatch();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    axios
      .get('https://restcountries.com/v3.1/all')
      .then((response: any) => {
        const countryNames = response.data.map(
          (country: any) => country.name.common,
        );
        setCountries(countryNames);
      })
      .catch((error: any) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  useEffect(() => {
    const updateEditedData = async () => {
      if (supplierData) {
         dispatch(setFormField({ formName: supplierForm, field: 'editedData', value: supplierData }));
      }
    };

    updateEditedData();
  }, [dispatch, supplierData, supplierForm]);

  // Use useSelector to get the updated state
  const supplierEditedData = useSelector((state:any) => state.forms[supplierForm]);

  // Log the updated state
  useEffect(() => {
 
    console.log('edited data', supplierEditedData.editedData);
    
  }, [supplierEditedData?.editedData]);


  // Define the handleFieldChange function to update the edited data
  // const handleSupplierFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   dispatch(setFormField({ formName: supplierForm, field: name, value }));
  //   console.log(name, value);
  // };
  
  const handleSupplierFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setSupplierEditedData({ ...supplierEditedData.editedData, [name]: value }));
    console.log(name, value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await handleEditSubmit(supplierEditedData && supplierEditedData.editedData);
      dispatch(resetForm({ formName: supplierForm }));
    } catch (error) {
      // Handle errors (e.g., show an error message to the user)
      console.error('Error during form submission:', error);
    }
  };
  
  

  return (
    <>
    <form onSubmit={handleSubmit}>
            <div className="w-150 mt-3 bg-white">
              <button
                className="bg-blue-200 text-black active:bg-gray-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                onClick={() => {
                  handleCloseEditForm();
                }}
              >
                &times; Close
              </button>

              <button
                className="bg-blue-200 text-black active:bg-gray-500 
      font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                type="submit"
                onClick={handleSubmit}
              >
                save edits
              </button>
              <div className="flex ml-3">
                <div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="company name"
                      className="w-full rounded border-[1.5px] mt-5 border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="companyName"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.companyName) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Website
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <input
                        type="text"
                        placeholder="website"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="website"
                        value={
                          (supplierEditedData && supplierEditedData.editedData && 
                            supplierEditedData.editedData.website) ||
                          ''
                        }
                        onChange={handleSupplierFormChange}
                      />
                    </div>
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      First name
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <input
                        type="text"
                        placeholder="first name"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="fname"
                        value={
                          (supplierEditedData && supplierEditedData.editedData && 
                            supplierEditedData.editedData.fname) ||
                          ''
                        }
                        onChange={handleSupplierFormChange}
                      />
                    </div>
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Infix
                    </label>
                    <input
                      type="text"
                      placeholder="infix"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="infix"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.infix) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Last name
                    </label>
                    <input
                      type="text"
                      placeholder="last name."
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="lname"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.lname) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Purchase price
                    </label>
                    <input
                      type="number"
                      placeholder="purchase price"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="purchase"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.purchase) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      E-mail address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter email."
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="email"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.email) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Telephone
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <input
                        type="text"
                        placeholder="telephone"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="telephone"
                        value={
                          (supplierEditedData && supplierEditedData.editedData && 
                            supplierEditedData.editedData.telephone) ||
                          ''
                        }
                        onChange={handleSupplierFormChange}
                      />
                    </div>
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 block text-black dark:text-white">
                      Mobile
                    </label>
                    <div className="relative z-20 bg-transparent dark:bg-form-input">
                      <input
                        type="text"
                        placeholder="mobile no."
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        name="mobile"
                        value={
                          (supplierEditedData && supplierEditedData.editedData && 
                            supplierEditedData.editedData.mobile) ||
                          ''
                        }
                        onChange={handleSupplierFormChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      Postcode
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your Postcode"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="postCode"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.postCode) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      House number
                    </label>
                    <input
                      type="number"
                      placeholder="Enter your house number"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="houseNumber"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.houseNumber) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      Addition
                    </label>
                    <input
                      type="text"
                      placeholder="Addition"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="addition"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.addition) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      Street
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your Street"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="street"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.street) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>
                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your city"
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      name="city"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.city) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>

                  <div className="w-full xl:w-1/2">
                    <label className="mb-2.5 mt-2 block text-black dark:text-white">
                      Country
                    </label>
                    <CountryDropdown
                      countries={countries}
                      s
                      name="selectedCountry"
                      value={
                        (supplierEditedData && supplierEditedData.editedData && 
                          supplierEditedData.editedData.selectedCountry) ||
                        ''
                      }
                      onChange={handleSupplierFormChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
    </>
  );
}

export default EditSupplier;
