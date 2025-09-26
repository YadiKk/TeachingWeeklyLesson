import React from 'react';
import { formatWeekRange } from '../utils/dateUtils';

const WeekControls = ({ 
  onNextWeek, 
  onPreviousWeek, 
  currentWeekStart, 
  weekStartDay, 
  onWeekStartDayChange 
}) => {
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Weekly Lesson Tracker
            </h2>
            <p className="text-sm text-gray-600">
              Current Week: {formatWeekRange(currentWeekStart)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onPreviousWeek}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous Week</span>
            </button>
            
            <button
              onClick={onNextWeek}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next Week</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <label className="text-sm font-medium text-gray-700">
              Week Start Day:
            </label>
            <select
              value={weekStartDay}
              onChange={(e) => onWeekStartDayChange(parseInt(e.target.value))}
              className="input-field w-40"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
            <p className="text-xs text-gray-500">
              New weeks will start from this day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekControls;
