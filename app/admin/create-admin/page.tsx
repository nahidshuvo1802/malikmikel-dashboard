"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Trash2, Camera, Upload, User, Mail, Lock } from "lucide-react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buttonbg, textPrimary } from "@/contexts/theme";
import { Loader } from "@/components/ui/loader";
import { 
  useCreateAdminMutation, 
  useGetAllAdminsQuery, 
  useDeleteAdminMutation 
} from "@/store/api/adminApi";
import { getImageUrl } from "@/store/config/envConfig";

export default function CreateAdminPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    imageFile: null as File | null,
    imagePreview: null as string | null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Hooks
  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const { data: adminsResponse, isLoading: isTableLoading, refetch } = useGetAllAdminsQuery({ page: currentPage, limit: 10 });
  const [deleteAdmin] = useDeleteAdminMutation();

  const admins = adminsResponse?.data || [];
  const meta = adminsResponse?.meta || { totalPages: 1, total: 0 };
  const totalPages = meta.totalPages || meta.totalPage || 1;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ 
        ...formData, 
        imageFile: file,
        imagePreview: URL.createObjectURL(file) 
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match!");
        return;
    }

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("email", formData.email);
    submitData.append("password", formData.password);
    submitData.append("confirmPassword", formData.confirmPassword);
    if (formData.imageFile) {
        submitData.append("image", formData.imageFile);
    }

    try {
        await createAdmin(submitData).unwrap();
        toast.success("New admin created successfully!");
        setFormData({ name: "", email: "", password: "", confirmPassword: "", imageFile: null, imagePreview: null });
        refetch();
    } catch (error: any) {
        toast.error(error?.data?.message || "Failed to create admin");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const promise = deleteAdmin(id).unwrap();
      toast.promise(promise, {
        loading: 'Deleting admin...',
        success: 'Admin deleted successfully!',
        error: 'Failed to delete admin'
      });
      await promise;
      refetch();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="w-full mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8">
          
          {/* Create Admin Form Section */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden h-fit sticky top-6">
              <div className={`${buttonbg} px-8 py-6 flex items-center gap-3`}>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                    <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-white text-xl font-black tracking-tight">Create Admin</h1>
                    <p className="text-white/70 text-xs font-bold uppercase tracking-widest">New Role Assignment</p>
                </div>
              </div>
              
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Image Upload */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-32 h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-[#2E6F65]/50 transition-all duration-300 transform group-hover:scale-105 shadow-inner">
                                {formData.imagePreview ? (
                                    <Image src={formData.imagePreview} alt="Preview" fill className="object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <Camera className="w-10 h-10 text-gray-300" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Upload</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl text-[#2E6F65] shadow-xl border border-gray-100 group-hover:bg-[#2E6F65] group-hover:text-white transition-colors duration-300">
                                <Upload className="w-4 h-4" />
                            </div>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    id="name" 
                                    placeholder="Enter full name" 
                                    className="h-12 pl-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                    id="email" 
                                    type="email" 
                                    placeholder="Enter admin email" 
                                    className="h-12 pl-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase ml-1">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input 
                                        id="password" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="h-12 pl-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-xs font-bold text-gray-500 uppercase ml-1">Confirm Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input 
                                        id="confirmPassword" 
                                        type="password" 
                                        placeholder="••••••••" 
                                        className="h-12 pl-11 rounded-xl bg-gray-50/50 border-gray-100 focus:bg-white transition-all"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button 
                        type="submit" 
                        className={`w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest ${buttonbg} shadow-lg shadow-[#2E6F65]/20 hover:scale-[1.02] transition-transform active:scale-100`}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <div className="flex items-center gap-2">
                                <Loader className="w-5 h-5 animate-spin text-white" />
                                Processing...
                            </div>
                        ) : "Create Admin Account"}
                    </Button>
                </form>
              </div>
          </div>

          {/* Existing Admins List Section */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">System Administrators</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Personnel List</p>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                      <span className="text-xs font-black text-[#2E6F65]">{meta.total} Total</span>
                  </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-none">
                            <TableHead className={`font-black text-[10px] uppercase tracking-widest py-5 ${textPrimary} pl-8`}>Profile</TableHead>
                            <TableHead className={`font-black text-[10px] uppercase tracking-widest py-5 ${textPrimary}`}>Email</TableHead>
                            <TableHead className={`font-black text-[10px] uppercase tracking-widest py-5 ${textPrimary}`}>Role</TableHead>
                            <TableHead className={`font-black text-[10px] uppercase tracking-widest py-5 ${textPrimary} text-right pr-8`}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isTableLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20">
                                    <Loader />
                                </TableCell>
                            </TableRow>
                        ) : admins.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-20">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <ShieldCheck className="w-16 h-16" />
                                        <p className="font-black uppercase tracking-tighter text-2xl">No Admins Found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : admins.map((admin: any) => (
                            <TableRow key={admin._id} className="group hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0">
                                <TableCell className="py-5 pl-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-200">
                                            {admin.image ? (
                                                <Image src={getImageUrl(admin.image)} alt={admin.name} fill className="object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-[#2E6F65] font-black">
                                                    {admin.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-bold text-gray-900">{admin.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-5 text-gray-500 font-medium text-sm">{admin.email}</TableCell>
                                <TableCell className="py-5">
                                    <Badge variant="secondary" className="rounded-lg px-2 py-1 bg-[#2E6F65]/10 text-[#2E6F65] hover:bg-[#2E6F65]/20 border-none font-black text-[10px] uppercase">
                                        {admin.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="py-5 text-right pr-8">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                        onClick={() => {
                                            setAdminToDelete(admin);
                                            setIsDeleteModalOpen(true);
                                        }}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="p-6 bg-gray-50/30 border-t border-gray-100">
                <Pagination>
                    <PaginationContent className="gap-2">
                        <PaginationItem>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-[#2E6F65] disabled:opacity-30 transition-colors"
                            >
                                <PaginationPrevious className="p-0 h-auto hover:bg-transparent" />
                            </button>
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <PaginationItem key={page}>
                                <button 
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-10 h-10 rounded-2xl font-black text-xs transition-all ${
                                        currentPage === page 
                                        ? "bg-[#2E6F65] text-white shadow-lg shadow-[#2E6F65]/30 scale-110" 
                                        : "text-gray-400 hover:text-gray-600 hover:bg-white"
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
                                className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-[#2E6F65] disabled:opacity-30 transition-colors"
                            >
                                <PaginationNext className="p-0 h-auto hover:bg-transparent" />
                            </button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
              </div>
          </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(adminToDelete?._id)}
        adminName={adminToDelete?.name}
      />

    </div>
  );
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, adminName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; adminName?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete Admin?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete <span className="font-bold text-gray-800">{adminName || "this admin"}</span>? This action cannot be undone and will permanently remove all associated privileges.
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
