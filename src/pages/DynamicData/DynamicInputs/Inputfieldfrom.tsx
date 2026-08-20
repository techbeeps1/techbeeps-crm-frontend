import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Autocomplete, TextField } from '@mui/material';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';
import {
  MdDynamicForm,
  MdAdd,
  MdDeleteOutline,
  MdSave,
  MdPlaylistAdd,
} from 'react-icons/md';

interface ExtraField {
  label: string;
  name: string;
  type: string;
  required: boolean;
}

interface FormValues {
  _id?: string;
  name: string;
  extraFields: ExtraField[];
}

interface InputfieldFormProps {
  close: () => void;
  handler: () => void;
  value?: FormValues;
  inputFor: string;
  templates: { name: string; _id: string }[];
}

const Inputfieldfrom: React.FC<InputfieldFormProps> = ({
  templates,
  inputFor,
  close,
  handler,
  value,
}) => {
  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      extraFields: [{ label: '', name: '', type: 'text', required: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'extraFields',
  });

  useEffect(() => {
    if (value) {
      reset(value);
    }
  }, [value, reset]);

  const notify = (message: string) => toast.success(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const handleInput = async (inputData: FormValues) => {
    try {
      const response = value
        ? await axios.put(`${apiPath}/api/input/${value._id}`, inputData)
        : await axios.post(`${apiPath}/api/input`, inputData);
      if (response) {
        handler();
        notify('Input configuration saved successfully');
      }
    } catch (error) {
      console.error('Error adding or updating input:', error);
      notifyError('Error adding or updating input');
      throw error;
    }
  };

  const onSubmit = (data: FormValues) => {
    const finalData = {
      inputFor: inputFor,
      name: data.name,
      extraFields: data.extraFields,
    };
    handleInput(finalData);
    reset();
    close();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-stroke dark:border-strokedark">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xl shrink-0">
          <MdDynamicForm />
        </div>
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white">
            {value ? `Edit ${inputFor} Input Field` : `Create ${inputFor} Input Field`}
          </h3>
          <p className="text-xs text-body dark:text-bodydark">
            Define custom field definitions and attributes for {inputFor.toLowerCase()}s
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-5 scrollbar-thin">
          {/* Main Input Name or Template Selector */}
          <div className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark">
            {inputFor === 'Template' ? (
              !value ? (
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Target Document Template <span className="text-meta-1">*</span>
                  </label>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: 'Template selection is required' }}
                    render={({ field }) => (
                      <Autocomplete
                        options={templates}
                        getOptionLabel={(option) => option.name}
                        isOptionEqualToValue={(option, val) => option._id === val._id}
                        value={
                          templates.find((template) => template._id === field.value) || null
                        }
                        onChange={(_, data) => field.onChange(data ? data._id : '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Search & choose template..."
                            variant="outlined"
                            size="small"
                            error={!!errors.name}
                            helperText={errors.name ? errors.name.message : ''}
                            className="bg-white dark:bg-form-input rounded-xl"
                          />
                        )}
                      />
                    )}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                    Template Identifier
                  </label>
                  <input
                    disabled
                    value={value.name}
                    className="w-full bg-gray-2 dark:bg-boxdark text-slate-500 rounded-xl border border-stroke dark:border-strokedark py-2 px-3.5 text-xs font-mono"
                  />
                </div>
              )
            ) : (
              <div>
                <label className="block text-xs font-bold text-black dark:text-white mb-1.5">
                  Input Configuration Name <span className="text-meta-1">*</span>
                </label>
                <input
                  {...register('name', { required: 'Input name is required' })}
                  placeholder="e.g. Appointment Questionnaire, Client Requirements"
                  className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-xl border border-stroke dark:border-strokedark py-2.5 px-4 outline-none focus:border-primary text-xs font-medium"
                />
                {errors.name && (
                  <p className="text-meta-1 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Extra Fields List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdPlaylistAdd className="text-primary text-base" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                  Dynamic Fields ({fields.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() =>
                  append({ label: '', name: '', type: 'text', required: false })
                }
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                <MdAdd className="text-base" />
                <span>Add Another Field</span>
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-gray-2/40 dark:bg-meta-4/20 p-4 rounded-xl border border-stroke dark:border-strokedark relative space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stroke/60 dark:border-strokedark/60">
                    <span className="text-[11px] font-extrabold uppercase text-slate-400">
                      Field #{index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-400 hover:text-meta-1 p-1 rounded-lg hover:bg-meta-1/10 transition-colors cursor-pointer"
                        title="Remove field"
                      >
                        <MdDeleteOutline className="text-base" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-start">
                    {/* Field Label */}
                    <div>
                      <label className="block text-[11px] font-bold text-black dark:text-white mb-1">
                        Field Label <span className="text-meta-1">*</span>
                      </label>
                      <input
                        {...register(`extraFields.${index}.label`, {
                          required: 'Field label is required',
                        })}
                        placeholder="e.g. Floor Level"
                        className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-1.5 px-3 outline-none focus:border-primary text-xs"
                      />
                      {errors.extraFields?.[index]?.label && (
                        <p className="text-meta-1 text-[10px] mt-0.5">
                          {errors.extraFields[index]?.label?.message}
                        </p>
                      )}
                    </div>

                    {/* Field Name / Key */}
                    <div>
                      <label className="block text-[11px] font-bold text-black dark:text-white mb-1">
                        Variable Key <span className="text-meta-1">*</span>
                      </label>
                      <input
                        {...register(`extraFields.${index}.name`, {
                          required: 'Key is required',
                          pattern: {
                            value: /^\S+$/,
                            message: 'No spaces allowed',
                          },
                        })}
                        placeholder="e.g. floor_level"
                        className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-1.5 px-3 outline-none focus:border-primary text-xs font-mono"
                      />
                      {errors.extraFields?.[index]?.name && (
                        <p className="text-meta-1 text-[10px] mt-0.5">
                          {errors.extraFields[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    {/* Field Type */}
                    <div>
                      <label className="block text-[11px] font-bold text-black dark:text-white mb-1">
                        Input Type
                      </label>
                      <select
                        {...register(`extraFields.${index}.type`, { required: true })}
                        className="w-full bg-white dark:bg-form-input text-black dark:text-white rounded-lg border border-stroke dark:border-strokedark py-1.5 px-3 outline-none focus:border-primary text-xs font-medium"
                      >
                        <option value="text">Text (String)</option>
                        <option value="number">Number (Numeric)</option>
                        <option value="date">Date Picker</option>
                        <option value="time">Time Picker</option>
                      </select>
                    </div>

                    {/* Required Toggle */}
                    <div className="pt-5 flex items-center gap-2">
                      <Controller
                        name={`extraFields.${index}.required`}
                        control={control}
                        render={({ field: reqField }) => (
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-black dark:text-white">
                            <input
                              type="checkbox"
                              checked={reqField.value}
                              onChange={(e) => {
                                setValue(
                                  `extraFields.${index}.required`,
                                  e.target.checked
                                );
                              }}
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-stroke cursor-pointer"
                            />
                            <span>Mandatory</span>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stroke dark:border-strokedark">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-stroke dark:border-strokedark text-slate-700 dark:text-slate-200 hover:bg-gray-2 dark:hover:bg-strokedark transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary hover:bg-opacity-90 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-primary/25 transition-all cursor-pointer text-xs sm:text-sm"
          >
            <MdSave className="text-base" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Inputfieldfrom;

