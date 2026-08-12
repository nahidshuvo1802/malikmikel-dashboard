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
  Search,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary } from "@/contexts/theme";
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/store/api/categoryApi";
import { getImageUrl } from "@/store/config/envConfig";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { useDebounce } from "@/store/hooks";

// ── Types ──────────────────────────────────────────────────────────────────────
type ApiCategory = {
  _id: string;
  name: string;
  image: string | null;
  description?: string;
  bgColor?: string;
  textColor?: string;
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
export default function CategoryPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // ── RTK Query ─────────────────────────────────────────────────────────────
  const { data, isLoading, isError, refetch } = useGetAllCategoriesQuery({
    page,
    limit,
    searchTerm: debouncedSearchTerm,
  });
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();

  // ── Modal / form state ────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(
    null,
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState("#f0f9ff");
  const [textColor, setTextColor] = useState("#0369a1");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Delete confirmation ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) router.push("/auth");
    else if (user?.role !== "admin") router.push("/");
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  // ── Derived ───────────────────────────────────────────────────────────────
  const categories: ApiCategory[] = data?.data ?? [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages || meta?.totalPage || 1;

  // ── Handlers ─────────────────────────────────────────────────────────────
  function openCreate() {
    setModalMode("create");
    setEditingCategory(null);
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setBgColor("#f0f9ff");
    setTextColor("#0369a1");
    setIsModalOpen(true);
  }

  function openEdit(cat: ApiCategory) {
    setModalMode("edit");
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setImageFile(null);
    setImagePreview(cat.image ? getImageUrl(cat.image) : null);
    setBgColor(cat.bgColor || "#f0f9ff");
    setTextColor(cat.textColor || "#0369a1");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (imageFile) formData.append("image", imageFile);
    formData.append("bgColor", bgColor);
    formData.append("textColor", textColor);

    try {
      if (modalMode === "create") {
        await createCategory(formData).unwrap();
        toast.success("Category created successfully");
      } else if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          data: formData,
        }).unwrap();
        toast.success("Category updated successfully");
      }
      closeModal();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Something went wrong");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget._id).unwrap();
      toast.success("Category deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Failed to delete category");
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
            <h3 className="text-3xl font-bold text-gray-900">
              {meta?.total ?? "—"}
            </h3>
            <p className="text-gray-500 font-medium mt-1">Total Categories</p>
          </div>
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[#2E6F65]">
            <Layers className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-gray-900">{totalPages}</h3>
            <p className="text-gray-500 font-medium mt-1">Total Pages</p>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className={`${buttonbg} rounded-t-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <h2 className="text-white text-xl font-bold">Categories</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden -mt-4 relative z-10 min-h-[400px] flex flex-col justify-between">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <Loader className="w-8 h-8 animate-spin text-[#2E6F65]" />
            <p className="text-sm">Loading categories…</p>
          </div>
        ) : isError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20 text-red-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">Failed to load categories</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
            <Layers className="w-10 h-10" />
            <p className="text-sm">No categories found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="border-b border-[#2E6F65] hover:bg-transparent">
                    <TableHead
                      className={`font-semibold text-base py-5 ${textPrimary} pl-6`}
                    >
                      #
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-base py-5 ${textPrimary}`}
                    >
                      Image
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-base py-5 ${textPrimary}`}
                    >
                      Category Name
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-base py-5 ${textPrimary}`}
                    >
                      Description
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-base py-5 ${textPrimary}`}
                    >
                      Created
                    </TableHead>
                    <TableHead
                      className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}
                    >
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat, i) => (
                    <TableRow
                      key={cat._id}
                      className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <TableCell className="font-medium text-gray-500 py-4 pl-6">
                        {(page - 1) * limit + i + 1}
                      </TableCell>
                      <TableCell className="py-4">
                        {cat.image ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                            <Image
                              src={getImageUrl(cat.image)}
                              alt={cat.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-900 font-semibold py-4">
                        {cat.name}
                      </TableCell>
                      <TableCell className="text-gray-500 py-4 max-w-[200px] truncate">
                        {cat.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-gray-500 py-4 text-sm">
                        {formatDate(cat.createdAt)}
                      </TableCell>
                      <TableCell className="py-4 pr-6">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(cat)}
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
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-40"
                          : "text-gray-500 hover:text-[#2E6F65]"
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (pg) => (
                      <PaginationItem key={pg}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pg);
                          }}
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
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-40"
                          : "text-gray-500 hover:text-[#2E6F65]"
                      }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div
              className={`${buttonbg} rounded-t-2xl px-6 py-4 flex items-center justify-between`}
            >
              <h2 className="text-white text-lg font-bold">
                {modalMode === "create" ? "Add New Category" : "Edit Category"}
              </h2>
              <button
                onClick={closeModal}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label>Category Image</Label>
                <div
                  className="relative w-full h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#2E6F65] transition-colors cursor-pointer overflow-hidden bg-gray-50 flex items-center justify-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <p className="text-white text-sm font-semibold">
                          Change Image
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <ImageIcon className="w-8 h-8" />
                      <p className="text-sm">Click to upload image</p>
                      <p className="text-xs">PNG, JPG, WEBP</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="cat-name">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cat-name"
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={modalMode === "edit"}
                />
                {modalMode === "edit" && (
                  <p className="text-xs text-amber-600 font-medium">
                    Category name cannot be changed to ensure consistency across
                    the application.
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="cat-desc">Description</Label>
                <Textarea
                  id="cat-desc"
                  placeholder="Enter category description"
                  className="min-h-[90px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bg-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-11 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 font-mono uppercase text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-11 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 font-mono uppercase text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Badge Preview</Label>
                <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-center bg-gray-50/50">
                  <div
                    className="px-4 py-1.5 rounded-full font-semibold text-sm shadow-sm transition-colors"
                    style={{ backgroundColor: bgColor, color: textColor }}
                  >
                    {name || "Category Name"}
                  </div>
                </div>
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
                ) : modalMode === "create" ? (
                  "Create Category"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
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
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
