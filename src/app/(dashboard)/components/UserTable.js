"use client";

import { motion } from "framer-motion";
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
  Transaction,
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        try {
          const usersData = snapshot.docs.map((docSnap) => {
            const userData = { id: docSnap.id, ...docSnap.data() };

            return {
              ...userData,
              agent: userData.agent ? "Yes" : "No",
              investor: userData.investor ? "Yes" : "No",
              stock: userData.stock ? "Yes" : "No",
            };
          });

          setUsers(usersData);
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          // Delay setting loading to false for 5 seconds
          setTimeout(() => {
            setLoading(false);
          }, 3000);
        }
      },
      (error) => {
        console.error("Error in Firestore snapshot:", error);
        setLoading(false);
      }
    );

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

      await updateDoc(doc(db, "users", userId), {
        [field]: newValue === "Yes",
      });

      const actionMapping = {
        agent: { actionNumber: 0, description: "Updated Agent Status" },
        investor: { actionNumber: 1, description: "Updated Investor Status" },
        stock: { actionNumber: 2, description: "Updated Stockholder Status" },
        lastName: {actionNumber: 3, description: "Edited Lastname"},
        firstName: {actionNumber: 4, description: "Edited Firstname"},
        agentWallet: {actionNumber: 5, description: "Updated Agent Wallet Amount"},
        availBalance: {actionNumber: 6, description: "Updated Available Balance"},
        stockAmount: {actionNumber: 7, description: "Updated Stock Amount"},
        timeDeposit: {actionNumber: 8, description: "Updated Time Deposit Amount"},
        usdt: {actionNumber: 9, description: "Updated USDT Amount"},
        wallet: {actionNumber: 10, description: "Updated Wallet Amount"},
        stockTransAdd: {actionNumber: 11, description: "Added Stock Amount"},
        stockTransRemove: {actionNumber: 12, description: "Removed Stock Amount"},
        stockTransEdit: {actionNumber: 13, description: "Edited Stock Amount"},
        agentTransAdd: {actionNumber: 14, description: "Added Agent Amount"},
        agentTransRemove: {actionNumber: 15, description: "Removed Agent Amount"},
        agentTransEdit: {actionNumber: 16, description: "Edited Agent Amount"},
        transactionTransAdd: {actionNumber: 17, description: "Added Transaction Amount"},
        transactionTransRemove: {actionNumber: 18, description: "Removed Transaction Amount"},
        TransactionTransEdit: {actionNumber: 19, description: "Edited Transaction Amount"},
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

      // const actionDescriptions = {
      //   agent: "Updated agent status",
      //   investor: "Updated investor status",
      //   stock: "Updated stockholder status",
      // };

      if (adminId && sessionId) {
        await updateDoc(doc(db, "admin", adminId, "admin_history", sessionId), {
          actions: arrayUnion({
            action: `Updated ${field} status`,
            userId,
            newValue,
            timestamp: new Date().toISOString(),
          }),
        });
      }
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
      //setDeletingUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeletionStatus("Failed to delete user.");
    } finally {
      setDeletingUserId(null);
      setIsDeleteModalOpen(false);

      setTimeout(() => setDeletionStatus(""), 3000);
    }
  };

  const openEditModal = (user) => {
    console.log("Editing User Data:", user); // Check if user data is correct
    setEditingUser(user);
    // setIsEditing(true);  // Enable editing
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setDeletingUserId(null);
    setEditingUser(null);
    setIsEditing(false); // Reset editing state
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!editingUser || !editingUser.id) return;

    try {
      const userRef = doc(db, "users", editingUser.id);
      await updateDoc(userRef, {
        firstName: editingUser.firstName || "",
        lastName: editingUser.lastName || "",
        emailAddress: editingUser.emailAddress || "",
        agentWalletAmount: Number(editingUser.agentWalletAmount) || 0,
        availBalanceAmount: Number(editingUser.availBalanceAmount) || 0,
        stockAmount: Number(editingUser.stockAmount) || 0,
        timeDepositAmount: Number(editingUser.timeDepositAmount) || 0,
        usdtAmount: Number(editingUser.usdtAmount) || 0,
        walletAmount: Number(editingUser.walletAmount) || 0,
      });

      console.log("User information updated successfully.");

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...editingUser } : user
        )
      );

      setIsEditing(false); // Disable editing
      setEditingUser(null);
    } catch (error) {
      console.error("Error updating user information:", error);
    }
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
          className="w-20 h-20 rounded-full bg-white shadow-lg flex justify-center items-center overflow-hidden border-2 border-gray-300 ml-10"
        >
          <img
            src="/images/logo.png" // Change this to the actual logo path
            alt="Logo"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Surface */}
        <div className="w-24 h-2 bg-gray-700 rounded-md mt-2 shadow-md relative z-10 ml-10" />
        <p className="mt-2 text-gray-700 font-semibold text-lg ml-10">
          Loading...
        </p>
      </div>
    );
  }

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

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>{modalMessage}</p>
            <div className="mt-4 space-x-4">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={deleteUser}
              >
                Confirm Delete
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 ml-56 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>

            <div className="flex items-center space-x-2">
              <span className=" text-black">First Name: </span>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={editingUser?.firstName || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      firstName: e.target.value,
                    })
                  }
                  className="border rounded-md border-gray-300 w-40"
                />
              ) : (
                <span className=" text-black">{editingUser.firstName}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className=" text-black">Last Name: </span>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={editingUser?.lastName || ""}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, lastName: e.target.value })
                  }
                  className="border rounded-md border-gray-300 w-40"
                />
              ) : (
                <span className=" text-black">{editingUser.lastName}</span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-black">Email Address:</span>
              <span className="text-black">
                {editingUser?.emailAddress || "N/A"}
              </span>
            </div>

            <hr className="my-4" />
            <p className="text-md font-semibold">Financial Details:</p>
            {/* Numeric Fields */}

            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Agent Wallet Amount", key: "agentWalletAmount" },
                { label: "Available Balance", key: "availBalanceAmount" },
                { label: "Stock Amount", key: "stockAmount" },
                { label: "Time Deposit", key: "timeDepositAmount" },
                { label: "USDT Amount", key: "usdtAmount" },
                { label: "Wallet Amount", key: "walletAmount" },
              ].map(({ label, key }) => (
                <div key={key} className="grid grid-cols-2 items-center">
                  {/* First column: Label */}
                  <span className="text-sm font-medium text-black">
                    {label}:
                  </span>

                  {/* Second column: Value/Input */}
                  {isEditing ? (
                    <input
                      type="number"
                      name={key}
                      value={editingUser[key] || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          [key]: e.target.value,
                        })
                      }
                      className="text-sm border rounded-md p-1 border-gray-300 w-full"
                    />
                  ) : (
                    <span className="text-sm text-black -ml-2">
                      {editingUser[key]}
                    </span>
                  )}
                </div>
              ))}
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
