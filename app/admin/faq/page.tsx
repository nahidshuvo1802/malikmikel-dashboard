"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg, textPrimary } from "@/contexts/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Plus,
  Trash2,
  Edit,
  X,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";

import {
  useGetAllFaqQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from "@/store/api/faqApi";

import React, { Suspense } from "react";

type View = "faq";

const navTabs: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "faq", label: "FAQ", icon: <HelpCircle className="w-4 h-4" /> },
];

function FaqContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [view, setView] = useState<View>("faq");

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth");
    else if (user?.role !== "admin") router.push("/");
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent p-6 space-y-6">
      {/* Header */}
      <div className={`${buttonbg} rounded-xl p-6 shadow-lg`}>
        <h1 className="text-2xl font-bold text-white mb-4">FAQ Management</h1>
        <div className="flex flex-wrap gap-2">
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                view === tab.id
                  ? "bg-white text-[#2E6F65] shadow-md scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {view === "faq" && <FaqSection />}
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader /></div>}>
      <FaqContent />
    </Suspense>
  );
}

/* ─────────────────────────────────────────── FAQ SECTION ───────────────────────────────────── */

function FaqSection() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<any>(null);

  const { data, isLoading, refetch } = useGetAllFaqQuery({ page, limit: 10 });
  const [deleteFaq] = useDeleteFaqMutation();

  const faqs: any[] = data?.data?.faqs || [];
  const meta = data?.data?.meta || { totalPages: 1, total: 0 };

  const handleDelete = async (id: string) => {
    try {
      await deleteFaq(id).unwrap();
      toast.success("FAQ deleted");
      setIsDeleteModalOpen(false);
      refetch();
    } catch {
      toast.error("Failed to delete FAQ");
    }
  };

  return (
    <>
      {/* Sub-header */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className={`w-5 h-5 ${textPrimary}`} />
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">{meta.total || 0} total FAQs</p>
        </div>
        <Button
          onClick={() => { setEditItem(null); setIsModalOpen(true); }}
          className={`${buttonbg} gap-2 font-semibold`}
        >
          <Plus className="w-4 h-4" /> Add FAQ
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#2E6F65]/20 hover:bg-transparent">
              <TableHead className={`font-bold py-4 pl-6 ${textPrimary}`}>Order</TableHead>
              <TableHead className={`font-bold py-4 ${textPrimary}`}>Question</TableHead>
              <TableHead className={`font-bold py-4 ${textPrimary}`}>Answer</TableHead>
              <TableHead className={`font-bold py-4 ${textPrimary}`}>Status</TableHead>
              <TableHead className={`font-bold py-4 pr-6 text-right ${textPrimary}`}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-20 text-center"><Loader /></TableCell>
              </TableRow>
            ) : faqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-20 text-center text-gray-400">
                  <HelpCircle className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  No FAQs yet. Click "Add FAQ" to create one.
                </TableCell>
              </TableRow>
            ) : faqs.map((faq: any, i: number) => (
              <TableRow key={faq._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0 group">
                <TableCell className="pl-6 font-medium text-gray-500 py-4">
                  {faq.order ?? 0}
                </TableCell>
                <TableCell className="py-4 font-semibold text-gray-800 max-w-[280px]">
                  {faq.question}
                </TableCell>
                <TableCell className="py-4 text-gray-500 max-w-[380px] truncate">
                  {faq.answer}
                </TableCell>
                <TableCell className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${faq.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {faq.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="py-4 pr-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditItem(faq); setIsModalOpen(true); }}
                      className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setFaqToDelete(faq);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <Pagination>
          <PaginationContent className="gap-2">
            <PaginationItem>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-gray-500 hover:text-[#2E6F65] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <PaginationPrevious className="p-0 h-auto hover:bg-transparent" />
              </button>
            </PaginationItem>
            {Array.from({ length: meta.totalPages || 1 }, (_, i) => i + 1).map((p) => (
              <PaginationItem key={p}>
                <button
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg font-bold transition-all ${
                    page === p ? "bg-[#2E6F65] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </button>
              </PaginationItem>
            ))}
            <PaginationItem>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages || 1, p + 1))}
                disabled={page === meta.totalPages || !meta.totalPages}
                className="px-3 py-2 text-gray-500 hover:text-[#2E6F65] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <PaginationNext className="p-0 h-auto hover:bg-transparent" />
              </button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <FaqModal
          item={editItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); refetch(); }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDelete(faqToDelete?._id)}
        itemName={faqToDelete?.question}
        itemType="FAQ"
      />
    </>
  );
}

/* FAQ Add/Edit Modal */
function FaqModal({ item, onClose, onSuccess }: { item: any; onClose: () => void; onSuccess: () => void }) {
  const [question, setQuestion] = useState(item?.question || "");
  const [answer, setAnswer] = useState(item?.answer || "");
  const [order, setOrder] = useState(item?.order ?? 0);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [isLoading, setIsLoading] = useState(false);

  const [createFaq] = useCreateFaqMutation();
  const [updateFaq] = useUpdateFaqMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) { toast.error("Both fields are required"); return; }
    setIsLoading(true);
    try {
      if (item) {
        await updateFaq({ _id: item._id, data: { question, answer, order: Number(order), isActive } }).unwrap();
        toast.success("FAQ updated successfully");
      } else {
        await createFaq({ question, answer, order: Number(order), isActive }).unwrap();
        toast.success("FAQ created successfully");
      }
      onSuccess();
    } catch {
      toast.error(item ? "Failed to update FAQ" : "Failed to create FAQ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#2E6F65]">{item ? "Edit FAQ" : "Add New FAQ"}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Question</Label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter FAQ question"
              className="h-12 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="font-bold text-gray-700">Answer</Label>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter FAQ answer"
              className="min-h-[140px] rounded-xl"
              required
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="space-y-2 flex-1">
              <Label className="font-bold text-gray-700">Display Order</Label>
              <Input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label className="font-bold text-gray-700 block mb-3">Status</Label>
              <div className="flex items-center space-x-2 h-10">
                <Switch
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span className="text-sm text-gray-600 font-medium">
                  {isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className={`flex-1 h-12 rounded-xl ${buttonbg} font-bold flex items-center justify-center gap-2`}>
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : item ? "Update FAQ" : "Create FAQ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, itemType }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; itemName?: string; itemType: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete {itemType.charAt(0).toUpperCase() + itemType.slice(1)}?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete <span className="font-bold text-gray-800">{itemName || `this ${itemType}`}</span>? This action cannot be undone.
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
