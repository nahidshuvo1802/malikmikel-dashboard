import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  serviceName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  serviceName?: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete Service?</h2>
          <p className="text-gray-500 text-sm">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-800">
              {serviceName || "this service"}
            </span>
            ? This action cannot be undone and will permanently remove all
            associated data.
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
