"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const TopNav = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter(); // Initialize useRouter

  // Redirect to the login page on click
  const handleRedirect = () => {
    router.push("/");
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
            <button onClick={handleRedirect} className="flex items-center p-2 hover:bg-gray-100 w-full">
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