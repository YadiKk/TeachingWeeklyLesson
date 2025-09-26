import React from 'react';
import { formatWeekRange } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';

const WeekControls = ({ 
  onNextWeek, 
  onPreviousWeek, 
  currentWeekStart, 
  weekStartDay, 
  onWeekStartDayChange 
}) => {
  const { t } = useLanguage();
  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {t('weeklyLessonTracking')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('thisWeek')}: {formatWeekRange(currentWeekStart)}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onPreviousWeek}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Önceki</span>
          </button>
          
          <button
            onClick={onNextWeek}
            className="btn btn-primary flex items-center space-x-2"
          >
            <span>Sonraki</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <label className="text-sm font-medium text-gray-700">
            {t('weekStart')}:
          </label>
          <select
            value={weekStartDay}
            onChange={(e) => onWeekStartDayChange(parseInt(e.target.value))}
            className="input w-40"
          >
            <option value={0}>{t('sunday')}</option>
            <option value={1}>{t('monday')}</option>
            <option value={2}>{t('tuesday')}</option>
            <option value={3}>{t('wednesday')}</option>
            <option value={4}>{t('thursday')}</option>
            <option value={5}>{t('friday')}</option>
            <option value={6}>{t('saturday')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default WeekControls;