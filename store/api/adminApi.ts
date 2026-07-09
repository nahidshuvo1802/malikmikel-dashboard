import { baseApi } from "./baseApi";

export const adminApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new admin
        createAdmin: builder.mutation({
            query: (formData) => ({
                url: "admin/create-admin",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["admin"],
        }),

        // Get all admins
        getAllAdmins: builder.query({
            query: (params) => ({
                url: "admin/all-admins",
                method: "GET",
                params,
            }),
            providesTags: ["admin"],
        }),

        // Delete an admin
        deleteAdmin: builder.mutation({
            query: (id) => ({
                url: `admin/delete-admin/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["admin"],
        }),

        // Get single admin
        getSingleAdmin: builder.query({
            query: (id) => ({
                url: `admin/single-admin/${id}`,
                method: "GET",
            }),
            providesTags: ["admin"],
        }),

        // Admin Login
        adminLogin: builder.mutation({
            query: (data) => ({
                url: "admin/admin-login",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["admin"],
        }),

        // Forgot Password Admin
        forgotPasswordAdmin: builder.mutation({
            query: (data) => ({
                url: "admin/forgot-password",
                method: "POST",
                body: data,
            }),
        }),

        // Verify OTP Admin
        verifyOtpAdmin: builder.mutation({
            query: (data) => ({
                url: "admin/verify-otp",
                method: "POST",
                body: data,
            }),
        }),

        // Reset Password Admin
        resetPasswordAdmin: builder.mutation({
            query: (data) => ({
                url: "admin/reset-password",
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["admin"],
        }),

        // Change admin password
        changePasswordAdmin: builder.mutation({
            query: (data) => ({
                url: "admin/change-password",
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["admin"],
        }),

        // Update admin info (self or general)
        updateAdminPersonalInfo: builder.mutation({
            query: (formData) => ({
                url: "admin/update-admin-personal-info",
                method: "PATCH",
                body: formData,
            }),
            invalidatesTags: ["admin"],
        }),

        // Get authenticated admin profile
        getAdminProfile: builder.query({
            query: () => ({
                url: "admin/my-profile",
                method: "GET",
            }),
            providesTags: ["admin"],
        }),
    }),
});

export const {
    useCreateAdminMutation,
    useGetAllAdminsQuery,
    useDeleteAdminMutation,
    useGetSingleAdminQuery,
    useAdminLoginMutation,
    useForgotPasswordAdminMutation,
    useVerifyOtpAdminMutation,
    useResetPasswordAdminMutation,
    useChangePasswordAdminMutation,
    useUpdateAdminPersonalInfoMutation,
    useGetAdminProfileQuery,
} = adminApi;

export default adminApi;