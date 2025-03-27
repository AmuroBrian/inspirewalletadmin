import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

// Fetch Users
export const fetchUsers = async (setUsers, setLoading) => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    setTimeout(() => setLoading(false), 5000);
  }
};

  export const getTransactionsFromFirebase = async (userId, type) => {
    try {
      const transactionsRef = firestore.collection("transactions").where("userId", "==", userId);
      const snapshot = await transactionsRef.get();
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };
  
  

// Add Transaction
export const saveNewTransaction = async (userId, type, transaction) => {
  try {
    await addDoc(collection(db, `users/${userId}/${type}`), transaction);
  } catch (error) {
    console.error("Error saving transaction:", error);
  }
};

// Delete Transaction
export const deleteTransaction = async (userId, type, transactionId) => {
  try {
    await deleteDoc(doc(db, `users/${userId}/${type}`, transactionId));
  } catch (error) {
    console.error("Error deleting transaction:", error);
  }
};

export async function updateTransaction(transactionId, updatedData) {
    try {
        const transactionRef = doc(db, "transactions", transactionId);
        await updateDoc(transactionRef, updatedData);
        return { success: true };
    } catch (error) {
        console.error("Error updating transaction:", error);
        return { success: false, error };
    }
};