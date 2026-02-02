import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { CartProvider } from "./context/CartContext";
import { ChatProvider } from "./context/ChatContext";
import { Toaster } from "@/components/ui/toaster";
import ChatWidget from "./components/ChatWidget";

export const metadata: Metadata = {
  title: "NexoShop",
  description: "Tu tienda online",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geist.variable}`}>
      <body>
        <CartProvider>
          <ChatProvider>
            {children}
            <ChatWidget />
            <Toaster />
          </ChatProvider>
        </CartProvider>
      </body>
    </html>
  );
}
