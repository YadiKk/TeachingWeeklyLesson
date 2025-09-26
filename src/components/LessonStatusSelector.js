import React from 'react';

const LessonStatusSelector = ({ lesson, onStatusChange }) => {
  const statuses = [
    { value: 'pending', label: 'Pending', color: 'gray', icon: '○' },
    { value: 'completed', label: 'Completed', color: 'green', icon: '✓' },
    { value: 'cancelled', label: 'Cancelled', color: 'red', icon: '✕' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white border-green-500';
      case 'cancelled':
        return 'bg-red-500 text-white border-red-500';
      default:
        return 'bg-gray-200 text-gray-700 border-gray-300';
    }
  };

  const getCurrentStatus = () => {
    if (lesson.completed) return 'completed';
    if (lesson.cancelled) return 'cancelled';
    return 'pending';
  };

  const currentStatus = getCurrentStatus();

  return (
    <div className="flex items-center space-x-1">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => onStatusChange(status.value)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all hover:scale-105 ${
            currentStatus === status.value
              ? getStatusColor(status.value)
              : 'bg-white text-gray-400 border-gray-300 hover:border-gray-400'
          }`}
          title={status.label}
        >
          {status.icon}
        </button>
      ))}
    </div>
  );
};

export default LessonStatusSelector;
