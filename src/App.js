import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroup } from './hooks/useGroup';
import { addStudent, updateStudent, deleteStudent } from './firebase/lessonService';
import { generateLessonDates, getWeekStart, getTodaysLessons, getPreviousWeek, getNextWeek } from './utils/dateUtils';
import WeekControls from './components/WeekControls';
import AddStudentForm from './components/AddStudentForm';
import StudentCard from './components/StudentCard';
import TodaysLessons from './components/TodaysLessons';
import CancelledLessons from './components/CancelledLessons';
import GroupManager from './components/GroupManager';
import PaymentManager from './components/PaymentManager';
import LanguageSelector from './components/LanguageSelector';

function AppContent() {
  const { t } = useTranslation();
  const { 
    currentGroup, 
    students, 
    groupSettings, 
    loading, 
    error, 
    createNewGroup, 
    joinExistingGroup, 
    leaveGroup, 
    updateSettings 
  } = useGroup();
  
  // Removed dashboard toggle - keeping only simple view
  
  // Get settings from group or use defaults
  const currentWeekStart = groupSettings?.settings?.currentWeekStart || getWeekStart().toISOString();
  const weekStartDay = groupSettings?.settings?.weekStartDay || 1;

  const handleAddStudent = async (newStudent) => {
    try {
      if (!currentGroup) {
        alert(t('app.pleaseJoinGroupFirst'));
        return;
      }
      
      const selectedDays = newStudent.selectedDays || [1, 3];
      const lessons = generateLessonDates(new Date(currentWeekStart), selectedDays, weekStartDay);
      
      const studentData = {
        ...newStudent,
        selectedDays,
        weeklyLessonCount: selectedDays.length,
        lessons
      };
      
      const result = await addStudent(currentGroup, studentData);
      
      if (!result.success) {
        alert(t('errors.errorAddingStudent') + ': ' + result.error);
      } else {
        // Initialize daily payment data for daily payment students
        if (newStudent.paymentType === 'daily') {
          const { setScheduledWeekdays, setLessonTimeForDay } = await import('./utils/dailyPaymentAdvanced');
          setScheduledWeekdays(result.studentId || newStudent.id, selectedDays);
          
          // Set default lesson times for each selected day
          selectedDays.forEach(day => {
            setLessonTimeForDay(result.studentId || newStudent.id, day, newStudent.lessonTime || '09:00');
          });
        }
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert(t('errors.errorAddingStudent') + ': ' + error.message);
    }
  };

  const handleUpdateStudent = async (studentId, updates) => {
    if (!currentGroup) return;
    
    let updatedStudent = { ...updates };
    
    // If selectedDays are being updated, regenerate lessons for current week only
    if (updates.selectedDays && updates.selectedDays.length > 0) {
      updatedStudent.lessons = generateLessonDates(new Date(currentWeekStart), updates.selectedDays, weekStartDay);
    }
    
    // Ensure all lessons have the paid property for daily payment students
    if (updates.lessons) {
      updatedStudent.lessons = updates.lessons.map(lesson => ({
        ...lesson,
        paid: lesson.paid !== undefined ? lesson.paid : false
      }));
    }
    
    await updateStudent(studentId, updatedStudent);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm(t('errors.areYouSureDeleteStudent'))) {
      try {
        const result = await deleteStudent(studentId);
        if (!result.success) {
          alert(t('errors.errorDeletingStudent') + ': ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert(t('errors.errorDeletingStudent') + ': ' + error.message);
      }
    }
  };

  const handleToggleLesson = async (studentId, lessonId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      );
      
      const result = await updateStudent(studentId, { lessons: updatedLessons });
      if (!result.success) {
        alert(t('errors.errorUpdatingLesson') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling lesson:', error);
      alert(t('errors.errorUpdatingLesson') + ': ' + error.message);
    }
  };

  const handleUpdateLessonTime = async (studentId, lessonId, time) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, time: time }
          : lesson
      );
      
      const result = await updateStudent(studentId, { lessons: updatedLessons });
      if (!result.success) {
        alert(t('errors.errorUpdatingLessonTime') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error updating lesson time:', error);
      alert(t('errors.errorUpdatingLessonTime') + ': ' + error.message);
    }
  };

  const handleToggleLessonCancellation = async (studentId, lessonId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, cancelled: !lesson.cancelled, completed: false }
          : lesson
      );
      
      const result = await updateStudent(studentId, { lessons: updatedLessons });
      if (!result.success) {
        alert(t('errors.errorUpdatingLessonCancellation') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling lesson cancellation:', error);
      alert(t('errors.errorUpdatingLessonCancellation') + ': ' + error.message);
    }
  };

  const handleLessonStatusChange = async (studentId, lessonId, status) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? {
              ...lesson,
              completed: status === 'completed',
              cancelled: status === 'cancelled'
            }
          : lesson
      );
      
      const result = await updateStudent(studentId, { lessons: updatedLessons });
      if (!result.success) {
        alert(t('errors.errorChangingLessonStatus') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error changing lesson status:', error);
      alert(t('errors.errorChangingLessonStatus') + ': ' + error.message);
    }
  };

  const handleRestoreLesson = async (studentId, lessonId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, cancelled: false, completed: false }
          : lesson
      );
      
      const result = await updateStudent(studentId, { lessons: updatedLessons });
      if (!result.success) {
        alert(t('errors.errorRestoringLesson') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error restoring lesson:', error);
      alert(t('errors.errorRestoringLesson') + ': ' + error.message);
    }
  };

  const handleRescheduleLesson = (studentId, lessonId) => {
    handleRestoreLesson(studentId, lessonId);
  };

  const handleNextWeek = async () => {
    try {
      if (!currentGroup) return;
      
      const newWeekStart = getNextWeek(currentWeekStart);
      const result = await updateSettings({
        currentWeekStart: newWeekStart.toISOString(),
        weekStartDay
      });
      
      if (!result.success) {
        alert(t('errors.errorUpdatingWeek') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert(t('errors.errorUpdatingWeek') + ': ' + error.message);
    }
  };

  const handlePreviousWeek = async () => {
    try {
      if (!currentGroup) return;
      
      const newWeekStart = getPreviousWeek(currentWeekStart);
      const result = await updateSettings({
        currentWeekStart: newWeekStart.toISOString(),
        weekStartDay
      });
      
      if (!result.success) {
        alert(t('errors.errorUpdatingWeek') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert(t('errors.errorUpdatingWeek') + ': ' + error.message);
    }
  };

  const handleWeekStartDayChange = async (newWeekStartDay) => {
    try {
      if (!currentGroup) return;
      
      const newWeekStart = getWeekStart(new Date(currentWeekStart), newWeekStartDay);
      const result = await updateSettings({
        currentWeekStart: newWeekStart.toISOString(),
        weekStartDay: newWeekStartDay
      });
      
      if (!result.success) {
        alert(t('errors.errorUpdatingWeekStartDay') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week start day:', error);
      alert(t('errors.errorUpdatingWeekStartDay') + ': ' + error.message);
    }
  };

  // Ensure all students have proper payment type and lesson paid properties
  const migratedStudents = students.map(student => ({
    ...student,
    paymentType: student.paymentType || 'monthly',
    lessons: student.lessons.map(lesson => ({
      ...lesson,
      paid: lesson.paid !== undefined ? lesson.paid : false
    }))
  }));

  const [todaysLessons, setTodaysLessons] = useState([]);
  
  // Load today's lessons asynchronously
  useEffect(() => {
    const loadTodaysLessons = async () => {
      const lessons = await getTodaysLessons(migratedStudents, currentWeekStart, weekStartDay);
      setTodaysLessons(lessons);
    };
    loadTodaysLessons();
  }, [migratedStudents, currentWeekStart, weekStartDay]);
  
  const cancelledLessons = migratedStudents.flatMap(student => 
    student.lessons
      .filter(lesson => lesson.cancelled)
      .map(lesson => ({
        ...lesson,
        studentName: student.name,
        studentId: student.id
      }))
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('app.title')}</h1>
              <p className="text-gray-600">{t('app.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <span className="text-sm text-gray-500">
                {migratedStudents.length} {t('app.students')} • {cancelledLessons.length} {t('app.cancelled')}
              </span>
            </div>
          </div>
        </div>

        {/* Group Manager */}
        <GroupManager 
          currentGroup={currentGroup}
          onJoinGroup={joinExistingGroup}
          onCreateGroup={createNewGroup}
          onLeaveGroup={leaveGroup}
          loading={loading}
          error={error}
        />
        
        {currentGroup && (
          <>
            {/* Week Controls */}
            <WeekControls 
              onNextWeek={handleNextWeek}
              onPreviousWeek={handlePreviousWeek}
              currentWeekStart={currentWeekStart}
              weekStartDay={weekStartDay}
              onWeekStartDayChange={handleWeekStartDayChange}
            />
            
            {/* Simple View Only */}
            <div className="space-y-6">
              <TodaysLessons 
                todaysLessons={todaysLessons}
                onToggleLesson={handleToggleLesson}
                onToggleLessonCancellation={handleToggleLessonCancellation}
              />
              
              <CancelledLessons
                cancelledLessons={cancelledLessons}
                onRescheduleLesson={handleRescheduleLesson}
                onRestoreLesson={handleRestoreLesson}
              />
              
              <PaymentManager
                students={migratedStudents}
                currentGroup={currentGroup}
                weekStartDay={weekStartDay}
                currentWeekStart={currentWeekStart}
              />
              
              <AddStudentForm 
                onAddStudent={handleAddStudent}
                weekStartDay={weekStartDay}
                currentWeekStart={currentWeekStart}
              />
              
              {migratedStudents.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">{t('app.noStudentsYet')}</h3>
                  <p className="text-gray-600">{t('app.startByAddingFirstStudent')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Monthly Payment Students */}
                  {migratedStudents.filter(student => student.paymentType === 'monthly').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        {t('app.monthlyPaymentStudents')}
                      </h3>
                      <div className="space-y-4">
                        {migratedStudents.filter(student => student.paymentType === 'monthly').map(student => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            onUpdateStudent={handleUpdateStudent}
                            onDeleteStudent={handleDeleteStudent}
                            onToggleLesson={handleToggleLesson}
                            onUpdateLessonTime={handleUpdateLessonTime}
                            onToggleLessonCancellation={handleToggleLessonCancellation}
                            onLessonStatusChange={handleLessonStatusChange}
                            weekStartDay={weekStartDay}
                            currentWeekStart={currentWeekStart}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily Payment Students */}
                  {migratedStudents.filter(student => student.paymentType === 'daily').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                        {t('app.dailyPaymentStudents')}
                      </h3>
                      <div className="space-y-4">
                        {migratedStudents.filter(student => student.paymentType === 'daily').map(student => (
                          <StudentCard
                            key={student.id}
                            student={student}
                            onUpdateStudent={handleUpdateStudent}
                            onDeleteStudent={handleDeleteStudent}
                            onToggleLesson={handleToggleLesson}
                            onUpdateLessonTime={handleUpdateLessonTime}
                            onToggleLessonCancellation={handleToggleLessonCancellation}
                            onLessonStatusChange={handleLessonStatusChange}
                            weekStartDay={weekStartDay}
                            currentWeekStart={currentWeekStart}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  return <AppContent />;
}

export default App;