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
    <div className={`p-4 rounded-lg border-2 transition-all ${
      isPaid 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${
            isPaid ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <h3 className="text-lg font-semibold text-gray-900">
            {studentName}
          </h3>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(monthlyFee)}
          </div>
          <div className="text-sm text-gray-500">
            {lessonsPerWeek} ders/hafta
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
        <div>
          <span className="text-gray-600">Toplam Ders:</span>
          <span className="ml-2 font-medium">{totalLessons}</span>
        </div>
        <div>
          <span className="text-gray-600">Durum:</span>
          <span className={`ml-2 font-medium ${
            isPaid ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPaid ? 'Ödendi' : 'Ödenmedi'}
          </span>
        </div>
      </div>

      {isPaid && paymentDate && (
        <div className="text-sm text-gray-600 mb-3">
          <div>Ödeme Tarihi: {new Date(paymentDate).toLocaleDateString('tr-TR')}</div>
          {paymentMethod && <div>Ödeme Yöntemi: {paymentMethod}</div>}
          {notes && <div>Notlar: {notes}</div>}
        </div>
      )}

      <div className="flex space-x-2">
        {isPaid ? (
          <>
            <button
              onClick={() => onMarkAsUnpaid(paymentStatus.studentId)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Ödenmedi Olarak İşaretle
            </button>
            <button
              onClick={() => onEditPayment(paymentStatus)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Düzenle
            </button>
          </>
        ) : (
          <button
            onClick={() => onMarkAsPaid(paymentStatus.studentId)}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Ödendi Olarak İşaretle
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
