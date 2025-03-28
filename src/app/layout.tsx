// /app/layout.tsx
import "./globals.css";
//import { Inter } from "next/font/google";
import type { Metadata } from "next";
import SessionProvider from "./providers/SessionProvider";

//const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restaurant Admin",
  description: "Restaurant Order Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
