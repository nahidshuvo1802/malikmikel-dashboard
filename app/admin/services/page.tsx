"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Trash2,
  Edit,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  Star,
  Clock,
  X,
  MapPin,
  Search,
  Upload,
  Calendar,
  Tag,
  Eye,
  Gift,
  Globe,
} from "lucide-react";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary, borderPrimary } from "@/contexts/theme";
import {
  useGetAllServicesQuery,
  useDeleteServiceMutation,
  useCreateServiceMutation,
  useUpdateServiceMutation,
} from "@/store/api/serviceApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoryApi";
import { useGetAllSubCategoriesQuery } from "@/store/api/subCategoryApi";
import { useGetAllOffersQuery } from "@/store/api/offerApi";
import { useDebounce } from "@/store/hooks";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { getImageUrl } from "@/store/config/envConfig";
import { AddServiceModal } from "./components/AddServiceModal";
import { ViewServiceModal } from "./components/ViewServiceModal";
import { DeleteConfirmationModal } from "./components/DeleteConfirmationModal";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

console.log(
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    ? `Using env google map key : ${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    : "Missing google map key",
);

setOptions({
  key: GOOGLE_MAPS_API_KEY,
  v: "weekly",
  libraries: ["places"],
});

export default function ServicesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  const [serviceToEdit, setServiceToEdit] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: servicesResponse,
    isLoading,
    refetch,
  } = useGetAllServicesQuery({
    page: currentPage,
    limit: 10,
    searchTerm: debouncedSearchTerm,
    category_id: selectedCategory,
  });

  const [deleteService] = useDeleteServiceMutation();
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  const { data: categoriesResponse } = useGetAllCategoriesQuery({ limit: 100 });
  const categoriesList = categoriesResponse?.data || [];

  const services = servicesResponse?.data || [];
  const meta = servicesResponse?.meta || { totalPages: 1, total: 0 };
  const totalPages = meta.totalPages || meta.totalPage || 1;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  const handleDelete = async (id: string) => {
    try {
      const promise = deleteService(id).unwrap();
      toast.promise(promise, {
        loading: "Deleting service...",
        success: "Service deleted successfully!",
        error: "Failed to delete service",
      });
      await promise;
      refetch();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div
        className={`${buttonbg} rounded-t-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Service Management
          </h1>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-900">
                All Categories
              </option>
              {categoriesList.map((cat: any) => (
                <option
                  key={cat._id}
                  value={cat.name}
                  className="text-gray-900"
                >
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
              <Tag className="w-3 h-3" />
            </div>
          </div>
        </div>

        <Button
          onClick={() => {
            setServiceToEdit(null);
            setIsAddModalOpen(true);
          }}
          className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold px-6 py-6 rounded-xl shadow-md transition-all active:scale-95 group"
        >
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Add New Service
        </Button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl shadow-xl border border-gray-100 overflow-hidden -mt-4 relative z-10 min-h-[500px] flex flex-col justify-between">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className={`font-bold py-5 ${textPrimary} pl-6`}>
                  S.ID
                </TableHead>
                <TableHead className={`font-bold py-5 ${textPrimary}`}>
                  Image
                </TableHead>
                <TableHead className={`font-bold py-5 ${textPrimary}`}>
                  Service Name
                </TableHead>
                <TableHead className={`font-bold py-5 ${textPrimary}`}>
                  Category
                </TableHead>
                <TableHead className={`font-bold py-5 ${textPrimary}`}>
                  Address
                </TableHead>
                <TableHead className={`font-bold py-5 ${textPrimary}`}>
                  Rating
                </TableHead>
                <TableHead
                  className={`font-bold py-5 ${textPrimary} text-right pr-6`}
                >
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-24">
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : services.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-24 text-gray-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Tag className="w-12 h-12 text-gray-200" />
                      <p className="text-lg font-medium">No services found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((service: any, i: number) => (
                  <TableRow
                    key={service._id || i}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0 group"
                  >
                    <TableCell className="font-medium text-gray-500 py-4 pl-6">
                      {((currentPage - 1) * 10 + i + 1)
                        .toString()
                        .padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                        <Image
                          src={getImageUrl(service.image) || "/placeholder.png"}
                          alt={service.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 font-bold py-4">
                      {service.name}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      <span className="px-3 py-1 rounded-full bg-green-50 text-[#2E6F65] text-xs font-semibold">
                        {service.cetagory?.name || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500 py-4 max-w-[200px] truncate">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {service.address}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1 text-orange-500 font-bold">
                        <Star className="w-4 h-4 fill-current" />
                        {service.averageRating?.toFixed(1) || "0.0"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Details"
                          onClick={() => {
                            setSelectedService(service);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                          onClick={() => {
                            setServiceToEdit(service);
                            setIsAddModalOpen(true);
                          }}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setServiceToDelete(service);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
          <Pagination>
            <PaginationContent className="gap-2">
              <PaginationItem>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-500 hover:text-[#2E6F65] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <PaginationPrevious className="hover:bg-transparent p-0 h-auto" />
                </button>
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationItem key={page}>
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg border-0 transition-all font-bold shadow-sm ${
                        currentPage === page
                          ? "bg-[#2E6F65] text-white scale-110 shadow-[#2E6F65]/20"
                          : "bg-white text-gray-600 hover:text-[#2E6F65] hover:shadow-md"
                      }`}
                    >
                      {page}
                    </button>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-500 hover:text-[#2E6F65] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                >
                  <PaginationNext className="hover:bg-transparent p-0 h-auto" />
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
        serviceToEdit={serviceToEdit}
      />

      {/* View Service Modal */}
      <ViewServiceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        service={selectedService}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(serviceToDelete?._id)}
        serviceName={serviceToDelete?.name}
      />
    </div>
  );
}
