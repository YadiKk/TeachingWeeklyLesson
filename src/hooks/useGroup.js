// Hook for managing group/pin functionality
import { useState, useEffect, useCallback } from 'react';
import { 
  createGroup, 
  joinGroup, 
  subscribeToGroupData, 
  subscribeToGroupSettings,
  updateGroupSettings
} from '../firebase/lessonService';

export const useGroup = () => {
  const [currentGroup, setCurrentGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [groupSettings, setGroupSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate a random 6-digit pin
  const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create a new group
  const createNewGroup = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const pin = generatePin();
    const result = await createGroup(pin);
    
    if (result.success) {
      setCurrentGroup(pin);
      localStorage.setItem('currentGroup', pin);
      setLoading(false);
      return { success: true, pin };
    } else {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }, []);

  // Join an existing group
  const joinExistingGroup = useCallback(async (pin) => {
    setLoading(true);
    setError(null);
    
    const result = await joinGroup(pin);
    
    if (result.success) {
      setCurrentGroup(pin);
      localStorage.setItem('currentGroup', pin);
      setLoading(false);
      return { success: true };
    } else {
      setError(result.error);
      setLoading(false);
      return { success: false, error: result.error };
    }
  }, []);

  // Leave current group
  const leaveGroup = useCallback(() => {
    setCurrentGroup(null);
    setStudents([]);
    setGroupSettings(null);
    localStorage.removeItem('currentGroup');
  }, []);

  // Update group settings
  const updateSettings = useCallback(async (settings) => {
    if (!currentGroup) return { success: false, error: 'No group selected' };
    
    const result = await updateGroupSettings(currentGroup, settings);
    return result;
  }, [currentGroup]);

  // Subscribe to real-time data
  useEffect(() => {
    if (!currentGroup) {
      console.log('No current group, not setting up listeners');
      return;
    }

    console.log('Setting up Firebase listeners for group:', currentGroup);

    const unsubscribeStudents = subscribeToGroupData(currentGroup, (data) => {
      console.log('Students updated in useGroup hook:', data);
      setStudents(data);
    });

    const unsubscribeSettings = subscribeToGroupSettings(currentGroup, (settings) => {
      console.log('Settings updated in useGroup hook:', settings);
      setGroupSettings(settings);
    });

    return () => {
      console.log('Cleaning up Firebase listeners');
      unsubscribeStudents();
      unsubscribeSettings();
    };
  }, [currentGroup]);

  // Load group from localStorage on mount
  useEffect(() => {
    const savedGroup = localStorage.getItem('currentGroup');
    if (savedGroup) {
      joinExistingGroup(savedGroup);
    }
  }, [joinExistingGroup]);

  return {
    currentGroup,
    students,
    groupSettings,
    loading,
    error,
    createNewGroup,
    joinExistingGroup,
    leaveGroup,
    updateSettings,
    generatePin
  };
};
