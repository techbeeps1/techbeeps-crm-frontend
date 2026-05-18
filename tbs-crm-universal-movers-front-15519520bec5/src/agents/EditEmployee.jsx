import React, { useEffect, useState } from 'react';

import {
    Button,
    IconButton,
    Modal,
    Box,
    Tabs,
    Tab,
    TextField,
    MenuItem,
    InputAdornment,
    Select,
    FormControl,
    InputLabel, Autocomplete, Chip, FormControlLabel
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePickerComponent from '../common/Datepicker';
import Loader from '../common/Loader';
import DocumentSelected from '../pages/customerDetails/DocumentSelected';

const EditEmployee = ({ handler, userData, skills, licenses, countries }) => {
    const { control, handleSubmit, register, reset, formState: { errors }, watch } = useForm({
        defaultValues: {
            selectedLicenses: [],
            skills: [],
            role: ""
        },
    });

    const [loading, setLoading] = useState(false)

    const notify = (message) => toast.success(message);
    const notifyError = (message) => toast.error(message, {
        autoClose: 2000,
    });


    useEffect(() => {
        const defaultValues = {
            gender: userData.gender || '',
            firstName: userData.username?.split(" ")[0] || '',
            surname: userData.username?.split(" ")[1] || '',
            language: userData.language || '',
            dob: userData.dob ? userData.dob.split('T')[0] : '',  // Ensure date is in YYYY-MM-DD format
            email: userData.email || '',
            telephone: userData.telephone || '',
            street: userData.street || '',
            houseNumber: userData.houseNumber || '',
            postcode: userData.postCode || '',
            addition: userData.addition || '',
            country: userData.country || '',
            city: userData.city || '',
            inservice: userData.inservice?.split('T')[0] || '',
            outservice: userData.outofservice?.split('T')[0] || '',
            trailPeriod: userData.trailPeriod ? new Date(userData.trailPeriod).toISOString().split('T')[0] : '',
            contract_startDate: userData.contract?.startDate ? userData.contract?.startDate?.split('T')[0] : '',
            contract_endDate: userData.contract?.endDate ? userData.contract?.endDate?.split('T')[0] : '',
            contract_type: userData.contract?.type || '',
            contract_hourlyWage: userData.contract?.hourlyWage || '',
            contract_DaysPerWeek: userData.contract?.daysWeek || '',
            contract_hoursPerWeek: userData.contract?.hoursWeek || '',
            selectedLicenses: userData.drivingLicense || [],
            skills: userData.skills || [],
            role: userData.role || '',
            documentNumber: userData.documentNumber || '',
        };
        reset(defaultValues)
    }, [userData])

    const [open, setOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const handleNext = () => {
        handleSubmit(() => {
            setActiveStep((prev) => prev + 1);
        })();
    };
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleClose = () => setOpen(false);

    const steps = [
        { label: 'Colleague', fields: ['Gender', 'First name', 'Infix', 'Surname'] },
        { label: 'Address', fields: ['Street', 'City', 'Postal code'] },
        { label: 'Contract', fields: ['Contract Type', 'Start Date'] },
        { label: 'Documents', fields: ['License Number', 'Expiry Date'] },
        { label: 'Skills', fields: ['Skill 1'] },
    ];

    const onSubmit = (data) => {
        postUserData(data);
    };

    const postUserData = async (data) => {
        setLoading(true);
        const transformedData = {
            username: `${data.firstName} ${data.surname}`,
            email: data.email,
            gender: data.gender,
            language: data.language,
            dob: data.dob,
            telephone: data.telephone,
            postCode: data.postcode,
            houseNumber: data.houseNumber,
            addition: data.addition,
            street: data.street,
            city: data.city,
            country: data.country,
            inservice: data.inservice,
            outofservice: data.outservice,
            trailPeriod: new Date(data.trailPeriod).getTime(),
            contract: {
                startDate: data.contract_startDate,
                endDate: data.contract_endDate,
                type: data.contract_type,
                hourlyWage: Number(data.contract_hourlyWage),
                hoursWeek: Number(data.contract_hoursPerWeek),
                daysWeek: data.contract_DaysPerWeek,
            },
            drivingLicense: data.selectedLicenses,
            skills: data.skills,
            role: data.role,
            documentNumber: data.documentNumber,
        };

        try {
            const response = await axios.post(`${apiPath}/user/update`, { ...transformedData, id: userData._id });
            handleClose();
            handler()
            notify('Employee update successfully!');
        } catch (error) {
            notifyError(`Error : ${error?.response?.data?.msg}`);
        } finally {
            setLoading(false)
        }
    };

    return (
        <>
            {loading && <Loader />}
            <div>
                <Button variant="contained" className='shadow-md' onClick={() => setOpen(true)}>Edit</Button>
                <Modal open={open} onClose={handleClose}>
                    <Box className="bg-white p-7 rounded-lg shadow-lg max-w-4xl mx-auto" style={{
                        maxHeight: "96vh", overflowY: "auto", width: "100%", position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}>
                     
                     <div className="flex justify-between items-start">
                            <Tabs
                            value={activeStep}
                            className="mb-4"
                            // onChange={(e, val) => {
                            //     if (val <= activeStep) {
                            //         setActiveStep(val);
                            //     }
                            // }}
                            onChange={(event, newValue) => {
                            // Only allow moving to current or previous tabs
                            if (newValue <= activeStep) {
                            setActiveStep(newValue);
                            } else {
                            // Optionally allow forward movement
                            // setActiveStep((prev) => prev + 1);
                            handleNext()
                            }
                            }}
                            >
                            {steps.map((step, index) => (
                                <Tab
                                    label={step.label}
                                    key={index}
                                    sx={{fontSize:'16px' }}
                                />
                            ))}
                        </Tabs>
                        <IconButton
                            onClick={handleClose}
                            className="text-gray"
                        >
                            <CloseIcon />
                        </IconButton>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {/* Form Fields */}
                            {activeStep === 0 && (
                                <>
                                    <FormControl fullWidth variant="standard" className="w-1/2">
                                        <InputLabel id="gender-label">Gender</InputLabel>
                                        <Controller
                                            name="gender"
                                            control={control}
                                            defaultValue=""
                                            margin='normal'
                                            rules={{ required: 'Gender is required' }} // Validation for Gender
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <Select
                                                        labelId="gender-label"
                                                        {...field}
                                                        displayEmpty
                                                        inputProps={{
                                                            'aria-label': 'Gender',
                                                        }}
                                                        className="mb-3"
                                                    >
                                                        <MenuItem value="male">Male</MenuItem>
                                                        <MenuItem value="female">Female</MenuItem>
                                                        <MenuItem value="other">Other</MenuItem>
                                                    </Select>
                                                    {error && <p className="text-red-500 text-sm">{error.message}</p>}
                                                </>
                                            )}
                                        />
                                    </FormControl>

                                    <div className="flex mb-4 gap-2">
                                        <TextField
                                            label="First Name"
                                            variant="standard"
                                            fullWidth
                                            margin='normal'
                                            {...register('firstName', { required: 'First Name is required' })} // Validation for First Name
                                            className="mb-3"
                                            error={!!errors.firstName}
                                            helperText={errors.firstName?.message}
                                        />
                                        <TextField
                                            label="Surname"
                                            variant="standard"
                                            fullWidth
                                            margin='normal'
                                            {...register('surname', { required: 'Surname is required' })} // Validation for Surname
                                            className="mb-3"
                                            error={!!errors.surname}
                                            helperText={errors.surname?.message}
                                        />
                                    </div>

                                    <div className='flex gap-2'>
                                        <TextField
                                            label="Language"
                                            variant="standard"
                                            fullWidth
                                            {...register('language', { required: 'Language is required' })} // Validation for Language
                                            className="mb-3"
                                            error={!!errors.language}
                                            helperText={errors.language?.message}
                                        />
                                        <DatePickerComponent
                                            control={control}
                                            name="dob"
                                            label="Date of Birth"
                                            rules={{ required: "Date of Birth is required" }}
                                            errors={errors}
                                            maxDate={new Date()}
                                        />
                                    </div>

                                    <TextField
                                        label="Email"
                                        type="email"
                                        variant="standard"
                                        disabled
                                        margin='normal'
                                        fullWidth
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: 'Enter a valid email address',
                                            },
                                        })} // Validation for Email
                                        className="mb-3"
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />

                                    <TextField
                                        label="Telephone"
                                        type="tel"
                                        variant="standard"
                                        fullWidth
                                        margin='normal'
                                        {...register('telephone', {
                                            required: 'Telephone is required',
                                            pattern: {
                                                value: /^[0-9]{10,15}$/,
                                                message: 'Enter a valid phone number (10-15 digits)',
                                            },
                                        })}
                                        className="mb-3"
                                        error={!!errors.telephone}
                                        helperText={errors.telephone?.message}
                                    />
                                </>

                            )}

                            {activeStep === 1 && (
                                <>
                                    <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                        <TextField
                                            label="Postcode"
                                            variant="standard"
                                            fullWidth
                                            margin='normal'
                                            {...register("postcode", {
                                                required: "Postcode is required",
                                                pattern: {
                                                    value: /^[0-9a-zA-Z\s-]+$/,
                                                    message: "Enter a valid postcode",
                                                },
                                            })}
                                            error={!!errors.postcode}
                                            helperText={errors.postcode?.message}
                                        />
                                        <TextField
                                            label="House Number"
                                            variant="standard"
                                            margin='normal'

                                            fullWidth
                                            {...register("houseNumber", {
                                                required: "House number is required",
                                            })}
                                            error={!!errors.houseNumber}
                                            helperText={errors.houseNumber?.message}
                                        />
                                        <TextField
                                            label="Addition"
                                            variant="standard"
                                            margin='normal'

                                            fullWidth
                                            {...register("addition")}
                                            error={!!errors.addition}
                                            helperText={errors.addition?.message}
                                        />
                                    </div>
                                    <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                        <TextField
                                            label="Street"
                                            variant="standard"
                                            margin='normal'

                                            fullWidth
                                            {...register("street", {
                                                required: "Street is required",
                                            })}
                                            error={!!errors.street}
                                            helperText={errors.street?.message}
                                        />
                                        <TextField
                                            label="City"
                                            variant="standard"
                                            margin='normal'

                                            fullWidth
                                            {...register("city", {
                                                required: "City is required",
                                            })}
                                            error={!!errors.city}
                                            helperText={errors.city?.message}
                                        />
                                    </div>
                                    <FormControl fullWidth variant="standard" className="w-1/2">
                                        <InputLabel id="country-label">Country</InputLabel>
                                        <Controller
                                            name="country"
                                            control={control}
                                            defaultValue=""
                                            margin='normal'
                                            rules={{ required: 'Country is required' }} // Validation for Gender
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <Select
                                                        labelId="country-label"
                                                        {...field}
                                                        displayEmpty
                                                        inputProps={{
                                                            'aria-label': 'Country',
                                                        }}
                                                        className="mb-3"
                                                    >{countries && countries.map((country, index) =>
                                                        <MenuItem key={index} value={country.name}>{country.name}</MenuItem>
                                                    )}
                                                    </Select>
                                                    {error && <p style={{ color: '#d32f2f' }} className="text-sm">{error.message}</p>}
                                                </>
                                            )}
                                        />
                                    </FormControl>
                                </>
                            )}

                            {activeStep === 2 && (
                                <>
                                    <div className="flex mb-4 gap-4">
                                        <DatePickerComponent
                                            control={control}
                                            name="inservice"
                                            label="In service"
                                            rules={{ required: "Date is required" }}
                                            errors={errors}
                                        />
                                        <DatePickerComponent
                                            control={control}
                                            name="outservice"
                                            label="Out of Service"
                                            rules={{ required: "Date is required" }}
                                            errors={errors}
                                            minDate={watch('inservice') ? new Date(watch('inservice')) : null}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <DatePickerComponent
                                            control={control}
                                            name="trailPeriod"
                                            label="Trail Period"
                                            rules={{ required: "Trail Period is required" }}
                                            errors={errors}
                                        />
                                    </div>
                                    <h2 className='font-bold mb-3'>Contract</h2>
                                    <div className="flex mb-4 gap-4">
                                        <DatePickerComponent
                                            control={control}
                                            name="contract_startDate"
                                            label="Start Date"
                                            rules={{ required: "Start Date is required" }}
                                            errors={errors}
                                        />
                                        <DatePickerComponent
                                            control={control}
                                            name="contract_endDate"
                                            label="End Date"
                                            rules={{ required: "End Date is required" }}
                                            errors={errors}
                                            minDate={watch('contract_startDate') ? new Date(watch('contract_startDate')) : null}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <FormControl fullWidth variant="standard" className="w-1/2">
                                            <InputLabel id="type-label">Type</InputLabel>
                                            <Controller
                                                name="contract_type"
                                                control={control}
                                                rules={{ required: "Contract type is required" }}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <Select
                                                        labelId="type-label"
                                                        {...field}
                                                        displayEmpty
                                                        inputProps={{
                                                            "aria-label": "Type",
                                                        }}
                                                        className="mb-3"
                                                        error={!!errors.contract_type}
                                                    >
                                                        <MenuItem value="Fixed hours">Fixed hours</MenuItem>
                                                        <MenuItem value="Variable hours">Variable hours</MenuItem>
                                                        <MenuItem value="Hiring">Hiring</MenuItem>
                                                        <MenuItem value="Payroll">Payroll</MenuItem>
                                                    </Select>
                                                )}
                                            />
                                            {errors.contract_type && (
                                                <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
                                                    {errors.contract_type.message}
                                                </p>
                                            )}
                                        </FormControl>
                                    </div>

                                    <div className="flex mb-4 gap-4">
                                        <TextField
                                            label="Hourly wage"
                                            type="text"
                                            variant="standard"
                                            fullWidth
                                            {...register("contract_hourlyWage", {
                                                required: "Hourly wage is required",
                                                pattern: {
                                                    value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                                    message: "Enter a valid hourly wage (e.g., 15.50)",
                                                },
                                            })}
                                            className="mb-3"
                                            error={!!errors.contract_hourlyWage}
                                            helperText={errors.contract_hourlyWage?.message}
                                        />
                                        <TextField
                                            label="Hours per week"
                                            type="text"
                                            variant="standard"
                                            fullWidth
                                            {...register("contract_hoursPerWeek", {
                                                required: "Hours per week is required",
                                                pattern: {
                                                    value: /^[0-9]+$/,
                                                    message: "Enter a valid number of hours",
                                                },
                                            })}
                                            className="mb-3"
                                            error={!!errors.contract_hoursPerWeek}
                                            helperText={errors.contract_hoursPerWeek?.message}
                                        />
                                        <TextField
                                            label="Days per week"
                                            type="text"
                                            variant="standard"
                                            fullWidth
                                            {...register("contract_DaysPerWeek", {
                                                required: "Days per week is required",
                                                pattern: {
                                                    value: /^[0-9]+$/,
                                                    message: "Enter a valid number of days",
                                                },
                                            })}
                                            className="mb-3"
                                            error={!!errors.contract_DaysPerWeek}
                                            helperText={errors.contract_DaysPerWeek?.message}
                                        />
                                    </div>
                                </>
                            )}

                            {activeStep === 3 && (
                                <>
                                    <div className="mb-4">
                                        <Controller
                                            name="selectedLicenses"
                                            control={control}
                                            rules={{
                                                required: "At least one license must be selected",
                                                validate: (value) =>
                                                    value.length > 0 || "Select at least one license",
                                            }}
                                            defaultValue={[]} // Default to an empty array
                                            render={({ field }) => (
                                                <div className="w-full p-4">
                                                    <label className="block font-medium text-black mb-6">
                                                        Select Licenses
                                                    </label>
                                                    <div className="flex flex-wrap gap-3 p-2 rounded-lg">
                                                        {licenses && licenses.map((license, index) => (
                                                            <FormControlLabel
                                                                key={index}
                                                                control={
                                                                    <Checkbox
                                                                        checked={field.value.some(
                                                                            (item) => item === license.name
                                                                        )}
                                                                        onChange={(e) => {
                                                                            const value = license.name;
                                                                            if (field.value.includes(value)) {
                                                                                field.onChange(
                                                                                    field.value.filter(
                                                                                        (item) => item !== value
                                                                                    )
                                                                                );
                                                                            } else {
                                                                                field.onChange([...field.value, value]);
                                                                            }
                                                                        }}
                                                                        value={license.name}
                                                                        style={{ display: "none" }}
                                                                    />
                                                                }
                                                                label={
                                                                    <span
                                                                        className={`px-4 py-4 shadow border rounded-lg transition-colors cursor-pointer ${field.value.includes(license.name)
                                                                            ? "bg-gray text-black border-blue"
                                                                            : "bg-white text-black border-gray"
                                                                            }`}
                                                                    >
                                                                        {license.name}
                                                                    </span>
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                    {errors.selectedLicenses && (
                                                        <p
                                                            style={{
                                                                color: "red",
                                                                fontSize: "0.8rem",
                                                                marginTop: "4px",
                                                            }}
                                                        >
                                                            {errors.selectedLicenses.message}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        />
                                           <TextField
                                                label="Document Number*"
                                                variant="standard"
                                                margin='normal'
                                                fullWidth
                                                {...register('documentNumber', { required: 'Document Number is required' })} // Validation for Surname
                                                className="mb-3"
                                                error={!!errors.documentNumber}
                                                helperText={errors.documentNumber?.message}
                                            />
                                            <DocumentSelected email={watch('email')} isEmployee={true}  />
                                    </div>
                                </>

                            )}

                            {activeStep === 4 && (
                                <>
                                    <div className="mb-4">
                                        <Controller
                                            name="skills"
                                            control={control}
                                            rules={{
                                                required: "At least one skill must be selected",
                                                validate: (value) =>
                                                    (value && value.length > 0) || "Select at least one skill",
                                            }}
                                            defaultValue={[]} // Ensure default value is an empty array
                                            render={({ field }) => (
                                                <>
                                                    <Autocomplete
                                                        multiple
                                                        options={skills}
                                                        getOptionLabel={(option) => option.name}
                                                        value={skills.filter((skill) => field.value.includes(skill.name))}
                                                        onChange={(_, selectedOptions) =>
                                                            field.onChange(selectedOptions.map((option) => option.name)) // Map to an array of names
                                                        }
                                                        isOptionEqualToValue={(option, value) => option._id === value._id} // Compare by _id
                                                        renderTags={(value, getTagProps) =>
                                                            value.map((option, index) => (
                                                                <Chip
                                                                    variant="outlined"
                                                                    label={option.name}
                                                                    {...getTagProps({ index })}
                                                                    key={option._id}
                                                                />
                                                            ))
                                                        }
                                                        renderInput={(params) => (
                                                            <TextField
                                                                {...params}
                                                                variant="standard"
                                                                label="Skills"
                                                                placeholder="Select skills"
                                                                className="w-full"
                                                                error={!!errors.skills}
                                                                helperText={errors.skills ? errors.skills.message : ""}
                                                            />
                                                        )}
                                                    />
                                                </>
                                            )}
                                        />
                                    </div>
                                    <FormControl fullWidth variant="standard" className="w-1/2">
                                        <InputLabel id="Role-label">Role</InputLabel>
                                        <Controller
                                            name="role"
                                            control={control}
                                            defaultValue=""
                                            margin='normal'
                                            rules={{ required: 'role is required' }} // Validation for Gender
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <Select
                                                        labelId="Role-label"
                                                        {...field}
                                                        displayEmpty
                                                        inputProps={{
                                                            'aria-label': 'Role',
                                                        }}
                                                        className="mb-3"
                                                    >
                                                        <MenuItem value="Staff">Staff</MenuItem>
                                                        <MenuItem value="Agent">Agent</MenuItem>
                                                        <MenuItem value="Admin">Admin</MenuItem>
                                                    </Select>
                                                    {error && <p style={{ color: '#d32f2f' }} className="text-sm">{error.message}</p>}
                                                </>
                                            )}
                                        />
                                    </FormControl>
                                </>
                            )}

                            {/* Step Navigation Buttons */}
                            <Box className="flex justify-between mt-6">
                                <Button
                                    variant="outlined"
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    className="text-gray-600 hover:bg-gray-100"
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={activeStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Modal>
            </div>

        </>
    );
};

export default EditEmployee;
