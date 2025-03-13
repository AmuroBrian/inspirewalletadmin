// src/components/UserTable.js
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig"; // Import Firestore
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const UserTable = () => {
  const [users, setUsers] = useState([]);

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    };
    fetchUsers();
  }, []);

  // Toggle Yes/No for agent, investor, or stocks
  const toggleField = async (userId, field, value) => {
    await updateDoc(doc(db, "users", userId), { [field]: !value });
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, [field]: !value } : user))
    );
  };

  // Delete user
  const deleteUser = async (userId) => {
    await deleteDoc(doc(db, "users", userId));
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  return (
    <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-bold mb-4">User List</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Lastname</th>
            <th className="border p-2">Firstname</th>
            <th className="border p-2">Email Address</th>
            <th className="border p-2">Date Created</th>
            <th className="border p-2">Agent</th>
            <th className="border p-2">Investor</th>
            <th className="border p-2">Stocks</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border p-2">{user.lastname}</td>
              <td className="border p-2">{user.firstname}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.dateCreated}</td>
              <td className="border p-2">
                <button
                  className={`px-2 py-1 rounded ${user.agent ? "bg-green-500" : "bg-red-500"} text-white`}
                  onClick={() => toggleField(user.id, "agent", user.agent)}
                >
                  {user.agent ? "Yes" : "No"}
                </button>
              </td>
              <td className="border p-2">
                <button
                  className={`px-2 py-1 rounded ${user.investor ? "bg-green-500" : "bg-red-500"} text-white`}
                  onClick={() => toggleField(user.id, "investor", user.investor)}
                >
                  {user.investor ? "Yes" : "No"}
                </button>
              </td>
              <td className="border p-2">
                <button
                  className={`px-2 py-1 rounded ${user.stocks ? "bg-green-500" : "bg-red-500"} text-white`}
                  onClick={() => toggleField(user.id, "stocks", user.stocks)}
                >
                  {user.stocks ? "Yes" : "No"}
                </button>
              </td>
              <td className="border p-2">
                <button className="p-1 text-blue-500">
                  <PencilSquareIcon className="w-5 h-5 inline" />
                </button>
                <button className="p-1 text-red-500" onClick={() => deleteUser(user.id)}>
                  <TrashIcon className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
