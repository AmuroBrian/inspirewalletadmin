"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../script/firebaseConfig"; // Ensure the correct Firebase config path
import { collection, getDocs } from "firebase/firestore";

const AdminHistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const adminId = "Modu3tLwegZG7tfHUk9p4UKcgQa2"; // Replace with dynamic admin ID
        const historyRef = collection(db, "admin", adminId, "admin_history");
        const historySnapshot = await getDocs(historyRef);

        const historyData = historySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching admin history:", error);
      }
    };

    fetchHistory();
  }, []);

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
                  {item.loginTime ? new Date(item.loginTime.seconds * 1000).toLocaleString() : "N/A"}
                </td>
                <td className="border p-2">
                  {item.logoutTime ? new Date(item.logoutTime.seconds * 1000).toLocaleString() : "N/A"}
                </td>
                <td className="border p-2">{item.actions || "N/A"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="border p-2 text-center">No history available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminHistoryPage;
