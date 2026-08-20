import React from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Controller, Control, RegisterOptions } from "react-hook-form";

export interface DatePickerComponentProps {
  control: Control<any> | any;
  disabled?: boolean;
  name: string;
  label?: string;
  rules?: RegisterOptions | Record<string, any>;
  minDate?: Date | null;
  maxDate?: Date | null;
  format?: string;
  errors?: Record<string, any>;
  textFieldProps?: Record<string, any>;
  [key: string]: any;
}

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
}: DatePickerComponentProps) {
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
            onChange={(date: any) => field.onChange(date)}
            minDate={minDate || undefined}
            maxDate={maxDate || undefined}
            disabled={disabled}
            format={format}
            slotProps={{
              textField: {
                variant: "standard",
                sx: { width: "100%" },
                error: !!errors?.[name],
                helperText: errors?.[name]?.message || "",
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
