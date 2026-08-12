"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  ImageIcon,
  Loader,
  Star,
  RefreshCw,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonbg } from "@/contexts/theme";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// RTK Query Slices
import {
  useGetWeeklyFeaturedServicesQuery,
  useUpdateServiceMutation,
} from "@/store/api/serviceApi";
import { useUpdateOfferMutation } from "@/store/api/offerApi";

type SectionTab =
  | "featured_eat&drink"
  | "featured_experiences"
  | "featured_events"
  | "featured_offers";

export default function FeaturedManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) router.push("/auth");
    else if (user?.role !== "admin") router.push("/");
  }, [isAuthenticated, user, router]);

  // Active Tab state
  const [activeTab, setActiveTab] = useState<SectionTab>("featured_eat&drink");

  // RTK Query data fetches
  const {
    data: featuredResponse,
    isLoading: isFeaturedLoading,
    isError: isFeaturedError,
    refetch: refetchFeatured,
  } = useGetWeeklyFeaturedServicesQuery(undefined);

  const [updateService] = useUpdateServiceMutation();
  const [updateOffer] = useUpdateOfferMutation();

  const handleUnfeatureService = async (id: string) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("isFeatured", "false");

      await updateService({ id, formData: formDataToSend }).unwrap();
      toast.success("Item removed from featured list");
      refetchFeatured();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove item");
    }
  };

  const handleUnfeatureOffer = async (id: string) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("isFeatured", "false");

      await updateOffer({ id, data: formDataToSend }).unwrap();
      toast.success("Item removed from featured list");
      refetchFeatured();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove item");
    }
  };

  // Local state to store items currently in active tab
  const [currentItems, setCurrentItems] = useState<any[]>([]);

  // Map tabs to section settings
  const tabs = [
    {
      key: "featured_eat&drink",
      label: "Eat & Drink",
      title: "Featured Eat & Drink",
    },
    {
      key: "featured_experiences",
      label: "Experiences",
      title: "Featured Experiences",
    },
    {
      key: "featured_events",
      label: "Events",
      title: "Featured Events",
    },
    {
      key: "featured_offers",
      label: "Offers",
      title: "Featured Offers",
    },
  ];

  const activeTabConfig = tabs.find((t) => t.key === activeTab)!;

  // Helper to identify if an item is an Offer or Service
  const isOffer = (item: any) => {
    return item && item.title !== undefined;
  };

  // Synchronize database state to local currentItems when tab changes or data loads
  useEffect(() => {
    if (featuredResponse?.data) {
      const allItems = featuredResponse.data || [];

      const filtered = allItems.filter((item: any) => {
        if (!item || item.isFeatured !== true) return false;

        if (activeTab === "featured_offers") {
          return isOffer(item);
        }

        if (isOffer(item)) return false;

        const categoryName =
          item.cetagory?.name?.toLowerCase().replace(/\s+/g, "") || "";

        if (activeTab === "featured_eat&drink") {
          return categoryName === "eat&drink";
        }
        if (activeTab === "featured_experiences") {
          return categoryName === "experiences";
        }
        if (activeTab === "featured_events") {
          return categoryName === "events";
        }

        return false;
      });

      setCurrentItems(filtered);
    } else {
      setCurrentItems([]);
    }
  }, [featuredResponse, activeTab]);

  if (!user || user.role !== "admin") return null;

  // Get image URL securely
  const getImageUrl = (img: string | null) => {
    if (!img) return "";
    if (img.startsWith("http")) return img;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${baseUrl.replace(/\/$/, "")}${img}`;
  };

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div
        className={`${buttonbg} rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[#2E6F65]/10`}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Star className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-white text-xl font-bold">
              Homepage Featured Items
            </h2>
            <p className="text-white/70 text-xs mt-0.5">
              View all homepage featured items marked directly from services and
              offers management
            </p>
          </div>
        </div>
        <Button
          onClick={() => refetchFeatured()}
          className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold shadow-md h-11 px-6 rounded-xl gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Tabs Row */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-px">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SectionTab)}
              className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${
                isSelected
                  ? "border-[#2E6F65] text-[#2E6F65] bg-green-50/20"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* List Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <h3 className="font-bold text-lg text-gray-800 border-b pb-3 border-gray-100">
          {activeTabConfig.title}
        </h3>

        {/* Featured Items List */}
        {isFeaturedLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader className="w-8 h-8 animate-spin text-[#2E6F65]" />
            <p className="mt-4 font-medium text-sm">
              Loading featured items...
            </p>
          </div>
        ) : isFeaturedError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <AlertCircle className="w-10 h-10" />
            <p className="mt-4 font-medium text-sm">
              Failed to load featured configuration
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchFeatured()}
              className="mt-4 gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed rounded-xl">
            <Star className="w-12 h-12 opacity-20 mb-2" />
            <p className="text-sm font-bold">No featured items configured</p>
            <p className="text-xs text-gray-400 mt-1">
              Mark "Feature this on Homepage" inside service or offer settings
              to show items here
            </p>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {currentItems.map((item, idx) => {
                const name = isOffer(item) ? item.title : item.name;
                const subDetails = isOffer(item)
                  ? `${item.discount}% OFF - ${item.promocode || "No promocode"}`
                  : item.address || "No address";

                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-4 bg-white hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-400 w-6 text-center">
                        {idx + 1}
                      </span>
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden border">
                        {item.image ? (
                          <Image
                            src={getImageUrl(item.image)}
                            alt={name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {subDetails}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          if (isOffer(item)) {
                            handleUnfeatureOffer(item._id);
                          } else {
                            handleUnfeatureService(item._id);
                          }
                        }}
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
