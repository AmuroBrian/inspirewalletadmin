"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, doc, updateDoc, deleteDoc, onSnapshot, getDocs } from "firebase/firestore";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletionStatus, setDeletionStatus] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), async (snapshot) => {
      const usersData = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const userData = { id: docSnap.id, ...docSnap.data() };
  
          // Fetch transactions subcollection to get dateCreated
          const transactionsRef = collection(db, "users", userData.id, "transactions");
          const transactionsSnapshot = await getDocs(transactionsRef);
          let dateCreated = "N/A"; // Default value if no transactions exist

  
          return {
            ...userData,
            dateCreated,
            agent: userData.agent ? "Yes" : "No",
            investor: userData.investor ? "Yes" : "No",
            stock: userData.stock ? "Yes" : "No",
          };
        })
      );
  
      setUsers(usersData);
    });
  
    return () => unsubscribe();
  }, []);
  

  const toggleField = async (userId, field, value) => {
    await updateDoc(doc(db, "users", userId), { [field]: !value });
  };

  const confirmDeleteUser = (userId) => {
    setDeletingUserId(userId);
    setModalMessage("Are you sure you want to delete this user?");
    setIsDeleteModalOpen(true);
  };

  const deleteUser = async () => {
    if (deletingUserId) {
      try {
        await deleteDoc(doc(db, "users", deletingUserId));
        setDeletionStatus("User successfully deleted.");
      } catch (error) {
        setDeletionStatus("Failed to delete user.");
      }
      setIsDeleteModalOpen(false);
      setTimeout(() => setDeletionStatus(""), 3000);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setDeletingUserId(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full mt-4 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-bold mb-4">User List</h2>

      <input
        type="text"
        placeholder="Search by Firstname or Lastname"
        className="w-full p-2 mb-4 border border-gray-300 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Lastname</th>
            <th className="border p-2">Firstname</th>
            <th className="border p-2">Email Address</th>
            <th className="border p-2">Date Created</th>
            <th className="border p-2">Agent</th>
            <th className="border p-2">Investor</th>
            <th className="border p-2">Stockholder</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border p-2">{user.lastName}</td>
              <td className="border p-2">{user.firstName}</td>
              <td className="border p-2">{user.emailAddress}</td>
              <td className="border p-2">{user.createdAt}</td>
              <td className="border p-2">{user.agent}</td>
              <td className="border p-2">{user.investor}</td>
              <td className="border p-2">{user.stock}</td>
              <td className="border p-2">
                <button className="p-1 text-blue-500">
                  <PencilSquareIcon className="w-5 h-5 inline" />
                </button>
                <button className="p-1 text-red-500" onClick={() => confirmDeleteUser(user.id)}>
                  <TrashIcon className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>{modalMessage}</p>
            <div className="flex justify-end mt-4">
              <button className="bg-gray-500 text-white px-4 py-2 rounded mr-2" onClick={closeModal}>Cancel</button>
              <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={deleteUser}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {deletionStatus && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-3 rounded shadow-md">
          {deletionStatus}
        </div>
      )}
    </div>
  );
};

export default UserTable;
