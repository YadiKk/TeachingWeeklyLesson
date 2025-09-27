import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const GroupManager = ({ 
  currentGroup, 
  onJoinGroup, 
  onCreateGroup, 
  onLeaveGroup, 
  loading, 
  error 
}) => {
  const { t } = useTranslation();
  const [joinPin, setJoinPin] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (joinPin.trim()) {
      await onJoinGroup(joinPin.trim());
      setJoinPin('');
    }
  };

  const handleCreateGroup = async () => {
    try {
      setSuccessMessage('');
      const result = await onCreateGroup();
      if (result && result.success) {
        setSuccessMessage(`${t('group.groupCreatedSuccessfully')} ${result.pin}`);
        setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
      } else if (result && !result.success) {
        console.error('Group creation failed:', result.error);
      }
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (currentGroup) {
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{t('group.activeGroup')}</h3>
            <p className="text-sm text-gray-600">{t('group.groupCode')}: <span className="font-mono font-bold text-blue-600">{currentGroup}</span></p>
          </div>
          <button
            onClick={onLeaveGroup}
            className="btn btn-danger"
          >
            {t('group.leaveGroup')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('group.groupManagement')}</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {successMessage}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">{t('group.joinExistingGroup')}</h4>
          <form onSubmit={handleJoinGroup} className="flex space-x-2">
            <input
              type="text"
              value={joinPin}
              onChange={(e) => setJoinPin(e.target.value)}
              placeholder={t('group.enterGroupCode')}
              className="input flex-1"
              maxLength={6}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !joinPin.trim()}
            >
              {loading ? t('group.joining') : t('group.joinGroup')}
            </button>
          </form>
        </div>
        
        <div className="border-t pt-4">
          <h4 className="text-md font-medium text-gray-700 mb-2">{t('group.createNewGroup')}</h4>
          <button
            onClick={handleCreateGroup}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? t('group.creating') : t('group.createNewGroupButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupManager;