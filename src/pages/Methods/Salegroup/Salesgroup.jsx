import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../../apiPath';
import {
  Button, Modal, TextField, Typography, Box, IconButton, Menu, MenuItem, CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Loader from '../../../common/Loader';

const Salesgroup = () => {
  const { register, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSalesGroup, setSelectedSalesGroup] = useState(null);

  const openModal = (group = null) => {
    setSelectedSalesGroup(group);
    setModalOpen(true);
    if (group) {
      reset({ name: group.name });
    }
  };
  const notify = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message, {
    autoClose: 2000,
  });

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSalesGroup(null);
    reset();
  };

  const openDeleteModal = (group) => {
    setSelectedSalesGroup(group);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const fetchSalesGroups = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/sale_group?type=salesGroup`);
      const table = $('#sales').DataTable();
      if (table) {
        table.destroy();
      }
      setData(response.data);
      setTimeout(() => {
        $('#sales').DataTable();
      }, 0);
    } catch (err) {
      notifyError(`Failed to fetch: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      if (selectedSalesGroup) {
        await axios.put(`${apiPath}/api/sale_group/${selectedSalesGroup._id}`, formData);
        notify('item updated successfully');
      } else {
        await axios.post(`${apiPath}/api/sale_group`, { ...formData, type: 'salesGroup' });
        notify('item saved successfully');
      }
      closeModal();
      fetchSalesGroups();
    } catch (error) {
      notifyError(`Failed to save:${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteSalesGroup = async () => {
    setLoading(true);
    try {
      await axios.delete(`${apiPath}/api/sale_group/${selectedSalesGroup._id}`);
      closeDeleteModal();
      notify('item Delete successfully');
      fetchSalesGroups();
    } catch (error) {
      notifyError(`Error deleting : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesGroups();
  }, []);

  return (
    <div>
      {loading && <Loader />}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => openModal()}
        style={{ marginBottom: "20px" }}
      >
        New SalesGroup
      </Button>

      <table id="sales" className="w-full">
        <thead>
          <tr>
            <th className="border-b">Name</th>
            <th className="border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map((group) => (
            <tr key={group._id}>
              <td className="border-b font-medium cursor-pointer text-lg" onClick={() => openModal(group)}>
                {group.name}
              </td>
              <td className="border-b">
                <IconButton onClick={() => openDeleteModal(group)} >
                  <DeleteIcon/>
                </IconButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal open={isModalOpen} onClose={closeModal}>
        <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
          <IconButton onClick={closeModal} className="absolute top-0 right-3">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" className="mb-5">
            {selectedSalesGroup ? 'Edit Sales Group' : 'Add New Sales Group'}
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('name', { required: true })}
              label="Sales Group Name"
              fullWidth
              margin="normal"
              defaultValue={selectedSalesGroup?.name || ''}
            />
            <Box className="flex justify-end mt-4">
              <Button type="submit" variant="contained" color="primary">
                {selectedSalesGroup ? 'Update' : 'Add'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
        <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
          <IconButton onClick={closeDeleteModal} className="absolute top-0 right-3">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" component="h2" className="mb-5">
            Confirm Delete
          </Typography>
          <Typography className="mb-4">
            Are you sure you want to delete the Sales Group named "{selectedSalesGroup?.name}"?
          </Typography>
          <Box className="flex justify-end" style={{ gap: '10px' }}>
            <Button variant="contained" color="secondary" onClick={deleteSalesGroup}>
              Yes
            </Button>
            <Button variant="outlined" onClick={closeDeleteModal}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default Salesgroup;
