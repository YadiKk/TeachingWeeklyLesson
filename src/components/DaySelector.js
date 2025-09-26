import React from 'react';

const DaySelector = ({ selectedDays, onDayToggle, weekStartDay = 1 }) => {
  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  // Always show days in standard order (Sunday to Saturday)
  const standardDays = daysOfWeek;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Lesson Days:
      </label>
      <div className="grid grid-cols-4 gap-2">
        {standardDays.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => onDayToggle(day.value)}
            className={`px-3 py-2 text-sm rounded-lg border transition-all ${
              selectedDays.includes(day.value)
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{day.short}</div>
            <div className="text-xs opacity-75">{day.label}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {selectedDays.length} days selected
      </p>
    </div>
  );
};

export default DaySelector;
