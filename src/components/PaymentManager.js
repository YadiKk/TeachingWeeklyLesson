import React, { useState, useEffect, useMemo } from 'react';
import { 
  subscribeToMonthlyPayments, 
  createMonthlyPayment, 
  updateMonthlyPayment 
} from '../firebase/paymentService';
import { updateStudent } from '../firebase/lessonService';
import { 
  getCurrentMonthYear, 
  getPaymentSummary, 
  calculateStudentPaymentStatus,
  formatCurrency
} from '../utils/paymentUtils';
import { getWeekStart, getLessonsForWeek } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';
import PaymentSummary from './PaymentSummary';
import PaymentStatus from './PaymentStatus';
import PaymentModal from './PaymentModal';

const PaymentManager = ({ students, currentGroup, weekStartDay = 1, currentWeekStart }) => {
  const { t } = useLanguage();
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
      alert(t('errorUpdatingLesson') + ': ' + error.message);
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
      alert(t('errorUpdatingLesson') + ': ' + error.message);
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
      alert(t('errorUpdatingLesson') + ': ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDailyPaymentToggle = async (studentId, lessonId) => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      const updatedLessons = student.lessons.map(lesson =>
        lesson.id === lessonId
          ? { ...lesson, paid: !lesson.paid }
          : lesson
      );
      
      // Update the student with the new lessons array
      await updateStudent(studentId, { lessons: updatedLessons });
    } catch (error) {
      console.error('Error toggling daily payment:', error);
      alert(t('errorUpdatingLesson') + ': ' + error.message);
    }
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: t('january') },
      { value: 2, label: t('february') },
      { value: 3, label: t('march') },
      { value: 4, label: t('april') },
      { value: 5, label: t('may') },
      { value: 6, label: t('june') },
      { value: 7, label: t('july') },
      { value: 8, label: t('august') },
      { value: 9, label: t('september') },
      { value: 10, label: t('october') },
      { value: 11, label: t('november') },
      { value: 12, label: t('december') }
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
        <p className="text-gray-500">{t('pleaseJoinGroupFirst')}</p>
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
                  {t('monthlyPaymentManagement')}
                </h3>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                {t('monthYear')}:
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
              {t('monthlyPaymentStudents')}
            </h4>
            
            {monthlyPaymentStatuses.length === 0 ? (
              <div className="card text-center">
                <p className="text-gray-500 text-sm">{t('noMonthlyStudentsThisMonth')}</p>
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

      {/* Daily Payment Management */}
      {dailyStudents.length > 0 && (
        <div className="space-y-4">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800">
              {t('dailyPaymentManagement')}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {t('dailyPaymentStudentsDescription')}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-md font-semibold text-gray-800">
              {t('dailyPaymentStudents')}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {dailyStudents.map((student) => {
                const currentWeekLessons = getLessonsForWeek(student, currentWeekStart, weekStartDay);
                
                const paidLessons = currentWeekLessons.filter(lesson => lesson.paid).length;
                const totalLessons = currentWeekLessons.length;
                const totalAmount = totalLessons * (student.amount || 0);
                const paidAmount = paidLessons * (student.amount || 0);
                
                return (
                  <div key={student.id} className="card border-2 border-gray-200 hover:border-blue-300 transition-colors">
                    {/* Header with student info */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-semibold text-gray-900 text-lg">{student.name}</h5>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(student.amount || 0, student.currency || 'TRY')}{t('perLesson')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{paidLessons}/{totalLessons}</div>
                        <div className="text-xs text-gray-500">{t('lessonsPaid')}</div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">{t('totalAmount')}:</div>
                          <div className="font-semibold text-gray-900">{formatCurrency(totalAmount, student.currency || 'TRY')}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">{t('paid')}:</div>
                          <div className="font-semibold text-green-600">{formatCurrency(paidAmount, student.currency || 'TRY')}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">{t('remaining')}:</div>
                          <div className="font-semibold text-red-600">{formatCurrency(totalAmount - paidAmount, student.currency || 'TRY')}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">{t('progress')}:</div>
                          <div className="font-semibold text-blue-600">%{totalLessons > 0 ? Math.round((paidLessons / totalLessons) * 100) : 0}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{t('paymentProgress')}</span>
                        <span>{paidLessons}/{totalLessons} {t('lessons')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${totalLessons > 0 ? (paidLessons / totalLessons) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Daily Payment Buttons */}
                    <div className="space-y-3">
                      <h6 className="text-sm font-semibold text-gray-800 text-center">{t('thisWeeksLessons')}</h6>
                      <div className="grid grid-cols-2 gap-2">
                        {currentWeekLessons.map((lesson) => {
                          const lessonDate = new Date(lesson.date);
                          const dayName = lessonDate.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNumber = lessonDate.getDate();
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => handleDailyPaymentToggle(student.id, lesson.id)}
                              className={`px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                                lesson.paid
                                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700 border-2 border-gray-300 hover:border-blue-400'
                              }`}
                              title={lesson.paid ? t('paidClickToCancel') : t('notPaidClickToPay')}
                            >
                              <div className="font-bold">{dayName}</div>
                              <div className="text-xs">{dayNumber}</div>
                              <div className="text-lg">{lesson.paid ? '✓' : '○'}</div>
                            </button>
                          );
                        })}
                      </div>
                      
                      {currentWeekLessons.length === 0 && (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          {t('noLessonsThisWeek')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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