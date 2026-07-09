"use client";

import { useAppSelector } from "@/store/hooks";
import { useGetAdminProfileQuery } from "@/store/api/adminApi";
import { useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import { textPrimary, borderPrimary } from "@/contexts/theme";
import { imgUrl } from "@/store/config/envConfig";

interface MainHeaderProps {
  toggleSidebar: () => void;
}

export default function MainHeader({ toggleSidebar }: MainHeaderProps) {
  const router = useRouter();
  
  // Grab user from redux state
  const authUser = useAppSelector((state) => state.auth.user);
  
  // Fetch live admin data
  const { data } = useGetAdminProfileQuery({});
 
  const adminProfile = data?.data || authUser;
  const profileImage = adminProfile?.image ? `${imgUrl}${adminProfile.image.replace(/^\//, "")}` : null;
  const profileName = adminProfile?.name || adminProfile?.fullName || "Admin";
  const profileRole = adminProfile?.role || "Admin";
  
  // Dummy unread count
  const unreadCount = 3;
 
  return (
    <div className="relative w-full px-5">
      <header className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-5 md:px-10 h-[80px]">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className={`p-2 rounded hover:opacity-80 focus:outline-none cursor-pointer ${textPrimary}`}
          >
            <Menu className="w-8 h-8" />
          </button>
          <div className="flex items-center gap-4">
            {/* Notification */}
            {/* <button
              type="button"
              aria-label="Notifications"
              onClick={() => router.push('/admin/notifications')}
              className={`relative p-2 rounded-full border ${borderPrimary} hover:bg-white/60 transition cursor-pointer`}
            >
              <Bell className={`w-6 h-6  ${textPrimary}`} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex h-2 w-2 rounded-full bg-[#E53E3E]"></span>
              )}
            </button> */}
            
            <div
              onClick={() => router.push("/admin/profile")}
              className="flex items-center gap-3 cursor-pointer"
            >
              {/* Avatar */}
                <div className="w-8 md:w-10 h-8 md:h-10 rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden border border-gray-100 bg-[#2E6F65]/10 text-[#2E6F65] shrink-0 transition-all hover:scale-105 cursor-pointer">
                    {profileImage ? (
                      <img 
                        src={profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{profileName.charAt(0).toUpperCase()}</span>
                    )}
                </div>
              
              <div className="flex flex-col text-left">
                <span className="hidden md:block text-[#0D0D0D] text-sm font-bold leading-none">
                  {profileName}
                </span>
                <span className="text-[10px] text-gray-400 capitalize mt-1 leading-none font-semibold">
                  {profileRole}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
