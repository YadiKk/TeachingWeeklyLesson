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
    <div className="card p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {currentMonth}/{currentYear} Aylık Ödeme Özeti
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
          <div className="text-sm text-blue-800">Toplam Öğrenci</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{paidStudents}</div>
          <div className="text-sm text-green-800">Ödeme Yapan</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{unpaidStudents}</div>
          <div className="text-sm text-red-800">Ödeme Yapmayan</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">%{paymentRate}</div>
          <div className="text-sm text-purple-800">Ödeme Oranı</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(totalExpectedRevenue)}
          </div>
          <div className="text-sm text-gray-600">Beklenen Toplam Gelir</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-green-800">
            {formatCurrency(totalPaidRevenue)}
          </div>
          <div className="text-sm text-green-600">Tahsil Edilen Gelir</div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-red-800">
            {formatCurrency(totalUnpaidRevenue)}
          </div>
          <div className="text-sm text-red-600">Tahsil Edilmeyen Gelir</div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
