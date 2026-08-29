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
  X,
  GripVertical,
  Award,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary } from "@/contexts/theme";
import {
  useGetAllBadgesQuery,
  useDeleteBadgeMutation,
  useCreateBadgeMutation,
  useUpdateBadgeMutation,
} from "@/store/api/badgeApi";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { getImageUrl } from "@/store/config/envConfig";

export default function BadgesPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [badgeToDelete, setBadgeToDelete] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [badgeToEdit, setBadgeToEdit] = useState<any>(null);

  const {
    data: badgesResponse,
    isLoading,
    refetch,
  } = useGetAllBadgesQuery({ page: currentPage, limit: 10 });
  const [deleteBadge] = useDeleteBadgeMutation();
  const [createBadge] = useCreateBadgeMutation();
  const [updateBadge] = useUpdateBadgeMutation();

  const badges = badgesResponse?.badges || [];
  const meta = badgesResponse?.meta || { totalPages: 1, total: 0 };
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
      await deleteBadge(id).unwrap();
      toast.success("Badge deleted successfully");
      setIsDeleteModalOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to delete badge");
    }
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div
        className={`${buttonbg} rounded-t-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-8 h-8" />
            Badge Management
          </h1>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold w-full md:w-auto"
        >
          <Plus className="w-5 h-5 mr-1" /> Add New Badge
        </Button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden -mt-4 relative z-10 min-h-[500px] flex flex-col justify-between">
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
                  Icon
                </TableHead>
                <TableHead
                  className={`font-semibold text-base py-5 ${textPrimary}`}
                >
                  Title
                </TableHead>
                <TableHead
                  className={`font-semibold text-base py-5 ${textPrimary}`}
                >
                  Position
                </TableHead>
                <TableHead
                  className={`font-semibold text-base py-5 ${textPrimary} text-right pr-6`}
                >
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader />
                  </TableCell>
                </TableRow>
              ) : badges.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-20 text-gray-500"
                  >
                    No badges found
                  </TableCell>
                </TableRow>
              ) : (
                badges.map((badge: any, i: number) => (
                  <TableRow
                    key={badge._id || i}
                    className="hover:bg-gray-50 border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="font-medium text-gray-600 py-4 pl-6">
                      {((currentPage - 1) * 10 + i + 1)
                        .toString()
                        .padStart(2, "0")}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-100">
                        <Image
                          src={getImageUrl(badge.icon)}
                          alt={badge.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-900 font-bold py-4">
                      {badge.title}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 capitalize border border-gray-200">
                        {badge.position
                          ? badge.position.replace("_", " ")
                          : "top left"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 pr-6">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setBadgeToEdit(badge);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-500 hover:text-blue-600 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setBadgeToDelete(badge);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
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
        <div className="p-4 border-t border-gray-100">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:text-[#2E6F65] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaginationPrevious className="hover:bg-transparent p-0 h-auto" />
                </button>
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
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
                ),
              )}

              <PaginationItem>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
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

      {/* Add Badge Modal */}
      <AddBadgeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (formData) => {
          try {
            await createBadge(formData).unwrap();
            toast.success("Badge created successfully");
            setIsAddModalOpen(false);
            refetch();
          } catch (error) {
            toast.error("Failed to create badge");
          }
        }}
      />

      {/* Edit Badge Modal */}
      <EditBadgeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        badge={badgeToEdit}
        onSubmit={async (id, formData) => {
          try {
            await updateBadge({ id, formData }).unwrap();
            toast.success("Badge updated successfully");
            setIsEditModalOpen(false);
            refetch();
          } catch (error) {
            toast.error("Failed to update badge");
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(badgeToDelete?._id)}
        itemName={badgeToDelete?.title}
        itemType="badge"
      />
    </div>
  );
}

// Add Badge Modal Component
const AddBadgeModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(true);
  const [title, setTitle] = useState("");
  const [bgColor, setBgColor] = useState("#fffbeb");
  const [textColor, setTextColor] = useState("#b45309");
  const [position, setPosition] = useState("top_left");

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);

    await onSubmit(formData);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-[#2E6F65]">Create New Badge</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="font-bold text-gray-700">
                    Badge Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    placeholder="Enter badge title"
                    className="h-11 rounded-xl"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <Label htmlFor="position" className="font-bold text-gray-700">
                    Position
                  </Label>
                  <select
                    id="position"
                    name="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E6F65]/20 focus:border-[#2E6F65] cursor-pointer"
                  >
                    <option value="top_left">Top Left (Default)</option>
                    <option value="top_right">Top Right</option>
                    <option value="bottom_left">Bottom Left</option>
                    <option value="bottom_right">Bottom Right</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        name="bgColor"
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
                        name="textColor"
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
                <div className="space-y-2 pt-2">
                  <Label>Badge Preview</Label>
                  <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-center bg-gray-50/50">
                    <div
                      className="px-4 py-1.5 rounded-full font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="icon"
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                      {title || "Badge Title"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Enable Modal
                    </span>
                    <Switch
                      name="isModalEnabled"
                      defaultChecked
                      className="data-[state=checked]:bg-[#2E6F65]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Show Note
                    </span>
                    <Switch
                      checked={showNote}
                      onCheckedChange={setShowNote}
                      name="showNote"
                      className="data-[state=checked]:bg-[#2E6F65]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Badge Icon</Label>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group hover:border-[#2E6F65]/50 transition-colors cursor-pointer">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-gray-300 w-10 h-10 group-hover:text-[#2E6F65]/50 transition-colors" />
                    )}
                    <input
                      type="file"
                      name="icon"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="introDescription"
                className="font-bold text-gray-700"
              >
                Intro Description
              </Label>
              <Textarea
                id="introDescription"
                name="introDescription"
                required
                placeholder="Enter intro description"
                className="min-h-[100px] rounded-xl resize-none"
              />
            </div>

            {showNote && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <Label
                  htmlFor="footerReassuranceText"
                  className="font-bold text-gray-700"
                >
                  Footer Reassurance Text
                </Label>
                <Textarea
                  id="footerReassuranceText"
                  name="footerReassuranceText"
                  placeholder="Enter footer reassurance text"
                  className="min-h-[80px] rounded-xl resize-none"
                />
              </div>
            )}

            {/* <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">Badge Criteria</h3>
                    <Button 
                        type="button"
                        onClick={addCriteriaItem}
                        variant="outline" 
                        className="text-[#2E6F65] bg-green-50 border-green-100 hover:bg-green-100 gap-1 h-9 rounded-xl font-bold"
                    >
                        <Plus className="w-4 h-4" /> Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {criteria.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 animate-in slide-in-from-left-2 duration-200">
                            <GripVertical className="text-gray-300 w-5 h-5 shrink-0" />
                            <Input 
                                value={item.text} 
                                onChange={(e) => updateCriteriaText(index, e.target.value)}
                                placeholder="Enter criteria description" 
                                className="flex-1 h-11 rounded-xl"
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => removeCriteriaItem(index)}
                                className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-full transition-colors shrink-0"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                  </div>
              </div> */}
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`flex-1 h-12 rounded-xl font-bold ${buttonbg} shadow-lg shadow-[#2E6F65]/20`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-white" />
                  Creating...
                </div>
              ) : (
                "Create Badge"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  itemType: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}?
          </h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-800">
              {itemName || `this ${itemType}`}
            </span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="flex items-center gap-3 mt-8">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-xl h-12 font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-gray-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 rounded-xl h-12 font-bold bg-red-500 text-white hover:bg-red-600 shadow-md shadow-red-500/20 transition-all"
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

// Edit Badge Modal Component
const EditBadgeModal = ({
  isOpen,
  onClose,
  onSubmit,
  badge,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: FormData) => Promise<void>;
  badge: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showNote, setShowNote] = useState(true);
  const [title, setTitle] = useState("");
  const [bgColor, setBgColor] = useState("#fffbeb");
  const [textColor, setTextColor] = useState("#b45309");
  const [position, setPosition] = useState("top_left");
  const [introDescription, setIntroDescription] = useState("");
  const [footerReassuranceText, setFooterReassuranceText] = useState("");
  const [isModalEnabled, setIsModalEnabled] = useState(true);

  useEffect(() => {
    if (badge && isOpen) {
      setTitle(badge.title || "");
      setBgColor(badge.bgColor || "#fffbeb");
      setTextColor(badge.textColor || "#b45309");
      setPosition(badge.position || "top_left");
      setIntroDescription(badge.introDescription || "");
      setFooterReassuranceText(badge.footerReassuranceText || "");
      setShowNote(!!badge.showNote);
      setIsModalEnabled(badge.isModalEnabled ?? true);
      setPreview(badge.icon ? getImageUrl(badge.icon) : null);
    }
  }, [badge, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Append states for switches if they are missing
    if (!formData.has('isModalEnabled')) {
      formData.append('isModalEnabled', isModalEnabled ? 'on' : 'off');
    }
    if (!formData.has('showNote')) {
      formData.append('showNote', showNote ? 'on' : 'off');
    }

    await onSubmit(badge._id, formData);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-[#2E6F65]">Edit Badge</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-title" className="font-bold text-gray-700">
                    Badge Title
                  </Label>
                  <Input
                    id="edit-title"
                    name="title"
                    required
                    placeholder="Enter badge title"
                    className="h-11 rounded-xl"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <Label htmlFor="edit-position" className="font-bold text-gray-700">
                    Position
                  </Label>
                  <select
                    id="edit-position"
                    name="position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2E6F65]/20 focus:border-[#2E6F65] cursor-pointer"
                  >
                    <option value="top_left">Top Left (Default)</option>
                    <option value="top_right">Top Right</option>
                    <option value="bottom_left">Bottom Left</option>
                    <option value="bottom_right">Bottom Right</option>
                  </select>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bg-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-bg-color"
                        name="bgColor"
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
                    <Label htmlFor="edit-text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-text-color"
                        name="textColor"
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
                <div className="space-y-2 pt-2">
                  <Label>Badge Preview</Label>
                  <div className="p-4 rounded-xl border border-gray-100 flex items-center justify-center bg-gray-50/50">
                    <div
                      className="px-4 py-1.5 rounded-full font-semibold text-sm shadow-sm transition-colors flex items-center gap-2"
                      style={{ backgroundColor: bgColor, color: textColor }}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="icon"
                          className="w-4 h-4 object-contain"
                        />
                      ) : (
                        <Award className="w-4 h-4" />
                      )}
                      {title || "Badge Title"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Enable Modal
                    </span>
                    <Switch
                      name="isModalEnabled"
                      checked={isModalEnabled}
                      onCheckedChange={setIsModalEnabled}
                      className="data-[state=checked]:bg-[#2E6F65]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Show Note
                    </span>
                    <Switch
                      checked={showNote}
                      onCheckedChange={setShowNote}
                      name="showNote"
                      className="data-[state=checked]:bg-[#2E6F65]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-gray-700">Badge Icon</Label>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group hover:border-[#2E6F65]/50 transition-colors cursor-pointer">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <ImageIcon className="text-gray-300 w-10 h-10 group-hover:text-[#2E6F65]/50 transition-colors" />
                    )}
                    <input
                      type="file"
                      name="icon"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="edit-introDescription"
                className="font-bold text-gray-700"
              >
                Intro Description
              </Label>
              <Textarea
                id="edit-introDescription"
                name="introDescription"
                required
                placeholder="Enter intro description"
                className="min-h-[100px] rounded-xl resize-none"
                value={introDescription}
                onChange={(e) => setIntroDescription(e.target.value)}
              />
            </div>

            {showNote && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                <Label
                  htmlFor="edit-footerReassuranceText"
                  className="font-bold text-gray-700"
                >
                  Footer Reassurance Text
                </Label>
                <Textarea
                  id="edit-footerReassuranceText"
                  name="footerReassuranceText"
                  placeholder="Enter footer reassurance text"
                  className="min-h-[80px] rounded-xl resize-none"
                  value={footerReassuranceText}
                  onChange={(e) => setFooterReassuranceText(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl font-bold border-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className={`flex-1 h-12 rounded-xl font-bold ${buttonbg} shadow-lg shadow-[#2E6F65]/20`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader className="w-4 h-4 animate-spin text-white" />
                  Updating...
                </div>
              ) : (
                "Update Badge"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
