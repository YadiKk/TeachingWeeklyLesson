// Payment calculation and utility functions

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1, // 1-12
    year: now.getFullYear(),
    monthName: now.toLocaleDateString('tr-TR', { month: 'long' }),
    yearMonth: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  };
};

export const getMonthYearString = (month, year) => {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
};

export const calculateMonthlyFee = (student, monthlyRate = null) => {
  // Use custom monthly fee if provided, otherwise calculate based on lessons
  const customFee = student.monthlyFee || monthlyRate || 100;
  const lessonsPerWeek = student.selectedDays?.length || 0;
  const weeksInMonth = 4.33; // Average weeks per month
  
  return {
    monthlyRate: customFee,
    lessonsPerWeek,
    totalLessons: Math.round(lessonsPerWeek * weeksInMonth),
    calculatedFee: customFee,
    lessonRate: lessonsPerWeek > 0 ? Math.round((customFee / (lessonsPerWeek * weeksInMonth)) * 100) / 100 : 0
  };
};

export const calculateStudentPaymentStatus = (student, monthlyPayments, currentMonth, currentYear) => {
  const monthlyPayment = monthlyPayments.find(
    payment => payment.studentId === student.id && 
               payment.month === currentMonth && 
               payment.year === currentYear
  );
  
  const feeCalculation = calculateMonthlyFee(student);
  
  return {
    studentId: student.id,
    studentName: student.name,
    monthlyFee: feeCalculation.calculatedFee,
    lessonsPerWeek: feeCalculation.lessonsPerWeek,
    totalLessons: feeCalculation.totalLessons,
    isPaid: !!monthlyPayment?.isPaid,
    paymentDate: monthlyPayment?.paymentDate || null,
    paymentMethod: monthlyPayment?.paymentMethod || null,
    notes: monthlyPayment?.notes || '',
    monthlyPaymentId: monthlyPayment?.id || null
  };
};

export const getPaymentSummary = (students, monthlyPayments, currentMonth, currentYear) => {
  const paymentStatuses = students.map(student => 
    calculateStudentPaymentStatus(student, monthlyPayments, currentMonth, currentYear)
  );
  
  const totalStudents = students.length;
  const paidStudents = paymentStatuses.filter(status => status.isPaid).length;
  const unpaidStudents = totalStudents - paidStudents;
  
  const totalExpectedRevenue = paymentStatuses.reduce((sum, status) => sum + status.monthlyFee, 0);
  const totalPaidRevenue = paymentStatuses
    .filter(status => status.isPaid)
    .reduce((sum, status) => sum + status.monthlyFee, 0);
  const totalUnpaidRevenue = totalExpectedRevenue - totalPaidRevenue;
  
  return {
    totalStudents,
    paidStudents,
    unpaidStudents,
    totalExpectedRevenue,
    totalPaidRevenue,
    totalUnpaidRevenue,
    paymentRate: totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0,
    paymentStatuses
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(amount);
};

export const getPaymentHistory = (monthlyPayments) => {
  // Group payments by month/year
  const history = {};
  
  monthlyPayments.forEach(payment => {
    const key = `${payment.year}-${String(payment.month).padStart(2, '0')}`;
    if (!history[key]) {
      history[key] = {
        month: payment.month,
        year: payment.year,
        monthName: getMonthYearString(payment.month, payment.year),
        payments: [],
        totalPaid: 0,
        totalStudents: 0
      };
    }
    
    history[key].payments.push(payment);
    if (payment.isPaid) {
      history[key].totalPaid += payment.monthlyFee || 0;
    }
    history[key].totalStudents++;
  });
  
  return Object.values(history).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
};
