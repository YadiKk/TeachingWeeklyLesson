import React, { useState, useEffect } from 'react';

const PaymentModal = ({ isOpen, onClose, paymentStatus, onSavePayment }) => {
  const [formData, setFormData] = useState({
    paymentDate: '',
    paymentMethod: 'cash',
    notes: ''
  });

  useEffect(() => {
    if (paymentStatus) {
      setFormData({
        paymentDate: paymentStatus.paymentDate 
          ? new Date(paymentStatus.paymentDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        paymentMethod: paymentStatus.paymentMethod || 'cash',
        notes: paymentStatus.notes || ''
      });
    }
  }, [paymentStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePayment(paymentStatus.studentId, formData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Ödeme Detaylarını Düzenle - {paymentStatus?.studentName}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Tarihi
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ödeme Yöntemi
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="input"
            >
              <option value="cash">Nakit</option>
              <option value="bank_transfer">Banka Havalesi</option>
              <option value="credit_card">Kredi Kartı</option>
              <option value="other">Diğer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notlar
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Ödeme ile ilgili notlar..."
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="btn btn-primary flex-1"
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;