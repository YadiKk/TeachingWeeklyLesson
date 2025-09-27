// Utility functions for managing student lesson times

// localStorage key for lesson times
const LESSON_TIMES_KEY = 'lesson_times_v1';

/**
 * Get lesson time for a student
 * @param {string} studentId - The student's ID
 * @returns {string} - Lesson time in HH:MM format, defaults to '09:00'
 */
export const getLessonTime = (studentId) => {
  try {
    const existingData = JSON.parse(localStorage.getItem(LESSON_TIMES_KEY) || '{}');
    return existingData[studentId] || '09:00';
  } catch (error) {
    console.error('Error getting lesson time:', error);
    return '09:00';
  }
};

/**
 * Set lesson time for a student
 * @param {string} studentId - The student's ID
 * @param {string} time - Lesson time in HH:MM format
 * @returns {boolean} - Success status
 */
export const setLessonTime = (studentId, time) => {
  try {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      console.error('Invalid time format:', time);
      return false;
    }
    
    const existingData = JSON.parse(localStorage.getItem(LESSON_TIMES_KEY) || '{}');
    existingData[studentId] = time;
    localStorage.setItem(LESSON_TIMES_KEY, JSON.stringify(existingData));
    
    console.log('Set lesson time for student:', { studentId, time });
    return true;
  } catch (error) {
    console.error('Error setting lesson time:', error);
    return false;
  }
};

/**
 * Clear all lesson times (for testing/reset purposes)
 * @returns {boolean} - Success status
 */
export const clearAllLessonTimes = () => {
  try {
    localStorage.removeItem(LESSON_TIMES_KEY);
    console.log('Cleared all lesson times');
    return true;
  } catch (error) {
    console.error('Error clearing lesson times:', error);
    return false;
  }
};

/**
 * Get all lesson times
 * @returns {Object} - All lesson times data
 */
export const getAllLessonTimes = () => {
  try {
    return JSON.parse(localStorage.getItem(LESSON_TIMES_KEY) || '{}');
  } catch (error) {
    console.error('Error getting all lesson times:', error);
    return {};
  }
};
