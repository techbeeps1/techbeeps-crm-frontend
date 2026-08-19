import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  IconButton,
  Modal,
  Box,
  Tabs,
  Tab,
  MenuItem,
  Select,
  Typography,
  ButtonGroup,
  FormControl,
  Avatar,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Switch,
  RadioGroup,
  Radio,
} from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import TimeSlots from './helper/Timeslots';
import CustomerForm from './helper/NewcustomForm';
import LoadSection from './helper/Loadsection';
import Tooltip from '@mui/material/Tooltip';
import Loader from '../../common/Loader';

const licenses = ['B', 'BE', 'B+', 'C', 'C1', 'C1E', 'THIS', 'C 95'];
const skills = [
  'Administration',
  'Planner',
  'Job leader',
  'Forman',
  'Mover',
  'Packer',
  'Lift operatior',
  'Handyman',
];

const NewJob = ({ handler }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [showPeople, setShowPeople] = useState(true);
  const [showAutos, setShowAutos] = useState(true);
  const [showLifts, setShowLifts] = useState(false);
  const [hasElevator, setHasElevator] = useState(false);
  const [unloadElevator, setUnloadElevator] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();
  const [customerType, setCustomerType] = useState('existing');
  const [countries, setCountries] = useState([]);
  const [priceAgreement, setPriceAgreement] = useState(null);
  const [packageType, setPackageType] = useState('');
  const [packageList, setPackageList] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [appointData, setAppointData] = useState([]);
  const [valuation, setValuation] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleElevatorChange = (event) => {
    setHasElevator(event.target.checked);
  };
  const handleCustomerTypeChange = (event) => {
    setCustomerType(event.target.value);
    setValue('customer', '');
  };
  const handlePriceAgreementChange = (value) => {
    setPriceAgreement(value);
    setValue('package', '');
  };

  const handlePackageChange = (event) => {
    setPackageType(event.target.value);
  };

  const [activeStep, setActiveStep] = useState(0);
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

  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleClose = () => setOpen(false);

  const steps = [
    {
      label: 'Intake Plans',
      fields: ['Gender', 'First name', 'Infix', 'Surname'],
    },
    { label: 'When', fields: ['Street', 'City', 'Postal code'] },
    { label: 'Where', fields: ['Contract Type', 'Start Date'] },
    { label: 'Customer', fields: ['License Number', 'Expiry Date'] },
    { label: 'Price', fields: ['Skill 1', 'Skill 2'] },
  ];

  const onSubmit = (data) => {
    JobHandler(data);
  };

  const JobHandler = async (jobData) => {
    setLoading(true);

    try {
      let customerId = '';

      if (jobData.customer === '') {
        try {
          const customerResponse = await axios.post(
            `${apiPath}/customer/customeradd`,
            jobData.client
          );

          customerId = customerResponse.data.customerID;
        } catch (error) {
          if (error.response?.status === 400) {
            toast.error(
              error.response?.data?.error || 'Customer email already exists'
            );
            return; // stop further execution
          }

          throw error;
        }
      } else {
        customerId = jobData.customer;
      }

      const jobScheduleData = {
        date: jobData.date,
        customer: customerId,
        package: jobData.package,
        hasElevator,
        unloadElevator,
        load: jobData.load,
        unload: jobData.knownAddress ? {} : jobData.unload,
        knownAddress: jobData.knownAddress,
      };

      const jobResponse = await axios.post(
        `${apiPath}/api/jobSchedule`,
        jobScheduleData
      );

      toast.success('Job created successfully');

      const jobId = jobResponse.data._id;

      createAppointment(jobId, valuation);
      createAppointment(jobId, appointData);

      setData([]);
      setSelectedEmployee('');
      setSelectedDate(null);

      handleClose();
      handler();

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (jobId, appointData) => {
    if (appointData) {
      try {
        const response = await axios.post(`${apiPath}/api/appointment`, {
          ...appointData,
          jobId: jobId,
        });
      } catch (error) {
        console.error(
          'Error creating appointment:',
          error.response ? error.response.data : error.message,
        );
      }
    } else {
      handleClose();
    }
  };

  const handleNext = () => {
    handleSubmit(() => {
      setActiveStep((prev) => prev + 1);
    })();
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const handleAllEmploye = async (data) => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      let Employee = response['data'].map((team) => {
        return { label: team.username, value: team._id };
      });
      setData(Employee);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClient = async () => {
    try {
      let response = await axios.get(apiPath + '/customer/customerList');
      setCustomer(response.data.customers);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    handlePackage();
  }, [priceAgreement]);

  useEffect(() => {
    handleAllEmploye();
    handleClient();
    axios
      .get(`${apiPath}/api/sale_group?type=country`)
      .then((response) => {
        const countryNames = response?.data?.map((country) => country?.name);
        setCountries(countryNames);
      })
      .catch((error) => {
        console.error('Error fetching countries:', error);
      });
  }, []);

  const handlePackage = async () => {
    try {
      let response = await axios.get(
        apiPath + `/api/packages?priceAgree=${priceAgreement}`,
      );
      setPackageList(response.data);
    } catch (error) {
      console.error('Error fetching package:', error.message);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer text-sm"
        >
          <AddIcon fontSize="small" />
          <span>New Job</span>
        </button>
      </div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Modal open={open} onClose={handleClose}>
          <Box
            className="bg-white p-8 rounded-lg shadow-lg mx-auto relative overflow-y-auto"
            style={{ maxHeight: '100vh' }}
          >
            <IconButton
              onClick={handleClose}
              className="absolute top-0 right-2 text-gray hover:text-black"
            >
              <CloseIcon />
            </IconButton>
            <div className="flex gap-8 ">
              <Typography variant="h5" component="h2" className="pt-2">
                Relocation
              </Typography>
              <Tabs
                value={activeStep}
                className="mb-4"
                onChange={(e, val) => setActiveStep(val)}
                variant="standard"
              >
                {steps.map((step, index) => (
                  <Tab
                    label={step.label}
                    key={index}
                    className="text-lg font-medium"
                    disabled={index > activeStep}
                  />
                ))}
              </Tabs>
            </div>

            <div>
              {loading ? (
                <p
                  style={{
                    minHeight: '70vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  loading...
                </p>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Form Fields */}
                  {activeStep === 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-100">
                      {/* Date Picker Section */}
                      <Box className="bg-white p-4 rounded-lg shadow-md h-[65vh] overflow-y-scroll">
                        {errors.date && (
                          <span className="text-red">
                            {errors.date.message}
                          </span>
                        )}{' '}
                        {/* Display error message */}
                        <Controller
                          name="date"
                          rules={{ required: 'Date is required' }} // Validation rule
                          control={control}
                          defaultValue={selectedDate}
                          render={({ field }) => (
                            <StaticDatePicker
                              {...field}
                              onChange={(date) => {
                                setSelectedDate(date);
                                field.onChange(date);
                              }}
                              value={selectedDate}
                              minDate={new Date()}
                            />
                          )}
                        />
                      </Box>

                      {/* Employee Select Section */}
                      <Box className="bg-white p-4 rounded-lg shadow-md h-[65vh] overflow-y-scroll">
                        <FormControl fullWidth variant="standard">
                          <InputLabel>Select Employee</InputLabel>
                          <Select
                            value={selectedEmployee}
                            label="Select Employee"
                            onChange={handleEmployeeChange}
                            sx={{
                              borderBottom: '1px solid', // Only bottom border
                              borderColor: 'primary.main', // Change color as needed
                            }}
                          >
                            {data &&
                              data.map((employee, index) => (
                                <MenuItem key={index} value={employee.value}>
                                  <Box className="flex items-center">
                                    <Avatar className="bg-gray-500 mr-2">
                                      {employee.label[0]}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body1">
                                        {employee.label}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="textSecondary"
                                      >
                                        Variable hours
                                      </Typography>
                                    </Box>
                                  </Box>
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        <Box>
                          {data &&
                            data.map((item, index) => (
                              <div
                                key={index}
                                className="flex my-4"
                                onClick={() =>
                                  setSelectedEmployee(item.value)
                                }
                              >
                                <Avatar className="bg-gray mr-2">
                                  {item.label[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body1">
                                    {item.label}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    Variable hours
                                  </Typography>
                                </Box>
                              </div>
                            ))}
                        </Box>
                      </Box>
                      {/* Available Times Section */}
                      <Box className="bg-white p-4 rounded-lg shadow-md h-[65vh] overflow-y-scroll">
                        <Typography
                          variant="h6"
                          className="mb-4 text-gray-600"
                        >
                          Available Times
                        </Typography>
                        <TimeSlots
                          selectedDate={selectedDate}
                          Data={setValuation}
                          availableTimes={availableTimes}
                        />
                      </Box>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-100">
                        {/* Date Picker Section */}
                        <Box
                          className="bg-white p-4 rounded-lg shadow-md min-h-[400px] md:min-h-[500px] lg:h-[65vh] overflow-y-auto"
                        >
                          {errors.date && (
                            <span className="text-red">
                              {errors.date.message}
                            </span>
                          )}{' '}
                          {/* Display error message */}
                          <Controller
                            name="date"
                            rules={{ required: 'Date is required' }} // Validation rule
                            control={control}
                            defaultValue={selectedDate}
                            render={({ field }) => (
                              <StaticDatePicker
                                {...field}
                                onChange={(date) => {
                                  setSelectedDate(date);
                                  field.onChange(date);
                                }}
                                value={selectedDate}
                                minDate={new Date()}
                                className="w-full max-w-xs md:max-w-sm lg:max-w-md"
                              />
                            )}
                          />
                          <Box mt={4}>
                            <Typography
                              variant="subtitle1"
                              color="textSecondary"
                            >
                              Show availability based on
                            </Typography>
                            <Box display="flex" gap={2} mt={1}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={showPeople}
                                    onChange={() =>
                                      setShowPeople(!showPeople)
                                    }
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
                        </Box>
                        <Box
                          className="md:col-span-2 bg-white p-4 rounded-lg shadow-md min-h-[400px] md:min-h-[500px] lg:h-[65vh] overflow-y-auto"
                        >
                          <div className="grid grid-cols-12 gap-4 text-center">
                            <Box className="border-r border-gray-300 col-span-12 md:col-span-8">
                              <Typography
                                variant="h6"
                                className="mb-4 text-gray-600"
                              >
                                People
                              </Typography>
                              <Box className="flex flex-wrap justify-center gap-2">
                                {data &&
                                  data.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex my-2"
                                      onClick={() =>
                                        setSelectedEmployee(item.value)
                                      }
                                    >
                                      <Tooltip
                                        title={`Details: ${item.label}`}
                                        arrow
                                      >
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

                            <Box className="border-r border-gray-300 col-span-6 md:col-span-2">
                              <Typography
                                variant="h6"
                                className="mb-4 text-gray-600"
                              >
                                Auto's
                              </Typography>
                              <Box className="lg:flex justify-center gap-2">
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
                            <Box className="col-span-6 md:col-span-2">
                              <Typography
                                variant="h6"
                                className="mb-4 text-gray-600"
                              >
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
                          <div className="flex flex-col">
                            <Typography
                              variant="h6"
                              className="mb-4 text-gray-600"
                            >
                              Available Times
                            </Typography>
                            <TimeSlots
                              selectedDate={selectedDate}
                              Data={setAppointData}
                              availableTimes={availableTimes}
                            />
                          </div>
                        </Box>
                      </div>
                    </>
                  )}

                  {activeStep === 2 && (
                    <>
                      <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5"
                        style={{ minHeight: '70vh' }}
                      >
                        <LoadSection
                          unloadElevator={unloadElevator}
                          setUnloadElevator={setUnloadElevator}
                          countries={countries}
                          hasElevator={hasElevator}
                          setHasElevator={setHasElevator}
                          register={register}
                          errors={errors}
                          Controller={Controller}
                          control={control}
                        />
                      </div>
                    </>
                  )}
                  {activeStep === 3 && (
                    <>
                      <div
                        style={{
                          maxWidth: '600px',
                          margin: 'auto',
                          minHeight: '70vh',
                        }}
                      >
                        <FormControl
                          component="fieldset"
                          style={{ marginBottom: '16px' }}
                        >
                          <RadioGroup
                            row
                            value={customerType}
                            onChange={handleCustomerTypeChange}
                          >
                            <FormControlLabel
                              value="new"
                              control={<Radio />}
                              label="New customer"
                            />
                            <FormControlLabel
                              value="existing"
                              control={<Radio />}
                              label="Existing customer"
                            />
                          </RadioGroup>
                        </FormControl>
                        {customerType === 'new' && (
                          <CustomerForm
                            register={register}
                            errors={errors}
                            control={control}
                            countries={countries}
                          />
                        )}
                        {customerType === 'existing' && (
                          <FormControl
                            fullWidth
                            variant="standard"
                            className="w-1/2"
                          >
                            <InputLabel>Select Customer</InputLabel>
                            <Controller
                              name="customer" // Name for the form field
                              control={control}
                              defaultValue="" // Set a default value to prevent undefined
                              rules={{ required: 'Customer is required' }} // Validation rule
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  value={field.value || ''} // Ensure value is never undefined
                                  label="Select Customer"
                                >
                                  {customer &&
                                    customer.map((item, index) => (
                                      <MenuItem key={index} value={item._id}>
                                        <Box className="flex items-center">
                                          <Avatar className="bg-gray-500 mr-2"></Avatar>
                                          <Box>
                                            <Typography variant="body1">{`${item.firstName} ${item.lastName}`}</Typography>
                                            <Typography
                                              variant="body2"
                                              color="textSecondary"
                                            >
                                              {item.email}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </MenuItem>
                                    ))}
                                </Select>
                              )}
                            />
                            {errors.customer && (
                              <span className="text-red">
                                {errors.customer.message}
                              </span>
                            )}{' '}
                            {/* Display error message */}
                          </FormControl>
                        )}
                      </div>
                    </>
                  )}
                  {activeStep === 4 && (
                    <>
                      <div
                        style={{
                          maxWidth: '600px',
                          margin: 'auto',
                          minHeight: '70vh',
                        }}
                      >
                        <div style={{ marginBottom: '1rem' }}>
                          <InputLabel className="mb-5">
                            Price agreement
                          </InputLabel>
                          <ButtonGroup variant="outlined" fullWidth>
                            <Button
                              variant={
                                priceAgreement === 'fixed_price'
                                  ? 'contained'
                                  : 'outlined'
                              }
                              onClick={() =>
                                handlePriceAgreementChange('fixed_price')
                              }
                            >
                              Fixed Price
                            </Button>
                            <Button
                              variant={
                                priceAgreement === 'onhourly_basis'
                                  ? 'contained'
                                  : 'outlined'
                              }
                              onClick={() =>
                                handlePriceAgreementChange('onhourly_basis')
                              }
                            >
                              On an hourly basis
                            </Button>
                          </ButtonGroup>
                        </div>

                        <FormControl
                          fullWidth
                          variant="standard"
                          className="w-1/2"
                        >
                          <InputLabel>Select Package</InputLabel>
                          <Controller
                            name="package" // Name for the form field
                            control={control}
                            defaultValue="" // Set a default value to prevent undefined
                            rules={{ required: 'Package is required' }} // Validation rule
                            render={({ field }) => (
                              <Select
                                {...field}
                                value={field.value || ''} // Ensure value is never undefined
                                label="Select Package"
                                disabled={priceAgreement === null}
                              >
                                {packageList &&
                                  packageList.map((item, index) => (
                                    <MenuItem key={index} value={item._id}>
                                      {item.name}
                                    </MenuItem>
                                  ))}
                              </Select>
                            )}
                          />
                          {errors.package && (
                            <span className="text-red">
                              {errors.package.message}
                            </span>
                          )}{' '}
                          {/* Display error message */}
                        </FormControl>
                      </div>
                    </>
                  )}
                  {/* Step Navigation Buttons */}
                  <Box className="flex justify-between mt-6 mb-5">
                    <Button
                      variant="outlined"
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={
                        activeStep === steps.length - 1
                          ? handleSubmit(onSubmit)
                          : handleNext
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  </Box>
                </form>
              )}
            </div>
          </Box>
        </Modal>
      </LocalizationProvider>
    </>
  );
};

export default NewJob;
