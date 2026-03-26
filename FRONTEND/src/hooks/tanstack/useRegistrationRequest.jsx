"use client";

import axiosRequest from "../../lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export const useGetRegistrationRequests = () => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["registration-requests"],
    queryFn: async () => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/registration-requests/`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useCreateRegistrationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) =>
      await axiosRequest({
        url: `/api/registration-requests/`,
        method: "POST",
        data: data,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });
    },
  });
};

// approve registration request
export const useApproveRegistrationRequest = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/registration-requests/${data.id}/`,
        method: "PUT",
        data: { isApproved: true, ...data },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });
    },
  });
};

// reject registration request
export const useRejectRegistrationRequest = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/registration-requests/${data.id}/`,
        method: "PUT",
        data: { isApproved: false, rejectionReason: data.rejectionReason || "Criteria not met" },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registration-requests"] });
    },
  });
};
