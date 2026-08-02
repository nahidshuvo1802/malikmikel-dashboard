"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { buttonbg } from "@/contexts/theme";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import {
  useGetEsimContentQuery,
  useUpdateEsimContentMutation,
  useGetEsimProvidersQuery,
  useAddEsimProviderMutation,
  useUpdateEsimProviderMutation,
  useDeleteEsimProviderMutation,
} from "@/store/api/esimApi";
import { getImageUrl } from "@/store/config/envConfig";
import { Plus, Edit, Trash2, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

export default function EsimManagementPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const { data: contentRes, isLoading: isContentLoading } = useGetEsimContentQuery({});
  const { data: providersRes, isLoading: isProvidersLoading } = useGetEsimProvidersQuery({});
  
  const [updateContent, { isLoading: isUpdatingContent }] = useUpdateEsimContentMutation();
  const [addProvider, { isLoading: isAdding }] = useAddEsimProviderMutation();
  const [updateProvider, { isLoading: isUpdatingProvider }] = useUpdateEsimProviderMutation();
  const [deleteProvider, { isLoading: isDeleting }] = useDeleteEsimProviderMutation();

  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<any>(null);
  
  const [providerName, setProviderName] = useState("");
  const [providerDescription, setProviderDescription] = useState("");
  const [providerLink, setProviderLink] = useState("");
  const [isSpecialOffer, setIsSpecialOffer] = useState(false);
  const [providerLogo, setProviderLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    } else if (user?.role !== "admin") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (contentRes?.data) {
      setHeading(contentRes.data.heading || "");
      setDescription(contentRes.data.description || "");
    }
  }, [contentRes]);

  const handleUpdateContent = async () => {
    try {
      await updateContent({ heading, description }).unwrap();
      toast.success("E-Sim Page Content updated successfully!");
    } catch (error) {
      toast.error("Failed to update content");
    }
  };

  const handleOpenModal = (provider: any = null) => {
    if (provider) {
      setEditingProvider(provider);
      setProviderName(provider.name);
      setProviderDescription(provider.description || "");
      setProviderLink(provider.link);
      setIsSpecialOffer(provider.isSpecialOffer || false);
      setLogoPreview(provider.logo ? getImageUrl(provider.logo) : "");
      setProviderLogo(null);
    } else {
      setEditingProvider(null);
      setProviderName("");
      setProviderDescription("");
      setProviderLink("");
      setIsSpecialOffer(false);
      setLogoPreview("");
      setProviderLogo(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProvider(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProviderLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProvider = async () => {
    if (!providerName || !providerLink) {
      toast.error("Name and link are required");
      return;
    }

    const formData = new FormData();
    formData.append("name", providerName);
    formData.append("description", providerDescription);
    formData.append("link", providerLink);
    formData.append("isSpecialOffer", String(isSpecialOffer));
    if (providerLogo) {
      formData.append("logo", providerLogo);
    }

    try {
      if (editingProvider) {
        await updateProvider({ id: editingProvider._id, formData }).unwrap();
        toast.success("Provider updated successfully!");
      } else {
        await addProvider(formData).unwrap();
        toast.success("Provider added successfully!");
      }
      handleCloseModal();
    } catch (error) {
      toast.error("Failed to save provider");
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (confirm("Are you sure you want to delete this provider?")) {
      try {
        await deleteProvider(id).unwrap();
        toast.success("Provider deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete provider");
      }
    }
  };

  if (!user || user.role !== "admin") return null;

  if (isContentLoading || isProvidersLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader />
      </div>
    );
  }

  const providers = providersRes?.data || [];

  return (
    <div className="min-h-screen bg-transparent space-y-6">
      
      {/* Header */}
      <div className={`${buttonbg} rounded-xl p-4 px-6 shadow-sm flex justify-between items-center`}>
        <h1 className="text-2xl font-bold text-white">E-Sim Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-white text-[#2E6F65] px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Provider
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Content Management Section */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Page Content</h2>
            <p className="text-sm text-gray-500 mb-6">Manage the heading and description displayed on the E-Sim user page.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                <input 
                  type="text" 
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#2E6F65]"
                  placeholder="e.g. E-Sim Providers"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#2E6F65] resize-none"
                  placeholder="e.g. Find the best E-Sim providers for your trip."
                ></textarea>
              </div>
              <button 
                onClick={handleUpdateContent}
                disabled={isUpdatingContent}
                className={`w-full ${buttonbg} text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex justify-center`}
              >
                {isUpdatingContent ? "Saving..." : "Save Content Changes"}
              </button>
            </div>
          </div>
        </div>

        {/* Providers List Section */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                 <h2 className="text-lg font-bold text-gray-800">E-Sim Providers</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm">
                      <th className="p-4 font-medium">Logo</th>
                      <th className="p-4 font-medium">Provider Name</th>
                      <th className="p-4 font-medium">Referral/Purchase Link</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {providers.length > 0 ? (
                      providers.map((provider: any) => (
                        <tr key={provider._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-4">
                            {provider.logo ? (
                              <div className="w-12 h-12 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                <Image 
                                  src={getImageUrl(provider.logo)} 
                                  alt={provider.name} 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-800 flex items-center gap-2">
                              {provider.name}
                              {provider.isSpecialOffer && (
                                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  🔥 Special Offer
                                </span>
                              )}
                            </div>
                            {provider.description && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate" title={provider.description}>
                                {provider.description}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <a href={provider.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm truncate block max-w-xs">
                              {provider.link}
                            </a>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            <button 
                              onClick={() => handleOpenModal(provider)}
                              className="p-2 text-gray-500 hover:text-[#2E6F65] bg-gray-100 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Provider"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteProvider(provider._id)}
                              disabled={isDeleting}
                              className="p-2 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Provider"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">
                          No E-Sim providers found. Click "Add Provider" to create one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </div>
        </div>

      </div>

      {/* Add/Edit Provider Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-800">
                {editingProvider ? "Edit Provider" : "Add New Provider"}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              
              {/* Logo Upload */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#2E6F65] hover:bg-green-50/50 transition-all overflow-hidden relative group"
                >
                  {logoPreview ? (
                    <>
                      <Image src={logoPreview} alt="Preview" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Edit className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-medium">Upload Logo</span>
                    </div>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#2E6F65]"
                  placeholder="e.g. Airalo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={providerDescription}
                  onChange={(e) => setProviderDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#2E6F65] resize-none"
                  placeholder="Short description of the provider"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral / Purchase Link <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={providerLink}
                  onChange={(e) => setProviderLink(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-[#2E6F65]"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-3">
                <div 
                  className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors ${isSpecialOffer ? 'bg-orange-500' : 'bg-gray-300'}`}
                  onClick={() => setIsSpecialOffer(!isSpecialOffer)}
                >
                  <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isSpecialOffer ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => setIsSpecialOffer(!isSpecialOffer)}>
                  🔥 Special Offer
                </label>
              </div>

            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50">
              <button 
                onClick={handleCloseModal}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProvider}
                disabled={isAdding || isUpdatingProvider}
                className={`flex-1 ${buttonbg} text-white py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex justify-center items-center`}
              >
                {(isAdding || isUpdatingProvider) ? <Loader /> : "Save Provider"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
