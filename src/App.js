import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { generateLessonDates, getWeekStart, resetWeek, getTodaysLessons, getPreviousWeek, getNextWeek } from './utils/dateUtils';
import WeekControls from './components/WeekControls';
import AddStudentForm from './components/AddStudentForm';
import StudentCard from './components/StudentCard';
import TodaysLessons from './components/TodaysLessons';
import CancelledLessons from './components/CancelledLessons';

function App() {
  const [students, setStudents] = useLocalStorage('students', []);
  const [currentWeekStart, setCurrentWeekStart] = useLocalStorage('currentWeekStart', getWeekStart().toISOString());
  const [weekStartDay, setWeekStartDay] = useLocalStorage('weekStartDay', 1); // Default: Monday
  const [currentPage, setCurrentPage] = useState('lessons'); // 'lessons' or 'cancelled'

  // Initialize students with lessons if they don't have any
  useEffect(() => {
    const updatedStudents = students.map(student => {
      if (!student.lessons || student.lessons.length === 0) {
        const selectedDays = student.selectedDays || [1, 3]; // Default to Monday and Wednesday
        return {
          ...student,
          selectedDays: selectedDays,
          weeklyLessonCount: selectedDays.length,
          lessons: generateLessonDates(new Date(currentWeekStart), selectedDays, weekStartDay)
        };
      }
      return student;
    });
    
    if (JSON.stringify(updatedStudents) !== JSON.stringify(students)) {
      setStudents(updatedStudents);
    }
  }, [currentWeekStart, weekStartDay, students, setStudents]);

  // Check if lessons need to be generated for current week
  useEffect(() => {
    const currentWeekStartDate = new Date(currentWeekStart);
    const updatedStudents = students.map(student => {
      // Check if student has lessons for current week
      const hasCurrentWeekLessons = student.lessons && student.lessons.some(lesson => {
        const lessonDate = new Date(lesson.date);
        const weekStart = getWeekStart(lessonDate, weekStartDay);
        return weekStart.getTime() === currentWeekStartDate.getTime();
      });

      if (!hasCurrentWeekLessons && student.selectedDays && student.selectedDays.length > 0) {
        // Generate lessons for current week
        const newLessons = generateLessonDates(currentWeekStartDate, student.selectedDays, weekStartDay);
        return {
          ...student,
          lessons: [...(student.lessons || []), ...newLessons]
        };
      }
      return student;
    });
    
    if (JSON.stringify(updatedStudents) !== JSON.stringify(students)) {
      setStudents(updatedStudents);
    }
  }, [currentWeekStart, weekStartDay]);

  const handleAddStudent = (newStudent) => {
    setStudents([...students, newStudent]);
  };

  const handleUpdateStudent = (studentId, updates) => {
    setStudents(prevStudents => {
      return prevStudents.map(student => {
        if (student.id === studentId) {
          const updatedStudent = { ...student, ...updates };
          
          // Always regenerate lessons when student is updated
          if (updatedStudent.selectedDays && updatedStudent.selectedDays.length > 0) {
            updatedStudent.lessons = generateLessonDates(new Date(currentWeekStart), updatedStudent.selectedDays, weekStartDay);
          } else {
            updatedStudent.lessons = [];
          }
          
          return updatedStudent;
        }
        return student;
      });
    });
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setStudents(students.filter(student => student.id !== studentId));
    }
  };

  const handleToggleLesson = (studentId, lessonId) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          lessons: student.lessons.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, completed: !lesson.completed }
              : lesson
          )
        };
      }
      return student;
    }));
  };

  const handleUpdateLessonTime = (studentId, lessonId, time) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          lessons: student.lessons.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, time: time }
              : lesson
          )
        };
      }
      return student;
    }));
  };

  const handleToggleLessonCancellation = (studentId, lessonId) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          lessons: student.lessons.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, cancelled: !lesson.cancelled, completed: false }
              : lesson
          )
        };
      }
      return student;
    }));
  };

  const handleLessonStatusChange = (studentId, lessonId, status) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          lessons: student.lessons.map(lesson =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  completed: status === 'completed',
                  cancelled: status === 'cancelled'
                }
              : lesson
          )
        };
      }
      return student;
    }));
  };

  const handleRestoreLesson = (studentId, lessonId) => {
    setStudents(students.map(student => {
      if (student.id === studentId) {
        return {
          ...student,
          lessons: student.lessons.map(lesson =>
            lesson.id === lessonId
              ? { ...lesson, cancelled: false, completed: false }
              : lesson
          )
        };
      }
      return student;
    }));
  };

  const handleRescheduleLesson = (studentId, lessonId) => {
    // For now, just restore the lesson
    // In a full implementation, this would open a date picker
    handleRestoreLesson(studentId, lessonId);
  };

  const handleNextWeek = () => {
    const newWeekStart = getNextWeek(currentWeekStart);
    setCurrentWeekStart(newWeekStart.toISOString());
    
    // Don't regenerate lessons - keep existing lesson states
    // Lessons will be automatically generated when needed
  };

  const handlePreviousWeek = () => {
    const newWeekStart = getPreviousWeek(currentWeekStart);
    setCurrentWeekStart(newWeekStart.toISOString());
    
    // Don't regenerate lessons - keep existing lesson states
    // Lessons will be automatically generated when needed
  };

  const handleWeekStartDayChange = (newWeekStartDay) => {
    setWeekStartDay(newWeekStartDay);
    
    // Only update week start, don't regenerate lessons
    const newWeekStart = getWeekStart(new Date(currentWeekStart), newWeekStartDay);
    setCurrentWeekStart(newWeekStart.toISOString());
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
        <WeekControls 
          onNextWeek={handleNextWeek}
          onPreviousWeek={handlePreviousWeek}
          currentWeekStart={currentWeekStart}
          weekStartDay={weekStartDay}
          onWeekStartDayChange={handleWeekStartDayChange}
        />
        
        {/* Navigation Tabs */}
        <div className="card p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setCurrentPage('lessons')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'lessons'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Current Lessons
            </button>
            <button
              onClick={() => setCurrentPage('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'cancelled'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Cancelled Lessons ({cancelledLessons.length})
            </button>
          </div>
        </div>
        
        {currentPage === 'lessons' && (
          <>
            <TodaysLessons 
              todaysLessons={todaysLessons}
              onToggleLesson={handleToggleLesson}
              onToggleLessonCancellation={handleToggleLessonCancellation}
            />
          </>
        )}
        
        {currentPage === 'cancelled' && (
          <CancelledLessons
            cancelledLessons={cancelledLessons}
            onRescheduleLesson={handleRescheduleLesson}
            onRestoreLesson={handleRestoreLesson}
          />
        )}
        
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
        
        {students.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>💡 Tip: Click the checkboxes to mark lessons as completed, and use "Next Week" to advance to the following week.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
