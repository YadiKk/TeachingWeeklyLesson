import React, { useState } from 'react';

const GroupManager = ({ 
  currentGroup, 
  onJoinGroup, 
  onCreateGroup, 
  onLeaveGroup, 
  loading, 
  error 
}) => {
  const [joinPin, setJoinPin] = useState('');

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (joinPin.trim()) {
      await onJoinGroup(joinPin.trim());
      setJoinPin('');
    }
  };

  const handleCreateGroup = async () => {
    await onCreateGroup();
  };

  if (currentGroup) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Aktif Grup</h3>
            <p className="text-sm text-gray-600">Grup Kodu: <span className="font-mono font-bold text-blue-600">{currentGroup}</span></p>
          </div>
          <button
            onClick={onLeaveGroup}
            className="btn btn-danger"
          >
            Gruptan Çık
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Grup Yönetimi</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Mevcut Gruba Katıl</h4>
          <form onSubmit={handleJoinGroup} className="flex space-x-2">
            <input
              type="text"
              value={joinPin}
              onChange={(e) => setJoinPin(e.target.value)}
              placeholder="Grup kodunu girin"
              className="input flex-1"
              maxLength={6}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !joinPin.trim()}
            >
              {loading ? 'Katılıyor...' : 'Katıl'}
            </button>
          </form>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">Yeni Grup Oluştur</h4>
          <button
            onClick={handleCreateGroup}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Oluşturuluyor...' : 'Yeni Grup Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupManager;