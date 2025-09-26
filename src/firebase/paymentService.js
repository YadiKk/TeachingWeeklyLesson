// Firebase Firestore service for payment tracking
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
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
const PAYMENTS_COLLECTION = 'payments';
const MONTHLY_PAYMENTS_COLLECTION = 'monthlyPayments';

// Payment management functions
export const addPayment = async (groupId, studentId, paymentData) => {
  try {
    const paymentRef = doc(collection(db, PAYMENTS_COLLECTION));
    const payment = {
      ...paymentData,
      groupId,
      studentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(paymentRef, payment);
    return { success: true, paymentId: paymentRef.id };
  } catch (error) {
    console.error('Error adding payment:', error);
    return { success: false, error: error.message };
  }
};

export const updatePayment = async (paymentId, updates) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await updateDoc(paymentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating payment:', error);
    return { success: false, error: error.message };
  }
};

export const deletePayment = async (paymentId) => {
  try {
    const paymentRef = doc(db, PAYMENTS_COLLECTION, paymentId);
    await deleteDoc(paymentRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting payment:', error);
    return { success: false, error: error.message };
  }
};

// Monthly payment tracking functions
export const createMonthlyPayment = async (groupId, studentId, month, year, paymentData) => {
  try {
    const monthlyPaymentId = `${groupId}_${studentId}_${year}_${month}`;
    const monthlyPaymentRef = doc(db, MONTHLY_PAYMENTS_COLLECTION, monthlyPaymentId);
    
    const monthlyPayment = {
      groupId,
      studentId,
      month,
      year,
      ...paymentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(monthlyPaymentRef, monthlyPayment);
    return { success: true, monthlyPaymentId };
  } catch (error) {
    console.error('Error creating monthly payment:', error);
    return { success: false, error: error.message };
  }
};

export const updateMonthlyPayment = async (monthlyPaymentId, updates) => {
  try {
    const monthlyPaymentRef = doc(db, MONTHLY_PAYMENTS_COLLECTION, monthlyPaymentId);
    await updateDoc(monthlyPaymentRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating monthly payment:', error);
    return { success: false, error: error.message };
  }
};

export const getMonthlyPayment = async (groupId, studentId, month, year) => {
  try {
    const monthlyPaymentId = `${groupId}_${studentId}_${year}_${month}`;
    const monthlyPaymentRef = doc(db, MONTHLY_PAYMENTS_COLLECTION, monthlyPaymentId);
    const monthlyPaymentSnap = await getDoc(monthlyPaymentRef);
    
    if (monthlyPaymentSnap.exists()) {
      return { success: true, data: { id: monthlyPaymentSnap.id, ...monthlyPaymentSnap.data() } };
    } else {
      return { success: true, data: null };
    }
  } catch (error) {
    console.error('Error getting monthly payment:', error);
    return { success: false, error: error.message };
  }
};

// Real-time subscription for monthly payments
export const subscribeToMonthlyPayments = (groupId, month, year, callback) => {
  try {
    const monthlyPaymentsQuery = query(
      collection(db, MONTHLY_PAYMENTS_COLLECTION),
      where('groupId', '==', groupId),
      where('month', '==', month),
      where('year', '==', year)
    );
    
    return onSnapshot(monthlyPaymentsQuery, (snapshot) => {
      const monthlyPayments = [];
      snapshot.forEach((doc) => {
        monthlyPayments.push({ id: doc.id, ...doc.data() });
      });
      callback(monthlyPayments);
    });
  } catch (error) {
    console.error('Error subscribing to monthly payments:', error);
    callback([]);
  }
};

// Get all payments for a student
export const getStudentPayments = async (groupId, studentId) => {
  try {
    const paymentsQuery = query(
      collection(db, PAYMENTS_COLLECTION),
      where('groupId', '==', groupId),
      where('studentId', '==', studentId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(paymentsQuery);
    const payments = [];
    snapshot.forEach((doc) => {
      payments.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: payments };
  } catch (error) {
    console.error('Error getting student payments:', error);
    return { success: false, error: error.message };
  }
};
