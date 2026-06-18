import { useContext, useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import axios from 'axios';
import Loader from '../../common/Loader';
import {
  IconButton,
  Button,
  Autocomplete,
  Chip,
  Modal,
  TextField,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { UserContext } from '../../UserContext';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';

const RoleSettings = () => {
  const [data, setData] = useState<[]>([]);
  const [loading, setLoading] = useState(false);
  const [changedata, setchangedata] = useState(0);

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const { control, register, handleSubmit, reset } = useForm();
  const roles = [
    { label: 'Dashboard', value: 'Dashboard' },
    { label: 'Tasks', value: 'Tasks' },
    { label: 'Leads', value: 'Leads' },
    { label: 'To do', value: 'To do' },
    { label: 'Customer', value: 'Customer' },
    { label: 'Planning', value: 'Planning' },
    { label: 'Finance', value: 'Finance' },
    { label: 'Resources', value: 'Resources' },
    { label: 'HRM', value: 'HRM' },
    { label: 'Communication', value: 'Communication' },
    { label: 'Profile', value: 'Profile' },
    { label: 'Features', value: 'Features' },
    { label: 'Settings', value: 'Settings' },
    { label: 'Notifications', value: 'Notifications' },
  ];
  const [selectedUser, setSelectedUser] = useState(null as any);

  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const openEditModal = () => {
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
  };

  const onEditSubmit = async (formData: any) => {
    try {
      const payload = {
        id: selectedUser._id, // Required by backend to identify the user
        ...formData,
        access: formData.access.map((item: any) => item.value),
      };
      const response = await axios.post(`${apiPath}/user/update`, payload);
      toast.success(response.data.msg || 'User updated successfully');
      fetchUsers(); // Refresh the user list
    } catch (err: any) {
      console.error('Failed to update user:', err);
      notifyError(err.response?.data?.msg || 'Update failed');
    } finally {
      closeEditModal();
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiPath}/user/all`);
      setData(response.data);
      // setData(response['data'].filter((agent: any) => agent._id != id));
      setTimeout(() => {
        $('#agent').DataTable();
      }, 0);
      setSelectedUser(null);
    } catch (err: any) {
      notifyError(`Failed to fetch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    return () => setData([]);
  }, []);


  useEffect(() => {
    if (selectedUser) {
      reset({
        firstName: selectedUser.firstName || selectedUser.username || '',
        role: selectedUser.role || '',
        access:
          selectedUser.access?.map((acc: string) =>
            roles.find((role) => role.value === acc),
          ) || [],
      });
    }
  }, [selectedUser, reset,changedata]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4">User role Settings</h2>
      <p className="text-gray-600 mb-6">Update Role</p>
      <div>
        {loading && <Loader />}
        <table id="agent" className="w-full">
          <thead>
            <tr>
              <th className="border-b">Name</th>
              <th className="border-b">Role</th>
              <th className="border-b">Access</th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((item: any) => (
                <tr key={item._id} onClick={() => { setSelectedUser(item);setchangedata((d)=>d+1) }}>
                  <td className="border-b p-4">{item.username}</td>
                  <td className="border-b">{item.role}</td>
                  <td className="border-b cursor-pointer">
                    {' '}
                    {Array.isArray(item.access)
                      ? item.access.join(', ')
                      : 'test data'}
                    <IconButton onClick={() => openEditModal()}>✎</IconButton>{' '}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <Modal open={isEditModalOpen} onClose={closeEditModal}>
          <Box className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto mt-24 relative">
            <IconButton
              onClick={closeEditModal}
              className="absolute top-2 right-2"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              variant="h6"
              component="h2"
              className="mb-4 text-center"
            >
              Update user role and access
            </Typography>
            <form onSubmit={handleSubmit(onEditSubmit)}>
              <TextField
                label="First Name"
                variant="standard"
                fullWidth
                margin="normal"
                {...register('firstName', {
                  required: 'First Name is required',
                })}
                className="mb-3"
                disabled
              />
              <FormControl fullWidth variant="standard" className="w-1/2">
                <InputLabel id="Role-label">Role</InputLabel>
                <Controller
                  name="role"
                  control={control}
                  //   margin="normal"
                  rules={{ required: 'role is required' }} // Validation for Gender
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Select
                        labelId="Role-label"
                        {...field}
                        displayEmpty
                        inputProps={{
                          'aria-label': 'Role',
                        }}
                        className="mb-3"
                      >
                        <MenuItem value="Staff">Staff</MenuItem>
                        <MenuItem value="Agent">Agent</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                      </Select>
                      {error && (
                        <p style={{ color: '#d32f2f' }} className="text-sm">
                          {error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </FormControl>
              <div className="mb-4 mt-4">
                <Controller
                  name="access"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      multiple
                      options={roles} // Full options array, containing objects with {label, value}
                      isOptionEqualToValue={(option, value) =>
                        option.value === value.value
                      } // Custom equality check between options and values
                      getOptionLabel={(option) => option.label}
                      onChange={(_, data) => field.onChange(data)} // Pass the full objects (not just IDs) to the form
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option.label}
                            {...getTagProps({ index })}
                            key={option.value}
                            className="bg-pink text-blue"
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          label="Select Access"
                          placeholder="Select Access"
                          className="w-full"
                        />
                      )}
                    />
                  )}
                />
              </div>

              <Box className="flex justify-end mt-6 space-x-2">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  className="mr-4"
                >
                  Save
                </Button>
                <Button variant="outlined" onClick={closeEditModal}>
                  Cancel
                </Button>
              </Box>
            </form>
          </Box>
        </Modal>
      </div>
    </>
  );
};

export default RoleSettings;
