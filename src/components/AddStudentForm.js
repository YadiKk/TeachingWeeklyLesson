import React, { useState } from 'react';
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
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Yeni Öğrenci Ekle</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Öğrenci Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Öğrenci adını girin"
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
          className="btn btn-primary"
          disabled={selectedDays.length === 0}
        >
          Öğrenci Ekle
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;