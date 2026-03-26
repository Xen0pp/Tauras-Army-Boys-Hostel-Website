"use client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axiosRequest from "../../lib/axiosRequest";
import { useAuth } from "@/contexts/AuthContext";

export const useGetEvent = () => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await axiosRequest({
        url: `/api/events/`,
        method: "GET",
        headers,
      });
    },
  });
};

export const useGetEventDetails = (id) => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const token = await getAuthToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return await axiosRequest({
        url: `/api/events/${id}/`,
        method: "GET",
        headers,
      });
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationKey: ["createEvent"],
    mutationFn: async (body) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/events/`,
        method: "POST",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
};
