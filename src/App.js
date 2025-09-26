import React, { useState, useEffect } from 'react';
import { useGroup } from './hooks/useGroup';
import { addStudent, updateStudent, deleteStudent } from './firebase/lessonService';
import { generateLessonDates, getWeekStart, resetWeek, getTodaysLessons, getPreviousWeek, getNextWeek } from './utils/dateUtils';
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
  
  const [showDashboard, setShowDashboard] = useState(true); // Show all panels in dashboard view
  
  // Get settings from group or use defaults
  const currentWeekStart = groupSettings?.settings?.currentWeekStart || getWeekStart().toISOString();
  const weekStartDay = groupSettings?.settings?.weekStartDay || 1;


  const handleAddStudent = async (newStudent) => {
    try {
      if (!currentGroup) {
        console.error('No current group');
        alert('Önce bir gruba katılın veya grup oluşturun');
        return;
      }
      
      console.log('Adding student:', newStudent);
      console.log('Current group:', currentGroup);
      
      // Generate lessons for the student
      const selectedDays = newStudent.selectedDays || [1, 3];
      const lessons = generateLessonDates(new Date(currentWeekStart), selectedDays, weekStartDay);
      
      const studentData = {
        ...newStudent,
        selectedDays,
        weeklyLessonCount: selectedDays.length,
        lessons
      };
      
      console.log('Student data to save:', studentData);
      
      const result = await addStudent(currentGroup, studentData);
      console.log('Add student result:', result);
      
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
    
    // Generate lessons if selectedDays changed
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
        if (result.success) {
          console.log('Student deleted successfully');
        } else {
          console.error('Error deleting student:', result.error);
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
      if (!student) {
        console.error('Student not found:', studentId);
        return;
      }
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, completed: !lesson.completed }
          : lesson
      );
      
      const result = await updateStudent(studentId, { lessons: updatedLessons });
      if (!result.success) {
        console.error('Error updating lesson:', result.error);
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
        console.error('Error updating lesson time:', result.error);
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
        console.error('Error toggling lesson cancellation:', result.error);
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
        console.error('Error changing lesson status:', result.error);
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
        console.error('Error restoring lesson:', result.error);
        alert('Ders geri yüklenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error restoring lesson:', error);
      alert('Ders geri yüklenirken hata oluştu: ' + error.message);
    }
  };

  const handleRescheduleLesson = (studentId, lessonId) => {
    // For now, just restore the lesson
    // In a full implementation, this would open a date picker
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
        console.error('Error updating week:', result.error);
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
        console.error('Error updating week:', result.error);
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
        console.error('Error updating week start day:', result.error);
        alert('Hafta başlangıç günü güncellenirken hata oluştu: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating week start day:', error);
      alert('Hafta başlangıç günü güncellenirken hata oluştu: ' + error.message);
    }
  };

  const todaysLessons = getTodaysLessons(students, currentWeekStart, weekStartDay);
  
  // Get all cancelled lessons from all students
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <GroupManager 
          currentGroup={currentGroup}
          onJoinGroup={joinExistingGroup}
          onCreateGroup={createNewGroup}
          onLeaveGroup={leaveGroup}
          loading={loading}
          error={error}
        />
        
        
        {currentGroup && (
          <WeekControls 
            onNextWeek={handleNextWeek}
            onPreviousWeek={handlePreviousWeek}
            currentWeekStart={currentWeekStart}
            weekStartDay={weekStartDay}
            onWeekStartDayChange={handleWeekStartDayChange}
          />
        )}
        
        {currentGroup && (
          <>
            {/* Dashboard Toggle */}
            <div className="card p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">
                  Teaching Dashboard
                </h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {students.length} öğrenci • {cancelledLessons.length} iptal edilen ders
                  </span>
                  <button
                    onClick={() => setShowDashboard(!showDashboard)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showDashboard
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showDashboard ? 'Dashboard Görünümü' : 'Panel Görünümü'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {currentGroup && (
          <>
            {showDashboard ? (
              // Dashboard View - All panels visible
              <div className="space-y-6">
                {/* Payment Management - Top Priority */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="xl:col-span-2">
                    <PaymentManager
                      students={students}
                      currentGroup={currentGroup}
                    />
                  </div>
                </div>

                {/* Today's Lessons and Cancelled Lessons */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <TodaysLessons 
                      todaysLessons={todaysLessons}
                      onToggleLesson={handleToggleLesson}
                      onToggleLessonCancellation={handleToggleLessonCancellation}
                    />
                  </div>
                  <div>
                    <CancelledLessons
                      cancelledLessons={cancelledLessons}
                      onRescheduleLesson={handleRescheduleLesson}
                      onRestoreLesson={handleRestoreLesson}
                    />
                  </div>
                </div>

                {/* Add Student Form */}
                <AddStudentForm 
                  onAddStudent={handleAddStudent}
                  weekStartDay={weekStartDay}
                  currentWeekStart={currentWeekStart}
                />

                {/* Student Cards */}
                {students.length === 0 ? (
                  <div className="card p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Students Added Yet</h3>
                    <p className="text-gray-600">Add your first student to start tracking their weekly lessons.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800">Student Weekly Schedules</h3>
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
              // Tab View - Original functionality
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
                  <div className="card p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No Students Added Yet</h3>
                    <p className="text-gray-600">Add your first student to start tracking their weekly lessons.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
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
            
            {students.length > 0 && (
              <div className="mt-8 text-center text-sm text-gray-500">
                <p>💡 Tip: Dashboard görünümünde tüm panelleri aynı anda görebilirsiniz. Ödeme yönetimi en üstte yer alır.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
