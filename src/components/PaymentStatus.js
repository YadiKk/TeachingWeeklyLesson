import React from 'react';
import { formatCurrency } from '../utils/paymentUtils';

const PaymentStatus = ({ paymentStatus, onMarkAsPaid, onMarkAsUnpaid, onEditPayment }) => {
  const { 
    studentName, 
    monthlyFee, 
    lessonsPerWeek, 
    totalLessons, 
    isPaid, 
    paymentDate, 
    paymentMethod, 
    notes 
  } = paymentStatus;

  return (
    <div className={`p-3 rounded-lg border-2 transition-all ${
      isPaid 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
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
            {formatCurrency(monthlyFee)}
          </div>
          <div className="text-xs text-gray-500">
            {lessonsPerWeek} ders/hafta
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2 text-xs">
        <span className="text-gray-600">
          {totalLessons} ders • {isPaid ? 'Ödendi' : 'Ödenmedi'}
        </span>
        {isPaid && paymentDate && (
          <span className="text-gray-500">
            {new Date(paymentDate).toLocaleDateString('tr-TR')}
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
              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              İptal
            </button>
            <button
              onClick={() => onEditPayment(paymentStatus)}
              className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Düzenle
            </button>
          </>
        ) : (
          <button
            onClick={() => onMarkAsPaid(paymentStatus.studentId)}
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Ödendi
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
