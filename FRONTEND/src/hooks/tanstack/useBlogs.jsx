"use client";

import axiosRequest from "@/lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export const useGetBlogs = () => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/blogs/`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

// create blog
export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationKey: ["createBlog"],
    mutationFn: async (body) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/blogs/`,
        method: "POST",
        data: body,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};