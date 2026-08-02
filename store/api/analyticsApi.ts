import { baseApi } from "./baseApi";

export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAnalytics: build.query({
      query: () => ({
        url: "/analytics",
        method: "GET",
      }),
      providesTags: ["analytics" as any], // assuming baseApi doesn't have 'analytics' tag explicitly typed
    }),
  }),
});

export const { useGetAnalyticsQuery } = analyticsApi;
