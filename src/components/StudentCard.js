import React from 'react';
import WeeklyView from './WeeklyView';
import DaySelector from './DaySelector';
import { getWeeklyView } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t } = useLanguage();
  const handleNameChange = (e) => {
    onUpdateStudent(student.id, { name: e.target.value });
  };

  const handleAmountChange = (e) => {
    const amount = parseInt(e.target.value) || 0;
    onUpdateStudent(student.id, { amount: amount });
  };

  const handlePaymentTypeChange = (e) => {
    onUpdateStudent(student.id, { paymentType: e.target.value });
  };

  const handleCurrencyChange = (e) => {
    onUpdateStudent(student.id, { currency: e.target.value });
  };

  const handleToggleLessonPayment = async (lessonId) => {
    try {
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, paid: !lesson.paid }
          : lesson
      );
      
      // Update the student with the new lessons array
      await onUpdateStudent(student.id, { lessons: updatedLessons });
    } catch (error) {
      console.error('Error toggling lesson payment:', error);
      alert(t('errorUpdatingLesson') + ': ' + error.message);
    }
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
            placeholder={t('studentName')}
          />
          <div className="text-sm text-gray-600">
            {t('weeklyLessonCount')}: {student.weeklyLessonCount || 0}
          </div>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('paymentType')}:
              </label>
              <select
                value={student.paymentType || 'monthly'}
                onChange={handlePaymentTypeChange}
                className="input text-xs"
              >
                <option value="monthly">{t('monthly')}</option>
                <option value="daily">{t('daily')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('amount')}:
              </label>
              <input
                type="number"
                value={student.amount || 100}
                onChange={handleAmountChange}
                className="input text-xs"
                min="0"
                step="10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('currency')}:
              </label>
              <select
                value={student.currency || 'TRY'}
                onChange={handleCurrencyChange}
                className="input text-xs"
              >
                <option value="TRY">TRY</option>
                <option value="RUB">RUB</option>
                <option value="AZN">AZN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDeleteStudent(student.id)}
          className="btn btn-danger text-sm"
        >
          {t('delete')}
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
        student={student}
        onToggleLesson={(lessonId) => onToggleLesson(student.id, lessonId)}
        onUpdateLessonTime={(lessonId, time) => onUpdateLessonTime(student.id, lessonId, time)}
        onToggleLessonCancellation={(lessonId) => onToggleLessonCancellation(student.id, lessonId)}
        onLessonStatusChange={(lessonId, status) => onLessonStatusChange(student.id, lessonId, status)}
        onToggleLessonPayment={handleToggleLessonPayment}
      />
    </div>
  );
};

export default StudentCard;