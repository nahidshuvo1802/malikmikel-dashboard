import { baseApi } from "./baseApi";

const termsAndConditionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Dynamic Legal Documents endpoints
    getAllLegalDocs: builder.query({
      query: (params) => ({
        url: `legalDoc/all-docs${params?.includeUnpublished ? "?includeUnpublished=true" : ""}`,
        method: "GET",
      }),
      providesTags: ["legalPolicies", "termsAndConditions", "aboutUs", "privacy"],
    }),
    getSingleLegalDoc: builder.query({
      query: (content) => ({
        url: `legalDoc/get-doc/${content}`,
        method: "GET",
      }),
      providesTags: ["legalPolicies"],
    }),
    createLegalPolicy: builder.mutation({
      query: (data) => ({
        url: "legalDoc/create-policy",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["legalPolicies", "termsAndConditions", "aboutUs", "privacy"],
    }),
    updateLegalPolicy: builder.mutation({
      query: ({ id, data }) => ({
        url: `legalDoc/update-policy/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["legalPolicies", "termsAndConditions", "aboutUs", "privacy"],
    }),
    deleteLegalPolicy: builder.mutation({
      query: (id) => ({
        url: `legalDoc/delete-policy/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["legalPolicies", "termsAndConditions", "aboutUs", "privacy"],
    }),
    togglePublishPolicy: builder.mutation({
      query: (id) => ({
        url: `legalDoc/toggle-publish/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: ["legalPolicies", "termsAndConditions", "aboutUs", "privacy"],
    }),
    reorderLegalPolicies: builder.mutation({
      query: (data) => ({
        url: "legalDoc/reorder",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["legalPolicies", "termsAndConditions", "aboutUs", "privacy"],
    }),

    // Legacy endpoints
    getTermsAndConditions: builder.query({
      query: () => ({
        url: "legalDoc/get-doc/termsAndCondition",
        method: "GET",
      }),
      providesTags: ["termsAndConditions"],
    }),
    updateTermsAndConditions: builder.mutation({
      query: (data) => ({
        url: "legalDoc/create-doc/termsAndCondition",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["termsAndConditions", "legalPolicies"],
    }),
    getLegalPolicies: builder.query({
      query: () => ({
        url: "legalDoc/get-doc/legalPolicies",
        method: "GET",
      }),
      providesTags: ["legalPolicies"],
    }),
    updateLegalPolicies: builder.mutation({
      query: (data) => ({
        url: "legalDoc/create-doc/legalPolicies",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["legalPolicies"],
    }),
    getDeleteAccount: builder.query({
      query: () => ({
        url: "legalDoc/get-doc/deleteAccount",
        method: "GET",
      }),
      providesTags: ["deleteAccount"],
    }),
    updateDeleteAccount: builder.mutation({
      query: (data) => ({
        url: "legalDoc/create-doc/deleteAccount",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["deleteAccount"],
    }),
  }),
});

export const {
  useGetAllLegalDocsQuery,
  useGetSingleLegalDocQuery,
  useCreateLegalPolicyMutation,
  useUpdateLegalPolicyMutation,
  useDeleteLegalPolicyMutation,
  useTogglePublishPolicyMutation,
  useReorderLegalPoliciesMutation,
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
  useGetLegalPoliciesQuery,
  useUpdateLegalPoliciesMutation,
  useGetDeleteAccountQuery,
  useUpdateDeleteAccountMutation,
} = termsAndConditionsApi;