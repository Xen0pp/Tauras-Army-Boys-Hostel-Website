import { Inter } from "next/font/google";
import "./globals.css";
import CustomRootProvider from "../providers/CustomRootProvider";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "TABH - Tauras Army Boys Hostel",
  description: "Tauras Army Boys Hostel management and community portal",
};

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CustomRootProvider>{children}</CustomRootProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
