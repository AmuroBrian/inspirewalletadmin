import UserTable from "./../components/UserTable";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Fixed SideNav */}

      {/* Main Content (Shifted Right) */}
      <div className="flex-1 ml-64">

        {/* Content Area */}
        <div className="p-6 w-full">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>

          {/* UserTable Now Takes Full Available Width */}
          <div className="w-full border-1 border-black border-solid">
            <UserTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
