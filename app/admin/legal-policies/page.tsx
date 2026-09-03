"use client";

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Save,
  Trash2,
  Edit3,
  Globe,
  Upload,
  ArrowLeft,
  Eye,
  EyeOff,
  Link as LinkIcon,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { buttonbg } from "@/contexts/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/loader";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import JoditComponent from "../components/JoditComponent";
import {
  useGetAllLegalDocsQuery,
  useCreateLegalPolicyMutation,
  useUpdateLegalPolicyMutation,
  useDeleteLegalPolicyMutation,
  useTogglePublishPolicyMutation,
} from "@/store/api/termsApi";
import { getImageUrl } from "@/store/config/envConfig";

interface ExternalLinkItem {
  title: string;
  url: string;
}

interface LegalDocItem {
  _id: string;
  title: string;
  content: string;
  subtitle?: string;
  description: string;
  image?: string;
  icon?: string;
  webUrl?: string;
  externalLinks?: ExternalLinkItem[];
  order?: number;
  isPublished?: boolean;
  updatedAt?: string;
}

export default function LegalPoliciesPage() {
  const router = useRouter();

  // RTK Query hooks
  const { data: apiData, isLoading: isFetching, refetch } = useGetAllLegalDocsQuery({
    includeUnpublished: true,
  });
  const [createPolicy, { isLoading: isCreating }] = useCreateLegalPolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdateLegalPolicyMutation();
  const [deletePolicy, { isLoading: isDeleting }] = useDeleteLegalPolicyMutation();
  const [togglePublish] = useTogglePublishPolicyMutation();

  const documents: LegalDocItem[] = apiData?.data || [];

  // View state: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [contentSlug, setContentSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bodyContent, setBodyContent] = useState("");
  const [order, setOrder] = useState<number>(0);
  const [isPublished, setIsPublished] = useState<boolean>(true);
  const [externalLinks, setExternalLinks] = useState<ExternalLinkItem[]>([]);

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteTitle, setDeleteTitle] = useState<string>("");

  // Switch to Create Mode
  const handleOpenCreate = () => {
    setEditingDocId(null);
    setTitle("");
    setContentSlug("");
    setSubtitle("");
    setBodyContent("");
    setOrder(documents.length + 1);
    setIsPublished(true);
    setExternalLinks([]);
    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
    setViewMode("editor");
  };

  // Switch to Edit Mode
  const handleOpenEdit = (doc: LegalDocItem) => {
    setEditingDocId(doc._id);
    setTitle(doc.title || "");
    setContentSlug(doc.content || "");
    setSubtitle(doc.subtitle || "");
    setBodyContent(doc.description || "");
    setOrder(doc.order ?? 0);
    setIsPublished(doc.isPublished !== false);
    setExternalLinks(doc.externalLinks && Array.isArray(doc.externalLinks) ? [...doc.externalLinks] : []);
    setImageFile(null);
    setImagePreview("");
    setExistingImage(doc.image || "");
    setViewMode("editor");
  };

  // Auto-generate slug when typing title (in create mode)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingDocId) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      setContentSlug(generated);
    }
  };

  // Image Selection Handler
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setExistingImage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // External Links Handlers
  const handleAddExternalLink = () => {
    setExternalLinks([...externalLinks, { title: "", url: "" }]);
  };

  const handleUpdateExternalLink = (index: number, field: "title" | "url", value: string) => {
    const updated = [...externalLinks];
    updated[index][field] = value;
    setExternalLinks(updated);
  };

  const handleRemoveExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  // Toggle Publish Status
  const handleTogglePublish = async (id: string, currentStatus?: boolean) => {
    try {
      await togglePublish(id).unwrap();
      toast.success(currentStatus ? "Document unpublished (Draft)" : "Document published to Mobile App!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to toggle status");
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePolicy(deleteId).unwrap();
      toast.success("Document deleted successfully");
      setDeleteId(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete document");
    }
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!bodyContent.trim()) {
      toast.error("Document content cannot be empty");
      return;
    }

    // Filter valid external links
    const validLinks = externalLinks.filter((l) => l.url.trim().length > 0);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", contentSlug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, "_"));
    formData.append("subtitle", subtitle.trim());
    formData.append("description", bodyContent);
    formData.append("order", String(order));
    formData.append("isPublished", String(isPublished));
    formData.append("externalLinks", JSON.stringify(validLinks));

    if (imageFile) {
      formData.append("image", imageFile);
    } else if (existingImage) {
      formData.append("image", existingImage);
    } else {
      formData.append("image", "");
    }

    try {
      if (editingDocId) {
        await updatePolicy({ id: editingDocId, data: formData }).unwrap();
        toast.success("Legal document updated successfully!");
      } else {
        await createPolicy(formData).unwrap();
        toast.success("Legal document created and published successfully!");
      }
      refetch();
      setViewMode("list");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to save document. Please try again.");
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
        <Loader />
        <p className="text-gray-500 font-medium text-sm">Loading legal documents...</p>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // LIST VIEW
  // ────────────────────────────────────────────────────────────
  if (viewMode === "list") {
    const publishedCount = documents.filter((d) => d.isPublished !== false).length;
    const draftCount = documents.length - publishedCount;

    return (
      <div className="w-full mx-auto space-y-6">
        {/* Header Banner */}
        <div className={`${buttonbg} px-6 py-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-6 h-6 text-white/90" />
              <h1 className="text-white text-2xl font-bold">Legal &amp; Compliance Documents</h1>
            </div>
            <p className="text-white/80 text-sm max-w-2xl">
              Dynamically add, edit, reorder, and publish policies for the Caribee Mobile App. Changes reflect immediately with title, image, rich HTML body, and external links.
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-white text-[#2E6F65] hover:bg-white/90 font-semibold px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add New Document
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2E6F65]/10 flex items-center justify-center text-[#2E6F65]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Documents</p>
              <p className="text-xl font-bold text-gray-800">{documents.length}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Published in App</p>
              <p className="text-xl font-bold text-emerald-600">{publishedCount}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Draft / Unpublished</p>
              <p className="text-xl font-bold text-amber-600">{draftCount}</p>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-800">All Registered Policies</h2>
            <span className="text-xs text-gray-500">Live synchronization enabled with Mobile API</span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-700">No Legal Documents Found</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                Get started by creating your first policy document. It will appear live in the Caribee App.
              </p>
              <Button onClick={handleOpenCreate} className={buttonbg}>
                <Plus className="w-4 h-4 mr-1.5" />
                Create First Document
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/70">
                    <TableHead className="w-14 text-center font-semibold text-gray-600">Order</TableHead>
                    <TableHead className="font-semibold text-gray-600">Document / Identifier</TableHead>
                    <TableHead className="font-semibold text-gray-600 hidden md:table-cell">Subtitle / Summary</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-center">External Links</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-center">Live Status</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc, index) => {
                    const displayImage = doc.image ? getImageUrl(doc.image) : "";
                    const isPub = doc.isPublished !== false;
                    const linksCount = doc.externalLinks?.length || 0;

                    return (
                      <TableRow key={doc._id || index} className="hover:bg-gray-50/60 transition-colors">
                        {/* Order Badge */}
                        <TableCell className="text-center font-semibold text-gray-600">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs text-gray-700 font-bold">
                            {doc.order ?? index + 1}
                          </span>
                        </TableCell>

                        {/* Title & Cover Image */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                              {displayImage ? (
                                <img
                                  src={displayImage}
                                  alt={doc.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm leading-tight">{doc.title}</p>
                              <code className="text-[11px] text-[#2E6F65] bg-[#2E6F65]/10 px-1.5 py-0.5 rounded mt-1 inline-block">
                                slug: {doc.content}
                              </code>
                            </div>
                          </div>
                        </TableCell>

                        {/* Subtitle */}
                        <TableCell className="hidden md:table-cell text-sm text-gray-500 max-w-xs truncate">
                          {doc.subtitle || "—"}
                        </TableCell>

                        {/* External Links */}
                        <TableCell className="text-center">
                          {linksCount > 0 ? (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 gap-1">
                              <Globe className="w-3 h-3" />
                              {linksCount} {linksCount === 1 ? "Link" : "Links"}
                            </Badge>
                          ) : (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </TableCell>

                        {/* Live Status Switch */}
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-2">
                            <Switch
                              checked={isPub}
                              onCheckedChange={() => handleTogglePublish(doc._id, isPub)}
                            />
                            <span className={`text-xs font-medium ${isPub ? "text-emerald-600" : "text-gray-400"}`}>
                              {isPub ? "Published" : "Draft"}
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(doc)}
                              className="p-1.5 text-gray-600 hover:text-[#2E6F65] hover:bg-[#2E6F65]/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit Document"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteId(doc._id);
                                setDeleteTitle(doc.title);
                              }}
                              className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &quot;{deleteTitle}&quot;?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this legal document? This action cannot be undone and will immediately remove the document from the Caribee Mobile App.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                {isDeleting ? "Deleting..." : "Delete Permanently"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────
  // EDITOR VIEW (Add / Edit Policy)
  // ────────────────────────────────────────────────────────────
  const isSaving = isCreating || isUpdating;

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      {/* Action Header */}
      <div className={`${buttonbg} px-6 py-4 rounded-xl shadow-md flex items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("list")}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-xl font-bold">
              {editingDocId ? `Edit Document: ${title || "Policy"}` : "Create New Legal Document"}
            </h1>
            <p className="text-white/80 text-xs">
              Fill in the details, cover image, external links, and rich HTML text editor below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setViewMode("list")}
            variant="outline"
            className="bg-white/10 text-white border-white/30 hover:bg-white/20 cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-white text-[#2E6F65] hover:bg-white/90 font-semibold cursor-pointer shadow-sm text-xs"
          >
            {isSaving ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                Save &amp; Publish
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column: Title, Subtitle, & Rich HTML Text Editor (2 cols) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2E6F65]" />
              Document Header &amp; Identification
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-gray-700 font-medium">
                Document Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Terms of Use, Community Guidelines, Cookie Policy..."
                className="h-11"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="contentSlug" className="text-gray-700 font-medium">
                  Content Slug / Key <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contentSlug"
                  value={contentSlug}
                  onChange={(e) => setContentSlug(e.target.value)}
                  placeholder="e.g. termsAndCondition, privacyPolicy"
                  className="h-10 font-mono text-xs"
                />
                <span className="text-[11px] text-gray-400">Used as API identifier by the mobile app.</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subtitle" className="text-gray-700 font-medium">
                  Subtitle / Card Tagline
                </Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Short 1-line description shown in app card"
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Body Content: Jodit HTML Text Editor */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold text-gray-800 block">
                  Body Content (Rich HTML Text Editor) <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-400">
                  Format headings, bullet lists, bold text, links, and paragraphs.
                </p>
              </div>
              <Badge variant="outline" className="text-[#2E6F65] border-[#2E6F65]/30">
                HTML Editor
              </Badge>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden min-h-[500px]">
              <JoditComponent
                content={bodyContent}
                setContent={setBodyContent}
              />
            </div>
          </div>
        </div>

        {/* ── Right Column: Cover Image, Settings & External Links (1 col) ── */}
        <div className="space-y-6">
          {/* Status & Display Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Publishing Options</h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-800">Publish in Mobile App</p>
                <p className="text-xs text-gray-500">Visible immediately to users</p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order" className="text-gray-700 font-medium text-xs">
                Display Sequence Order
              </Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-gray-400">Smaller numbers display first in the app list.</p>
            </div>
          </div>

          {/* Cover / Header Image Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-800">
                Document Cover Image
              </Label>
              {(imagePreview || existingImage) && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">
              Upload a banner/cover image displayed at the top of the policy screen.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {imagePreview || existingImage ? (
              <div className="relative w-full h-44 rounded-xl border border-gray-200 overflow-hidden group">
                <img
                  src={imagePreview || getImageUrl(existingImage)}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold gap-1.5"
                >
                  <Upload className="w-4 h-4" /> Change Image
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#2E6F65] hover:bg-[#2E6F65]/5 transition-colors cursor-pointer text-gray-500 p-4"
              >
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700">Click to upload document banner</p>
                  <p className="text-[11px] text-gray-400">PNG, JPG or WebP up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* External Links Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold text-gray-800">
                  Official External Links
                </Label>
                <p className="text-xs text-gray-400">Add related links (e.g. portal, regulation page)</p>
              </div>
              <Button
                type="button"
                onClick={handleAddExternalLink}
                size="sm"
                variant="outline"
                className="text-xs border-[#2E6F65] text-[#2E6F65] hover:bg-[#2E6F65]/10 cursor-pointer h-7"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Link
              </Button>
            </div>

            {externalLinks.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-gray-200 rounded-xl p-3">
                <LinkIcon className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                <p className="text-xs text-gray-500 font-medium">No external links added</p>
                <p className="text-[11px] text-gray-400">Optional: links open directly in user&apos;s browser.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {externalLinks.map((link, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExternalLink(idx)}
                      className="absolute top-2.5 right-2.5 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Remove link"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <Label className="text-[11px] text-gray-500">Link Label</Label>
                      <Input
                        value={link.title}
                        onChange={(e) => handleUpdateExternalLink(idx, "title", e.target.value)}
                        placeholder="e.g. Official Portal"
                        className="h-8 text-xs bg-white mt-0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px] text-gray-500">Destination URL</Label>
                      <Input
                        value={link.url}
                        onChange={(e) => handleUpdateExternalLink(idx, "url", e.target.value)}
                        placeholder="https://caribee.app/..."
                        className="h-8 text-xs bg-white mt-0.5 font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Submit Action */}
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className={`${buttonbg} w-full py-3 rounded-xl font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer`}
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving Document...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {editingDocId ? "Update Document" : "Publish Document"}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
