"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const AdminHistoryPage = () => {
  const [history, setHistory] = useState([]);
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
    if (!timestamp || !timestamp.seconds) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="w-[198vh] pl-[17%] mt-4 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-lg font-bold mb-4">Admin History</h2>

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Admin Name</th>
            <th
              className={`border p-2 cursor-pointer ${
                sortConfig.key === "loginTime"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
              onClick={() => handleSort("loginTime")}
            >
              Login Time{" "}
              {sortConfig.key === "loginTime" && (
                <span className="ml-1 text-xl">
                  {sortConfig.order === "asc" ? "▲" : "▼"}
                </span>
              )}
            </th>

            <th
              className={`border p-2 cursor-pointer ${
                sortConfig.key === "logoutTime"
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
              onClick={() => handleSort("logoutTime")}
            >
              Logout Time{" "}
              {sortConfig.key === "logoutTime" && (
                <span className="ml-1 text-xl">
                  {sortConfig.order === "asc" ? "▲" : "▼"}
                </span>
              )}
            </th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{item.adminFullName}</td>
                <td className="border p-2">
                  {formatTimestamp(item.loginTime)}
                </td>
                <td className="border p-2">
                  {formatTimestamp(item.logoutTime)}
                </td>
                <td className="border p-2 text-left">
                  {Array.isArray(item.actions) && item.actions.length > 0 ? (
                    <ul className="list-disc pl-4">
                      {item.actions.map((action, index) => (
                        <li key={index}>
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
