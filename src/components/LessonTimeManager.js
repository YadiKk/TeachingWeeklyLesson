// Component for managing per-day lesson times for daily payment students

import React, { useState, useEffect } from 'react';
import { setLessonTimeForDay, getLessonTimeForDay } from '../utils/dailyPaymentAdvanced';
import { useTranslation } from 'react-i18next';

const LessonTimeManager = ({ student, onUpdateStudent }) => {
  const { t } = useTranslation();
  const [lessonTimes, setLessonTimes] = useState({});
  
  const dayNames = [
    { value: 0, label: t('days.sunday'), short: 'Sun' },
    { value: 1, label: t('days.monday'), short: 'Mon' },
    { value: 2, label: t('days.tuesday'), short: 'Tue' },
    { value: 3, label: t('days.wednesday'), short: 'Wed' },
    { value: 4, label: t('days.thursday'), short: 'Thu' },
    { value: 5, label: t('days.friday'), short: 'Fri' },
    { value: 6, label: t('days.saturday'), short: 'Sat' }
  ];

  // Load lesson times from localStorage when component mounts
  useEffect(() => {
    const times = {};
    dayNames.forEach(day => {
      times[day.value] = getLessonTimeForDay(student.id, day.value);
    });
    setLessonTimes(times);
  }, [student.id]);

  const handleTimeChange = (weekday, time) => {
    // Update local state
    setLessonTimes(prev => ({
      ...prev,
      [weekday]: time
    }));
    
    // Save to localStorage
    setLessonTimeForDay(student.id, weekday, time);
    
    // Update student object for immediate UI updates
    onUpdateStudent(student.id, { 
      lessonTimes: { ...lessonTimes, [weekday]: time }
    });
  };

  // Only show for daily payment students
  if (student.paymentType !== 'daily') {
    return null;
  }

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
      <h6 className="text-sm font-semibold text-gray-800 mb-3">
        {t('payments.lessonTimesPerDay')}
      </h6>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
        {dayNames.map(day => (
          <div key={day.value} className="text-center">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {day.short}
            </label>
            <input
              type="time"
              value={lessonTimes[day.value] || '09:00'}
              onChange={(e) => handleTimeChange(day.value, e.target.value)}
              className="input text-xs w-full"
              step="300"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LessonTimeManager;
