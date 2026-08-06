import { baseApi } from "./baseApi";

export const serviceApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Get all services with pagination and filters
        getAllServices: builder.query({
            query: ({
                page = 1,
                limit = 10,
                searchTerm = "",
                category_id = "",
                type = "", // Online, Offline, Both
                time = "", // newest, lowest, etc. (probably sort order)
                instructor_id = "",
                price = "", // lowest, highest
            }: any = {}) => {
                const params = new URLSearchParams();
                if (page) params.append("page", page.toString());
                if (limit) params.append("limit", limit.toString());
                if (searchTerm) params.append("search", searchTerm);
                if (category_id) params.append("cetagory", category_id);
                if (type) params.append("type", type);
                if (time) params.append("time", time);
                if (instructor_id) params.append("instructor_id", instructor_id);
                if (price) params.append("price", price);

                return {
                    url: `service/all-services?${params.toString()}`,
                    method: "GET",
                };
            },
            providesTags: ["service"],
        }),

        // Create service
        createService: builder.mutation({
            query: (formData) => ({
                url: "service/create-service",
                method: "POST",
                body: formData, // FormData
            }),
            invalidatesTags: ["service"],
        }),

        // Update service
        updateService: builder.mutation({
            query: ({ id, formData }) => ({
                url: `service/update-service/${id}`,
                method: "PATCH",
                body: formData, // FormData
            }),
            invalidatesTags: ["service"],
        }),

        // Delete service
        deleteService: builder.mutation({
            query: (id) => ({
                url: `service/delete-service/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["service"],
        }),

        // Get weekly featured services
        getWeeklyFeaturedServices: builder.query({
            query: () => ({
                url: "service/weekly-featured-services",
                method: "GET",
            }),
            providesTags: ["service"],
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetAllServicesQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
    useGetWeeklyFeaturedServicesQuery,
} = serviceApi;

export default serviceApi;
