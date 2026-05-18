import React, { useEffect, useState } from 'react';
import { apiPath } from '../../../apiPath';

import {
    Button, Autocomplete, Chip,
    Modal,
    TextField,
    Typography,
    Box, Tabs, Tab,
    IconButton,
    FormControl, InputLabel, Select, MenuItem, OutlinedInput
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useForm } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import axios from 'axios';



const TeamSlider = ({ selectedStaff, onClose, Ondelete }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [roles, setRoles] = useState([]);

    const { control, register, handleSubmit, reset } = useForm();

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const openEditModal = () => {
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
    };

    const onEditSubmit = async (formData) => {
        const members = formData.members.map(member => member.value);
        try {
            let response = await axios.put(`${apiPath}/api/teams/${selectedStaff._id}`, {teamName: formData.teamName, members: members});
            console.log('Team updated:', response.data);
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
        } catch (err) {
            setError('Failed to fetch agents. Please try again later.');
            console.error(err);
        }
    };
    useEffect(() => {
        handleAllEmployee();
    }, []);

    useEffect(() => {
        if (selectedStaff) {
            reset({
                teamName: selectedStaff.teamName || '',
                members: selectedStaff.members?.map(member => ({ label: member.username, value: member._id })) || []  // Set default members
            });
        }
    }, [selectedStaff, reset])


    if (!selectedStaff) return null;
    return (
        // <div className="absolute top-0 right-0 left-0 h-full bg-white p-3 overflow-y-auto transition-transform">
            <div className={`${
          selectedStaff
            ? 'z-10 transition-all delay-400 ease-in-out top-0 right-0 left-full bottom-0'
            : 'w-full  h-full shadow border-l border-gray'
        } ${selectedStaff && '!left-0'} bg-white h-full overflow-auto `}
      >
            <IconButton onClick={onClose} className="absolute top-0 left-0">
                <CloseIcon />
            </IconButton>
            <div className="flex justify-between">
                <div style={{ textTransform: "uppercase" }} className="text-2xl font-bold mb-4">{selectedStaff.teamName}</div>
            </div>
            {/* Navigation Bar */}
            <Tabs value={tabIndex} onChange={handleChange} variant="standard">
                <Tab label="Team" />
            </Tabs>
            <div className="p-4">
                {tabIndex === 0 && (
                    <div className="">
                        <div>
                            <div className="flex mb-3">
                                <h2 className="text-xl font-bold mb-2 me-4">Team Information</h2>
                                <DeleteIcon onClick={() => Ondelete(selectedStaff)} />
                            </div>


                            <div className="flex justify-between">
                                <p>Name:</p>
                                <p className="text-lg font-bold pe-5">{selectedStaff?.teamName}</p>
                                <p></p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold mb-3 mt-4"> Members of the Team</h3>
                            <div className="flex flex-wrap">
                                {selectedStaff?.members?.map((member, index) => <div className=" m-3 flex items-center gap-4" key={index}>
                                    <div className="w-10 h-10 rounded-full bg-blue flex items-center justify-center text-white font-bold" style={{textTransform:"uppercase"}}>
                                        {member.username.split('')[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold">Team Member</p>
                                        <p className="text-black">{member.username}</p>
                                    </div>
                                </div>)}
                            </div>
                            <div className="mt-5">
                                <Button variant="contained" color="primary" onClick={() => openEditModal()}>
                                    Edit Team Information
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
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
                            label="Team Name"
                            variant="standard"
                            fullWidth
                            margin="normal"
                            {...register('teamName', { required: true })}
                            className="border-b-2 border-gray"
                        />
                        <div className="mb-4 mt-4">
                            <Controller
                                name="members"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        {...field}
                                        multiple
                                        options={roles}  // Full options array, containing objects with {label, value}
                                        defaultValue={selectedStaff?.members || []}  // Set default value to the selected staff members
                                        isOptionEqualToValue={(option, value) => option.value === value.value}  // Custom equality check between options and values
                                        getOptionLabel={(option) => option.label}
                                        onChange={(_, data) => field.onChange(data)}  // Pass the full objects (not just IDs) to the form
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
    );
};

export default TeamSlider;
