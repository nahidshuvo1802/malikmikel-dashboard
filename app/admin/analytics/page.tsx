"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg } from "@/contexts/theme";
import { useGetAnalyticsQuery } from "@/store/api/analyticsApi";
import { Loader } from "@/components/ui/loader";

export default function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const { data: analyticsResponse, isLoading, error } = useGetAnalyticsQuery({});
  const analyticsData = analyticsResponse?.data;

  if (!user || user.role !== "admin") return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-red-500">
        Failed to load analytics data.
      </div>
    );
  }

  const {
    ageGroups = [],
    topCountries = [],
    mostClickedCategories = [],
    monthlyViews = [],
    topSearches = [],
    totals = { views: 0, favorites: 0, searches: 0 },
    performanceByListing = [],
  } = analyticsData;

  const maxMonthlyView = Math.max(...monthlyViews.map((m: any) => m.count), 10);
  const getLineY = (val: number) => 80 - (val / maxMonthlyView) * 60; // Scale between 80 (bottom) and 20 (top)
  const linePath = `M0,${getLineY(monthlyViews[0]?.count || 0)} ` + monthlyViews.map((m: any, i: number) => {
    if (i === 0) return "";
    const x = (i / (monthlyViews.length - 1)) * 100;
    const y = getLineY(m.count);
    return `L${x},${y} `;
  }).join("");

  return (
    <div className="min-h-screen bg-transparent space-y-5">
      {/* Header */}
      <div className={`${buttonbg} rounded-xl p-4 px-6 shadow-sm`}>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
      </div>

      {/* Totals Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Views", value: totals.views },
          { label: "Total Favourites", value: totals.favorites },
          { label: "Total Searches", value: totals.searches },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
             <span className="text-gray-500 text-sm font-medium">{stat.label}</span>
             <span className="text-3xl font-bold text-[#2E6F65] mt-2">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Monthly Views - Line Chart (SVG) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-6">Views Over Time</h2>
             <div className="h-64 relative border-l border-b border-gray-200 ml-10">
                 <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                     <span>{maxMonthlyView}</span>
                     <span>{Math.round(maxMonthlyView * 0.75)}</span>
                     <span>{Math.round(maxMonthlyView * 0.5)}</span>
                     <span>{Math.round(maxMonthlyView * 0.25)}</span>
                     <span>0</span>
                 </div>
                 
                 <svg className="w-full h-full p-2 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="0" x2="100" y2="0" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="25" x2="100" y2="25" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="0.5" />
                      <line x1="0" y1="75" x2="100" y2="75" stroke="#f3f4f6" strokeWidth="0.5" />
                      <path 
                        d={linePath} 
                        fill="none" 
                        stroke="#2E6F65" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                        className="drop-shadow-md"
                      />
                      {monthlyViews.map((m: any, i: number) => {
                         const x = (i / (monthlyViews.length - 1)) * 100;
                         const y = getLineY(m.count);
                         return (
                           <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="#2E6F65" strokeWidth="1" />
                         );
                      })}
                 </svg>

                 <div className="absolute bottom-[-20px] w-full flex justify-between text-[10px] text-gray-500 pt-1">
                     {monthlyViews.map((m: any, i: number) => (
                       <span key={i}>{m.month}</span>
                     ))}
                 </div>
             </div>
        </div>

        {/* Most Clicked Categories - Donut */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-6">Engagement by Category</h2>
             {mostClickedCategories.length > 0 ? (
               <div className="flex flex-col sm:flex-row items-center justify-center gap-8 h-full pb-8">
                   <div className="relative w-48 h-48 rounded-full" style={{ background: `conic-gradient(#2E6F65 0% 45%, #58976B 45% 75%, #A7D3A6 75% 100%)` }}>
                       <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center text-center">
                           <span className="text-2xl font-bold text-gray-800">Total<br/><span className="text-sm font-normal text-gray-500">Clicks</span></span>
                       </div>
                   </div>

                   <div className="space-y-3">
                       {mostClickedCategories.map((item: any, i: number) => (
                           <div key={i} className="flex items-center gap-3">
                               <div className={`w-3 h-3 rounded-full ${["bg-[#2E6F65]", "bg-[#58976B]", "bg-[#A7D3A6]", "bg-gray-300", "bg-gray-100"][i % 5]}`}></div>
                               <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                               <span className="text-sm text-gray-400">({item.value})</span>
                           </div>
                       ))}
                   </div>
               </div>
             ) : (
               <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
             )}
        </div>

        {/* Top Countries - Horizontal Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Top Locations (Countries)</h2>
            <div className="h-64 flex flex-col justify-center gap-5">
                {topCountries.length > 0 ? topCountries.map((item: any, i: number) => (
                    <div key={i} className="grid grid-cols-[80px_1fr] items-center gap-4 group">
                        <span className="text-sm font-semibold text-gray-700 truncate" title={item.country}>{item.country || "Unknown"}</span>
                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div 
                                className={`h-full ${["bg-[#2E6F65]", "bg-[#2E6F65]/80", "bg-[#2E6F65]/60", "bg-[#2E6F65]/40", "bg-[#2E6F65]/20"][i % 5]} rounded-full transition-all duration-1000 ease-out`} 
                                style={{ width: `${Math.max(item.value, 5)}%` }}
                             ></div>
                        </div>
                    </div>
                )) : (
                  <div className="text-gray-400 text-center w-full">No location data available</div>
                )}
            </div>
        </div>
        
        {/* Performance by Listing */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Performance by Listing</h2>
            <div className="space-y-4">
               {performanceByListing.length > 0 ? performanceByListing.map((listing: any, i: number) => (
                 <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{listing.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2E6F65] bg-[#2E6F65]/10 px-2 py-1 rounded">{listing.views} Views</span>
                    </div>
                 </div>
               )) : (
                 <div className="text-gray-400 text-center w-full pt-10">No listing data available</div>
               )}
            </div>
        </div>

        {/* Top Searches */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Top Searches</h2>
            <div className="space-y-4">
               {topSearches.length > 0 ? topSearches.map((search: any, i: number) => (
                 <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-sm font-medium text-gray-700">{search.keyword}</span>
                    <span className="text-xs text-gray-500">{search.count} searches</span>
                 </div>
               )) : (
                 <div className="text-gray-400 text-center w-full pt-10">No search data available</div>
               )}
            </div>
        </div>

        {/* Age Groups - Column Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6">User Age Groups</h2>
            <div className="h-64 flex items-end justify-around gap-2 md:gap-4 pl-4 ml-10 border-l border-b border-gray-200 relative">
                 {(() => {
                   const maxAgeVal = Math.max(...ageGroups.map((a: any) => a.value), 10);
                   return (
                     <>
                       <div className="absolute -left-10 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400">
                           <span>{maxAgeVal}</span>
                           <span>{Math.round(maxAgeVal * 0.75)}</span>
                           <span>{Math.round(maxAgeVal * 0.5)}</span>
                           <span>{Math.round(maxAgeVal * 0.25)}</span>
                           <span>0</span>
                       </div>
                       {ageGroups.length > 0 ? ageGroups.map((item: any, i: number) => (
                           <div key={i} className="flex flex-col items-center gap-2 flex-1 h-full justify-end group relative">
                               <div className="w-4 md:w-10 h-full bg-green-50 rounded-t-sm relative flex flex-col justify-end overflow-hidden hover:bg-green-100 transition-colors cursor-pointer">
                                  <div 
                                      className="w-full bg-[#2E6F65] hover:bg-[#255c53] transition-all duration-500 rounded-t-sm" 
                                      style={{ height: `${(item.value / maxAgeVal) * 100}%` }}
                                  ></div>
                               </div>
                               <span className="text-xs text-gray-500">{item.label}</span>
                               <div className="absolute -top-8 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {item.value} Users
                               </div>
                           </div>
                       )) : (
                         <div className="text-gray-400 absolute w-full text-center inset-0 flex items-center justify-center">No age data</div>
                       )}
                     </>
                   );
                 })()}
            </div>
        </div>

      </div>
    </div>
  );
}

