import React from 'react';
import LessonList from './LessonList';
import DaySelector from './DaySelector';
import LessonStatusSelector from './LessonStatusSelector';
import { getLessonsForWeek } from '../utils/dateUtils';

const StudentCard = ({ student, onUpdateStudent, onDeleteStudent, onToggleLesson, onUpdateLessonTime, onToggleLessonCancellation, onLessonStatusChange, weekStartDay, currentWeekStart }) => {
  const handleNameChange = (e) => {
    onUpdateStudent(student.id, { name: e.target.value });
  };

  const handleDayToggle = (dayValue) => {
    const currentDays = student.selectedDays || [];
    let newDays;
    
    if (currentDays.includes(dayValue)) {
      newDays = currentDays.filter(day => day !== dayValue);
    } else {
      newDays = [...currentDays, dayValue].sort();
    }
    
    // Update student with new days - this will trigger lesson regeneration
    onUpdateStudent(student.id, { 
      selectedDays: newDays,
      weeklyLessonCount: newDays.length
    });
  };

  return (
    <div className="card p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={student.name}
            onChange={handleNameChange}
            className="input-field text-lg font-semibold mb-2"
            placeholder="Student Name"
          />
          <div className="text-sm text-gray-600">
            Weekly lessons: {student.weeklyLessonCount || 0}
          </div>
        </div>
        <button
          onClick={() => onDeleteStudent(student.id)}
          className="text-red-500 hover:text-red-700 font-medium text-sm"
        >
          Delete
        </button>
      </div>
      
      <div className="mb-4">
        <DaySelector
          selectedDays={student.selectedDays || []}
          onDayToggle={handleDayToggle}
          weekStartDay={weekStartDay}
        />
      </div>
      
      <LessonList 
        lessons={getLessonsForWeek(student, currentWeekStart, weekStartDay)} 
        onToggleLesson={(lessonId) => onToggleLesson(student.id, lessonId)}
        onUpdateLessonTime={(lessonId, time) => onUpdateLessonTime(student.id, lessonId, time)}
        onToggleLessonCancellation={(lessonId) => onToggleLessonCancellation(student.id, lessonId)}
        onLessonStatusChange={(lessonId, status) => onLessonStatusChange(student.id, lessonId, status)}
      />
    </div>
  );
};

export default StudentCard;
