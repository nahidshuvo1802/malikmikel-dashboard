"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonbg } from "@/contexts/theme";

export default function SettingsPage() {
  return (
    <div className="w-full mx-auto">
      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`${buttonbg} px-6 py-4`}>
          <h1 className="text-white text-xl sm:text-2xl font-bold">
            Settings
          </h1>
        </div>

        {/* List */}
        <ul className="divide-y divide-gray-100">
          {/* Edit Profile */}
          <li>
            <Link
              href="/admin/profile"
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition group"
            >
              <span className="text-gray-700 font-medium text-base group-hover:text-blue-600 transition-colors">Edit Profile</span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
            </Link>
          </li>
          
          {/* Privacy Policy */}
          <li>
            <Link
              href="/admin/privacy-policy"
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition group"
            >
              <span className="text-gray-700 font-medium text-base group-hover:text-blue-600 transition-colors">Privacy Policy</span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
            </Link>
          </li>
          
          {/* Terms of Use */}
          <li>
            <Link
              href="/admin/terms-and-condition"
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition group"
            >
              <span className="text-gray-700 font-medium text-base group-hover:text-blue-600 transition-colors">
                Terms of Use
              </span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
            </Link>
          </li>
          
          {/* About Us */}
          <li>
            <Link
              href="/admin/about-us"
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition group"
            >
              <span className="text-gray-700 font-medium text-base group-hover:text-blue-600 transition-colors">About Us</span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
            </Link>
          </li>
          
          {/* Legal & Policies */}
          <li>
            <Link
              href="/admin/legal-policies"
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition group"
            >
              <span className="text-gray-700 font-medium text-base group-hover:text-blue-600 transition-colors">Legal & Policies</span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
            </Link>
          </li>
          
          {/* Delete Account Info */}
          <li>
            <Link
              href="/admin/delete-account"
              className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition group"
            >
              <span className="text-gray-700 font-medium text-base group-hover:text-blue-600 transition-colors">Delete Account Info</span>
              <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors w-5 h-5" />
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
