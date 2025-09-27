// Advanced daily payment utility functions with per-day lesson times and payment counters

// localStorage keys
const DAILY_PAYMENTS_KEY = 'payments_daily_advanced_v1';
const LESSON_TIMES_KEY = 'lesson_times_per_day_v1';

/**
 * Get today's date as a string (YYYY-MM-DD format)
 * @returns {string} - Today's date string
 */
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get current month and year
 * @returns {Object} - {year, month}
 */
const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
};

/**
 * Get all scheduled dates in a specific month for a student
 * @param {string} studentId - The student's ID
 * @param {number} year - The year
 * @param {number} month - The month (1-12)
 * @returns {Date[]} - Array of scheduled dates in the month
 */
export const getScheduledDatesInMonth = (studentId, year, month) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    const studentData = existingData[studentId] || { scheduledWeekdays: [] };
    const scheduledWeekdays = studentData.scheduledWeekdays || [];
    
    if (scheduledWeekdays.length === 0) {
      return [];
    }
    
    const scheduledDates = [];
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in Date constructor
    const endDate = new Date(year, month, 0); // Last day of the month
    
    // Iterate through each day of the month
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, etc.
      
      // Check if this day of the week is scheduled
      if (scheduledWeekdays.includes(dayOfWeek)) {
        scheduledDates.push(new Date(date));
      }
    }
    
    return scheduledDates;
  } catch (error) {
    console.error('Error getting scheduled dates:', error);
    return [];
  }
};

/**
 * Get payment counter for a student in current month
 * @param {string} studentId - The student's ID
 * @returns {Object} - {paid, total, remaining}
 */
export const getPaymentCounter = (studentId) => {
  try {
    const { year, month } = getCurrentMonthYear();
    const scheduledDates = getScheduledDatesInMonth(studentId, year, month);
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    const studentData = existingData[studentId] || { paidDates: {} };
    
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const paidDates = studentData.paidDates[monthKey] || [];
    
    const total = scheduledDates.length;
    const paid = paidDates.length;
    const remaining = total - paid;
    
    return { paid, total, remaining };
  } catch (error) {
    console.error('Error getting payment counter:', error);
    return { paid: 0, total: 0, remaining: 0 };
  }
};

/**
 * Check if today's payment is already paid for a student
 * @param {string} studentId - The student's ID
 * @returns {boolean} - True if today's payment is paid
 */
export const isTodayPaid = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    const studentData = existingData[studentId] || { lastPaidDate: null };
    
    // Check if the last paid date is today
    const todayString = getTodayString();
    return studentData.lastPaidDate === todayString;
  } catch (error) {
    console.error('Error checking if today is paid:', error);
    return false;
  }
};

/**
 * Mark today's payment as paid for a student
 * @param {string} studentId - The student's ID
 * @returns {boolean} - Success status
 */
export const payToday = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    const todayString = getTodayString();
    const { year, month } = getCurrentMonthYear();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    // Initialize student data if it doesn't exist
    if (!existingData[studentId]) {
      existingData[studentId] = {
        scheduledWeekdays: [],
        paidDates: {}
      };
    }
    
    // Initialize month array if it doesn't exist
    if (!existingData[studentId].paidDates[monthKey]) {
      existingData[studentId].paidDates[monthKey] = [];
    }
    
    // Add today's date if not already paid
    if (!existingData[studentId].paidDates[monthKey].includes(todayString)) {
      existingData[studentId].paidDates[monthKey].push(todayString);
      existingData[studentId].paidDates[monthKey].sort(); // Keep sorted
    }
    
    // Update the last paid date
    existingData[studentId].lastPaidDate = todayString;
    
    localStorage.setItem(DAILY_PAYMENTS_KEY, JSON.stringify(existingData));
    console.log('Marked today as paid for student:', studentId);
    return true;
  } catch (error) {
    console.error('Error marking today as paid:', error);
    return false;
  }
};

/**
 * Unmark today's payment as paid for a student
 * @param {string} studentId - The student's ID
 * @returns {boolean} - Success status
 */
export const unpayToday = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    const todayString = getTodayString();
    const { year, month } = getCurrentMonthYear();
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    
    // Remove today's date from paid dates
    if (existingData[studentId] && existingData[studentId].paidDates[monthKey]) {
      existingData[studentId].paidDates[monthKey] = existingData[studentId].paidDates[monthKey].filter(d => d !== todayString);
    }
    
    // Clear the last paid date
    if (existingData[studentId]) {
      existingData[studentId].lastPaidDate = null;
    }
    
    localStorage.setItem(DAILY_PAYMENTS_KEY, JSON.stringify(existingData));
    console.log('Unmarked today as paid for student:', studentId);
    return true;
  } catch (error) {
    console.error('Error unmarking today as paid:', error);
    return false;
  }
};

/**
 * Set scheduled weekdays for a student
 * @param {string} studentId - The student's ID
 * @param {number[]} weekdays - Array of weekdays (0=Sunday, 1=Monday, etc.)
 * @returns {boolean} - Success status
 */
export const setScheduledWeekdays = (studentId, weekdays) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    
    if (!existingData[studentId]) {
      existingData[studentId] = {
        scheduledWeekdays: [],
        paidDates: {}
      };
    }
    
    existingData[studentId].scheduledWeekdays = [...weekdays].sort();
    localStorage.setItem(DAILY_PAYMENTS_KEY, JSON.stringify(existingData));
    
    console.log('Set scheduled weekdays for student:', { studentId, weekdays });
    return true;
  } catch (error) {
    console.error('Error setting scheduled weekdays:', error);
    return false;
  }
};

/**
 * Get scheduled weekdays for a student
 * @param {string} studentId - The student's ID
 * @returns {number[]} - Array of scheduled weekdays
 */
export const getScheduledWeekdays = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    return existingData[studentId]?.scheduledWeekdays || [];
  } catch (error) {
    console.error('Error getting scheduled weekdays:', error);
    return [];
  }
};

/**
 * Set lesson time for a specific day of the week
 * @param {string} studentId - The student's ID
 * @param {number} weekday - Day of the week (0=Sunday, 1=Monday, etc.)
 * @param {string} time - Time in HH:MM format
 * @returns {boolean} - Success status
 */
export const setLessonTimeForDay = (studentId, weekday, time) => {
  try {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      console.error('Invalid time format:', time);
      return false;
    }
    
    const existingData = JSON.parse(localStorage.getItem(LESSON_TIMES_KEY) || '{}');
    
    if (!existingData[studentId]) {
      existingData[studentId] = {};
    }
    
    existingData[studentId][weekday] = time;
    localStorage.setItem(LESSON_TIMES_KEY, JSON.stringify(existingData));
    
    console.log('Set lesson time for day:', { studentId, weekday, time });
    return true;
  } catch (error) {
    console.error('Error setting lesson time for day:', error);
    return false;
  }
};

/**
 * Get lesson time for a specific day of the week
 * @param {string} studentId - The student's ID
 * @param {number} weekday - Day of the week (0=Sunday, 1=Monday, etc.)
 * @returns {string} - Time in HH:MM format, defaults to '09:00'
 */
export const getLessonTimeForDay = (studentId, weekday) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(LESSON_TIMES_KEY) || '{}');
    return existingData[studentId]?.[weekday] || '09:00';
  } catch (error) {
    console.error('Error getting lesson time for day:', error);
    return '09:00';
  }
};

/**
 * Get today's lesson time for a student
 * @param {string} studentId - The student's ID
 * @returns {string} - Time in HH:MM format
 */
export const getTodaysLessonTime = (studentId) => {
  const today = new Date();
  const weekday = today.getDay(); // 0=Sunday, 1=Monday, etc.
  return getLessonTimeForDay(studentId, weekday);
};

/**
 * Get students who missed payment (should have paid yesterday or earlier)
 * @param {Array} students - Array of all students
 * @returns {Array} - Array of students who missed payment
 */
export const getMissedPaymentStudents = (students) => {
  const missedStudents = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  
  students.forEach(student => {
    if (student.paymentType === 'daily') {
      const scheduledWeekdays = getScheduledWeekdays(student.id);
      const yesterdayWeekday = yesterday.getDay();
      
      // Check if student should have had a lesson yesterday
      if (scheduledWeekdays.includes(yesterdayWeekday)) {
        const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
        const studentData = existingData[student.id] || { paidDates: {} };
        const { year, month } = getCurrentMonthYear();
        const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
        const paidDates = studentData.paidDates[monthKey] || [];
        
        // If yesterday's date is not in paid dates, they missed payment
        if (!paidDates.includes(yesterdayString)) {
          missedStudents.push({
            ...student,
            missedDate: yesterdayString,
            missedDayName: yesterday.toLocaleDateString('en-US', { weekday: 'long' })
          });
        }
      }
    }
  });
  
  return missedStudents;
};

/**
 * Get students who should pay today
 * @param {Array} students - Array of all students
 * @returns {Array} - Array of students who should pay today
 */
export const getTodaysPaymentStudents = (students) => {
  const todaysStudents = [];
  const today = new Date();
  const todayWeekday = today.getDay();
  
  students.forEach(student => {
    if (student.paymentType === 'daily') {
      const scheduledWeekdays = getScheduledWeekdays(student.id);
      
      // Check if student should have a lesson today
      if (scheduledWeekdays.includes(todayWeekday)) {
        todaysStudents.push(student);
      }
    }
  });
  
  return todaysStudents;
};

/**
 * Clear all daily payment data (for testing/reset purposes)
 * @returns {boolean} - Success status
 */
export const clearAllDailyPaymentData = () => {
  try {
    localStorage.removeItem(DAILY_PAYMENTS_KEY);
    localStorage.removeItem(LESSON_TIMES_KEY);
    console.log('Cleared all daily payment data');
    return true;
  } catch (error) {
    console.error('Error clearing daily payment data:', error);
    return false;
  }
};
