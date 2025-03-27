"use client";
import React, { useEffect, useState } from "react";
import { getUsers, getInvestmentProfiles } from "./firebaseUtils";
import UserTable from "./UserTable";
import InvestmentProfile from "./InvestmentProfile";
import LoadingScreen from "./LoadingScreen";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [investmentProfile, setInvestmentProfile] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const usersList = await getUsers();
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setTimeout(() => setLoading(false), 5000);
      }
    }
    fetchData();
  }, []);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    const profiles = await getInvestmentProfiles(user.id);
    console.log("Fetched Profiles:", profiles); // Debugging log
    setInvestmentProfile(profiles);
};


  if (loading) return <LoadingScreen />;

  return (
    <div className="flex justify-start p-4 ml-64 pt-10 relative">
      <UserTable users={users} search={search} setSearch={setSearch} handleUserClick={handleUserClick} />
      {selectedUser && (
        <InvestmentProfile 
          selectedUser={selectedUser} 
          investmentProfile={investmentProfile} 
          setSelectedUser={setSelectedUser} 
          setInvestmentProfile={setInvestmentProfile} 
        />
      )}
    </div>
  );
}
