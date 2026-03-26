"use client";

import axiosRequest from "../../lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export const useGetPosts = () => {
  const { getAuthToken, user } = useAuth();

  return useQuery({
    queryKey: ["posts", user?.uid || "guest"],
    queryFn: async () => {
      const token = await getAuthToken();
      // Only include Authorization header if token exists
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      return await axiosRequest({
        url: `/api/posts/`,
        method: "GET",
        headers,
      });
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/posts/`,
        method: "POST",
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

// use Create Comment
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationFn: async (data) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/posts/${data.post}/comments/`,
        method: "POST",
        data: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
// use Delete Post
export const useDeletePost = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationFn: async (postId) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/posts/${postId}/`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};
