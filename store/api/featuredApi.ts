import { baseApi } from "./baseApi";

export const featuredApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeaturedSections: builder.query({
      query: () => ({
        url: "featured/all-sections",
        method: "GET",
      }),
      providesTags: ["Featured"],
    }),
    updateFeaturedSection: builder.mutation({
      query: ({ sectionKey, data }) => ({
        url: `featured/update/${sectionKey}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Featured"],
    }),
  }),
});

export const {
  useGetFeaturedSectionsQuery,
  useUpdateFeaturedSectionMutation,
} = featuredApi;

export default featuredApi;
