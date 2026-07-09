"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { activeTabClass, buttonbg } from "@/contexts/theme";
import { 
  useGetAdminProfileQuery, 
  useChangePasswordAdminMutation, 
  useUpdateAdminPersonalInfoMutation 
} from "@/store/api/adminApi";
import { getImageUrl } from "@/store/config/envConfig";

export default function ProfilePage() {
  const authUser = useAppSelector((state) => state.auth.user);
  const { data: rawData, refetch } = useGetAdminProfileQuery({});
  const adminData = rawData?.data || authUser;
  
  const [activeTab, setActiveTab] = useState("edit-profile");

  const profileImage = getImageUrl(adminData?.image);
  const profileName = adminData?.userName || adminData?.name || adminData?.fullName || "Admin User";
  const profileRole = adminData?.role || "Admin";

  return (
    <div className="w-full flex flex-col items-center gap-6 p-4 md:p-8">
      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
            <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center font-bold text-2xl text-gray-500">
                {profileImage ? (
                    <img 
                        src={profileImage} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <span>{profileName.charAt(0).toUpperCase()}</span>
                )}
            </div>
            <h2 className="text-xl font-semibold text-[#0D0D0D]">{profileName}</h2>
            <p className="text-gray-500 capitalize">{profileRole}</p>
        </div>

        <h1 className="text-2xl font-bold text-[#0D0D0D] mb-6 text-center">Profile Settings</h1>
        
        <Tabs defaultValue="edit-profile" className="w-full max-w-xl" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-[#F3F4F6] p-1 rounded-lg cursor-pointer">
            <TabsTrigger 
                value="edit-profile"
                className={`${activeTabClass} rounded-md transition-all cursor-pointer`}
            >
                Edit Profile
            </TabsTrigger>
            <TabsTrigger 
                value="change-password"
                className={`${activeTabClass} rounded-md transition-all cursor-pointer`}
            >
                Change Password
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <TabsContent value="edit-profile" className="mt-0">
                <EditProfileForm adminData={adminData} refetch={refetch} />
            </TabsContent>
            
            <TabsContent value="change-password" className="mt-0">
                <ChangePasswordForm adminData={adminData} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

import { Loader } from "@/components/ui/loader";

// --- Sub-components (Forms) ---

function EditProfileForm({ adminData, refetch }: { adminData: any, refetch: () => void }) {
  const [updateProfile, { isLoading }] = useUpdateAdminPersonalInfoMutation();
  // ... rest of the component state ...
  const [formData, setFormData] = useState({
    userName: "",
    phone: "",
    dateOfBirth: "",
    country: "",
    image: null as File | null
  });

  useEffect(() => {
    if (adminData) {
      setFormData(prev => ({
        ...prev,
        userName: adminData.userName || adminData.name || adminData.fullName || "",
        phone: adminData.phone || "", 
        dateOfBirth: adminData.dateOfBirth || "",
        country: adminData.country || "",
      }));
    }
  }, [adminData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid File", { description: "Please select an image file" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File Too Large", { description: "Image size should be less than 5MB" });
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName.trim()) {
      toast.error("Validation Error", { description: "User Name is required" });
      return;
    }
    
    const submitData = new FormData();
    submitData.append("userName", formData.userName);
    submitData.append("phone", formData.phone);
    submitData.append("dateOfBirth", formData.dateOfBirth);
    submitData.append("country", formData.country);
    
    if (formData.image) {
      submitData.append("image", formData.image);
    }

    try {
      const res = await updateProfile(submitData).unwrap();
      if (res.success) {
        toast.success(res.message || "Profile updated successfully");
        setFormData(prev => ({ ...prev, image: null }));
        refetch(); // Refetch single admin to update live view
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Update Failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>User Name</Label>
        <Input 
            name="userName" 
            value={formData.userName} 
            onChange={handleInputChange} 
            className="focus-visible:ring-[#00c0b5]"
            placeholder="Enter user name"
        />
      </div>
      <div className="space-y-2">
        <Label>Email</Label>
        <Input 
            value={adminData?.email || ""} 
            disabled 
            className="bg-gray-50"
        />
      </div>
      <div className="space-y-2">
        <Label>Contact Number</Label>
        <Input 
            name="phone" 
            value={formData.phone} 
            onChange={handleInputChange} 
            className="focus-visible:ring-[#00c0b5]"
            placeholder="Enter contact number"
        />
      </div>
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input 
            name="dateOfBirth" 
            value={formData.dateOfBirth} 
            onChange={handleInputChange} 
            className="focus-visible:ring-[#00c0b5]"
            placeholder="Enter date of birth"
        />
      </div>
      <div className="space-y-2">
        <Label>Country</Label>
        <Input 
            name="country" 
            value={formData.country} 
            onChange={handleInputChange} 
            className="focus-visible:ring-[#00c0b5]"
            placeholder="Enter country"
        />
      </div>
      <div className="space-y-2">
        <Label>Profile Image</Label>
        <Input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="cursor-pointer file:text-blue-500" 
        />
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className={`w-full ${buttonbg} cursor-pointer mt-4 flex items-center justify-center gap-2`}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Updating...
          </>
        ) : "Save Changes"}
      </Button>
    </form>
  );
}

function ChangePasswordForm({ adminData }: { adminData: any }) {
  const [changePassword, { isLoading }] = useChangePasswordAdminMutation();
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShow = (field: keyof typeof showPass) => {
    setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    try {
      const res = await changePassword({ 
        currentPassword: formData.currentPassword, 
        newPassword: formData.newPassword, 
        confirmPassword: formData.confirmPassword 
      }).unwrap();
      
      if (res.success) {
        toast.success(res.message || "Password Changed Successfully");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(res.message || "Failed to change password");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current Password</Label>
        <div className="relative">
          <Input 
            type={showPass.current ? "text" : "password"} 
            name="currentPassword" 
            value={formData.currentPassword} 
            onChange={handleChange}
            className="focus-visible:ring-[#00c0b5]"
            placeholder="********"
          />
          <button type="button" onClick={() => toggleShow('current')} className="absolute right-3 top-2.5 text-gray-500">
            {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>New Password</Label>
        <div className="relative">
          <Input 
            type={showPass.new ? "text" : "password"} 
            name="newPassword" 
            value={formData.newPassword} 
            onChange={handleChange}
            className="focus-visible:ring-[#00c0b5]"
            placeholder="********"
          />
          <button type="button" onClick={() => toggleShow('new')} className="absolute right-3 top-2.5 text-gray-500">
            {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <div className="relative">
          <Input 
            type={showPass.confirm ? "text" : "password"} 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange}
            className="focus-visible:ring-[#00c0b5]"
            placeholder="********"
          />
          <button type="button" onClick={() => toggleShow('confirm')} className="absolute right-3 top-2.5 text-gray-500">
            {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <Button 
        type="submit" 
        disabled={isLoading} 
        className={`w-full ${buttonbg} cursor-pointer mt-4 flex items-center justify-center gap-2`}
      >
        {isLoading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Changing...
          </>
        ) : "Change Password"}
      </Button>
    </form>
  );
}
