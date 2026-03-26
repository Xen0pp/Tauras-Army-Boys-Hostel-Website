"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "../../lib/axiosRequest";
import { useAuth } from "@/contexts/AuthContext";

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["createUser"],
        mutationFn: async (body) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/users`,
                method: "POST",
                data: body,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["updateUser"],
        mutationFn: async ({ id, data }) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/users/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["deleteUser"],
        mutationFn: async (id) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/users/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
};
