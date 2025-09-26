import React, { useState } from 'react';

const TimeSelector = ({ value, onChange, lessonId }) => {
  const [time, setTime] = useState(value || '09:00');

  const handleTimeChange = (newTime) => {
    setTime(newTime);
    onChange(lessonId, newTime);
  };

  // Generate time options (every 15 minutes from 08:00 to 20:00)
  const timeOptions = [];
  for (let hour = 8; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(timeString);
    }
  }

  return (
    <div className="flex flex-col items-end space-y-1">
      <select
        value={time}
        onChange={(e) => handleTimeChange(e.target.value)}
        className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 w-20 bg-white"
      >
        {timeOptions.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-xs text-gray-400">
        {time}
      </span>
    </div>
  );
};

export default TimeSelector;
