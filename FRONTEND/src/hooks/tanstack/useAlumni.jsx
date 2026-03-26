"use client";

import axiosRequest from "../../lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

export const useGetRoles = () => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      // For now, return static roles or we could add a /api/roles route later
      return [
        { id: "1", role_name: "Student" },
        { id: "2", role_name: "Alumni" },
        { id: "3", role_name: "Admin" }
      ];
    },
  });
};

export const useGetUsers = ({ limit = 10, offset = 0, role = "" }) => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["users", limit, offset, role],
    queryFn: async () => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/users/?limit=${limit}&offset=${offset}&role=${role}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetUsersByRoleName = ({ limit = 10, offset = 0, roleName = "" }) => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["users", limit, offset, roleName],
    queryFn: async () => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/users/?limit=${limit}&offset=${offset}&role_name=${roleName}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  });
};

export const useGetUserInfo = (id) => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/users/${id}/`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
    },
  });
};
