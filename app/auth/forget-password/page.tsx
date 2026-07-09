"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { buttonbg } from "@/contexts/theme";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { useForgotPasswordAdminMutation } from "@/store/api/adminApi";
import { toast } from "sonner";

function ForgetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordAdminMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await forgotPassword({ email }).unwrap();
      if (res.success) {
        toast.success(res.message || "OTP sent to email");
        sessionStorage.setItem("resetEmail", email);
        router.push("/auth/verification-code");
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-5">
      <div className="container mx-auto">
        <div className="flex  justify-center items-center ">
          <div className="w-full md:w-1/2 lg:w-1/2 p-5 md:px-[100px] md:py-[200px] bg-white  shadow-[0px_10px_20px_rgba(0,0,0,0.2)] rounded-2xl">
            <div className="flex justify-center items-center">
               <Image className="mx-auto my-5" src="/clientLogo.png" alt="Logo" width={200} height={200} />
            </div>
            <h2 className="text-[#0D0D0D] text-2xl  font-bold text-center mb-5">
              Forgot password ?
            </h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-xl text-[#0D0D0D] mb-2 font-bold">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-5 py-3 border-2 border-[#6A6D76] rounded-md outline-none mt-5 placeholder:text-xl"
                  required
                />
              </div>

              <div className="flex justify-center items-center">
                <div className="w-1/3 mt-5">
                  <AnimatedButton
                    text={isLoading ? "Sending..." : "Send Code"}
                    type="submit"
                    className="w-full"
                  />
                </div>
            
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
