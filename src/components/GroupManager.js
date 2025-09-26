// Component for managing group/pin functionality
import React, { useState } from 'react';

const GroupManager = ({ 
  currentGroup, 
  onJoinGroup, 
  onCreateGroup, 
  onLeaveGroup, 
  loading, 
  error 
}) => {
  const [pin, setPin] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (pin.length === 6) {
      await onJoinGroup(pin);
    }
  };

  const handleCreateGroup = async () => {
    await onCreateGroup();
  };

  if (currentGroup) {
    return (
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              🎯 Aktif Grup
            </h2>
            <p className="text-gray-600">
              Grup Pin: <span className="font-mono font-bold text-blue-600 text-lg">{currentGroup}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Bu pini diğer kullanıcılarla paylaşın
            </p>
          </div>
          <button
            onClick={onLeaveGroup}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Gruptan Çık
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        🎯 Grup Yönetimi
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Create Group Button */}
        <div className="text-center">
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Oluşturuluyor...' : '🆕 Yeni Grup Oluştur'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Yeni bir grup oluşturun ve pin alın
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-3 text-gray-500 text-sm">veya</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Join Group */}
        <div className="text-center">
          {!showJoinForm ? (
            <button
              onClick={() => setShowJoinForm(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              🔗 Mevcut Gruba Katıl
            </button>
          ) : (
            <form onSubmit={handleJoinGroup} className="max-w-sm mx-auto">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grup Pin'i Girin
                </label>
                <input
                  type="text"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
                  maxLength="6"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={pin.length !== 6 || loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Katılıyor...' : 'Katıl'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinForm(false);
                    setPin('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Mevcut bir gruba pin ile katılın
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupManager;
