import React from 'react';
import { useTranslation } from 'react-i18next';

const DaySelector = ({ selectedDays, onDayToggle, weekStartDay = 1 }) => {
  const { t } = useTranslation();
  const daysOfWeek = [
    { value: 0, label: t('days.sunday'), short: t('days.sunday').substring(0, 3) },
    { value: 1, label: t('days.monday'), short: t('days.monday').substring(0, 3) },
    { value: 2, label: t('days.tuesday'), short: t('days.tuesday').substring(0, 3) },
    { value: 3, label: t('days.wednesday'), short: t('days.wednesday').substring(0, 3) },
    { value: 4, label: t('days.thursday'), short: t('days.thursday').substring(0, 3) },
    { value: 5, label: t('days.friday'), short: t('days.friday').substring(0, 3) },
    { value: 6, label: t('days.saturday'), short: t('days.saturday').substring(0, 3) }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t('week.selectLessonDays')}:
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
        {selectedDays.length} {t('week.daysSelected')}
      </p>
    </div>
  );
};

export default DaySelector;