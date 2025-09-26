import React from 'react';
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

function App() {
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
        alert('Please join a group or create a group first');
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
        alert('Error adding student: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student: ' + error.message);
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
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const result = await deleteStudent(studentId);
        if (!result.success) {
          alert('Error deleting student: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Error deleting student: ' + error.message);
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
        alert('Error updating lesson: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling lesson:', error);
      alert('Error updating lesson: ' + error.message);
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
        alert('Error updating lesson time: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating lesson time:', error);
      alert('Error updating lesson time: ' + error.message);
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
        alert('Error updating lesson cancellation status: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling lesson cancellation:', error);
      alert('Error updating lesson cancellation status: ' + error.message);
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
        alert('Error changing lesson status: ' + result.error);
      }
    } catch (error) {
      console.error('Error changing lesson status:', error);
      alert('Error changing lesson status: ' + error.message);
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
        alert('Error restoring lesson: ' + result.error);
      }
    } catch (error) {
      console.error('Error restoring lesson:', error);
      alert('Error restoring lesson: ' + error.message);
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
        alert('Error updating week: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert('Error updating week: ' + error.message);
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
        alert('Error updating week: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert('Error updating week: ' + error.message);
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
        alert('Error updating week start day: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week start day:', error);
      alert('Error updating week start day: ' + error.message);
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

  const todaysLessons = getTodaysLessons(migratedStudents, currentWeekStart, weekStartDay);
  
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
              <h1 className="text-2xl font-bold text-gray-900">Lesson Tracking System</h1>
              <p className="text-gray-600">Student lessons and payment management</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {migratedStudents.length} students • {cancelledLessons.length} cancelled
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
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Students Yet</h3>
                  <p className="text-gray-600">Start by adding your first student.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Monthly Payment Students */}
                  {migratedStudents.filter(student => student.paymentType === 'monthly').length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Monthly Payment Students
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
                        Daily Payment Students
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

export default App;