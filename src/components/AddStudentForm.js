import React, { useState } from 'react';
import { generateLessonDates, getWeekStart } from '../utils/dateUtils';
import DaySelector from './DaySelector';

const AddStudentForm = ({ onAddStudent, weekStartDay, currentWeekStart }) => {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState([1, 3]); // Default: Monday and Wednesday

  const handleDayToggle = (dayValue) => {
    setSelectedDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(day => day !== dayValue);
      } else {
        return [...prev, dayValue].sort();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || selectedDays.length === 0) return;

    const newStudent = {
      name: name.trim(),
      selectedDays: selectedDays,
      weeklyLessonCount: selectedDays.length
    };

    try {
      await onAddStudent(newStudent);
      setName('');
      setSelectedDays([1, 3]);
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Öğrenci eklenirken hata oluştu: ' + error.message);
    }
  };

  return (
    <div className="card p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Student</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Enter student name"
            required
          />
        </div>
        
        <DaySelector
          selectedDays={selectedDays}
          onDayToggle={handleDayToggle}
          weekStartDay={weekStartDay}
        />
        
        <button
          type="submit"
          className="btn-primary"
          disabled={selectedDays.length === 0}
        >
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;
