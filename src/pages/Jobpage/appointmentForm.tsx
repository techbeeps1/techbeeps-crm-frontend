import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Avatar,
} from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import { useForm, Controller } from 'react-hook-form';
import axios from 'axios';
import TimeSlots from './helper/Timeslots';
import { apiPath } from '../../../apiPath';
import Tooltip from '@mui/material/Tooltip';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { EmailContext } from '../../EmailProvider/EmailContext';

interface Employee {
  label: string;
  value: string;
}

interface AppointmentFormProps {
  jobId: string;
  allAppointments: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  jobId,
  allAppointments,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const [data, setData] = useState<Employee[]>([]);
  const [showPeople, setShowPeople] = useState<boolean>(true);
  const [showAutos, setShowAutos] = useState<boolean>(true);
  const [showLifts, setShowLifts] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [appointData, setAppointData] = useState<any>(null);
  const [oldAppointData, setOldAppointData] = useState([]);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const { settings } = useContext(EmailContext) as any;

  const notify = (message: string) => toast(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const availableTimes = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
  ];
  const {
    control,
    formState: { errors },
  } = useForm();

  const handleClose = () => {
    setOpen(false);
    setAppointData(null);
    allAppointments();
  };

  const handleAllEmploye = async () => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      const EmployeeList = response.data.map((team: any) => ({
        label: team.username,
        value: team._id,
      }));
      setData(EmployeeList);
    } catch (err: any) {
      notifyError(err.message);
    }
  };

  const createAppointment = async () => {
    if (appointData) {
      setLoading(true);
      try {
        const response = await axios.post(`${apiPath}/api/appointment`, {
          ...appointData,
          jobId: jobId,
        });
        handleClose();
        setAppointData(null);
        appointData.id
          ? await SendEmail(
              response.data,
              settings?.emailTemplates?.rescheduleAppointment,
            )
          : await SendEmail(
              response.data,
              settings?.emailTemplates?.appointment,
            );
        notify('Appointments created successfully');
      } catch (error: any) {
        notifyError(`Error creating appointment: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      handleClose();
    }
  };

  const SendEmail = async (data: any, templateId: string) => {
    try {
      const response = await axios.post(`${apiPath}/email/send_email`, {
        job: jobId,
        emailTemplateId: templateId,
        extraData: data,
        subject: `Appointment booked for ${data.appointmentType} for ${data.date} from techbeeps solution`,
      });
      if (response.status === 200) {
        notify('Appointment confirmation email sent successfully');
      }
    } catch (error: any) {
      notifyError(
        `Error in Sending Appointment confirmation: ${error.message}`,
      );
    }
  };

  // const handleActivity = async (activityData) => {
  //     try {
  //         const response = await axios.post(`${apiPath}/api/activities`, activityData);
  //     } catch (error) {
  //         console.error('Error', error);
  //     }
  // };

  const getAppointments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiPath}/api/appointment?jobId=${jobId}&date=${selectedDate}`,
      );
      setOldAppointData(response.data);
    } catch (error: any) {
      notifyError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (selectedDate) {
      getAppointments();
    }
  }, [jobId, selectedDate]);

  useEffect(() => {
    handleAllEmploye();
  }, []);

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Button
          variant="outlined"
          className="shadow-md"
          onClick={() => setOpen(true)}
        >
          Appointment
        </Button>
        <Modal open={open} onClose={handleClose}>
          <Box className="bg-white px-8 py-2 rounded-lg shadow-lg mx-auto relative">
            <IconButton
              onClick={handleClose}
              className="absolute top-0 right-2 text-gray hover:text-black"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" component="h2" className="pt-2">
              Appointment
            </Typography>
            <div className="p-4">
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[78vh] overflow-auto"
              >
                <Box
                  className="bg-white p-4 rounded-lg shadow-md h-auto md:h-[75vh] overflow-auto"
                >
                  {loading && <Loader />}
                  <div className="flex flex-col">
                    {errors.date && (
                      <span className="text-red">{errors.date.message}</span>
                    )}
                    <Controller
                      name="date"
                      rules={{ required: 'Date is required' }}
                      control={control}
                      render={({ field }) => (
                        <StaticDatePicker
                          {...field}
                          value={
                            field.value ? new Date(field.value) : selectedDate
                          }
                          onChange={(date) => {
                            const isoDate = date ? date.toISOString() : null;
                            setSelectedDate(isoDate); // Save ISO string if needed
                            field.onChange(isoDate); // Pass ISO string to React Hook Form
                          }}
                          // minDate={new Date()}
                        />
                      )}
                    />

                    <Box mt={1}>
                      <Typography variant="subtitle1" color="textSecondary">
                        Show availability based on
                      </Typography>
                      <Box display="md:flex" gap={2} mt={1}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showPeople}
                              onChange={() => setShowPeople(!showPeople)}
                            />
                          }
                          label="People"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showAutos}
                              onChange={() => setShowAutos(!showAutos)}
                            />
                          }
                          label="Auto's"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showLifts}
                              onChange={() => setShowLifts(!showLifts)}
                            />
                          }
                          label="Lifts"
                        />
                      </Box>
                    </Box>
                  </div>
                </Box>
                <Box className="bg-white p-4 rounded-lg shadow-md h-auto md:h-[75vh] overflow-auto flex flex-col">
                  <div className="grid grid-cols-1 sm:grid-cols-3 text-center gap-4">
                    <Box className="text-center border-r border-gray">
                      <Typography variant="h6" className="mb-4 text-gray-600">
                        People
                      </Typography>
                      <Box className="flex justify-center gap-2 flex-wrap">
                        {data &&
                          data.map((item, index) => (
                            <div
                              key={index}
                              className="flex my-2"
                              onClick={() => setSelectedEmployee(item.value)}
                            >
                              <Tooltip title={`Details: ${item.label}`} arrow>
                                <Avatar
                                  style={{
                                    textTransform: 'uppercase',
                                    border: '4px solid green',
                                  }}
                                  className="p-5 mr-2"
                                >
                                  {item.label[0]}
                                </Avatar>
                              </Tooltip>
                            </div>
                          ))}
                      </Box>
                    </Box>

                    <Box className="text-center ml-2 border-r border-gray ">
                      <Typography variant="h6" className="mb-4 text-gray-600">
                        Auto's
                      </Typography>
                      <Box className="md:flex justify-center gap-2">
                        <div className="flex my-2">
                          <Avatar
                            style={{
                              textTransform: 'uppercase',
                              border: '4px solid green',
                            }}
                            className="p-5 mr-2"
                          >
                            12
                          </Avatar>
                        </div>
                        <div className="flex my-2">
                          <Avatar
                            style={{
                              textTransform: 'uppercase',
                              border: '4px solid green',
                            }}
                            className="p-5 mr-2"
                          >
                            16
                          </Avatar>
                        </div>
                      </Box>
                    </Box>
                    <Box className="text-center ml-2 ">
                      <Typography variant="h6" className="mb-4 text-gray-600">
                        Lift's
                      </Typography>
                      <Box className="flex">
                        <div className="flex my-2">
                          <Avatar
                            style={{
                              textTransform: 'uppercase',
                              border: '4px solid green',
                            }}
                            className="p-5 mr-2"
                          >
                            M
                          </Avatar>
                        </div>
                      </Box>
                    </Box>
                  </div>
                  <div
                    className="flex flex-col"
                  >
                    <div className="bg-white p-4 rounded-lg shadow-md h-auto overflow-auto">
                      <Typography variant="h6">Available Times</Typography>
                    </div>
                    <TimeSlots
                      selectedDate={selectedDate}
                      previousData={oldAppointData}
                      Data={setAppointData}
                      availableTimes={availableTimes}
                    />
                  </div>
                </Box>
              </div>
              <Box className="flex justify-end mt-6 mb-5">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => createAppointment()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit
                </Button>
              </Box>
            </div>
          </Box>
        </Modal>
      </LocalizationProvider>
    </div>
  );
};

export default AppointmentForm;
