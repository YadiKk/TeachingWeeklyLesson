// Date utility functions for lesson scheduling

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getWeekStart = (date = new Date(), weekStartDay = 1) => {
  const d = new Date(date);
  const day = d.getDay();
  // weekStartDay: 0=Sunday, 1=Monday, 2=Tuesday, etc.
  const diff = d.getDate() - day + (day === 0 ? 7 - weekStartDay : (day >= weekStartDay ? weekStartDay - day : weekStartDay - day - 7));
  return new Date(d.setDate(diff));
};

export const generateLessonDates = (weekStart, selectedDays, weekStartDay = 1) => {
  const dates = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // If no days selected, return empty array
  if (!selectedDays || selectedDays.length === 0) {
    return dates;
  }
  
  // Sort selected days to ensure proper order
  const sortedDays = [...selectedDays].sort();
  
  // Generate lessons for selected days
  sortedDays.forEach((dayValue, index) => {
    // Calculate the correct date for the selected day of the week
    const weekStartDate = new Date(weekStart);
    const currentDay = weekStartDate.getDay();
    const targetDay = dayValue;
    
    // Calculate days to add to get to the target day
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    
    const lessonDate = addDays(weekStartDate, daysToAdd);
    const dayOfWeek = lessonDate.getDay();
    dates.push({
      id: `lesson-${Date.now()}-${Math.random()}-${index}`,
      date: lessonDate.toISOString(),
      time: '09:00', // Default time in HH:MM format
      completed: false,
      cancelled: false, // New field for lesson cancellation
      dayName: daysOfWeek[dayOfWeek]
    });
  });
  
  return dates;
};

export const resetWeek = (students) => {
  const newWeekStart = addDays(getWeekStart(), 7);
  
  return students.map(student => ({
    ...student,
    lessons: generateLessonDates(newWeekStart, student.weeklyLessonCount)
  }));
};

export const isToday = (dateString) => {
  const today = new Date();
  const lessonDate = new Date(dateString);
  return today.toDateString() === lessonDate.toDateString();
};

export const getTodaysLessons = (students, currentWeekStart, weekStartDay = 1) => {
  const todaysLessons = [];
  const currentWeekStartDate = new Date(currentWeekStart);
  
  students.forEach(student => {
    student.lessons.forEach(lesson => {
      if (isToday(lesson.date)) {
        // Check if lesson belongs to current week
        const lessonDate = new Date(lesson.date);
        const weekStart = getWeekStart(lessonDate, weekStartDay);
        const currentWeekStartForComparison = getWeekStart(currentWeekStartDate, weekStartDay);
        
        if (weekStart.getTime() === currentWeekStartForComparison.getTime()) {
          todaysLessons.push({
            ...lesson,
            studentName: student.name,
            studentId: student.id
          });
        }
      }
    });
  });
  
  // Sort by time
  return todaysLessons.sort((a, b) => a.time.localeCompare(b.time));
};

export const formatTime = (timeString) => {
  if (!timeString) return '09:00';
  // Ensure time is in HH:MM format
  if (timeString.includes(':')) {
    return timeString;
  }
  return '09:00';
};

export const getWeekRange = (weekStart) => {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

export const formatWeekRange = (weekStart) => {
  const start = new Date(weekStart);
  const end = addDays(start, 6);
  
  const startStr = start.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'short' 
  });
  const endStr = end.toLocaleDateString('tr-TR', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
  
  return `${startStr} - ${endStr}`;
};

export const getPreviousWeek = (currentWeekStart) => {
  return addDays(new Date(currentWeekStart), -7);
};

export const getNextWeek = (currentWeekStart) => {
  return addDays(new Date(currentWeekStart), 7);
};

export const getWeekStartDayOptions = () => {
  return [
    { value: 0, label: 'Pazar' },
    { value: 1, label: 'Pazartesi' },
    { value: 2, label: 'Salı' },
    { value: 3, label: 'Çarşamba' },
    { value: 4, label: 'Perşembe' },
    { value: 5, label: 'Cuma' },
    { value: 6, label: 'Cumartesi' }
  ];
};

export const getLessonsForWeek = (student, currentWeekStart, weekStartDay) => {
  const currentWeekStartDate = new Date(currentWeekStart);
  
  return student.lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    const weekStart = getWeekStart(lessonDate, weekStartDay);
    return weekStart.getTime() === currentWeekStartDate.getTime();
  });
};
