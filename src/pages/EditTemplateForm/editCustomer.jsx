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
  InputLabel,
  Autocomplete,
  Chip,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { AddCircleOutline } from '@mui/icons-material';

const EditCustomer = ({
  customerData,
  handleEditSubmit,
  formType,
  handleCustomer,
}) => {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    defaultValues: (formType !== 'address' && customerData) || {},
  });
  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {setOpen(false); reset();};

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

  const newAddressHandler = async (data) => {
    try {
      let response = await axios.post(
        `${apiPath}/customer/customer/address`,
        data,
      );
      if (response.status === 200) {
        handleClose();
        handleCustomer();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmit = (data) => {
    if (formType === 'address') {
      newAddressHandler({ customerId: customerData._id, addressData: data });
    } else {
      handleEditSubmit(data);
      handleClose();
    }
  };

  return (
    <div className="">
      {formType === 'address' ? (
        <IconButton color="primary" onClick={handleOpen}>
          <AddCircleOutline fontSize="inherit" />
        </IconButton>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleOpen}
        >
          Edit
        </Button>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ marginY: 2, fontSize: '28px', color: 'blue' }}>
          Edit
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="customer-form">
            {formType === 'address' ? (
              <AddressForm
                register={register}
                errors={errors}
                control={control}
                countries={countries}
                property={property}
              />
            ) : (
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
                          label="Type Of Customer"
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
                <div className='sm:flex'
                  style={{ gap: '15px', marginBottom: '15px' }}
                >
                  <TextField
                    label="First Name"
                    variant="standard"
                    fullWidth
                    {...register('firstName', {
                      required: 'First name is required',
                    })}
                    InputProps={{
                      classes: {
                        underline: 'border-b-2 border-gray focus:border-blue',
                      },
                    }}
                    error={!!errors.firstName}
                    helperText={
                      errors.firstName ? errors.firstName.message : ''
                    }
                  />
                  <TextField
                    label="Last Name"
                    variant="standard"
                    fullWidth
                    {...register('lastName', {
                      required: 'Last name is required',
                    })}
                    error={!!errors.lastName}
                    helperText={errors.lastName ? errors.lastName.message : ''}
                  />
                </div>
                <div className='sm:flex'
                  style={{ gap: '15px', marginBottom: '15px' }}
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
                    label="Email"
                    variant="standard"
                    fullWidth
                    {...register('email', { required: 'Email is required' })}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
                  />
                </div>
                <div className='sm:flex'
                  style={{ gap: '15px', marginBottom: '15px' }}
                >
                  <TextField
                    label="Contact"
                    variant="standard"
                    fullWidth
                    {...register('contact')}
                  />
                  <TextField
                    label="Mobile"
                    variant="standard"
                    fullWidth
                    {...register('mobile')}
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
          </form>
        </DialogContent>
        <DialogActions>
          <div className="mb-4 flex gap-3 me-5">
            <Button onClick={handleClose} color="secondary" variant="contained">
              Cancel
            </Button>
            <Button
              type="submit"
              form="customer-form"
              variant="outlined"
              color="primary"
            >
              submit
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default EditCustomer;

const AddressForm = ({ register, errors, control, countries, property }) => {
  return (
    <div>
      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <FormControl fullWidth variant="standard" className="w-1/2">
          <Controller
            name="addressType" // The name used for the input field
            control={control} // Control from useForm
            defaultValue=""
            rules={{ required: 'field is required' }}
            render={({ field }) => (
              <TextField
                label="Address Type"
                variant="standard"
                select
                {...field}
              >
                <MenuItem value="billing">Billing</MenuItem>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            )}
          />
          {errors.addressType && (
            <span className="text-red-500 text-sm">
              {errors.addressType.message}
            </span>
          )}{' '}
          {/* Error message */}
        </FormControl>
      </div>
      <div className='sm:flex' style={{ gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Postcode"
          variant="standard"
          fullWidth
          {...register(`postcode`, { required: 'Postcode is required' })} // Validate postcode
          error={!!errors.postcode}
          helperText={errors.postcode ? errors.postcode.message : ''}
        />
        <TextField
          label="House Number"
          variant="standard"
          fullWidth
          type="number"
          {...register(`houseNumber`, { required: 'House number is required' })} // Validate house number
          error={!!errors.houseNumber}
          helperText={errors.houseNumber ? errors.houseNumber.message : ''}
        />
      </div>

      <div className='sm:flex' style={{gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Street"
          variant="standard"
          fullWidth
          {...register(`street`, { required: 'Street is required' })} // Validate street
          error={!!errors.street}
          helperText={errors.street ? errors.street.message : ''}
        />
        <TextField
          label="City"
          variant="standard"
          fullWidth
          {...register(`city`, { required: 'City is required' })} // Validate city
          error={!!errors.city}
          helperText={errors.city ? errors.city.message : ''}
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Addition"
          variant="standard"
          fullWidth
          {...register(`addition`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <FormControl fullWidth variant="standard" className="w-1/2">
          <Controller
            name={`typeOfProperty`} // Field name in schema
            control={control} // useForm control
            defaultValue="" // Default value
            rules={{ required: 'field is required' }} // Validate country
            render={({ field }) => (
              <TextField
                label="Type of Property"
                variant="standard"
                select // Dropdown for country
                {...field} // Spread field props here
              >
                {property &&
                  property.map((country, index) => (
                    <MenuItem key={index} value={country}>
                      {country}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />
          {errors.typeOfProperty && (
            <span className="text-red-500 text-sm">
              {errors.typeOfProperty.message}
            </span>
          )}{' '}
          {/* Error message */}
        </FormControl>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Floor"
          variant="standard"
          fullWidth
          {...register(`floor`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Distance to Lift"
          variant="standard"
          fullWidth
          {...register(`distanceToLift`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Distance to Apartment"
          variant="standard"
          fullWidth
          {...register(`distanceToApartment`)} // Optional, no validation
        />
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
        <FormControl fullWidth variant="standard" className="w-1/2">
          <Controller
            name={`country`} // Field name in schema
            control={control} // useForm control
            defaultValue="" // Default value
            rules={{ required: 'Country is required' }} // Validate country
            render={({ field }) => (
              <TextField
                label="Country"
                variant="standard"
                select // Dropdown for country
                {...field} // Spread field props here
              >
                <MenuItem value="" disabled>
                  Select your country
                </MenuItem>
                {countries &&
                  countries.map((country, index) => (
                    <MenuItem key={index} value={country}>
                      {country}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />
          {errors.country && (
            <span className="text-red-500 text-sm">
              {errors.country.message}
            </span>
          )}{' '}
          {/* Error message */}
        </FormControl>
      </div>

      <div className='md:flex' style={{ gap: '15px', marginBottom: '15px' }}>
        <FormControlLabel
          control={<Checkbox {...register(`hasElevator`)} />}
          label="Has Elevator"
        />
        <FormControlLabel
          control={<Checkbox {...register(`deliveringBoxes`)} />}
          label="Delivering Boxes"
        />
        <FormControlLabel
          control={<Checkbox {...register(`applyForPermit`)} />}
          label="Apply for Permit"
        />
      </div>
    </div>
  );
};
