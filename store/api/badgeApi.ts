import { baseApi } from "./baseApi";

export const badgeApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all badges
        getAllBadges: builder.query({
            query: (params) => ({
                url: "badge/all-badges",
                method: "GET",
                params,
            }),
            providesTags: ["badge"],
        }),

        // Get single badge
        getSingleBadge: builder.query({
            query: (id) => ({
                url: `badge/single-badge/${id}`,
                method: "GET",
            }),
            providesTags: ["badge"],
        }),

        // Create badge
        createBadge: builder.mutation({
            query: (formData) => ({
                url: "badge/create-badge",
                method: "POST",
                body: formData, // Multipart/FormData
            }),
            invalidatesTags: ["badge"],
        }),

        // Add criteria to badge
        addCriteria: builder.mutation({
            query: ({ id, formData }) => ({
                url: `badge/add-criteria/${id}`,
                method: "PATCH",
                body: formData, // Multipart/FormData
            }),
            invalidatesTags: ["badge"],
        }),

        // Update badge
        updateBadge: builder.mutation({
            query: ({ id, formData }) => ({
                url: `badge/update-badge/${id}`,
                method: "PATCH",
                body: formData, // Multipart/FormData
            }),
            invalidatesTags: ["badge"],
        }),

        // Delete badge
        deleteBadge: builder.mutation({
            query: (id) => ({
                url: `badge/delete-badge/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["badge"],
        }),
    }),
});

export const {
    useGetAllBadgesQuery,
    useGetSingleBadgeQuery,
    useCreateBadgeMutation,
    useAddCriteriaMutation,
    useDeleteBadgeMutation,
    useUpdateBadgeMutation,
} = badgeApi;

export default badgeApi;
