import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const translations = {
    en: {
      // App.js
      'lessonTrackingSystem': 'Lesson Tracking System',
      'studentLessonsAndPaymentManagement': 'Student lessons and payment management',
      'students': 'students',
      'cancelled': 'cancelled',
      'noStudentsYet': 'No Students Yet',
      'startByAddingFirstStudent': 'Start by adding your first student.',
      'monthlyPaymentStudents': 'Monthly Payment Students',
      'dailyPaymentStudents': 'Daily Payment Students',
      'pleaseJoinGroupFirst': 'Please join a group or create a group first',
      'errorAddingStudent': 'Error adding student',
      'areYouSureDeleteStudent': 'Are you sure you want to delete this student?',
      'errorDeletingStudent': 'Error deleting student',
      'errorUpdatingLesson': 'Error updating lesson',
      'errorUpdatingLessonTime': 'Error updating lesson time',
      'errorUpdatingLessonCancellation': 'Error updating lesson cancellation status',
      'errorChangingLessonStatus': 'Error changing lesson status',
      'errorRestoringLesson': 'Error restoring lesson',
      'errorUpdatingWeek': 'Error updating week',
      'errorUpdatingWeekStartDay': 'Error updating week start day',
      
      // DaySelector.js
      'selectLessonDays': 'Select Lesson Days',
      'daysSelected': 'days selected',
      
      // AddStudentForm.js
      'addNewStudent': 'Add New Student',
      'studentName': 'Student Name',
      'enterStudentName': 'Enter student name',
      'paymentType': 'Payment Type',
      'monthly': 'Monthly',
      'daily': 'Daily',
      'amount': 'Amount',
      'currency': 'Currency',
      'turkishLira': 'TRY (Turkish Lira)',
      'ruble': 'RUB (Ruble)',
      'manat': 'AZN (Manat)',
      'dollar': 'USD (Dollar)',
      'addStudent': 'Add Student',
      
      // StudentCard.js
      'weeklyLessonCount': 'Weekly lesson count',
      'delete': 'Delete',
      
      // WeeklyView.js
      'thisWeeksSchedule': 'This Week\'s Schedule',
      'cancelled': 'Cancelled',
      'scheduled': 'Scheduled',
      'paidClickToCancel': 'Paid - Click to cancel',
      'notPaidClickToPay': 'Not paid - Click to pay',
      'paid': 'Paid',
      'pay': 'Pay',
      'paymentCompleted': 'Payment completed',
      'paymentPending': 'Payment pending',
      'noLesson': 'No lesson',
      
      // PaymentManager.js
      'monthlyPaymentManagement': 'Monthly Payment Management',
      'monthYear': 'Month/Year',
      'monthlyPaymentStudents': 'Monthly Payment Students',
      'noMonthlyStudentsThisMonth': 'No monthly payment students found for this month.',
      'dailyPaymentManagement': 'Daily Payment Management',
      'dailyPaymentStudentsDescription': 'Daily payment students are tracked on a per-lesson basis.',
      'dailyPaymentStudents': 'Daily Payment Students',
      'thisWeeksLessons': 'This Week\'s Lessons - Payment Buttons',
      'noLessonsThisWeek': 'No lessons this week',
      'lessonsPaid': 'lessons paid',
      'totalAmount': 'Total Amount',
      'paid': 'Paid',
      'remaining': 'Remaining',
      'progress': 'Progress',
      'paymentProgress': 'Payment Progress',
      'lessons': 'lessons',
      'perLesson': '/lesson',
      
      // Days of week
      'sunday': 'Sunday',
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      
      // Months
      'january': 'January',
      'february': 'February',
      'march': 'March',
      'april': 'April',
      'may': 'May',
      'june': 'June',
      'july': 'July',
      'august': 'August',
      'september': 'September',
      'october': 'October',
      'november': 'November',
      'december': 'December',
      
      // Additional PaymentManager translations
      'noMonthlyStudentsThisMonth': 'No monthly payment students found for this month.',
      'dailyPaymentStudentsDescription': 'Daily payment students are tracked on a per-lesson basis.',
      'noLessonsThisWeek': 'No lessons this week',
      
      // PaymentStatus.js
      'notPaid': 'Not paid',
      'cancel': 'Cancel',
      'edit': 'Edit',
      
      // WeekControls.js
      'weeklyLessonTracking': 'Weekly Lesson Tracking',
      'thisWeek': 'This Week',
      'weekStart': 'Week Start'
    },
    ru: {
      // App.js
      'lessonTrackingSystem': 'Система отслеживания уроков',
      'studentLessonsAndPaymentManagement': 'Управление уроками и платежами студентов',
      'students': 'студентов',
      'cancelled': 'отменено',
      'noStudentsYet': 'Пока нет студентов',
      'startByAddingFirstStudent': 'Начните с добавления первого студента.',
      'monthlyPaymentStudents': 'Студенты с месячной оплатой',
      'dailyPaymentStudents': 'Студенты с ежедневной оплатой',
      'pleaseJoinGroupFirst': 'Пожалуйста, присоединитесь к группе или создайте группу',
      'errorAddingStudent': 'Ошибка добавления студента',
      'areYouSureDeleteStudent': 'Вы уверены, что хотите удалить этого студента?',
      'errorDeletingStudent': 'Ошибка удаления студента',
      'errorUpdatingLesson': 'Ошибка обновления урока',
      'errorUpdatingLessonTime': 'Ошибка обновления времени урока',
      'errorUpdatingLessonCancellation': 'Ошибка обновления статуса отмены урока',
      'errorChangingLessonStatus': 'Ошибка изменения статуса урока',
      'errorRestoringLesson': 'Ошибка восстановления урока',
      'errorUpdatingWeek': 'Ошибка обновления недели',
      'errorUpdatingWeekStartDay': 'Ошибка обновления дня начала недели',
      
      // DaySelector.js
      'selectLessonDays': 'Выберите дни уроков',
      'daysSelected': 'дней выбрано',
      
      // AddStudentForm.js
      'addNewStudent': 'Добавить нового студента',
      'studentName': 'Имя студента',
      'enterStudentName': 'Введите имя студента',
      'paymentType': 'Тип оплаты',
      'monthly': 'Месячная',
      'daily': 'Ежедневная',
      'amount': 'Сумма',
      'currency': 'Валюта',
      'turkishLira': 'TRY (Турецкая лира)',
      'ruble': 'RUB (Рубль)',
      'manat': 'AZN (Манат)',
      'dollar': 'USD (Доллар)',
      'addStudent': 'Добавить студента',
      
      // StudentCard.js
      'weeklyLessonCount': 'Количество уроков в неделю',
      'delete': 'Удалить',
      
      // WeeklyView.js
      'thisWeeksSchedule': 'Расписание на эту неделю',
      'cancelled': 'Отменено',
      'scheduled': 'Запланировано',
      'paidClickToCancel': 'Оплачено - Нажмите для отмены',
      'notPaidClickToPay': 'Не оплачено - Нажмите для оплаты',
      'paid': 'Оплачено',
      'pay': 'Оплатить',
      'paymentCompleted': 'Платеж завершен',
      'paymentPending': 'Ожидается платеж',
      'noLesson': 'Нет урока',
      
      // PaymentManager.js
      'monthlyPaymentManagement': 'Управление месячными платежами',
      'monthYear': 'Месяц/Год',
      'monthlyPaymentStudents': 'Студенты с месячной оплатой',
      'noMonthlyStudentsThisMonth': 'Студентов с месячной оплатой не найдено на этот месяц.',
      'dailyPaymentManagement': 'Управление ежедневными платежами',
      'dailyPaymentStudentsDescription': 'Студенты с ежедневной оплатой отслеживаются по каждому уроку.',
      'dailyPaymentStudents': 'Студенты с ежедневной оплатой',
      'thisWeeksLessons': 'Уроки на эту неделю - Кнопки оплаты',
      'noLessonsThisWeek': 'На этой неделе нет уроков',
      'lessonsPaid': 'уроков оплачено',
      'totalAmount': 'Общая сумма',
      'paid': 'Оплачено',
      'remaining': 'Осталось',
      'progress': 'Прогресс',
      'paymentProgress': 'Прогресс оплаты',
      'lessons': 'уроков',
      'perLesson': '/урок',
      
      // Days of week
      'sunday': 'Воскресенье',
      'monday': 'Понедельник',
      'tuesday': 'Вторник',
      'wednesday': 'Среда',
      'thursday': 'Четверг',
      'friday': 'Пятница',
      'saturday': 'Суббота',
      
      // Months
      'january': 'Январь',
      'february': 'Февраль',
      'march': 'Март',
      'april': 'Апрель',
      'may': 'Май',
      'june': 'Июнь',
      'july': 'Июль',
      'august': 'Август',
      'september': 'Сентябрь',
      'october': 'Октябрь',
      'november': 'Ноябрь',
      'december': 'Декабрь',
      
      // Additional PaymentManager translations
      'noMonthlyStudentsThisMonth': 'Студентов с месячной оплатой не найдено на этот месяц.',
      'dailyPaymentStudentsDescription': 'Студенты с ежедневной оплатой отслеживаются по каждому уроку.',
      'noLessonsThisWeek': 'На этой неделе нет уроков',
      
      // PaymentStatus.js
      'notPaid': 'Не оплачено',
      'cancel': 'Отмена',
      'edit': 'Редактировать',
      
      // WeekControls.js
      'weeklyLessonTracking': 'Еженедельное отслеживание уроков',
      'thisWeek': 'Эта неделя',
      'weekStart': 'Начало недели'
    }
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
