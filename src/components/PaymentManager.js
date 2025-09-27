import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToMonthlyPayments, 
  createMonthlyPayment, 
  updateMonthlyPayment 
} from '../firebase/paymentService';
import { 
  getCurrentMonthYear, 
  getPaymentSummary, 
  calculateStudentPaymentStatus,
  formatCurrency
} from '../utils/paymentUtils';
import { 
  isTodayPaid,
  payToday,
  unpayToday,
  getPaymentCounter,
  getTodaysPaymentStudents,
  getMissedPaymentStudents,
  getLessonTimeForDay
} from '../utils/dailyPaymentAdvanced';
import { useTranslation } from 'react-i18next';
import PaymentSummary from './PaymentSummary';
import PaymentStatus from './PaymentStatus';
import PaymentModal from './PaymentModal';

const PaymentManager = ({ students, currentGroup, weekStartDay = 1, currentWeekStart }) => {
  const { t } = useTranslation();
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear().month);
  const [selectedYear, setSelectedYear] = useState(getCurrentMonthYear().year);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Separate students by payment type
  const monthlyStudents = useMemo(() => 
    students.filter(student => student.paymentType === 'monthly'), 
    [students]
  );
  const dailyStudents = useMemo(() => 
    students.filter(student => student.paymentType === 'daily'), 
    [students]
  );

  const monthlyPaymentStatuses = monthlyStudents.map(student => 
    calculateStudentPaymentStatus(student, monthlyPayments, selectedMonth, selectedYear)
  );

  const monthlyPaymentSummary = getPaymentSummary(monthlyStudents, monthlyPayments, selectedMonth, selectedYear);

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
          monthlyFee: calculateStudentPaymentStatus(student, [], selectedMonth, selectedYear).calculatedAmount
        });
      }
    } catch (error) {
      console.error('Error marking as paid:', error);
      alert(t('errors.errorUpdatingLesson') + ': ' + error.message);
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
      alert(t('errors.errorUpdatingLesson') + ': ' + error.message);
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
          monthlyFee: calculateStudentPaymentStatus(student, [], selectedMonth, selectedYear).calculatedAmount
        });
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      alert(t('errors.errorUpdatingLesson') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyPaymentToggle = async (studentId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      // Check if today is already paid
      const isPaid = isTodayPaid(studentId);
      
      if (isPaid) {
        // Unmark as paid
        const success = unpayToday(studentId);
        if (success) {
          console.log('Unmarked today as paid for student:', studentId);
        }
      } else {
        // Mark as paid
        const success = payToday(studentId);
        if (success) {
          console.log('Marked today as paid for student:', studentId);
        }
      }
      
      // Force re-render by updating the selected month state
      setSelectedMonth(prev => prev);
    } catch (error) {
      console.error('Error toggling daily payment:', error);
      alert(t('errors.errorUpdatingLesson') + ': ' + error.message);
    }
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: t('months.january') },
      { value: 2, label: t('months.february') },
      { value: 3, label: t('months.march') },
      { value: 4, label: t('months.april') },
      { value: 5, label: t('months.may') },
      { value: 6, label: t('months.june') },
      { value: 7, label: t('months.july') },
      { value: 8, label: t('months.august') },
      { value: 9, label: t('months.september') },
      { value: 10, label: t('months.october') },
      { value: 11, label: t('months.november') },
      { value: 12, label: t('months.december') }
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
      <div className="card text-center">
        <p className="text-gray-500">{t('app.pleaseJoinGroupFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Payment Management */}
      {monthlyStudents.length > 0 && (
        <div className="space-y-4">
          {/* Month/Year Selector */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {t('payments.monthlyPaymentManagement')}
                </h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                {t('payments.monthYear')}:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="input w-32"
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
                className="input w-24"
              >
                {generateYearOptions().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

          {/* Payment Summary */}
          <PaymentSummary 
            summary={monthlyPaymentSummary} 
            currentMonth={selectedMonth} 
            currentYear={selectedYear} 
          />

          {/* Payment Status List */}
          <div className="space-y-3">
            <h4 className="text-md font-semibold text-gray-800">
              {t('payments.monthlyPaymentStudents')}
            </h4>
            
            {monthlyPaymentStatuses.length === 0 ? (
              <div className="card text-center">
                <p className="text-gray-500 text-sm">{t('payments.noMonthlyStudentsThisMonth')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {monthlyPaymentStatuses.map((paymentStatus) => (
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
        </div>
      )}

      {/* Daily Payment Management - Today's Students Only */}
      {(() => {
        const todaysStudents = getTodaysPaymentStudents(dailyStudents);
        const missedStudents = getMissedPaymentStudents(dailyStudents);
        
        return (
          <div className="space-y-4">
            {/* Today's Daily Payment Students */}
            {todaysStudents.length > 0 && (
              <div className="space-y-3">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('payments.todaysDailyPayments')}
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    {t('payments.todaysDailyPaymentsDescription')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {todaysStudents.map((student) => {
                    // Check if today's payment is paid
                    const isPaid = isTodayPaid(student.id);
                    const paymentCounter = getPaymentCounter(student.id);
                    const todaysTime = getLessonTimeForDay(student.id, new Date().getDay());
                    
                    return (
                      <div key={student.id} className="card border-2 border-gray-200 hover:border-blue-300 transition-colors relative">
                        {/* Payment Counter in top-right corner */}
                        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">
                          {paymentCounter.paid}/{paymentCounter.total}
                        </div>
                        
                        {/* Header with student info */}
                        <div className="flex justify-between items-start mb-4 pr-16">
                          <div>
                            <h5 className="font-semibold text-gray-900 text-lg">{student.name}</h5>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(student.amount || 0, student.currency || 'TRY')}{t('payments.perLesson')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t('payments.lessonTime')}: {todaysTime}
                            </p>
                          </div>
                        </div>

                        {/* Simple Daily Payment Section */}
                        <div className="text-center">
                          <div className="mb-4">
                            <h6 className="text-sm font-semibold text-gray-800 mb-2">
                              {t('payments.dailyPayment')}
                            </h6>
                            <div className="text-xs text-gray-600 mb-3">
                              {new Date().toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                          
                          {/* Pay Button or Checkmark */}
                          <button
                            onClick={() => handleDailyPaymentToggle(student.id)}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                              isPaid
                                ? 'bg-green-500 text-white hover:bg-green-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title={
                              isPaid 
                                ? t('lessons.paidClickToCancel')
                                : t('lessons.notPaidClickToPay')
                            }
                          >
                            {isPaid ? (
                              <div className="flex items-center justify-center space-x-2">
                                <span className="text-xl">✅</span>
                                <span>{t('lessons.paid')}</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center space-x-2">
                                <span className="text-xl">💳</span>
                                <span>{t('lessons.pay')}</span>
                              </div>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Missed Payments Section */}
            {missedStudents.length > 0 && (
              <div className="space-y-3">
                <div className="card bg-red-50 border-red-200">
                  <h3 className="text-lg font-semibold text-red-800">
                    {t('payments.missedPayments')}
                  </h3>
                  <p className="text-sm text-red-600 mt-2">
                    {t('payments.missedPaymentsDescription')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {missedStudents.map((student) => {
                    const paymentCounter = getPaymentCounter(student.id);
                    
                    return (
                      <div key={student.id} className="card border-2 border-red-200 bg-red-50 hover:border-red-300 transition-colors relative">
                        {/* Payment Counter in top-right corner */}
                        <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full">
                          {paymentCounter.paid}/{paymentCounter.total}
                        </div>
                        
                        {/* Header with student info */}
                        <div className="flex justify-between items-start mb-4 pr-16">
                          <div>
                            <h5 className="font-semibold text-red-900 text-lg">{student.name}</h5>
                            <p className="text-sm text-red-600">
                              {formatCurrency(student.amount || 0, student.currency || 'TRY')}{t('payments.perLesson')}
                            </p>
                            <p className="text-xs text-red-500 mt-1">
                              {t('payments.missedOn')}: {student.missedDayName}
                            </p>
                          </div>
                        </div>

                        {/* Missed Payment Notice */}
                        <div className="text-center">
                          <div className="mb-4">
                            <h6 className="text-sm font-semibold text-red-800 mb-2">
                              {t('payments.missedPayment')}
                            </h6>
                            <div className="text-xs text-red-600 mb-3">
                              {new Date(student.missedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                          
                          {/* Mark as Paid Button */}
                          <button
                            onClick={() => handleDailyPaymentToggle(student.id)}
                            className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-orange-500 text-white hover:bg-orange-600"
                            title={t('payments.markAsPaid')}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-xl">⚠️</span>
                              <span>{t('payments.markAsPaid')}</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No Daily Students Today */}
            {todaysStudents.length === 0 && missedStudents.length === 0 && dailyStudents.length > 0 && (
              <div className="card text-center">
                <p className="text-gray-500">{t('payments.noDailyStudentsToday')}</p>
              </div>
            )}
          </div>
        );
      })()}

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
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span>İşleniyor...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManager;