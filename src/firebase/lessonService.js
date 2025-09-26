// Firebase Firestore service for lesson data
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Collection names
const GROUPS_COLLECTION = 'groups';
const STUDENTS_COLLECTION = 'students';

// Group management functions
export const createGroup = async (pin) => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, pin);
    const groupData = {
      pin,
      createdAt: serverTimestamp(),
      settings: {
        weekStartDay: 1, // Monday
        currentWeekStart: new Date().toISOString()
      }
    };
    
    await setDoc(groupRef, groupData);
    return { success: true, groupId: pin };
  } catch (error) {
    console.error('Error creating group:', error);
    return { success: false, error: error.message };
  }
};

export const joinGroup = async (pin) => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, pin);
    const groupSnap = await getDoc(groupRef);
    
    if (groupSnap.exists()) {
      return { success: true, groupId: pin, groupData: groupSnap.data() };
    } else {
      return { success: false, error: 'Group not found' };
    }
  } catch (error) {
    console.error('Error joining group:', error);
    return { success: false, error: error.message };
  }
};

// Student management functions
export const addStudent = async (groupId, studentData) => {
  try {
    const studentRef = doc(collection(db, STUDENTS_COLLECTION));
    const student = {
      ...studentData,
      groupId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(studentRef, student);
    return { success: true, studentId: studentRef.id };
  } catch (error) {
    console.error('Error adding student:', error);
    return { success: false, error: error.message };
  }
};

export const updateStudent = async (studentId, updates) => {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await updateDoc(studentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, error: error.message };
  }
};

export const deleteStudent = async (studentId) => {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting student:', error);
    return { success: false, error: error.message };
  }
};

// Real-time data subscription
export const subscribeToGroupData = (groupId, callback) => {
  try {
    const studentsQuery = query(
      collection(db, STUDENTS_COLLECTION),
      where('groupId', '==', groupId)
    );
    
    return onSnapshot(studentsQuery, (snapshot) => {
      const students = [];
      snapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() });
      });
      // Sort by creation time locally
      students.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return aTime - bTime;
      });
      callback(students);
    });
  } catch (error) {
    console.error('Error subscribing to group data:', error);
    callback([]);
  }
};

export const subscribeToGroupSettings = (groupId, callback) => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    return onSnapshot(groupRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error('Error subscribing to group settings:', error);
    callback(null);
  }
};

// Update group settings
export const updateGroupSettings = async (groupId, settings) => {
  try {
    const groupRef = doc(db, GROUPS_COLLECTION, groupId);
    await updateDoc(groupRef, {
      settings: {
        ...settings,
        updatedAt: serverTimestamp()
      }
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating group settings:', error);
    return { success: false, error: error.message };
  }
};
