import React, { useState, useEffect, useContext } from 'react';
import {
  Button,
  IconButton,
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Popover,
} from '@mui/material';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import axios from 'axios';
import { apiPath } from '../../../apiPath';
import { toast } from 'react-toastify';
import Loader from '../../common/Loader';
import { EmailContext } from '../../EmailProvider/EmailContext';

interface Employee {
  label: string;
  value: string;
  role?: string;
  skills?: string[];
  freeSlots?: { start: string; end: string }[];
  available?: boolean;
}

interface AppointmentFormProps {
  jobId: string;
  allAppointments: () => void;
  appointmentToEdit?: any;
  open?: boolean;
  onClose?: () => void;
  hideTriggerButton?: boolean;
  viewOnly?: boolean;
}

const planningTypes = [
  'Move',
  'Packing',
  'Loading',
  'Unloading',
  'Survey',
  'Other',
];
const workOptions = [
  'Driver',
  'Helper',
  'Packing',
  'Loading',
  'Unloading',
  'Survey',
  'Other',
];


const employeeRoleOptions = [
  'Distributor',
  'Foreman',
  'Handyman',
  'Helper',
  'Logistics Coordinator',
  'Mover',
  'Packer',
];

interface EmployeeAssignment {
  employeeId: string;
  employeeName: string;
  workType: string;
  startTime: string;
  endTime: string;
  vehicle: string;
}
interface vehicleSummary {
  _id: string;
  vehicleType: string;
  name: string;
  licensePlate: string;
  model: string;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  jobId,
  allAppointments,
  appointmentToEdit,
  open,
  onClose,
  hideTriggerButton,
  viewOnly = false,
}) => {
  const [innerOpen, setInnerOpen] = useState<boolean>(false);
  const [vehicleOptions, setVehicleOptions] = useState<vehicleSummary[]>([]);
  const [data, setData] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [employeeAssignments, setEmployeeAssignments] = useState<
    EmployeeAssignment[]
  >([]);

  const [departureLocation, setDepartureLocation] = useState<string>('');
  const [planningType, setPlanningType] = useState<string>('Move');
  const [editingAppointmentId, setEditingAppointmentId] = useState<
    string | null
  >(null);
  const [originalAppointmentDate, setOriginalAppointmentDate] = useState<
    string | null
  >(null);

  const [notes, setNotes] = useState<string>('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [roleFilterAnchor, setRoleFilterAnchor] = useState<null | HTMLElement>(
    null,
  );
  const { settings } = useContext(EmailContext) as any;
  const [companyDetail, setCompanyDetail] = useState<any>(null);

  const isEditMode = Boolean(appointmentToEdit);
  const modalOpen = open !== undefined ? open : innerOpen;
  const showTrigger = hideTriggerButton ? false : open === undefined;

  const notify = (message: string) => toast(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${apiPath}/api/company-details`);
        const data = await response.json();
        setCompanyDetail(data);

      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };
    fetchCompanyDetails();
  }, []);

  const resetForm = () => {
    setSelectedEmployees([]);
    setEmployeeAssignments([]);

    setDepartureLocation('');
    setPlanningType('Move');
    setNotes('');
    setSelectedDate(null);
    setSelectedRoles([]);
    setEditingAppointmentId(null);
    setActiveStep(1);
  };

  const handleClose = () => {
    if (open === undefined) {
      setInnerOpen(false);
    }
    if (onClose) {
      onClose();
    }
    resetForm();
    allAppointments();
  };

  const handleOpen = () => {
    if (open === undefined) {
      setInnerOpen(true);
    }
  };

  const handleRoleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setRoleFilterAnchor(event.currentTarget);
  };

  const handleRoleFilterClose = () => {
    setRoleFilterAnchor(null);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role],
    );
  };

  const roleFilterOpen = Boolean(roleFilterAnchor);

  const getAppointmentEmployeeOptions = () => {
    if (!appointmentToEdit?.assignedEmployees) return [];

    // Fetch missing vehicles and add them to the options
    fetch(`${apiPath}/api/vehicles`)
      .then((d) => d.json())
      .then((vehicles) => {
        setVehicleOptions((prev) => {
          const merged = [...prev];
          vehicles.forEach((v: any) => {
            if (!merged.find((m) => m._id === v._id)) merged.push(v);
          });
          return merged;
        });
      })
      .catch((err) => {
        console.error('Error fetching vehicles:', err);
      });

    return (appointmentToEdit.assignedEmployees || []).map((employee: any) => ({
      label: employee.employeeName || '',
      value: employee.employeeId,
      role: employee.role,
      skills: employee.skills || [],
      freeSlots:
        employee.startTime && employee.endTime
          ? [
            {
              start: employee.startTime.slice(11, 16),
              end: employee.endTime.slice(11, 16),
            },
          ]
          : [],
      available: true,
    }));
  };

  const handleAllEmploye = async () => {
    try {
      if (!selectedDate) {
        notifyError('Please select a date to fetch employees');
        return;
      }

      const response = await axios.get(
        `${apiPath}/user/employees/${formatSelectedDate()}`,
      );
      setVehicleOptions(response.data?.vehicles || []);

      const EmployeeList = (response.data?.employees || [])
        .filter(
          (team: any) =>
            team.available &&
            Array.isArray(team.freeSlots) &&
            team.freeSlots.length > 0,
        )
        .map((team: any) => ({
          label: `${team.username}${team.skills && team.skills.length ? ' (' + team.skills.join(', ') + ')' : ''}`,
          value: team._id,
          role: team.role,
          skills: team.skills || [],
          freeSlots: team.freeSlots || [],
          available: !!team.available,
        }));

      const appointmentEmployees = getAppointmentEmployeeOptions();
      const mergedEmployeeList = appointmentEmployees.reduce(
        (result: Employee[], employeeOption: Employee) => {
          const exists = result.find(
            (item) => item.value === employeeOption.value,
          );
          if (!exists) {
            result.push(employeeOption);
          }
          return result;
        },
        [...EmployeeList],
      );

      const isOriginalDate = isEditMode && originalAppointmentDate === formatSelectedDate();

      setData(mergedEmployeeList);
      setSelectedEmployees((current) => {
        if (!current.length && appointmentEmployees.length && isOriginalDate) {
          return appointmentEmployees;
        }

        return current.map((employee) => {
          const fetched = mergedEmployeeList.find(
            (item: Employee) => item.value === employee.value,
          );
          return fetched || employee;
        });
      });
    } catch (err: any) {
      notifyError(err.message);
    }
  };

  const getFormattedDateFromString = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (appointmentToEdit) {
      setEditingAppointmentId(appointmentToEdit._id || null);
      setSelectedDate(
        appointmentToEdit.date ? new Date(appointmentToEdit.date) : null,
      );
      setPlanningType(appointmentToEdit.appointmentType || 'Move');
      setDepartureLocation(appointmentToEdit.departureLocation || '');
      setNotes(appointmentToEdit.notes || '');

      setOriginalAppointmentDate(
        appointmentToEdit.date
          ? getFormattedDateFromString(appointmentToEdit.date)
          : null,
      );
      setActiveStep(1);

      const assignedEmployees = (appointmentToEdit.assignedEmployees || []).map(
        (employee: any) => ({
          employeeId: employee.employeeId,
          employeeName: employee.employeeName,
          workType: employee.workType || 'Other',

          // Extracting time in HH:mm
          startTime: employee.startTime ? employee.startTime.slice(11, 16) : '',
          endTime: employee.endTime ? employee.endTime.slice(11, 16) : '',
          vehicle: employee.vehicle || '',
        }),
      );
      setEmployeeAssignments(assignedEmployees);
      setSelectedEmployees(
        assignedEmployees.map((assignment: any) => ({
          label: assignment.employeeName,
          value: assignment.employeeId,
          freeSlots:
            assignment.startTime && assignment.endTime
              ? [{ start: assignment.startTime, end: assignment.endTime }]
              : [],
        })),
      );
    }
  }, [appointmentToEdit]);

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEmployeeSelection = (employees: Employee[]) => {
    const normalizedEmployees = employees.map((employee) => {
      const fetched = data.find((item) => item.value === employee.value);
      return fetched || employee;
    });

    setSelectedEmployees(normalizedEmployees);
    setEmployeeAssignments((prev) => {
      const existingMap = new Map(prev.map((item) => [item.employeeId, item]));
      const nextAssignments = normalizedEmployees.map((employee) => {
        const existing = existingMap.get(employee.value);
        if (existing) return existing;

        return {
          employeeId: employee.value,
          employeeName: employee.label,
          workType: 'Other',
          startTime: '',
          endTime: '',
          vehicle: '',
        };
      });
      return nextAssignments;
    });
  };

  const timeOptions = Array.from({ length: 48 }, (_, index) => {
    const hours = Math.floor(index / 2);
    const minutes = index % 2 === 0 ? '00' : '30';
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  });

  const getEmployeeFreeSlots = (employeeId: string) => {
    const employee =
      selectedEmployees.find((item) => item.value === employeeId) ||
      data.find((item) => item.value === employeeId);
    return employee?.freeSlots || [];
  };

  const getAssignedVehicleNames = (currentDriverId: string) =>
    employeeAssignments
      .filter(
        (assignment) =>
          assignment.workType === 'Driver' &&
          assignment.employeeId !== currentDriverId &&
          assignment.vehicle,
      )
      .map((assignment) => assignment.vehicle);

  const getSlotForStartTime = (employeeId: string, startTime: string) => {
    const slots = getEmployeeFreeSlots(employeeId);
    return slots.find(
      (slot) => startTime >= slot.start && startTime < slot.end,
    );
  };

  const isStartTimeValid = (
    time: string,
    slots: { start: string; end: string }[],
  ) => {
    return slots.some((slot) => time >= slot.start && time < slot.end);
  };

  const handleAssignmentChange = (
    employeeId: string,
    field: keyof EmployeeAssignment,
    value: string,
  ) => {
    setEmployeeAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.employeeId !== employeeId) return assignment;

        if (field === 'startTime') {
          const slots = getEmployeeFreeSlots(employeeId);
          if (!slots.length || !isStartTimeValid(value, slots)) {
            return assignment;
          }

          const validSlot = getSlotForStartTime(employeeId, value);
          return {
            ...assignment,
            startTime: value,
            endTime:
              validSlot &&
                assignment.endTime &&
                assignment.endTime > value &&
                assignment.endTime <= validSlot.end
                ? assignment.endTime
                : '',
          };
        }

        if (field === 'endTime') {
          const validSlot = getSlotForStartTime(
            employeeId,
            assignment.startTime,
          );
          if (
            !assignment.startTime ||
            !validSlot ||
            value <= assignment.startTime ||
            value > validSlot.end
          ) {
            return assignment;
          }

          return {
            ...assignment,
            endTime: value,
          };
        }

        return {
          ...assignment,
          [field]: value,
        };
      }),
    );
  };

  const getDerivedTimeRange = () => {
    const validStarts = employeeAssignments
      .map((assignment) => assignment.startTime)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    const validEnds = employeeAssignments
      .map((assignment) => assignment.endTime)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return {
      startTime: validStarts[0] || '',
      endTime: validEnds[validEnds.length - 1] || '',
    };
  };

  const validateForm = () => {
    if (!selectedDate) {
      notifyError('Please select a date');
      return false;
    }

    if (!planningType) {
      notifyError('Please select a planning type');
      return false;
    }

    if (!departureLocation.trim()) {
      notifyError('Please enter a departure location');
      return false;
    }

    if (!employeeAssignments.length) {
      notifyError('Please select at least one employee');
      return false;
    }

    const hasInvalidAssignment = employeeAssignments.some((assignment) => {
      if (!assignment.workType) {
        return true;
      }
      if (
        !assignment.startTime ||
        !assignment.endTime ||
        assignment.startTime >= assignment.endTime
      ) {
        return true;
      }
      if (assignment.workType === 'Driver' && !assignment.vehicle) {
        return true;
      }
      return false;
    });

    if (hasInvalidAssignment) {
      notifyError(
        'Please complete all employee assignment details, including time slots and vehicle for drivers',
      );
      return false;
    }

    const { startTime, endTime } = getDerivedTimeRange();
    if (!startTime || !endTime || startTime >= endTime) {
      notifyError(
        'Please provide a valid time range using the earliest start and latest end across all selected employees',
      );
      return false;
    }

    return true;
  };

  // convert this enter time and date
  function datetimeStringWithTime(date: string, time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const dateObj = new Date(date);
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj.toISOString();
  }
  const createAppointment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { startTime, endTime } = getDerivedTimeRange();
      const employeeAssignmentsWithTimes = employeeAssignments.map(
        (assignment) => ({
          ...assignment,
          startTime: datetimeStringWithTime(
            formatSelectedDate(),
            assignment.startTime,
          ),
          endTime: datetimeStringWithTime(
            formatSelectedDate(),
            assignment.endTime,
          ),
        }),
      );

      const payload = {
        jobId,
        appointmentType: planningType,
        date: formatSelectedDate(),
        startTime: datetimeStringWithTime(formatSelectedDate(), startTime),
        endTime: datetimeStringWithTime(formatSelectedDate(), endTime),
        departureLocation,
        notes,
        participants: employeeAssignments.length,
        assignedEmployees: employeeAssignmentsWithTimes,

      };

      let response;
      if (isEditMode && editingAppointmentId) {
        response = await axios.put(
          `${apiPath}/api/appointment/${editingAppointmentId}`,
          payload,
        );
      } else {
        response = await axios.post(`${apiPath}/api/appointment`, payload);
      }

      handleClose();

      await SendEmail(
        response.data,
        settings?.emailTemplates?.appointment ||
        settings?.emailTemplates?.rescheduleAppointment,
      );
      notify(
        isEditMode
          ? 'Planning appointment updated successfully'
          : 'Planning appointment created successfully',
      );
    } catch (error: any) {
      notifyError(`Error saving appointment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const SendEmail = async (data: any, templateId: string) => {
    try {
      const response = await axios.post(`${apiPath}/email/send_email`, {
        job: jobId,
        emailTemplateId: templateId,
        extraData: data,
        subject: `Planning appointment booked for ${data.appointmentType} on ${data.date} from techbeeps solution`,
      });
      if (response.status === 200) {
        notify('Appointment confirmation email sent successfully');
      }
    } catch (error: any) {
      notifyError(
        `Error in Sending Appointment confirmation: ${error.message}`,
      );
    }
  };

  const getAppointments = async () => {
    setLoading(true);
    try {
      await axios.get(
        `${apiPath}/api/appointment?jobId=${jobId}&date=${formatSelectedDate()}`,
      );
    } catch (error: any) {
      notifyError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      getAppointments();
    }
  }, [jobId, selectedDate]);

  // Fetch employees when a date is selected
  useEffect(() => {
    if (!selectedDate) {
      return;
    }

    const dateString = formatSelectedDate();
    const isOriginalDate = isEditMode && originalAppointmentDate === dateString;

    if (!isOriginalDate) {
      setSelectedEmployees([]);
      setEmployeeAssignments([]);
    }

    handleAllEmploye();
  }, [selectedDate]);

  const roleSummary = employeeAssignments.reduce(
    (summary, assignment) => {
      if (assignment.workType === 'Driver') {
        summary.drivers += 1;
      } else if (assignment.workType === 'Helper') {
        summary.helpers += 1;
      } else if (assignment.workType === 'Packing') {
        summary.packers += 1;
      } else if (
        ['Loading', 'Unloading', 'Move', 'Load', 'Unload'].includes(
          assignment.workType,
        )
      ) {
        summary.movers += 1;
      }
      return summary;
    },
    { packers: 0, movers: 0, helpers: 0, drivers: 0 },
  );
  //

  // Filter employees based on selected roles
  // employee.role is a array of strings, so we check if any of the employee's roles match the selected roles

  const filteredEmployeeOptions = selectedRoles.length
    ? data.filter(
      (employee: any) =>
        employee?.skills?.some((role: string) =>
          selectedRoles.includes(role),
        ) ||
        selectedEmployees.some(
          (selected) => selected.value === employee.value,
        ),
    )
    : data;

  const handleNextStep = () => {
    if (activeStep === 1) {
      if (!selectedDate) {
        notifyError('Please select a date before continuing');
        return;
      }
      if (!planningType) {
        notifyError('Please select a planning type before continuing');
        return;
      }
      if (!departureLocation.trim()) {
        notifyError('Please enter a departure location before continuing');
        return;
      }
    }

    if (activeStep === 2) {
      if (!employeeAssignments.length) {
        notifyError('Please select at least one employee before continuing');
        return;
      }

      const hasInvalidAssignment = employeeAssignments.some((assignment) => {
        if (!assignment.workType) {
          return true;
        }
        if (
          !assignment.startTime ||
          !assignment.endTime ||
          assignment.startTime >= assignment.endTime
        ) {
          return true;
        }
        if (assignment.workType === 'Driver' && !assignment.vehicle) {
          return true;
        }
        return false;
      });

      if (hasInvalidAssignment) {
        notifyError(
          'Please complete all employee assignment details before continuing',
        );
        return;
      }
    }

    setActiveStep((prev) => Math.min(prev + 1, 3));
  };
  const handlePrevStep = () => setActiveStep((prev) => Math.max(prev - 1, 1));
  const locations = [
    `${companyDetail?.companyName} (${companyDetail?.companyAddress}, ${companyDetail?.companyState}, ${companyDetail?.companyCountry})`,
  ];
  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {showTrigger && (
          <button
            type="button"
            onClick={handleOpen}
            className="px-4 py-2 rounded-xl border border-primary text-primary hover:bg-primary/10 font-bold text-xs transition-all cursor-pointer"
          >
            + New Appointment
          </button>
        )}
        <Modal open={modalOpen} onClose={handleClose}>
          <Box className={`bg-white dark:bg-boxdark rounded-2xl border border-slate-200 dark:border-strokedark p-6 shadow-2xl absolute top-6 left-1/2 transform -translate-x-1/2 ${viewOnly ? 'max-w-3xl' : 'max-w-6xl'} w-[95vw] max-h-[90vh] overflow-auto text-slate-800 dark:text-white font-sans`}>
            {/* If viewOnly and appointmentToEdit, render a dedicated read-only view */}
            {viewOnly && appointmentToEdit && (
              <div className="space-y-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-strokedark">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        Appointment Details
                      </h3>
                      <span className="px-3 py-1 text-xs font-extrabold rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {appointmentToEdit.appointmentType || 'Appointment'}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-500">
                      Scheduled appointment overview & assigned team members
                    </p>
                  </div>

                  <IconButton
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>

                {/* Key Overview Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <CalendarTodayIcon style={{ fontSize: 14 }} className="text-primary" />
                      <span>Date</span>
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {appointmentToEdit.date
                        ? new Date(appointmentToEdit.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <AccessTimeIcon style={{ fontSize: 14 }} className="text-primary" />
                      <span>Time Window</span>
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {appointmentToEdit.startTime
                        ? new Date(appointmentToEdit.startTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'N/A'}{' '}
                      -{' '}
                      {appointmentToEdit.endTime
                        ? new Date(appointmentToEdit.endTime).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <PeopleIcon style={{ fontSize: 14 }} className="text-primary" />
                      <span>Assigned Team</span>
                    </div>
                    <p className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {appointmentToEdit.assignedEmployees?.length || 0} Employees
                    </p>
                  </div>

                  <div className="bg-slate-50/70 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1 sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <LocationOnIcon style={{ fontSize: 14 }} className="text-primary" />
                      <span>Departure</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {appointmentToEdit.departureLocation || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Notes if available */}
                {appointmentToEdit.notes && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/40 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-extrabold uppercase tracking-wider text-[11px]">
                      <EventNoteIcon style={{ fontSize: 16 }} />
                      <span>Appointment Notes</span>
                    </div>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                      {appointmentToEdit.notes}
                    </p>
                  </div>
                )}

                {/* Assigned Employees List Container */}
                <div className="bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <PeopleIcon fontSize="small" className="text-primary" />
                    <span>Assigned Employees ({appointmentToEdit.assignedEmployees?.length || 0})</span>
                  </h4>

                  {appointmentToEdit.assignedEmployees && appointmentToEdit.assignedEmployees.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {appointmentToEdit.assignedEmployees.map((emp: any, idx: number) => {
                        const empStartTime = emp.startTime
                          ? new Date(emp.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                          : 'N/A';
                        const empEndTime = emp.endTime
                          ? new Date(emp.endTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                          : 'N/A';

                        return (
                          <div
                            key={emp._id || emp.employeeId || idx}
                            className="bg-slate-50/80 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                                  {emp.employeeName?.charAt(0) || 'E'}
                                </div>
                                <div>
                                  <span className="font-extrabold text-slate-900 dark:text-white text-sm block">
                                    {emp.employeeName}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2.5 py-0.5 rounded-md bg-white dark:bg-boxdark font-bold text-primary border border-slate-200/80 dark:border-strokedark text-[11px]">
                                {emp.workType || 'Member'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between pt-1 text-slate-500 font-medium">
                              <span>Shift: <strong className="text-slate-800 dark:text-slate-200">{empStartTime} - {empEndTime}</strong></span>
                              {emp.vehicle && (
                                <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                  <DirectionsCarIcon style={{ fontSize: 14 }} />
                                  <span>
                                    {(() => {
                                      const v = vehicleOptions.find((vv) => vv._id === emp.vehicle);
                                      return v ? v.name : 'Vehicle';
                                    })()}
                                  </span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs font-medium py-4 text-center">No employees assigned to this appointment.</p>
                  )}
                </div>

                {/* Modal Action Footer */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-strokedark">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-strokedark text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {!viewOnly && (
              <>
                <div className="relative flex items-center justify-between ">
                  <Box>
                    <Typography
                      variant="h5"
                      className="font-semibold text-slate-800"
                    >
                      {appointmentToEdit ? 'Edit' : 'New'} Appointment
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
                {loading && <Loader />}

                <Box className="mb-4 flex flex-wrap justify-evenly items-center gap-2">
                  {[1, 2, 3].map((step) => (
                    <Box
                      key={step}
                      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${activeStep === step
                          ? 'border-blue bg-blue text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600'
                        }`}
                    >
                      <Box
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${activeStep === step ? 'bg-white text-blue' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {step}
                      </Box>
                      Step {step}
                    </Box>
                  ))}
                </Box>

                <Box className=" gap-4">
                  <Box className="space-y-4">
                    {activeStep === 1 && (
                      <Paper
                        elevation={0}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
                      >
                        <Typography variant="h6" className="mb-3 text-slate-700">
                          1. Pick the date and planning details
                        </Typography>
                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Box>
                            <StaticDatePicker
                              value={selectedDate}
                              onChange={(date) => setSelectedDate(date)}
                              disablePast
                              slots={{
                                actionBar: () => null,
                              }}
                            />
                          </Box>
                          <Box className="space-y-3">
                            <FormControl fullWidth size="small">
                              <InputLabel>Planning type</InputLabel>
                              <Select
                                value={planningType}
                                label="Planning type"
                                onChange={(event) =>
                                  setPlanningType(event.target.value)
                                }
                              >
                                {planningTypes.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>

                            <Autocomplete
                              freeSolo
                              options={locations}
                              value={departureLocation}
                              onInputChange={(_, newValue) =>
                                setDepartureLocation(newValue)
                              }
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  label="Departure location"
                                  fullWidth
                                />
                              )}
                            />


                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              label="Notes"
                              value={notes}
                              onChange={(event) => setNotes(event.target.value)}
                              placeholder="Add instructions, access notes, or customer preferences"
                            />
                          </Box>
                        </Box>
                      </Paper>
                    )}

                    {activeStep === 2 && (
                      <Paper
                        elevation={0}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
                      >
                        <Typography variant="h6" className="mb-3 text-slate-700">
                          2. Assign employees and resources
                        </Typography>
                        <Box className="space-y-3">
                          <Box className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                            <Box className="mb-2 flex items-center justify-between gap-2">
                              <Autocomplete
                                className="w-full"
                                multiple
                                selectOnFocus
                                options={filteredEmployeeOptions}
                                value={selectedEmployees}
                                onChange={(_, newValue) =>
                                  handleEmployeeSelection(newValue)
                                }
                                getOptionLabel={(option) => option.label}
                                isOptionEqualToValue={(option, value) =>
                                  option.value === value.value
                                }
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Select employees"
                                    placeholder="Search employees"
                                  />
                                )}
                              />
                              <Box className="flex items-center gap-2">
                                <IconButton
                                  size="small"
                                  onClick={handleRoleFilterOpen}
                                  className="border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                                >
                                  <FilterListIcon fontSize="small" />
                                </IconButton>
                                {selectedRoles.length > 0 && (
                                  <Box className="w-[100px] rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    {selectedRoles.length} selected
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          <Popover
                            open={roleFilterOpen}
                            anchorEl={roleFilterAnchor}
                            onClose={handleRoleFilterClose}
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }}
                            transformOrigin={{
                              vertical: 'top',
                              horizontal: 'right',
                            }}
                            disableRestoreFocus
                          >
                            <Box className="max-w-xs p-4">
                              <Typography
                                variant="subtitle2"
                                className="mb-3 text-slate-700"
                              >
                                Filter roles
                              </Typography>
                              {employeeRoleOptions.map((role) => (
                                <FormControlLabel
                                  key={role}
                                  control={
                                    <Checkbox
                                      checked={selectedRoles.includes(role)}
                                      onChange={() => toggleRole(role)}
                                      size="small"
                                    />
                                  }
                                  label={role}
                                />
                              ))}
                              <Box className="mt-3 flex justify-end gap-2">
                                <Button
                                  size="small"
                                  onClick={() => setSelectedRoles([])}
                                >
                                  Clear
                                </Button>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={handleRoleFilterClose}
                                >
                                  Done
                                </Button>
                              </Box>
                            </Box>
                          </Popover>

                          {employeeAssignments.map((assignment) => (
                            <Box
                              key={assignment.employeeId}
                              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3"
                            >
                              <Box className="flex flex-wrap items-center justify-between gap-2">
                                <Typography
                                  variant="subtitle2"
                                  className="text-slate-700"
                                >
                                  {assignment.employeeName}
                                </Typography>
                                <Box className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                  {assignment.workType === 'Driver'
                                    ? 'Driver'
                                    : 'Support'}
                                </Box>
                              </Box>

                              <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormControl fullWidth size="small">
                                  <InputLabel>Work</InputLabel>
                                  <Select
                                    value={assignment.workType}
                                    label="Work"
                                    onChange={(event) =>
                                      handleAssignmentChange(
                                        assignment.employeeId,
                                        'workType',
                                        event.target.value,
                                      )
                                    }
                                  >
                                    {workOptions.map((option) => (
                                      <MenuItem key={option} value={option}>
                                        {option}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <TextField
                                  select
                                  label="Start time"
                                  value={assignment.startTime}
                                  onChange={(event) =>
                                    handleAssignmentChange(
                                      assignment.employeeId,
                                      'startTime',
                                      event.target.value,
                                    )
                                  }
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                >
                                  {(() => {
                                    const slots = getEmployeeFreeSlots(
                                      assignment.employeeId,
                                    );
                                    const slotsEdit = [
                                      {
                                        start: assignment.startTime,
                                        end: assignment.endTime,
                                      },
                                    ];
                                    const effectiveSlots =
                                      isEditMode && assignment.startTime && assignment.endTime
                                        ? slotsEdit
                                        : slots;
                                    const options = timeOptions.filter((time) =>
                                      isStartTimeValid(time, effectiveSlots),
                                    );
                                    return options.length ? (
                                      options.map((time) => (
                                        <MenuItem key={time} value={time}>
                                          {time}
                                        </MenuItem>
                                      ))
                                    ) : (
                                      <MenuItem value="" disabled>
                                        No start times available
                                      </MenuItem>
                                    );
                                  })()}
                                </TextField>
                                <TextField
                                  select
                                  label="End time"
                                  value={assignment.endTime}
                                  onChange={(event) =>
                                    handleAssignmentChange(
                                      assignment.employeeId,
                                      'endTime',
                                      event.target.value,
                                    )
                                  }
                                  InputLabelProps={{ shrink: true }}
                                  fullWidth
                                  disabled={!assignment.startTime}
                                >
                                  {(() => {
                                    if (!assignment.startTime) {
                                      return [
                                        <MenuItem key="no-start" value="" disabled>
                                          Select a start time first
                                        </MenuItem>,
                                      ];
                                    }
                                    const validSlot = getSlotForStartTime(
                                      assignment.employeeId,
                                      assignment.startTime,
                                    );
                                    const effectiveSlot =
                                      isEditMode && assignment.startTime && assignment.endTime
                                        ? {
                                          start: assignment.startTime,
                                          end: assignment.endTime,
                                        }
                                        : validSlot;

                                    const options = timeOptions.filter((time) => {
                                      return (
                                        !!effectiveSlot &&
                                        time > assignment.startTime &&
                                        time <= effectiveSlot.end
                                      );
                                    });
                                    return options.length ? (
                                      options.map((time) => (
                                        <MenuItem key={time} value={time}>
                                          {time}
                                        </MenuItem>
                                      ))
                                    ) : (
                                      <MenuItem value="" disabled>
                                        No end times available
                                      </MenuItem>
                                    );
                                  })()}
                                </TextField>
                              </Box>

                              {assignment.workType === 'Driver' && (
                                <FormControl fullWidth size="small">
                                  <InputLabel>Vehicle</InputLabel>
                                  <Select
                                    value={assignment.vehicle}
                                    label="Vehicle"
                                    onChange={(event) =>
                                      handleAssignmentChange(
                                        assignment.employeeId,
                                        'vehicle',
                                        event.target.value,
                                      )
                                    }
                                  >
                                    {(() => {
                                      const availableVehicles =
                                        vehicleOptions.filter(
                                          (option) =>
                                            !getAssignedVehicleNames(
                                              assignment.employeeId,
                                            ).includes(option.name),
                                        );
                                      return availableVehicles.length ? (
                                        availableVehicles.map((option) => (
                                          <MenuItem
                                            key={option._id}
                                            value={option._id}
                                          >
                                            {option.name}{' '}
                                            {option.licensePlate
                                              ? `(${option.licensePlate})`
                                              : ''}
                                          </MenuItem>
                                        ))
                                      ) : (
                                        <MenuItem value="" disabled>
                                          No vehicles available
                                        </MenuItem>
                                      );
                                    })()}
                                  </Select>
                                </FormControl>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    )}
                  </Box>

                  <Box className="space-y-4">
                    {activeStep === 3 && (
                      <Paper
                        elevation={0}
                        className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm"
                      >
                        <Typography variant="h6" className="mb-3 text-slate-700">
                          3. Review the assignment plan
                        </Typography>
                        <Box className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                          <Typography
                            variant="subtitle2"
                            className="text-slate-700"
                          >
                            Plan summary
                          </Typography>
                          <Typography variant="body2" className="text-slate-600">
                            Date:{' '}
                            {selectedDate
                              ? selectedDate.toDateString()
                              : 'Not selected'}
                          </Typography>
                          <Typography variant="body2" className="text-slate-600">
                            Planning type: {planningType}
                          </Typography>
                          <Typography variant="body2" className="text-slate-600">
                            Departure location: {departureLocation || 'Not entered'}
                          </Typography>
                          {roleSummary.packers > 0 && (
                            <Typography variant="body2" className="text-slate-600">
                              Packers: {roleSummary.packers}
                            </Typography>
                          )}
                          {roleSummary.movers > 0 && (
                            <Typography variant="body2" className="text-slate-600">
                              Movers: {roleSummary.movers}
                            </Typography>
                          )}
                          {roleSummary.helpers > 0 && (
                            <Typography variant="body2" className="text-slate-600">
                              Helpers: {roleSummary.helpers}
                            </Typography>
                          )}
                          {roleSummary.drivers > 0 && (
                            <Typography variant="body2" className="text-slate-600">
                              Drivers: {roleSummary.drivers}
                            </Typography>
                          )}
                          <Typography variant="body2" className="text-slate-600">
                            Total employees: {employeeAssignments.length}
                          </Typography>
                          <Typography variant="body2" className="text-slate-600">
                            Assigned employees:{' '}
                            {employeeAssignments.length > 0
                              ? employeeAssignments
                                .map((item) => item.employeeName)
                                .join(', ')
                              : 'None selected'}
                          </Typography>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Box>

                <Box className="flex justify-end mt-6 gap-2">
                  {activeStep > 1 && (
                    <Button variant="outlined" onClick={handlePrevStep}>
                      Back
                    </Button>
                  )}
                  {activeStep < 3 ? (
                    <Button variant="contained" onClick={handleNextStep}>
                      Next
                    </Button>
                  ) : (
                    <Button variant="contained" onClick={createAppointment}>
                      {isEditMode ? 'Save changes' : 'Submit appointment'}
                    </Button>
                  )}
                </Box>

              </>)}
          </Box>
        </Modal>
      </LocalizationProvider>
    </div>
  );
};

export default AppointmentForm;
