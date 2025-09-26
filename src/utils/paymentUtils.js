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

export const calculatePaymentAmount = (student, paymentType = null) => {
  const studentPaymentType = paymentType || student.paymentType || 'monthly';
  const amount = student.amount || 100;
  const currency = student.currency || 'TRY';
  const lessonsPerWeek = student.selectedDays?.length || 0;
  const weeksInMonth = 4.33; // Average weeks per month
  const totalLessons = Math.round(lessonsPerWeek * weeksInMonth);
  
  let calculatedAmount = amount;
  let displayText = '';
  
  if (studentPaymentType === 'daily') {
    // For daily payments, calculate monthly amount
    calculatedAmount = amount * totalLessons;
    displayText = `${amount} ${currency}/gün (${totalLessons} ders)`;
  } else {
    // For monthly payments
    calculatedAmount = amount;
    displayText = `${amount} ${currency}/ay`;
  }
  
  return {
    paymentType: studentPaymentType,
    amount: amount,
    currency: currency,
    calculatedAmount: calculatedAmount,
    displayText: displayText,
    lessonsPerWeek,
    totalLessons,
    lessonRate: lessonsPerWeek > 0 ? Math.round((calculatedAmount / totalLessons) * 100) / 100 : 0
  };
};

export const calculateStudentPaymentStatus = (student, monthlyPayments, currentMonth, currentYear) => {
  const monthlyPayment = monthlyPayments.find(
    payment => payment.studentId === student.id && 
               payment.month === currentMonth && 
               payment.year === currentYear
  );
  
  const paymentCalculation = calculatePaymentAmount(student);
  
  // For daily payments, check individual lesson payments
  let isPaid = false;
  let paidLessons = 0;
  let totalLessons = 0;
  
  if (student.paymentType === 'daily' && student.lessons) {
    // Filter lessons for current month
    const currentWeekStart = new Date(currentMonth, 0, 1);
    const nextMonthStart = new Date(currentMonth, 1, 1);
    
    const currentMonthLessons = student.lessons.filter(lesson => {
      const lessonDate = new Date(lesson.date);
      return lessonDate >= currentWeekStart && lessonDate < nextMonthStart;
    });
    
    totalLessons = currentMonthLessons.length;
    paidLessons = currentMonthLessons.filter(lesson => lesson.paid).length;
    isPaid = paidLessons === totalLessons && totalLessons > 0;
  } else {
    // For monthly payments, use the existing logic
    isPaid = !!monthlyPayment?.isPaid;
  }
  
  return {
    studentId: student.id,
    studentName: student.name,
    paymentType: paymentCalculation.paymentType,
    amount: paymentCalculation.amount,
    currency: paymentCalculation.currency,
    calculatedAmount: paymentCalculation.calculatedAmount,
    displayText: paymentCalculation.displayText,
    lessonsPerWeek: paymentCalculation.lessonsPerWeek,
    totalLessons: paymentCalculation.totalLessons,
    paidLessons: paidLessons,
    isPaid: isPaid,
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
  
  const totalExpectedRevenue = paymentStatuses.reduce((sum, status) => sum + status.calculatedAmount, 0);
  const totalPaidRevenue = paymentStatuses
    .filter(status => status.isPaid)
    .reduce((sum, status) => sum + status.calculatedAmount, 0);
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

export const formatCurrency = (amount, currency = 'TRY') => {
  const currencyMap = {
    'TRY': 'tr-TR',
    'RUB': 'ru-RU',
    'AZN': 'az-AZ',
    'USD': 'en-US'
  };
  
  const locale = currencyMap[currency] || 'tr-TR';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
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
