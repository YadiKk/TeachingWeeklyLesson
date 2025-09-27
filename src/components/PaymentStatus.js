import React from 'react';
import { formatCurrency } from '../utils/paymentUtils';
import { useTranslation } from 'react-i18next';

const PaymentStatus = ({ paymentStatus, onMarkAsPaid, onMarkAsUnpaid, onEditPayment }) => {
  const { t } = useTranslation();
  const { 
    studentName, 
    paymentType,
    currency,
    calculatedAmount,
    displayText,
    totalLessons,
    paidLessons,
    isPaid, 
    paymentDate, 
    paymentMethod, 
    notes 
  } = paymentStatus;

  return (
    <div className={`p-3 rounded-lg border-2 transition-all ${
      isPaid 
        ? 'status-paid' 
        : 'status-unpaid'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isPaid ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <h4 className="text-sm font-semibold text-gray-900">
            {studentName}
          </h4>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">
            {formatCurrency(calculatedAmount, currency)}
          </div>
          <div className="text-xs text-gray-500">
            {displayText}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-gray-600">
          {paymentType === 'daily' 
            ? `${paidLessons || 0}/${totalLessons} ${t('payments.lessonsPaid')}` 
            : `${totalLessons} ${t('payments.lessons')} • ${isPaid ? t('payments.paid') : t('lessons.notPaid')}`
          }
        </span>
        {isPaid && paymentDate && (
          <span className="text-gray-500">
            {new Date(paymentDate).toLocaleDateString('en-US')}
          </span>
        )}
      </div>

      {isPaid && (paymentMethod || notes) && (
        <div className="text-xs text-gray-600 mb-2">
          {paymentMethod && <span>{paymentMethod}</span>}
          {notes && <span className="ml-2">• {notes}</span>}
        </div>
      )}

      <div className="flex space-x-1">
        {isPaid ? (
          <>
            <button
              onClick={() => onMarkAsUnpaid(paymentStatus.studentId)}
              className="btn btn-danger text-xs px-2 py-1"
            >
              {t('forms.cancel')}
            </button>
            <button
              onClick={() => onEditPayment(paymentStatus)}
              className="btn btn-primary text-xs px-2 py-1"
            >
              {t('forms.edit')}
            </button>
          </>
        ) : (
          <button
            onClick={() => onMarkAsPaid(paymentStatus.studentId)}
            className="btn btn-success text-xs px-2 py-1"
          >
            {t('payments.paid')}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;