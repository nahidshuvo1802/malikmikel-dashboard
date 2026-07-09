"use client";

import { useState, useEffect } from "react";
import Sidebar from "./components/sidebar";
import MainHeader from "./components/main-header";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const token = useAppSelector((state) => state.auth.token);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect to auth if no token
  useEffect(() => {
    if (isClient && !token) {
      router.push("/auth");
    }
  }, [token, isClient, router]);

  // Ensure: initially closed on mobile, open on desktop (lg: 1024px)
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(min-width: 1024px)");
    
    // Initial State
    setIsSidebarOpen(mql.matches);

    const updateOpenState = (e: MediaQueryListEvent) => {
        setIsSidebarOpen(e.matches);
    };

    mql.addEventListener("change", updateOpenState);
    return () => mql.removeEventListener("change", updateOpenState);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Auto-close sidebar on route change when on mobile
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) {
      setIsSidebarOpen(false);
    }
  }, [pathname]);

  // Don't render anything if on client and not authenticated to prevent flash
  if (!isClient || !token) {
    return <div className="min-h-screen bg-white flex items-center justify-center" />;
  }

  return (
    <div className="flex h-screen relative overflow-hidden bg-gray-50/30">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-40 lg:hidden"
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-col w-full overflow-hidden my-5 h-[calc(100vh-2.5rem)]">
        <MainHeader toggleSidebar={toggleSidebar} />
        <main className="p-5 bg-gray-50/50 flex-1 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
