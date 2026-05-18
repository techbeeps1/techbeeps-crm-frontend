
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    MenuItem, FormControl,
    FormControlLabel,
    Checkbox,
    IconButton
} from '@mui/material';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import { DeleteOutlineOutlined, EditOutlined } from '@mui/icons-material';


const CustomerAddress = ({ handleCustomer, address, customerId }: any) => {
    const [open, setOpen] = useState(false);
    const { register, handleSubmit, formState: { errors }, control } = useForm({
        defaultValues: address
    });
    const [countries, setCountries] = useState([]);
    const [property, setProperty] = useState([]);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        axios.get(`${apiPath}/api/sale_group?type=country`)
            .then((response) => {
                const countryNames = response.data.map(
                    (country: any) => country.name,
                );
                setCountries(countryNames);
            })
            .catch((error) => {
                console.error('Error fetching countries:', error);
            });
        axios.get(`${apiPath}/api/sale_group?type=property`)
            .then((response) => {
                const countryNames = response.data.map(
                    (country: any) => country.name,
                );
                setProperty(countryNames);
            })
            .catch((error) => {
                console.error('Error fetching countries:', error);
            });
    }, []);

    const handleDelete = async () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this address? This action cannot be undone.');
        if (!confirmDelete) {
            return; // Exit if the user cancels the action
        }
        try {
            let response = await axios.post(`${apiPath}/customer/delete_address`, { customerId: customerId, addressId: address._id });
            if (response.status === 200) {
                handleClose();
                handleCustomer();
            }
        } catch (error) {
            console.log('Error deleting address:', error);
        }
    };

    const editAddressHandler = async (data:any) => {
        try {
            let response = await axios.post(`${apiPath}/customer/update_address`, data)
            if (response.status === 200) {
                handleClose()
                handleCustomer()
            }
        } catch (error) {
            console.log(error)
        }
    }
    const onSubmit = (data: any) => {
        editAddressHandler(data)
    };

    return (
        <div className=''>
            <IconButton
                onClick={handleOpen}
            >
                <EditOutlined />
            </IconButton>
            {address?.addressType !== 'head' && <IconButton onClick={handleDelete}>
                <DeleteOutlineOutlined />
            </IconButton>}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ marginY: 2, fontSize: '28px', color: 'blue' }}>Edit</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit(onSubmit)} noValidate id="customer-form" >
                        <div>

                            {address.addressType !== 'head' && <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
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
                                    {errors.addressType && <span className="text-red-500 text-sm">{errors.addressType.message}</span>} {/* Error message */}
                                </FormControl>
                            </div>}
                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>

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

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
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

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <TextField
                                    label="Addition"
                                    variant="standard"
                                    fullWidth
                                    {...register(`addition`)} // Optional, no validation
                                />
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
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
                                                {property && property.map((country, index) => (
                                                    <MenuItem key={index} value={country}>{country}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                    {errors.typeOfProperty && <span className="text-red-500 text-sm">{errors.typeOfProperty.message}</span>} {/* Error message */}
                                </FormControl>
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <TextField
                                    label="Floor"
                                    variant="standard"
                                    fullWidth
                                    {...register(`floor`)} // Optional, no validation
                                />
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <TextField
                                    label="Distance to Lift"
                                    variant="standard"
                                    fullWidth
                                    {...register(`distanceToLift`)} // Optional, no validation
                                />
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <TextField
                                    label="Distance to Apartment"
                                    variant="standard"
                                    fullWidth
                                    {...register(`distanceToApartment`)} // Optional, no validation
                                />
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
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
                                                <MenuItem value="" disabled>Select your country</MenuItem>
                                                {countries && countries.map((country, index) => (
                                                    <MenuItem key={index} value={country}>{country}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}
                                    />
                                    {errors.country && <span className="text-red-500 text-sm">{errors.country.message}</span>} {/* Error message */}
                                </FormControl>
                            </div>

                            <div style={{ display: "flex", gap: "15px", marginBottom: "15px" }}>
                                <FormControlLabel
                                    control={
                                        <Controller
                                            name="hasElevator"
                                            control={control}
                                            defaultValue={true} // Default value set to true
                                            render={({ field }) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value || false} // Ensure it is always a boolean
                                                />
                                            )}
                                        />
                                    }
                                    label="Has Elevator"
                                />
                                <FormControlLabel
                                    control={
                                        <Controller
                                            name="deliveringBoxes"
                                            control={control}
                                            defaultValue={true}
                                            render={({ field }) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value || false}
                                                />
                                            )}
                                        />
                                    }
                                    label="Delivering Boxes"
                                />
                                <FormControlLabel
                                    control={
                                        <Controller
                                            name="applyForPermit"
                                            control={control}
                                            defaultValue={true}
                                            render={({ field }) => (
                                                <Checkbox
                                                    {...field}
                                                    checked={field.value || false}
                                                />
                                            )}
                                        />
                                    }
                                    label="Apply for Permit"
                                />

                            </div>
                        </div>
                    </form>
                </DialogContent>
                <DialogActions>
                    <div className="mb-4 flex gap-3 me-5">
                        <Button onClick={handleClose} color="secondary" variant="contained">Cancel</Button>
                        <Button type="submit" form="customer-form" variant="outlined" color="primary">submit</Button>
                    </div>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CustomerAddress;


