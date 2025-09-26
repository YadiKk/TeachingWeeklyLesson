import React from 'react';
import { formatDate, formatTime } from '../utils/dateUtils';
import { formatCurrency } from '../utils/paymentUtils';
import TimeSelector from './TimeSelector';
import LessonStatusSelector from './LessonStatusSelector';
import { useLanguage } from '../contexts/LanguageContext';

const WeeklyView = ({ weeklyView, student, onToggleLesson, onUpdateLessonTime, onToggleLessonCancellation, onLessonStatusChange, onToggleLessonPayment }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <h4 className="text-md font-medium text-gray-700">{t('thisWeeksSchedule')}</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-2">
        {weeklyView.map((dayData) => (
          <div
            key={dayData.dayOfWeek}
            className={`p-3 rounded-lg border transition-colors ${
              dayData.hasLesson
                ? dayData.lesson.cancelled 
                  ? 'status-cancelled' 
                  : dayData.lesson.completed
                  ? 'status-completed'
                  : 'status-pending'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="text-sm font-medium text-gray-900 mb-1">
                {dayData.dayName}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {formatDate(dayData.date)}
              </div>
              
              {dayData.hasLesson ? (
                <div className="space-y-2">
                  <LessonStatusSelector
                    lesson={dayData.lesson}
                    onStatusChange={(status) => onLessonStatusChange(dayData.lesson.id, status)}
                  />
                  
                  <div className="text-xs">
                    <div className={`font-medium ${
                      dayData.lesson.cancelled ? 'text-red-600 line-through' : 'text-gray-900'
                    }`}>
                      {dayData.lesson.cancelled ? t('cancelled') : t('scheduled')}
                    </div>
                  </div>
                  
                  <TimeSelector
                    value={formatTime(dayData.lesson.time)}
                    onChange={onUpdateLessonTime}
                    lessonId={dayData.lesson.id}
                  />
                  
                  {/* Daily Payment Status */}
                  {student?.paymentType === 'daily' && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">
                          {formatCurrency(student.amount || 0, student.currency || 'TRY')}
                        </span>
                        <button
                          onClick={() => {
                            if (onToggleLessonPayment) {
                              onToggleLessonPayment(dayData.lesson.id);
                            }
                          }}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            dayData.lesson.paid 
                              ? 'bg-green-500 text-white hover:bg-green-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                          }`}
                          title={dayData.lesson.paid ? t('paidClickToCancel') : t('notPaidClickToPay')}
                        >
                          {dayData.lesson.paid ? '✓ ' + t('paid') : t('pay')}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        {dayData.lesson.paid ? t('paymentCompleted') : t('paymentPending')}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic">
                  {t('noLesson')}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyView;