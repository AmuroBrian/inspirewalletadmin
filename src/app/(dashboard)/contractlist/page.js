"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { db } from "../../../../script/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc, // ✅ Add this import
  Timestamp, // ✅ Add this import
  arrayUnion,
} from "firebase/firestore";

import { usePathname } from "next/navigation";

const pathTitleMap = {
  "/main": "Dashboard",
  "/adminhistory": "Admin History",
  "/transactionhistory": "Transaction List",
  "/contractlist": "Contract List",
  "/servicelist": "Service List",
  "/notifications": "Notifications",
};

export default function UserList() {
   const pathname = usePathname(); // ✅ Correct: inside component
    const currentTitle = pathTitleMap[pathname] || "Admin Dashboard";
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [investmentProfile, setInvestmentProfile] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedTransaction, setEditedTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        // Delay setting loading to false for 5 seconds
        setTimeout(() => {
          setLoading(false);
        }, 5000);
      }
    };

    fetchUsers();
  }, []);

  const fetchInvestmentProfiles = async (userId) => {
    try {
      const investmentCollectionRef = collection(
        db,
        "users",
        userId,
        "investmentProfiles"
      );
      const investmentSnap = await getDocs(investmentCollectionRef);

      if (!investmentSnap.empty) {
        const profiles = investmentSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setInvestmentProfile(profiles);
      } else {
        setInvestmentProfile([]);
      }
    } catch (error) {
      console.error("Error fetching investment profiles:", error);
      setInvestmentProfile([]);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchInvestmentProfiles(user.id);
  };

  const handleEdit = (profile) => {
    setEditingId(profile.id);
    setEditedTransaction({
      amount: profile.amount,
      interestRate: profile.interestRate || "", // ✅ Added interestRate
      date: profile.dateOfMaturity
        ? new Date(profile.dateOfMaturity.seconds * 1000)
            .toISOString()
            .split("T")[0]
        : "",
    });
  };

  const handleChange = (e, field) => {
    setEditedTransaction((prev) => ({
      ...prev,
      [field]: field === "amount" ? Number(e.target.value) : e.target.value,
    }));
  };

  const updateUserStatus = async (userId, field, newValue) => {
    try {
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

      const historyRef = doc(
        db,
        "admin",
        storedAdminId,
        "admin_history",
        storedSessionId
      );

      // ✅ Append the new action to the `actions` array
      await updateDoc(historyRef, {
        actions: arrayUnion(actionLog),
      });

      console.log("User status updated and action logged successfully.");
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const saveEdit = async () => {
    if (!selectedUser || !editingId) return;

    try {
      const transactionDoc = doc(
        db,
        `users/${selectedUser.id}/investmentProfiles`,
        editingId
      );
      const transactionSnap = await getDoc(transactionDoc);

      if (!transactionSnap.exists()) {
        console.error("Transaction not found!");
        return;
      }

      const oldData = transactionSnap.data();
      const newData = {
        amount: Number(editedTransaction.amount),
        interestRate: Number(editedTransaction.interestRate),
        dateOfMaturity: Timestamp.fromDate(new Date(editedTransaction.date)),
      };

      await updateDoc(transactionDoc, newData);

      setInvestmentProfile((prev) =>
        prev.map((trans) =>
          trans.id === editingId ? { ...trans, ...newData } : trans
        )
      );

      const storedAdminId = localStorage.getItem("adminId");
      const storedSessionId = localStorage.getItem("sessionId");
      const adminName = localStorage.getItem("adminName"); // Assuming admin name is stored

      if (!storedAdminId || !storedSessionId) {
        console.error("Admin ID or Session ID is missing!");
        return;
      }

      const historyRef = doc(
        db,
        "admin",
        storedAdminId,
        "admin_history",
        storedSessionId
      );

      let actions = [];

      if (oldData.amount !== newData.amount) {
        actions.push({
          actionNumber: "20",
          userId: selectedUser.id,
          description: `Updated Contract Amount: from ${oldData.amount} to ${newData.amount}`,
          oldValue: oldData.amount,
          newValue: newData.amount,
          timestamp: Timestamp.now(),
        });
      }

      if (oldData.interestRate !== newData.interestRate) {
        actions.push({
          actionNumber: "22",
          userId: selectedUser.id,
          description: `Updated Contract Interest Rate: from ${oldData.interestRate}% to ${newData.interestRate}%`,
          oldValue: `${oldData.interestRate}%`,
          newValue: `${newData.interestRate}%`,
          timestamp: Timestamp.now(),
        });
      }

      if (
        oldData.dateOfMaturity.toDate().toISOString() !==
        newData.dateOfMaturity.toDate().toISOString()
      ) {
        actions.push({
          actionNumber: "21",
          userId: selectedUser.id,
          description: `Updated Contract Date Of Maturity: from ${oldData.dateOfMaturity
            .toDate()
            .toLocaleDateString()} to ${newData.dateOfMaturity
            .toDate()
            .toLocaleDateString()}`,
          oldValue: oldData.dateOfMaturity.toDate().toLocaleDateString(),
          newValue: newData.dateOfMaturity.toDate().toLocaleDateString(),
          timestamp: Timestamp.now(),
        });
      }

      if (actions.length > 0) {
        for (const action of actions) {
          await updateDoc(historyRef, {
            actions: arrayUnion(action), // Add each action separately
          });
        }

        console.log(
          "Transaction updated and logged in admin history:",
          actions
        );
      } else {
        console.log("No changes were made to log.");
      }

      setEditingId(null);
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDelete = async (transactionId) => {
    try {
      await deleteDoc(
        doc(db, `users/${selectedUser.id}/investmentProfiles`, transactionId)
      );
      setInvestmentProfile((prev) =>
        prev.filter((trans) => trans.id !== transactionId)
      );
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleNewChange = (e, field) => {
    setNewTransaction((prev) => ({
      ...prev,
      [field]:
        field === "amount" || field === "interestRate"
          ? Number(e.target.value)
          : e.target.value,
    }));
  };

  const saveNewTransaction = async () => {
    if (
      !newTransaction?.amount ||
      !newTransaction?.dateOfMaturity ||
      !newTransaction?.interestRate
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (!selectedUser) {
      alert("No user selected");
      return;
    }

    const maturityDate = new Date(newTransaction.dateOfMaturity);
    if (isNaN(maturityDate)) {
      alert("Invalid date value");
      return;
    }

    try {
      const transactionRef = collection(
        db,
        `users/${selectedUser.id}/investmentProfiles`
      );

      const docRef = await addDoc(transactionRef, {
        amount: Number(newTransaction.amount),
        interestRate: Number(newTransaction.interestRate),
        dateOfMaturity: Timestamp.fromDate(maturityDate),
      });

      setInvestmentProfile((prev) => [
        ...prev,
        {
          id: docRef.id,
          amount: Number(newTransaction.amount),
          interestRate: Number(newTransaction.interestRate),
          dateOfMaturity: Timestamp.fromDate(maturityDate),
        },
      ]);

      const storedAdminId = localStorage.getItem("adminId");
      const storedSessionId = localStorage.getItem("sessionId");

      if (!storedAdminId || !storedSessionId) {
        console.error("Admin ID or Session ID is missing!");
        return;
      }

      const historyRef = doc(
        db,
        "admin",
        storedAdminId,
        "admin_history",
        storedSessionId
      );

      const actionLog = {
        actionNumber: 23,
        userId: selectedUser.id,
        description: `Added new investment profile with amount ₱${
          newTransaction.amount
        }, interest rate ${
          newTransaction.interestRate
        }%, and maturity date ${maturityDate.toLocaleDateString()}`,
        newValue: {
          amount: newTransaction.amount,
          interestRate: newTransaction.interestRate,
          dateOfMaturity: maturityDate.toLocaleDateString(),
        },
        timestamp: Timestamp.now(),
      };

      await updateDoc(historyRef, {
        actions: arrayUnion(actionLog),
      });

      console.log("New transaction saved and logged.");
      setNewTransaction(null);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleAddTransaction = () => {
    setNewTransaction({
      amount: "",
      dateOfMaturity: new Date().toISOString().split("T")[0], // Default to today's date
      interestRate: "",
    });
  };

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
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
    <>
    <h1
            className="
              text-base md:text-lg lg:text-xl font-semibold
              text-left lg:text-center
              w-full lg:w-auto
              lg:ml-56 xl:ml-0 mt-24 -mb-16
              lg:flex-1
              text-[#1F2937]
            "
          >
          Welcome to  {currentTitle}
          </h1>
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
          <table className="min-w-full bg-white border border-gray-200 table-fixed">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 border flex justify-start">Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUserClick(user)}
                >
                  <td className="p-2 border">
                    {user.firstName} {user.lastName}
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[50%] relative ml-60">
            <button
              className="absolute top-2 right-2 text-gray-600 text-lg font-bold"
              onClick={() => {
                setSelectedUser(null);
                setEditingId(null); // Reset edit mode
                setEditedTransaction(null); // Reset edited data
              }}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {selectedUser.firstName} {selectedUser.lastName}
            </h2>
            <table className="w-full border border-gray-200 text-center table-fixed">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-2 border w-32">Amount</th>
                  <th className="p-2 border w-34">Date Of Maturity</th>
                  <th className="p-2 border w-20">Interest Rate</th>
                  <th className="p-2 border w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investmentProfile.length > 0 ? (
                  investmentProfile.map((profile) => (
                    <tr key={profile.id} className="border-b">
                      {editingId === profile.id ? (
                        <>
                          <td className="p-2 border w-24">
                            <input
                              type="number"
                              value={editedTransaction.amount}
                              onChange={(e) => handleChange(e, "amount")}
                              className="border rounded p-1 w-full"
                            />
                          </td>
                          <td className="p-2 border w-32">
                            <input
                              type="date"
                              value={editedTransaction.dateOfMaturity}
                              onChange={(e) =>
                                handleChange(e, "dateOfMaturity")
                              }
                              className="border p-1 w-full text-center"
                            />
                          </td>
                          <td className="p-2 border w-20">
                            <input
                              type="number"
                              value={editedTransaction.interestRate}
                              onChange={(e) => handleChange(e, "interestRate")}
                              className="border p-1 w-full text-center"
                            />
                          </td>
                          <td className="p-2 border w-16">
                            <button
                              onClick={saveEdit}
                              className="p-2 text-green-500 hover:bg-green-100"
                            >
                              ✔
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-red-500 hover:bg-red-100"
                            >
                              ✖
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-2 border w-24 truncate">
                            {profile.amount}
                          </td>
                          <td className="p-2 border w-32 truncate">
                            {profile.dateOfMaturity
                              ? new Date(
                                  profile.dateOfMaturity.seconds * 1000
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </td>
                          <td className="p-2 border w-20 truncate">
                            {profile.interestRate}%
                          </td>
                          <td className="p-2 border gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(profile)}
                              className="p-2 hover:bg-blue-100"
                            >
                              ✏️
                            </button>
                            <button
                              className="p-2 hover:bg-red-100"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this?"
                                  )
                                ) {
                                  handleDelete(profile.id); // ✅ Correct function name
                                }
                              }}
                            >
                              🗑
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-gray-500">
                      No investment profiles found.
                    </td>
                  </tr>
                )}

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
                        value={newTransaction.dateOfMaturity}
                        onChange={(e) => handleNewChange(e, "dateOfMaturity")}
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="number"
                        className="border rounded p-1 w-full"
                        value={newTransaction.interestRate}
                        onChange={(e) => handleNewChange(e, "interestRate")}
                      />
                    </td>
                    <td className="p-2 border">
                      <button
                        className="p-2 text-green-500 hover:bg-green-100"
                        onClick={saveNewTransaction}
                      >
                        ✔
                      </button>
                      <button
                        className="p-2 text-red-500 hover:bg-red-100"
                        onClick={() => setNewTransaction(null)}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

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
    </>
  );
}
