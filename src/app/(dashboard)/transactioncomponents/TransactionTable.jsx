import React from "react";

export default function TransactionTable({
  users,
  search,
  setSearch,
  openTransactionModal,
}) {
  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
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
        <table className="min-w-full bg-white border border-gray-200 text-center table-fixed">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Stock</th>
              <th className="p-2 border">Agent</th>
              <th className="p-2 border">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2 border">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-2 border">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                    onClick={() =>
                      openTransactionModal(user.id, "stockTransactions")
                    }
                  >
                    Stock
                  </button>
                </td>
                <td className="p-2 border">
                  <button
                    className="px-3 py-1 bg-green-500 text-white rounded"
                    onClick={() =>
                      openTransactionModal(user.id, "agentTransactions")
                    }
                  >
                    Agent
                  </button>
                </td>
                <td className="p-2 border">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() =>
                      openTransactionModal(user.id, "transactions")
                    }
                  >
                    Transaction
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
