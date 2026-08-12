import { baseApi } from "./baseApi";

const termsAndConditionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
      invalidatesTags: ["termsAndConditions"],
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
  useGetTermsAndConditionsQuery,
  useUpdateTermsAndConditionsMutation,
  useGetLegalPoliciesQuery,
  useUpdateLegalPoliciesMutation,
  useGetDeleteAccountQuery,
  useUpdateDeleteAccountMutation,
} = termsAndConditionsApi;