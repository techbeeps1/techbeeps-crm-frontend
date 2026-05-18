import React, { useEffect } from 'react';
import { TextField, Button, Box, Typography, IconButton, FormControlLabel, Checkbox, Autocomplete } from '@mui/material';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import { toast } from 'react-toastify';

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
    value?: FormValues; // Optional, for edit mode
    inputFor: string;
    templates: { name: string; _id: string }[];
}

const Inputfieldfrom: React.FC<InputfieldFormProps> = ({ templates, inputFor, close, handler, value }) => {
    const { register, control,setValue, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            name: '',
            extraFields: [{ label: '', name: "", type: 'text', required: false }],
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
    const notifyError = (message: string) => toast.error(message, {
        autoClose: 2000,
    });

    const handleInput = async (inputData: FormValues) => {
        try {
            const response = value
                ? await axios.put(`${apiPath}/api/input/${value._id}`, inputData)  // Update endpoint
                : await axios.post(`${apiPath}/api/input`, inputData);  // Create endpoint
            if (response) {
                handler();
                 notify('Input saved successfully');
            }
        } catch (error) {
            console.error('Error adding or updating input:', error);
            notifyError('Error adding or updating input');
            throw error;
        }
    };

    const onSubmit = (data: FormValues) => {
        const finalData = { inputFor: inputFor, name: data.name, extraFields: data.extraFields }
        handleInput(finalData);
        reset();
        close()
    };

    return (
        <Box maxWidth='100%'>
            <Typography variant="h6" component="h2" marginTop={1}>
                Create Input field
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ maxHeight: "70vh", overflowY: "scroll" }}>
                    <div style={{width:'99%'}}>
                        {inputFor === 'Template' ? !value && <Controller
                            name="name"
                            control={control}
                            rules={{ required: 'Template is required' }} // Add validation rule
                            render={({ field }) => (
                                <Autocomplete
                                    options={templates}  // Use the templates prop
                                    getOptionLabel={(option) => option.name}  // Display the name of each template
                                    isOptionEqualToValue={(option, value) => option._id === value._id} // Match based on _id
                                    value={templates.find((template) => template._id === field.value) || null} // Set the selected template based on _id
                                    onChange={(_, data) => field.onChange(data ? data._id : '')} // When an option is selected, set _id as the value
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Template"
                                            variant="standard"
                                            margin="normal"
                                            error={!!errors.name} // Show error styling
                                            helperText={errors.name ? errors.name.message : ''} // Display error message
                                        />
                                    )}
                                />
                            )}
                        /> : <>
                            <TextField
                                label="Input Name*"
                                variant="standard"
                                fullWidth
                                margin="normal"
                                {...register('name', { required: 'Input name is required' })}
                            />
                            {errors?.name && (
                                 <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
                                 {errors?.name.message}</p>)}
                                 </>
                        }
                    </div>

                    <Typography variant="subtitle1" marginTop={2}>
                        Add Extra Fields
                    </Typography>

                    {fields.map((field, index) => (
                        <Box key={field.id} display="flex" gap={1} alignItems="flex-end" mb={2}>
                                <TextField
                                label="Field Label*"
                                variant="standard"
                                fullWidth
                                {...register(`extraFields.${index}.label`, { required: 'Field lebel is required' })}
                                margin="normal"
                                error={!!errors.extraFields?.[index]?.label} // Display error state if there's an error
                                helperText={errors.extraFields?.[index]?.label?.message} // Display error message
                            />
                            <TextField
                                label="Field Name*"
                                variant="standard"
                                fullWidth
                                {...register(`extraFields.${index}.name`, {
                                    required: 'Field name is required',
                                    pattern: {
                                        value: /^\S+$/,
                                        message: "Field name cannot contain spaces"
                                    }
                                })}
                                margin="normal"
                                error={!!errors.extraFields?.[index]?.name} // Display error state if there's an error
                                helperText={errors.extraFields?.[index]?.name?.message} // Display error message
                            />
                            <TextField
                                select
                                label="Field Type"
                                variant="standard"
                                fullWidth
                                SelectProps={{
                                    native: true,
                                }}
                                {...register(`extraFields.${index}.type`, { required: true })}
                                margin="normal"
                            >
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="date">Date</option>
                                <option value="time">Time</option>
                            </TextField>
                            <Controller
                                name={`extraFields.${index}.required`}
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...field}
                                                checked={field.value} // Bind the checkbox to the `required` field
                                                onChange={(e) => {
                                                    setValue(`extraFields.${index}.required`, e.target.checked);
                                                }}
                                            />
                                        }
                                        label=""
                                    />
                                )}
                            />
                            <IconButton onClick={() => remove(index)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    ))}
                    <Button variant="outlined" onClick={() => append({ label: '', name: '', type: 'text', required: false })}>
                        Add Field
                    </Button>
                </div>
                <Box mt={4}>
                    <Button type="submit" variant="contained" color="primary">
                        Submit
                    </Button>
                </Box>
            </form>
        </Box>
    );
};

export default Inputfieldfrom;
