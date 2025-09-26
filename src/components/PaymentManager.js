import React, { useState, useEffect } from 'react';
import { 
  subscribeToMonthlyPayments, 
  createMonthlyPayment, 
  updateMonthlyPayment 
} from '../firebase/paymentService';
import { 
  getCurrentMonthYear, 
  getPaymentSummary, 
  calculateStudentPaymentStatus 
} from '../utils/paymentUtils';
import PaymentSummary from './PaymentSummary';
import PaymentStatus from './PaymentStatus';
import PaymentModal from './PaymentModal';

const PaymentManager = ({ students, currentGroup }) => {
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear().month);
  const [selectedYear, setSelectedYear] = useState(getCurrentMonthYear().year);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  // Subscribe to monthly payments for current month/year
  useEffect(() => {
    if (!currentGroup) return;

    const unsubscribe = subscribeToMonthlyPayments(
      currentGroup, 
      selectedMonth, 
      selectedYear, 
      (payments) => {
        setMonthlyPayments(payments);
      }
    );

    return unsubscribe;
  }, [currentGroup, selectedMonth, selectedYear]);

  // Calculate payment statuses for all students
  const paymentStatuses = students.map(student => 
    calculateStudentPaymentStatus(student, monthlyPayments, selectedMonth, selectedYear)
  );

  const paymentSummary = getPaymentSummary(students, monthlyPayments, selectedMonth, selectedYear);

  const handleMarkAsPaid = async (studentId) => {
    setLoading(true);
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const existingPayment = monthlyPayments.find(
        p => p.studentId === studentId && p.month === selectedMonth && p.year === selectedYear
      );

      if (existingPayment) {
        await updateMonthlyPayment(existingPayment.id, {
          isPaid: true,
          paymentDate: new Date().toISOString()
        });
      } else {
        await createMonthlyPayment(currentGroup, studentId, selectedMonth, selectedYear, {
          isPaid: true,
          paymentDate: new Date().toISOString(),
          monthlyFee: calculateStudentPaymentStatus(student, [], selectedMonth, selectedYear).monthlyFee
        });
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert('Ödeme işaretlenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUnpaid = async (studentId) => {
    setLoading(true);
    try {
      const existingPayment = monthlyPayments.find(
        p => p.studentId === studentId && p.month === selectedMonth && p.year === selectedYear
      );

      if (existingPayment) {
        await updateMonthlyPayment(existingPayment.id, {
          isPaid: false,
          paymentDate: null
        });
      }
    } catch (error) {
      console.error('Error marking as unpaid:', error);
      alert('Ödeme durumu güncellenirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPayment = (paymentStatus) => {
    setSelectedPayment(paymentStatus);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (studentId, paymentData) => {
    setLoading(true);
    try {
      const existingPayment = monthlyPayments.find(
        p => p.studentId === studentId && p.month === selectedMonth && p.year === selectedYear
      );

      if (existingPayment) {
        await updateMonthlyPayment(existingPayment.id, {
          isPaid: true,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes
        });
      } else {
        const student = students.find(s => s.id === studentId);
        await createMonthlyPayment(currentGroup, studentId, selectedMonth, selectedYear, {
          isPaid: true,
          paymentDate: paymentData.paymentDate,
          paymentMethod: paymentData.paymentMethod,
          notes: paymentData.notes,
          monthlyFee: calculateStudentPaymentStatus(student, [], selectedMonth, selectedYear).monthlyFee
        });
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Ödeme kaydedilirken hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: 'Ocak' },
      { value: 2, label: 'Şubat' },
      { value: 3, label: 'Mart' },
      { value: 4, label: 'Nisan' },
      { value: 5, label: 'Mayıs' },
      { value: 6, label: 'Haziran' },
      { value: 7, label: 'Temmuz' },
      { value: 8, label: 'Ağustos' },
      { value: 9, label: 'Eylül' },
      { value: 10, label: 'Ekim' },
      { value: 11, label: 'Kasım' },
      { value: 12, label: 'Aralık' }
    ];
    return months;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      years.push(i);
    }
    return years;
  };

  if (!currentGroup) {
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500">Önce bir gruba katılın veya grup oluşturun.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Ay/Yıl Seçin:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input-field w-32"
          >
            {generateMonthOptions().map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input-field w-24"
          >
            {generateYearOptions().map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment Summary */}
      <PaymentSummary 
        summary={paymentSummary} 
        currentMonth={selectedMonth} 
        currentYear={selectedYear} 
      />

      {/* Payment Status List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Öğrenci Ödeme Durumları
        </h3>
        
        {paymentStatuses.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-500">Bu ay için öğrenci bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {paymentStatuses.map((paymentStatus) => (
              <PaymentStatus
                key={paymentStatus.studentId}
                paymentStatus={paymentStatus}
                onMarkAsPaid={handleMarkAsPaid}
                onMarkAsUnpaid={handleMarkAsUnpaid}
                onEditPayment={handleEditPayment}
              />
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentStatus={selectedPayment}
        onSavePayment={handleSavePayment}
      />

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              <span>İşleniyor...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;
