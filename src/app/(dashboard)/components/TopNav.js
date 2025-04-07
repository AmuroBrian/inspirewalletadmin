"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore"; // Import serverTimestamp
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { db } from "../../../../script/firebaseConfig"; // Firebase config

const TopNav = () => {
  const [adminId, setAdminId] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const auth = getAuth(); // Firebase Authentication instance

  // Fetch the logged-in admin's ID from Firebase Auth and Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminRef = doc(db, "admin", user.uid); // Assuming adminId = user.uid
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists()) {
            setAdminId(user.uid); // Set the adminId
            console.log("Admin ID retrieved:", user.uid);
          } else {
            console.warn("Admin document not found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      } else {
        console.warn("No user logged in.");
      }
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [auth]);

  // Function to handle logout and update timestamp in Firestore
  const handleRedirect = async () => {
    if (!adminId) {
      console.warn("Admin ID is missing!");
      return;
    }

    const sessionId = localStorage.getItem("sessionId");

    if (!sessionId) {
      console.warn("No session ID found for logout update.");
      return;
    }

    console.log("Retrieved sessionId:", sessionId);
    console.log(
      `Attempting to update: admin/${adminId}/admin_history/${sessionId}`
    );

    try {
      // Reference the admin history document
      const historyDocRef = doc(
        db,
        "admin",
        adminId,
        "admin_history",
        sessionId
      );
      const historyDocSnap = await getDoc(historyDocRef);

      if (!historyDocSnap.exists()) {
        console.error("Error: Admin history document does not exist!");
        return;
      }

      // Update logout time in Firestore
      await updateDoc(historyDocRef, {
        logoutTime: serverTimestamp(),
      });

      console.log("Logout time recorded successfully.");

      // ✅ Remove session data (Web App Logout Only)
      localStorage.removeItem("sessionId");
      localStorage.removeItem("adminId");
      setAdminId(null);

      // ✅ Redirect to login page
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-purple-100 shadow-md z-10 p-4 flex justify-between">
      <h1 className="text-xl font-semibold ml-64">Admin Dashboard</h1>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="p-2 bg-white rounded-full shadow"
        >
          ⚙️
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md">
            <button
  onClick={() => router.push("/settings")}
  className="flex items-center p-2 hover:bg-gray-100 w-full"
>
  <Cog6ToothIcon className="w-5 h-5 mr-2" /> Settings
</button>

            <button
              onClick={handleRedirect}
              className="flex items-center p-2 hover:bg-gray-100 w-full"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNav;

/*
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { signOut } from "firebase/auth"; // Import signOut function
import { auth } from "../../../../script/firebaseConfig"; // Import Firebase
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const TopNav = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize router for navigation

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      router.push("/(auth)"); // Redirect to login page
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-purple-100 shadow-md z-10 p-4 flex justify-between">
      <h1 className="text-xl font-semibold ml-64">Admin Dashboard</h1>

      <div className="relative">
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 bg-white rounded-full shadow">
          ⚙️
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md">
            <button className="flex items-center p-2 hover:bg-gray-100 w-full">
              <Cog6ToothIcon className="w-5 h-5 mr-2" /> Settings
            </button>
            <button className="flex items-center p-2 hover:bg-gray-100 w-full" onClick={handleLogout}>
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNav;



*/
