import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import { Calendar, Views, View, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format } from 'date-fns';
import { UserContext } from '../UserContext';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Avatar,
  Box,
} from '@mui/material';

import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Person as PersonIcon,
  DirectionsCar as DirectionsCarIcon,
  Notes as NotesIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  PeopleAlt as PeopleAltIcon,
  WorkOutline as WorkOutlineIcon,
  CalendarMonth as CalendarMonthIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

import { apiPath } from '../../apiPath';

const localizer = momentLocalizer(moment);

type DayLayoutAlgorithm = 'overlap' | 'no-overlap';

interface Props {
  dayLayoutAlgorithm?: DayLayoutAlgorithm;
}

interface AppointmentEvent {
  start: Date;
  end: Date;
  title: string;
  employees: number;
  appointment: any;
}

// Google Calendar style color map
const typeColors: Record<string, { bg: string; text: string; border: string; lightBg: string }> = {
  unloading: { bg: '#1a73e8', text: '#ffffff', border: '#1557b0', lightBg: '#e8f0fe' },
  packing: { bg: '#28a745ff', text: '#ffffff', border: '#23a553ff', lightBg: '#e8f0fe' },
  move: { bg: '#1a73e8', text: '#ffffff', border: '#1557b0', lightBg: '#e8f0fe' },
  valuation: { bg: '#ffc107ff', text: '#ffffff', border: '#f3c813ff', lightBg: '#e6f4ea' },
  survey: { bg: '#3C50E0', text: '#ffffff', border: '#2b3eb0', lightBg: '#e8f0fe' },
  loading: { bg: '#01c2e6ff', text: '#ffffff', border: '#01a5ccff', lightBg: '#e1f5fe' },
  default: { bg: '#3C50E0', text: '#ffffff', border: '#2b3eb0', lightBg: '#e8f0fe' },
};

const getEventColor = (typeString: string) => {
  const key = (typeString || '').toLowerCase().trim();
  for (const k of Object.keys(typeColors)) {
    if (key.includes(k)) return typeColors[k];
  }
  return typeColors.default;
};

export default function TaskPlanningCalendar({
  dayLayoutAlgorithm = 'no-overlap',
}: Props) {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const { username, id, role, userData, isAdmin }: any = useContext(UserContext) || {};
  const isUserAdmin = isAdmin || role === 'Admin' || userData?.role === 'Admin';

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${apiPath}/api/appointment`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const list = res.data.data || res.data || [];

      // Filter for non-admin staff in case not filtered by backend
      const userList = isUserAdmin
        ? list
        : list.filter((item: any) => {
            const emps = item.assignedEmployees || [];
            return emps.some((emp: any) => {
              const empId = emp?.employeeId?._id || emp?.employeeId || emp?._id;
              const empName = (emp?.employeeName || '').toLowerCase();
              const uName = (username || '').toLowerCase();
              return (
                (id && empId && String(empId) === String(id)) ||
                (uName && empName.includes(uName))
              );
            });
          });

      setEvents(
        userList.map((item: any) => ({
          start: new Date(item.startTime || item.date),
          end: new Date(item.endTime || item.date),
          title: item.appointmentType || 'Appointment',
          employees: item.assignedEmployees?.length || 0,
          appointment: item,
        }))
      );
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [id, username, isUserAdmin]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const titleMatch = ev.title.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = (ev.appointment?.departureLocation || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const empMatch = (ev.appointment?.assignedEmployees || []).some((emp: any) =>
        (emp?.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase())
      );

      const matchesSearch = !searchTerm || titleMatch || locationMatch || empMatch;

      const matchesType =
        typeFilter === 'all' ||
        ev.title.toLowerCase().includes(typeFilter.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [events, searchTerm, typeFilter]);

  // Unique Appointment Types
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    events.forEach((ev) => {
      if (ev.title) types.add(ev.title);
    });
    return Array.from(types);
  }, [events]);

  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    setSelectedAppointment(event.appointment);
  }, []);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    []
  );

  const eventStyleGetter = (event: AppointmentEvent) => {
    const colorScheme = getEventColor(event.title);
    return {
      style: {
        backgroundColor: colorScheme.bg,
        borderColor: colorScheme.border,
        color: '#ffffff',
        borderRadius: '8px',
        padding: '0px',
        border: 'none',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
      },
    };
  };

  // Google-Calendar Custom Day/Week Event View
  const CustomEvent = ({ event }: any) => {
    const colorScheme = getEventColor(event.title);
    return (
      <div
        className="flex flex-col justify-between h-full p-2 text-white overflow-hidden text-xs rounded-lg transition-all select-none"
        style={{
          backgroundColor: colorScheme.bg,
        }}
      >
        <div>
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="font-black text-xs tracking-tight truncate flex items-center gap-1">
              <EventIcon style={{ fontSize: 13 }} />
              {event.title}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/20 whitespace-nowrap">
              {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
            </span>
          </div>

          {event.appointment?.departureLocation && (
            <div className="text-[11px] opacity-90 truncate flex items-center gap-1">
              <LocationOnIcon style={{ fontSize: 12 }} />
              <span className="truncate">{event.appointment.departureLocation}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-white/20 text-[10px]">
          <span className="flex items-center gap-0.5 font-bold">
            <PersonIcon style={{ fontSize: 12 }} />
            <span>{event.employees} Staff</span>
          </span>

          {event?.appointment?.assignedEmployees?.some((e: any) => e?.vehicle?.name) && (
            <span className="flex items-center gap-0.5 opacity-90">
              <DirectionsCarIcon style={{ fontSize: 12 }} />
              <span className="truncate max-w-[80px]">
                {
                  event.appointment.assignedEmployees.find(
                    (e: any) => e?.vehicle?.name
                  )?.vehicle?.name
                }
              </span>
            </span>
          )}
        </div>
      </div>
    );
  };

  // Google-Calendar Custom Month Event View
  const MonthEvent = ({ event }: any) => {
    const colorScheme = getEventColor(event.title);
    return (
      <div
        className="flex items-center justify-between px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-2xs truncate my-0.5"
        style={{ backgroundColor: colorScheme.bg }}
      >
        <div className="flex items-center gap-1 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
          <span className="font-mono text-[10px] opacity-90">
            {format(event.start, 'HH:mm')}
          </span>
          <span className="truncate">{event.title}</span>
        </div>
        {event.employees > 0 && (
          <span className="text-[9px] opacity-80 shrink-0 ml-1">
            ({event.employees})
          </span>
        )}
      </div>
    );
  };

  // Google-Calendar Custom Toolbar Header Component
  const CustomToolbar = (toolbar: any) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };
    const goToToday = () => {
      toolbar.onNavigate('TODAY');
    };

    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 bg-white dark:bg-boxdark p-4 rounded-2xl border border-slate-200/80 dark:border-strokedark shadow-xs">
        {/* Left: Navigation, Today, and Date Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={goToToday}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            Today
          </button>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <IconButton
              size="small"
              onClick={goToBack}
              className="text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-boxdark rounded-lg"
              title="Previous"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={goToNext}
              className="text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-boxdark rounded-lg"
              title="Next"
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            <CalendarMonthIcon className="text-primary hidden sm:block" fontSize="small" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {toolbar.label}
            </h2>
          </div>
        </div>

        {/* Right: Search Filter & View Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 sm:w-52 pl-8 pr-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-strokedark bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <SearchIcon
              fontSize="small"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              style={{ fontSize: 15 }}
            />
          </div>

          {/* View Toggle Segment (Google Calendar Style) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {(
              [
                { id: Views.MONTH, label: 'Month' },
                { id: Views.DAY, label: 'Day' },
                { id: Views.AGENDA, label: 'Agenda' },
              ] as { id: View; label: string }[]
            ).map((v) => {
              const isSelected = toolbar.view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    toolbar.onView(v.id);
                    setCurrentView(v.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-boxdark-2 text-slate-800 dark:text-slate-100 p-4 md:p-6 font-sans flex flex-col">
      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-1">
        <button
          onClick={() => setTypeFilter('all')}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${typeFilter === 'all'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
            : 'bg-white dark:bg-boxdark text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-strokedark hover:bg-slate-100'
            }`}
        >
          All ({events.length})
        </button>

        {availableTypes.map((type) => {
          const colorScheme = getEventColor(type);
          const isSelected = typeFilter === type;
          const count = events.filter((e) => e.title === type).length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${isSelected
                ? 'shadow-xs text-white'
                : 'bg-white dark:bg-boxdark text-slate-700 dark:text-slate-300 border-slate-200 dark:border-strokedark hover:bg-slate-50'
                }`}
              style={{
                backgroundColor: isSelected ? colorScheme.bg : undefined,
                borderColor: isSelected ? colorScheme.border : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colorScheme.bg }}
              />
              <span>{type}</span>
              <span className="opacity-75 text-[10px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Main Calendar Card with Google Calendar Styling */}
      <div className="flex-grow bg-white dark:bg-boxdark rounded-2xl border border-slate-200/80 dark:border-strokedark p-4 md:p-6 shadow-xs flex flex-col">
        <div className="flex-grow google-calendar-wrapper h-[76vh]">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            defaultView={Views.MONTH}
            view={currentView}
            onView={(view: View) => setCurrentView(view)}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            defaultDate={defaultDate}
            scrollToTime={scrollToTime}
            dayLayoutAlgorithm={dayLayoutAlgorithm}
            selectable
            popup
            views={{ month: true, day: true, agenda: true }}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
              day: {
                event: CustomEvent,
              },
              month: {
                event: MonthEvent,
              },
            }}
          />
        </div>
      </div>

      {/* Google Calendar-Style Event Details Dialog */}
      <Dialog
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1.25rem',
            overflow: 'hidden',
          },
        }}
      >
        {selectedAppointment && (() => {
          const selectedJob = selectedAppointment?.jobId;
          const selectedCustomer = selectedJob?.customer || selectedAppointment?.customer;
          const customerName = selectedCustomer
            ? typeof selectedCustomer === 'string'
              ? selectedCustomer
              : `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() ||
                selectedCustomer.name ||
                ''
            : '';
          const customerMobile = selectedCustomer?.mobile || selectedCustomer?.contact || '';
          const customerEmail = selectedCustomer?.email || '';

          const formatAddress = (addr: any) => {
            if (!addr) return '';
            if (typeof addr === 'string') return addr;
            const parts = [
              [addr.street, addr.houseNumber, addr.addition].filter(Boolean).join(' '),
              addr.postcode,
              addr.city,
              addr.country,
            ].filter(Boolean);
            return parts.join(', ');
          };

          const loadAddress = formatAddress(selectedJob?.load);
          const unloadAddress = formatAddress(selectedJob?.unload);

          return (
          <div className="bg-white dark:bg-boxdark text-slate-800 dark:text-slate-100">
            {/* Header with Type Color Banner */}
            <div
              className="p-5 text-white flex items-center justify-between relative"
              style={{
                backgroundColor: getEventColor(
                  selectedAppointment.appointmentType
                ).bg,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                  <EventIcon />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/80 block">
                    Appointment Details
                  </span>
                  <h3 className="text-lg font-black text-white">
                    {selectedAppointment.appointmentType || 'Appointment'}
                  </h3>
                </div>
              </div>

              <IconButton
                onClick={() => setSelectedAppointment(null)}
                size="small"
                className="text-white hover:bg-white/20"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>

            {/* Dialog Body */}
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Quick Info Grid: Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CalendarMonthIcon style={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Date
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {moment(selectedAppointment.date || selectedAppointment.startTime).format(
                        'DD MMMM YYYY'
                      )}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <AccessTimeIcon style={{ fontSize: 16 }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Time Window
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white font-mono">
                      {moment(selectedAppointment.startTime).format('hh:mm A')} -{' '}
                      {moment(selectedAppointment.endTime).format('hh:mm A')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Job Info Card */}
              {(customerName || selectedJob?.index) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mt-0.5 shrink-0">
                    <PersonIcon style={{ fontSize: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Customer Details
                      </span>
                      {selectedJob?.index && (
                        <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                          #{selectedJob.index}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-800 dark:text-white mt-0.5 flex-wrap">
                      {customerName && (
                        <span className="capitalize">{customerName}</span>
                      )}
                      {customerMobile && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                          <PhoneIcon style={{ fontSize: 13 }} className="text-slate-400" />
                          <span>{customerMobile}</span>
                        </span>
                      )}
                      {customerEmail && (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                          <EmailIcon style={{ fontSize: 13 }} className="text-slate-400" />
                          <span>{customerEmail}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Address Card */}
              {(loadAddress || unloadAddress) && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mt-0.5 shrink-0">
                    <HomeIcon style={{ fontSize: 18 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Customer Moving Address
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {loadAddress || unloadAddress}
                      {selectedJob?.load?.floor && ` (Floor: ${selectedJob.load.floor})`}
                      {selectedJob?.load?.hasElevator ? ' • Elevator' : ''}
                    </span>
                    {loadAddress && unloadAddress && (
                      <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200/60 dark:border-strokedark">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Delivery Address
                        </span>
                        {unloadAddress}
                        {selectedJob?.unload?.floor && ` (Floor: ${selectedJob.unload.floor})`}
                        {selectedJob?.unload?.hasElevator ? ' • Elevator' : ''}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Departure Location Card */}
              {selectedAppointment.departureLocation && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center mt-0.5 shrink-0">
                    <BusinessIcon style={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Departure Location
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">
                      {selectedAppointment.departureLocation}
                    </span>
                  </div>
                </div>
              )}

              {/* Assigned Staff & Vehicles Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-strokedark">
                  <PeopleAltIcon fontSize="small" className="text-primary" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Assigned Staff ({selectedAppointment.assignedEmployees?.length || 0})
                  </h4>
                </div>

                {selectedAppointment.assignedEmployees?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No staff assigned to this appointment.</p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedAppointment.assignedEmployees?.map((emp: any, idx: number) => {
                      const isDriver = (emp.workType || '').trim().toLowerCase() === 'driver';
                      const vehicle = emp?.vehicle;
                      const vehiclePlate = vehicle?.licensePlate || (typeof vehicle === 'string' ? vehicle : '');
                      const vehicleName = vehicle?.name || '';

                      return (
                        <div
                          key={emp._id || idx}
                          className={`p-3 rounded-xl border transition-colors ${
                            isDriver
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/50'
                              : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark'
                          } flex items-center justify-between gap-3 text-xs`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                fontSize: '11px',
                                fontWeight: 'bold',
                                bgcolor: isDriver ? '#d97706' : '#1a73e8',
                              }}
                            >
                              {emp.employeeName?.[0] || 'E'}
                            </Avatar>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white block">
                                {emp.employeeName}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                <span
                                  className={`text-[11px] font-extrabold capitalize ${
                                    isDriver
                                      ? 'text-amber-700 dark:text-amber-400'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {emp.workType || 'Crew Member'}
                                </span>

                                {/* If Driver: highlight vehicle number prominently */}
                                {isDriver && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
                                    <DirectionsCarIcon style={{ fontSize: 13 }} />
                                    <span>
                                      Vehicle No: {vehiclePlate || vehicleName || 'Not Assigned'}
                                      {vehicleName && vehiclePlate ? ` (${vehicleName})` : ''}
                                    </span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
                              {moment(emp.startTime).format('hh:mm A')} →{' '}
                              {moment(emp.endTime).format('hh:mm A')}
                            </span>
                            {!isDriver && (vehiclePlate || vehicleName) && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-primary font-bold">
                                <DirectionsCarIcon style={{ fontSize: 12 }} />
                                <span>
                                  {vehiclePlate || vehicleName}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes & Job Details */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-strokedark space-y-1">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <NotesIcon style={{ fontSize: 15 }} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Notes & Remarks
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {selectedAppointment.notes || 'No specific notes recorded for this appointment.'}
                </p>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
          );
        })()}
      </Dialog>

      {/* Embedded Google Calendar Custom CSS Overrides */}
      <style>{`
        .google-calendar-wrapper .rbc-calendar {
          font-family: inherit;
          border: none;
        }
        .google-calendar-wrapper .rbc-header {
          padding: 8px 4px;
          font-weight: 800;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #5f6368;
          border-bottom: 1px solid #dadce0 !important;
        }
        .google-calendar-wrapper .rbc-month-view,
        .google-calendar-wrapper .rbc-time-view {
          border: 1px solid #dadce0;
          border-radius: 1rem;
          overflow: hidden;
          background-color: #ffffff;
        }
        .google-calendar-wrapper .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #f1f3f4;
        }
        .google-calendar-wrapper .rbc-month-row + .rbc-month-row {
          border-top: 1px solid #f1f3f4;
        }
        .google-calendar-wrapper .rbc-today {
          background-color: #f8fafd !important;
        }
        .google-calendar-wrapper .rbc-now .rbc-button-link {
          background-color: #1a73e8;
          color: #ffffff !important;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .google-calendar-wrapper .rbc-time-header {
          border-bottom: 1px solid #dadce0;
        }
        .google-calendar-wrapper .rbc-time-content {
          border-top: none;
        }
        .google-calendar-wrapper .rbc-time-slot {
          font-size: 11px;
          color: #70757a;
          font-weight: 500;
        }
        .google-calendar-wrapper .rbc-timeslot-group {
          border-bottom: 1px solid #f1f3f4;
          min-height: 52px;
        }
        .google-calendar-wrapper .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f8f9fa;
        }
        .google-calendar-wrapper .rbc-event {
          padding: 0 !important;
          border: none !important;
          border-radius: 8px !important;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(60, 64, 67, 0.15), 0 1px 2px rgba(60, 64, 67, 0.1);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .google-calendar-wrapper .rbc-event:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(60, 64, 67, 0.2);
          z-index: 10;
        }
        .google-calendar-wrapper .rbc-current-time-indicator {
          background-color: #ea4335;
          height: 2px;
        }
        .google-calendar-wrapper .rbc-current-time-indicator::before {
          content: '';
          position: absolute;
          left: -5px;
          top: -4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #ea4335;
        }
      `}</style>
    </div>
  );
}

TaskPlanningCalendar.propTypes = {
  dayLayoutAlgorithm: PropTypes.oneOf(['overlap', 'no-overlap']),
};
