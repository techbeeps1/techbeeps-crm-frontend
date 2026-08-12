import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import moment from 'moment';
import { Calendar, Views, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format } from 'date-fns';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Grid,
  Card,
  CardContent,

  Avatar,
  Stack,
  Divider,
  Box,

} from '@mui/material';

import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import NotesIcon from '@mui/icons-material/Notes';

import { apiPath } from '../../apiPath';
import {  CloseSharp } from '@mui/icons-material';

const localizer = momentLocalizer(moment);

type DayLayoutAlgorithm = 'overlap' | 'no-overlap';

interface Props {
  dayLayoutAlgorithm?: DayLayoutAlgorithm;
}

interface AppointmentEvent {
  start: Date;
  end: Date;
  title: string;
  appointment: any;
}

export default function TaskPlanningCalendar({
  dayLayoutAlgorithm = 'no-overlap',
}: Props) {
  const [events, setEvents] = useState<AppointmentEvent[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${apiPath}/api/appointment?jobId=6a6c61ccf8b1372865280281`,
      );
      const list = res.data.data || res.data;

      setEvents(
        list.map((item: any) => ({
          start: new Date(item.startTime),
          end: new Date(item.endTime),
          title: `${item.appointmentType}`,
          employees: item.assignedEmployees.length,
          appointment: item,
        })),
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleSelectEvent = useCallback((event: AppointmentEvent) => {
    setSelectedAppointment(event.appointment);
  }, []);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    [],
  );
  const colors = [
    '#2b72e3',
    '#10B981',
    '#F59E0B',
    '#e74c4c',
    '#8B5CF6',
    '#fb69b2',
    '#06B6D4',
  ];

  const getColor = (text: string) => {
    let hash = 0;

    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  const eventStyleGetter = (event: any) => ({
    style: {
      backgroundColor: getColor(event.title),
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      minHeight: '35px',
     
    },
  });
  const CustomEvent = ({ event }: any) => (
    <div className="flex flex-col gap-1 bg-[#fafafa2a] text-white rounded-lg p-2 h-full overflow-y-auto [&::-webkit-scrollbar]:w-1
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-200
  dark:[&::-webkit-scrollbar-track]:bg-neutral-300
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-200">
      <strong ><EventIcon fontSize="small" /> {event.title}</strong>
      <span className="my-2">
        <AccessTimeIcon fontSize="small" /> {format(event.start, 'hh:mm a')} - {format(event.end, 'hh:mm a')}
      </span>
 
    {event?.appointment?.assignedEmployees?.map((emp:any)=> emp?.vehicle?.name ? <span className="my-2">   <DirectionsCarIcon fontSize="small" /> {emp?.vehicle?.name}  {emp?.vehicle?.licensePlate}</span>:"")}
      
      <span > <PersonIcon /> {event.employees} Employees
      </span>
    </div>
  );

  const MonthEvent = ({ event }: any) => (
    <div className="flex flex-col gap-1 bg-[#fafafa2a] text-white rounded-lg p-[2px] h-full ps-4">
      <strong>{event.title}</strong>
    </div>
  );

  return (
    <>
      <Box sx={{ p: 2, bgcolor: '#f5f7fb', height: 'calc(100vh - 90px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          defaultView={Views.DAY}
          defaultDate={defaultDate}
          scrollToTime={scrollToTime}
          dayLayoutAlgorithm={dayLayoutAlgorithm}
          selectable
          popup
        
          style={{
            height: '100%',
            background: '#fff',
            borderRadius: 12,
            padding: 10,
          }}
          views={{ day: true, month: true }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          components={{
            day: {
              event: CustomEvent,
            },
            month: {
              event: MonthEvent,
            },
          }}
        />
      </Box>

      <Dialog
        open={Boolean(selectedAppointment)}
        onClose={() => setSelectedAppointment(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        {selectedAppointment && (
          <>
            <DialogTitle sx={{ bgcolor: '#2563eb', color: '#fff' }}>
              <Stack direction="row" justifyContent="space-between">
                <Box sx={{ py: 1 }}>
                  <Typography variant="h5" fontWeight={500}>
                    {'Appointment'}
                  </Typography>
                </Box>

                <CloseSharp
                  onClick={() => setSelectedAppointment(null)}
                  className="mt-2 cursor-pointer transition-all duration-300 hover:rotate-90 hover:scale-110"
                />
              </Stack>
            </DialogTitle>

            <DialogContent sx={{ bgcolor: '#f8fafc', py: 3 }}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <EventIcon color="primary" />

                      <Typography fontWeight={400}>
                        {moment(selectedAppointment.date).format('DD MMM YYYY')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <AccessTimeIcon color="primary" />

                      <Typography fontWeight={400}>
                        {moment(selectedAppointment.startTime).format(
                          'hh:mm A',
                        )}{' '}
                        -{' '}
                        {moment(selectedAppointment.endTime).format('hh:mm A')}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={5}>
                  <Card>
                    <CardContent
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <LocationOnIcon color="primary" />

                      <Typography fontWeight={400}>
                        {selectedAppointment.departureLocation}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Typography variant="h6" mt={4} mb={2}>
                Assigned Employees
              </Typography>

              {selectedAppointment.assignedEmployees?.map((emp: any) => (
                <Card key={emp._id} sx={{ mb: 2, borderRadius: 3 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Typography fontWeight={700}>
                          {emp.employeeName}
                        </Typography>
                        <Typography color="text.secondary">
                          {emp.workType}
                        </Typography>
                      </Box>
                      <Box flex={1}>
                        <Typography>
                          {' '}
                          <AccessTimeIcon color="primary" />{' '}
                          {moment(emp.startTime).format('hh:mm A')} →{' '}
                          {moment(emp.endTime).format('hh:mm A')}
                        </Typography>
                        { emp?.vehicle?.name && (
                        <Stack direction="row" spacing={1} mt={1}>
                          <DirectionsCarIcon fontSize="small" />
                          <Typography variant="body2">{emp?.vehicle?.name} {emp?.vehicle?.licensePlate}</Typography>
                        </Stack>
                        )}
                      </Box>
                      <Divider sx={{ my: 1 }} />
                    </Stack>
                  </CardContent>
                </Card>
              ))}

              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6">Job Details</Typography>
                  <Typography>
                    <b>Type:</b> {selectedAppointment.appointmentType}
                  </Typography>
                 
                  <Stack direction="row" spacing={1} mt={2}>
                    <NotesIcon />
                    <Typography>
                      {selectedAppointment.notes || 'No notes available.'}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}

TaskPlanningCalendar.propTypes = {
  dayLayoutAlgorithm: PropTypes.oneOf(['overlap', 'no-overlap']),
};
