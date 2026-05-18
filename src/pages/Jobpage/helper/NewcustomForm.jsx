import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField, Select,
    MenuItem, FormControl,
    InputLabel, Autocomplete, Chip, FormControlLabel
} from '@mui/material';
import { apiPath } from '../../../../apiPath';
import axios from 'axios';


const CustomerForm = ({ register, errors, control, countries }) => {
    
    return (
        <div className='mb-5'>
            <div style={{ display: "flex", marginBottom: "15px" }}>
                <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                        name="client.typeOfCustomer" // The name used for the input field
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
                                <MenuItem value="" disabled>Select your customer type</MenuItem> {/* Optional placeholder */}
                                <MenuItem value="Commerical">Commercial</MenuItem>
                                <MenuItem value="Particular">Individual</MenuItem>
                            </TextField>
                        )}
                    />
                    {errors.client?.typeOfCustomer && <span className="text-red-500">{errors.client?.typeOfCustomer?.message}</span>} {/* Error message */}
                </FormControl>

            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <TextField
                    label="First Name"
                    variant="standard"
                    fullWidth
                    {...register('client.firstName', { required: 'First name is required' })}

                    error={!!errors.firstName}
                    helperText={errors.client?.firstName ? errors.client?.firstName?.message : ''}
                />
                <TextField
                    label="Last Name"
                    variant="standard"
                    fullWidth
                    {...register('client.lastName', { required: 'Last name is required' })}

                    error={!!errors.lastName}
                    helperText={errors.client?.lastName ? errors.client?.lastName?.message : ''}
                />
            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                        name="client.salutation"
                        control={control}
                        rules={{ required: 'field is required' }} // Validation rule
                        defaultValue="" // Set default value
                        render={({ field }) => (
                            <TextField
                                label="Salutation"
                                variant="standard"
                                select
                                {...field} // Spread field props here
                            >
                                <MenuItem value="" disabled>Select Salutation</MenuItem> {/* Optional placeholder */}
                                <MenuItem value="Madam">Madam</MenuItem>
                                <MenuItem value="Mrs">Mrs.</MenuItem>
                                <MenuItem value="Mr">Mr</MenuItem>
                                <MenuItem value="Ms">Ms</MenuItem>
                            </TextField>
                        )}
                    />
                    {errors.client?.salutation && <span className="text-red-500">{errors.client?.salutation?.message}</span>} {/* Error message */}
                </FormControl>


                <FormControl fullWidth variant="standard" className="w-1/2">
                    <InputLabel id="gender-label">Gender</InputLabel>
                    <Controller
                        name="client.gender"
                        control={control}
                        defaultValue=""
                        rules={{ required: 'field is required' }} // Validation rule

                        render={({ field }) => (
                            <Select
                                labelId="gender-label"
                                {...field}
                                displayEmpty
                                inputProps={{
                                    'aria-label': 'Gender',
                                }}
                                className='mb-3'

                            >
                                <MenuItem value="">
                                </MenuItem>
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        )}
                    />
                    {errors.client?.gender && <span className="text-red-500">{errors.client?.gender?.message}</span>}
                </FormControl>
            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <TextField
                    label="Email"
                    variant="standard"
                    fullWidth
                    {...register('client.email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'Invalid email address',
                        },
                    })}
                    error={!!errors.client?.email}
                    helperText={errors.client?.email ? errors.client?.email?.message : ''}
                />
            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>

                <TextField
                    label="Contact"
                    variant="standard"
                    fullWidth
                    {...register('client.contact', { required: 'Contact field is required' })}
                    error={!!errors.client?.contact}
                    helperText={errors.client?.contact ? errors.client?.contact?.message : ''}
                />

                <TextField
                    label="Mobile"
                    variant="standard"
                    fullWidth
                    {...register('client.mobile', {
                        required: 'Mobile field is required',
                        pattern: {
                            value: /^[0-9]{10}$/, // Assuming a 10-digit mobile number; adjust as necessary
                            message: 'Mobile number must be 10 digits'
                        }
                    })}
                    error={!!errors.client?.mobile}
                    helperText={errors.client?.mobile ? errors.client?.mobile?.message : ''}
                />


            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                        name="client.taal" // The name used for the input field
                        control={control} // Control from useForm
                        defaultValue="" // Set default value
                        rules={{ required: 'field is required' }} // Validation rule

                        render={({ field }) => (
                            <TextField
                                label="Language"
                                variant="standard"
                                select // Set as select dropdown
                                {...field} // Spread field props here

                            >
                                <MenuItem value="" disabled>Select Language</MenuItem> {/* Optional placeholder */}
                                <MenuItem value="Dutch">Dutch</MenuItem>
                                <MenuItem value="English">English</MenuItem>
                                <MenuItem value="German">German</MenuItem>
                                <MenuItem value="French">French</MenuItem>
                            </TextField>
                        )}
                    />
                    {errors.client?.taal && <span className="text-red-500">{errors.client?.taal?.message}</span>} {/* Error message */}
                </FormControl>

            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                        name="client.findUs" // The name used for the input field
                        control={control} // Control from useForm
                        defaultValue="" // Set default value
                        rules={{ required: 'field is required' }} // Validation rule

                        render={({ field }) => (
                            <TextField
                                label="Find us"
                                variant="standard"
                                select // Set as select dropdown
                                {...field} // Spread field props here

                            >
                                <MenuItem value="" disabled>Select how you found us</MenuItem> {/* Optional placeholder */}
                                <MenuItem value="social_media">Social Media</MenuItem>
                                <MenuItem value="Google">Google</MenuItem>
                                <MenuItem value="Friend">Friend</MenuItem>
                                <MenuItem value="Website">Website</MenuItem>
                                <MenuItem value="Other">Other</MenuItem>
                            </TextField>
                        )}
                    />
                    {errors.client?.findUs && <span className="text-red-500">{errors.client?.findUs?.message}</span>} {/* Error message */}
                </FormControl>

            </div>

            <h2 className='font-bold text-xl my-3 mt-6' >Address</h2>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <TextField
                    label="Postcode"
                    variant="standard"
                    fullWidth
                    {...register('client.postcode', {
                        required: 'Postcode field is required',
                    })}
                    error={!!errors.client?.postcode}
                    helperText={errors.client?.postcode ? errors.client?.postcode?.message : ''}
                />

                <TextField
                    label="House Number"
                    variant="standard"
                    fullWidth
                    type="number"
                    {...register('client.houseNumber', {
                        required: 'House number field is required',
                    })}
                    error={!!errors.client?.houseNumber}
                    helperText={errors.client?.houseNumber ? errors.client?.houseNumber?.message : ''}
                />
            </div>

            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <TextField
                    label="Street"
                    variant="standard"
                    fullWidth
                    {...register('client.street', {
                        required: 'Street field is required',
                    })}
                    error={!!errors.client?.street}
                    helperText={errors.client?.street ? errors.client?.street?.message : ''}
                />
                <TextField
                    label="City"
                    variant="standard"
                    fullWidth
                    {...register('client.city', {
                        required: 'City field is required',
                    })}
                    error={!!errors.client?.city}
                    helperText={errors.client?.city ? errors.client?.city?.message : ''}
                />
            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <TextField
                    label="Addition"
                    variant="standard"
                    fullWidth
                    {...register('client.addition')}

                />
            </div>
            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                <FormControl fullWidth variant="standard" className="w-1/2">
                    <Controller
                        name="client.country"
                        control={control}
                        rules={{ required: 'Country is required' }}
                        render={({ field }) => (
                            <TextField
                                label="Country"
                                variant="standard"
                                select
                                {...field}
                                value={field.value || ''} // Fallback to an empty string if undefined
                            >
                                <MenuItem value="">Select</MenuItem>
                                {countries.map((country, index) => (
                                    <MenuItem key={index} value={country}>{country}</MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                    {errors.client?.country && <span className="text-red-500">{errors.client?.country?.message}</span>}
                </FormControl>

            </div>
        </div>
    );
};

export default CustomerForm;
