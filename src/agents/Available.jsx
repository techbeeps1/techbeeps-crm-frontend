import React, { useState } from 'react';
import { Slider } from '@mui/material';
import { FiClock, FiCalendar, FiPlus, FiCheckCircle } from 'react-icons/fi';

const Availability = () => {
  const dayKeys = ['and', 'of', 'where', 'do', 'vr'];
  const dayDisplayNames = {
    and: 'Monday (Ma)',
    of: 'Tuesday (Di)',
    where: 'Wednesday (Wo)',
    do: 'Thursday (Do)',
    vr: 'Friday (Vr)',
  };

  const [availability, setAvailability] = useState({
    and: Array(10).fill(true),
    of: Array(10).fill(true),
    where: Array(10).fill(true),
    do: Array(10).fill(true),
    vr: Array(10).fill(true),
  });

  const handleSliderChange = (day, newValue) => {
    setAvailability((prev) => {
      const updated = { ...prev };
      updated[day] = Array(10).fill(false);
      newValue.forEach((index) => {
        updated[day][index] = true;
      });
      return updated;
    });
  };

  const times = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00',
  ];

  return (
    <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-2">
          <FiClock className="text-primary text-sm" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Weekly Hours Availability
          </h4>
        </div>
        <span className="text-xs text-slate-400">Available: 08:00 — 19:00</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-2">
        {dayKeys.map((day) => (
          <div
            key={day}
            className="flex flex-col items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800 shadow-xs"
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-4 text-center">
              {dayDisplayNames[day] || day}
            </span>
            <Slider
              value={availability[day]
                .map((val, index) => (val ? index : null))
                .filter((val) => val !== null)}
              onChange={(event, newValue) => handleSliderChange(day, newValue)}
              valueLabelDisplay="auto"
              max={10}
              step={1}
              marks={times.map((time, index) => ({ value: index, label: time }))}
              orientation="vertical"
              sx={{
                height: 220,
                color: '#3c50e0',
                '& .MuiSlider-thumb': {
                  width: 14,
                  height: 14,
                },
                '& .MuiSlider-markLabel': {
                  fontSize: '9px',
                  color: '#94a3b8',
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkScheduleTable = () => {
  const rows = [
    {
      week: 'Even Week',
      and: '08:00',
      of: '08:00',
      where: '08:00',
      do: '08:00',
      vr: '09:00',
      for: '00:00',
      likeThis: '00:00',
    },
    {
      week: 'Odd Week',
      and: '08:00',
      of: '08:00',
      where: '08:00',
      do: '08:00',
      vr: '08:00',
      for: '00:00',
      likeThis: '00:00',
    },
  ];

  return (
    <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 p-5 space-y-3">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200/50 dark:border-slate-700/50">
        <FiCalendar className="text-primary text-sm" />
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Fixed Work Schedule
        </h4>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-white dark:bg-slate-900 border-b border-slate-200/70 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2.5 px-3">Week</th>
              <th className="py-2.5 px-3">Mon</th>
              <th className="py-2.5 px-3">Tue</th>
              <th className="py-2.5 px-3">Wed</th>
              <th className="py-2.5 px-3">Thu</th>
              <th className="py-2.5 px-3">Fri</th>
              <th className="py-2.5 px-3">Sat</th>
              <th className="py-2.5 px-3">Sun</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800 bg-white/60 dark:bg-slate-900/60">
            {rows.map((row) => (
              <tr key={row.week} className="hover:bg-primary/5 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200">
                  {row.week}
                </td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">{row.and}</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">{row.of}</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">{row.where}</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">{row.do}</td>
                <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-semibold">{row.vr}</td>
                <td className="py-2.5 px-3 text-slate-400">{row.for}</td>
                <td className="py-2.5 px-3 text-slate-400">{row.likeThis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SporadicAvailability = () => (
  <div className="flex justify-end pt-2">
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 active:scale-[0.98] transition-all cursor-pointer"
    >
      <FiPlus className="text-sm" />
      <span>Add Sporadic Availability</span>
    </button>
  </div>
);

const AvailabilityComponent = () => {
  return (
    <div className="space-y-4 font-sans">
      <Availability />
      <WorkScheduleTable />
      <SporadicAvailability />
    </div>
  );
};

export default AvailabilityComponent;
