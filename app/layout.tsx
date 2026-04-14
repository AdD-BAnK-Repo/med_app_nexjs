import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "./components/SidebarContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ระบบบริหารจัดการยา OPD | โรงพยาบาล",
  description: "ระบบตรวจสอบวันหมดอายุยา จัดการฐานข้อมูลยา และขายเวร",
  icons: [
    {
      url: "/icons/icon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      url: "/icons/icon-512.png",
      sizes: "512x512",
      type: "image/png"
    }
  ],
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <aside className="print:hidden"><Sidebar /></aside>
              <div className="flex flex-1 flex-col min-w-0 lg:ml-64 print:ml-0">
                <header className="print:hidden"><Navbar /></header>
                <main className="flex-1 p-4 sm:p-6 lg:p-8 transition-colors duration-300 print:p-0 print:block">
                  <div className="mx-auto max-w-7xl">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
