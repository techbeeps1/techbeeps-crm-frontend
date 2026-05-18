import React from "react";
import { useFormContext } from "react-hook-form";

const CustomerForm: React.FC<any> = ({ type }) => {
  const { register, formState: { errors } } = useFormContext() as any;

  return (
    <div className="p-10 w-full">
      <div className="mb-4">
        <label htmlFor="typeOfCustomer" className="block text-lg font-medium">
          Customer type*
        </label>
        <select
          {...register(`${type}.typeOfCustomer`, { required: "Customer type is required." })}
          id="typeOfCustomer"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value="">Select Customer Type</option>
          <option value="Individual">Individual</option>
          <option value="Commerical">Commerical</option>
        </select>
        {errors[type]?.typeOfCustomer && (
          <p className="text-red-600 text-sm mt-1">{errors[type].typeOfCustomer?.message}</p>
        )}
      </div>

      {/* Gender */}
      <div className="mb-4">
        <label htmlFor="gender" className="block text-lg font-medium">
          Gender*
        </label>
        <select
          {...register(`${type}.gender`, { required: "Gender is required." })}
          id="gender"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value="">Select Gender</option>
          <option value="male">Man</option>
          <option value="female">Female</option>
          <option value="other">Other</option>

        </select>
        {errors[type]?.gender && (
          <p className="text-red-600 text-sm mt-1">{errors[type].gender?.message}</p>
        )}
      </div>

      {/* Salutation */}
      <div className="mb-4">
        <label htmlFor="salutation" className="block text-lg font-medium">
          Salutation
        </label>
        <select
          {...register(`${type}.salutation`)}
          id="salutation"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value="">Select Salutation</option>
          <option value="Mr">Mr.</option>
          <option value="Ms">Ms.</option>
          <option value="Mrs">Mrs.</option>
          <option value="Medam">Medam</option>
        </select>
      </div>

      {/* Language */}
      <div className="mb-4">
        <label htmlFor="taal" className="block text-lg font-medium">
          Language*
        </label>
        <select
          {...register(`${type}.taal`, { required: "Language is required." })}
          id="taal"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value="">Select Language</option>
          <option value="Dutch">Dutch</option>
          <option value="English">English</option>
          <option value="German">German</option>
          <option value="French">French</option>
        </select>
        {errors[type]?.taal && (
          <p className="text-red-600 text-sm mt-1">{errors[type].taal?.message}</p>
        )}
      </div>

      {/* How did you find us? */}
      <div className="mb-4">
        <label htmlFor="findUs" className="block text-lg font-medium">
          How did you find us?*
        </label>
        <select
          {...register(`${type}.findUs`, { required: "This field is required." })}
          id="findUs"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        >
          <option value="">Select Option</option>
          <option value="social_media">Social Media</option>
          <option value="Google">Google</option>
          <option value="Friend">Friend</option>
          <option value="Website">Website</option>
          <option value="Other">Other</option>
        </select>
        {errors[type]?.findUs && (
          <p className="text-red-600 text-sm mt-1">{errors[type].findUs?.message}</p>
        )}
      </div>

      {/* First Name */}
      <div className="mb-4">
        <label htmlFor="firstName" className="block text-lg font-medium">
          First name*
        </label>
        <input
          {...register(`${type}.firstName`, { required: "First name is required." })}
          type="text"
          id="firstName"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        />
        {errors[type]?.firstName && (
          <p className="text-red-600 text-sm mt-1">{errors[type].firstName?.message}</p>
        )}
      </div>

      {/* Surname */}
      <div className="mb-4">
        <label htmlFor="surname" className="block text-lg font-medium">
          Surname*
        </label>
        <input
          {...register(`${type}.lastName`, { required: "Surname is required." })}
          type="text"
          id="surname"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        />
        {errors[type]?.lastName && (
          <p className="text-red-600 text-sm mt-1">{errors[type].lastName?.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-lg font-medium">
          Email address*
        </label>
        <input
          {...register(`${type}.email`, {
            required: "Email is required.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Enter a valid email address.",
            },
          })}
          type="email"
          id="email"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        />
        {errors[type]?.email && (
          <p className="text-red-600 text-sm mt-1">{errors[type].email?.message}</p>
        )}
      </div>

      {/* Telephone */}
      <div className="mb-4">
        <label htmlFor="contact" className="block text-lg font-medium">
          Telephone*
        </label>
        <input
          {...register(`${type}.contact`, {
            required: "Telephone is required.",
            pattern: {
              value: /^[+]?[0-9]+$/,
              message: "Enter a valid phone number.",
            },
          })}
          type="text"
          id="contact"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        />
        {errors[type]?.contact && (
          <p className="text-red-600 text-sm mt-1">{errors[type].contact?.message}</p>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="mobile" className="block text-lg font-medium">
          Mobile*
        </label>
        <input
          {...register(`${type}.mobile`, {
            required: "mobile is required.",
            pattern: {
              value: /^[+]?[0-9]+$/,
              message: "Enter a valid phone number.",
            },
          })}
          type="text"
          id="mobile"
          className="mt-1 font-medium block w-full px-4 py-2 border border-gray shadow focus:outline-none focus:ring-2 focus:ring-blue"
        />
        {errors[type]?.mobile && (
          <p className="text-red-600 text-sm mt-1">{errors[type].mobile?.message}</p>
        )}
      </div>
    </div>
  );
};

export default CustomerForm;
