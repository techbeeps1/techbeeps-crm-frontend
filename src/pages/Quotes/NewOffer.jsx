import React, { useContext, useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from 'react-router-dom';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
} from '@mui/material';
import { UserContext } from '../../UserContext';
import DatePickerComponent from '../../common/Datepicker';

const NewOffer = ({ display, job, onclose }) => {
  let { id } = useContext(UserContext);
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type');
  const [packageList, setPackage] = useState([]);
  const [templateList, setTemplate] = useState([]);
  const [vatSelected, setVatSelected] = useState('exclusive');
  const [salesgroup, setSales] = useState([]);
  const [inputField, setInputFields] = useState([]);

  const handleVatSelect = (type) => {
    setVatSelected(type);
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      items: [
        { salesgroup: '', description: '', quantity: 1, btw: '', price: 0 },
      ],
      discount: 0,
    },
  });
  const [customer, setcustomer] = useState('');

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const discountPercentage = watch('discount') || 0;
  const selectedTemplate = watch(`financialTemplate`) || '';

  const subtotal = items.reduce((acc, item) => {
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    return acc + quantity * price;
  }, 0);

  const taxTotal = items.reduce((acc, item) => {
    const quantity = item.quantity || 0;
    const price = item.price || 0;
    const btw = item.btw || 0; // tax percentage for each item
    const itemTax = price * quantity * (btw / 100);
    return acc + itemTax;
  }, 0);

  const total = subtotal - subtotal * (discountPercentage / 100) + taxTotal;

  const navigate = useNavigate();

  const handleClient = async () => {
    let response = await axios.get(apiPath + '/customer/customerList');
    setcustomer(response.data.customers);
    if (job) {
      setValue('customer', job?.customer._id);
    }
  };
  const handlePackage = async () => {
    try {
      let response = await axios.get(
        apiPath + '/api/packages?type=Manual/No job',
      );
      setPackage(response.data);
    } catch (error) {
      console.error('Error fetching package:', error.message);
    }
  };
  const handlesalesgroup = async () => {
    try {
      let response = await axios.get(
        apiPath + '/api/sale_group?type=salesGroup',
      );
      setSales(response.data);
    } catch (error) {
      console.error('Error fetching package:', error.message);
    }
  };
  const handleAllinputs = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/api/input?inputFor=Template&name=${selectedTemplate}`,
      );
      setInputFields(response.data[0]?.extraFields);
    } catch (err) {
      console.error(err);
    }
  };
  const handletemplate = async () => {
    try {
      let response = await axios.get(apiPath + '/api/templates?type=quote');
      setTemplate(response.data);
    } catch (error) {
      console.error('Error fetching package:', error.message);
    }
  };
  const handleInvoice = async (data) => {
    let joblinkData = {};
    if (job) {
      joblinkData = {
        job: job._id,
        package: job.package._id,
      };
    }
    let finalData = restructureData(data);
    try {
      const response = await axios.post(apiPath + '/finance/add', {
        ...finalData,
        ...joblinkData,
      });
      alert('created successfully');
      display == 'none' ? onclose() : navigate(-1);
      if (job) {
        updateJobSchedule(job._id, {
          status: 'First Contact',
          offer: response.data?._id,
        });
      }
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert(error.message);
    }
  };

  const updateJobSchedule = async (jobId, updatedData) => {
    try {
      const response = await axios.put(
        `${apiPath}/api/job-schedule/${jobId}`,
        updatedData,
      );
      console.log('Job schedule updated successfully');
    } catch (error) {
      console.error(
        'Error updating job schedule:',
        error.response ? error.response.data : error.message,
      );
    }
  };

  useEffect(() => {
    if (selectedTemplate) {
      handleAllinputs();
    }
  }, [selectedTemplate]);

  useEffect(() => {
    handleClient();
    handlePackage();
    handletemplate();
    handlesalesgroup();
  }, [job]);

  function restructureData(inputData) {
    const jobinput = {};
    const result = Object.keys(inputData).reduce((acc, key) => {
      if (key.startsWith('jobinput_')) {
        const newKey = key.replace('jobinput_', '');
        jobinput[newKey] = inputData[key];
      } else {
        acc[key] = inputData[key];
      }
      return acc;
    }, {});
    result.jobinput = jobinput;
    return result;
  }

  const onSubmit = (data) => {
    let finalData = {
      ...data,
      btw: taxTotal.toFixed(2),
      discountedPrice: (subtotal * (discountPercentage / 100)).toFixed(2),
      vat: vatSelected,
      subTotal: subtotal.toFixed(2),
      total: total.toFixed(2),
      contactPerson: id,
    };
    handleInvoice(finalData);
  };

  return (
    <div
      className={
        display != 'none'
          ? `mx-auto p-8 bg-white shadow-lg font-medium text-lg`
          : ''
      }
    >
      <div className={`flex`} style={{ display: display }}>
        <KeyboardBackspaceIcon
          onClick={() => navigate(-1)}
          style={{
            fontSize: '35px',
            padding: '2px',
            border: '1px solid black',
            borderRadius: '20px',
            marginRight: '10px',
          }}
        />
        <h1 className="text-2xl font-bold mb-4">New Offer</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-black">Client*</label>
            <select
              disabled={job}
              className={`mt-1 block w-full p-2 border ${
                errors.customer ? 'border-red' : 'border-gray'
              }`}
              {...register('customer', { required: 'Client is required' })}
            >
              <option value="">Select Client</option>
              {customer &&
                customer.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.firstName} {item.lastName} &nbsp; &nbsp; {item.email}
                  </option>
                ))}
            </select>
            {errors.customer && (
              <p className="text-red-500 text-xs">{errors.customer.message}</p>
            )}
          </div>
          {!job && (
            <div>
              <label className="block  text-black">Package*</label>
              <select
                className={`mt-1 block w-full p-2 border ${
                  errors.package ? 'border-red' : 'border-gray'
                } `}
                {...register('package', { required: 'field is required' })}
              >
                <option value="">Select Package</option>
                {packageList &&
                  packageList.map((item, index) => (
                    <option key={index} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              {errors.package && (
                <p className="text-red-500 text-xs">{errors.package.message}</p>
              )}
            </div>
          )}
          <div>
            <label className="block  text-black">Date</label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]} // Set current date by default}
              className="mt-1 block w-full p-2 border border-gray "
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <p className="text-red-500 text-xs">{errors.date.message}</p>
            )}
          </div>
          {/* <DatePickerComponent
                        control={control}
                        name="dob"
                        label="Date of Birth"
                        rules={{ required: "Date of Birth is required" }}
                        errors={errors}
                        maxDate={new Date()}
                    /> */}
          {job && (
            <div>
              <label className="block  text-black">Expiry Date</label>
              <input
                type="date"
                defaultValue=""
                className="mt-1 block w-full p-2 border border-gray "
                {...register('expire_date', {
                  required: 'Expiry date is required',
                })}
              />
              {errors.expire_date && (
                <p className="text-red-500 text-xs">
                  {errors.expire_date.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block  text-black">Financial Template*</label>
            <select
              className={`mt-1 block w-full p-2 border ${
                errors.financialTemplate ? 'border-red' : 'border-gray'
              } `}
              {...register('financialTemplate', {
                required: 'Financial Template is required',
              })}
            >
              <option value="">Select Template</option>
              {templateList &&
                templateList.map((item, index) => (
                  <option key={index} value={item._id}>
                    {item.name}
                  </option>
                ))}
            </select>
            {errors.financialTemplate && (
              <p className="text-red-500 text-xs">
                {errors.financialTemplate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-black">Reference</label>
            <input
              type="text"
              className="mt-1 block w-full p-2 border border-gray "
              {...register('reference')}
            />
          </div>
          <div>
            <label className="block text-black">Status</label>
            <select
              defaultValue={'Draft'}
              className={`mt-1 block w-full p-2 border ${
                errors.Status ? 'border-red' : 'border-gray'
              } `}
              {...register('Status', { required: 'Status is required' })}
            >
              <option value="">Select Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
            {errors.Status && (
              <p className="text-red-500 text-xs">{errors.Status.message}</p>
            )}
          </div>
        </div>
        {selectedTemplate
          ? inputField && (
              <div
                className="flex mt-2 mb-5"
                style={{ flexWrap: 'wrap', gap: '18px' }}
              >
                {inputField.map((field, index) => (
                  <div key={index} style={{ width: '49%' }} className="">
                    <label className="block text-black pb-1">
                      {field.label}
                    </label>
                    <input
                      {...register(`jobinput_${field.name}`, {
                        required: field.required,
                      })}
                      placeholder={field.label}
                      type={field.type}
                      className="w-full p-2 border border-gray"
                    />
                    {errors[`jobinput_${field.name}`] && (
                      <p className="text-red-500 text-xs">Field is required</p>
                    )}
                  </div>
                ))}
              </div>
            )
          : ''}
        <div className="mb-4">
          <label className="block font-bold text-sm mb-2">
            Is the price inclusive or exclusive of VAT?
          </label>
          <div className="space-x-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-md border focus:outline-none ${
                vatSelected === 'inclusive'
                  ? 'bg-blue text-white border-blue-500'
                  : 'bg-white text-black border-gray'
              }`}
              onClick={() => handleVatSelect('inclusive')}
            >
              Including VAT
            </button>
            <button
              type="button"
              className={`px-4 py-2 mt-2 rounded-md border focus:outline-none ${
                vatSelected === 'exclusive'
                  ? 'bg-blue text-white border-blue-500'
                  : 'bg-white text-black border-gray'
              }`}
              onClick={() => handleVatSelect('exclusive')}
            >
              Excluding VAT
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="md:flex items-center space-x-2">
            <input
              type="checkbox"
              {...register('ignoreRules')}
              className="h-4 w-4"
            />
            <span>Ignore rules with a count of 0</span>
          </label>
        </div>

        {/* Invoice Items */}
        <div>
          {/* Header Row - Visible on md+ screens */}
          <div className="hidden md:grid grid-cols-6 gap-5 mb-2">
            <h2 className="text-sm md:text-base font-semibold">Sales Group*</h2>
            <h2 className="text-sm md:text-base font-semibold">Description</h2>
            <h2 className="text-sm md:text-base font-semibold">Number</h2>
            <h2 className="text-sm md:text-base font-semibold">BTW</h2>
            <h2 className="text-sm md:text-base font-semibold">Price</h2>
            <h2 className="text-sm md:text-base font-semibold"></h2>
          </div>

          {/* Dynamic Fields */}
          {fields.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 sm:gap-4 md:gap-5 mb-4"
            >
              {/* Labels for small screens (hidden on md+) */}
              <label className="md:hidden text-sm font-semibold">
                Sales Group
              </label>
              <div className="w-full">
                <select
                  className="p-2 pe-3 border border-gray w-full"
                  {...register(`items.${index}.salesgroup`, {
                    required: 'Sales group is required',
                  })}
                >
                  <option value="">Select</option>
                  {salesgroup?.map((item, idx) => (
                    <option key={idx} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {errors?.items?.[index]?.salesgroup && (
                  <p className="text-red-500 text-xs">
                    {errors.items[index].salesgroup.message}
                  </p>
                )}
              </div>
              <label className="md:hidden text-sm font-semibold">
                Description
              </label>
              <input
                type="text"
                placeholder="Description"
                className="p-2 border border-gray"
                {...register(`items.${index}.description`)}
              />

              <label className="md:hidden text-sm font-semibold">Number</label>
              <input
                type="number"
                placeholder="Quantity"
                className="p-2 border border-gray"
                min="1"
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                {...register(`items.${index}.quantity`, {
                  valueAsNumber: true,
                })}
              />

              <label className="md:hidden text-sm font-semibold">BTW</label>
              <select
                className="p-2 border border-gray"
                // {...register(`items.${index}.btw`, {
                //   required: 'btw is required',
                // })}
                {...register(`items.${index}.btw`)}
              >
                <option value="">Select</option>
                <option value="0">0%</option>
                <option value="9">9%</option>
                <option value="21">21%</option>
              </select>

              <label className="md:hidden text-sm font-semibold">Price</label>
              <input
                type="number"
                placeholder="Price"
                className="p-2 border border-gray"
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                {...register(`items.${index}.price`, { valueAsNumber: true })}
              />

              <button
                type="button"
                onClick={() => remove(index)}
                className="border bg-gray text-black px-2 text-sm lg:text-base font-semibold"
              >
                Remove
              </button>
            </div>
          ))}

          {/* Add Item Button */}
          <button
            type="button"
            onClick={() =>
              append({
                salesgroup: '',
                description: '',
                quantity: 1,
                btw: '',
                price: 0,
              })
            }
            className="border bg-blue text-white px-4 py-2 hover:bg-black w-full sm:w-auto"
          >
            + Add Item
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Summary</h2>
          <div className="grid grid-cols-2 mb-2">
            <div>Subtotal:</div>
            <div className="text-lg font-semibold">$ {subtotal.toFixed(2)}</div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="w-1/2">
              <input
                placeholder="Discount Description:  "
                type="text"
                className="mt-1 block w-1/2 p-2 border border-gray "
                {...register('discount_description')}
              />
            </div>
            <div className="w-1/2">
              <input
                type="number"
                className="mt-1 block w-1/2 p-2 border border-gray "
                min={0}
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-' || e.key === 'e') {
                    e.preventDefault();
                  }
                }}
                {...register('discount', { valueAsNumber: true })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 mb-2">
            <div className="text-lg font-semibold">Discount :</div>
            <div className="text-lg font-semibold">
              - $ {(subtotal * (discountPercentage / 100)).toFixed(2)}{' '}
            </div>
          </div>
          <div className="grid grid-cols-2 mb-2">
            <div className="text-lg font-semibold">Total tax :</div>
            <div className="text-lg font-semibold">
              + $ {taxTotal.toFixed(2)}{' '}
            </div>
          </div>
          <div className="grid grid-cols-2 mb-2">
            <div className="text-lg font-semibold">Total:</div>
            <div className="text-lg font-semibold">= $ {total.toFixed(2)}</div>
          </div>
        </div>
        {/* Save Button */}
        <div className="mt-6 text-right">
          <div className="flex justify-end p-6">
            <Button
              variant="contained"
              type="submit"
              color="primary"
              className="ml-2 bg-blue-600 text-white"
            >
              Prepare Quatation
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewOffer;
