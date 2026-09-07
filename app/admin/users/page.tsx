"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, Ban, Search, X, Trash2, CheckCircle2, XCircle, ShieldCheck, History } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useGetAllUserQuery, useChangeStatusMutation, useDeleteUserMutation } from "@/store/api/userApi";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner"; // Assuming sonner is used for notifications based on common project patterns

// Custom Modal for User Details with Marketing Consent Audit Record
const UserDetailModal = ({ isOpen, onClose, user }: { isOpen: boolean; onClose: () => void; user: any }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#2E6F65] to-[#58976B] text-white rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold shadow-md">
            {user?.userName?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h3 className="text-xl font-bold text-[#2E6F65]">{user?.userName}</h3>
          <p className="text-sm text-gray-500 mb-5">{user?.email}</p>
          
          {/* General Information */}
          <div className="space-y-2.5 text-left text-sm bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
             <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Phone</span>
                <span className="font-medium text-gray-800">{user?.phone || "N/A"}</span>
             </div>
             <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Country</span>
                <span className="font-medium text-gray-800">{user?.country || "N/A"}</span>
             </div>
             <div className="flex justify-between border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Joined Date</span>
                <span className="font-medium text-gray-800">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-500">Last Active</span>
                <span className="font-medium text-gray-800">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "N/A"}</span>
             </div>
          </div>

          {/* Marketing Consent & Audit Record Section */}
          <div className="text-left border border-gray-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
             <div className="flex items-center justify-between border-b border-gray-150 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2E6F65]" />
                  <span className="font-semibold text-gray-900 text-sm">Marketing Consent</span>
                </div>
                {user?.marketingConsent ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Subscribed (Opted In)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <XCircle className="w-3.5 h-3.5 text-gray-400" />
                    Not Subscribed (Opted Out)
                  </span>
                )}
             </div>

             <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Consent Updated:</span>
                  <span className="font-medium text-gray-700">
                    {user?.marketingConsentUpdatedAt
                      ? new Date(user.marketingConsentUpdatedAt).toLocaleString()
                      : (user?.createdAt ? new Date(user.createdAt).toLocaleString() : "N/A")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Consent Version:</span>
                  <span className="font-medium text-gray-700">{user?.marketingConsentVersion || "1.0"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Consent Wording Shown:</span>
                  <p className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200/80 italic leading-relaxed">
                    "{user?.marketingConsentWording || "I’d like to receive news, offers, promotions and updates from Caribee by email and other electronic communications."}"
                  </p>
                </div>
             </div>

             {/* Audit History Log */}
             {user?.marketingConsentHistory && user.marketingConsentHistory.length > 0 && (
                <div className="pt-2.5 border-t border-gray-150">
                   <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                     <History className="w-3.5 h-3.5 text-[#2E6F65]" />
                     Consent Audit Log ({user.marketingConsentHistory.length} {user.marketingConsentHistory.length === 1 ? "event" : "events"})
                   </span>
                   <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {user.marketingConsentHistory.slice().reverse().map((entry: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[11px] bg-gray-50 px-2.5 py-1.5 rounded border border-gray-150">
                           <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${entry.consent ? "bg-emerald-500" : "bg-gray-400"}`} />
                              <span className="font-medium text-gray-800">{entry.consent ? "Opted In" : "Opted Out"}</span>
                              <span className="text-gray-400 capitalize">({entry.source || "system"})</span>
                           </div>
                           <span className="text-gray-500">
                             {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ""}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  
  const [userToBlock, setUserToBlock] = useState<any>(null);
  const [isBlockOpen, setIsBlockOpen] = useState(false);

  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchTerm);
        setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: usersResponse, isLoading, refetch } = useGetAllUserQuery({
    page: currentPage,
    limit: 10,
    searchTerm: debouncedSearch
  });

  const [changeStatus] = useChangeStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  const usersData = usersResponse?.data || [];
  const meta = usersResponse?.meta || { totalPages: 1, totalUsers: 0 };

  const handleBlockUser = async () => {
    if (!userToBlock) return;
    try {
        await changeStatus({ 
            id: userToBlock._id, 
            status: { status: "blocked" } 
        }).unwrap();
        toast.success("User blocked successfully");
        refetch();
        setIsBlockOpen(false);
        setUserToBlock(null);
    } catch (error) {
        toast.error("Failed to block user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const promise = deleteUser(id).unwrap();
      toast.promise(promise, {
        loading: 'Deleting user...',
        success: 'User deleted successfully!',
        error: 'Failed to delete user'
      });
      await promise;
      refetch();
      setIsDeleteOpen(false);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-5">
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#2E6F65] to-[#58976B] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <h1 className="text-2xl font-bold text-white">User List</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input 
                    placeholder="Search User" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white border-none h-11 text-gray-900 placeholder:text-gray-400 rounded-lg"
                />
            </div>
            
            {/* Blocked Users Button */}
            {/* <Button className="bg-white text-[#2E6F65] hover:bg-white/90 font-semibold h-11 px-6 rounded-lg w-full sm:w-auto">
                Blocked Users
            </Button> */}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
        <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-white">
                    <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className="text-[#58976B] font-semibold text-base py-5">S.ID</TableHead>
                        <TableHead className="text-[#58976B] font-semibold text-base py-5">Full Name</TableHead>
                        <TableHead className="text-[#58976B] font-semibold text-base py-5">Email</TableHead>
                        <TableHead className="text-[#58976B] font-semibold text-base py-5">Phone No</TableHead>
                        <TableHead className="text-[#58976B] font-semibold text-base py-5">Joined Date</TableHead>
                        <TableHead className="text-[#58976B] font-semibold text-base py-5">Marketing Consent</TableHead>
                        <TableHead className="text-[#58976B] font-semibold text-base text-center py-5">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-20">
                                <Loader />
                            </TableCell>
                        </TableRow>
                    ) : usersData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center py-20 text-gray-500">
                                No users found
                            </TableCell>
                        </TableRow>
                    ) : usersData.map((u: any, i: number) => (
                        <TableRow key={u._id || i} className="hover:bg-gray-50 border-b border-gray-100">
                             <TableCell className="font-medium text-gray-600 py-4">
                                {(currentPage - 1) * 10 + i + 1}
                             </TableCell>
                             <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                         <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-500">
                                            {u.userName?.charAt(0)?.toUpperCase()}
                                         </div>
                                    </div>
                                    <span className="font-medium text-gray-900">{u.userName}</span>
                                </div>
                             </TableCell>
                             <TableCell className="text-gray-600 py-4">{u.email}</TableCell>
                             <TableCell className="text-gray-600 py-4">{u.phone || "N/A"}</TableCell>
                             <TableCell className="text-gray-600 py-4">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                             </TableCell>
                             <TableCell className="py-4">
                                {u.marketingConsent ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Subscribed
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                        Not Subscribed
                                    </span>
                                )}
                             </TableCell>
                             <TableCell className="py-4">
                                <div className="flex items-center justify-center gap-3">
                                    <button 
                                        onClick={() => { setUserToBlock(u); setIsBlockOpen(true); }}
                                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                    >
                                        <Ban className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => { setSelectedUser(u); setIsViewOpen(true); }}
                                        className="text-[#58976B] hover:text-[#2E6F65] p-2 hover:bg-green-50 rounded-full transition-colors"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => { setUserToDelete(u); setIsDeleteOpen(true); }}
                                        className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
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
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
         {/* <p className="text-[#58976B] text-sm font-medium">SHOWING 1-8 OF 250</p> */}
         
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
                
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
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
                        onClick={() => setCurrentPage(prev => Math.min(meta.totalPages, prev + 1))}
                        disabled={currentPage === meta.totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#2E6F65] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PaginationNext className="hover:bg-transparent p-0 h-auto" />
                    </button>
                </PaginationItem>
            </PaginationContent>
         </Pagination>
      </div>

       {/* User Details Modal */}
       <UserDetailModal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} user={selectedUser} />
      
      {/* Block User Alert Dialog */}
      <AlertDialog open={isBlockOpen} onOpenChange={setIsBlockOpen}>
        <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
                <AlertDialogTitle>Block User?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to block <span className="font-bold text-gray-900">{userToBlock?.name}</span>? They will lose access to the platform.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setUserToBlock(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                    onClick={handleBlockUser} 
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    Block
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDeleteUser(userToDelete?._id)}
        userName={userToDelete?.userName}
      />

    </div>
  );
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; userName?: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete User?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete <span className="font-bold text-gray-800">{userName || "this user"}</span>? This action cannot be undone and will permanently remove all associated data.
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
