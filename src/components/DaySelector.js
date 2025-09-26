import React from 'react';

const DaySelector = ({ selectedDays, onDayToggle, weekStartDay = 1 }) => {
  const daysOfWeek = [
    { value: 0, label: 'Pazar', short: 'Paz' },
    { value: 1, label: 'Pazartesi', short: 'Pzt' },
    { value: 2, label: 'Salı', short: 'Sal' },
    { value: 3, label: 'Çarşamba', short: 'Çar' },
    { value: 4, label: 'Perşembe', short: 'Per' },
    { value: 5, label: 'Cuma', short: 'Cum' },
    { value: 6, label: 'Cumartesi', short: 'Cmt' }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Ders Günleri Seçin:
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
        {selectedDays.length} gün seçildi
      </p>
    </div>
  );
};

export default DaySelector;