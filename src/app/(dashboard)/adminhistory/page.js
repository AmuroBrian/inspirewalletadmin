"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const AdminHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({
    key: "loginTime", // Default sort by login time
    order: "desc", // Default descending order
  });

  useEffect(() => {
    const fetchAllAdminHistories = async () => {
      try {
        // Step 1: Fetch all admins from the "admin" collection
        const adminRef = collection(db, "admin");
        const adminSnapshot = await getDocs(adminRef);

        const admins = adminSnapshot.docs.map((adminDoc) => ({
          adminId: adminDoc.id,
          adminFullName: adminDoc.data().fullName || "Unknown Admin",
        }));

        // Step 2: Fetch histories for each admin
        const allHistories = await Promise.all(
          admins.map(async ({ adminId, adminFullName }) => {
            const historyRef = collection(
              db,
              "admin",
              adminId,
              "admin_history"
            );
            const historySnapshot = await getDocs(historyRef);

            return Promise.all(
              historySnapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();

                // Fetch full names for each action's userId
                const updatedActions = await Promise.all(
                  (data.actions || []).map(async (action) => {
                    if (action.userId) {
                      const userRef = doc(db, "users", action.userId);
                      const userSnap = await getDoc(userRef);

                      if (userSnap.exists()) {
                        const userData = userSnap.data();
                        action.fullName =
                          `${userData.firstName || ""} ${
                            userData.lastName || ""
                          }`.trim() || "Unknown User";
                      } else {
                        action.fullName = "Unknown User";
                      }
                    }
                    return action;
                  })
                );

                return {
                  id: docSnap.id,
                  adminFullName,
                  ...data,
                  actions: updatedActions,
                };
              })
            );
          })
        );

        const flattenedHistory = allHistories.flat();

        // Step 3: Sort by default (loginTime in descending order)
        const sortedHistory = sortHistory(
          flattenedHistory,
          "loginTime",
          "desc"
        );
        setHistory(sortedHistory);
      } catch (error) {
        console.error("Error fetching admin histories:", error);
      } finally {
        // Delay setting loading to false for 5 seconds
        setTimeout(() => {
          setLoading(false);
        }, 3000);
      }
    };

    fetchAllAdminHistories();
  }, []);

  // Sorting function
  const sortHistory = (data, key, order) => {
    return data.sort((a, b) => {
      const timeA = a[key]?.seconds || 0;
      const timeB = b[key]?.seconds || 0;

      return order === "asc" ? timeA - timeB : timeB - timeA;
    });
  };

  // Handle sorting when clicking the column
  const handleSort = (key) => {
    const newOrder =
      sortConfig.key === key && sortConfig.order === "desc" ? "asc" : "desc";

    setSortConfig({ key, order: newOrder });
    setHistory(sortHistory([...history], key, newOrder));
  };

  // Helper function to format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "Not Logged out";
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

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
    <div className="w-full mt-4 p-4 bg-white shadow-md rounded-lg overflow-x-auto max-w-[83%] mx-auto lg:ml-[250px]">
      <h2 className="text-lg font-bold mb-4">Admin History</h2>

      <table className="w-full mx-auto border-collapse border border-gray-300 text-sm lg:text-base">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2 whitespace-nowrap w-[180px]">
              Admin Name
            </th>
            <th
              className={`border px-3 py-2 cursor-pointer whitespace-nowrap w-[160px] ${
                sortConfig.key === "loginTime"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
              onClick={() => handleSort("loginTime")}
            >
              Login Time{" "}
              {sortConfig.key === "loginTime" && (
                <span className="ml-1 text-base">
                  {sortConfig.order === "asc" ? "▲" : "▼"}
                </span>
              )}
            </th>

            <th
              className={`border px-3 py-2 cursor-pointer whitespace-nowrap w-[160px] ${
                sortConfig.key === "logoutTime"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
              onClick={() => handleSort("logoutTime")}
            >
              Logout Time{" "}
              {sortConfig.key === "logoutTime" && (
                <span className="ml-1 text-base">
                  {sortConfig.order === "asc" ? "▲" : "▼"}
                </span>
              )}
            </th>
            <th className="border px-4 py-2 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((item) => (
              <tr key={item.id} className="text-center align-top">
                <td className="border px-3 py-2 break-words max-w-[180px]">
                  {item.adminFullName}
                </td>
                <td className="border px-3 py-2 whitespace-nowrap">
                  {formatTimestamp(item.loginTime)}
                </td>
                <td className="border px-3 py-2 whitespace-nowrap">
                  {formatTimestamp(item.logoutTime)}
                </td>
                <td className="border px-4 py-2 text-left break-words max-w-[300px]">
                  {Array.isArray(item.actions) && item.actions.length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {item.actions.map((action, index) => (
                        <li
                          key={index}
                          className="text-xs lg:text-sm break-words"
                        >
                          {action.description || "Action performed"} (User:{" "}
                          {action.fullName || "Unknown"}) at{" "}
                          {formatTimestamp(action.timestamp)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "No actions recorded"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border p-2 text-center">
                No history available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHistoryPage;
