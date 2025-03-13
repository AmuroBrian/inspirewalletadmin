import TopNav from "../../(auth)/components/TopNav";
import SideNav from "../../(auth)/components/SideNav";
import UserTable from "../../(auth)/components/UserTable";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen">
      {/* Fixed SideNav */}
      <SideNav />

      {/* Main Content (Shifted Right) */}
      <div className="flex-1 ml-64">
        <TopNav />

        {/* Content Area */}
        <div className="p-6 w-full">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>

          {/* UserTable Now Takes Full Available Width */}
          <div className="w-[calc(100%-16rem)]">  
            <UserTable />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
