import "./../globals.css";
import TopNav from "./components/TopNav";
import SideNav from "./components/SideNav";

export const metadata = {
    title: "Inspire Wallet Admin",
    description: "Admin User Interface for Inspire Wallet",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <SideNav />
                <TopNav />
                {children}
            </body>
        </html>
    );
}
