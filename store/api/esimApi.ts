import { baseApi } from "./baseApi";

export const esimApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEsimContent: build.query({
      query: () => ({
        url: "/esim/content",
        method: "GET",
      }),
      providesTags: ["esim-content" as any],
    }),
    updateEsimContent: build.mutation({
      query: (data) => ({
        url: "/esim/content",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["esim-content" as any],
    }),
    getEsimProviders: build.query({
      query: () => ({
        url: "/esim/providers",
        method: "GET",
      }),
      providesTags: ["esim-providers" as any],
    }),
    addEsimProvider: build.mutation({
      query: (formData) => ({
        url: "/esim/provider",
        method: "POST",
        body: formData, // FormData for file upload
      }),
      invalidatesTags: ["esim-providers" as any],
    }),
    updateEsimProvider: build.mutation({
      query: ({ id, formData }) => ({
        url: `/esim/provider/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["esim-providers" as any],
    }),
    deleteEsimProvider: build.mutation({
      query: (id) => ({
        url: `/esim/provider/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["esim-providers" as any],
    }),
  }),
});

export const {
  useGetEsimContentQuery,
  useUpdateEsimContentMutation,
  useGetEsimProvidersQuery,
  useAddEsimProviderMutation,
  useUpdateEsimProviderMutation,
  useDeleteEsimProviderMutation,
} = esimApi;
