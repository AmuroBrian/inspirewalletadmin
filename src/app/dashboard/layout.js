import "./../globals.css";

export const metadata = {
    title: "Inspire Wallet Admin",
    description: "Admin User Interface for Inspire Wallet",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className=""
            >
                
                {children}
            </body>
        </html>
    );
}
