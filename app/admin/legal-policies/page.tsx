"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { buttonbg } from "@/contexts/theme";

import { Loader } from "@/components/ui/loader";
import JoditComponent from "../components/JoditComponent";

import { useGetLegalPoliciesQuery, useUpdateLegalPoliciesMutation } from "@/store/api/termsApi";

export default function LegalPoliciesPage() {
  const { data: apiData, isLoading: isFetching } = useGetLegalPoliciesQuery(undefined);
  const [updateLegalPolicies] = useUpdateLegalPoliciesMutation();
  
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (apiData?.data?.[0]?.description) {
      setContent(apiData.data[0].description);
    }
  }, [apiData]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateLegalPolicies({ description: content }).unwrap();
      toast.success("Legal & Policies updated successfully!");
    } catch (error) {
      toast.error("Failed to update Legal & Policies");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
      return (
        <div className="flex justify-center items-center h-[50vh]">
            <Loader />
        </div>
      );
  }

  return (
    <div className="w-full mx-auto">
      <div className={`${buttonbg} px-6 py-4 rounded-xl mb-6 flex items-center gap-3 shadow-md shadow-blue-200`}>
        <button
          onClick={() => router.back()}
          className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-xl sm:text-2xl font-bold">Legal & Policies</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <JoditComponent
          content={content}
          setContent={setContent}
        />
      </div>

      <div className="text-center pb-10">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`${buttonbg} hover:bg-blue-700 text-white font-semibold w-full md:w-auto md:px-12 py-3 rounded-lg transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-lg shadow-blue-600/20`}
        >
          {isSubmitting ? (
             <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
             </>
          ) : (
             <>
                <Save className="w-4 h-4" />
                Save Changes
             </>
          )}
        </button>
      </div>
    </div>
  );
}
