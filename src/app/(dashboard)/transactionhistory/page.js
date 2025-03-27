"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion"; // Import Framer Motion
import { db } from "../../../../script/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

export default function TransactionList() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({});
  const [newTransaction, setNewTransaction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state
  const [data, setData] = useState(null);

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

        // } finally {
        //   setLoading(false);
        // }
      } finally {
        // Delay setting loading to false for 5 seconds
        setTimeout(() => {
          setLoading(false);
        }, 5000);
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
      const transactionDoc = doc(
        db,
        `users/${selectedUser}/${modalType}`,
        editingId
      );
      await updateDoc(transactionDoc, {
        ...editedTransaction,
        date: new Date(editedTransaction.date),
      });

      setTransactions((prev) =>
        prev.map((trans) =>
          trans.id === editingId
            ? {
                ...trans,
                ...editedTransaction,
                date: new Date(editedTransaction.date),
              }
            : trans
        )
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      await deleteDoc(
        doc(db, `users/${selectedUser}/${modalType}`, transactionId)
      );
      setTransactions((prev) =>
        prev.filter((trans) => trans.id !== transactionId)
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleNewChange = (e, field) => {
    setNewTransaction((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const saveNewTransaction = async () => {
    if (
      !newTransaction?.amount ||
      !newTransaction?.date ||
      !newTransaction?.type
    ) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const transactionRef = collection(
        db,
        `users/${selectedUser}/${modalType}`
      );
      const docRef = await addDoc(transactionRef, {
        amount: Number(newTransaction.amount),
        date: new Date(newTransaction.date),
        type: newTransaction.type,
      });

      setTransactions((prev) => [
        ...prev,
        { id: docRef.id, ...newTransaction },
      ]);
      setNewTransaction(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleAddTransaction = () => {
    setNewTransaction({
      amount: "",
      date: new Date().toISOString().split("T")[0], // Default to today's date
      type: "",
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  // **Loading Screen**
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white relative overflow-hidden">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 w-full h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent bg-[length:20px_1px] bg-repeat-x"
        />

        <motion.div
          animate={{
            y: [0, -50, 0], // Bouncing animation
            rotate: [0, 360], // Rotating animation
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-20 h-20 rounded-full bg-white shadow-lg flex justify-center items-center overflow-hidden border-2 border-gray-300 ml-56"
        >
          <img
            src="/images/logo.png" // Change this to the actual logo path
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Surface */}
        <div className="w-24 h-2 bg-gray-700 rounded-md mt-2 shadow-md relative z-10 ml-56" />
        <p className="mt-2 text-gray-700 font-semibold text-lg ml-56">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-start p-4 ml-64 pt-10 relative">
      <div className="w-full max-w-5xl mt-10">
        <div className="overflow-x-auto">
          <input
            type="text"
            placeholder="Search by Firstname or Lastname"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2 border">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="p-2 border">
                    <button
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() =>
                        fetchTransactions(user.id, "stockTransactions")
                      }
                    >
                      Stock
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      onClick={() =>
                        fetchTransactions(user.id, "agentTransactions")
                      }
                    >
                      Agent
                    </button>
                  </td>
                  <td className="p-2 border">
                    <button
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      onClick={() => fetchTransactions(user.id, "transactions")}
                    >
                      Transaction
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-lg">
          <div className="bg-white p-4 rounded-lg w-[70%] shadow-lg border border-gray-300 relative ml-60">
            <h2 className="text-xl font-semibold mb-4 text-center capitalize">
              {modalType.replace("Transactions", " Transactions")}
            </h2>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setModalType(null)}
            >
              ✖
            </button>

            {/* Transactions Table */}
            <div
              className={`overflow-x-auto ${
                transactions.length > 3 ? "max-h-60 overflow-y-auto" : ""
              }`}
            >
              <table className="min-w-full bg-white border border-gray-200 text-center">
                <thead>
                  <tr className="bg-gray-100 border-b">
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
                          <input
                            type="number"
                            className="border rounded p-1 w-full"
                            value={editedTransaction.amount}
                            onChange={(e) => handleChange(e, "amount")}
                          />
                        ) : (
                          transaction.amount
                        )}
                      </td>
                      <td className="p-2 border">
                        {editingId === transaction.id ? (
                          <input
                            type="date"
                            className="border rounded p-1 w-full"
                            value={editedTransaction.date}
                            onChange={(e) => handleChange(e, "date")}
                          />
                        ) : (
                          new Date(transaction.date).toISOString().split("T")[0]
                        )}
                      </td>
                      <td className="p-2 border">
                        {editingId === transaction.id ? (
                          <input
                            type="text"
                            className="border rounded p-1 w-full"
                            value={editedTransaction.type}
                            onChange={(e) => handleChange(e, "type")}
                          />
                        ) : (
                          transaction.type
                        )}
                      </td>
                      <td className="p-2 border gap-3">
                        {editingId === transaction.id ? (
                          <button
                            onClick={saveEdit}
                            className="text-green-500 hover:text-green-700"
                          >
                            ✅
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(transaction)}
                              className=" hover:bg-blue-600"
                            >
                              ✏️
                            </button>
                            <button
                              className="px-2 py-1 hover:bg-red-600"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this?"
                                  )
                                ) {
                                  handleDelete(transaction.id); // ✅ Correct function name
                                }
                              }}
                            >
                              🗑
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}

                  {/* Show Input Row if Adding New Transaction */}
                  {newTransaction && (
                    <tr className="border-b">
                      <td className="p-2 border">
                        <input
                          type="number"
                          className="border rounded p-1 w-full"
                          value={newTransaction.amount}
                          onChange={(e) => handleNewChange(e, "amount")}
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="date"
                          className="border rounded p-1 w-full"
                          value={newTransaction.date}
                          onChange={(e) => handleNewChange(e, "date")}
                        />
                      </td>
                      <td className="p-2 border">
                        <input
                          type="text"
                          className="border rounded p-1 w-full"
                          value={newTransaction.type}
                          onChange={(e) => handleNewChange(e, "type")}
                        />
                      </td>
                      <td className="p-2 border">
                        <button
                          className="px-2 py-1 hover:bg-green-600 mr-1"
                          onClick={saveNewTransaction}
                        >
                          ✅
                        </button>
                        <button
                          className="px-2 py-1 hover:bg-red-600"
                          onClick={() => setNewTransaction(null)}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Button */}
            <div className="flex justify-center mt-2">
              {!newTransaction ? (
                <button
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                  onClick={handleAddTransaction}
                >
                  +
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
