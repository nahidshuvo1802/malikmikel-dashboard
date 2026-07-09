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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Trash2,
  Edit,
  Layers,
  ImageIcon,
  X,
  AlertCircle,
  RefreshCw,
  Tag,
  Plus,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary } from "@/contexts/theme";
import { useDebounce } from "@/store/hooks";
import {
  useGetAllSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
} from "@/store/api/subCategoryApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoryApi";
import { getImageUrl } from "@/store/config/envConfig";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

// ── Types ──────────────────────────────────────────────────────────────────────
type ParentCategory = {
  _id: string;
  name: string;
  image: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type ApiSubCategory = {
  _id: string;
  name: string;
  cetagory: ParentCategory;
  images: string[];
  image?: string | null;
  description?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
};

type ModalMode = "create" | "edit";

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function SubCategoryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [selectedCategory, setSelectedCategory] = useState("");
  const { data, isLoading, isError, refetch } = useGetAllSubCategoriesQuery({ 
    page, 
    limit, 
    category: selectedCategory,
    searchTerm: debouncedSearchTerm
  });
  const { data: categoryData } = useGetAllCategoriesQuery({ page: 1, limit: 100 });
  const [createSubCategory, { isLoading: isCreating }] = useCreateSubCategoryMutation();
  const [updateSubCategory, { isLoading: isUpdating }] = useUpdateSubCategoryMutation();
  const [deleteSubCategory, { isLoading: isDeleting }] = useDeleteSubCategoryMutation();

  // ── Modal / form state ────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingItem, setEditingItem] = useState<ApiSubCategory | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ApiSubCategory | null>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) router.push("/auth");
    else if (user?.role !== "admin") router.push("/");
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  // ── Derived ───────────────────────────────────────────────────────────────
  const subCategories: ApiSubCategory[] = data?.data ?? [];
  const categories: ParentCategory[] = categoryData?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || meta?.totalPage || 1;

  // ── Handlers ─────────────────────────────────────────────────────────────
  function openCreate() {
    setModalMode("create");
    setEditingItem(null);
    setName("");
    setDescription("");
    setTags("");
    setCategoryId(categories[0]?._id ?? "");
    setImageFiles([]);
    setImagePreviews([]);
    setIsModalOpen(true);
  }

  function openEdit(item: ApiSubCategory) {
    setModalMode("edit");
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description ?? "");
    setTags(item.tags ?? "");
    setCategoryId(item.cetagory?._id ?? "");
    setImageFiles([]);
    // Show existing images as previews
    const existingPreviews = item.images?.map((img) => getImageUrl(img)) ?? [];
    setImagePreviews(existingPreviews);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFiles([]);
    setImagePreviews([]);
  }

  function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  }

  function removePreview(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Sub-category name is required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a parent category");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("cetagory", categoryId);
    if (description.trim()) formData.append("description", description.trim());
    if (tags.trim()) formData.append("tags", tags.trim());
    imageFiles.forEach((file) => formData.append("image", file));

    try {
      if (modalMode === "create") {
        await createSubCategory(formData).unwrap();
        toast.success("Sub-category created successfully");
      } else if (editingItem) {
        await updateSubCategory({ id: editingItem._id, data: formData }).unwrap();
        toast.success("Sub-category updated successfully");
      }
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteSubCategory(deleteTarget._id).unwrap();
      toast.success("Sub-category deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete sub-category");
    } finally {
      setDeleteTarget(null);
    }
  }

  const isBusy = isCreating || isUpdating;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{meta?.total ?? "—"}</h3>
            <p className="text-gray-500 font-medium mt-1">Total Sub-Categories</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#2E6F65]">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{categories.length}</h3>
            <p className="text-gray-500 font-medium mt-1">Parent Categories</p>
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-500">
            <Tag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className={`${buttonbg} rounded-t-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <h2 className="text-white text-xl font-bold">Sub-Categories</h2>
          
          <div className="relative w-full sm:w-48">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="text-gray-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name} className="text-gray-900">{cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/60">
               <Tag className="w-3 h-3" />
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
            <input 
              type="text"
              placeholder="Search sub-categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>
        <Button
          onClick={openCreate}
          className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold w-full md:w-auto"
        >
          + Add Sub-Category
        </Button>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden -mt-4 relative z-10 min-h-[400px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <Loader className="w-8 h-8 animate-spin text-[#2E6F65]" />
            <p className="text-sm">Loading sub-categories…</p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">Failed to load sub-categories</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : subCategories.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
            <Layers className="w-10 h-10" />
            <p className="text-sm">No sub-categories found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b border-[#2E6F65] hover:bg-transparent">
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary} pl-6`}>#</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Images</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Name</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Parent Category</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Description</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Tags</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary}`}>Created</TableHead>
                    <TableHead className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subCategories.map((item, i) => (
                    <TableRow key={item._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <TableCell className="font-medium text-gray-500 py-4 pl-6">
                        {(page - 1) * limit + i + 1}
                      </TableCell>

                      {/* Images */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-1">
                          {item.images && item.images.length > 0 ? (
                            <>
                              {item.images.slice(0, 2).map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0"
                                >
                                  <Image
                                    src={getImageUrl(img)}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ))}
                              {item.images.length > 2 && (
                                <span className="text-xs text-gray-400 font-medium">
                                  +{item.images.length - 2}
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-gray-900 font-semibold py-4">{item.name}</TableCell>

                      {/* Parent Category Badge */}
                      <TableCell className="py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-[#2E6F65] border border-green-100">
                          {item.cetagory?.name ?? "—"}
                        </span>
                      </TableCell>

                      <TableCell className="text-gray-500 py-4 max-w-[160px] truncate text-sm">
                        {item.description ?? "—"}
                      </TableCell>

                      <TableCell className="py-4">
                        {item.tags ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                            {item.tags}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </TableCell>

                      <TableCell className="text-gray-500 py-4 text-sm whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </TableCell>

                      <TableCell className="py-4 pr-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openEdit(item)}
                            className="text-gray-500 hover:text-gray-800 transition-colors"
                            title="Edit"
                          >
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
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                      className={page === 1 ? "pointer-events-none opacity-40" : "text-gray-500 hover:text-[#2E6F65]"}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                    <PaginationItem key={pg}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage(pg); }}
                        isActive={pg === page}
                        className={
                          pg === page
                            ? "bg-[#2E6F65] text-white hover:bg-[#2E6F65]/90 hover:text-white border-0"
                            : "text-gray-500 hover:text-[#2E6F65]"
                        }
                      >
                        {pg}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                      className={page === totalPages ? "pointer-events-none opacity-40" : "text-gray-500 hover:text-[#2E6F65]"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Modal ────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl my-8 animate-in fade-in zoom-in duration-200">

            {/* Modal Header */}
            <div className={`${buttonbg} rounded-t-2xl px-6 py-4 flex items-center justify-between`}>
              <h2 className="text-white text-lg font-bold">
                {modalMode === "create" ? "Add New Sub-Category" : "Edit Sub-Category"}
              </h2>
              <button onClick={closeModal} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="sub-name">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="sub-name"
                  placeholder="Enter sub-category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="sub-category">Parent Category <span className="text-red-500">*</span></Label>
                <select
                  id="sub-category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="">— Select a category —</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="sub-desc">Description</Label>
                <Textarea
                  id="sub-desc"
                  placeholder="Enter description"
                  className="min-h-[80px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label htmlFor="sub-tags">Tags</Label>
                <Input
                  id="sub-tags"
                  placeholder="Enter tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              {/* Images Upload */}
              <div className="space-y-2">
                <Label>Images</Label>

                {/* Previews grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                        <Image src={src} alt={`preview-${idx}`} fill className="object-cover" />
                        {/* Only allow removing newly selected files */}
                        {imageFiles[idx] && (
                          <button
                            onClick={() => removePreview(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#2E6F65] transition-colors flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:text-[#2E6F65]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {imagePreviews.length > 0 ? "Replace / Add More Images" : "Click to upload images"}
                  </span>
                  <span className="text-xs">PNG, JPG, WEBP — multiple allowed</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImagesChange}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 px-6 pb-6">
              <Button
                variant="outline"
                className={`flex-1 h-11 border-[#2E6F65] ${textPrimary} hover:bg-green-50 font-semibold`}
                onClick={closeModal}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button
                className={`flex-1 h-11 ${buttonbg} font-semibold`}
                onClick={handleSubmit}
                disabled={isBusy}
              >
                {isBusy ? (
                  <span className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin" />
                    {modalMode === "create" ? "Creating…" : "Saving…"}
                  </span>
                ) : modalMode === "create" ? "Create Sub-Category" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sub-Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" /> Deleting…
                </span>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
