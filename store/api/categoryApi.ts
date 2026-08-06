import { baseApi } from "./baseApi";

export const categoryApi = baseApi.injectEndpoints({
    endpoints: (build) => ({
        getAllCategories: build.query({
            query: ({ page = 1, limit = 10, searchTerm = "" }: { page?: number; limit?: number; searchTerm?: string } = {}) => {
                let url = `cetagory/all-cetagory?page=${page}&limit=${limit}`;
                if (searchTerm) url += `&searchTerm=${searchTerm}`;
                return {
                    url,
                    method: "GET",
                };
            },
            providesTags: ["category"],
        }),
        createCategory: build.mutation({
            query: (formData) => ({
                url: "cetagory/create-cetagory",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["category"],
        }),
        deleteCategory: build.mutation({
            query: (id) => ({
                url: `cetagory/delete-cetagory/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["category"],
        }),
        updateCategory: build.mutation({
            query: ({ id, data }: { id: string; data: FormData }) => ({
                url: `cetagory/update-cetagory/${id}`,
                method: "PATCH",
                body: data,
            }),
            invalidatesTags: ["category"],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetAllCategoriesQuery,
    useCreateCategoryMutation,
    useDeleteCategoryMutation,
    useUpdateCategoryMutation,
} = categoryApi;
