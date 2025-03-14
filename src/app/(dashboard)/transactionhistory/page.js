"use client";

import React, { useEffect, useState } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export default function TransactionList() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const fetchTransactions = async (userId, type) => {
    try {
      const transactionRef = collection(db, `users/${userId}/${type}`);
      const transactionSnapshot = await getDocs(transactionRef);
      const transactionData = transactionSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          amount: Number(data.amount) || 0,
          type: data.type || "",
          date: data.date?.toDate() || new Date(),
        };
      });

      setTransactions(transactionData);
      setSelectedUser(userId);
      setModalType(type);
    } catch (error) {
      console.error(`Error fetching ${type} transactions:`, error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction.id);
    setEditedTransaction({
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date.toISOString().split("T")[0], // Format for input
    });
  };

  const handleChange = (e, field) => {
    setEditedTransaction((prev) => ({
      ...prev,
      [field]: field === "amount" ? Number(e.target.value) : e.target.value,
    }));
  };

  const saveEdit = async () => {
    try {
      const transactionDoc = doc(db, `users/${selectedUser}/${modalType}`, editingId);
      await updateDoc(transactionDoc, {
        ...editedTransaction,
        date: new Date(editedTransaction.date),
      });

      setTransactions((prev) =>
        prev.map((trans) =>
          trans.id === editingId ? { ...trans, ...editedTransaction, date: new Date(editedTransaction.date) } : trans
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      await deleteDoc(doc(db, `users/${selectedUser}/${modalType}`, transactionId));
      setTransactions((prev) => prev.filter((trans) => trans.id !== transactionId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="flex justify-start p-4 ml-64 pt-10 relative">
      <div className="w-full max-w-5xl mt-10">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 text-center table-fixed">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Stock</th>
                <th className="p-2 border">Agent</th>
                <th className="p-2 border">Transaction</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2 border">{user.firstName} {user.lastName}</td>
                  <td className="p-2 border">
                    <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => fetchTransactions(user.id, "stockTransactions")}>
                      Stock
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600" onClick={() => fetchTransactions(user.id, "agentTransactions")}>
                      Agent
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600" onClick={() => fetchTransactions(user.id, "transactions")}>
                      Transaction
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-lg">
          <div className="bg-white p-4 rounded-lg w-[70%] shadow-lg border border-gray-300 relative ml-60">
            <h2 className="text-xl font-semibold mb-4 text-center capitalize">{modalType.replace("Transactions", " Transactions")}</h2>
            <button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" onClick={() => setModalType(null)}>✖</button>
            <div className="max-h-60 overflow-y-auto">
              {transactions.length > 0 ? (
                <table className="w-full text-left border-collapse table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 border">Amount</th>
                      <th className="p-2 border">Date</th>
                      <th className="p-2 border">Type</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b">
                        <td className="p-2 border">
                          {editingId === transaction.id ? (
                            <input className="w-full p-1 border text-center" value={editedTransaction.amount} onChange={(e) => handleChange(e, "amount")} type="number" />
                          ) : (
                            transaction.amount
                          )}
                        </td>
                        <td className="p-2 border">
                          {editingId === transaction.id ? (
                            <input className="w-full p-1 border text-center" value={editedTransaction.date} onChange={(e) => handleChange(e, "date")} type="date" />
                          ) : (
                            transaction.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                          )}
                        </td>
                        <td className="p-2 border">
                          {editingId === transaction.id ? (
                            <input className="w-full p-1 border text-center" value={editedTransaction.type} onChange={(e) => handleChange(e, "type")} />
                          ) : (
                            transaction.type
                          )}
                        </td>
                        <td className="p-2 border flex justify-center gap-3">
                          {editingId === transaction.id ? (
                            <button onClick={saveEdit} className="text-green-500 hover:text-green-700">✅</button>
                          ) : (
                            <>
                              <button onClick={() => handleEdit(transaction)} className="text-blue-500 hover:text-blue-700">✏️</button>
                              <button onClick={() => handleDelete(transaction.id)} className="text-red-500 hover:text-red-700">🗑️</button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center">No transactions available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
