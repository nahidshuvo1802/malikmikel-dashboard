"use client";
 
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Store, TrendingUp, Calendar } from "lucide-react";
import { buttonbg } from "@/contexts/theme";
import { useGetDashboardDataQuery } from "@/store/api/dashboardStatsApi";
import { Loader } from "@/components/ui/loader";
 
// Data will be fetched from API
 
// Mock Data for Users - Replaced with API
// const recentUsers = Array(6).fill({ ... });
 
 
export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState(2026);
  const { data: dashboardData, isLoading } = useGetDashboardDataQuery(selectedYear);
 
  const stats = dashboardData?.data?.totals || { users: 0, vendors: 0 };
  const chartData = dashboardData?.data?.monthlyGrowth?.users || [];
  const recentUsers = dashboardData?.data?.recentUsers || [];
 
  // Calculate dynamic max value for chart scaling
  const dataMaxVal = chartData.length > 0 ? Math.max(...chartData.map((d: any) => d.count)) : 0;
  const chartMax = dataMaxVal > 0 ? Math.ceil(dataMaxVal / 100) * 100 : 1000;
  const gridValues = [chartMax, chartMax * 0.75, chartMax * 0.5, chartMax * 0.25, 0];
 
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);
 
  if (!user || user.role !== "admin") return null;
 
  return (
    <div className="min-h-screen bg-gray-50/50 space-y-6">
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Users Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Users</span>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.users.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Active platform accounts</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2E6F65]/20 to-[#58976B]/10 flex items-center justify-center text-[#2E6F65]">
            <Users className="w-7 h-7" />
          </div>
        </div>
 
        {/* Vendors Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Vendors</span>
            <h2 className="text-3xl font-extrabold text-gray-900">{stats.vendors.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-xs text-[#58976B] font-medium">
              <Store className="w-3.5 h-3.5" />
              <span>Registered service providers</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#58976B]/20 to-[#2E6F65]/10 flex items-center justify-center text-[#58976B]">
            <Store className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h2 className="text-xl font-bold text-gray-900">User Growth Overview</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="w-3 h-3 rounded-full bg-[#2E6F65]"></span>
                    <span className="text-xs font-semibold text-gray-500">Monthly Registrations</span>
                </div>
            </div>
            <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-[#2E6F65] hover:bg-[#23584f] text-white px-4 py-2 rounded-xl text-xs font-bold border-none outline-none cursor-pointer transition-all shadow-sm"
            >
                <option value={2027}>Year 2027</option>
                <option value={2026}>Year 2026</option>
                <option value={2025}>Year 2025</option>
                <option value={2024}>Year 2024</option>
            </select>
        </div>
 
        {/* CSS Bar Chart */}
        <div className="relative h-[300px] w-full mt-10">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none">
                {gridValues.map((val) => (
                    <div key={val} className="flex items-center w-full">
                        <span className="w-10 text-right pr-2">{val.toFixed(0)}</span>
                        <div className="h-[1px] flex-1 bg-gray-100 border-dashed border-gray-200"></div>
                    </div>
                ))}
            </div>
 
            {/* Bars */}
            <div className="absolute inset-0 flex justify-between items-end pl-12 pr-4 pt-4">
                {chartData.map((data: any, index: number) => {
                    const heightPercent = (data.count / chartMax) * 100;
                    return (
                        <div key={index} className="flex flex-col items-center justify-end gap-2 group w-full h-full relative"> 
                             {/* Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 absolute -top-8 bg-gray-900/95 text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-lg backdrop-blur-sm z-10 pointer-events-none whitespace-nowrap border border-white/10 flex flex-col items-center">
                                <span className="font-semibold text-gray-400">{data.month}</span>
                                <span className="font-extrabold text-xs text-[#58976B]">{data.count} Users</span>
                                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900/95"></div>
                            </div>
                            
                            <div 
                                style={{ height: `${heightPercent > 100 ? 100 : heightPercent}%` }} 
                                className="w-3 sm:w-4 md:w-8 bg-gradient-to-t from-[#2E6F65] to-[#58976B] rounded-t-md transition-all duration-500 ease-out hover:from-[#58976B] hover:to-[#2E6F65] hover:shadow-[0_0_12px_rgba(46,111,101,0.3)] relative"
                            >
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 mt-2">{data.month}</span>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recent Users</h2>
            <p className="text-xs text-gray-500 mt-1">A detailed view of the latest user registrations on the platform</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold bg-gray-50 px-3.5 py-1.5 rounded-xl border border-gray-100 shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Live registrations</span>
          </div>
        </div>
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-gray-50/50">
                    <TableRow className="border-b border-gray-100">
                        <TableHead className="text-gray-600 font-bold text-xs uppercase tracking-wider pl-6 py-4">Full Name</TableHead>
                        <TableHead className="text-gray-600 font-bold text-xs uppercase tracking-wider py-4">Email</TableHead>
                        <TableHead className="text-gray-600 font-bold text-xs uppercase tracking-wider py-4">Phone No</TableHead>
                        <TableHead className="text-gray-600 font-bold text-xs uppercase tracking-wider pr-6 py-4">Joined Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center py-12">
                                <Loader />
                            </TableCell>
                        </TableRow>
                    ) : recentUsers.map((u: any, i: number) => {
                        const avatarGradients = [
                            "from-emerald-400 to-teal-500",
                            "from-blue-400 to-indigo-500",
                            "from-purple-400 to-pink-500",
                            "from-amber-400 to-orange-500",
                            "from-rose-400 to-red-500"
                        ];
                        const gradientIndex = u.userName ? u.userName.charCodeAt(0) % 5 : i % 5;
                        const avatarGradient = avatarGradients[gradientIndex];
                        const initials = u.userName?.charAt(0)?.toUpperCase() || "?";
 
                        return (
                            <TableRow key={u._id || i} className="hover:bg-gray-50/50 border-b border-gray-100 transition-colors">
                                 <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatarGradient} flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-black/5 shrink-0`}>
                                            {initials}
                                        </div>
                                        <span className="font-semibold text-gray-800">{u.userName}</span>
                                    </div>
                                 </TableCell>
                                 <TableCell className="text-gray-600 font-medium py-4">{u.email}</TableCell>
                                 <TableCell className="text-gray-600 font-medium py-4">{u.phone || "—"}</TableCell>
                                 <TableCell className="text-gray-500 font-semibold pr-6 py-4">
                                     <div className="flex items-center gap-1.5">
                                         <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                         <span>{u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "—"}</span>
                                     </div>
                                 </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
      </div>

    </div>
  );
}