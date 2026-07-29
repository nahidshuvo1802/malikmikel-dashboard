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
  DollarSign,
  ImageIcon,
  X,
  AlertCircle,
  RefreshCw,
  Plus,
  Calendar,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary } from "@/contexts/theme";
import {
  useGetAllOffersQuery,
  useCreateOfferMutation,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
} from "@/store/api/offerApi";
import { useGetAllCategoriesQuery } from "@/store/api/categoryApi";
import { getImageUrl } from "@/store/config/envConfig";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { useDebounce } from "@/store/hooks";

// Types
type ApiOffer = {
  _id: string;
  cetagory?: {
    _id: string;
    name: string;
  };
  offerCetagory?: "Hotel" | "Transport" | "Others";
  title: string;
  description: string;
  discount: number;
  promocode?: string;
  serviceLink?: string;
  startTime?: string;
  endTime?: string;
  image: string | null;
  status: "active" | "inactive";
  createdAt: string;
  Refinements?: {
    title: string;
    images: string[];
  }[];
};

type ModalMode = "create" | "edit";

type RefinementState = {
  title: string;
  imageFiles: File[];
  existingImages: string[];
};

export default function OffersPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // RTK Query
  const {
    data: offersResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAllOffersQuery({
    searchTerm: debouncedSearchTerm,
  });
  const { data: categoriesResponse } = useGetAllCategoriesQuery({ limit: 100 });
  const categories = categoriesResponse?.data || [];
  const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
  const [updateOffer, { isLoading: isUpdating }] = useUpdateOfferMutation();
  const [deleteOffer, { isLoading: isDeleting }] = useDeleteOfferMutation();

  const offers: ApiOffer[] = offersResponse?.data || [];

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>("create");
  const [editingOffer, setEditingOffer] = useState<ApiOffer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiOffer | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    cetagory: "",
    offerCetagory: "Others",
    title: "",
    description: "",
    discount: 0,
    promocode: "",
    serviceLink: "",
    startTime: "",
    endTime: "",
    status: "active" as "active" | "inactive",
    imageFile: null as File | null,
    imagePreview: null as string | null,
  });

  const [refinements, setRefinements] = useState<RefinementState[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth");
    else if (user?.role !== "admin") router.push("/");
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  const handleOpenCreate = () => {
    setModalMode("create");
    setEditingOffer(null);
    setFormData({
      cetagory: "",
      offerCetagory: "Others",
      title: "",
      description: "",
      discount: 0,
      promocode: "",
      serviceLink: "",
      startTime: "",
      endTime: "",
      status: "active",
      imageFile: null,
      imagePreview: null,
    });
    setRefinements([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: ApiOffer) => {
    setModalMode("edit");
    setEditingOffer(offer);
    setFormData({
      cetagory: offer.cetagory?._id || "",
      offerCetagory: offer.offerCetagory || "Others",
      title: offer.title,
      description: offer.description,
      discount: offer.discount,
      promocode: offer.promocode || "",
      serviceLink: offer.serviceLink || "",
      startTime: offer.startTime
        ? new Date(offer.startTime).toISOString().slice(0, 16)
        : "",
      endTime: offer.endTime
        ? new Date(offer.endTime).toISOString().slice(0, 16)
        : "",
      status: offer.status,
      imageFile: null,
      imagePreview: offer.image ? getImageUrl(offer.image) : null,
    });
    setRefinements(offer.Refinements?.map(r => ({
      title: r.title || "",
      imageFiles: [],
      existingImages: r.images || []
    })) || []);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    if (formData.cetagory) submitData.append("cetagory", formData.cetagory);
    if (formData.offerCetagory) submitData.append("offerCetagory", formData.offerCetagory);
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("discount", formData.discount.toString());
    if (formData.promocode) submitData.append("promocode", formData.promocode);
    if (formData.serviceLink)
      submitData.append("serviceLink", formData.serviceLink);
    if (formData.startTime) {
      submitData.append("startTime", new Date(formData.startTime).toISOString());
    }
    if (formData.endTime) {
      submitData.append("endTime", new Date(formData.endTime).toISOString());
    }
    submitData.append("status", formData.status);

    if (formData.imageFile) {
      submitData.append("image", formData.imageFile);
    }

    const refinementsData = refinements.map(r => ({
      title: r.title,
      images: r.existingImages
    }));
    submitData.append("Refinements", JSON.stringify(refinementsData));

    refinements.forEach((ref, index) => {
      ref.imageFiles.forEach(file => {
        submitData.append(`refinement_image_${index}`, file);
      });
    });

    try {
      if (modalMode === "create") {
        await createOffer(submitData).unwrap();
        toast.success("Offer created successfully");
      } else if (editingOffer) {
        await updateOffer({ id: editingOffer._id, data: submitData }).unwrap();
        toast.success("Offer updated successfully");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteOffer(deleteTarget._id).unwrap();
      toast.success("Offer deleted successfully");
      setDeleteTarget(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete offer");
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div
        className={`${buttonbg} rounded-t-xl p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <DollarSign className="text-white w-6 h-6" />
            </div>
            <h2 className="text-white text-xl font-bold">Offer Management</h2>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-2 pl-10 pr-4 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
            />
          </div>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-white text-[#2E6F65] hover:bg-white/90 font-bold gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Offer
        </Button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden relative z-10 min-h-[500px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader className="w-10 h-10 animate-spin text-[#2E6F65]" />
            <p className="mt-4 font-medium">Loading offers...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <AlertCircle className="w-12 h-12" />
            <p className="mt-4 font-medium">Failed to load offers</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-4 gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </Button>
          </div>
        ) : offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <DollarSign className="w-16 h-16 opacity-20" />
            <p className="mt-4 text-xl font-medium">No offers found</p>
            <p className="text-sm">Create your first offer to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-bold py-5 pl-8">#</TableHead>
                  <TableHead className="font-bold py-5">Image</TableHead>
                  <TableHead className="font-bold py-5">Title</TableHead>
                  <TableHead className="font-bold py-5">Type</TableHead>
                  <TableHead className="font-bold py-5">Discount</TableHead>
                  <TableHead className="font-bold py-5">Validity</TableHead>
                  <TableHead className="font-bold py-5">Status</TableHead>
                  <TableHead className="font-bold py-5 text-right pr-8">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer, i) => (
                  <TableRow
                    key={offer._id}
                    className="hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0 group"
                  >
                    <TableCell className="font-medium text-gray-400 pl-8">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100">
                        {offer.image ? (
                          <Image
                            src={getImageUrl(offer.image)}
                            alt={offer.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-900">
                      {offer.title}
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                        {offer.offerCetagory || "Others"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-3 py-1 rounded-full bg-green-50 text-[#2E6F65] font-bold text-xs border border-green-100">
                        {offer.discount}% OFF
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-gray-500">
                        {offer.startTime && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{" "}
                            {new Date(offer.startTime).toLocaleDateString()}
                          </span>
                        )}
                        {offer.endTime && (
                          <span className="flex items-center gap-1 font-bold text-gray-400">
                            to {new Date(offer.endTime).toLocaleDateString()}
                          </span>
                        )}
                        {!offer.startTime && !offer.endTime && (
                          <span className="text-gray-400 italic">No Validity Set</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          offer.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenEdit(offer)}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#2E6F65] hover:bg-green-50 transition-all"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(offer)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
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
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200 my-auto">
            <div
              className={`${buttonbg} rounded-t-2xl px-6 py-4 flex items-center justify-between`}
            >
              <h2 className="text-white text-lg font-bold">
                {modalMode === "create" ? "Add New Offer" : "Edit Offer"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Category</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F65]"
                    value={formData.cetagory}
                    onChange={(e) =>
                      setFormData({ ...formData, cetagory: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Offer Type</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F65]"
                    value={formData.offerCetagory}
                    onChange={(e) =>
                      setFormData({ ...formData, offerCetagory: e.target.value })
                    }
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Transport">Transport</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Offer Title</Label>
                  <Input
                    placeholder="Enter offer title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Discount Percentage (%)</Label>
                  <Input
                    type="number"
                    placeholder="Enter discount percentage"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: e.target.value === "" ? 0 : parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label>Promo Code</Label>
                  <Input
                    placeholder="Enter promo code"
                    value={formData.promocode}
                    onChange={(e) =>
                      setFormData({ ...formData, promocode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Service Link</Label>
                  <Input
                    placeholder="Enter service link URL"
                    value={formData.serviceLink}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceLink: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter offer description"
                    className="min-h-[80px]"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
              
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
              
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6F65]"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as "active" | "inactive",
                      })
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Offer Image</Label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-40 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#2E6F65] transition-all cursor-pointer overflow-hidden flex items-center justify-center bg-gray-50"
                >
                  {formData.imagePreview ? (
                    <Image
                      src={formData.imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <p className="text-sm font-medium">
                        Click to upload banner
                      </p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Refinements Section */}
              <div className="space-y-4 col-span-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-bold text-gray-700">Refinements</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRefinements([...refinements, { title: "", imageFiles: [], existingImages: [] }])}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Refinement
                  </Button>
                </div>
                
                {refinements.map((ref, idx) => (
                  <div key={idx} className="p-4 border rounded-xl bg-gray-50 space-y-4 relative group">
                    <button
                      type="button"
                      onClick={() => setRefinements(refinements.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        placeholder="Refinement Title"
                        value={ref.title}
                        onChange={(e) => {
                          const newRefs = [...refinements];
                          newRefs[idx].title = e.target.value;
                          setRefinements(newRefs);
                        }}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Images</Label>
                      <div className="flex flex-wrap gap-2">
                        {ref.existingImages.map((img, imgIdx) => (
                          <div key={`existing-${imgIdx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                            <Image src={getImageUrl(img)} alt="Refinement" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const newRefs = [...refinements];
                                newRefs[idx].existingImages = newRefs[idx].existingImages.filter((_, i) => i !== imgIdx);
                                setRefinements(newRefs);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {ref.imageFiles.map((file, fileIdx) => (
                          <div key={`new-${fileIdx}`} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                            <Image src={URL.createObjectURL(file)} alt="New Refinement" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const newRefs = [...refinements];
                                newRefs[idx].imageFiles = newRefs[idx].imageFiles.filter((_, i) => i !== fileIdx);
                                setRefinements(newRefs);
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#2E6F65] hover:bg-white transition-colors">
                          <Plus className="w-6 h-6 text-gray-400" />
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                const newRefs = [...refinements];
                                newRefs[idx].imageFiles = [...newRefs[idx].imageFiles, ...Array.from(e.target.files)];
                                setRefinements(newRefs);
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-12 rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className={`flex-1 h-12 rounded-xl font-bold ${buttonbg}`}
                >
                  {isCreating || isUpdating ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" /> Processing...
                    </div>
                  ) : modalMode === "create" ? (
                    "Create Offer"
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-white rounded-2xl border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Delete Offer?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold text-gray-900">
                {deleteTarget?.title}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="h-12 rounded-xl font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-12 rounded-xl bg-red-500 hover:bg-red-600 font-bold text-white shadow-lg shadow-red-500/20"
            >
              {isDeleting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Yes, Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
