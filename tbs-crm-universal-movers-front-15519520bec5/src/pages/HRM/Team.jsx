import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import {
    Button, Autocomplete, Chip,
    Modal,
    TextField,
    Typography,
    Box,
    IconButton,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { UserContext } from '../../UserContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { Controller } from 'react-hook-form';
import TeamSlider from './Teamslider';
import Loader from '../../common/Loader';


const Team = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [roles, setRoles] = useState([]);

    const { control, register, handleSubmit, reset, formState: { errors } } = useForm();

    const handleAllAgents = async () => {
        try {
            const response = await axios.get(`${apiPath}/api/teams`);
            setData(response["data"]);
            setTimeout(() => {
                $('#teams').DataTable();
            }, 0);
        } catch (err) {
            setError('Failed to fetch agents. Please try again later.');
            console.error(err);
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
        try {
            const response = await axios.delete(`${apiPath}/api/teams/${selectedAgent._id}`);
            if (response.status == 200) {
                handleAllAgents()
                setSelectedStaff(null)
            }
        } catch (err) {
            console.error('Failed to delete agent:', err);
        } finally {
            closeDeleteModal();
        }
    }
    const openEditModal = () => {
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setSelectedAgent(null);
    };

    const onEditSubmit = async (formData) => {
        try {
            let response = await axios.post(`${apiPath}/api/teams`, formData);
                handleAllAgents()
                reset()
        } catch (err) {
            console.error('Failed to update agent:', err);
        } finally {
            closeEditModal();
        }
    };

    const handleAllEmployee = async () => {
        try {
            const response = await axios.get(`${apiPath}/user/all`);
            let employees = response["data"].map(employee => { return { label: employee.username, value: employee._id } });
            setRoles(employees);
            // console.log(employees);
        } catch (err) {
            setError('Failed to fetch agents. Please try again later.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleAllAgents();
        handleAllEmployee();
    }, []);

    if (loading) {
        return <Loader/>;
    }
    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    return (
        <div className="flex flex-col md:flex-row mt-2" style={{ justifyContent: "flex-start", minHeight: "85vh" }}>

            <div className="md:w-1/2 bg-white pt-2 pl-1">
                <Button variant="outlined" className='shadow-md' onClick={() => openEditModal()}>New team</Button>

                <div className="rounded-sm p-3 mt-4 dark:border-strokedark dark:bg-boxdark">
                    <table style={{ paddingTop: "30px" }} id="teams" className="">
                        <thead >
                            <tr>
                                <th className="border-b">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index} onClick={() => setSelectedStaff(item)}>
                                    <td style={{ padding: "15px 7px", cursor: "pointer" }} className="border-b font-bold">{item.teamName}</td>
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
                                Are you sure you want to delete {selectedAgent?.teamName}?
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

                    {/* new Agent Modal */}
                    <Modal open={isEditModalOpen} onClose={closeEditModal}>
                        <Box className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mx-auto mt-24 relative">
                            <IconButton
                                onClick={closeEditModal}
                                className="absolute top-2 right-2"
                            >
                                <CloseIcon />
                            </IconButton>
                            <Typography variant="h6" component="h2" className="mb-4 text-center">
                                Make New Team
                            </Typography>
                            <form onSubmit={handleSubmit(onEditSubmit)}>
                                <TextField
                                    label="Team Name*"
                                    variant="standard"
                                    fullWidth
                                    margin="normal"
                                    {...register('teamName', {required: "Team name is required"})}
                                    className="border-b-2 border-gray"
                                />
                                {errors.teamName && (
                                 <p style={{ color: "red", fontSize: "0.8rem", marginTop: "4px" }}>
                                 {errors.teamName.message}</p>)}
                                <div className="mb-4 mt-4">
                                    <Controller
                                        name="members"
                                        control={control}
                                        render={({ field }) => (
                                            <Autocomplete
                                                {...field}
                                                multiple
                                                options={roles}
                                                getOptionLabel={(option) => option.label}
                                                onChange={(_, data) => field.onChange(data.map((option) => option.value))}   // Handle changes and pass data to form
                                                renderTags={(value, getTagProps) =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            variant="outlined"
                                                            label={option.label}
                                                            {...getTagProps({ index })}
                                                            key={option.label}
                                                            className="bg-pink text-blue"  // Example custom styling (optional)
                                                        />
                                                    ))
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        variant="standard"  // Use Material UI's "standard" variant for bottom border
                                                        label="Select Members"
                                                        placeholder="Select Members"
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
                                    <Button
                                        variant="outlined"
                                        onClick={closeEditModal}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            </form>
                        </Box>
                    </Modal>
                </div>
            </div>
            <div className="relative md:w-1/2 bg-white border-l">
                <TeamSlider Ondelete={openDeleteModal} selectedStaff={selectedStaff} onClose={() => setSelectedStaff(null)} />
            </div>
        </div>


    );
};

export default Team;
