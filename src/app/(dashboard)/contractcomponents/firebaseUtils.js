import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, Timestamp } from "firebase/firestore";

export async function getUsers() {
  const querySnapshot = await getDocs(collection(db, "users"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getInvestmentProfiles(userId) {
    try {
      const investmentSnap = await getDocs(collection(db, `users/${userId}/investmentProfiles`));
      if (investmentSnap.empty) return [];
      return investmentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching investment profiles:", error);
      return [];
    }
  }  

export async function updateTransaction(userId, id, editedTransaction, setInvestmentProfile) {
  await updateDoc(doc(db, `users/${userId}/investmentProfiles`, id), { amount: Number(editedTransaction.amount), interestRate: Number(editedTransaction.interestRate), dateOfMaturity: Timestamp.fromDate(new Date(editedTransaction.date)) });
}

export async function deleteTransaction(userId, id, setInvestmentProfile) {
  await deleteDoc(doc(db, `users/${userId}/investmentProfiles`, id));
}

export async function addTransaction(userId, newTransaction, setInvestmentProfile) {
  await addDoc(collection(db, `users/${userId}/investmentProfiles`), newTransaction);
}
