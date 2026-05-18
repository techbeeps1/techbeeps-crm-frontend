import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";

function DatePickerComponent({
  control,
  disabled,
  name,
  label = "Select Date",
  rules = {},
  minDate = null, 
  maxDate = null, 
  format = "dd/MM/yyyy",
  errors = {},
  ...props 
}) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => (
          <MobileDatePicker
            {...field}
            value={field.value ? new Date(field.value) : null}
            label={label}
            onChange={(date) => field.onChange(date)}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            format={format}
            slotProps={{
              textField: {
                variant: "standard",
                sx: { width: "100%" },
                error: !!errors[name],
                helperText: errors[name]?.message || "",
                ...props.textFieldProps, // Additional TextField props
              },
            }}
          />
        )}
      />
    </LocalizationProvider>
  );
}

export default DatePickerComponent;
