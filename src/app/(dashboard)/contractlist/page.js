"use client";
import React, { useState } from "react";
import { Trash2, Edit3, Save, X } from "lucide-react";

const ContractList = () => {
  const [transactions, setTransactions] = useState([
    {
      transactionNo: "001",
      transaction: "Purchase",
      lastname: "Doe",
      firstname: "John",
      email: "john.doe@example.com",
      bankDetails: "1234-5678-9012",
      bank: "Bank ABC",
      status: "Pending",
    },
    {
      transactionNo: "002",
      transaction: "Refund",
      lastname: "Smith",
      firstname: "Jane",
      email: "jane.smith@example.com",
      bankDetails: "9876-5432-1098",
      bank: "Bank XYZ",
      status: "Done",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);

  // Open Modal for Editing
  const handleEdit = (transaction) => {
    setCurrentTransaction(transaction);
    setIsModalOpen(true);
  };

  // Update Current Transaction Fields
  const handleChange = (e) => {
    setCurrentTransaction({ ...currentTransaction, [e.target.name]: e.target.value });
  };

  // Save Changes
  const handleSave = () => {
    setTransactions(
      transactions.map((t) =>
        t.transactionNo === currentTransaction.transactionNo ? currentTransaction : t
      )
    );
    setIsModalOpen(false);
  };

  // Delete Function
  const handleDelete = (transactionNo) => {
    setTransactions(transactions.filter((t) => t.transactionNo !== transactionNo));
  };


  return (
    <div className="p-6">
      <table className="w-[1200] ml-70 border-collapse border border-gray-300 mt-20">
      <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Transaction No</th>
            <th className="p-2 border">Transaction</th>
            <th className="p-2 border">Last Name</th>
            <th className="p-2 border">First Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Bank Details</th>
            <th className="p-2 border">Bank</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.transactionNo} className="border-b">
              <td className="p-2 border">{t.transactionNo}</td>
              <td className="p-2 border">{t.transaction}</td>
              <td className="p-2 border">{t.lastname}</td>
              <td className="p-2 border">{t.firstname}</td>
              <td className="p-2 border">{t.email}</td>
              <td className="p-2 border">{t.bankDetails}</td>
              <td className="p-2 border">{t.bank}</td>
              <td className="p-2 border">{t.status}</td>
              <td className="p-2 border flex gap-2">
                <button
                  className="bg-blue-500 text-white p-1 rounded"
                  onClick={() => handleEdit(t)}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="bg-red-500 text-white p-1 rounded"
                  onClick={() => handleDelete(t.transactionNo)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

     
     {/* Edit Modal */}
     {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-md">
          <div className="bg-white p-6 rounded-lg w-1/2 shadow-lg">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Edit Transaction</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>

            {/* Two-Column Form */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div>
                <label className="block font-semibold">Transaction</label>
                <input
                  type="text"
                  name="transaction"
                  value={currentTransaction.transaction}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />

                <label className="block font-semibold mt-2">Last Name</label>
                <input
                  type="text"
                  name="lastname"
                  value={currentTransaction.lastname}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />

                <label className="block font-semibold mt-2">First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={currentTransaction.firstname}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />
              </div>

              {/* Right Column */}
              <div>
                <label className="block font-semibold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={currentTransaction.email}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />

                <label className="block font-semibold mt-2">Bank Details</label>
                <input
                  type="text"
                  name="bankDetails"
                  value={currentTransaction.bankDetails}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />

                <label className="block font-semibold mt-2">Bank</label>
                <input
                  type="text"
                  name="bank"
                  value={currentTransaction.bank}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                />

                <label className="block font-semibold mt-2">Status</label>
                <select
                  name="status"
                  value={currentTransaction.status}
                  onChange={handleChange}
                  className="border p-2 w-full rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-end">
              <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ Export it as default for Next.js pages
export default ContractList;
