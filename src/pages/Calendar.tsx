import { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Calendar, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { momentLocalizer } from 'react-big-calendar';
import axios from 'axios';
import { apiPath } from '../../apiPath';

const localizer = momentLocalizer(moment);

type DayLayoutAlgorithm = 'overlap' | 'no-overlap';

interface TaskPlanningCalendarProps {
  dayLayoutAlgorithm?: DayLayoutAlgorithm;
}

interface CalendarTask {
  start: Date;
  end: Date;
  title: string;
  description?: string;
}

export default function TaskPlanningCalendar({
  dayLayoutAlgorithm = 'no-overlap',
}: TaskPlanningCalendarProps) {
  const [tasks, setTasks] = useState<CalendarTask[]>([]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      const title = window.prompt('Enter Task Title');
      const description = window.prompt('Enter Task Description');

      if (title) {
        setTasks((prev) => [
          ...prev,
          {
            start,
            end,
            title,
            description: description || '',
          },
        ]);
      }
    },
    []
  );

  const handleAlltask = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/task`);

      const calendarEvents: CalendarTask[] =
        response.data?.map((job: any) => {
          const start = new Date(job.scheduledFor);
          const end = new Date(start.getTime() + 30 * 60 * 1000);

          return {
            start,
            end,
            title: job.summary || 'Untitled Task',
            description: job.description || '',
          };
        }) || [];

      setTasks(calendarEvents);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  useEffect(() => {
    handleAlltask();
  }, []);

  const handleSelectEvent = useCallback((event: CalendarTask) => {
    window.alert(
      `Task: ${event.title}\nDescription: ${event.description}`
    );
  }, []);

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 8),
    }),
    []
  );

  return (
    <div
      className="bg-white p-3 font-medium"
      style={{ height: 'calc(100vh - 90px)' }}
    >
      <div className="text-black h-full">
        <Calendar
          dayLayoutAlgorithm={dayLayoutAlgorithm}
          defaultDate={defaultDate}
          defaultView={Views.DAY}
          events={tasks}
          localizer={localizer}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          views={{
            day: true,
            week: false,
            month: true,
          }}
        />
      </div>
    </div>
  );
}

TaskPlanningCalendar.propTypes = {
  dayLayoutAlgorithm: PropTypes.oneOf([
    'overlap',
    'no-overlap',
  ]),
};