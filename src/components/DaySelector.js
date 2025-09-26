import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DaySelector = ({ selectedDays, onDayToggle, weekStartDay = 1 }) => {
  const { t } = useLanguage();
  const daysOfWeek = [
    { value: 0, label: 'Sunday', short: 'Sun' },
    { value: 1, label: 'Monday', short: 'Mon' },
    { value: 2, label: 'Tuesday', short: 'Tue' },
    { value: 3, label: 'Wednesday', short: 'Wed' },
    { value: 4, label: 'Thursday', short: 'Thu' },
    { value: 5, label: 'Friday', short: 'Fri' },
    { value: 6, label: 'Saturday', short: 'Sat' }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t('selectLessonDays')}:
      </label>
      <div className="grid grid-cols-4 gap-2">
        {daysOfWeek.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => onDayToggle(day.value)}
            className={`px-3 py-2 text-sm rounded-lg border transition-all ${
              selectedDays.includes(day.value)
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{day.short}</div>
            <div className="text-xs opacity-75">{day.label}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        {selectedDays.length} {t('daysSelected')}
      </p>
    </div>
  );
};

export default DaySelector;