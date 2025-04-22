"use client";

import UserTable from "./../components/UserTable";

const Dashboard = () => {

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 ml-64">
        <div className="p-6 w-full">
          

          <div className="w-full">
            <UserTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
