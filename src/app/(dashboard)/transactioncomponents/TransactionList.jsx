"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import TransactionTable from "./TransactionTable";
import TransactionModal from "./TransactionModal";
import LoadingScreen from "./LoadingScreen";
import { fetchUsers, fetchTransactions, saveNewTransaction, updateTransaction, deleteTransaction } from "./firebaseFunctions";

export default function TransactionList() {
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers(setUsers, setLoading);
  }, []);

  const openTransactionModal = async (userId, type) => {
    await fetchTransactions(userId, type, setTransactions, setSelectedUser, setModalType);
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex justify-start p-4 ml-64 pt-10 relative">
      <TransactionTable users={users} search={search} setSearch={setSearch} openTransactionModal={openTransactionModal} />
      {modalType && (
        <TransactionModal
          transactions={transactions}
          selectedUser={selectedUser}
          modalType={modalType}
          closeModal={() => setModalType(null)}
          saveNewTransaction={saveNewTransaction}
          updateTransaction={updateTransaction}
          deleteTransaction={deleteTransaction}
        />
      )}
    </div>
  );
}
