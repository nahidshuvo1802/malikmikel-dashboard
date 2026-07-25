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
  Globe
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
    useUpdateServiceMutation
} from "@/store/api/serviceApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoryApi";
import { useGetAllSubCategoriesQuery } from "@/store/api/subCategoryApi";
import { useGetAllOffersQuery } from "@/store/api/offerApi";
import { useDebounce } from "@/store/hooks";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { getImageUrl } from "@/store/config/envConfig";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

console.log(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Using env google map key" : "Missing google map key");

setOptions({
  key: GOOGLE_MAPS_API_KEY,
  v: "weekly",
  libraries: ["places"]
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
  
  const { data: servicesResponse, isLoading, refetch } = useGetAllServicesQuery({ 
    page: currentPage, 
    limit: 10,
    searchTerm: debouncedSearchTerm,
    category_id: selectedCategory
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
        loading: 'Deleting service...',
        success: 'Service deleted successfully!',
        error: 'Failed to delete service'
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
      <div className={`${buttonbg} rounded-t-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg`}>
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
                  <option value="" className="text-gray-900">All Categories</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat._id} value={cat.name} className="text-gray-900">{cat.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
                   <Tag className="w-3 h-3" />
                </div>
              </div>
          </div>
          
          <Button 
            onClick={() => { setServiceToEdit(null); setIsAddModalOpen(true); }} 
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
                        <TableHead className={`font-bold py-5 ${textPrimary} pl-6`}>S.ID</TableHead>
                        <TableHead className={`font-bold py-5 ${textPrimary}`}>Image</TableHead>
                        <TableHead className={`font-bold py-5 ${textPrimary}`}>Service Name</TableHead>
                        <TableHead className={`font-bold py-5 ${textPrimary}`}>Category</TableHead>
                        <TableHead className={`font-bold py-5 ${textPrimary}`}>Address</TableHead>
                        <TableHead className={`font-bold py-5 ${textPrimary}`}>Rating</TableHead>
                        <TableHead className={`font-bold py-5 ${textPrimary} text-right pr-6`}>Action</TableHead>
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
                            <TableCell colSpan={7} className="text-center py-24 text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <Tag className="w-12 h-12 text-gray-200" />
                                    <p className="text-lg font-medium">No services found</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : services.map((service: any, i: number) => (
                        <TableRow key={service._id || i} className="hover:bg-gray-50/80 transition-colors border-b border-gray-100 last:border-0 group">
                            <TableCell className="font-medium text-gray-500 py-4 pl-6">
                                {((currentPage - 1) * 10 + i + 1).toString().padStart(2, '0')}
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                                    <Image src={getImageUrl(service.image) || "/placeholder.png"} alt={service.name} fill className="object-cover" />
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-900 font-bold py-4">{service.name}</TableCell>
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
                    ))}
                </TableBody>
            </Table>
         </div>

         {/* Pagination */}
         <div className="p-6 border-t border-gray-100 bg-gray-50/30">
            <Pagination>
                <PaginationContent className="gap-2">
                    <PaginationItem>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-lg text-gray-500 hover:text-[#2E6F65] hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all font-medium"
                        >
                            <PaginationPrevious className="hover:bg-transparent p-0 h-auto" />
                        </button>
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                    ))}

                    <PaginationItem>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, serviceName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; serviceName?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete Service?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete <span className="font-bold text-gray-800">{serviceName || "this service"}</span>? This action cannot be undone and will permanently remove all associated data.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-8">
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl h-12 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1 rounded-xl h-12 font-bold bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 transition-all">
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// View Service Modal Component
const ViewServiceModal = ({ isOpen, onClose, service }: { isOpen: boolean; onClose: () => void; service: any }) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-20">
           <div>
               <h2 className="text-2xl font-black text-[#2E6F65] tracking-tight">{service.name}</h2>
               <p className="text-sm text-gray-500 mt-1 font-medium">{service.cetagory?.name} {service.subCetagory?.name ? `• ${service.subCetagory?.name}` : ''}</p>
           </div>
           <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 hover:shadow-md transition-all active:scale-90"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 bg-white">
            {/* Image */}
            <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden shadow-md border border-gray-100">
                <Image src={getImageUrl(service.image) || "/placeholder.png"} alt={service.name} fill className="object-cover" />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-[#2E6F65]" /> About</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-500" /> Details</h3>
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <p className="flex items-start gap-3 text-sm text-gray-700">
                                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                <span>{service.address}</span>
                            </p>
                            {service.cetagory?.name?.toLowerCase() !== 'events' ? (
                              <p className="flex items-center gap-3 text-sm text-gray-700">
                                  <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                                  <span>{service.openTime || "N/A"} - {service.closeTime || "N/A"}</span>
                              </p>
                            ) : (
                              <>
                                <p className="flex items-center gap-3 text-sm text-gray-700">
                                    <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                                    <span>{service.date ? new Date(service.date).toLocaleDateString() : "N/A"} | {service.startTime || "N/A"} - {service.endTime || "N/A"}</span>
                                </p>
                                {service.venue && (
                                  <p className="flex items-start gap-3 text-sm text-gray-700">
                                      <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                      <span><strong>Venue:</strong> {service.venue}</span>
                                  </p>
                                )}
                                {service.ticketPrice && (
                                  <p className="flex items-start gap-3 text-sm text-gray-700">
                                      <Tag className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                      <span><strong>Tickets:</strong> {service.ticketPrice}</span>
                                  </p>
                                )}
                                {service.organiser && (
                                  <p className="flex items-start gap-3 text-sm text-gray-700">
                                      <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                                      <span><strong>Organiser:</strong> {service.organiser}</span>
                                  </p>
                                )}
                                {service.ageRestriction && (
                                  <p className="flex items-start gap-3 text-sm text-gray-700">
                                      <span className="w-5 h-5 flex items-center justify-center text-gray-400 shrink-0 text-xs font-bold mt-0.5 border border-gray-400 rounded">18+</span>
                                      <span><strong>Age:</strong> {service.ageRestriction}</span>
                                  </p>
                                )}
                                {service.dressCode && (
                                  <p className="flex items-start gap-3 text-sm text-gray-700">
                                      <span className="w-5 h-5 text-gray-400 shrink-0 flex items-center justify-center mt-0.5">👕</span>
                                      <span><strong>Dress Code:</strong> {service.dressCode}</span>
                                  </p>
                                )}
                                {service.parkingInfo && (
                                  <p className="flex items-start gap-3 text-sm text-gray-700">
                                      <span className="w-5 h-5 text-gray-400 shrink-0 flex items-center justify-center mt-0.5">🅿️</span>
                                      <span><strong>Parking/Transport:</strong> {service.parkingInfo}</span>
                                  </p>
                                )}
                                {service.ticketLink && (
                                  <p className="flex items-center gap-3 text-sm text-gray-700">
                                      <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                                      <a href={service.ticketLink.startsWith('http') ? service.ticketLink : `https://${service.ticketLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                          Book Tickets
                                      </a>
                                  </p>
                                )}
                              </>
                            )}
                            <p className="flex items-center gap-3 text-sm text-gray-700">
                                <Star className="w-5 h-5 text-yellow-500 fill-current shrink-0" />
                                <span><span className="font-bold text-gray-900">{service.averageRating?.toFixed(1) || "0.0"}</span> ({service.totalReviews || 0} reviews)</span>
                            </p>
                            {service.serviceLink && (
                              <p className="flex items-center gap-3 text-sm text-gray-700">
                                  <Globe className="w-5 h-5 text-gray-400 shrink-0" />
                                  <a href={service.serviceLink.startsWith('http') ? service.serviceLink : `https://${service.serviceLink}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                      {service.serviceLink}
                                  </a>
                              </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {service.photoOfVisitor?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-purple-500" /> Gallery</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {service.photoOfVisitor.map((photo: string, idx: number) => (
                                    <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-100 hover:scale-105 transition-transform shadow-sm">
                                        <Image src={getImageUrl(photo)} alt="Gallery" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {service.hotelMenu?.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-3 mt-4 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-orange-500" /> Menu</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {service.hotelMenu.map((photo: string, idx: number) => (
                                    <div key={idx} className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-100 hover:scale-105 transition-transform shadow-sm">
                                        <Image src={getImageUrl(photo)} alt="Menu" fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Reviews */}
            {service.cetagory?.name?.toLowerCase() !== 'events' && service.reviews?.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-current" /> Top Reviews from Maps</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.reviews.map((revStr: string, idx: number) => {
                            try {
                                const revArray = typeof revStr === 'string' ? JSON.parse(revStr) : revStr;
                                const arrayToMap = Array.isArray(revArray) ? revArray : [revArray];
                                
                                return arrayToMap.map((review: any, rIdx: number) => (
                                    <div key={`${idx}-${rIdx}`} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            {review.profile_photo_url ? (
                                                <Image src={review.profile_photo_url} alt={review.author_name} width={40} height={40} className="rounded-full shadow-sm" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm">
                                                    {review.author_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-sm text-gray-800 line-clamp-1">{review.author_name}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                    <span className="font-bold">{review.rating}</span> • <span className="truncate max-w-[120px]">{review.relative_time_description}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-3 italic">"{review.text}"</p>
                                    </div>
                                ));
                            } catch(e) { return null; }
                        })}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Add Service Modal Component
const AddServiceModal = ({ isOpen, onClose, onSuccess, serviceToEdit }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; serviceToEdit?: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [previews, setPreviews] = useState<{
    main: string | null;
    visitors: string[];
    menu: string[];
  }>({ main: null, visitors: [], menu: [] });

  const [location, setLocation] = useState({ address: "", lat: "", lng: "" });
  const [hotelName, setHotelName] = useState("");
  const [serviceLink, setServiceLink] = useState("");
  const [operatingHours, setOperatingHours] = useState({ open: "", close: "" });
  const [placeData, setPlaceData] = useState<{ rating: number; totalReviews: number; reviews: any[] }>({
    rating: 0,
    totalReviews: 0,
    reviews: []
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const { data: categoriesResponse } = useGetAllCategoriesQuery({ limit: 100 });
  const categories = categoriesResponse?.data || [];
  
  const { data: subCategoriesResponse } = useGetAllSubCategoriesQuery(
    { category: selectedCategoryName, limit: 100 }, 
    { skip: !selectedCategoryName }
  );
  const subCategories = subCategoriesResponse?.data || [];
  
  const { data: offersResponse } = useGetAllOffersQuery({});
  const offers = offersResponse?.data || [];
  const [selectedOfferId, setSelectedOfferId] = useState("");
  
  const [createService] = useCreateServiceMutation();
  const [updateService] = useUpdateServiceMutation();

  useEffect(() => {
    if (isOpen) {
      if (serviceToEdit) {
        setHotelName(serviceToEdit.name || "");
        setServiceLink(serviceToEdit.serviceLink || "");
        setLocation({
          address: serviceToEdit.address || "",
          lat: serviceToEdit.latitude || "",
          lng: serviceToEdit.longitude || ""
        });
        setOperatingHours({
          open: serviceToEdit.openTime || "",
          close: serviceToEdit.closeTime || ""
        });
        setPlaceData({
          rating: serviceToEdit.averageRating || 0,
          totalReviews: serviceToEdit.totalReviews || 0,
          reviews: serviceToEdit.reviews || []
        });
        setSelectedCategoryId(serviceToEdit.cetagory?._id || "");
        setSelectedCategoryName(serviceToEdit.cetagory?.name || "");
        setSelectedSubCategoryId(serviceToEdit.subCetagory?._id || "");
        setSelectedOfferId(serviceToEdit.offer?._id || "");
        
        setPreviews({
          main: serviceToEdit.image ? getImageUrl(serviceToEdit.image) : null,
          visitors: serviceToEdit.photoOfVisitor?.map((url: string) => getImageUrl(url)) || [],
          menu: serviceToEdit.hotelMenu?.map((url: string) => getImageUrl(url)) || []
        });
      } else {
        // Reset states for create mode
        setHotelName("");
        setServiceLink("");
        setLocation({ address: "", lat: "", lng: "" });
        setOperatingHours({ open: "", close: "" });
        setPlaceData({ rating: 0, totalReviews: 0, reviews: [] });
        setSelectedCategoryId("");
        setSelectedCategoryName("");
        setSelectedSubCategoryId("");
        setSelectedOfferId("");
        setPreviews({ main: null, visitors: [], menu: [] });
      }
    }
  }, [isOpen, serviceToEdit]);

  const searchStartTimeRef = useRef<number | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    importLibrary("places").then(() => {
      const inputElement = document.getElementById("maps-autocomplete-input") as HTMLInputElement;
      if (!inputElement) return;

      const autocomplete = new google.maps.places.Autocomplete(inputElement, {
        fields: ["name", "formatted_address", "geometry", "rating", "user_ratings_total", "reviews", "opening_hours"]
      });

      autocompleteRef.current = autocomplete;

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        const endTime = performance.now();
        const duration = searchStartTimeRef.current ? (endTime - searchStartTimeRef.current).toFixed(2) : "unknown";
        
        console.log("📍 Google Place Selected:");
        console.log("- Time taken (from typing start):", duration, "ms");
        
        if (place.geometry?.location) {
          const name = place.name || "";
          const addr = place.formatted_address || "";
          const lat = place.geometry.location.lat().toString();
          const lng = place.geometry.location.lng().toString();
          const rating = place.rating || 0;
          const totalReviews = place.user_ratings_total || 0;
          const topReviews = place.reviews || [];
          
          let open = "";
          let close = "";
          if (place.opening_hours?.periods && place.opening_hours.periods.length > 0) {
              const period = place.opening_hours.periods[0];
              if (period.open?.time) {
                  open = `${period.open.time.substring(0, 2)}:${period.open.time.substring(2, 4)}`;
              }
              if (period.close?.time) {
                  close = `${period.close.time.substring(0, 2)}:${period.close.time.substring(2, 4)}`;
              }
          }
          
          console.log("- Resolved Location:", { name, addr, lat, lng, rating, totalReviews, topReviews, open, close });
          
          setHotelName(name);
          setLocation({ address: addr, lat, lng });
          setPlaceData({ rating, totalReviews, reviews: topReviews as any[] });
          setOperatingHours({ open, close });
        }
        
        searchStartTimeRef.current = null;
      });
    }).catch(e => {
        console.error("❌ Google Maps Loader Error:", e);
    });
  }, [isOpen]);

  const handleSearchInputChange = (e: any) => {
    if (!searchStartTimeRef.current) {
        searchStartTimeRef.current = performance.now();
        console.log("🔍 Search Started...");
    }
    console.log("✍️ Current Input:", e.target.value);
  };

  const handleImageChange = (type: 'main' | 'visitors' | 'menu', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (type === 'main') {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => setPreviews(prev => ({ ...prev, main: reader.result as string }));
        reader.readAsDataURL(file);
    } else {
        const fileList = Array.from(files);
        Promise.all(fileList.map(file => {
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
            });
        })).then(results => {
            setPreviews(prev => ({ ...prev, [type]: results }));
        });
    }
  };

  const formatTimeToAMPM = (timeStr: any) => {
    if (!timeStr || typeof timeStr !== 'string') return timeStr;
    if (!timeStr.includes(':')) return timeStr;
    
    const [hours, minutes] = timeStr.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
        const form = e.currentTarget;
        const mainFormData = new FormData(form);
        const requestFormData = new FormData();
        
        // Construct the data object for all text fields
        const data: any = {
            name: mainFormData.get("name"),
            serviceLink: mainFormData.get("serviceLink"),
            description: mainFormData.get("description"),
            cetagory: mainFormData.get("cetagory"),
            subCetagory: mainFormData.get("subCetagory"),
            address: mainFormData.get("address"),
            latitude: mainFormData.get("latitude"),
            longitude: mainFormData.get("longitude"),
            openTime: formatTimeToAMPM(mainFormData.get("openTime")),
            closeTime: formatTimeToAMPM(mainFormData.get("closeTime")),
            startTime: formatTimeToAMPM(mainFormData.get("startTime")),
            endTime: formatTimeToAMPM(mainFormData.get("endTime")),
            date: mainFormData.get("date"),
            venue: mainFormData.get("venue"),
            ticketPrice: mainFormData.get("ticketPrice"),
            ticketLink: mainFormData.get("ticketLink"),
            organiser: mainFormData.get("organiser"),
            ageRestriction: mainFormData.get("ageRestriction"),
            dressCode: mainFormData.get("dressCode"),
            parkingInfo: mainFormData.get("parkingInfo"),
        };

        // Add offer if selected
        if (selectedOfferId) {
            data.offer = selectedOfferId;
        }

        // Add reviews and ratings if available
        if (placeData.reviews.length > 0) {
            data.reviews = placeData.reviews;
        }
        data.averageRating = Number(mainFormData.get("averageRating")) || 0;
        data.totalReviews = Number(mainFormData.get("totalReviews")) || 0;

        // Append the JSON data string
        requestFormData.append("data", JSON.stringify(data));
        
        // Append files separately
        const imageFile = mainFormData.get("image") as File;
        if (imageFile && imageFile.size > 0) {
            requestFormData.append("image", imageFile);
        }

        const visitorFiles = mainFormData.getAll("photoOfVisitor") as File[];
        visitorFiles.forEach(file => {
            if (file && file.size > 0) {
                requestFormData.append("photoOfVisitor", file);
            }
        });

        const menuFiles = mainFormData.getAll("hotelMenu") as File[];
        menuFiles.forEach(file => {
            if (file && file.size > 0) {
                requestFormData.append("hotelMenu", file);
            }
        });
        
        if (serviceToEdit) {
            await updateService({ id: serviceToEdit._id, formData: requestFormData }).unwrap();
            toast.success("Service updated successfully!");
        } else {
            await createService(requestFormData).unwrap();
            toast.success("Service created successfully!");
        }
        onSuccess();
    } catch (error) {
        console.error(error);
        toast.error(`Failed to ${serviceToEdit ? 'update' : 'create'} service`);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        
        {/* Modal Header */}
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/80 sticky top-0 z-20">
           <div>
               <h2 className="text-3xl font-black text-[#2E6F65] tracking-tight">{serviceToEdit ? "Edit Premium Service" : "Create Premium Service"}</h2>
               <p className="text-gray-500 mt-1 font-medium">{serviceToEdit ? "Update the details of the existing service." : "Fill in the details to list a new service on the platform."}</p>
           </div>
           <button 
                onClick={onClose} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-gray-100 text-gray-400 hover:text-gray-600 hover:shadow-md transition-all active:scale-90"
            >
                <X className="w-6 h-6" />
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-10 overflow-y-auto flex-1 bg-white">
           {/* Section: Location (Google Maps Integration) */}
           <div className="space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                       <MapPin className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Location & Maps</h3>
               </div>
               
                <div className="space-y-4">
                   <div className="space-y-2">
                     <Label className="font-bold text-gray-700">Search Address on Map</Label>
                     <div className="relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none z-10" />
                          <input 
                              id="maps-autocomplete-input"
                              type="text"
                              onChange={handleSearchInputChange}
                              placeholder="Start typing hotel or address..."
                              className="w-full h-14 rounded-2xl pl-12 pr-4 bg-gray-50 border border-transparent focus:bg-white focus:border-[#2E6F65] focus:outline-none focus:ring-2 focus:ring-[#2E6F65]/20 transition-all text-gray-800 placeholder:text-gray-400"
                          />
                      </div>
                   </div>
                </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                          <Label className="font-bold text-gray-700 text-xs uppercase tracking-wider">Final Address</Label>
                          <Input name="address" required value={location.address} onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                          <Label className="font-bold text-gray-700 text-xs uppercase tracking-wider">Latitude</Label>
                          <Input name="latitude" value={location.lat} onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))} className="h-12 rounded-xl bg-gray-50" readOnly />
                      </div>
                      <div className="space-y-2">
                          <Label className="font-bold text-gray-700 text-xs uppercase tracking-wider">Longitude</Label>
                          <Input name="longitude" value={location.lng} onChange={(e) => setLocation(prev => ({ ...prev, lng: e.target.value }))} className="h-12 rounded-xl bg-gray-50" readOnly />
                      </div>
                  </div>
               </div>

           {/* Section: Basic Info */}
           <div className="space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                   <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-[#2E6F65]">
                       <Tag className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Basic Information</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <Label className="font-bold text-gray-700">Service Name</Label>
                     <Input 
                         name="name" 
                         required 
                         placeholder="Enter service name" 
                         value={hotelName}
                         onChange={(e) => setHotelName(e.target.value)}
                         className="h-12 rounded-xl focus:ring-[#2E6F65] border-gray-200"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label className="font-bold text-gray-700">Service Link</Label>
                     <Input 
                         name="serviceLink" 
                         placeholder="Enter service website URL" 
                         value={serviceLink}
                         onChange={(e) => setServiceLink(e.target.value)}
                         className="h-12 rounded-xl focus:ring-[#2E6F65] border-gray-200"
                     />
                   </div>
                  <div className="space-y-2">
                      <Label className="font-bold text-gray-700">Category</Label>
                      <select 
                          name="cetagory" 
                          required 
                          value={selectedCategoryId}
                          onChange={(e) => {
                              const catId = e.target.value;
                              setSelectedCategoryId(catId);
                              const cat = categories.find((c: any) => c._id === catId);
                              setSelectedCategoryName(cat?.name || "");
                          }}
                          className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-[#2E6F65] focus:outline-none transition-all"
                      >
                          <option value="">Select Category</option>
                          {categories.map((cat: any) => (
                              <option key={cat._id} value={cat._id}>
                                  {cat.name}
                              </option>
                          ))}
                      </select>
                   </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Sub Category</Label>
                    <select 
                        name="subCetagory" 
                        required 
                        value={selectedSubCategoryId}
                        onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                        className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-[#2E6F65] focus:outline-none transition-all disabled:opacity-50 disabled:bg-gray-50"
                        disabled={!selectedCategoryId}
                    >
                        <option value="">Select Sub Category</option>
                        {subCategories.map((sub: any) => (
                            <option key={sub._id} value={sub._id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 space-y-2">
                    <Label className="font-bold text-gray-700">Description</Label>
                    <Textarea name="description" defaultValue={serviceToEdit?.description || ""} placeholder="Enter service description" className="min-h-[120px] rounded-2xl border-gray-200" />
                  </div>
               </div>
           </div>

           {/* Section: Media Uploads */}
           <div className="space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                   <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                       <ImageIcon className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Media Gallery</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Main Image */}
                  <div className="space-y-3">
                    <Label className="font-bold text-gray-700">Main Cover Image</Label>
                    <div 
                        className="relative h-48 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-[#2E6F65]/50 transition-all cursor-pointer group flex flex-col items-center justify-center overflow-hidden"
                        onClick={() => document.getElementById('main-img')?.click()}
                    >
                        {previews.main ? (
                            <Image src={previews.main} alt="Main" fill className="object-cover" />
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-300 group-hover:text-[#2E6F65] transition-colors mb-2" />
                                <p className="text-xs font-bold text-gray-400 group-hover:text-gray-600">Click to upload cover</p>
                            </>
                        )}
                        <input id="main-img" type="file" name="image" className="hidden" onChange={(e) => handleImageChange('main', e)} required={!serviceToEdit} />
                    </div>
                  </div>

                  {/* Visitor Photos */}
                  <div className="space-y-3">
                    <Label className="font-bold text-gray-700">Visitor Photos (Multiple)</Label>
                    <div 
                        className="relative h-48 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center p-4 overflow-hidden"
                        onClick={(e) => {
                            if ((e.target as HTMLElement).tagName !== 'IMG') {
                                document.getElementById('visitor-img')?.click();
                            }
                        }}
                    >
                        {previews.visitors.length > 0 ? (
                            <div className="flex gap-2 w-full overflow-x-auto snap-x pb-2 custom-scrollbar">
                                {previews.visitors.map((src, idx) => (
                                    <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden snap-center border border-gray-100 shadow-sm">
                                        <Image src={src} alt={`Visitor ${idx}`} fill className="object-cover" />
                                    </div>
                                ))}
                                <div className="flex flex-col items-center justify-center w-24 h-24 shrink-0 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 hover:text-[#2E6F65] hover:border-[#2E6F65] transition-colors" onClick={() => document.getElementById('visitor-img')?.click()}>
                                    <Plus className="w-6 h-6" />
                                    <span className="text-[10px] mt-1 font-bold">Add More</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                <p className="text-xs font-bold text-gray-400 text-center">Click to upload visitor photos</p>
                            </>
                        )}
                        <input id="visitor-img" type="file" name="photoOfVisitor" multiple className="hidden" onChange={(e) => handleImageChange('visitors', e)} />
                    </div>
                  </div>

                  {/* Menu Photos */}
                  {selectedCategoryName.toLowerCase() === "restaurants" && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="font-bold text-gray-700">Hotel Menu (Multiple)</Label>
                        <div 
                            className="relative h-48 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center p-4 overflow-hidden"
                            onClick={(e) => {
                                if ((e.target as HTMLElement).tagName !== 'IMG') {
                                    document.getElementById('menu-img')?.click();
                                }
                            }}
                        >
                            {previews.menu.length > 0 ? (
                                <div className="flex gap-2 w-full overflow-x-auto snap-x pb-2 custom-scrollbar">
                                    {previews.menu.map((src, idx) => (
                                        <div key={idx} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden snap-center border border-gray-100 shadow-sm">
                                            <Image src={src} alt={`Menu ${idx}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                    <div className="flex flex-col items-center justify-center w-24 h-24 shrink-0 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400 hover:text-[#2E6F65] hover:border-[#2E6F65] transition-colors" onClick={() => document.getElementById('menu-img')?.click()}>
                                        <Plus className="w-6 h-6" />
                                        <span className="text-[10px] mt-1 font-bold">Add More</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                    <p className="text-xs font-bold text-gray-400 text-center">Click to upload menu items</p>
                                </>
                            )}
                            <input id="menu-img" type="file" name="hotelMenu" multiple className="hidden" onChange={(e) => handleImageChange('menu', e)} />
                        </div>
                      </div>
                  )}
               </div>
           </div>

           {/* Section: Operational Info */}
           <div className="space-y-6">
               <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                   <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                       <Clock className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-800">Operations & Timing</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {selectedCategoryName.toLowerCase() !== "events" && selectedCategoryName.toLowerCase() !== "excursions" && (
                    <>
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="font-bold text-gray-700">Open Time</Label>
                        <Input type="time" name="openTime" value={operatingHours.open} onChange={(e) => setOperatingHours(prev => ({ ...prev, open: e.target.value }))} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="font-bold text-gray-700">Close Time</Label>
                        <Input type="time" name="closeTime" value={operatingHours.close} onChange={(e) => setOperatingHours(prev => ({ ...prev, close: e.target.value }))} className="h-12 rounded-xl" />
                      </div>
                    </>
                  )}
                   {selectedCategoryName.toLowerCase() === "events" && (
                     <>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Starting Time</Label>
                         <Input type="time" name="startTime" defaultValue={serviceToEdit?.startTime || ""} className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Ending Time</Label>
                         <Input type="time" name="endTime" defaultValue={serviceToEdit?.endTime || ""} className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Venue</Label>
                         <Input type="text" name="venue" defaultValue={serviceToEdit?.venue || ""} placeholder="Event Venue" className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Ticket Price</Label>
                         <Input type="text" name="ticketPrice" defaultValue={serviceToEdit?.ticketPrice || ""} placeholder="e.g. Free, $50" className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Ticket Link</Label>
                         <Input type="url" name="ticketLink" defaultValue={serviceToEdit?.ticketLink || ""} placeholder="https://..." className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Organiser</Label>
                         <Input type="text" name="organiser" defaultValue={serviceToEdit?.organiser || ""} placeholder="Organiser Name" className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Age Restriction</Label>
                         <Input type="text" name="ageRestriction" defaultValue={serviceToEdit?.ageRestriction || ""} placeholder="e.g. 18+" className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                         <Label className="font-bold text-gray-700">Dress Code</Label>
                         <Input type="text" name="dressCode" defaultValue={serviceToEdit?.dressCode || ""} placeholder="e.g. Smart Casual" className="h-12 rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                       <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 lg:col-span-2">
                         <Label className="font-bold text-gray-700">Parking / Transport Info</Label>
                         <Textarea name="parkingInfo" defaultValue={serviceToEdit?.parkingInfo || ""} placeholder="Details about parking or transport..." className="min-h-[80px] rounded-xl border-[#2E6F65]/30 bg-green-50/30" />
                       </div>
                     </>
                   )}
               </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 md:col-span-2">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                            <Gift className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Special Offer</h3>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label className="font-bold text-gray-700">Select Active Offer</Label>
                        <select 
                            name="offer" 
                            value={selectedOfferId}
                            onChange={(e) => setSelectedOfferId(e.target.value)}
                            className="w-full h-12 rounded-xl border border-gray-200 px-4 focus:ring-2 focus:ring-[#2E6F65] focus:outline-none transition-all"
                        >
                            <option value="">No Active Offer</option>
                            {offers.map((off: any) => (
                                <option key={off._id} value={off._id}>
                                    {off.title} {off.cetagory?.name ? `(${off.cetagory.name})` : ''} - {off.discount}% OFF
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 italic">Select an offer to apply it to this service. Choose "No Active Offer" to disable.</p>
                    </div>
                </div>              
               </div>

           {/* Section: Additional Stats (Placeholders for manual entry if needed) */}
           <div className="space-y-6 pt-4 border-t border-gray-100">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Initial Rating</Label>
                    <Input type="number" step="0.1" max="5" name="averageRating" value={placeData.rating} readOnly className="h-12 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-gray-700">Total Reviews</Label>
                    <Input type="number" name="totalReviews" value={placeData.totalReviews} readOnly className="h-12 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                 
                  {selectedCategoryName.toLowerCase() === "events" && (
                      <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                        <Label className="font-bold text-gray-700">Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                            <Input type="date" name="date" defaultValue={serviceToEdit?.date || ""} className="h-12 rounded-xl pl-10 text-gray-700" />
                        </div>
                      </div>
                  )}
               </div>
           </div>
           
           {/* Section: Top Reviews (Auto populated) */}
           {placeData.reviews.length > 0 && (
               <div className="space-y-6 pt-6 border-t border-gray-100 animate-in fade-in duration-500">
                   <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                       <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                           <Star className="w-5 h-5 fill-current" />
                       </div>
                       <h3 className="text-xl font-bold text-gray-800">Top Reviews from Maps</h3>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {placeData.reviews.map((review, idx) => (
                           <div key={idx} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                               <div className="flex items-center gap-3">
                                   {review.profile_photo_url ? (
                                       <img src={review.profile_photo_url} alt={review.author_name} className="w-10 h-10 rounded-full object-cover" />
                                   ) : (
                                       <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                           {review.author_name?.charAt(0)}
                                       </div>
                                   )}
                                   <div>
                                       <p className="font-bold text-sm text-gray-800 line-clamp-1">{review.author_name}</p>
                                       <div className="flex items-center gap-1">
                                           <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                           <span className="text-xs font-bold text-gray-600">{review.rating}</span>
                                           <span className="text-xs text-gray-400 ml-1 truncate max-w-[100px]">{review.relative_time_description}</span>
                                       </div>
                                   </div>
                               </div>
                               <p className="text-sm text-gray-600 line-clamp-3 italic">"{review.text}"</p>
                           </div>
                       ))}
                   </div>
               </div>
           )}
           
           {/* Form Actions */}
           <div className="pt-10 flex flex-col sm:flex-row gap-4 sticky bottom-0 bg-white pb-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 h-14 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all"
              >
                  Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className={`flex-1 h-14 rounded-2xl ${buttonbg} font-bold text-lg shadow-lg shadow-[#2E6F65]/20 hover:scale-[1.02] active:scale-95 transition-all`}
              >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        {serviceToEdit ? "Updating..." : "Creating..."}
                    </div>
                ) : (
                    serviceToEdit ? "Update Service" : "Create Service"
                )}
              </Button>
           </div>
        </form>
      </div>
    </div>
  );
};
