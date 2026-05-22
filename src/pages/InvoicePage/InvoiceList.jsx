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
  FormControl,
  InputLabel,
  Menu,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { UserContext } from '../../UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import NewInvoice from './NewInvoice';
import { useNavigate } from 'react-router-dom';
import RecordPayment from './Recordpayment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Loader from '../../common/Loader';

const InvoiceList = ({ customerId }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event, agent) => {
    setAnchorEl(event.currentTarget);
    setSelectedAgent(agent); // Set the selected agent when opening the menu
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedAgent(null); // Clear the selected agent when closing the menu
  };

  const [invoiceData, setInvoiceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  let navigate = useNavigate();

  const { register, handleSubmit, reset } = useForm();
  const { id } = useContext(UserContext);

  const handleAllInvoice = async () => {
    try {
      const response = await axios.get(
        `${apiPath}/invoice/invoiceList?customer=${customerId || ''}`,
      );
      setInvoiceData(response['data'].invoiceData);
      setTimeout(() => {
        if ($.fn.DataTable.isDataTable('#invoice')) {
          $('#invoice').DataTable().destroy();
        }

        $('#invoice').DataTable({
          order: [[0, 'desc']], // Date column sort
        });
      }, 0);
    } catch (err) {
      setError('Failed to fetch agents. Please try again later.');
      console.error(err);
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
    try {
      if (!selectedAgent || !selectedAgent._id) {
        console.error('No selected agent to delete');
        return;
      }
      const response = await axios.delete(
        `${apiPath}/invoice/deleteInvoice/${selectedAgent._id}`,
      );
      if (response.status == 200) {
        handleAllInvoice();
      }
    } catch (err) {
      console.error('Failed to delete agent:', err);
    } finally {
      closeDeleteModal();
    }
  };

  useEffect(() => {
    handleAllInvoice();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-5">
      {!customerId && (
        <div className="flex justify-between">
          <button
            className="bg-success border-black border text-white active:bg-blue font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
            type="button"
            onClick={() => navigate('/newinvoice')}
          >
            New Invoice
          </button>
        </div>
      )}
      <div className="pt-6 pb-2.5 dark:bg-boxdark xl:pb-1 text-black overflow-auto">
        <table id="invoice" className="">
          <thead>
            <tr>
              <th className="border-b">Number</th>
              <th className="border-b">Client</th>
              <th className="border-b">Date</th>
              <th className="border-b">Total</th>
              <th className="border-b">Paid</th>
              <th className="border-b">Status</th>
              <th className="border-b">Payment</th>
              <th className="border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData &&
              invoiceData.map((item, index) => (
                <tr key={index}>
                  <td
                    onClick={() => navigate(`/invoice-detail/${item._id}`)}
                    className="border-b"
                  >
                    # {item.index}
                  </td>
                  <td
                    onClick={() => navigate(`/invoice-detail/${item._id}`)}
                    className="border-b capitalize"
                  >
                    {item.customer?.firstName + ' ' + item.customer?.lastName}
                  </td>
                  <td
                    onClick={() => navigate(`/invoice-detail/${item._id}`)}
                    className="border-b"
                  >
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td
                    onClick={() => navigate(`/invoice-detail/${item._id}`)}
                    className="border-b"
                  >
                    $ {item.total}
                  </td>
                  <td className="border-b">$ {item.paid}</td>
                  <td className="border-b">{item.Status}</td>
                  <td className="border-b">{item.payment}</td>
                  <td
                    className="border-b"
                    style={{ display: 'flex', gap: '20px' }}
                  >
                    <div>
                      {/* 3-dot button */}
                      <Button
                        aria-controls={anchorEl ? 'simple-menu' : undefined}
                        aria-haspopup="true"
                        onClick={(event) => handleClick(event, item)}
                      >
                        <MoreVertIcon />
                      </Button>
                      <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        MenuListProps={{
                          onClick: (event) => event.stopPropagation(), // Prevent propagation inside menu
                        }}
                      >
                        <MenuItem
                          onClick={(event) => {
                            event.stopPropagation(); // Prevent unintended navigation
                            navigate(`/invoice/${item._id}`);
                            handleClose();
                          }}
                        >
                          <EditIcon />
                          &nbsp; Edit
                        </MenuItem>
                        <MenuItem
                          onClick={(event) => {
                            event.stopPropagation(); // Prevent unintended propagation
                            handleClose();
                            setSelectedAgent(item);
                            openDeleteModal();
                          }}
                        >
                          <DeleteIcon /> &nbsp; Delete
                        </MenuItem>
                      </Menu>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
              Are you sure you want to delete invoice #{selectedAgent?.index} ?
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
      </div>
    </div>
  );
};

export default InvoiceList;
