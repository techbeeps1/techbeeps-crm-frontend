import React, { useContext, useEffect, useState } from 'react';
import { Autocomplete, TextField, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserContext } from '../../UserContext';
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
    LocalShipping,
    Edit as EditIcon,
    Check as CheckIcon,
    Groups as GroupsIcon,
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

    const { role, userData, isAdmin } = useContext(UserContext) || {};
    const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

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

    const getInitialRoles = () => {
        if (!roles || roles.length === 0) return [];

        const taskTeamIds = (task?.teams || []).map((t) =>
            typeof t === 'object' && t !== null ? String(t._id) : String(t)
        );
        const taskDirectMemberIds = (task?.directMembers || []).map((m) =>
            typeof m === 'object' && m !== null ? String(m._id) : String(m)
        );

        // 1. If task has both teams and directMembers explicitly recorded
        if (taskDirectMemberIds.length > 0 && taskTeamIds.length > 0) {
            return roles.filter((r) => {
                if (r.type === 'Team') {
                    return taskTeamIds.includes(String(r.value));
                }
                return taskDirectMemberIds.includes(String(r.value));
            });
        }

        // 2. Match by assignedTo names with smart team vs member priority
        const assignedNames = (task?.assignedTo || '')
            .split(',')
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        if (assignedNames.length > 0) {
            const matched = [];
            for (const name of assignedNames) {
                // If a team matches this name, prioritize the Team:
                const teamRole = roles.find(
                    (r) => r.type === 'Team' && (r.label || '').trim().toLowerCase() === name
                );
                if (teamRole && (taskTeamIds.length === 0 || taskTeamIds.includes(String(teamRole.value)))) {
                    if (!matched.some((m) => m.value === teamRole.value)) {
                        matched.push(teamRole);
                        continue;
                    }
                }
                // Otherwise match the Member:
                const memberRole = roles.find(
                    (r) => r.type === 'Member' && (r.label || '').trim().toLowerCase() === name
                );
                if (memberRole && !matched.some((m) => m.value === memberRole.value)) {
                    matched.push(memberRole);
                }
            }
            if (matched.length > 0) {
                return matched;
            }
        }

        // 3. Fallback to direct members or team members
        return roles.filter((r) => {
            if (r.type === 'Team') {
                return taskTeamIds.includes(String(r.value));
            }
            return taskDirectMemberIds.includes(String(r.value));
        });
    };

    const [selectedRoles, setSelectedRoles] = useState([]);
    const [tempSelectedRoles, setTempSelectedRoles] = useState([]);
    const [isEditingAssignees, setIsEditingAssignees] = useState(false);

    useEffect(() => {
        const initial = getInitialRoles();
        setSelectedRoles(initial);
        setTempSelectedRoles(initial);
        setIsEditingAssignees(false);
        setValue('assignedTo', task?.assignedTo);
        handleLeadsClick();
        handleNotes();
        getAppointments();
    }, [task, roles]);

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
                    {isUserAdmin && (
                        <button
                            onClick={() => Ondelete(task)}
                            title="Delete Task"
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                        >
                            <DeleteIcon fontSize="small" />
                        </button>
                    )}
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
            {isUserAdmin && (
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
            )}

            {/* Reassign Team Member Section */}
            <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        ASSIGNED TO
                    </span>
                    {isUserAdmin && (!isEditingAssignees ? (
                        <button
                            type="button"
                            onClick={() => {
                                setTempSelectedRoles(selectedRoles);
                                setIsEditingAssignees(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-all cursor-pointer"
                        >
                            <EditIcon style={{ fontSize: 13 }} />
                            <span>Edit</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => {
                                    setTempSelectedRoles(selectedRoles);
                                    setIsEditingAssignees(false);
                                }}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={async () => {
                                    const newLabel = tempSelectedRoles.map((d) => d.label.trim()).filter(Boolean).join(', ');
                                    const newTeams = tempSelectedRoles.filter((d) => d.type === 'Team').map((d) => d.value);
                                    const newDirectMembers = tempSelectedRoles.filter((d) => d.type === 'Member').map((d) => d.value);
                                    const newMembers = [...new Set(tempSelectedRoles.flatMap((d) => d.teamMembers || [d.value]))];
                                    setSelectedRoles(tempSelectedRoles);
                                    setValue('assignedTo', newLabel);
                                    await onSubmit({
                                        assignedTo: newLabel,
                                        teams: newTeams,
                                        directMembers: newDirectMembers,
                                        teamMembers: newMembers
                                    });
                                    setIsEditingAssignees(false);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                <CheckIcon style={{ fontSize: 14 }} />
                                <span>Save</span>
                            </button>
                        </div>
                    ))}
                </div>

                {!isEditingAssignees ? (
                    <div className="flex items-center gap-1.5 flex-wrap min-h-[32px]">
                        {selectedRoles.length > 0 ? (
                            selectedRoles.map((role, idx) => {
                                const isTeam = role.type === 'Team';
                                return (
                                    <span
                                        key={role.value || idx}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                            isTeam
                                                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        {isTeam ? (
                                            <GroupsIcon style={{ fontSize: 14 }} className="text-indigo-600 dark:text-indigo-400" />
                                        ) : (
                                            <Person style={{ fontSize: 14 }} className="text-slate-500" />
                                        )}
                                        <span>{role.label}</span>
                                        {isTeam && <span className="text-[10px] opacity-75 font-normal">(Team)</span>}
                                    </span>
                                );
                            })
                        ) : (
                            <span className="text-xs text-slate-400 italic">No team members assigned</span>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Autocomplete
                            multiple
                            options={roles || []}
                            groupBy={(option) => option?.category || (option?.type === 'Team' ? 'Teams (Groups)' : 'Individual Members')}
                            getOptionLabel={(option) => option?.label || ''}
                            isOptionEqualToValue={(option, val) =>
                                (option?.value || option) === (val?.value || val)
                            }
                            value={tempSelectedRoles}
                            onChange={(_, data) => setTempSelectedRoles(data)}
                            renderOption={(props, option) => (
                                <li {...props} key={option.value} className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                    <div className="flex items-center gap-2">
                                        {option.type === 'Team' ? (
                                            <GroupsIcon style={{ fontSize: 18 }} className="text-indigo-600 dark:text-indigo-400" />
                                        ) : (
                                            <Person style={{ fontSize: 18 }} className="text-slate-500" />
                                        )}
                                        <span className="font-semibold text-slate-800 dark:text-white">
                                            {option.label}
                                        </span>
                                    </div>
                                    {option.type === 'Team' ? (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                            Team ({option.memberCount || 0})
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            Member
                                        </span>
                                    )}
                                </li>
                            )}
                            renderTags={(tagValue, getTagProps) =>
                                tagValue.map((option, index) => {
                                    const isTeam = option?.type === 'Team';
                                    return (
                                        <span
                                            {...getTagProps({ index })}
                                            key={option.value || index}
                                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold m-0.5 ${
                                                isTeam
                                                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                            }`}
                                        >
                                            {isTeam ? (
                                                <GroupsIcon style={{ fontSize: 13 }} className="text-indigo-600 dark:text-indigo-400" />
                                            ) : (
                                                <Person style={{ fontSize: 13 }} className="text-slate-500" />
                                            )}
                                            <span>{option.label}</span>
                                        </span>
                                    );
                                })
                            }
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    autoFocus
                                    placeholder={tempSelectedRoles.length === 0 ? "Select assignees..." : ""}
                                    size="small"
                                    variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '12px' } }}
                                />
                            )}
                        />
                    </div>
                )}
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
