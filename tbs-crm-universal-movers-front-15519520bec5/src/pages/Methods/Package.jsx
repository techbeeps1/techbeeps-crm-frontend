import React, { useContext, useEffect, useState } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
  Button,
  Modal,
  TextField,
  Typography,
  Box,
  IconButton,
  FormControl, InputLabel, Menu, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';

import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NewPackageModal from './NewPackage';
import NewPackjob from './Newpackjob';
import EditPacknoJob from './Editforms/EditPacknoJob';
import EditwithJob from './Editforms/EditwithJob';

const Packages = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isNewPackageModalOpen, setIsNewPackageModalOpen] = useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [packagedata, setPackageData] = useState(null);
  const [Editone, setEditone] = useState(false);
  const [Edittwo, setEdittwo] = useState(false);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenNewPackageModal = () => {
    handleClose();
    setIsNewPackageModalOpen(true);
  };

  const handleOpenNewJobModal = () => {
    handleClose();
    setIsNewJobModalOpen(true);
  };
  const openDeleteModal = (agent) => {
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const deletePackage = async (id) => {
    try {
      await axios.delete(`${apiPath}/api/packages/${id}`);
      alert('Package deleted successfully');
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting package:', error.response.data.message || 'Unknown error');
    }
  };

  const handleAllPackage = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/packages`);
      const table = $('#package').DataTable();
      if (table) {
        table.destroy();
      }
      setData(response["data"]);
      setTimeout(() => {
        $('#package').DataTable();
      }, 0);
    } catch (err) {
      setError('Failed to fetch agents. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleAllPackage();
  }, [Editone, Edittwo, isDeleteModalOpen, isNewJobModalOpen, isNewPackageModalOpen]);

  return (
    <>
      <div>
        <Button variant="contained" size='large' onClick={handleClick}>
          New Package
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleOpenNewPackageModal}>Package with No Job</MenuItem>
          <MenuItem onClick={handleOpenNewJobModal}>Package With Job</MenuItem>
        </Menu>

        <NewPackageModal open={isNewPackageModalOpen} onClose={() => { setIsNewPackageModalOpen(false) }} />
        <NewPackjob open={isNewJobModalOpen} onClose={() => setIsNewJobModalOpen(false)} />
      </div>
      <div className="mt-6">
        <table id="package" className='w-full'>
          <thead>
            <tr>
              <th className="border-b">Name</th>
              <th className="border-b">Type of Job</th>
              <th className="border-b">Price Agreement</th>
              <th className="border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map((item, index) => (
              <tr key={index}>
                <td onClick={() => { setPackageData(item); (item.priceAgree ? setEdittwo(true) : setEditone(true)) }} className="border-b text-lg font-medium cursor-pointer py-3">{item.name}</td>
                <td className="border-b text-lg">{item.type_job}</td>
                <td className="border-b  text-lg">{item.priceAgree}</td>
                <td className="border-b">
                  <div className="flex gap-4 py-1.5">
                    <EditIcon onClick={() => { setPackageData(item); (item.priceAgree ? setEdittwo(true) : setEditone(true)) }} />
                    <DeleteIcon onClick={() => { openDeleteModal(); setSelectedAgent(item) }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* editors */}
        <EditwithJob open={Edittwo} onClose={() => { setPackageData(null); setEdittwo(false) }} data={packagedata} />

        <EditPacknoJob open={Editone} onClose={() => { setPackageData(null); setEditone(false) }} data={packagedata} />

        <Modal open={isDeleteModalOpen} onClose={closeDeleteModal}>
          <Box className="bg-white p-6 rounded shadow-md max-w-md mx-auto mt-30">
            <IconButton
              onClick={closeDeleteModal}
              className="absolute top-0 right-3"
            >
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" component="h2" className="mb-5" style={{ margin: "5px 0" }}>
              Confirm Delete
            </Typography>
            <Typography className="mb-4" style={{ margin: "5px 0" }}>
              Are you sure you want to delete Package that Name : {selectedAgent?.name} ?
            </Typography>
            <Box className="flex justify-end" style={{ margin: "5px 0", display: "flex", gap: "10px" }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => deletePackage(selectedAgent._id)}
                className="mr-2"
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                onClick={closeDeleteModal}
              >
                No
              </Button>
            </Box>
          </Box>
        </Modal>

      </div>
    </>

  );
};

export default Packages;
