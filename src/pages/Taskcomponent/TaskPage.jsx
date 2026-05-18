import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Button,
  Autocomplete,
  Chip,
  Modal,
  TextField,
  Typography,
  Box,
  Badge,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { Flag, Search, Add, FilterList, OpenInNew } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { UserContext } from '../../UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller } from 'react-hook-form';
import TaskSlider from './TaskSlider';
import DatePickerComponent from '../../common/Datepicker';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import { DataTable } from 'simple-datatables';

const TaskPage = ({ jobId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [roles, setRoles] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [jobs, setjobs] = useState([]);
  const { username, role, id, ws } = useContext(UserContext);
  const [filter, setFilter] = useState('');
  const token = localStorage.getItem('token');

  const notify = (message) =>
    toast.success(message, {
      autoClose: 2000,
    });
  const notifyError = (message) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const {
    control,
    register,
    watch,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  const handleAlltask = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${apiPath}/api/task?scheduledFor=${filter}&jobId=${jobId || ''}`,
      );
      setData(response['data']);
      setTimeout(() => {
        $('#tasks').DataTable();
      }, 0);
    } catch (err) {
      setData([]);
      setError('Failed to fetch agents. Please try again later.');
      notifyError(`Failed to fetch data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (agent) => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${apiPath}/api/task/${selectedStaff._id}`,
      );
      if (response.status == 200) {
        notify('Task deleted successfully');
        handleAlltask();
        setSelectedStaff(null);
      }
    } catch (err) {
      notifyError(`Failed to delete task: ${err.message}`);
    } finally {
      closeDeleteModal();
      setLoading(false);
    }
  };
  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      let response = await axios.post(`${apiPath}/api/task`, formData);
      notify('task created successfully');
      if (response.status === 201) {
        if (ws && ws.readyState === WebSocket.OPEN) {
          formData?.teamMembers.forEach((item) => {
            const messageData = {
              recipient: item,
              sender: id,
              text: `A New Task is created by ${username} and you are the part of the task. check the email for more information about this task and team members`,
            };
            ws.send(JSON.stringify(messageData));
          });
        }
        handleAlltask();
        closeEditModal();
        reset();
      }
    } catch (err) {
      notifyError(`Error: ${err?.response?.data?.error}`);
      console.error('Failed to update agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllTeams = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/teams`);
      let teams = response['data'].map((team) => {
        return {
          label: team.teamName,
          value: team._id,
          teamMembers: team.members.map((item) => item._id),
        };
      });
      handleAllEmploye(teams);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAllEmploye = async (data) => {
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      let Employee = response['data'].map((team) => {
        return {
          label: team.username,
          value: team._id,
          teamMembers: [team._id],
        };
      });
      setRoles([...data, ...Employee]);
    } catch (err) {
      console.error(err);
    }
  };
  const handleAllcustomer = async () => {
    try {
      const response = await axios.get(`${apiPath}/customer/customerList`);
      let customer = response['data'].customers.map((team) => {
        return {
          label: team.firstName + ' ' + team.lastName + '    ' + team.email,
          value: team._id,
        };
      });
      setCustomer(customer);
    } catch (err) {
      console.error(err);
    }
  };

  let customerId = watch('customer');

  const handleAllJob = async () => {
    if (customerId) {
      try {
        const response = await axios.get(
          `${apiPath}/api/jobList?customer=${customerId}`,
        );
        let jobs = response['data'].jobList.map((job) => {
          return {
            label:
              job.customer?.firstName +
              ' ' +
              job.customer?.lastName +
              ` (${job.index})`,
            value: job._id,
          };
        });
        setjobs(jobs);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    handleAllJob();
  }, [customerId]);

  useEffect(() => {
    handleAllTeams();
    handleAllcustomer();
  }, []);

  useEffect(() => {
    handleAlltask();
  }, [filter]);

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div
      className="flex flex-col md:flex-row text-slate-600 min-h-screen"
      style={{
        justifyContent: 'flex-start',
        height: jobId ? 'h-full' : 'calc(100vh - 84px)',
      }}
    >
      {loading && <Loader />}

      <div
        className={`${
          jobId ? 'w-full' : 'w-full md:w-1/2'
        } bg-white pt-2 pl-1 h-full overflow-auto`}
      >
        <div className="rounded-sm dark:border-strokedark dark:bg-boxdark p-3">
          {!jobId && (
            <>
              <div className="text-xl md:text-2xl font-bold mb-6">
                Hi{' '}
                <span style={{ textTransform: 'capitalize' }}>{username}</span>,
                there are{' '}
                <span className="font-bold">{data && data?.length}</span> tasks
                for you. Just keep going!
              </div>
              <div className="flex flex-wrap gap-2 md:gap-4 mb-5 items-center">
                <Button
                  onClick={() => setFilter('today')}
                  size="small"
                  variant={filter === 'today' ? 'contained' : 'outlined'}
                >
                  Today
                </Button>
                <Button
                  onClick={() => setFilter('tomorrow')}
                  size="small"
                  variant={filter === 'tomorrow' ? 'contained' : 'outlined'}
                >
                  Tomorrow
                </Button>
                <Button
                  onClick={() => setFilter('ever')}
                  size="small"
                  variant={filter === 'ever' ? 'contained' : 'outlined'}
                >
                  Ever
                </Button>
                <div className="mr-auto flex gap-2">
                  <Button
                    onClick={() => openEditModal()}
                    startIcon={<Add />}
                    size="small"
                    variant="contained"
                  >
                    New task
                  </Button>
                </div>
              </div>
            </>
          )}
          <div className="overflow-x-auto">
            {/* Table for larger screens */}
            <table
              id="tasks"
              className="hidden md:table w-full"
            >
              <thead className="bg-gray-200 border-b">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-center">Assigned to</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((item) => (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedStaff(item)}
                      className="bg-white shadow-md cursor-pointer hover:bg-gray-100 transition border-b"
                    >
                      <td className="p-3 font-bold capitalize md:flex items-center">
                        <Badge
                          color="error"
                          variant="dot"
                          badgeContent=" "
                          className="mr-1 z-0"
                        >
                          <IconButton size="small">
                            <Flag color="error" />
                          </IconButton>
                        </Badge>
                        {item?.summary} {item?.customer?.firstName}{' '}
                        {item?.customer?.lastName} ({item?.job?.index || ''})
                      </td>
                      <td className="p-3 text-center">{item?.assignedTo}</td>
                      <td className="p-3 text-center">
                        <Button variant="outlined" size="small">
                          {item?.status}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Mobile-friendly stacked list */}
            <div className="block md:hidden">
              {data &&
                data.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedStaff(item)}
                    className="bg-white shadow-md rounded-lg p-4 mb-2 cursor-pointer hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center mb-2">
                      <Badge color="error" variant="dot" className="mr-2">
                        <IconButton size="small">
                          <Flag color="error" />
                        </IconButton>
                      </Badge>
                      <h3 className="text-sm font-bold capitalize">
                        {item?.summary}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      <p>
                        <span className="font-semibold">Assigned to:</span>{' '}
                        {item?.assignedTo}
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{' '}
                        {item?.status}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
            <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
              <IconButton
                onClick={closeDeleteModal}
                className="absolute top-0 right-3"
              >
                <CloseIcon />
              </IconButton>
              <Typography
                variant="h6"
                component="h2"
                className="mb-5"
                style={{ margin: '5px 0' }}
              >
                Confirm Delete
              </Typography>
              <Typography className="mb-4" style={{ margin: '5px 0' }}>
                Are you sure you want to delete{' '}
                {selectedStaff?.customer?.firstName} ?
              </Typography>
              <Box
                className="flex justify-end"
                style={{ margin: '5px 0', display: 'flex', gap: '10px' }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={confirmDelete}
                  className="mr-2"
                >
                  Yes
                </Button>
                <Button variant="outlined" onClick={closeDeleteModal}>
                  No
                </Button>
              </Box>
            </Box>
          </Modal>
          <Modal open={isEditModalOpen} onClose={closeEditModal}>
            <Box
              className="bg-white p-5 rounded-lg shadow-lg mx-auto"
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                maxHeight: '90vh',
                overflowY: 'auto',
                width: '100%',
                maxWidth: '600px',
              }}
            >
              <div className="flex justify-between items-start">
                <Typography
                  variant="h5"
                  component="h3"
                  fontWeight="bold"
                  fontSize={'27px'}
                  className="text-primary"
                >
                  Create new task
                </Typography>
                <IconButton onClick={closeEditModal}>
                  <CloseIcon />
                </IconButton>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  label="Tittle*"
                  variant="standard"
                  fullWidth
                  margin="normal"
                  {...register('summary', { required: 'Summary is required' })}
                  error={!!errors.summary} // Show error styling
                  helperText={errors.summary ? errors.summary.message : ''} // Display error message
                />
                <TextField
                  label="Description*"
                  variant="standard"
                  fullWidth
                  margin="normal"
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  error={!!errors.description}
                  helperText={
                    errors.description ? errors.description.message : ''
                  }
                />
                <div className="flex gap-4 mt-4">
                  <DatePickerComponent
                    control={control}
                    name="scheduledFor"
                    label="Scheduled for*"
                    rules={{ required: 'field is required' }}
                    errors={errors}
                    minDate={new Date()}
                  />
                  <TextField
                    label="Scheduled Time*"
                    type="time"
                    variant="standard"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    {...register('scheduledTime', {
                      required: 'Scheduled time is required',
                    })}
                    error={!!errors.scheduledTime}
                    helperText={
                      errors.scheduledTime ? errors.scheduledTime.message : ''
                    }
                  />
                </div>
                <Controller
                  name="assignedTo"
                  control={control}
                  rules={{ required: 'Assigned to is required' }}
                  render={({ field }) => (
                    <Autocomplete
                      options={roles}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      }
                      value={
                        roles.find((role) => role.label === field.value) || null
                      } // Set matching role or null
                      onChange={(_, data) => {
                        field.onChange(data ? data.label : '');
                        setValue('teamMembers', data.teamMembers);
                      }} // Save the label instead of value
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned to*"
                          variant="standard"
                          className="w-full"
                          margin="normal"
                          error={!!errors.assignedTo} // Show error styling
                          helperText={
                            errors.assignedTo ? errors.assignedTo.message : ''
                          } // Display error message
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={[
                        { label: 'High', value: 'High' },
                        { label: 'Medium', value: 'Medium' },
                        { label: 'Low', value: 'Low' },
                      ]}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      } // Match based on ID
                      value={
                        field.value
                          ? { label: field.value, value: field.value }
                          : null
                      } // Set matching priority or null
                      onChange={(_, data) =>
                        field.onChange(data ? data.value : '')
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Priority"
                          variant="standard"
                          className="w-full"
                          margin="normal"
                          error={!!errors.priority} // Show error styling
                          helperText={
                            errors.priority ? errors.priority.message : ''
                          } // Display error message
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name="customer"
                  control={control}
                  rules={{ required: 'Customer is required' }} // Add validation rule
                  render={({ field }) => (
                    <Autocomplete
                      options={customer}
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      } // Match based on ID
                      value={
                        customer.find((cust) => cust.value === field.value) ||
                        null
                      } // Set matching customer or null
                      onChange={(_, data) =>
                        field.onChange(data ? data.value : '')
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Customer*"
                          variant="standard"
                          className="w-full"
                          margin="normal"
                          error={!!errors.customer} // Show error styling
                          helperText={
                            errors.customer ? errors.customer.message : ''
                          } // Display error message
                        />
                      )}
                    />
                  )}
                />
                <Controller
                  name="job"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={jobs} // Replace 'roles' with 'jobs'
                      getOptionLabel={(option) => option.label} // Assuming each job has a 'label' property
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      } // Match based on ID
                      value={
                        jobs.find((job) => job.value === field.value) || null
                      } // Set matching job or null
                      onChange={(_, data) =>
                        field.onChange(data ? data.value : '')
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Job"
                          variant="standard"
                          className="w-full"
                          margin="normal"
                          error={!!errors.job} // Show error styling
                          helperText={errors.job ? errors.job.message : ''} // Display error message
                        />
                      )}
                    />
                  )}
                />
                <Box className="flex justify-end mt-6 space-x-2">
                  <Button variant="outlined" onClick={closeEditModal}>
                    Cancel
                  </Button>
                  <Button variant="contained" color="primary" type="submit">
                    Submit
                  </Button>
                </Box>
              </form>
            </Box>
          </Modal>
        </div>
      </div>
      <div
        className={`${
          jobId
            ? 'absolute z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0'
            : 'w-full md:w-1/2 h-full shadow border-l border-gray'
        } ${selectedStaff && '!left-0'} bg-white h-full overflow-auto `}
      >
        <TaskSlider
          handler={handleAlltask}
          roles={roles}
          Ondelete={openDeleteModal}
          task={selectedStaff}
          onClose={() => setSelectedStaff(null)}
        />
      </div>
    </div>
  );
};

export default TaskPage;
