import React from 'react';
import { useForm } from 'react-hook-form';

const MoneyFormatSettings = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="">
      <h2 className="text-2xl font-semibold mb-4">Currency Settings</h2>
      <h3 className="text-lg font-medium mb-2">Default Currency</h3>
      <p className="text-sm text-gray-600 mb-4">Select Default Currency</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">* Currency:</label>
          <select
            {...register('currency', { required: true })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a currency</option>
            <option value="USD">US $ (US Dollar)</option>
            <option value="EUR">€ (Euro)</option>
            <option value="GBP">£ (British Pound)</option>
          </select>
          {errors.currency && <span className="text-red-500 text-sm">This field is required</span>}
        </div>

        <button type="submit" className="mt-4 px-4 py-2 bg-blue text-white rounded-md">Save</button>
      </form>
    </div>
  );
};

export default MoneyFormatSettings;
