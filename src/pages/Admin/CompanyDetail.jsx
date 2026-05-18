import React, { useEffect,useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';


const CompanySettings = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading,setLoading] = useState(false)

  const notify = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message, {
    autoClose: 2000,
  });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
    setLoading(true);
      try {
        const response = await fetch(`${apiPath}/api/company-details`); // Replace with your actual API endpoint
        const data = await response.json();
        reset(data); // Populate the form with fetched data
      } catch (error) {
        console.error('Error fetching company details:', error);
        notifyError(error.message)
      }finally{
    setLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [reset]);

  const onSubmit = async (data) => {
    const confirmUpdate = window.confirm("Are you sure you want to update your company details?");
    if (confirmUpdate) {
      setLoading(true);
      try {
        const response = await fetch(`${apiPath}/api/company-details`, {
          method: 'POST', // Adjust method based on your API (POST, PUT, PATCH, etc.)
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          notify("Company details updated successfully!");
        } else {
          notifyError("Failed to update company details.");
        }
      } catch (error) {
        console.error("Error updating company details:", error);
        notifyError("An error occurred while updating.");
      }finally{
        setLoading(false);
      }
    }
  };

  return (
    <>
    {loading && <Loader/>}

      <h2 className="text-2xl font-semibold mb-4">Company Settings</h2>
      <p className=" text-gray-600 mb-6">Update Your Company Information</p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap w-full">
        {/* Company Name */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Name:</label>
          <input
            {...register('companyName', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyName && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company Address */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Address:</label>
          <input
            {...register('companyAddress', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyAddress && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company State */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company State:</label>
          <input
            {...register('companyState', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyState && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company Country */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Country:</label>
          <input
            {...register('companyCountry', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyCountry && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company Email */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Email:</label>
          <input
            {...register('companyEmail', { required: true, pattern: /^\S+@\S+$/i })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyEmail && <span className="text-red-500 ">Enter a valid email</span>}
        </div>

        {/* Company Phone */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Phone:</label>
          <input
            {...register('companyPhone', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyPhone && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company Website */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Website:</label>
          <input
            {...register('companyWebsite', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyWebsite && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company Tax Number */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Tax Number:</label>
          <input
            {...register('companyTaxNumber', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyTaxNumber && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company VAT Number */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company VAT Number:</label>
          <input
            {...register('companyVatNumber', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyVatNumber && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Company Registration Number */}
        <div className='w-1/2 p-2'>
          <label className="block  font-medium text-gray-700">Company Reg Number:</label>
          <input
            {...register('companyRegNumber', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray rounded-md"
          />
          {errors.companyRegNumber && <span className="text-red-500 ">This field is required</span>}
        </div>

        {/* Submit Button */}
        <div className="w-full p-2">
          <button type="submit" className="shadow-lg mt-4 px-4 py-2 bg-blue text-lg text-white font-bold rounded-md">
            Save
          </button>
        </div>

      </form>
    </>
  );
};

export default CompanySettings;
