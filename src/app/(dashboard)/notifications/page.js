"use client";
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../../../script/firebaseConfig'; // Adjust according to your Firebase config
import { addDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { motion } from "framer-motion";
import axios from 'axios'; // Import axios for HTTP requests

const Notifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userList, setUserList] = useState([]); // To store users fetched from Firestore
  const [isLoading, setIsLoading] = useState(false); // Track loading state
  const [error, setError] = useState(null); // Track any error during fetch
  const [selectedUsers, setSelectedUsers] = useState([]); // Store selected users
  const [selectAll, setSelectAll] = useState(false); // Track "Select All" state
  const [searchQuery, setSearchQuery] = useState(''); // Track search input
 
  const [loading, setLoading] = useState(true);



  const handleSendNotification = async () => {
    // const APP_ID = process.env.NEXT_PUBLIC_NATIVE_NOTIFY_APP_ID;
    // const APP_TOKEN = process.env.NEXT_PUBLIC_NATIVE_NOTIFY_APP_TOKEN;
    // console.log("APP_ID:", APP_ID);
    // console.log("APP_TOKEN:", APP_TOKEN);

    // if (!APP_ID || !APP_TOKEN) {
    //   console.error("Missing Native Notify APP_ID or APP_TOKEN");
    //   return alert("Notification service is not configured properly.");

    if (!title || !message || selectedUsers.length === 0) {
      return alert("Please fill out all fields and select at least one user.");
    }

    const admin = auth.currentUser;
    if (!admin) {
      alert("Admin not authenticated");
      return;
    }
    setIsSending(true); // Start loading state

    try {
      // Send notification to each selected user
      if (selectedUsers) {
        for (const userId of selectedUsers) {
          const user = userList.find((u) => u.id === userId);
          console.log("Sending notification to user:", user);

          if (user) {
            try {
              const response = await axios.post('https://app.nativenotify.com/api/indie/notification', {
                subID: `${user.id}`,
                appId: 28259,
                appToken: "QAg2EVLUAIEiCtThmFoSv2",
                title,
                message,
              });

              console.log("Notification response for user", user.id, ":", response.data);

              if (response.status !== 200 && response.status !== 201) {
                console.error("Unexpected response status:", response.status);
              }
            } catch (error) {
              console.error("Error sending notification to user", user.id, ":", error);
              if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                console.error("Error response headers:", error.response.headers);
              } else if (error.request) {
                console.error("No response received:", error.request);
              } else {
                console.error("Error setting up request:", error.message);
              }
            }
          }
        }
      }

      // Save notification info to Firestore
      // await addDoc(collection(db, "notifications"), {
      //   title,
      //   message,
      //   sentTo: selectedUsers.map((id) => {
      //     const user = userList.find((u) => u.id === id);
      //     return user
      //       ? {
      //           uid: user.id,
      //           fullName: `${user.firstName} ${user.lastName}`,
      //         }
      //       : { uid: id, fullName: "Unknown" };
      //   }),
      //   sentBy: {
      //     uid: admin.uid,
      //     email: admin.email,
      //   },
      //   sentAt: serverTimestamp(),
      // });

      alert(`Notification sent to ${selectedUsers.length} user(s)!`);
      handleClear();
    } catch (error) {
      console.error("Error in handleSendNotification:", error);
      alert("Something went wrong while sending notifications. Check console for details.");
    } finally {
      setIsSending(false); // End loading state
    }
  };

  useEffect(() => {
    // Fetching users from Firestore when the modal is opened
    if (isModalOpen) {
      const fetchUsers = async () => {
        setIsLoading(true); // Set loading to true when fetching starts
        setError(null); // Reset error state
        try {
          const querySnapshot = await getDocs(collection(db, "users"));
          const usersData = [];

          // Loop through each document in the 'users' collection
          querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const fullName = `${data.firstName} ${data.lastName}`; // Concatenate first and last name
            usersData.push({
              id: docSnapshot.id,
              firstName: data.firstName,
              lastName: data.lastName,
              fullName,
            });
          });

          setUserList(usersData);
        } catch (err) {
          console.error("Error fetching users:", err);
          setError("Failed to load users. Please try again."); // Set error message if the fetch fails
        } finally {
          setIsLoading(false); // Set loading to false when the fetch is complete
        }
      };

      fetchUsers();
    }
  }, [isModalOpen]);

  const handleClear = () => {
    setTitle("");
    setMessage("");
    setUsers("");
    setSelectedUsers([]);
  };

  const handleAddUser = () => {
    // Add selected users' full names (firstName + lastName) to the users field
    const selectedFullNames = selectedUsers
      .map((userId) => {
        const user = userList.find((user) => user.id === userId);
        return user ? user.fullName : null;
      })
      .filter((name) => name !== null);
    setUsers(selectedFullNames.join("\n"));
    setIsModalOpen(false); // Close the modal after adding
  };

  const handleCheckboxChange = (userId, checked) => {
    if (checked) {
      setSelectedUsers((prevSelectedUsers) => [...prevSelectedUsers, userId]);
    } else {
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((id) => id !== userId)
      );
    }
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedUsers([]); // Clear all selected users if "Select All" is unchecked
    } else {
      setSelectedUsers(userList.map((user) => user.id)); // Select all users
    }
    setSelectAll(!selectAll); // Toggle the "Select All" state
  };

  const handleRemoveUser = (userToRemove) => {
    // Filter out the user from the selected users list
    const updatedUsers = selectedUsers.filter((user) => {
      const userData = userList.find(
        (u) => `${u.firstName} ${u.lastName}` === userToRemove
      );
      return userData ? userData.id !== user : true;
    });

    setSelectedUsers(updatedUsers);

    // Update the users field to reflect the removal
    const updatedUserList = users
      .split("\n")
      .filter((user) => user !== userToRemove)
      .join("\n");
    setUsers(updatedUserList);
  };

  const handleChange = (e) => {
    setUsers(e.target.value); // Updating users state directly with the input value
  };

  // Filter users based on the search query
  const filteredUsers = userList.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // 3 seconds
  
    return () => clearTimeout(timer); // Clean up on unmount
  }, []);
  

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 mt-7 ml-[250px]">
      <div className="border-4 border-blue-500 rounded-xl p-8 w-full max-w-md bg-white shadow-md flex flex-col">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Send Notification
        </h2>
        <div className="flex-grow">
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message textarea with scroll */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              Message
            </label>
            <textarea
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
              style={{ height: "150px", resize: "none" }} // Set height and prevent resizing
            />
          </div>

          <div className="mb-8">
            <label className="block mb-1 font-medium text-gray-700">Users</label>
            {/* Display selected users with remove buttons, but only for non-empty lines */}
            {users.trim() !== "" && (
              <div
                className={`w-full p-2 border border-gray-300 rounded-md mt-2 ${users.split("\n").length > 3 ? "overflow-y-auto max-h-24" : ""
                  }`}
              >
                {users.split("\n").map((user, index) => {
                  if (user.trim() === "") return null; // Skip empty lines

                  return (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span>{user}</span>
                      <button
                        onClick={() => handleRemoveUser(user)} // Remove user on button click
                        className="text-red-500 hover:text-red-700"
                      >
                        X
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* "Add" Button under the Users field and aligned to the right */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-blue-600 -mt-7 hover:underline mb-4"
            >
              Add
            </button>
          </div>
        </div>
        {/* Modal for selecting users */}
        {isModalOpen && (
          <div className="fixed top-0 left-[250px] w-[calc(100%-250px)] h-full flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-80">
              <h3 className="text-lg font-semibold mb-4">Select Users</h3>

              {/* Search input */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="h-48 overflow-y-auto mb-4">
                {isLoading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-gray-500">No users found</div>
                ) : (
                  <ul className="space-y-2">
                    {filteredUsers.map((user) => (
                      <li key={user.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)} // Keep checkbox state synced
                          onChange={(e) => handleCheckboxChange(user.id, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label className="text-gray-600">{user.fullName}</label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Select All Checkbox */}
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  className="h-4 w-4"
                />
                <label className="text-gray-600">Select All</label>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={handleAddUser}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Add Selected
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-between space-x-4 mt-auto">
          <button
            onClick={handleSendNotification}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Send
          </button>
          <button
            onClick={handleClear}
            className="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition"
          >
            Clear
          </button>
          <button className="flex-1 bg-gray-400 text-white py-2 rounded-md hover:bg-gray-500 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
