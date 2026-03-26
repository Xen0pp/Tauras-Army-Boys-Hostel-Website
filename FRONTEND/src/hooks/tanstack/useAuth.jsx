"use client";

import axiosRequest from "../../lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// send otp
export const useSendOtp = () => {
  return useMutation({
    mutationKey: ["sendOtp"],
    mutationFn: async (body) =>
      await axiosRequest({
        url: `/api/auth/send-otp/`, // Placeholder if needed in future
        method: "POST",
        data: body,
      }),
  });
};

// signup (Legacy - Firebase Auth handles this now)
export const useRegister = () => {
  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (body) =>
      await axiosRequest({
        url: `/api/registration-requests/`,
        method: "POST",
        data: body,
      }),
  });
};

// password change
export const useChangePassword = () => {
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationKey: ["passwordChange"],
    mutationFn: async (body) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/auth/password-change/`, // Placeholder
        method: "POST",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetUserDetails = () => {
  const { user, getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["userInfo", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return null;
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/users/${user.uid}/`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    enabled: !!user?.uid,
  });
};

export const useGetAnyUserDetails = (userId) => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["any-user-Info", userId],
    queryFn: async () => {
      if (!userId) return null;
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/users/${userId}/`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    enabled: !!userId,
  });
};
