import { Geist, Geist_Mono } from "next/font/google";
import { OrderProvider } from "@/context/OrderContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Boost Collective - Checkout",
  description: "Promote your music with Boost Collective",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <OrderProvider>
          {children}
        </OrderProvider>
      </body>
    </html>
  );
}
