import React, { useContext, useEffect, useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import axios from 'axios';
import { apiPath } from '../../apiPath';
import {
    Button,
    Modal,
    TextField,
    Typography,
    Box,
    IconButton,
    FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { UserContext } from '../UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import MultiStepPopup from "./NewEmployee";
import StaffSlider from '../pages/HRM/Slider';
import { Controller } from 'react-hook-form';
import Loader from '../common/Loader';
import { toast } from 'react-toastify';

const Agentslist = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [countries, setCountries] = useState(null);
    const [licence, setLicence] = useState(null);
    const [skills, setSkills] = useState(null);


    const { control, register, handleSubmit, reset } = useForm();
    const { id } = useContext(UserContext);

    const notify = (message) => toast.success(message);
    const notifyError = (message) => toast.error(message, {
        autoClose: 2000,
    });

    const handleAllAgents = async () => {
        try {
            const response = await axios.get(`${apiPath}/user/all`);
            setData(response.data);
           // setData(response['data'].filter((agent: any) => agent._id != id));
            setTimeout(() => {
                $('#agent').DataTable();
            }, 0);
            setSelectedStaff(null)
        } catch (err) {
            notifyError('Failed to fetch data. Please try again later.');
            setError('Failed to fetch data. Please try again later.')
        } finally {
            setLoading(false);
        }
    };

    const openDeleteModal = (agent) => {
        setSelectedAgent(agent);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setSelectedAgent(null);
    };

    const confirmDelete = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${apiPath}/user/deleteuser`, { id: selectedAgent._id });
            if (response.status == 200) {
                handleAllAgents()
                notify('Staff deleted successfully')
            }
        } catch (err) {
            notifyError(`Failed to delete agent: ${err.message}`);
        } finally {
            closeDeleteModal();
            setLoading(false)
        }
    }
    const fetchInputs = async (type) => {
        try {
            const response = await axios.get(`${apiPath}/api/sale_group?type=${type}`);
            if (type === 'country') setCountries(response.data);
            if (type ==='Skill') setSkills(response.data);
            if (type === 'Licence') setLicence(response.data);
        } catch (err) {
            notifyError(`Failed to fetch Countries: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchInputs('country')
        fetchInputs('Skill')
        fetchInputs('Licence')
        handleAllAgents();
    }, []);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div className="text-red text-center p-4">{error}</div>;
    }

    return (
        <div className="flex flex-col md:flex-row mt-2" style={{ justifyContent: "flex-start", minHeight: "80vh" }}>
            <div className="md:w-1/2 bg-white pt-2 pl-1 overflow-auto">
                {<MultiStepPopup skills={skills} licenses={licence} countries={countries} handler={handleAllAgents} />}
                <div className="rounded-sm p-3 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id="agent" className="">
                        <thead >
                            <tr>
                                <th className="border-b">Name</th>
                                <th className="border-b">Role</th>
                                <th className="border-b">Driving license</th>
                                <th className="border-b">Joining Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.username}</td>
                                    <td className="border-b">{item.role}</td>
                                    <td className="border-b">{item?.drivingLicense?.map((licence, index) =>
                                        <p key={index} className='inline font-bold bg-pink rounded-sm shadow-lg px-2 py-1'>{licence}</p>
                                    )}
                                    </td>
                                    <td className="border-b">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Delete Confirmation Modal */}
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
                                Are you sure you want to delete {selectedAgent?.username}?
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
            <div className="relative md:w-1/2 bg-white border-l text-lg border-gray shadow-xl text-slate-700">
                <StaffSlider skills={skills} licenses={licence} countries={countries}  handler={handleAllAgents} Ondelete={openDeleteModal} selectedStaff={selectedStaff} onClose={() => setSelectedStaff(null)} />
            </div>
        </div>


    );
};

export default Agentslist;
