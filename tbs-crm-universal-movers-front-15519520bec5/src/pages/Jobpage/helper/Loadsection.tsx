import React from 'react';
import { TextField, MenuItem, FormControlLabel, Checkbox, Switch, FormControl } from '@mui/material';
import { Controller, useWatch } from 'react-hook-form';

interface LoadSectionProps {
    hasElevator: boolean;
    setHasElevator: (value: boolean) => void;
    register: any;
    errors: any;
    control: any;
    unloadElevator: any;
    setUnloadElevator: (value: boolean) => void;
    countries: any;
}

const LoadSection: React.FC<LoadSectionProps> = ({ hasElevator, setHasElevator, register, errors, control, countries, unloadElevator, setUnloadElevator }) => {
    // Watch the value of the "unload.knownAddress" field
    const isKnownAddress = useWatch({ control, name: 'knownAddress' });

    return (
        <>
            <div className="space-y-4 p-4 shadow-md">
                <h2 className="text-lg font-semibold">Load</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Postcode*"
                        variant="standard"
                        fullWidth
                        {...register("load.postcode", { required: "Postcode is required" })}
                        error={!!errors.load?.postcode}
                        helperText={errors.load?.postcode?.message}
                    />
                    <TextField
                        label="House Number*"
                        variant="standard"
                        fullWidth
                        {...register("load.houseNumber", { required: "House number is required" })}
                        error={!!errors.load?.houseNumber}
                        helperText={errors.load?.houseNumber?.message}
                    />
                    <TextField
                        label="Addition"
                        variant="standard"
                        fullWidth
                        {...register("load.addition")}
                    />
                    <TextField
                        label="Street*"
                        variant="standard"
                        fullWidth
                        {...register("load.street", { required: "Street is required" })}
                        error={!!errors.load?.street}
                        helperText={errors.load?.street?.message}
                    />
                    <TextField
                        label="City*"
                        variant="standard"
                        fullWidth
                        {...register("load.city", { required: "City is required" })}
                        error={!!errors.load?.city}
                        helperText={errors.load?.city?.message}
                    />
                    <FormControl fullWidth variant="standard" className="w-1/2">
                        <Controller
                            name="load.country"
                            control={control}
                            rules={{ required: 'Country is required' }}
                            render={({ field }) => (
                                <TextField
                                    label="Country"
                                    variant="standard"
                                    select
                                    {...field}
                                    value={field.value || ''} // Fallback to an empty string if undefined
                                    InputProps={{
                                        classes: {
                                            underline: 'border-b-2 border-gray focus:border-blue-500',
                                        },
                                    }}
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    {countries.map((country:any, index:number) => (
                                        <MenuItem key={index} value={country}>{country}</MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />
                        {errors.load?.country && <span className="text-red">{errors.load?.country?.message}</span>}
                    </FormControl>
                    <FormControl fullWidth variant="standard" className="w-1/2">
                        <Controller
                            name="load.typeOfProperty"
                            control={control}
                            rules={{ required: 'Property is required' }}
                            render={({ field }) => (
                                <TextField
                                    label="Type of Property*"

                                    variant="standard"
                                    select
                                    {...field}
                                    value={field.value || ''} // Fallback to an empty string if undefined
                                    InputProps={{
                                        classes: {
                                            underline: 'border-b-2 border-gray focus:border-blue-500',
                                        },
                                    }}
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    <MenuItem value="House">House</MenuItem>
                                    <MenuItem value="Apartment">Apartment</MenuItem>
                                </TextField>
                            )}
                        />
                        {errors.load?.typeOfProperty && <span className="text-red-500">{errors.load?.typeOfProperty?.message}</span>}
                    </FormControl>

                    <TextField
                        label="Floor*"
                        variant="standard"
                        fullWidth
                        {...register("load.floor", { required: "Floor is required", pattern: { value: /^[0-9]*$/, message: "Floor must be a number" } })}
                        error={!!errors.load?.floor}
                        helperText={errors.load?.floor?.message}
                    />
                    <FormControlLabel
                        control={<Checkbox {...register("load.hasElevator")} checked={hasElevator} onChange={() => setHasElevator(!hasElevator)} />}
                        label="Is there an elevator?"
                    />
                    {hasElevator && (
                        <>
                            <TextField
                                label="Distance to Lift (meters)"
                                variant="standard"
                                fullWidth
                                {...register("load.distanceToLift", { required: "Distance to lift is required if elevator is present", pattern: { value: /^[0-9]*$/, message: "Distance must be a number" } })}
                                error={!!errors.load?.distanceToLift}
                                helperText={errors.load?.distanceToLift?.message}
                            />
                            <TextField
                                label="Distance to Apartment (meters)"
                                variant="standard"
                                fullWidth
                                {...register("load.distanceToApartment", { required: "Distance to apartment is required if elevator is present", pattern: { value: /^[0-9]*$/, message: "Distance must be a number" } })}
                                error={!!errors.load?.distanceToApartment}
                                helperText={errors.load?.distanceToApartment?.message}
                            />
                        </>
                    )}
                </div>
                <div className="md:flex flex-wrap">
                    <FormControlLabel
                        control={<Switch {...register("load.deliveringBoxes")} defaultChecked />}
                        label="Delivering boxes"
                    />
                    <FormControlLabel
                        control={<Switch {...register("load.placingSigns")} />}
                        label="Placing signs"
                    />
                    <FormControlLabel
                        control={<Switch {...register("load.applyForPermit")} />}
                        label="Apply for a permit"
                    />
                </div>
            </div>

            <div className="space-y-4 p-4 shadow-md">
                <div className="md:flex justify-between">
                    <h2 className="text-lg font-semibold">Unload</h2>
                    <FormControlLabel
                        control={
                            <Controller
                                name="knownAddress"
                                control={control}
                                defaultValue={false} // Ensure the default value is set
                                render={({ field }) => (
                                    <Checkbox
                                        {...field}
                                        checked={field.value} // Use field.value for checked state
                                        onChange={(event) => {
                                            field.onChange(event.target.checked); // Ensure the change is handled correctly
                                        }}
                                    />
                                )}
                            />
                        }
                        label="Address is Known"
                    />
                </div>
                {!isKnownAddress && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TextField
                                label="Postcode"
                                variant="standard"
                                fullWidth
                                {...register("unload.postcode", { required: "Postcode is required" })}
                                error={!!errors.unload?.postcode}
                                helperText={errors.unload?.postcode?.message}
                            />
                            <TextField
                                label="House Number"
                                variant="standard"
                                fullWidth
                                {...register("unload.houseNumber", { required: "House number is required" })}
                                error={!!errors.unload?.houseNumber}
                                helperText={errors.unload?.houseNumber?.message}
                            />
                            <TextField
                                label="Addition"
                                variant="standard"
                                fullWidth
                                {...register("unload.addition")}
                            />
                            <TextField
                                label="Street"
                                variant="standard"
                                fullWidth
                                {...register("unload.street", { required: "Street is required" })}
                                error={!!errors.unload?.street}
                                helperText={errors.unload?.street?.message}
                            />
                            <TextField
                                label="City"
                                variant="standard"
                                fullWidth
                                {...register("unload.city", { required: "City is required" })}
                                error={!!errors.unload?.city}
                                helperText={errors.unload?.city?.message}
                            />
                            <FormControl fullWidth variant="standard" className="w-1/2">
                                <Controller
                                    name="unload.country"
                                    control={control}
                                    rules={{ required: 'Country is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            label="Country"
                                            variant="standard"
                                            select
                                            {...field}
                                            value={field.value || ''} // Fallback to an empty string if undefined
                                            InputProps={{
                                                classes: {
                                                    underline: 'border-b-2 border-gray focus:border-blue-500',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            {countries.map((country:any, index:number) => (
                                                <MenuItem key={index} value={country}>{country}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                                {errors.unload?.country && <span className="text-red">{errors.unload?.country?.message}</span>}
                            </FormControl>
                            <FormControl fullWidth variant="standard" className="w-1/2">
                                <Controller
                                    name="unload.typeOfProperty"
                                    control={control}
                                    rules={{ required: 'Property is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            label="Type of Property"

                                            variant="standard"
                                            select
                                            {...field}
                                            value={field.value || ''} // Fallback to an empty string if undefined
                                            InputProps={{
                                                classes: {
                                                    underline: 'border-b-2 border-gray focus:border-blue-500',
                                                },
                                            }}
                                        >
                                            <MenuItem value="">Select</MenuItem>
                                            <MenuItem value="House">House</MenuItem>
                                            <MenuItem value="Apartment">Apartment</MenuItem>
                                        </TextField>
                                    )}
                                />
                                {errors.unload?.typeOfProperty && <span className="text-red-500">{errors.unload?.typeOfProperty?.message}</span>}
                            </FormControl>
                            <TextField
                                label="Floor"
                                variant="standard"
                                fullWidth
                                {...register("unload.floor", { required: "Floor is required", pattern: { value: /^[0-9]*$/, message: "Floor must be a number" } })}
                                error={!!errors.unload?.floor}
                                helperText={errors.unload?.floor?.message}
                            />
                            <FormControlLabel
                                control={<Checkbox {...register("unload.hasElevator")} checked={unloadElevator} onChange={() => setUnloadElevator(!unloadElevator)} />}
                                label="Is there an elevator?"
                            />
                            {unloadElevator && (
                                <>
                                    <TextField
                                        label="Distance to Lift (meters)"
                                        variant="standard"
                                        fullWidth
                                        {...register("unload.distanceToLift", { required: "Distance to lift is required if elevator is present", pattern: { value: /^[0-9]*$/, message: "Distance must be a number" } })}
                                        error={!!errors.unload?.distanceToLift}
                                        helperText={errors.unload?.distanceToLift?.message}
                                    />
                                    <TextField
                                        label="Distance to Apartment (meters)"
                                        variant="standard"
                                        fullWidth
                                        {...register("unload.distanceToApartment", { required: "Distance to apartment is required if elevator is present", pattern: { value: /^[0-9]*$/, message: "Distance must be a number" } })}
                                        error={!!errors.unload?.distanceToApartment}
                                        helperText={errors.unload?.distanceToApartment?.message}
                                    />
                                </>
                            )}
                        </div>
                        <div className="md:flex flex-wrap">
                            <FormControlLabel
                                control={<Switch {...register("unload.deliveringBoxes")} defaultChecked />}
                                label="Delivering boxes"
                            />
                            <FormControlLabel
                                control={<Switch {...register("unload.placingSigns")} />}
                                label="Placing signs"
                            />
                            <FormControlLabel
                                control={<Switch {...register("unload.applyForPermit")} />}
                                label="Apply for a permit"
                            />
                        </div>
                    </>
                )}

            </div>
        </>
    );
};

export default LoadSection;
