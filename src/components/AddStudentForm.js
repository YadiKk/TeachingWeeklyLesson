import React, { useState } from 'react';
import DaySelector from './DaySelector';

const AddStudentForm = ({ onAddStudent, weekStartDay, currentWeekStart }) => {
  const [name, setName] = useState('');
  const [selectedDays, setSelectedDays] = useState([1, 3]); // Default: Monday and Wednesday
  const [paymentType, setPaymentType] = useState('monthly'); // 'daily' or 'monthly'
  const [amount, setAmount] = useState(100); // Payment amount
  const [currency, setCurrency] = useState('TRY'); // Currency type

  const handleDayToggle = (dayValue) => {
    setSelectedDays(prev => {
      if (prev.includes(dayValue)) {
        return prev.filter(day => day !== dayValue);
      } else {
        return [...prev, dayValue].sort();
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || selectedDays.length === 0) return;

    const newStudent = {
      name: name.trim(),
      selectedDays: selectedDays,
      weeklyLessonCount: selectedDays.length,
      paymentType: paymentType,
      amount: amount,
      currency: currency
    };

    try {
      await onAddStudent(newStudent);
      setName('');
      setSelectedDays([1, 3]);
      setPaymentType('monthly');
      setAmount(100);
      setCurrency('TRY');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student: ' + error.message);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Student</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Student Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="Enter student name"
            required
          />
        </div>
        
        <DaySelector
          selectedDays={selectedDays}
          onDayToggle={handleDayToggle}
          weekStartDay={weekStartDay}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="input"
            >
              <option value="monthly">Monthly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              className="input"
              placeholder="Amount"
              min="0"
              step="10"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input"
            >
              <option value="TRY">TRY (Turkish Lira)</option>
              <option value="RUB">RUB (Ruble)</option>
              <option value="AZN">AZN (Manat)</option>
              <option value="USD">USD (Dollar)</option>
            </select>
          </div>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={selectedDays.length === 0}
        >
          Add Student
        </button>
      </form>
    </div>
  );
};

export default AddStudentForm;