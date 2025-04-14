import React, { useState, useEffect } from "react";
import { updateTransaction, deleteTransaction, addTransaction } from "./firebaseUtils";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";

export default function InvestmentProfile({ selectedUser, investmentProfile, setSelectedUser, setInvestmentProfile }) {
  const [editingId, setEditingId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState({});
  const [newTransaction, setNewTransaction] = useState({ amount: "", interestRate: "", dateOfMaturity: "" });

  // Handle transaction editing
  const handleEdit = (profile) => {
    setEditingId(profile.id);
    setEditedTransaction({
      amount: Number(profile.amount), // Ensure it's a number
      interestRate: Number(profile.interestRate || ""), // Ensure it's a number
      dateOfMaturity: new Date(profile.dateOfMaturity.seconds * 1000).toISOString().split("T")[0], // Convert Firestore timestamp to date string
    });
  };  

  // Save edited transaction
  const saveEdit = async () => {
    if (!selectedUser || !editingId) return;
  
    const formattedTransaction = {
      amount: Number(editedTransaction.amount), // Convert to number
      interestRate: Number(editedTransaction.interestRate), // Convert to number
      dateOfMaturity: new Date(editedTransaction.dateOfMaturity), // Convert to Firestore timestamp
    };
  
    await updateTransaction(selectedUser.id, editingId, formattedTransaction, setInvestmentProfile);
    setEditingId(null);
  };  

  // Delete transaction
  const handleDelete = async (transactionId) => {
    await deleteTransaction(selectedUser.id, transactionId);
    setInvestmentProfile(prevProfiles => prevProfiles.filter(profile => profile.id !== transactionId));
  };

  // Handle new transaction input
  const handleAddTransaction = () => {
    setNewTransaction({ amount: "", interestRate: "", dateOfMaturity: new Date().toISOString().split("T")[0] });
  };

  // Save new transaction
  const saveNewTransaction = async () => {
    const formattedTransaction = {
      amount: Number(newTransaction.amount), // Convert to number
      interestRate: Number(newTransaction.interestRate), // Convert to number
      dateOfMaturity: new Date(newTransaction.dateOfMaturity), // Convert to Date object
    };
  
    const savedTransaction = await addTransaction(selectedUser.id, formattedTransaction);
    
    if (savedTransaction) {
      setInvestmentProfile(prevProfiles => [...prevProfiles, savedTransaction]);
    }
  
    setNewTransaction({ amount: "", interestRate: "", dateOfMaturity: "" });
  };
  

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] relative ml-60">
        <button className="absolute top-2 right-2 text-gray-600 text-lg font-bold" onClick={() => setSelectedUser(null)}>
          &times;
        </button>
        <h2 className="text-xl font-semibold mb-4">{selectedUser.firstName} {selectedUser.lastName}</h2>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Amount</th>
              <th className="border p-2">Interest Rate</th>
              <th className="border p-2">Maturity Date</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {investmentProfile && investmentProfile.length > 0 ? (
              investmentProfile.map((profile) => (
                <tr key={profile.id} className="border">
                  {editingId === profile.id ? (
                    <>
                      <td className="border p-2"><input type="number" className="border p-2 w-full" value={editedTransaction.amount} onChange={(e) => setEditedTransaction({ ...editedTransaction, amount: e.target.value })} /></td>
                      <td className="border p-2"><input type="text" className="border p-2 w-full" value={editedTransaction.interestRate} onChange={(e) => setEditedTransaction({ ...editedTransaction, interestRate: e.target.value })} /></td>
                      <td className="border p-2"><input type="date" className="border p-2 w-full" value={editedTransaction.dateOfMaturity} onChange={(e) => setEditedTransaction({ ...editedTransaction, dateOfMaturity: e.target.value })} /></td>
                      <td className="border p-2">
                        <button className="text-blue-500" onClick={saveEdit}><FaEdit /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="border p-2">{profile.amount}</td>
                      <td className="border p-2">{profile.interestRate}</td>
                      <td className="border p-2">
                        {profile.dateOfMaturity?.seconds
                          ? new Date(profile.dateOfMaturity.seconds * 1000).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>

                      <td className="space-x-7 flex justify-center mt-2.5">
                        <button className="text-yellow-500 hover:bg-yellow-100 p-1" onClick={() => handleEdit(profile)}><FaEdit /></button>
                        <button className="text-red-500 hover:bg-red-100 p-1" onClick={() => handleDelete(profile.id)}><FaTrash /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-gray-500 text-center p-4">No investment profiles found.</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Add New Transaction */}
        <div className="mt-4">
          <button className="bg-green-500 hover:bg-green-700 text-white px-4 py-1 rounded flex items-center" onClick={handleAddTransaction}>
            <FaPlus />
          </button>
          {newTransaction?.amount !== "" && (
            <div className="flex flex-col space-y-2 mt-2">
              <input type="number" className="border p-2" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} />
              <input type="text" className="border p-2" placeholder="Interest Rate" value={newTransaction.interestRate} onChange={(e) => setNewTransaction({ ...newTransaction, interestRate: e.target.value })} />
              <input type="date" className="border p-2" value={newTransaction.dateOfMaturity} onChange={(e) => setNewTransaction({ ...newTransaction, dateOfMaturity: e.target.value })} />
              <button className="bg-blue-500 text-white px-4 py-1 rounded" onClick={saveNewTransaction}>Save Transaction</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
