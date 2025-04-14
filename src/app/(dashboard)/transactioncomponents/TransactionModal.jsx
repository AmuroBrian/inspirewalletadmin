import React, { useState } from "react";
import { Timestamp } from "firebase/firestore";

export default function TransactionModal({
  transactions,
  selectedUser,
  modalType,
  closeModal,
  saveNewTransaction,
  updateTransaction,
  deleteTransaction,
}) {
  console.log("Transactions Data:", transactions); // Debugging output

  const [newTransaction, setNewTransaction] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({});

  // Start Editing
  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    setEditedTransaction({
      amount: transaction.amount || "",
      date:
        transaction.date instanceof Date
          ? transaction.date.toISOString().split("T")[0]
          : "",
      type: transaction.type || "Unknown",
    });
  };

  const saveEdit = () => {
    if (
      !editedTransaction.amount ||
      !editedTransaction.date ||
      !editedTransaction.type
    ) {
      alert("Please fill in all fields before saving.");
      return;
    }

    const updatedData = {
      amount: Number(editedTransaction.amount) || 0, // Ensure it's a number
      date: editedTransaction.date
        ? Timestamp.fromDate(new Date(editedTransaction.date))
        : Timestamp.now(),
      type: editedTransaction.type || "Unknown",
    };

    // Remove any undefined fields before updating
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    updateTransaction(selectedUser, modalType, editingId, updatedData)
      .then(() => {
        console.log("Transaction updated successfully!");
        setEditingId(null);
      })
      .catch((error) => {
        console.error("Error updating transaction:", error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-lg">
      <div className="bg-white p-4 rounded-lg w-[70%] shadow-lg border border-gray-300 relative ml-64">
        <h2 className="text-xl font-semibold mb-4 text-center capitalize">
          {modalType.replace("Transactions", " Transactions")}
        </h2>
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={closeModal}
        >
          ✖
        </button>

        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Amount</th>
              <th className="border border-gray-300 px-4 py-2">Date</th>
              <th className="border border-gray-300 px-4 py-2">Type</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(transactions || []).map((transaction) => (
              <tr key={transaction.id} className="text-center border-b">
                <td className="border px-4 py-2">
                  {editingId === transaction.id ? (
                    <input
                      type="number"
                      value={editedTransaction.amount}
                      onChange={(e) =>
                        setEditedTransaction({
                          ...editedTransaction,
                          amount: e.target.value,
                        })
                      }
                      className="border p-1 w-full"
                    />
                  ) : (
                    transaction.amount
                  )}
                </td>
                <td className="border px-4 py-2">
                  {editingId === transaction.id ? (
                    <input
                      type="date"
                      value={editedTransaction.date}
                      onChange={(e) =>
                        setEditedTransaction({
                          ...editedTransaction,
                          date: e.target.value,
                        })
                      }
                      className="border p-1 w-full"
                    />
                  ) : transaction.date ? (
                    new Date(transaction.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="border px-4 py-2">
                  {editingId === transaction.id ? (
                    <input
                      type="text"
                      value={editedTransaction.type}
                      onChange={(e) =>
                        setEditedTransaction({
                          ...editedTransaction,
                          type: e.target.value,
                        })
                      }
                      className="border p-1 w-full"
                    />
                  ) : (
                    transaction.type
                  )}
                </td>
                <td className="border px-4 py-2">
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
                        onClick={() => startEditing(transaction)}
                        className="hover:bg-blue-600"
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
                            deleteTransaction(transaction.id);
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

            {newTransaction && (
              <tr className="border-b">
                <td className="border px-4 py-2">
                  <input
                    type="number"
                    className="border p-1 w-full"
                    value={newTransaction.amount}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        amount: e.target.value,
                      })
                    }
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="date"
                    className="border p-1 w-full"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                  />
                </td>
                <td className="border px-4 py-2">
                  <input
                    type="text"
                    className="border p-1 w-full"
                    value={newTransaction.type}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: e.target.value,
                      })
                    }
                  />
                </td>
                <td className="border px-4 py-2">
                  <button
                    className="px-2 py-1 hover:bg-green-100 mr-1"
                    onClick={() => {
                      if (
                        newTransaction.amount &&
                        newTransaction.date &&
                        newTransaction.type
                      ) {
                        saveNewTransaction(newTransaction);
                        setNewTransaction(null);
                      } else {
                        alert("Please fill out all fields.");
                      }
                    }}
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
    </div>
  );
}
