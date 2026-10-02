import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Switch,
  InputAdornment,
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
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import PlaceIcon from '@mui/icons-material/Place';
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

const formatJobAddress = (addr: any) => {
  if (!addr) return '';
  const street = addr.street || addr.streetName || '';
  const house = addr.houseNumber || '';
  const postcode = addr.postcode || addr.postalCode || '';
  const city = addr.city || '';
  const country = addr.country || '';
  const parts = [
    street ? `${street} ${house}`.trim() : '',
    postcode,
    city,
    country
  ].filter(Boolean);
  return parts.join(', ');
};

const parseLocationOption = (opt: string) => {
  if (!opt) {
    return {
      role: 'Location',
      type: 'custom',
      address: '',
      badgeText: 'LOCATION',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    };
  }

  if (opt.startsWith('Origin') || opt.includes('Origin (Pickup)')) {
    const rawAddr = opt.replace(/^Origin\s*(\([^)]*\))?:\s*/i, '').trim();
    return {
      role: 'Origin (Pickup Address)',
      type: 'origin',
      address: rawAddr,
      badgeText: 'ORIGIN / PICKUP',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
    };
  }

  if (opt.startsWith('Destination') || opt.includes('Destination (Delivery)')) {
    const rawAddr = opt.replace(/^Destination\s*(\([^)]*\))?:\s*/i, '').trim();
    return {
      role: 'Destination (Delivery Address)',
      type: 'destination',
      address: rawAddr,
      badgeText: 'DESTINATION / DELIVERY',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400',
    };
  }

  if (opt.startsWith('Depot') || opt.includes('Depot:')) {
    const rawAddr = opt.replace(/^Depot:\s*/i, '').trim();
    return {
      role: 'Company Depot (HQ / Warehouse)',
      type: 'depot',
      address: rawAddr,
      badgeText: 'COMPANY DEPOT',
      badgeClass: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
    };
  }

  return {
    role: 'Custom Address',
    type: 'custom',
    address: opt,
    badgeText: 'CUSTOM ADDRESS',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  };
};

interface EmployeeAssignment {
  employeeId: string;
  employeeName: string;
  workType: string;
  startTime: string;
  endTime: string;
  vehicle: any;
  needsVehicle?: boolean;
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
  const [vehicleBookings, setVehicleBookings] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
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
  const [jobDetails, setJobDetails] = useState<any>(null);
  const [sendCustomerEmail, setSendCustomerEmail] = useState<boolean>(false);

  const isEditMode = Boolean(appointmentToEdit);
  const modalOpen = open !== undefined ? open : innerOpen;
  const showTrigger = hideTriggerButton ? false : open === undefined;

  const notify = (message: string) => toast(message);
  const notifyError = (message: string) =>
    toast.error(message, {
      autoClose: 2000,
    });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`${apiPath}/api/company-details`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setCompanyDetail(data);
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };
    fetchCompanyDetails();
  }, []);

  useEffect(() => {
    if (!jobId) return;
    axios
      .get(`${apiPath}/api/jobs/${jobId}`, {
        headers: getAuthHeaders(),
      })
      .then((res) => {
        setJobDetails(res.data);
        if (!isEditMode && !departureLocation) {
          const loadP = formatJobAddress(res.data?.load);
          if (loadP) {
            setDepartureLocation(`Origin (Pickup): ${loadP}`);
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching job details for appointment:', err);
      });
  }, [jobId]);

  const initialSnapshotRef = useRef<string | null>(null);

  const computeSnapshot = (
    dateVal: Date | null,
    planType: string,
    depLoc: string,
    vehicleId: string,
    notesVal: string,
    assignments: EmployeeAssignment[],
  ) => {
    return JSON.stringify({
      d: dateVal
        ? (dateVal instanceof Date && !isNaN(dateVal.getTime())
          ? dateVal.toISOString().slice(0, 10)
          : String(dateVal).slice(0, 10))
        : '',
      p: planType || 'Move',
      loc: (depLoc || '').trim(),
      v: vehicleId || '',
      n: (notesVal || '').trim(),
      a: (assignments || []).map((emp) => ({
        id: emp.employeeId,
        w: emp.workType || '',
        s: emp.startTime || '',
        e: emp.endTime || '',
        v:
          typeof emp.vehicle === 'object' && emp.vehicle !== null
            ? emp.vehicle._id
            : (emp.vehicle || ''),
      })),
    });
  };

  const currentSnapshot = computeSnapshot(
    selectedDate,
    planningType,
    departureLocation,
    selectedVehicleId,
    notes,
    employeeAssignments,
  );

  const isFormDirty =
    Boolean(modalOpen) &&
    initialSnapshotRef.current !== null &&
    currentSnapshot !== initialSnapshotRef.current;

  // Prevent accidental tab closing or browser refresh when changes are unsaved (AT-028-1)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (modalOpen && isFormDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [modalOpen, isFormDirty]);

  // Set initial snapshot when opening clean New Appointment modal
  useEffect(() => {
    if (modalOpen && !appointmentToEdit) {
      const defaultLoc =
        !departureLocation && jobDetails?.load
          ? `Origin (Pickup): ${formatJobAddress(jobDetails.load)}`
          : departureLocation || '';

      if (!departureLocation && defaultLoc) {
        setDepartureLocation(defaultLoc);
      }

      initialSnapshotRef.current = computeSnapshot(
        selectedDate,
        planningType || 'Move',
        defaultLoc,
        selectedVehicleId || '',
        notes || '',
        employeeAssignments || [],
      );
    }
  }, [modalOpen, appointmentToEdit]);

  const resetForm = () => {
    setSelectedEmployees([]);
    setEmployeeAssignments([]);

    setDepartureLocation('');
    setSelectedVehicleId('');
    setPlanningType('Move');
    setNotes('');
    setSelectedDate(null);
    setSelectedRoles([]);
    setEditingAppointmentId(null);
    setSendCustomerEmail(false);
    setVehicleBookings([]);
    setActiveStep(1);
    initialSnapshotRef.current = null;
  };

  const handleClose = (force = false) => {
    if (!force && !viewOnly && isFormDirty) {
      const confirmDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmDiscard) return;
    }
    initialSnapshotRef.current = null;
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
    fetch(`${apiPath}/api/vehicles`, {
      headers: getAuthHeaders(),
    })
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
              start: formatFriendlyTime(employee.startTime),
              end: formatFriendlyTime(employee.endTime),
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

      const excludeId = editingAppointmentId || appointmentToEdit?._id;
      const excludeQuery = isEditMode && excludeId ? `?excludeAppointmentId=${excludeId}` : '';
      const response = await axios.get(
        `${apiPath}/user/employees/${formatSelectedDate()}${excludeQuery}`,
        { headers: getAuthHeaders() }
      );
      setVehicleOptions(response.data?.vehicles || []);
      setVehicleBookings(response.data?.vehicleBookings || []);

      const allStaff = response.data?.employees || [];
      const EmployeeList = allStaff.map((team: any) => {
        const hasSlots = Array.isArray(team.freeSlots) && team.freeSlots.length > 0;
        const slots = hasSlots ? team.freeSlots : [{ start: '08:00', end: '17:00' }];
        const isAvail = team.available !== false && hasSlots;
        return {
          label: `${team.username}${!isAvail ? ' (Off-duty / Weekend)' : ''}${team.skills && team.skills.length ? ' (' + team.skills.join(', ') + ')' : ''}`,
          value: team._id,
          role: team.role,
          skills: team.skills || [],
          freeSlots: slots,
          available: true,
        };
      });

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

      const parsedDate = appointmentToEdit.date
        ? (typeof appointmentToEdit.date === 'string' && appointmentToEdit.date.includes('T')
          ? new Date(appointmentToEdit.date.split('T')[0] + 'T12:00:00')
          : new Date(String(appointmentToEdit.date) + 'T12:00:00'))
        : null;

      setSelectedDate(parsedDate);
      setPlanningType(appointmentToEdit.appointmentType || 'Move');
      setDepartureLocation(appointmentToEdit.departureLocation || '');
      setNotes(appointmentToEdit.notes || '');

      const appVehicle = appointmentToEdit.vehicle;
      const appVehicleId =
        (typeof appVehicle === 'object' && appVehicle !== null ? appVehicle._id : appVehicle) || '';
      setSelectedVehicleId(appVehicleId);

      if (appVehicle && typeof appVehicle === 'object' && appVehicle._id) {
        setVehicleOptions((prev) => {
          if (!prev.find((v) => v._id === appVehicle._id)) {
            return [appVehicle as any, ...prev];
          }
          return prev;
        });
      }

      setOriginalAppointmentDate(
        appointmentToEdit.date
          ? (typeof appointmentToEdit.date === 'string'
            ? (appointmentToEdit.date.includes('T') ? appointmentToEdit.date.split('T')[0] : appointmentToEdit.date)
            : getFormattedDateFromString(appointmentToEdit.date))
          : null,
      );
      setActiveStep(1);

      const assignedEmployees = (appointmentToEdit.assignedEmployees || []).map(
        (employee: any) => {
          const empVehicle = employee.vehicle;
          const empVehicleId =
            (typeof empVehicle === 'object' && empVehicle !== null ? empVehicle._id : empVehicle) || '';

          if (empVehicle && typeof empVehicle === 'object' && empVehicle._id) {
            setVehicleOptions((prev) => {
              if (!prev.find((v) => v._id === empVehicle._id)) {
                return [empVehicle as any, ...prev];
              }
              return prev;
            });
          }

          const workType = employee.workType || 'Other';
          // Auto-fill vehicle for Driver from employee's vehicle or appointment's allocated vehicle
          const effectiveVehicle = empVehicleId || (workType === 'Driver' ? appVehicleId : '');
          const hasVehicle = Boolean(effectiveVehicle || workType === 'Driver');

          return {
            employeeId: employee.employeeId,
            employeeName: employee.employeeName,
            workType,

            // Extracting exact wall-clock time in HH:mm
            startTime: formatFriendlyTime(employee.startTime),
            endTime: formatFriendlyTime(employee.endTime),
            vehicle: effectiveVehicle,
            needsVehicle: hasVehicle,
          };
        },
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
      initialSnapshotRef.current = computeSnapshot(
        parsedDate,
        appointmentToEdit.appointmentType || 'Move',
        appointmentToEdit.departureLocation || '',
        appVehicleId,
        appointmentToEdit.notes || '',
        assignedEmployees,
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

        const isDriver = employee.role === 'Driver';
        return {
          employeeId: employee.value,
          employeeName: employee.label,
          workType: isDriver ? 'Driver' : 'Other',
          startTime: '',
          endTime: '',
          vehicle: isDriver ? selectedVehicleId : '',
          needsVehicle: isDriver,
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
      data.find((item) => item.value === employeeId) ||
      selectedEmployees.find((item) => item.value === employeeId);
    return employee?.freeSlots || [];
  };

  const getEffectiveSlots = (
    employeeId: string,
    currentAssignment?: EmployeeAssignment,
  ) => {
    const slots = getEmployeeFreeSlots(employeeId);
    if (isEditMode && currentAssignment?.startTime && currentAssignment?.endTime) {
      const alreadyCovered = slots.some(
        (s) =>
          currentAssignment.startTime >= s.start &&
          currentAssignment.endTime <= s.end,
      );
      if (!alreadyCovered) {
        return [
          ...slots,
          { start: currentAssignment.startTime, end: currentAssignment.endTime },
        ];
      }
    }
    return slots;
  };

  const getSlotForStartTime = (
    employeeId: string,
    startTime: string,
    currentAssignment?: EmployeeAssignment,
  ) => {
    const slots = getEffectiveSlots(employeeId, currentAssignment);
    return slots.find(
      (slot) => startTime >= slot.start && startTime < slot.end,
    );
  };

  const isStartTimeValid = (
    time: string,
    slots: { start: string; end: string }[],
  ) => {
    if (!slots || !slots.length) return false;
    return slots.some((slot) => time >= slot.start && time < slot.end);
  };

  const checkVehicleAvailability = (
    vehicleId: string,
    startTime: string,
    endTime: string,
    currentEmployeeId?: string,
  ) => {
    if (!vehicleId) return { available: true };
    if (!startTime || !endTime || startTime >= endTime) {
      return { available: true, needsTimes: true };
    }

    // 1. Check against backend vehicleBookings for that date
    for (const booking of vehicleBookings) {
      if (booking.vehicleId === vehicleId) {
        const bStart = booking.startTime;
        const bEnd = booking.endTime;
        if (bStart && bEnd && startTime < bEnd && endTime > bStart) {
          return {
            available: false,
            conflictType: 'booking',
            reason: `Booked (${bStart} - ${bEnd})`,
            bookedTime: `${bStart} - ${bEnd}`,
          };
        }
      }
    }

    // 2. Check against other employees in this appointment
    for (const assignment of employeeAssignments) {
      if (
        assignment.employeeId !== currentEmployeeId &&
        assignment.needsVehicle
      ) {
        const assignedVId =
          typeof assignment.vehicle === 'object' && assignment.vehicle !== null
            ? assignment.vehicle._id
            : assignment.vehicle;

        if (assignedVId === vehicleId) {
          const aStart = assignment.startTime;
          const aEnd = assignment.endTime;
          if (aStart && aEnd && startTime < aEnd && endTime > aStart) {
            return {
              available: false,
              conflictType: 'in-form',
              reason: `Assigned to ${assignment.employeeName} (${aStart} - ${aEnd})`,
              bookedTime: `${aStart} - ${aEnd}`,
            };
          }
        }
      }
    }

    return { available: true };
  };

  const handleAssignmentToggleVehicle = (
    employeeId: string,
    enabled: boolean,
  ) => {
    setEmployeeAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.employeeId !== employeeId) return assignment;
        let chosenVehicle = enabled
          ? (assignment.vehicle || selectedVehicleId || '')
          : '';
        if (
          enabled &&
          chosenVehicle &&
          assignment.startTime &&
          assignment.endTime
        ) {
          const vId =
            typeof chosenVehicle === 'object' && chosenVehicle !== null
              ? chosenVehicle._id
              : chosenVehicle;
          const status = checkVehicleAvailability(
            vId,
            assignment.startTime,
            assignment.endTime,
            employeeId,
          );
          if (!status.available) {
            chosenVehicle = '';
          }
        }
        return {
          ...assignment,
          needsVehicle: enabled,
          vehicle: chosenVehicle,
        };
      }),
    );
  };

  const handleAssignmentChange = (
    employeeId: string,
    field: keyof EmployeeAssignment,
    value: any,
  ) => {
    setEmployeeAssignments((prev) =>
      prev.map((assignment) => {
        if (assignment.employeeId !== employeeId) return assignment;

        if (field === 'workType') {
          const isDriver = value === 'Driver';
          return {
            ...assignment,
            workType: value,
            needsVehicle: isDriver ? true : assignment.needsVehicle,
            vehicle:
              isDriver && !assignment.vehicle
                ? selectedVehicleId
                : assignment.vehicle,
          };
        }

        if (field === 'startTime') {
          const effectiveSlots = getEffectiveSlots(employeeId, assignment);
          if (!effectiveSlots.length || !isStartTimeValid(value, effectiveSlots)) {
            return assignment;
          }

          const validSlot = getSlotForStartTime(employeeId, value, assignment);
          const newEnd =
            validSlot &&
              assignment.endTime &&
              assignment.endTime > value &&
              assignment.endTime <= validSlot.end
              ? assignment.endTime
              : '';

          let nextVehicle = assignment.vehicle;
          if (assignment.needsVehicle && nextVehicle && value && newEnd) {
            const vId =
              typeof nextVehicle === 'object' && nextVehicle !== null
                ? nextVehicle._id
                : nextVehicle;
            const status = checkVehicleAvailability(
              vId,
              value,
              newEnd,
              employeeId,
            );
            if (!status.available) {
              notifyError(
                `Selected vehicle is no longer available for updated time (${status.reason})`,
              );
              nextVehicle = '';
            }
          }

          return {
            ...assignment,
            startTime: value,
            endTime: newEnd,
            vehicle: nextVehicle,
          };
        }

        if (field === 'endTime') {
          const validSlot = getSlotForStartTime(
            employeeId,
            assignment.startTime,
            assignment,
          );
          if (
            !assignment.startTime ||
            !validSlot ||
            value <= assignment.startTime ||
            value > validSlot.end
          ) {
            return assignment;
          }

          let nextVehicle = assignment.vehicle;
          if (assignment.needsVehicle && nextVehicle && assignment.startTime && value) {
            const vId =
              typeof nextVehicle === 'object' && nextVehicle !== null
                ? nextVehicle._id
                : nextVehicle;
            const status = checkVehicleAvailability(
              vId,
              assignment.startTime,
              value,
              employeeId,
            );
            if (!status.available) {
              notifyError(
                `Selected vehicle is no longer available for updated time (${status.reason})`,
              );
              nextVehicle = '';
            }
          }

          return {
            ...assignment,
            endTime: value,
            vehicle: nextVehicle,
          };
        }

        if (field === 'vehicle') {
          if (value && assignment.startTime && assignment.endTime) {
            const status = checkVehicleAvailability(
              value,
              assignment.startTime,
              assignment.endTime,
              employeeId,
            );
            if (!status.available) {
              notifyError(`Cannot select vehicle: ${status.reason}`);
              return assignment;
            }
          }
          return {
            ...assignment,
            vehicle: value,
          };
        }

        return {
          ...assignment,
          [field]: value,
        };
      }),
    );
  };

  const handleAllocatedVehicleChange = (newVehicleId: string) => {
    setSelectedVehicleId(newVehicleId);
    if (newVehicleId) {
      setEmployeeAssignments((prev) =>
        prev.map((assignment) => {
          if (assignment.workType === 'Driver' && !assignment.vehicle) {
            return { ...assignment, vehicle: newVehicleId };
          }
          return assignment;
        }),
      );
    }
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

    // Unassigned appointments are permitted as Draft (UM-027)
    if (employeeAssignments.length > 0) {
      for (const assignment of employeeAssignments) {
        if (!assignment.workType) {
          notifyError(`Please select work type for ${assignment.employeeName}`);
          return false;
        }
        if (
          !assignment.startTime ||
          !assignment.endTime ||
          assignment.startTime >= assignment.endTime
        ) {
          notifyError(`Please select valid start and end time for ${assignment.employeeName}`);
          return false;
        }
        if (assignment.workType === 'Driver' && (!assignment.vehicle || !assignment.needsVehicle)) {
          notifyError(`Please assign a vehicle for Driver ${assignment.employeeName}`);
          return false;
        }
        if (assignment.needsVehicle && assignment.vehicle) {
          const vId =
            typeof assignment.vehicle === 'object' && assignment.vehicle !== null
              ? assignment.vehicle._id
              : assignment.vehicle;
          const status = checkVehicleAvailability(
            vId,
            assignment.startTime,
            assignment.endTime,
            assignment.employeeId,
          );
          if (!status.available) {
            notifyError(`Vehicle conflict for ${assignment.employeeName}: ${status.reason}`);
            return false;
          }
        }
      }

      const { startTime, endTime } = getDerivedTimeRange();
      if (!startTime || !endTime || startTime >= endTime) {
        notifyError(
          'Please provide a valid time range across all selected employees',
        );
        return false;
      }
    }

    return true;
  };

  // Convert entered date and wall-clock time directly to ISO string without OS timezone shifting
  function datetimeStringWithTime(date: string, time: string): string {
    if (!time) return '';
    const cleanDate = date
      ? (date.includes('T') ? date.split('T')[0] : date)
      : new Date().toISOString().split('T')[0];
    const cleanTime = time.length === 5 ? `${time}:00` : (time.length === 4 ? `0${time}:00` : time);
    return `${cleanDate}T${cleanTime}.000Z`;
  }

  const createAppointment = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const { startTime, endTime } = getDerivedTimeRange();
      const employeeAssignmentsWithTimes = employeeAssignments.map(
        (assignment) => {
          const chosenVehicle =
            typeof assignment.vehicle === 'object' && assignment.vehicle !== null
              ? assignment.vehicle._id
              : assignment.vehicle;
          const finalVehicle = assignment.needsVehicle ? (chosenVehicle || null) : null;
          return {
            ...assignment,
            vehicle: finalVehicle,
            startTime: datetimeStringWithTime(
              formatSelectedDate(),
              assignment.startTime,
            ),
            endTime: datetimeStringWithTime(
              formatSelectedDate(),
              assignment.endTime,
            ),
          };
        },
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
        vehicle: (employeeAssignmentsWithTimes.find((a: any) => a.vehicle)?.vehicle) || null,
        status: employeeAssignments.length > 0 ? 'Scheduled' : 'Draft',
      };

      const authHeaders = getAuthHeaders();
      let response;
      if (isEditMode && editingAppointmentId) {
        response = await axios.put(
          `${apiPath}/api/appointment/${editingAppointmentId}`,
          payload,
          { headers: authHeaders }
        );
      } else {
        response = await axios.post(`${apiPath}/api/appointment`, payload, {
          headers: authHeaders,
        });
      }

      handleClose(true);

      if (sendCustomerEmail) {
        const targetTemplateId = isEditMode
          ? (settings?.emailTemplates?.rescheduleAppointment || settings?.emailTemplates?.appointment)
          : (settings?.emailTemplates?.appointment || settings?.emailTemplates?.rescheduleAppointment);
        await SendEmail(
          response.data,
          targetTemplateId,
        );
      }
      notify(
        isEditMode
          ? 'Planning appointment updated successfully'
          : 'Planning appointment created successfully',
      );
    } catch (error: any) {
      notifyError(`Error saving appointment: ${error?.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFriendlyDate = (dateVal: any) => {
    if (!dateVal) return '';
    try {
      if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateVal)) {
        const [y, m, d] = dateVal.slice(0, 10).split('-').map(Number);
        return new Intl.DateTimeFormat('en-GB', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(y, m - 1, d, 12, 0, 0));
      }
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  const formatFriendlyTime = (timeVal: any) => {
    if (!timeVal) return '';
    if (typeof timeVal === 'string') {
      if (timeVal.includes('T')) {
        return timeVal.slice(11, 16);
      }
      if (/^\d{1,2}:\d{2}/.test(timeVal)) {
        return timeVal.length === 4 ? `0${timeVal}` : timeVal.slice(0, 5);
      }
    }
    try {
      const d = new Date(timeVal);
      if (!isNaN(d.getTime())) {
        return d.toISOString().slice(11, 16);
      }
    } catch { }
    return String(timeVal);
  };

  const SendEmail = async (data: any, templateId: string) => {
    try {
      const formattedDate = formatFriendlyDate(data?.date || selectedDate);
      const start = formatFriendlyTime(data?.startTime);
      const end = formatFriendlyTime(data?.endTime);

      let timeDisplay = '';
      let timeSentence = '';
      if (start && end && start !== end) {
        timeDisplay = `${start} - ${end}`;
        timeSentence = `from ${start} to ${end}`;
      } else if (start) {
        timeDisplay = start;
        timeSentence = `at ${start}`;
      }

      const appointmentType =
        data?.appointmentType || planningType || 'appointment';
      const dateWithTime = timeSentence
        ? `${formattedDate} ${timeSentence}`
        : formattedDate;

      const subject = `Planning appointment booked for ${appointmentType} on ${dateWithTime} from Universal Movers`;

      const extraData = {
        ...data,
        date: formattedDate,
        rawDate: data?.date,
        formattedDate,
        startTime: start,
        endTime: end,
        time: timeDisplay,
        scheduledTime: timeDisplay,
        appointmentTime: timeDisplay,
        formattedTime: timeDisplay,
      };

      const response = await axios.post(
        `${apiPath}/email/send_email`,
        {
          job: jobId,
          emailTemplateId: templateId,
          extraData,
          subject,
        },
        { headers: getAuthHeaders() }
      );
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
        {
          headers: getAuthHeaders(),
        }
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
        notifyError('Please select at least one employee before proceeding to Step 3.');
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

  const formatJobAddr = formatJobAddress;

  const depotAddress = companyDetail?.companyName
    ? `${companyDetail.companyName} (${[companyDetail.companyAddress, companyDetail.companyState, companyDetail.companyCountry].filter(Boolean).join(', ')})`
    : 'Universal Movers Depot (Gyroscoopweg 56, 1042 AC Amsterdam)';

  const loadAddr = formatJobAddress(jobDetails?.load);
  const unloadAddr = formatJobAddress(jobDetails?.unload);

  const locations = [
    `Depot: ${depotAddress}`,
    ...(loadAddr ? [`Origin (Pickup): ${loadAddr}`] : []),
    ...(unloadAddr ? [`Destination (Delivery): ${unloadAddr}`] : []),
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
        <Modal
          open={modalOpen}
          onClose={(_, reason) => {
            if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
              handleClose(false);
            } else {
              handleClose(false);
            }
          }}
        >
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
                    onClick={() => handleClose(true)}
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
                        ? formatFriendlyDate(appointmentToEdit.date)
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
                        ? formatFriendlyTime(appointmentToEdit.startTime)
                        : 'N/A'}{' '}
                      -{' '}
                      {appointmentToEdit.endTime
                        ? formatFriendlyTime(appointmentToEdit.endTime)
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
                          ? formatFriendlyTime(emp.startTime)
                          : 'N/A';
                        const empEndTime = emp.endTime
                          ? formatFriendlyTime(emp.endTime)
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
                                      if (emp.vehicle && typeof emp.vehicle === 'object') {
                                        return emp.vehicle.name || emp.vehicle.licensePlate || 'Vehicle';
                                      }
                                      const v = vehicleOptions.find((vv) => vv._id === emp.vehicle);
                                      return v ? (v.name || v.licensePlate || 'Vehicle') : 'Vehicle';
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
                    onClick={() => handleClose(true)}
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
                    onClick={() => handleClose(false)}
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
                        ? 'border-blue bg-blue-500 text-white shadow-sm'
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
                                onChange={(event) => {
                                  const newType = event.target.value;
                                  setPlanningType(newType);
                                  // Auto-adjust location role if user hasn't typed a custom override
                                  if (!departureLocation || departureLocation.startsWith('Origin') || departureLocation.startsWith('Destination') || departureLocation.startsWith('Depot')) {
                                    if (newType === 'Unloading' && unloadAddr) {
                                      setDepartureLocation(`Destination (Delivery): ${unloadAddr}`);
                                    } else if ((newType === 'Loading' || newType === 'Move' || newType === 'Packing') && loadAddr) {
                                      setDepartureLocation(`Origin (Pickup): ${loadAddr}`);
                                    } else if (newType === 'Survey' && loadAddr) {
                                      setDepartureLocation(`Origin (Pickup): ${loadAddr}`);
                                    }
                                  }
                                }}
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
                              renderOption={(props, option) => {
                                const info = parseLocationOption(option);
                                return (
                                  <li
                                    {...props}
                                    key={option}
                                    className={`${props.className || ''} !p-3 !border-b !border-slate-100 dark:!border-slate-800/80 last:!border-b-0 hover:!bg-slate-50 dark:hover:!bg-slate-800/70 !cursor-pointer transition-all !items-start`}
                                  >
                                    <div className="flex items-start gap-3 w-full py-0.5">
                                      {/* Colored Role Avatar */}
                                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/80 dark:border-slate-700 shadow-xs ${info.iconBg}`}>
                                        {info.type === 'origin' && <LocationOnIcon style={{ fontSize: 20 }} />}
                                        {info.type === 'destination' && <LocalShippingIcon style={{ fontSize: 20 }} />}
                                        {info.type === 'depot' && <WarehouseIcon style={{ fontSize: 20 }} />}
                                        {info.type === 'custom' && <PlaceIcon style={{ fontSize: 20 }} />}
                                      </div>

                                      {/* Details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                          <span className="text-xs font-black text-slate-800 dark:text-white tracking-tight">
                                            {info.role}
                                          </span>
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider shrink-0 ${info.badgeClass}`}>
                                            {info.badgeText}
                                          </span>
                                        </div>

                                        <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 text-xs">
                                          <span className="font-bold text-slate-400 dark:text-slate-500 shrink-0 text-[11px]">Address:</span>
                                          <span className="font-semibold break-words leading-relaxed text-slate-700 dark:text-slate-200">
                                            {info.address || 'No address details'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                );
                              }}
                              renderInput={(params) => {
                                const selectedInfo = parseLocationOption(departureLocation);
                                return (
                                  <TextField
                                    {...params}
                                    label="Departure location"
                                    placeholder="Select depot, pickup, delivery or type custom..."
                                    fullWidth
                                    InputProps={{
                                      ...params.InputProps,
                                      startAdornment: (
                                        <>
                                          {departureLocation ? (
                                            <InputAdornment position="start">
                                              <span className="flex items-center justify-center w-6 h-6 rounded-lg">
                                                {selectedInfo.type === 'origin' && <LocationOnIcon className="text-emerald-600 text-lg" />}
                                                {selectedInfo.type === 'destination' && <LocalShippingIcon className="text-blue-600 text-lg" />}
                                                {selectedInfo.type === 'depot' && <WarehouseIcon className="text-purple-600 text-lg" />}
                                                {selectedInfo.type === 'custom' && <PlaceIcon className="text-slate-400 text-lg" />}
                                              </span>
                                            </InputAdornment>
                                          ) : null}
                                          {params.InputProps.startAdornment}
                                        </>
                                      ),
                                    }}
                                  />
                                );
                              }}
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

                          {/* Crew Adequacy Check Banner (UM-027) */}
                          {(() => {
                            const reqMovers = Number(jobDetails?.relocation?.relocation_movers) || 0;
                            const currMovers = employeeAssignments.length;
                            if (reqMovers > 0 && currMovers < reqMovers) {
                              return (
                                <Box className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 flex items-start gap-2 text-xs">
                                  <span className="text-base leading-none">⚠️</span>
                                  <div>
                                    <span className="font-bold">Crew Adequacy Warning: </span>
                                    This move requires <strong>{reqMovers} movers</strong> according to the move estimate/quote, but currently only <strong>{currMovers} {currMovers === 1 ? 'employee is' : 'employees are'}</strong> assigned.
                                  </div>
                                </Box>
                              );
                            }
                            return null;
                          })()}

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
                              <Box className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                                <Box className="flex items-center gap-2">
                                  <Typography
                                    variant="subtitle2"
                                    className="text-slate-800 font-semibold"
                                  >
                                    {assignment.employeeName}
                                  </Typography>
                                  <Box className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                                    {assignment.workType === 'Driver'
                                      ? 'Driver'
                                      : 'Support'}
                                  </Box>
                                </Box>

                                {/* Toggle button to assign vehicle for any employee */}
                                <FormControlLabel
                                  control={
                                    <Switch
                                      size="small"
                                      color="primary"
                                      checked={Boolean(assignment.needsVehicle)}
                                      onChange={(e) =>
                                        handleAssignmentToggleVehicle(
                                          assignment.employeeId,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label={
                                    <Typography
                                      variant="caption"
                                      className="font-medium text-slate-700 flex items-center gap-1 select-none"
                                    >
                                      🚚 Assign Vehicle
                                    </Typography>
                                  }
                                  className="m-0"
                                />
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
                                    const effectiveSlots = getEffectiveSlots(
                                      assignment.employeeId,
                                      assignment,
                                    );
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
                                      assignment,
                                    );

                                    const options = timeOptions.filter((time) => {
                                      return (
                                        !!validSlot &&
                                        time > assignment.startTime &&
                                        time <= validSlot.end
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

                              {/* Vehicle selection dropdown if toggle is ON */}
                              {Boolean(assignment.needsVehicle) && (
                                <Box className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-1">
                                  <FormControl fullWidth size="small" disabled={!assignment.startTime || !assignment.endTime}>
                                    <InputLabel>Select Vehicle / Truck</InputLabel>
                                    <Select
                                      disabled={!assignment.startTime || !assignment.endTime}
                                      value={
                                        typeof assignment.vehicle === 'object' && assignment.vehicle !== null
                                          ? assignment.vehicle._id
                                          : (assignment.vehicle || '')
                                      }
                                      label="Select Vehicle / Truck"
                                      onChange={(event) =>
                                        handleAssignmentChange(
                                          assignment.employeeId,
                                          'vehicle',
                                          event.target.value,
                                        )
                                      }
                                    >
                                      <MenuItem value="">
                                        <em>None / Unassigned</em>
                                      </MenuItem>
                                      {vehicleOptions.map((option) => {
                                        const status = checkVehicleAvailability(
                                          option._id,
                                          assignment.startTime,
                                          assignment.endTime,
                                          assignment.employeeId,
                                        );
                                        const currentVal =
                                          typeof assignment.vehicle === 'object' && assignment.vehicle !== null
                                            ? assignment.vehicle._id
                                            : assignment.vehicle;
                                        const isCurrentSelected = currentVal === option._id;
                                        const isDisabled = !status.available && !isCurrentSelected;

                                        return (
                                          <MenuItem
                                            key={option._id}
                                            value={option._id}
                                            disabled={isDisabled}
                                            className={isDisabled ? 'opacity-60 bg-slate-100/70 cursor-not-allowed' : ''}
                                          >
                                            <Box className="flex items-center justify-between w-full gap-3">
                                              <span className="font-medium text-slate-800">
                                                {option.name} {option.licensePlate ? `(${option.licensePlate})` : ''}
                                              </span>
                                              {status.available ? (
                                                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300">
                                                  Available
                                                </span>
                                              ) : (
                                                <span className="text-[11px] font-semibold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full border border-rose-300">
                                                  {status.reason}
                                                </span>
                                              )}
                                            </Box>
                                          </MenuItem>
                                        );
                                      })}
                                    </Select>
                                  </FormControl>
                                  {(!assignment.startTime || !assignment.endTime) && (
                                    <Typography variant="caption" className="text-amber-600 block pl-1 text-[11px] font-medium">
                                      ⚠️ Please select Start time and End time first to enable vehicle selection.
                                    </Typography>
                                  )}
                                </Box>
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
                          {selectedVehicleId && (
                            <Typography variant="body2" className="text-slate-600 font-semibold text-primary">
                              Allocated Vehicle: {(() => {
                                const v = vehicleOptions.find((opt) => opt._id === selectedVehicleId);
                                return v ? `🚛 ${v.name} (${v.licensePlate || 'No plate'})` : selectedVehicleId;
                              })()}
                            </Typography>
                          )}
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

                          {/* Email notification confirmation guard (UM-004) */}
                          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800 dark:text-slate-200">
                              <input
                                type="checkbox"
                                checked={sendCustomerEmail}
                                onChange={(e) => setSendCustomerEmail(e.target.checked)}
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                              />
                              <span>Send appointment confirmation email to customer</span>
                            </label>
                            <p className="text-[11px] text-slate-400 mt-1 pl-6">
                              {sendCustomerEmail
                                ? 'Confirmation will be dispatched and recorded in the job Email tab.'
                                : 'No email will be sent automatically.'}
                            </p>
                          </div>
                        </Box>
                      </Paper>
                    )}
                  </Box>
                </Box>

                <Box className="flex justify-between items-center mt-6">
                  <div className="flex items-center gap-2">
                    {activeStep > 1 && (
                      <Button variant="outlined" onClick={handlePrevStep}>
                        Back
                      </Button>
                    )}
                    {activeStep === 2 && employeeAssignments.length === 0 && (
                      <Button
                        variant="outlined"
                        onClick={createAppointment}
                        style={{ borderColor: '#d97706', color: '#d97706' }}
                      >
                        Save as Draft
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeStep < 3 ? (
                      <Button variant="contained" onClick={handleNextStep}>
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={createAppointment}
                      >
                        {isEditMode ? 'Save changes' : 'Submit appointment'}
                      </Button>
                    )}
                  </div>
                </Box>
              </>)}
          </Box>
        </Modal>
      </LocalizationProvider>
    </div>
  );
};

export default AppointmentForm;
