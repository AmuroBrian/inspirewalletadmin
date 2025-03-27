import React from "react";

export default function UserTable({ users, search, setSearch, handleUserClick }) {
  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
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
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b cursor-pointer hover:bg-gray-100" onClick={() => handleUserClick(user)}>
                <td className="p-2 border">{user.firstName} {user.lastName}</td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-gray-500">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
