"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig"; // Ensure correct Firebase config path
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

const AdminHistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const adminId = "Modu3tLwegZG7tfHUk9p4UKcgQa2"; // Replace with dynamic admin ID
        const historyRef = collection(db, "admin", adminId, "admin_history");
        const historySnapshot = await getDocs(historyRef);

        const historyData = await Promise.all(
          historySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();

            // Fetch full names for each action's userId
            const updatedActions = await Promise.all(
              (data.actions || []).map(async (action) => {
                if (action.userId) {
                  const userRef = doc(db, "users", action.userId); // Adjust path as needed
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

            return { id: docSnap.id, ...data, actions: updatedActions };
          })
        );

        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching admin history:", error);
      }
    };

    fetchHistory();
  }, []);

  // Function to safely format timestamps
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
            <th className="border p-2">Full Name</th>
            <th className="border p-2">Login Time</th>
            <th className="border p-2">Logout Time</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="border p-2">{item.fullName || "N/A"}</td>
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
