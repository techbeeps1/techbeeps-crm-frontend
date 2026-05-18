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
    FormControl, Menu, InputLabel, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { UserContext } from '../../UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Loader from '../../common/Loader';


const QuoteList = ({ customerId }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        event.stopPropagation(); // Prevent propagation to parent elements
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);

    let navigate = useNavigate();

    const { register, handleSubmit, reset } = useForm();
    const { id } = useContext(UserContext);

    const handleAllInvoice = async () => {
        try {
            const response = await axios.get(`${apiPath}/finance/financeList?customer=${customerId || ''}`);
            setData(response["data"].financeData);
            setTimeout(() => {
                $('#quote').DataTable();
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
        setSelectedAgent(null);
        setDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.delete(`${apiPath}/finance/deleteFinance/${selectedAgent._id}`);
            if (response.status == 200) {
                handleAllInvoice()
            }
        } catch (err) {
            console.error('Failed to delete agent:', err);
        } finally {
            closeDeleteModal();
        }
    }

    useEffect(() => {
        handleAllInvoice();
    }, []);

    if (loading) {
        return <Loader />
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <div className="p-4 mx-auto">
            {!customerId &&
                <div className="flex justify-between">
                    <button
                        className="bg-success border-black border text-white active:bg-blue font-bold px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
                        type="button"
                        onClick={() => navigate("/new_offer")}>
                        New Offer
                    </button>
                </div>
            }
            <div className="pt-6 pb-2.5 dark:border-strokedark dark:bg-boxdark xl:pb-1 text-black dark:text-white overflow-auto">
                <table id="quote" className="">
                    <thead>
                        <tr>
                            <th className="border-b">Number</th>
                            <th className="border-b">Client</th>
                            <th className="border-b">Date</th>
                            <th className="border-b">Total</th>
                            <th className="border-b">Status</th>
                            <th className="border-b">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((item, index) => (
                            <tr key={index} className='hover:bg-gray'>
                                <td onClick={() => navigate(`/offer-detail/${item._id}`)} className="border-b"> # {item.index}</td>
                                <td onClick={() => navigate(`/offer-detail/${item._id}`)} className="border-b capitalize">{item.customer?.firstName + " " + item.customer?.lastName}</td>
                                <td className="border-b">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="border-b">$ {item.total}</td>
                                <td className="border-b">{item.Status}</td>
                                <td className="border-b relative" style={{ display: "flex", gap: "20px" }}>
                                    <div>
                                        {/* 3-dot button */}
                                        <Button
                                            aria-controls={anchorEl ? 'simple-menu' : undefined}
                                            aria-haspopup="true"
                                            onClick={(event) => { handleClick(event); setSelectedAgent(item) }}
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
                                                    navigate(`/offer/${selectedAgent._id}`);
                                                    handleClose();
                                                }}
                                            >
                                                <EditIcon />&nbsp; Edit
                                            </MenuItem>
                                            <MenuItem
                                                onClick={(event) => {
                                                    event.stopPropagation(); // Prevent unintended propagation
                                                    handleClose();
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
                        <Typography variant="h6" component="h2" className="mb-5" style={{ margin: "5px 0" }}>
                            Confirm Delete
                        </Typography>
                        <Typography className="mb-4" style={{ margin: "5px 0" }}>
                            Are you sure you want to delete Performa #{selectedAgent?.index} ?
                        </Typography>
                        <Box className="flex justify-end" style={{ margin: "5px 0", display: "flex", gap: "10px" }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={confirmDelete}
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
        </div>

    );
};

export default QuoteList;



