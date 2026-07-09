"use client";

import { useState, useRef, useEffect } from "react";
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
  Upload, 
  Image as ImageIcon,
  CheckCircle2,
  Star,
  Clock,
  ShieldCheck,
  X,
  GripVertical
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
import { useGetAllVendorsQuery, useDeleteVendorMutation, useCreateVendorMutation } from "@/store/api/vendorApi";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";

// Types
type Vendor = {
  id: string;
  name: string;
  badge: "Partner" | "Trending" | "NA" | "Popular" | "Trusted";
  type: string;
};

type Badge = {
  id: string;
  name: string;
  iconName: string;
};

// Mock Data
const initialVendors: Vendor[] = [
  { id: "01", name: "Air Condition", badge: "Partner", type: "Air Condition" },
  { id: "01", name: "Electric Work", badge: "Trending", type: "Electric Work" },
  { id: "01", name: "Electric Work", badge: "NA", type: "Electric Work" },
  { id: "01", name: "Electric Work", badge: "NA", type: "Electric Work" },
];

const initialBadges: Badge[] = [
  { id: "01", name: "Popular", iconName: "verified" },
  { id: "01", name: "Partner", iconName: "verified" },
  { id: "01", name: "Trusted", iconName: "verified" },
];

// Add Vendor Modal Component
const AddVendorModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: FormData) => Promise<void> }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData);
    setIsLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setPreview(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
           <h2 className="text-xl font-bold text-[#2E6F65]">Add New Vendor</h2>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Enter vendor name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="Enter email address" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" required placeholder="Enter phone number" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="serviceType">Service Type</Label>
                <Input id="serviceType" name="serviceType" required placeholder="Enter service type" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" required placeholder="Enter street address" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required placeholder="Enter city" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" required placeholder="Enter state" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="zip">Zip</Label>
                <Input id="zip" name="zip" required placeholder="Enter zip code" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" required placeholder="Enter country" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="serviceDescription">Service Description</Label>
                <Textarea id="serviceDescription" name="serviceDescription" required placeholder="Enter service description" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Vendor Image</Label>
                <div className="flex items-center gap-4">
                   <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden">
                      {preview ? (
                          <Image src={preview} alt="preview" fill className="object-cover" />
                      ) : (
                          <ImageIcon className="text-gray-300 w-8 h-8" />
                      )}
                   </div>
                   <Input 
                      type="file" 
                      name="image" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      className="flex-1 cursor-pointer"
                      required
                   />
                </div>
              </div>
           </div>
           
           <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button type="submit" disabled={isLoading} className={`flex-1 ${buttonbg}`}>
                {isLoading ? "Creating..." : "Create Vendor"}
              </Button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default function VendorsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<any>(null);
  
  const { data: vendorsResponse, isLoading } = useGetAllVendorsQuery({ page: currentPage, limit: 10 });
  const [deleteVendor] = useDeleteVendorMutation();
  const [createVendor] = useCreateVendorMutation();

  const vendors = vendorsResponse?.data || [];
  const meta = vendorsResponse?.meta || { totalPages: 1, total: 0 };
  const totalPages = meta.totalPages || meta.totalPage || 1;

  const handleDeleteVendor = async (id: string) => {
    try {
      const promise = deleteVendor(id).unwrap();
      toast.promise(promise, {
        loading: 'Deleting vendor...',
        success: 'Vendor deleted successfully!',
        error: 'Failed to delete vendor'
      });
      await promise;
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent space-y-5">
      
      {/* Header */}
      <div className={`${buttonbg} rounded-t-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4`}>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
              <h1 className="text-2xl font-bold text-white">
                  Vendor Lists
              </h1>
          </div>
          
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold w-full md:w-auto"
          >
              +Add New Vendor
          </Button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden -mt-4 relative z-10 min-h-[500px] flex flex-col justify-between p-5">
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow className="">
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary} pl-6`}>S.ID</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Name</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Badge</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Type</TableHead>
                            <TableHead className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20">
                                    <Loader />
                                </TableCell>
                            </TableRow>
                        ) : vendors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-gray-500">
                                    No vendors found
                                </TableCell>
                            </TableRow>
                        ) : vendors.map((vendor: any, i: number) => (
                            <TableRow key={vendor._id || i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                                <TableCell className="font-medium text-gray-600 py-4 pl-6">
                                    {((currentPage - 1) * 10 + i + 1).toString().padStart(2, '0')}
                                </TableCell>
                                <TableCell className="text-gray-900 font-medium py-4">{vendor.name}</TableCell>
                                <TableCell className="text-gray-600 py-4">Partner</TableCell>
                                <TableCell className="text-gray-600 py-4">{vendor.serviceType || "N/A"}</TableCell>
                                <TableCell className="py-4 pr-6">
                                    <div className="flex items-center justify-end gap-3">
                                        <button 
                                            onClick={() => {
                                                setVendorToDelete(vendor);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <button className="text-gray-800 hover:text-black transition-colors">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
             
             {/* Pagination */}
              <div className="p-4 border-t border-gray-100">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#2E6F65] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PaginationPrevious className="hover:bg-transparent p-0 h-auto" />
                            </button>
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <button 
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg border-0 transition-colors ${
                                        currentPage === page 
                                        ? "bg-[#2E6F65] text-white" 
                                        : "text-gray-600 hover:text-[#2E6F65] hover:bg-gray-100"
                                    }`}
                                >
                                    {page}
                                </button>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#2E6F65] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PaginationNext className="hover:bg-transparent p-0 h-auto" />
                            </button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
              </div>
      </div>

       {/* Add Vendor Modal */}
       <AddVendorModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onSubmit={async (formData) => {
             try {
                await createVendor(formData).unwrap();
                toast.success("Vendor created successfully");
                setIsAddModalOpen(false);
             } catch (error) {
                toast.error("Failed to create vendor");
             }
          }}
       />

       {/* Delete Confirmation Modal */}
       <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => handleDeleteVendor(vendorToDelete?._id)}
          vendorName={vendorToDelete?.name}
       />
    </div>
  );
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, vendorName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; vendorName?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete Vendor?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete <span className="font-bold text-gray-800">{vendorName || "this vendor"}</span>? This action cannot be undone.
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
