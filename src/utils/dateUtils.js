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
  
  // Calculate how many days to subtract to get to the week start
  let daysToSubtract = day - weekStartDay;
  if (daysToSubtract < 0) {
    daysToSubtract += 7;
  }
  
  // Set to the start of the week
  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0); // Set to start of day
  
  return d;
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
    
    // Calculate days to add to get to the target day from the week start
    // dayValue is the day of the week (0=Sunday, 1=Monday, etc.)
    // weekStartDay is the day the week starts (0=Sunday, 1=Monday, etc.)
    let daysToAdd = dayValue - weekStartDay;
    if (daysToAdd < 0) {
      daysToAdd += 7;
    }
    
    const lessonDate = addDays(weekStartDate, daysToAdd);
    const dayOfWeek = lessonDate.getDay();
    
    console.log(`Generating lesson: Day ${dayValue} -> ${lessonDate.toDateString()} (${daysOfWeek[dayOfWeek]})`);
    
    dates.push({
      id: `lesson-${Date.now()}-${Math.random()}-${index}`,
      date: lessonDate.toISOString(),
      time: '09:00', // Default time in HH:MM format
      completed: false,
      cancelled: false, // New field for lesson cancellation
      paid: false, // New field for lesson payment status
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
    // For daily payment students, create a virtual lesson for today if they have scheduled weekdays
    if (student.paymentType === 'daily') {
      // Import the advanced daily payment utilities
      const { getScheduledWeekdays, getTodaysLessonTime, isTodayPaid } = require('./dailyPaymentAdvanced');
      
      const scheduledWeekdays = getScheduledWeekdays(student.id);
      const today = new Date();
      const todayWeekday = today.getDay();
      
      // Check if student should have a lesson today
      if (scheduledWeekdays.includes(todayWeekday)) {
        const todaysTime = getTodaysLessonTime(student.id);
        const isPaid = isTodayPaid(student.id);
        
        const virtualLesson = {
          id: `daily-${student.id}-${today.toISOString().split('T')[0]}`,
          date: today.toISOString(),
          time: todaysTime,
          completed: false,
          cancelled: false,
          paid: isPaid,
          dayName: today.toLocaleDateString('en-US', { weekday: 'long' }),
          isVirtual: true // Flag to identify virtual lessons
        };
        
        todaysLessons.push({
          ...virtualLesson,
          studentName: student.name,
          studentId: student.id
        });
      }
    } else {
      // Regular lesson processing for monthly payment students
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
    }
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
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];
};

export const getLessonsForWeek = (student, currentWeekStart, weekStartDay) => {
  const currentWeekStartDate = new Date(currentWeekStart);
  
  const filteredLessons = student.lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    const weekStart = getWeekStart(lessonDate, weekStartDay);
    return weekStart.getTime() === currentWeekStartDate.getTime();
  });
  
  console.log('getLessonsForWeek:', {
    studentName: student.name,
    currentWeekStart: currentWeekStartDate.toDateString(),
    totalLessons: student.lessons.length,
    filteredLessons: filteredLessons.length,
    lessons: filteredLessons.map(l => new Date(l.date).toDateString())
  });
  
  return filteredLessons;
};

export const getWeeklyView = (student, currentWeekStart, weekStartDay) => {
  const currentWeekStartDate = new Date(currentWeekStart);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weeklyView = [];
  
  // Get lessons that belong to the current week
  const currentWeekLessons = getLessonsForWeek(student, currentWeekStart, weekStartDay);
  
  // Create all 7 days of the week starting from the week start day
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(currentWeekStartDate, i);
    const dayOfWeek = dayDate.getDay();
    const dayName = daysOfWeek[dayOfWeek];
    
    // Find lesson for this day of the week
    const lessonForDay = currentWeekLessons.find(lesson => {
      const lessonDate = new Date(lesson.date);
      // Check if the lesson date matches this day of the week
      return lessonDate.getDay() === dayOfWeek;
    });
    
    weeklyView.push({
      dayOfWeek: dayOfWeek,
      dayName: dayName,
      date: dayDate.toISOString(),
      lesson: lessonForDay ? {
        ...lessonForDay,
        paid: lessonForDay.paid !== undefined ? lessonForDay.paid : false
      } : null,
      hasLesson: !!lessonForDay
    });
  }
  
  return weeklyView;
};