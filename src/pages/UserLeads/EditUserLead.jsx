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

const EditUserLead = ({ handler, setOpen, open, type = 'Lead', customerData }) => {
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

  const NewCustomer = async (e) => {

     if(e?.firstName.trim()==''){
      notifyError('First name is required');
      return;
    }
    else if(e?.firstName.trim().length < 3 || e?.firstName.trim().length > 30){
      notifyError('First name must be between 3 and 30 characters');
      return;
    }
     if (e?.lastName.trim() === '' ) {
      notifyError('Last name is required');
      return;
    }
      else if(e?.lastName.trim().length < 3 || e?.lastName.trim().length > 30){ 
      notifyError('Last name must be between 3 and 30 characters');
      return;
    }

     if (e?.gender.trim() === '' ) {
      notifyError('Gender is required');
      return;
    }

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
     if(loading) return;
      setLoading(true);

    try {
      const response = await axios.post(
        `${apiPath}/leads/leads`,
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
      notify('Lead updated successfully');
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
        Edit {type}
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
          Edit {type}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate id="customer-form">
       
              <div>
                <div style={{ display: 'flex', marginBottom: '15px' }}>
                  
                {customerData?.status !== "Converted" && (
                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                      name="status"
                      control={control}
                      defaultValue=""
                      
                      rules={{ required: "Status is required" }}
  render={({ field }) => (
    <TextField
      {...field}
      select
      label="Status*"
      variant="standard"
      error={!!errors.status}
    >
      <MenuItem value="" disabled>
        Select Status
      </MenuItem>
       <MenuItem value="New">New</MenuItem>
      <MenuItem value="Contacted">Contacted</MenuItem>
 
      <MenuItem value="In Progress">In Progress</MenuItem>
      <MenuItem value="Not Interested">Not Interested</MenuItem>
    </TextField>
  )}
/>
                  
                    {/* Error message */}
                  </FormControl> )}
                  <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                      name="typeOfCustomer" 
                      control={control} 
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
                </div>
             
   
                <div
                  style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}

                >
                  
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
                    <div className="md:flex" style={{ gap: '15px', marginBottom: '15px' }}>
        <TextField
          label="Postal Code*"
          variant="standard"
          fullWidth
   
          {...register(`postcode`, { required: 'Postal Code is required' })} // Validate postal code
          error={!!errors[type]?.postcode}
          helperText={errors[type]?.postcode ? errors[type]?.postcode.message : ''}
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

export default EditUserLead;

