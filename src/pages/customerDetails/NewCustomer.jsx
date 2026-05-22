import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  InputLabel,
  Autocomplete,
  Chip,
  FormControlLabel,
} from '@mui/material';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewCustomer = ({ handler, setOpen, open, type }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
  } = useForm({});
  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const [step, setStep] = useState(1);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const notify = (message) =>
    toast.success(message, {
      autoClose: 2000,
    });
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const NewCustomer = async (e) => {
    try {
      const response = await axios.post(
        `${apiPath}/customer/customeradd`,
        { ...e, type: type },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      notify('Customer added successfully');
      handler();
    } catch (error) {  
        notifyError(
    error.response?.data?.error || 'Something went wrong'
  );
    }
  };

  useEffect(() => {
    axios
      .get(`${apiPath}/api/sale_group?type=country`)
      .then((response) => {
        const countryNames = response.data.map((country) => country.name);
        setCountries(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
    axios
      .get(`${apiPath}/api/sale_group?type=property`)
      .then((response) => {
        const countryNames = response.data.map((country) => country.name);
        setProperty(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const onSubmit = (data) => {
    NewCustomer(data);
    handleClose();
  };
  const goToNextStep = async () => {
    const isValid = await trigger();
    if (isValid) setStep(step + 1); // Move to next step if valid
  };
  const goToPreviousStep = () => setStep(step - 1);

  return (
    <div className="mb-5">
      <Button variant="contained" color="primary" onClick={handleOpen}>
        New {type}
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            fontSize: '28px',
            marginTop: 2,
            color: 'blue',
            fontWeight: '600',
          }}
        >
          New {type}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="customer-form">
            {step === 1 && (
              <div>
                <div style={{ display: 'flex', marginBottom: '15px' }}>
                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                      name="typeOfCustomer" // The name used for the input field
                      control={control} // Control from useForm
                      defaultValue="" // Set default value
                      rules={{ required: 'Type of customer is required' }} // Validation rule
                      render={({ field }) => (
                        <TextField
                          label="Type Of Customer*"
                          variant="standard"
                          select // Set as select dropdown
                          {...field} // Spread field props here
                        >
                          <MenuItem value="" disabled>
                            Select your customer type
                          </MenuItem>{' '}
                          {/* Optional placeholder */}
                          <MenuItem value="Commerical">Commercial</MenuItem>
                          <MenuItem value="Individual">Individual</MenuItem>
                        </TextField>
                      )}
                    />
                    {errors.typeOfCustomer && (
                      <span className="text-red-500">
                        {errors.typeOfCustomer.message}
                      </span>
                    )}{' '}
                    {/* Error message */}
                  </FormControl>
                </div>
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}
                >
                  <TextField
                    label="First Name*"
                    variant="standard"
                    fullWidth
                    {...register('firstName', {
                      required: 'First name is required',
                    })}
                    error={!!errors.firstName}
                    helperText={
                      errors.firstName ? errors.firstName.message : ''
                    }
                  />
                  <TextField
                    label="Last Name*"
                    variant="standard"
                    fullWidth
                    {...register('lastName', {
                      required: 'Last name is required',
                    })}
                    error={!!errors.lastName}
                    helperText={errors.lastName ? errors.lastName.message : ''}
                  />
                </div>
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}
                >
                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                      name="salutation"
                      control={control}
                      defaultValue="" // Set default value
                      render={({ field }) => (
                        <TextField
                          label="Salutation"
                          variant="standard"
                          select
                          {...field} // Spread field props here
                        >
                          <MenuItem value="" disabled>
                            Select Salutation
                          </MenuItem>{' '}
                          {/* Optional placeholder */}
                          <MenuItem value="Madam">Madam</MenuItem>
                          <MenuItem value="Mrs">Mrs.</MenuItem>
                          <MenuItem value="Mr">Mr</MenuItem>
                          <MenuItem value="Ms">Ms</MenuItem>
                        </TextField>
                      )}
                    />
                    {errors.salutation && (
                      <span className="text-red-500">
                        {errors.salutation.message}
                      </span>
                    )}{' '}
                    {/* Error message */}
                  </FormControl>

                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Controller
                      name="gender"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <Select
                          labelId="gender-label"
                          {...field}
                          displayEmpty
                          inputProps={{
                            'aria-label': 'Gender',
                          }}
                          className="mb-3"
                        >
                          <MenuItem value=""></MenuItem>
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      )}
                    />
                    {errors.gender && (
                      <span className="text-red-500">
                        {errors.gender.message}
                      </span>
                    )}
                  </FormControl>
                </div>
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}
                >
                  <TextField
                    label="Email*"
                    variant="standard"
                    fullWidth
                    {...register('email', { required: 'Email is required' })}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
                  />
                </div>
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}
                >
                  <TextField
                    label="Contact"
                    variant="standard"
                    fullWidth
                    {...register('contact', {
                      maxLength: {
                        value: 10,
                        message: 'Contact number must be at most 10 digits',
                      },
                      pattern: {
                        value: /^[0-9]*$/, // Ensure only numbers are allowed
                        message: 'Contact number must be numeric',
                      },
                    })}
                    error={!!errors.contact} // Highlight the field if there's an error
                    helperText={errors.contact?.message} // Display validation message
                  />
                  <TextField
                    label="Mobile*"
                    variant="standard"
                    fullWidth
                    {...register('mobile', {
                      maxLength: {
                        value: 13,
                        message: 'Contact number must be at most 10 digits',
                      },
                      required: 'field is required',
                    })}
                    error={!!errors.mobile}
                    helperText={errors.mobile ? errors.mobile.message : ''}
                  />
                </div>
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}
                >
                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                      name="taal" // The name used for the input field
                      control={control} // Control from useForm
                      defaultValue="" // Set default value
                      render={({ field }) => (
                        <TextField
                          label="Language"
                          variant="standard"
                          select // Set as select dropdown
                          {...field} // Spread field props here
                        >
                          <MenuItem value="" disabled>
                            Select Language
                          </MenuItem>{' '}
                          {/* Optional placeholder */}
                          <MenuItem value="Dutch">Dutch</MenuItem>
                          <MenuItem value="English">English</MenuItem>
                          <MenuItem value="German">German</MenuItem>
                          <MenuItem value="French">French</MenuItem>
                        </TextField>
                      )}
                    />
                    {errors.taal && (
                      <span className="text-red-500">
                        {errors.taal.message}
                      </span>
                    )}{' '}
                    {/* Error message */}
                  </FormControl>
                </div>
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}
                >
                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                      name="findUs" // The name used for the input field
                      control={control} // Control from useForm
                      defaultValue="" // Set default value
                      render={({ field }) => (
                        <TextField
                          label="Find us"
                          variant="standard"
                          select // Set as select dropdown
                          {...field} // Spread field props here
                        >
                          <MenuItem value="" disabled>
                            Select how you found us
                          </MenuItem>{' '}
                          {/* Optional placeholder */}
                          <MenuItem value="social_media">Social Media</MenuItem>
                          <MenuItem value="Google">Google</MenuItem>
                          <MenuItem value="Friend">Friend</MenuItem>
                          <MenuItem value="Website">Website</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                      )}
                    />
                    {errors.findUs && (
                      <span className="text-red-500">
                        {errors.findUs.message}
                      </span>
                    )}{' '}
                    {/* Error message */}
                  </FormControl>
                </div>
              </div>
            )}

            {step === 2 && (
              <AddressForm
                type="head"
                register={register}
                errors={errors}
                control={control}
                countries={countries}
                property={property}
              />
            )}
          </form>
        </DialogContent>
        <DialogActions>
          <div className="mb-4 flex gap-3 me-5">
            {step > 1 && (
              <Button
                onClick={goToPreviousStep}
                variant="outlined"
                color="secondary"
              >
                Back
              </Button>
            )}
            {step < 2 ? (
              <Button
                type="button"
                onClick={goToNextStep}
                variant="contained"
                color="primary"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                form="customer-form"
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            )}
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NewCustomer;

const AddressForm = ({
  type,
  register,
  errors,
  control,
  countries,
  property,
}) => {
  return (
    <div>
      <h2 className="font-bold text-xl my-3 mt-6">Address</h2>
      <div className="md:flex" style={{ gap: '15px', marginBottom: '15px' }}>
        <input type="hidden" {...register(`${type}.${type}`)} value={type} />
        <TextField
          label="Postcode*"
          variant="standard"
          fullWidth
          {...register(`${type}.postcode`, {
            required: 'Postcode is required',
          })} // Validate postcode
          error={!!errors[type]?.postcode}
          helperText={
            errors[type]?.postcode ? errors[type]?.postcode?.message : ''
          }
        />
        <TextField
          label="House Number*"
          variant="standard"
          fullWidth
          type="number"
          {...register(`${type}.houseNumber`, {
            required: 'House number is required',
          })} // Validate house number
          error={!!errors[type]?.houseNumber}
          helperText={
            errors[type]?.houseNumber ? errors[type]?.houseNumber?.message : ''
          }
        />
      </div>

      <div className="md:flex" style={{ gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Street*"
          variant="standard"
          fullWidth
          {...register(`${type}.street`, { required: 'Street is required' })} // Validate street
          error={!!errors[type]?.street}
          helperText={errors[type]?.street ? errors[type]?.street.message : ''}
        />
        <TextField
          label="City*"
          variant="standard"
          fullWidth
          {...register(`${type}.city`, { required: 'City is required' })} // Validate city
          error={!!errors[type]?.city}
          helperText={errors[type]?.city ? errors[type]?.city.message : ''}
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Addition"
          variant="standard"
          fullWidth
          {...register(`${type}.addition`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <FormControl fullWidth variant="standard" className="w-1/2">
          <Controller
            name={`${type}.typeOfProperty`} // Field name in schema
            control={control} // useForm control
            defaultValue="" // Default value
            // rules={{ required: 'field is required' }} // Validate country
            render={({ field }) => (
              <TextField
                label="Type of Property*"
                variant="standard"
                {...register(`${type}.typeOfProperty`, {
                  required: 'Property type is required',
                })}
                error={!!errors[type]?.typeOfProperty}
                helperText={
                  errors[type]?.typeOfProperty
                    ? errors[type]?.typeOfProperty.message
                    : ''
                }
                select // Dropdown for country
                {...field} // Spread field props here
              >
                {property.map((country, index) => (
                  <MenuItem key={index} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {/* {errors[type]?.country && (
            <span className="text-red text-sm">
              {errors[type]?.country.message}
            </span>
          )}{' '} */}
          {/* Error message */}
        </FormControl>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Floor"
          variant="standard"
          fullWidth
          {...register(`${type}.floor`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Distance to Lift"
          variant="standard"
          fullWidth
          {...register(`${type}.distanceToLift`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Distance to Apartment"
          variant="standard"
          fullWidth
          {...register(`${type}.distanceToApartment`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <FormControl fullWidth variant="standard" className="w-1/2">
          <Controller
            name={`${type}.country`} // Field name in schema
            control={control} // useForm control
            defaultValue="" // Default value
            // rules={{ required: 'field is required' }} // Validate country
            render={({ field }) => (
              <TextField
                label="Country"
                variant="standard"
                {...register(`${type}.country`, {
                  required: 'Country is required',
                })}
                error={!!errors[type]?.country}
                helperText={
                  errors[type]?.country ? errors[type]?.country.message : ''
                }
                select // Dropdown for country
                {...field} // Spread field props here
              >
                <MenuItem value="" disabled>
                  Select your country
                </MenuItem>
                {countries.map((country, index) => (
                  <MenuItem key={index} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          {/* {errors[type]?.country && (
            <span className="text-red text-sm">
              {errors[type]?.country.message}
            </span>
          )}{' '} */}
          {/* Error message */}
        </FormControl>
      </div>

      <div
        className="md:flex block"
        style={{ gap: '15px', marginBottom: '15px' }}
      >
        <FormControlLabel
          control={<Checkbox {...register(`${type}.hasElevator`)} />}
          label="Has Elevator"
        />
        <FormControlLabel
          control={<Checkbox {...register(`${type}.deliveringBoxes`)} />}
          label="Delivering Boxes"
        />
        <FormControlLabel
          control={<Checkbox {...register(`${type}.applyForPermit`)} />}
          label="Apply for Permit"
        />
      </div>
    </div>
  );
};
