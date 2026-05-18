import React, { useEffect, useState } from 'react';
import { IconButton, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CloseIcon from '@mui/icons-material/Close';
import { MobileDatePicker , TimePicker } from '@mui/x-date-pickers';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';

const TimeSlots = ({ availableTimes, Data, previousData ,selectedDate}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState(null);
  const [data, setData] = useState([]);
  const [company, setCompany] = useState();
  const [relatedFields, setRelatedField] = useState([]);
  const [scheduledAppointments, setScheduledAppointments] = useState([]);
  const [appointmentId, setAppointmentId] = useState(null);
  const { control, handleSubmit, formState: { errors },setValue, watch, reset, register } = useForm({
    defaultValues: {
      appointmentType: '',
      date: '',
      startTime: '',
      endTime: '',
      participants: '',
      notes: '',
      workLocation: '',
      departureLocation: ''
    }
  });
  const appointmentType = watch('appointmentType');

  useEffect(() => {
    if (selectedDate) {
      reset((prevValues) => ({
        ...prevValues,
        date: selectedDate,
      }));
    }
  }, [selectedDate, reset]);
  

  useEffect(() => {
    setRelatedField(data.find((item) => item.name === appointmentType)?.extraFields);
  }, [appointmentType])

  useEffect(() => {
    if (selectedTime) {
      reset((prevValues)=>({
        ...prevValues,
        startTime: new Date(new Date().setHours(...selectedTime?.split(':').map(Number), 0, 0)),
        endTime: new Date(new Date().setHours(...getEndTime(selectedTime).split(':').map(Number), 0, 0))
      }));
    }
  }, [selectedTime, reset]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const generateTimeSlots = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      const hour = i.toString().padStart(2, '0') + ':00';
      hours.push(hour);
    }
    return hours;
  };

  const isCurrentTimeSlot = (hour) => {
    return (
      currentTime.getHours() === parseInt(hour.split(':')[0]) &&
      currentTime.getMinutes() < 60
    );
  };

  const handleClick = (time) => {
    setSelectedTime(time);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTime(null);
    setAppointmentId(null)
  };

  const handleAllinputs = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/input?inputFor=Appointment`);
      setData(response["data"]);
    } catch (err) {
      console.error(err);
    }
  };
  const handleCompanyDetails = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/company-details`);
      setCompany(response["data"]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleAllinputs();
    handleCompanyDetails()
  }, []);

  const getEndTime = (startTime) => {
    if (!startTime) return ''; // Return an empty string if startTime is null
    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = (startHour + 1) % 24; // Wraps around after 23:00 to 00:00
    return endHour.toString().padStart(2, '0') + ':00';
  };
  const isWithinScheduledTime = (time) => {
    const currentDate = new Date(); // Today's date
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    return scheduledAppointments.some(({ startTime, endTime }) => {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);
      const start = new Date(currentYear, currentMonth, currentDay, startDate.getHours(), startDate.getMinutes());
      const end = new Date(currentYear, currentMonth, currentDay, endDate.getHours(), endDate.getMinutes());
      const [hour, minute] = time.split(':').map(Number);
      const slotTime = new Date();
      slotTime.setHours(hour, minute, 0, 0);
      return slotTime >= start && slotTime < end;
    });
  };


  useEffect(() => {
    if (previousData) {
      const updatedAppointments = previousData.map(item => ({
        startTime: new Date(item.departureTime),
        endTime: new Date(item.arrivalTime),
        data: item
      }));
      setScheduledAppointments([
        ...updatedAppointments
      ]);
    }
    reset()
  }, [previousData]);

  const onSubmit = (data) => {
    setScheduledAppointments([
      ...scheduledAppointments,
      { startTime: data.departureTime, endTime: data.arrivalTime }
    ]);
    Data({ ...data, id: appointmentId ? appointmentId._id : null })
    handleClose();
  };
  const handleDeleteClick = async () => {
    try {
      const response = await axios.delete(`${apiPath}/api/appointment/${appointmentId._id}`);
      handleClose()
      setScheduledAppointments([]);
      console.log("Deleted Appointment Data:", appointmentId);
    } catch (error) {
      console.error('Error creating appointment:', error.response ? error.response.data : error.message);
    }
  };

  const handleEditClick = (appointmentData) => {
    setAppointmentId(appointmentData)
    reset({
      appointmentType: appointmentData?.appointmentType, date: appointmentData?.date, arrivalTime: appointmentData?.arrivalTime,
      departureLocation: appointmentData?.departureLocation, endTime: appointmentData?.endTime, notes: appointmentData?.notes, startTime: appointmentData?.startTime,
      workLocation: appointmentData?.workLocation, departureTime: appointmentData?.departureTime,
      ...appointmentData.additionalFields
    })
    setOpen(true);
  };

  const calculateOverlayPosition = () => {
    if (!previousData || !previousData[0]) return { topPosition: 0, overlayHeight: 0 };
    const { departureTime, arrivalTime } = previousData[0];
    const departureDate = new Date(departureTime);
    const arrivalDate = new Date(arrivalTime);
    const startHour = departureDate.getHours();
    const startMinute = departureDate.getMinutes();
    const endHour = arrivalDate.getHours();
    const endMinute = arrivalDate.getMinutes();
    const slotHeight = 49; // Adjust to match your slot height in pixels
    const topPosition = startHour * slotHeight + (startMinute / 60) * slotHeight;
    const overlayHeight = (endHour - startHour) * slotHeight + ((endMinute - startMinute) / 60) * slotHeight;
    return { topPosition, overlayHeight };
  };

  const { topPosition, overlayHeight } = calculateOverlayPosition();
  const matchedData = previousData?.[0];


  return (
    <Box className="w-full bg-white relative">
      {previousData?.length > 0 && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(matchedData); // Call handleEditClick with the matched data
          }}
          style={{
            position: 'absolute',
            top: topPosition,
            height: overlayHeight,
            left: '80px',
            width: '60%',
            border: '5px solid gray',
            borderRadius:'10px',
            backgroundColor: 'white',
            zIndex: 9999,
            pointerEvents: 'auto',
            display: 'flex',       
            alignItems: 'center',     
            justifyContent: 'center', 
            cursor: 'pointer'
          }}
        >
          <img className='h-60' style={{maxWidth:'100%', maxHeight:'90%'}} src="https://media1.giphy.com/media/JZLzh2I7wlYQAt84Xp/giphy.gif?cid=6c09b952oosxw0dtr289j0qe7mctmb91bqw5h325li5zdcf6&ep=v1_internal_gif_by_id&rid=giphy.gif" alt="" />
        </div>
      )}
      {generateTimeSlots().map((time, index) => (
        <Box
          key={index}
          className={`flex items-center justify-between p-3 ${availableTimes.includes(time) ? 'cursor-pointer' : 'bg-white'}`}
          style={{
            borderBottom: index === 23 ? 'none' : '1px solid #e0e0e0',
            position: 'relative',
            backgroundColor: availableTimes?.includes(time) ? 'aqua' : 'white',
            zIndex: isWithinScheduledTime(time) ? 10 : 1, // Set higher z-index for scheduled slots
          }}
          onClick={() => {
            const matchedAppointment = scheduledAppointments.find(appointment => {
              const startTime = new Date(appointment?.startTime);
              return !isNaN(startTime) && startTime.getHours() === parseInt(time.split(':')[0]) &&
                startTime.getMinutes() === parseInt(time.split(':')[1]);
            });
            matchedAppointment ? handleEditClick(matchedAppointment.data) : handleClick(time);
          }}
        >
          <Typography>{time}</Typography>
          {isWithinScheduledTime(time) && (
            <>
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(100, 0, 50, 0.5)', // Semi-transparent overlay
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 15, // Overlay on top of slot
                  pointerEvents: 'none', // Allow clicks to pass through
                }}
              />
            </>
          )}
          {isCurrentTimeSlot(time) && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: `${(currentTime.getMinutes() / 60) * 100}%`,
                height: '2px',
                width: '100%',
                backgroundColor: 'red',
              }}
            />
          )}
        </Box>
      ))}
      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <div className="p-2">
          <Box display="flex" justifyContent="space-between" alignItems="center" pt={1}>
            <DialogTitle>Schedule an Appointment</DialogTitle>
            <IconButton onClick={handleClose} style={{ position: 'absolute', right: 10, top: 10 }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <form onSubmit={(e) => { e.stopPropagation(); handleSubmit(onSubmit)(e) }}>
            <DialogContent>
              <FormControl fullWidth variant="standard" margin="dense">
                <InputLabel>Appointment type*</InputLabel>
                <Controller
                  name="appointmentType"
                  control={control}
                  rules={{ required: "Appointment type is required" }}
                  render={({ field }) => (
                    <Select {...field} value={field.value ?? ''} error={!!errors.appointmentType}>
                      {data.length > 0 ? (
                        data.map((item, index) => (
                          <MenuItem key={index} value={item.name}>
                            {item.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="">Loading...</MenuItem>
                      )}
                    </Select>
                  )}
                />
                {errors.appointmentType && (
                  <Typography color="error">{errors.appointmentType.message}</Typography>
                )}
              </FormControl>
              <Box display="flex" flexWrap="wrap" gap={2} mt={2}> 
                <Controller
                  name="date"
                  control={control}
                  rules={{ required: "Date is required" }}
                  render={({ field }) => (
                    <MobileDatePicker 
                      {...field}
                      value={field.value ? new Date(field.value) : null}
                      label="Date"
                      onChange={(date) => field.onChange(date)}
                      minDate={new Date()}
                      slotProps={{
                        textField: {
                          variant: "standard",
                          sx: { width: '100%' }, // Apply width as needed
                          error: !!errors.date,
                          helperText: errors.date ? errors.date.message : "",
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="startTime"
                  control={control}
                  rules={{ required: "Start time is required" }}
                  render={({ field, fieldState }) => (
                    <TimePicker
                      {...field}
                      label="Start time"
                      value={field.value ? new Date(field.value) : null} // Ensure value is a Date object
                      onChange={(date) => field.onChange(date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))}
                      ampm={false}
                      slotProps={{
                        textField: {
                          variant: "standard",
                          sx: { width: '100%' },
                          error: !!fieldState?.error,
                          helperText: fieldState?.error?.message || "",
                        },
                      }}
                    />
                  )}
                />

                <Controller
                  name="endTime"
                  control={control}
                  rules={{ required: "End time is required" }}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      label="End time"
                      value={field.value ? new Date(field.value) : null} // Ensure value is a Date object
                      onChange={(date) => field.onChange(date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))}
                      ampm={false}
                      slotProps={{
                        textField: {
                          variant: "standard",
                          sx: { width: '100%' }, // Apply width as needed
                          error: !!errors.endTime,
                          helperText: errors.endTime ? errors.endTime.message : "",
                        },
                      }}
                    />
                  )}
                />
              </Box>

              <Box display="flex" flexWrap="wrap" gap={2} mt={2} mb={2}>
                <Controller
                  name="departureTime"
                  control={control}
                  rules={{ required: "Start time is required" }}
                  render={({ field, fieldState }) => (
                    <TimePicker
                      {...field}
                      label="Overwrite departure time*"
                      value={field.value ? new Date(field.value) : null} // Ensure value is a Date object
                      onChange={(date) => field.onChange(date)}
                      ampm={false}
                      slotProps={{
                        textField: {
                          variant: "standard",
                          sx: { width: '100%' },
                          error: !!fieldState?.error,
                          helperText: fieldState?.error?.message || "",
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="arrivalTime"
                  control={control}
                  rules={{ required: "End time is required" }}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      label="Overwrite pilot arrival time*"
                      value={field.value ? new Date(field.value) : null} // Ensure value is a Date object
                      onChange={(date) => field.onChange(date)}
                      ampm={false}
                      slotProps={{
                        textField: {
                          variant: "standard",
                          sx: { width: '100%' }, // Apply width as needed
                          error: !!errors.arrivalTime,
                          helperText: errors.arrivalTime ? errors.arrivalTime.message : "",
                        },
                      }}
                    />
                  )}
                />
              </Box>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {relatedFields ? relatedFields.map((item, index) => (
                  <div key={index} style={{ flex: '1 0 48%' }}>
                    <TextField
                      label={item.label}
                      type={item.type}
                      variant="standard"
                      fullWidth
                      margin="normal"
                      {...register(item.name, { required: item.required })}
                      error={!!errors[item.name]} // Access the error state using item.name
                      helperText={errors[item.name] ? errors[item.name]?.message : ""}
                    />
                  </div>
                )) : <TextField
                  label="How many participants are needed?*"
                  variant="standard"
                  fullWidth
                  margin="dense"
                  {...register("participants", { required: "Number of participants is required" })}
                  error={!!errors.participants}
                  helperText={errors.participants ? errors.participants.message : ""}
                />}
              </div>
              <TextField
                label="Notes"
                variant="standard"
                fullWidth
                multiline
                rows={2}
                margin="dense"
                {...register("notes")}
              />

              <Box display="flex" gap={2}>
                <FormControl fullWidth variant="standard" margin="dense">
                  <InputLabel>Work location*</InputLabel>
                  <Controller
                    name="workLocation"
                    control={control}
                    defaultValue=""  // Set a default value to prevent the undefined issue
                    rules={{ required: "Work location is required" }} // Apply validation rules
                    render={({ field, fieldState }) => (
                      <>
                        <Select
                          {...field}
                          value={field.value ?? ''} // Ensure the value is not undefined
                        >
                          <MenuItem value="Load">Load</MenuItem>
                          <MenuItem value="Unload">Unload</MenuItem>
                        </Select>
                        {fieldState?.error && (
                          <Typography color="error" variant="caption">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </>
                    )}
                  />
                </FormControl>

                <FormControl fullWidth variant="standard" margin="dense">
                  <InputLabel>Departure location*</InputLabel>
                  <Controller
                    name="departureLocation"
                    control={control}
                    rules={{ required: "Departure location is required" }} // Apply validation rules
                    render={({ field, fieldState }) => (
                      <>
                        <Select
                          {...field}
                          value={field.value ?? ''} // Ensure the value is not undefined
                        >
                          <MenuItem value={`Company - ${company?.companyName} ${company?.companyAddress},${company?.companyCountry}`} >Company - {company?.companyName} {company?.companyAddress},{company?.companyCountry}</MenuItem>
                        </Select>
                        {fieldState?.error && (
                          <Typography color="error" variant="caption">
                            {fieldState.error.message}
                          </Typography>
                        )}
                      </>
                    )}
                  />
                </FormControl>

              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} variant="outlined" color="primary">
                Cancel
              </Button>
              {appointmentId && <Button onClick={handleDeleteClick} type='reset' variant="contained" color="success">
                Delete appointment
              </Button>}
              <Button type="submit" variant="contained" color="primary" sx={{ borderRadius: 2, ml: 1 }}>
                Schedule an appointment
              </Button>
            </DialogActions>
          </form>
        </div>
      </Dialog>
    </Box>
  );
};

export default TimeSlots;

