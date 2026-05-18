import React from "react";
import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ReactDatePicker: React.FC<any> = ({
    control,
    name,
    rules,
    showTimeSelect = false,
    dateFormat = "dd/MM/yyyy",
    placeholderText = "Select a date",
    defaultValue = '',
    minDate,
    maxDate
}) => {
    const years = Array.from({ length: new Date().getFullYear()+5 - 1990 + 1 }, (_, i) => 1990 + i);
  
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    
    return (
        <Controller

            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={rules}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
                <>
                    <DatePicker
                        selected={value}
                        onChange={(date) => onChange(date)}
                        showTimeSelect={showTimeSelect}
                        dateFormat={dateFormat}
                        renderCustomHeader={({
                            date,
                            changeYear,
                            changeMonth,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                          }) => (
                            <div
                              style={{
                                margin: 8,
                                display: "flex",
                                justifyContent: "between",
                                alignItems: "center",
                                gap:'5px'
                              }}
                            >
                              <button className="p-1 text-lg font-medium" type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
                                {"<"}
                              </button>
                              <select className="p-1 text-lg font-medium"
                                value={date.getFullYear()}
                                onChange={({ target: { value } }) => changeYear(Number(value))}
                              >
                                {years.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                    
                              <select className="p-1 text-lg font-medium"
                                value={months[date.getMonth()]}
                                onChange={({ target: { value } }) =>
                                  changeMonth(months.indexOf(value))
                                }
                              >
                                {months.map((option, index) => (
                                  <option key={index} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                    
                              <button className="p-1 text-lg font-medium" type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
                                {">"}
                              </button>
                            </div>
                          )}
                        isClearable
                        minDate={minDate || null}
                        maxDate={maxDate || null}
                        placeholderText={placeholderText}
                        className="w-full px-4 py-2 text-lg border border-gray rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                    {error && (
                        <p className="text-sm text-red-500 mt-1 font-medium">
                            {error.message}
                        </p>
                    )}
                </>
            )}
        />
    );
};

export default ReactDatePicker;
