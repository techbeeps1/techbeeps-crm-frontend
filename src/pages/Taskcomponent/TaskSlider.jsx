import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
    Flag, 
    Snooze, 
    Person, 
    Email, 
    Phone, 
    LocationOn, 
    ElevatorOutlined, 
    CardGiftcard, 
    Verified, 
    Send,
    OpenInNew,
    CalendarMonth,
    Notes as NotesIcon,
    ChatBubbleOutline,
    LocalShipping
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { apiPath } from '../../../apiPath';
import axios from 'axios';
import Loader from '../../common/Loader';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const TaskSlider = ({ task, roles, onClose, Ondelete, handler }) => {
    const [comments, setComments] = useState([]);
    const [commentForm, setCommentForm] = useState('');
    const [notes, setNotes] = useState({});
    const [appointment, setAppointment] = useState([]);
    const [relocation, setRelocation] = useState(null);
    const [loading, setLoading] = useState(false);

    const notify = (message) => toast.success(message, {
        autoClose: 2000,
    });
    const notifyError = (message) => toast.error(message, {
        autoClose: 2000,
    });
    let navigate = useNavigate();

    const { control, setValue, formState: { errors } } = useForm();

    async function handleLeadsClick() {
        if (!task?._id) return;
        try {
            const response = await axios.get(`${apiPath}/api/commentListById/${task._id}`);
            setComments(response.data || []);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    }

    const handleNotes = async () => {
        if (!task?.job?._id) { setNotes(null); return; }
        try {
            const response = await axios.get(`${apiPath}/api/notesListByJobId?jobId=${task.job._id}`);
            setNotes(response.data?.notesListByJobId || {});
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const getAppointments = async () => {
        if (!task?.job?._id) { setAppointment([]); return; }
        try {
            const queryString = `?jobId=${task.job._id}`;
            const response = await axios.get(`${apiPath}/api/appointment${queryString}`);
            setAppointment(response.data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    useEffect(() => {
        setValue('assignedTo', task?.assignedTo);
        handleLeadsClick();
        handleNotes();
        getAppointments();
    }, [task]);

    const onSubmit = async (assigned) => {
        if (!assigned || !task?._id) return;
        setLoading(true);
        try {
            await axios.put(`${apiPath}/api/task/${task._id}`, assigned);
            notify('Task assigned successfully');
            if (handler) handler();
        } catch (err) {
            notifyError(`Failed to update task: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const submitCommentForm = async () => {
        if (!commentForm.trim()) {
            notifyError('Comment cannot be empty');
            return;
        }
        if (commentForm.length < 2 || commentForm.length > 125) {
            notifyError('Comment should be between 2 and 125 characters');
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${apiPath}/api/comment`, {
                userId: task._id,
                text: commentForm,
            });
            handleLeadsClick();
            setCommentForm('');
            notify('Comment posted successfully');
        } catch (error) {
            notifyError(`Error submitting comment: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const transformData = (data) => {
        if (!data) return null;
        const transformedData = {};
        Object.entries(data).forEach(([key, value]) => {
            const [prefix, ...rest] = key.split('_');
            const fieldName = rest.join('_');
            if (!transformedData[prefix]) {
                transformedData[prefix] = {};
            }
            transformedData[prefix][fieldName] = value;
        });
        return transformedData;
    };

    useEffect(() => {
        if (task?.job?.relocation) {
            setRelocation(transformData(task.job.relocation));
        } else {
            setRelocation(null);
        }
    }, [task]);

    function formatDate(isoDateString) {
        if (!isoDateString) return "N/A";
        const date = new Date(isoDateString);
        if (isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    if (!task) return null;

    const customerFullName = task.customer 
        ? `${task.customer.salutation || ''} ${task.customer.firstName || ''} ${task.customer.lastName || ''}`.trim()
        : 'N/A';

    return (
        <div className="space-y-6 text-slate-800 dark:text-white font-sans text-xs">
            {loading && <Loader />}
            
            {/* Header with Title and Actions */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600">
                            <Flag fontSize="small" />
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white capitalize">
                            {task?.summary || 'Task Details'}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        {customerFullName && <span className="font-semibold text-slate-700 dark:text-slate-300">{customerFullName}</span>}
                        {task?.job?.index && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                                Job #{task.job.index}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => Ondelete(task)}
                        title="Delete Task"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    >
                        <DeleteIcon fontSize="small" />
                    </button>
                    <button
                        onClick={onClose}
                        title="Close Drawer"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <CloseIcon fontSize="small" />
                    </button>
                </div>
            </div>

            {/* Description Box */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Description
                </span>
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                    {task?.description || 'No description provided.'}
                </p>
            </div>

            {/* Snooze Quick Actions */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-500 font-bold mr-1">
                    <Snooze fontSize="small" />
                    <span>Snooze:</span>
                </div>
                <button
                    onClick={() => notify("Snoozed until Morning")}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-primary hover:text-primary transition-all text-xs"
                >
                    Morning
                </button>
                <button
                    onClick={() => notify("Snoozed until Next Week")}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-primary hover:text-primary transition-all text-xs"
                >
                    Next week
                </button>
                <button
                    onClick={() => notify("Snoozed for Later")}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-boxdark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:border-primary hover:text-primary transition-all text-xs"
                >
                    Later moment
                </button>
            </div>

            {/* Reassign Team Member Section */}
            <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    ASSIGNED TO
                </span>
                <Controller
                    name="assignedTo"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            options={roles || []}
                            getOptionLabel={(option) => option.label || ''}
                            isOptionEqualToValue={(option, val) => option.value === val?.value}
                            value={roles?.find((r) => r.label === field.value) || null}
                            onChange={(_, data) => {
                                const newLabel = data ? data.label : '';
                                const newMembers = data ? data.teamMembers : [];
                                field.onChange(newLabel);
                                onSubmit({ assignedTo: newLabel, teamMembers: newMembers });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Reassign task..."
                                    size="small"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '12px' } }}
                                />
                            )}
                        />
                    )}
                />
            </div>

            {/* Customer Information Card */}
            {task?.customer && (
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <Person className="text-primary" fontSize="small" />
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Customer Information</h4>
                        </div>
                        <button
                            onClick={() => navigate(`/customers/${task.customer._id}`)}
                            className="inline-flex items-center gap-1 text-primary font-bold hover:underline text-xs"
                        >
                            <span>Profile</span>
                            <OpenInNew style={{ fontSize: 13 }} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">Name</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{customerFullName}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">Email</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{task.customer.email || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-slate-400">Phone</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{task.customer.contact || task.customer.mobile || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Type</span>
                                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">{task.customer.typeOfCustomer || 'Individual'}</span>
                            </div>
                        </div>

                        {/* Addresses */}
                        {task.customer.address && task.customer.address.length > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-2">
                                <span className="text-[10px] font-bold uppercase text-slate-400 block">Service Address</span>
                                {task.customer.address.map((addr, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                                            {addr.floor ? `${addr.floor} Floor, ` : ''}{addr.houseNumber || ''} {addr.addition || ''} {addr.street}, {addr.city} {addr.country}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 flex-wrap pt-1">
                                            {addr.hasElevator && <span className="bg-white dark:bg-boxdark px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Elevator</span>}
                                            {addr.deliveringBoxes && <span className="bg-white dark:bg-boxdark px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Boxes</span>}
                                            {addr.applyForPermit && <span className="bg-white dark:bg-boxdark px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">Permit</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Relocation Summary (if available) */}
            {relocation && (
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <LocalShipping className="text-sky-600" fontSize="small" />
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Relocation Specs</h4>
                        </div>
                        {task?.job && (
                            <button
                                onClick={() => navigate(`/jobs?${task.job._id}`)}
                                className="text-primary font-bold hover:underline text-xs inline-flex items-center gap-1"
                            >
                                <span>Go to Job</span>
                                <OpenInNew style={{ fontSize: 13 }} />
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Volume</span>
                            <span className="font-bold text-indigo-600 text-sm mt-0.5 block">{relocation.relocation?.totalVolume || 0} m³</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Movers</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{relocation.relocation?.movers || 0}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Handyman</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{relocation.total?.handyman || 0}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Distance</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">{relocation.relocation?.distance || 0} km</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Section (if available) */}
            {notes && (notes.genralNotes || notes.employeeNotes || notes.customerNotes) && (
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <NotesIcon className="text-amber-500" fontSize="small" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Notes</h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">General</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{notes.genralNotes || "No notes recorded."}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">For Employee</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{notes.employeeNotes || "No notes recorded."}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">For Customer</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{notes.customerNotes || "No notes recorded."}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Thread Section */}
            <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <ChatBubbleOutline className="text-primary" fontSize="small" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Activity & Comments ({comments.length})</h4>
                    </div>
                </div>

                {/* Comment list */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {comments.length > 0 ? (
                        comments.map((comment, index) => (
                            <div
                                key={index}
                                className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-1.5"
                            >
                                <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                    {comment.text}
                                </p>
                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                                    <span className="text-slate-600 dark:text-slate-300">{comment.username || 'Team member'}</span>
                                    <span>{formatDate(comment.timestamp)}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center py-6">No comments recorded on this task yet.</p>
                    )}
                </div>

                {/* New Comment Input */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <textarea
                        rows={2}
                        placeholder="Write a comment or status update..."
                        value={commentForm}
                        onChange={(e) => setCommentForm(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-slate-900 dark:text-white"
                    />
                    <button
                        onClick={submitCommentForm}
                        disabled={loading || !commentForm.trim()}
                        className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Send style={{ fontSize: 15 }} />
                        <span>Post Comment</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskSlider;
