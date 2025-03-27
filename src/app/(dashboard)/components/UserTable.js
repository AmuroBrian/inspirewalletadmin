"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const UserTable = ({ adminId }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [deletionStatus, setDeletionStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map((docSnap) => {
        const userData = { id: docSnap.id, ...docSnap.data() };

        // ✅ Preserve Firestore Timestamp
        return {
          ...userData,
          agent: userData.agent ? "Yes" : "No",
          investor: userData.investor ? "Yes" : "No",
          stock: userData.stock ? "Yes" : "No",
        };
      });

      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const updateUserStatus = async (userId, field, newValue) => {
    try {
      // ✅ Retrieve adminId and sessionId from localStorage
      const storedAdminId = localStorage.getItem("adminId");
      const storedSessionId = localStorage.getItem("sessionId");

      if (!storedAdminId || !storedSessionId) {
        console.error("Admin ID or session ID is missing.");
        return;
      }

      console.log("Using Admin ID:", storedAdminId);
      console.log("Using Session ID:", storedSessionId);

      // ✅ Update user field in Firestore
      await updateDoc(doc(db, "users", userId), {
        [field]: newValue === "Yes",
      });

      // ✅ Action Mapping
      const actionMapping = {
        agent: { actionNumber: 0, description: "Updated Agent Status" },
        investor: { actionNumber: 1, description: "Updated Investor Status" },
        stock: { actionNumber: 2, description: "Updated Stockholder Status" },
      };

      // ✅ Create action log object with Firestore timestamp
      const actionLog = {
        actionNumber: actionMapping[field].actionNumber,
        description: actionMapping[field].description,
        userId,
        newValue,
        timestamp: Timestamp.now(), // ✅ Use Firestore's serverTimestamp
      };

      // ✅ Reference to admin history document
      const historyRef = doc(
        db,
        "admin",
        storedAdminId,
        "admin_history",
        storedSessionId
      );

      // ✅ Append the new action to the actions array
      await updateDoc(historyRef, {
        actions: arrayUnion(actionLog),
      });

      console.log("User status updated and action logged successfully.");
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const confirmDeleteUser = (userId) => {
    setDeletingUserId(userId);
    setModalMessage("Are you sure you want to delete this user?");
    setIsDeleteModalOpen(true);
  };

  const deleteUser = async () => {
    if (!deletingUserId) return; // Ensure a valid ID

    try {
      await deleteDoc(doc(db, "users", deletingUserId)); // Firestore deletion
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== deletingUserId)
      ); // Remove from UI immediately
      setDeletionStatus("User successfully deleted.");
      setDeletingUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeletionStatus("Failed to delete user.");
    }

    setIsDeleteModalOpen(false);
    setTimeout(() => setDeletionStatus(""), 3000);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setDeletingUserId(null);
    setEditingUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!editingUser) return;

    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        emailAddress: editingUser.emailAddress,
      });
      console.log("User information updated successfully.");
      closeModal();
    } catch (error) {
      console.error("Error updating user information:", error);
    }
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
              <td className="border p-2">{user.emailAddress || '"Missing"'}</td>
              <td className="border p-2">
                {user.createdAt?.toDate
                  ? user.createdAt.toDate().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A"}
              </td>

              <td className="border p-2">
                <select
                  className="border p-1 rounded"
                  value={user.agent}
                  onChange={(e) =>
                    updateUserStatus(user.id, "agent", e.target.value)
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  className="border p-1 rounded"
                  value={user.investor}
                  onChange={(e) =>
                    updateUserStatus(user.id, "investor", e.target.value)
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td className="border p-2">
                <select
                  className="border p-1 rounded"
                  value={user.stock}
                  onChange={(e) =>
                    updateUserStatus(user.id, "stock", e.target.value)
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </td>
              <td className="border p-2">
                <button
                  className="p-1 text-blue-500"
                  onClick={() => openEditModal(user)}
                >
                  <PencilSquareIcon className="w-5 h-5 inline" />
                </button>

                <button
                  className="p-1 text-red-500"
                  onClick={() => confirmDeleteUser(user.id)}
                >
                  <TrashIcon className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-lg font-bold mb-4">Edit User</h3>
            <input
              type="text"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
              value={editingUser.firstName}
              readOnly
            />
            <input
              type="text"
              className="w-full p-2 mb-2 border border-gray-300 rounded"
              value={editingUser.lastName}
              readOnly
            />
            <input
              type="email"
              className="w-full p-2 mb-4 border border-gray-300 rounded"
              value={editingUser.emailAddress}
              readOnly
            />
            <hr className="my-4" />
            <p className="text-md font-semibold">Financial Details:</p>
            <p className="text-sm">
              Agent Wallet Amount: {editingUser.agentWalletAmount || 0}
            </p>
            <p className="text-sm">
              Available Balance: {editingUser.availBalanceAmount || 0}
            </p>
            <p className="text-sm">
              Stock Amount: {editingUser.stockAmount || 0}
            </p>
            <p className="text-sm">
              Time Deposit: {editingUser.timeDepositAmount || 0}
            </p>
            <p className="text-sm">
              USDT Amount: {editingUser.usdtAmount || 0}
            </p>
            <p className="text-sm">
              Wallet Amount: {editingUser.walletAmount || 0}
            </p>

            <div className="flex justify-end mt-4 space-x-2">
              {isEditing ? (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              ) : (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}

              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false); // Exit edit mode
                  } else {
                    setIsEditing(false); // Reset edit mode
                    closeModal(); // Close the modal
                  }
                }}
              >
                {isEditing ? "Cancel" : "Close"}
              </button>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              {isEditing ? (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              ) : (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}

              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (isEditing) {
                    setIsEditing(false); // Exit edit mode
                  } else {
                    setIsEditing(false); // Reset edit mode
                    closeModal(); // Close the modal
                  }
                }}
              >
                {isEditing ? "Cancel" : "Close"}
              </button>
            </div>




          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
