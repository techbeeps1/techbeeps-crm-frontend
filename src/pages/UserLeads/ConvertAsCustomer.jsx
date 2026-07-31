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

const ConvertAsCustomer = ({ handler, setOpen, open, type = 'Lead', customerData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    trigger,
    watch
    
  } = useForm({defaultValues: customerData || {}});
  const allValues = watch();
  const [countries, setCountries] = useState([]);
  const [property, setProperty] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

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

  const NewCustomer = async (e) => {

     if (e?.email.trim() === '' ) {
      notifyError('Email is required');
      return;
    }
  
       if(!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e?.email.trim())){
      notifyError('Invalid email address');
      return;
    }
    
    if (e?.contact == '' ) {
      notifyError('Contact number is required');
      return;
    }
    else if(e?.contact && (e?.contact.length < 10 || e?.contact.length > 13)){

      notifyError('Contact number must be between 10 and 13 digits');
      return;
    }
   
     if(e?.mobile && (e?.mobile.length < 10 || e?.mobile.length > 13)){

      notifyError('Mobile number must be between 10 and 13 digits');
      return;
    }
   
     if (e?.postcode.trim() === '' ) {
      notifyError('Postcode is required');
      return;
    }
    else if(e?.postcode.trim().length < 3 || e?.postcode.trim().length > 12){
      notifyError('Postcode must be between 3 and 12 characters');
      return;

    }

    if (e?.city.trim() === '' ) {
      notifyError('City is required');
      return;
    }
    else if(e?.city.trim().length < 2 || e?.city.trim().length > 55){
      notifyError('City must be between 2 and 55 characters');
      return;
    }

       if (e?.postcode.trim() === '' ) {
      notifyError('Postcode is required');
      return;
    }
    else if(e?.postcode.trim().length < 3 || e?.postcode.trim().length > 12){
      notifyError('Postcode must be between 3 and 12 characters');
      return;

    }

    if (e?.houseNumber.trim() === '' ) {
      notifyError('House number is required');
      return;
    }
    else if(e?.houseNumber.trim().length < 1 || e?.houseNumber.trim().length > 15){
      notifyError('House number must be between 1 and 15 characters');
      return;
    }
    if (e?.street.trim() === '' ) {
      notifyError('Street is required');
      return;
    }else if(e?.street.trim().length < 2 || e?.street.trim().length > 55){
      notifyError('Street must be between 2 and 55 characters');
      return;
    }
    if (e?.typeOfProperty.trim() === '' ) {
      notifyError('Type of property is required');
      return;
    }
    if (e?.country.trim() === '' ) {
      notifyError('Country is required');
      return;
    }
    
   



     if(loading) return;
      setLoading(true);

    try {
      const response = await axios.post(
        `${apiPath}/leads/convert-as-customer`,
        { ...e, type: type },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if(response.data.success=== true){
        handleClose();
        handler();
        reset();
        setLoading(false);
      notify('Lead Converted As Customer');
      }
      
    } catch (error) {  
      console.log(error)
      setLoading(false);
        notifyError(
    error.response?.data?.error || 'Something went wrong'
  );
    }
  };


  const onSubmit = (data) => {
    NewCustomer(data);
   
  };





  return (
    <div className="mb-5">
      <Button variant="contained" color="secondary" onClick={handleOpen}>
        Convert as Customer
      </Button>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle
          sx={{
            fontSize: '28px',
            marginTop: 2,
            color: '#333',
            fontWeight: '600',
          }}
        >
          Convert as Customer
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="customer-form">
       
              <div>

                <div
                  
                  className="flex md:gap-2 gap-3 mb-2 md:flex-row flex-col"
                >
                  <TextField
                    label="Email*"
                    variant="standard"
                    fullWidth
                    {...register('email', { required: 'Email is required' })}
                    error={!!errors.email}
                    helperText={errors.email ? errors.email.message : ''}
                  />
                   <TextField
                    label="Contact Number"
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
                                      label="Mobile Number"
                                      variant="standard"
                                      fullWidth
                                      {...register('mobile', {
                                        maxLength: {
                                          value: 13,
                                          message: 'Contact number must be at most 10 digits',
                                        },
                                        
                                      })}
                                      error={!!errors.mobile}
                                      helperText={errors.mobile ? errors.mobile.message : ''}
                                    />
         <TextField
  type="hidden"
  {...register("type")}
  value="Customer"
/>

                </div>
             

      <AddressForm
                type="head"
                register={register}
                errors={errors}
                control={control}
                countries={countries}
                property={property}
              />
              </div>
          

      
          </form>
        </DialogContent>
        <DialogActions>
          <div className="mb-4 flex gap-3 me-5">
        
              <Button
                type="submit"
                form="customer-form"
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConvertAsCustomer;


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
  

        <TextField
          label="Postcode*"
          variant="standard"
          fullWidth
          {...register(`postcode`, {
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
          {...register(`houseNumber`, {
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
          {...register(`street`, { required: 'Street is required' })} // Validate street
          error={!!errors[type]?.street}
          helperText={errors[type]?.street ? errors[type]?.street.message : ''}
        />
        <TextField
          label="City*"
          variant="standard"
          fullWidth
          {...register(`city`, { required: 'City is required' })} // Validate city
          error={!!errors[type]?.city}
          helperText={errors[type]?.city ? errors[type]?.city.message : ''}
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
            // rules={{ required: 'field is required' }} // Validate country
            render={({ field }) => (
              <TextField
                label="Type of Property*"
                variant="standard"
                {...register(`typeOfProperty`, {
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
          {...register(`floor`)} // Optional, no validation
        />
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
          <FormControl fullWidth variant="standard" className="w-1/2">
          <Controller
            name={`country`} // Field name in schema
            control={control} // useForm control
            defaultValue="" // Default value

            render={({ field }) => (
              <TextField
                label="Country*"
                variant="standard"
                {...register(`country`, {
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
      
        </FormControl>
      </div>



    </div>
  );
};
