import React from 'react';
import WeeklyView from './WeeklyView';
import DaySelector from './DaySelector';
import { getWeeklyView } from '../utils/dateUtils';

const StudentCard = ({ 
  student, 
  onUpdateStudent, 
  onDeleteStudent, 
  onToggleLesson, 
  onUpdateLessonTime, 
  onToggleLessonCancellation, 
  onLessonStatusChange, 
  weekStartDay, 
  currentWeekStart 
}) => {
  const handleNameChange = (e) => {
    onUpdateStudent(student.id, { name: e.target.value });
  };

  const handleMonthlyFeeChange = (e) => {
    const fee = parseInt(e.target.value) || 0;
    onUpdateStudent(student.id, { monthlyFee: fee });
  };

  const handleDayToggle = (dayValue) => {
    const currentDays = student.selectedDays || [];
    let newDays;
    
    if (currentDays.includes(dayValue)) {
      newDays = currentDays.filter(day => day !== dayValue);
    } else {
      newDays = [...currentDays, dayValue].sort();
    }
    
    onUpdateStudent(student.id, { 
      selectedDays: newDays,
      weeklyLessonCount: newDays.length
    });
  };

  return (
    <div className="card">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={student.name}
            onChange={handleNameChange}
            className="input text-lg font-semibold mb-2"
            placeholder="Öğrenci Adı"
          />
          <div className="text-sm text-gray-600">
            Haftalık ders sayısı: {student.weeklyLessonCount || 0}
          </div>
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Aylık Ücret (TL):
            </label>
            <input
              type="number"
              value={student.monthlyFee || 100}
              onChange={handleMonthlyFeeChange}
              className="input text-sm w-24"
              min="0"
              step="10"
            />
          </div>
        </div>
        <button
          onClick={() => onDeleteStudent(student.id)}
          className="btn btn-danger text-sm"
        >
          Sil
        </button>
      </div>
      
      <div className="mb-4">
        <DaySelector
          selectedDays={student.selectedDays || []}
          onDayToggle={handleDayToggle}
          weekStartDay={weekStartDay}
        />
      </div>
      
      <WeeklyView 
        weeklyView={getWeeklyView(student, currentWeekStart, weekStartDay)} 
        onToggleLesson={(lessonId) => onToggleLesson(student.id, lessonId)}
        onUpdateLessonTime={(lessonId, time) => onUpdateLessonTime(student.id, lessonId, time)}
        onToggleLessonCancellation={(lessonId) => onToggleLessonCancellation(student.id, lessonId)}
        onLessonStatusChange={(lessonId, status) => onLessonStatusChange(student.id, lessonId, status)}
      />
    </div>
  );
};

export default StudentCard;