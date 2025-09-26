import React from 'react';
import { formatCurrency } from '../utils/paymentUtils';

const PaymentSummary = ({ summary, currentMonth, currentYear }) => {
  const {
    totalStudents,
    paidStudents,
    unpaidStudents,
    totalExpectedRevenue,
    totalPaidRevenue,
    totalUnpaidRevenue,
    paymentRate
  } = summary;

  return (
    <div className="card">
      <h4 className="text-lg font-semibold text-gray-800 mb-3">
        {currentMonth}/{currentYear} Aylık Ödeme Özeti
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-blue-600">{totalStudents}</div>
          <div className="text-xs text-blue-800">Toplam</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-green-600">{paidStudents}</div>
          <div className="text-xs text-green-800">Ödendi</div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-red-600">{unpaidStudents}</div>
          <div className="text-xs text-red-800">Ödenmedi</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-xl font-bold text-purple-600">%{paymentRate}</div>
          <div className="text-xs text-purple-800">Oran</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(totalExpectedRevenue)}
          </div>
          <div className="text-xs text-gray-600">Beklenen</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-green-800">
            {formatCurrency(totalPaidRevenue)}
          </div>
          <div className="text-xs text-green-600">Tahsil</div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <div className="text-lg font-semibold text-red-800">
            {formatCurrency(totalUnpaidRevenue)}
          </div>
          <div className="text-xs text-red-600">Eksik</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;