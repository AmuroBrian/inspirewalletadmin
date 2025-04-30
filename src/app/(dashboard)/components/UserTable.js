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
  getDoc,
} from "firebase/firestore";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import { usePathname } from "next/navigation";

const pathTitleMap = {
  "/main": "Dashboard",
  "/adminhistory": "Admin History",
  "/transactionhistory": "Transaction List",
  "/contractlist": "Contract List",
  "/servicelist": "Service List",
  "/notifications": "Notifications",
};

const UserTable = ({ adminId }) => {
  const pathname = usePathname(); // ✅ Correct: inside component
  const currentTitle = pathTitleMap[pathname] || "Admin Dashboard";
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState(""); // 'agent' or 'balance'
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedWithdrawType, setSelectedWithdrawType] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [remainingBalance, setRemainingBalance] = useState(null);
  const [withdrawError, setWithdrawError] = useState("");
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isDepositDetailsOpen, setIsDepositDetailsOpen] = useState(false);
  const [depositType, setDepositType] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
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

  useEffect(() => {
    const fetchBalance = async () => {
      if (!selectedUser || !selectedWithdrawType) return;

      const userRef = doc(db, "users", selectedUser.id);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const balance =
          selectedWithdrawType === "agent"
            ? data.agentWalletAmount
            : data.availBalanceAmount;
        setRemainingBalance(balance ?? 0);
      }
    };

    fetchBalance();
  }, [selectedWithdrawType, selectedUser]);

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
        lastName: { actionNumber: 3, description: "Edited Lastname" },
        firstName: { actionNumber: 4, description: "Edited Firstname" },
        agentWallet: {
          actionNumber: 5,
          description: "Updated Agent Wallet Amount",
        },
        availBalance: {
          actionNumber: 6,
          description: "Updated Available Balance",
        },
        stockAmount: { actionNumber: 7, description: "Updated Stock Amount" },
        timeDeposit: {
          actionNumber: 8,
          description: "Updated Time Deposit Amount",
        },
        usdt: { actionNumber: 9, description: "Updated USDT Amount" },
        wallet: { actionNumber: 10, description: "Updated Wallet Amount" },
        stockTransAdd: { actionNumber: 11, description: "Added Stock Amount" },
        stockTransRemove: {
          actionNumber: 12,
          description: "Removed Stock Amount",
        },
        stockTransEdit: {
          actionNumber: 13,
          description: "Edited Stock Amount",
        },
        agentTransAdd: { actionNumber: 14, description: "Added Agent Amount" },
        agentTransRemove: {
          actionNumber: 15,
          description: "Removed Agent Amount",
        },
        agentTransEdit: {
          actionNumber: 16,
          description: "Edited Agent Amount",
        },
        transactionTransAdd: {
          actionNumber: 17,
          description: "Added Transaction Amount",
        },
        transactionTransRemove: {
          actionNumber: 18,
          description: "Removed Transaction Amount",
        },
        TransactionTransEdit: {
          actionNumber: 19,
          description: "Edited Transaction Amount",
        },
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

  const openWithdrawModal = async (user, type) => {
    setSelectedUser(user);
    setIsWithdrawModalOpen(true);
    setSelectedWithdrawType(type);

    const userRef = doc(db, "users", user.id);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Determine which balance to show
      const balance =
        type === "agent" ? data.agentWalletAmount : data.availBalanceAmount;

      setRemainingBalance(balance ?? 0); // Ensure it sets a number
    } else {
      console.error("User not found.");
      setRemainingBalance(0); // Avoid leaving it undefined
    }
  };

  const handleWithdrawTypeSelect = async (type) => {
    setWithdrawType(type);
    setIsWithdrawModalOpen(false);
    setIsDetailsModalOpen(true);

    if (!selectedUser) return;

    try {
      const userRef = doc(db, "users", selectedUser.id); // or .uid if that’s what your user object uses
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const balance =
          type === "agent" ? data.agentWalletAmount : data.availBalanceAmount;
        setRemainingBalance(balance ?? 0);
      } else {
        console.error("User not found");
        setRemainingBalance(0);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setRemainingBalance(0);
    }
  };

  const handleConfirm = async () => {
    const amountToWithdraw = Number(withdrawAmount);

    if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
      window.alert("Please enter a valid withdrawal amount greater than 0.");
      return;
    }

    if (!selectedUser || !selectedWithdrawType) return;

    try {
      const userRef = doc(db, "users", selectedUser.id);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.error("User not found for withdrawal");
        return;
      }

      const data = docSnap.data();
      const currentBalance =
        selectedWithdrawType === "agent"
          ? data.agentWalletAmount
          : data.availBalanceAmount;

      if (amountToWithdraw > currentBalance) {
        window.alert("Withdrawal amount exceeds available balance.");
        setWithdrawAmount("");
        return;
      }

      const newBalance = currentBalance - amountToWithdraw;

      // Update Firestore
      await updateDoc(userRef, {
        [selectedWithdrawType === "agent"
          ? "agentWalletAmount"
          : "availBalanceAmount"]: newBalance,
      });

      console.log(
        `✅ Updated ${
          selectedWithdrawType === "agent"
            ? "agentWalletAmount"
            : "availBalanceAmount"
        } to ₱${newBalance}`
      );

      // Reset state
      setWithdrawAmount("");
      setSelectedWithdrawType("");
      setIsDetailsModalOpen(false);
      setRemainingBalance(newBalance); // Update local UI too

      // ✅ Refresh editingUser with updated data
      const updatedUser = await fetchUserDetails(selectedUser.id);
      setEditingUser(updatedUser); // This will refresh the modal content
    } catch (error) {
      console.error("❌ Error processing withdrawal:", error);
    }
  };

  const handleDepositTypeSelect = (type) => {
    setDepositType(type);
    setIsDepositModalOpen(false);
    setIsDepositDetailsOpen(true);
  };

  const handleDepositConfirm = async () => {
    const amountToDeposit = Number(depositAmount);

    if (isNaN(amountToDeposit) || amountToDeposit <= 0) {
      window.alert("Please enter a valid deposit amount greater than 0.");
      return;
    }

    if (!selectedUser || !depositType) return;

    try {
      const userRef = doc(db, "users", selectedUser.id);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        console.error("User not found for deposit");
        return;
      }

      const data = docSnap.data();
      const fieldMap = {
        agent: "agentWalletAmount",
        balance: "availBalanceAmount",
        timedeposit: "timeDepositAmount",
      };

      const selectedField = fieldMap[depositType];
      const currentBalance = data[selectedField] || 0;
      const newBalance = currentBalance + amountToDeposit;

      await updateDoc(userRef, {
        [selectedField]: newBalance,
      });

      console.log(`✅ Deposited ₱${amountToDeposit} to ${selectedField}`);

      setDepositAmount("");
      setDepositType("");
      setIsDepositDetailsOpen(false);

      const updatedUser = await fetchUserDetails(selectedUser.id);
      setEditingUser(updatedUser);
    } catch (error) {
      console.error("❌ Error processing deposit:", error);
    }
  };

  const fetchUserDetails = async (userId) => {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  };

  const handleCancel = () => {
    setWithdrawAmount("");
    setSelectedWithdrawType("");
    setIsDetailsModalOpen(false);
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

      // ✅ Fetch old user data
      const oldUserSnapshot = await getDoc(userRef);
      const oldUserData = oldUserSnapshot.exists()
        ? oldUserSnapshot.data()
        : {};

      // ✅ Check for changes
      const changes = [];

      // Check for text fields (firstName, lastName)
      if (oldUserData.firstName !== editingUser.firstName) {
        changes.push({
          field: "firstName",
          oldValue: oldUserData.firstName,
          newValue: editingUser.firstName,
        });
      }
      if (oldUserData.lastName !== editingUser.lastName) {
        changes.push({
          field: "lastName",
          oldValue: oldUserData.lastName,
          newValue: editingUser.lastName,
        });
      }

      // Check for numeric fields (agentWalletAmount, availBalanceAmount, stockAmount, timeDepositAmount, usdtAmount, walletAmount)
      const numericFields = [
        "agentWalletAmount",
        "availBalanceAmount",
        "stockAmount",
        "timeDepositAmount",
        "usdtAmount",
        "walletAmount",
      ];

      numericFields.forEach((field) => {
        if (oldUserData[field] !== editingUser[field]) {
          changes.push({
            field,
            oldValue: oldUserData[field],
            newValue: editingUser[field],
          });
        }
      });

      // ✅ Update user document
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

      console.log("✅ User information updated successfully.");

      // ✅ Get logged-in admin ID and session ID
      const storedAdminId = localStorage.getItem("adminId"); // Admin ID
      const storedSessionId = localStorage.getItem("sessionId"); // Session ID

      if (storedAdminId && storedSessionId && changes.length > 0) {
        // ✅ Firestore path: /admin/{adminId}/admin_history/{sessionId}
        const historyRef = doc(
          db,
          "admin",
          storedAdminId,
          "admin_history",
          storedSessionId
        );

        for (const change of changes) {
          const actionLog = {
            actionNumber:
              change.field === "firstName" || change.field === "lastName"
                ? 4
                : 3, // Define action codes
            description: `Updated ${change.field} from "${change.oldValue}" to "${change.newValue}"`,
            newValue: change.newValue,
            userId: editingUser.id,
            timestamp: Timestamp.now(),
          };

          // ✅ Append change log under session-based history
          await updateDoc(historyRef, {
            actions: arrayUnion(actionLog),
          })
            .then(() => {
              console.log("✅ Action logged successfully in admin history.");
            })
            .catch((error) => {
              console.error("❌ Error logging action:", error);
            });
        }
      }

      // ✅ Update UI
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id ? { ...user, ...editingUser } : user
        )
      );

      setIsEditing(false);
      setEditingUser(null);
    } catch (error) {
      console.error("❌ Error updating user information:", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(search.toLowerCase())
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
    <>
      <h1
        className="
              text-base md:text-lg lg:text-xl font-semibold
              text-left lg:text-center
              w-full lg:w-auto
              lg:ml-11 xl:ml-0 mt-16 -mb-16
              lg:flex-1
              text-[#1F2937]
            "
      >
        Welcome to {currentTitle}
      </h1>

      <div className="overflow-x-auto mt-20">
        <input
          type="text"
          placeholder="Search by Firstname or Lastname"
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table className="min-w-full text-sm text-gray-800">
          <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="border p-2 w-[120px]">Lastname</th>
              <th className="border p-2 w-[120px]">Firstname</th>
              <th className="border p-2">Email Address</th>
              <th className="border p-2 w-[100px]">Date Created</th>
              <th className="border p-2">Agent</th>
              <th className="border p-2">Investor</th>
              <th className="border p-2">Stockholder</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 text-center">
                <td className="border p-2">{user.lastName}</td>
                <td className="border p-2">{user.firstName}</td>
                <td className="border p-2">
                  {user.emailAddress || (
                    <span className="italic text-red-400">"Missing"</span>
                  )}
                </td>
                <td className="border p-2">
                  {user.createdAt?.toDate ? (
                    user.createdAt.toDate().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  ) : (
                    <span className="italic text-red-400">N/A</span>
                  )}
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
                <td className="border p-2 space-x-2">
                  <button
                    className="p-1 text-blue-600 hover:text-blue-800 transition"
                    onClick={() => openEditModal(user)}
                  >
                    <PencilSquareIcon className="w-5 h-5 inline" />
                  </button>

                  <button
                    className="p-1 text-red-600 hover:text-red-800 transition"
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
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 ml-56 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Edit User
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <span className=" text-gray-700 capitalize">First Name: </span>
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

              <div className="flex flex-wrap items-center gap-2">
                <span className=" text-black">Last Name: </span>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={editingUser?.lastName || ""}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        lastName: e.target.value,
                      })
                    }
                    className="border rounded-md border-gray-300 w-40"
                  />
                ) : (
                  <span className=" text-black">{editingUser.lastName}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
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

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  className={`px-4 py-2 rounded ${
                    isEditing
                      ? "bg-purple-300 cursor-not-allowed"
                      : "bg-purple-600"
                  } text-white`}
                  onClick={() => {
                    setSelectedUser(editingUser);
                    setIsDepositModalOpen(true); // You need to define this state and modal
                  }}
                  disabled={isEditing}
                >
                  Deposit
                </button>

                <button
                  className={`px-4 py-2 rounded ${
                    isEditing ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500"
                  } text-white`}
                  onClick={() => {
                    setSelectedUser(editingUser); // ✅ this is defined
                    setIsWithdrawModalOpen(true);
                  }}
                  disabled={isEditing}
                >
                  Withdraw
                </button>

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

        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
              <h2 className="text-lg font-semibold mb-4">
                Select Withdrawal Type
              </h2>
              <div className="flex justify-between gap-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
                  onClick={() => {
                    handleWithdrawTypeSelect("agent");
                    openWithdrawModal(selectedUser, "agent"); // 👈 fetches balance
                    setIsWithdrawModalOpen(false);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  Agent Withdrawal
                </button>

                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                  onClick={() => {
                    handleWithdrawTypeSelect("balance");
                    openWithdrawModal(selectedUser, "balance"); // 👈 fetches balance
                    setIsWithdrawModalOpen(false);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  Balance Withdrawal
                </button>
              </div>

              <button
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                onClick={() => setIsWithdrawModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isDetailsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4 text-left capitalize">
                {withdrawType} withdrawal
              </h2>

              <div className="flex justify-between text-sm mb-1">
                <label className="font-medium text-gray-700">
                  {withdrawType === "agent"
                    ? "Agent Withdrawal"
                    : "Balance Withdrawal"}
                </label>
                <span className="text-gray-500">
                  Remaining Balance:{" "}
                  {remainingBalance !== null
                    ? `₱${remainingBalance}`
                    : "Loading..."}
                </span>
              </div>
              <input
                type="number"
                min="0"
                placeholder="Enter amount"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />

              <div className="flex justify-center gap-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirm}
                  disabled={withdrawAmount < 0 || withdrawAmount === ""}
                >
                  Confirm
                </button>
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                  onClick={() => setWithdrawAmount("")}
                >
                  Clear
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isDepositModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
              <h2 className="text-lg font-semibold mb-4">
                Select where to deposit funds
              </h2>
              <div className="flex flex-col gap-3">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  onClick={() => handleDepositTypeSelect("agent")}
                >
                  Agent Wallet
                </button>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={() => handleDepositTypeSelect("balance")}
                >
                  Available Balance
                </button>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
                  onClick={() => handleDepositTypeSelect("timedeposit")}
                >
                  Time Deposit
                </button>
              </div>
              <button
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                onClick={() => setIsDepositModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isDepositDetailsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4 capitalize text-left">
                {depositType} deposit
              </h2>

              <input
                type="number"
                min="0"
                placeholder="Enter deposit amount"
                className="w-full border border-gray-300 rounded px-3 py-2 mb-6"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />

              <div className="flex justify-center gap-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={handleDepositConfirm}
                  disabled={depositAmount < 0 || depositAmount === ""}
                >
                  Confirm
                </button>
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                  onClick={() => setDepositAmount("")}
                >
                  Clear
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setIsDepositDetailsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[30%] max-h-[80vh] overflow-auto ml-60">
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
      </div>
    </>
  );
};

export default UserTable;
