// Simplified daily payment utility functions - one payment per day that resets automatically

// localStorage key for daily payments
const DAILY_PAYMENTS_KEY = 'payments_daily_simple_v1';

/**
 * Get today's date as a string (YYYY-MM-DD format)
 * @returns {string} - Today's date string
 */
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD format
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
    
    // Update the student's last paid date to today
    existingData[studentId] = {
      lastPaidDate: todayString
    };
    
    localStorage.setItem(DAILY_PAYMENTS_KEY, JSON.stringify(existingData));
    console.log('Marked today as paid for student:', studentId);
    return true;
  } catch (error) {
    console.error('Error marking today as paid:', error);
    return false;
  }
};

/**
 * Unmark today's payment as paid for a student (for testing purposes)
 * @param {string} studentId - The student's ID
 * @returns {boolean} - Success status
 */
export const unpayToday = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    
    // Clear the last paid date for this student
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
 * Get the last paid date for a student
 * @param {string} studentId - The student's ID
 * @returns {string|null} - Last paid date string or null
 */
export const getLastPaidDate = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
    const studentData = existingData[studentId] || { lastPaidDate: null };
    return studentData.lastPaidDate;
  } catch (error) {
    console.error('Error getting last paid date:', error);
    return null;
  }
};

/**
 * Clear all daily payment data (for testing/reset purposes)
 * @returns {boolean} - Success status
 */
export const clearAllDailyPaymentData = () => {
  try {
    localStorage.removeItem(DAILY_PAYMENTS_KEY);
    console.log('Cleared all daily payment data');
    return true;
  } catch (error) {
    console.error('Error clearing daily payment data:', error);
    return false;
  }
};

/**
 * Get all students with daily payment data
 * @returns {Object} - All daily payment data
 */
export const getAllDailyPaymentData = () => {
  try {
    return JSON.parse(localStorage.getItem(DAILY_PAYMENTS_KEY) || '{}');
  } catch (error) {
    console.error('Error getting all daily payment data:', error);
    return {};
  }
};

// Legacy functions for backward compatibility (simplified versions)
export const addScheduledWeekday = () => true; // No-op for compatibility
export const removeScheduledWeekday = () => true; // No-op for compatibility
export const getScheduledWeekdays = () => []; // No-op for compatibility
export const getScheduledDatesInMonth = () => []; // No-op for compatibility
export const getMonthlyPaymentCount = () => 0; // No-op for compatibility
export const isPaymentDueToday = (student) => !isTodayPaid(student.id); // Use simplified version
export const payDaily = (studentId, date) => payToday(studentId); // Use simplified version
export const unpayDaily = (studentId, date) => unpayToday(studentId); // Use simplified version
export const getPaymentSummary = () => ({ total: 0, paid: 0, remaining: 0, scheduledDates: [], paidDates: [] }); // No-op for compatibility
export const initializeDailyPaymentData = () => true; // No-op for compatibility
