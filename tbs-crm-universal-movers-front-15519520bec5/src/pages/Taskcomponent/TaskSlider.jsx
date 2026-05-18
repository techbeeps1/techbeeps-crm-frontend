
import React, { useEffect, useRef, useState } from 'react';
import { Autocomplete, FormControl, Button, Select, MenuItem, IconButton, Typography, TextField, Tabs, Divider, Tab } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditEmployee from '../../agents/EditEmployee';
import AvailabilityComponent from '../../agents/Available';
import { Phone, Mail, Snooze, Flag, Search, Add, FilterList, OpenInNew, GifBoxOutlined, ApprovalOutlined, ElevatorOutlined } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TaskSlider = ({ task, roles, onClose, Ondelete, handler }) => {
    const [tabIndex, setTabIndex] = useState(0);
    const [comments, setComments] = useState([]);
    const [commentForm, setCommentForm] = useState('');
    const [notes, setNotes] = useState({});
    const [appointment, setAppointment] = useState([])
    const [relocation, setRelocation] = useState();
    const [loading, setLoading] = useState(false)

    const notify = (message) => toast.success(message, {
        autoClose: 2000,
    });
    const notifyError = (message) => toast.error(message, {
        autoClose: 2000,
    });
    let navigate = useNavigate()

    const { control, register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm();

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    async function handleLeadsClick() {
        try {
            const response = await axios.get(`${apiPath}/api/commentListById/${task && task._id}`);
            setComments(response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        setValue('assignedTo', task?.assignedTo);
        handleLeadsClick();
        handleNotes()
        getAppointments()
    }, [task])

    const onSubmit = async (assigned) => {
        if (!assigned) return;
        console.log(assigned);
        setLoading(true)
        try {
            let response = await axios.put(`${apiPath}/api/task/${task._id}`, assigned);
            notify('Task assigned successfully');
            handler()
        } catch (err) {
            notifyError(`Failed to update agent: ${err.message}`);
        } finally {
            setLoading(false)
        }
    };

    const handleNotes = async () => {
        if (!task?.job) { setNotes(null); return }
        try {
            const response = await axios.get(`${apiPath}/api/notesListByJobId?jobId=${task && task.job && task.job._id}`);
            setNotes(response.data?.notesListByJobId)
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }
    const submitCommentForm = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${apiPath}/api/comment`, {
                userId: task._id,
                text: commentForm,
            });
            handleLeadsClick();
            setCommentForm('')
            notify('Comment posted')
        } catch (error) {
            notifyError(`Error submitting comment: ${error.message}`);
        } finally {
            setLoading(false)
        }
    };
    const getAppointments = async () => {
        if (!task?.job) { setAppointment([]); return }
        try {
            const queryString = task?.job ? `?jobId=${task?.job?._id}` : '';
            const response = await axios.get(`${apiPath}/api/appointment${queryString}`);
            setAppointment(response.data)
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    const transformData = (data) => {
        const transformedData = {};
        Object.entries(data).forEach(([key, value]) => {
            const [prefix, ...rest] = key.split('_');
            const fieldName = rest.join('_'); // Join the remaining parts of the key
            if (!transformedData[prefix]) {
                transformedData[prefix] = {};
            }
            transformedData[prefix][fieldName] = value;
        });
        return transformedData;
    };

    useEffect(() => {
        if (task?.job) {
            if (task?.job?.relocation) {
                setRelocation(transformData(task?.job?.relocation))
            } else {
                setRelocation(null)
            }
        }
    }, [task]);


    function formatDate(isoDateString) {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();  // Get full year
        return `${day}-${month}-${year}`;  // Return the formatted date
    }

    if (!task) return (
        <div className="flex h-full items-center justify-center bg-white">
            <img className="h-30 w-30 rounded-full" src="https://cdn.dribbble.com/users/1238723/screenshots/4794365/loading.gif" alt="" />
        </div>
    );

    return (
        <div className="shadow-xl top-0 right-0 left-0 bg-white p-4 transition-transform text-lg font-medium max-w-screen-lg">
            {loading && <Loader />}
            <IconButton onClick={onClose} className="absolute bottom-2 right-2">
                <CloseIcon />
            </IconButton>   
            <div className="flex flex-col md:flex-row justify-between mt-5">
                <div className="flex items-center text-xl sm:text-2xl font-semibold capitalize">
                    <Flag color="error" className="mr-3" />
                    {task?.summary} {task && task.customer && task.customer.firstName} {task && task.customer && task.customer.lastName}  ({task && task?.job && task?.job?.index})
                </div>
                <IconButton onClick={() => Ondelete(task)} className='w-12 h-12'>
                    <DeleteIcon />
                </IconButton>
            </div>
            <div className="mt-2">
                <p>Description : {task?.description}</p>
            </div>
            <div className="mt-4 md:flex flex-wrap gap-2 sm:gap-4 items-center">
                <div className="font-semibold flex items-center gap-2">
                    <Snooze /> Snooze
                </div>
                <Button variant="outlined" size='small' >Morning</Button>
                <Button variant="outlined" size='small' >Next week</Button>
                <Button variant="outlined" size='small' >Later moment</Button>
            </div>
            <div className="mt-6">
                <h4 className="font-semibold text-gray-700 mb-1">ASSIGNED TO</h4>
                <Controller
                    name="assignedTo"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            options={roles}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.value === value.value} // Match based on ID
                            value={roles.find((role) => role.label === field.value) || null} // Set matching role or null
                            onChange={(_, data) => {
                                // Extract label and teamMembers (if available)
                                const newLabel = data ? data.label : '';
                                const newTeamMembers = data ? data.teamMembers : []; // Assuming teamMembers is an array in the option

                                if (newLabel !== field.value) {  // Check if the new value differs from the current
                                    field.onChange(newLabel);   // Pass the label value to field.onChange
                                    onSubmit({ assignedTo: newLabel, teamMembers: newTeamMembers });  // Pass both label and teamMembers to onSubmit
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Assigned to"
                                    variant="standard"
                                    className="w-full"
                                    margin="normal"
                                    error={!!errors.assignedTo} // Show error styling
                                    helperText={errors.assignedTo ? errors.assignedTo.message : ''} // Display error message
                                />
                            )}
                        />
                    )}
                />
            </div>
            <hr className="my-6 text-gray" />
            <div>
                <h3 className="font-semibold mb-3">CUSTOMER INFORMATION :</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="">
                        <h2 className="font-bold text-xl pb-2 capitalize">{task?.customer?.type} Details :</h2>
                        <a className='cursor-pointer text-primary ' onClick={() => navigate(`/customers/${task?.customer?._id}`)}>Go to customer</a>
                        {[
                            { label: 'Name', value: `${task?.customer?.salutation || ''} ${task?.customer?.firstName || ''} ${task?.customer?.lastName || ''}` },
                            { label: 'Gender', value: task?.customer?.gender },
                            { label: 'Contact', value: task?.customer?.contact },
                            { label: 'Language', value: task?.customer?.taal },
                            { label: 'Email', value: task?.customer?.email },
                            { label: 'Type', value: task?.customer?.typeOfCustomer },
                            { label: 'Contact No', value: task?.customer?.contact },
                            { label: 'Mobile No.', value: task?.customer?.mobile },
                        ].map(({ label, value }) => (
                            <div style={{ fontSize: '17px' }} className="flex gap-4 text-slate-600 font-medium" key={label}>
                                <p className="">{label}:</p>
                                <p className="text-slate-800 capitalize">{value || 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                    {task?.customer && task?.customer?.address?.map((item, index) => (
                        <div key={index}>
                            <h2 className="font-bold text-xl pb-2 capitalize">Address :</h2>
                            <div className="flex items-center justify-between">
                                <h2 className="font-bold text-slate-500 capitalize">{item.addressType}</h2>
                            </div>
                            <div style={{ fontSize: '17px' }} className="text-lg text-slate-600 font-medium">
                                <p className="text-slate-800 capitalize max-w-100">
                                    {item.floor} Floor {item.houseNumber || '0'} {item.addition} {item.street} {item.city} {item.country}
                                </p>
                                <p className="text-slate-500">{item.typeOfProperty}</p>
                                <div className="flex gap-2">
                                    <span className="relative group">
                                        {item.hasElevator && <ElevatorOutlined fontSize="medium" />}
                                        <div className="absolute buttom-0 rounded w-100 hidden group-hover:flex flex-col gap-2 bg-slate-300 border border-gray p-2 shadow-lg">
                                            <p>Distance To Lift : {item.distanceToLift}m</p>
                                            <p>Distance To Apartment :{item.distanceToApartment}m</p>
                                        </div>
                                    </span>
                                    <span>{item.deliveringBoxes && <GifBoxOutlined fontSize='medium' />}</span>
                                    <span>{item.applyForPermit && <ApprovalOutlined fontSize='medium' />}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-2 mt-5">Relocation</h2>
                    {task?.job && <a className='cursor-pointer text-primary ' onClick={() => navigate(`/jobs?${task?.job?._id}`)}>Go to job</a>}
                    {relocation && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Summary</h3>
                                <p className="font-medium mb-1">{relocation.relocation?.totalVolume} m<sup>3</sup></p>
                                <p className="font-medium mb-1">{relocation.relocation?.movers} movers</p>
                                <p className="font-medium mb-1">{relocation.total?.handyman} handyman</p>
                                <p className="font-medium mb-1">{relocation.packing?.requiredPackers} Packers</p>
                                <p className="font-medium mb-1">{relocation.unpacking?.requiredPackers} Unpackers</p>
                                <p className="font-medium mb-1">{relocation.relocation?.distance} km </p>
                            </div>
                            <div>
                                <p className="text-lg mb-1">Hours</p>
                                <p className="font-medium mb-1">
                                    {(relocation.relocation?.requiredHours).toFixed(2) || 'Not available'} hours
                                </p>
                                <p className="font-medium mb-1">
                                    {(relocation.relocation?.travelTime).toFixed(2)} Travel Time
                                </p>
                                <p className="font-medium mb-1">
                                    {(relocation.assembling?.requiredHours).toFixed(2)} Assembling hours
                                </p>
                                <p className="font-medium mb-1">
                                    {(relocation.disassembling?.requiredHours).toFixed(2)} Disassembly hours
                                </p>
                                <p className="font-medium mb-1">
                                    {(relocation.packing?.requiredHours).toFixed(2)} Packing Hours
                                </p>
                                <p className="font-medium mb-1">
                                    {(relocation.unpacking?.requiredHours).toFixed(2)} Unpacking Hours
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <hr className="my-6 text-gray" />
                <div className="mb-4">
                    <div className='grid grid-cols-2 gap-4 '>
                        <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                            Notes
                        </Typography>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="text-gray-500">General</div>
                            <div className="text-gray-900 font-medium my-1">{notes && notes.genralNotes || "No Notes"} </div>
                        </div>
                        <div>
                            <div className="text-gray-500">For the employee</div>
                            <div className="text-gray-900 font-medium my-1">{notes && notes.employeeNotes || "No Notes"}</div>
                        </div>
                        <div>
                            <div className="text-gray-500">For the Customer</div>
                            <div className="text-gray-900 font-medium my-1">{notes && notes.customerNotes || "No Notes"}</div>
                        </div>
                    </div>
                </div>
                <hr className="my-6 text-gray" />
                <div className="mb-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Typography variant="h6" className="font-semibold text-gray-700 mb-2">
                            DATA
                        </Typography>
                    </div>
                    {appointment.length > 0 ? appointment.map((item) =>
                        <div className="grid grid-cols-2 gap-4" key={item._id}>
                            <div className="text-gray-900 font-medium">{item.appointmentType}</div>
                            <div className="text-gray-900 font-medium my-1">{formatDate(item.date)}</div>
                        </div>
                    ) : 'There are no appointments available'}
                </div>

                <hr className="my-6 text-gray" />
                <div className="bg-gray-100 p-3 rounded-lg mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Comments</h2>
                    {comments.length > 0 ? (
                        comments && comments.map((comment, index) => (
                            <div
                                key={index}
                                className="bg-white font-bold p-3 shadow-lg mb-4 rounded-lg transition-transform transform hover:scale-105 hover:shadow-2xl"
                            >
                                <p className="text-gray-700 text-lg">💬 {comments && comment.text}</p>
                                <div className="mt-4 text-gray-600 flex justify-between text-sm font-medium" style={{ textTransform: 'uppercase' }}>
                                    <p>{comments && comment.username} </p>
                                    <p>{formatDate(comments && comment.timestamp)}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-lg">No comments yet.</p>
                    )}
                </div>
                <div className="mt-4">
                    <TextField
                        label="Post a comment"
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        placeholder="Write your comment here..."
                        value={commentForm}
                        onChange={(e) => setCommentForm(e.target.value)}
                    />
                    <div className="mt-2">
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={submitCommentForm}
                        >
                            Post comment
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TaskSlider;
