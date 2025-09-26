import React, { useState } from 'react';
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
  
  const [showDashboard, setShowDashboard] = useState(true);
  
  // Get settings from group or use defaults
  const currentWeekStart = groupSettings?.settings?.currentWeekStart || getWeekStart().toISOString();
  const weekStartDay = groupSettings?.settings?.weekStartDay || 1;

  const handleAddStudent = async (newStudent) => {
    try {
      if (!currentGroup) {
        alert('Önce bir gruba katılın veya grup oluşturun');
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
        alert('Öğrenci eklenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Öğrenci eklenirken hata oluştu: ' + error.message);
    }
  };

  const handleUpdateStudent = async (studentId, updates) => {
    if (!currentGroup) return;
    
    let updatedStudent = { ...updates };
    if (updates.selectedDays && updates.selectedDays.length > 0) {
      updatedStudent.lessons = generateLessonDates(new Date(currentWeekStart), updates.selectedDays, weekStartDay);
    }
    
    await updateStudent(studentId, updatedStudent);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Bu öğrenciyi silmek istediğinizden emin misiniz?')) {
      try {
        const result = await deleteStudent(studentId);
        if (!result.success) {
          alert('Öğrenci silinirken hata oluştu: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Öğrenci silinirken hata oluştu: ' + error.message);
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
        alert('Ders güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling lesson:', error);
      alert('Ders güncellenirken hata oluştu: ' + error.message);
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
        alert('Ders saati güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating lesson time:', error);
      alert('Ders saati güncellenirken hata oluştu: ' + error.message);
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
        alert('Ders iptal durumu güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling lesson cancellation:', error);
      alert('Ders iptal durumu güncellenirken hata oluştu: ' + error.message);
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
        alert('Ders durumu güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error changing lesson status:', error);
      alert('Ders durumu güncellenirken hata oluştu: ' + error.message);
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
        alert('Ders geri yüklenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error restoring lesson:', error);
      alert('Ders geri yüklenirken hata oluştu: ' + error.message);
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
        alert('Hafta güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert('Hafta güncellenirken hata oluştu: ' + error.message);
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
        alert('Hafta güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week:', error);
      alert('Hafta güncellenirken hata oluştu: ' + error.message);
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
        alert('Hafta başlangıç günü güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week start day:', error);
      alert('Hafta başlangıç günü güncellenirken hata oluştu: ' + error.message);
    }
  };

  const todaysLessons = getTodaysLessons(students, currentWeekStart, weekStartDay);
  
  const cancelledLessons = students.flatMap(student => 
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
              <h1 className="text-2xl font-bold text-gray-900">Ders Takip Sistemi</h1>
              <p className="text-gray-600">Öğrenci dersleri ve ödemeleri yönetimi</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {students.length} öğrenci • {cancelledLessons.length} iptal
              </span>
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {showDashboard ? 'Basit Görünüm' : 'Dashboard'}
              </button>
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
            
            {showDashboard ? (
              // Dashboard View
              <div className="space-y-6">
                {/* Payment Management */}
                <PaymentManager
                  students={students}
                  currentGroup={currentGroup}
                />

                {/* Today's Lessons and Cancelled Lessons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                </div>

                {/* Add Student Form */}
                <AddStudentForm 
                  onAddStudent={handleAddStudent}
                  weekStartDay={weekStartDay}
                  currentWeekStart={currentWeekStart}
                />

                {/* Student Cards */}
                {students.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz Öğrenci Yok</h3>
                    <p className="text-gray-600">İlk öğrencinizi ekleyerek başlayın.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800">Öğrenci Haftalık Programları</h2>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      {students.map(student => (
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
            ) : (
              // Simple View
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
                  students={students}
                  currentGroup={currentGroup}
                />
                
                <AddStudentForm 
                  onAddStudent={handleAddStudent}
                  weekStartDay={weekStartDay}
                  currentWeekStart={currentWeekStart}
                />
                
                {students.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz Öğrenci Yok</h3>
                    <p className="text-gray-600">İlk öğrencinizi ekleyerek başlayın.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {students.map(student => (
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
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;