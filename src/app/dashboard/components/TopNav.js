"use client";

import { useState } from "react";
import { Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

const TopNav = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 w-full bg-purple-100 shadow-md z-10 p-4 flex justify-between">
      {/* Push title to the right so it's not covered by SideNav */}
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
            <button className="flex items-center p-2 hover:bg-gray-100 w-full">
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopNav;
