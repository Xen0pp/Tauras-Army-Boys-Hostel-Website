"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosRequest from "../../lib/axiosRequest";
import { useAuth } from "@/contexts/AuthContext";

export const useUpdateEvent = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["updateEvent"],
        mutationFn: async ({ id, data }) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/events/${id}`,
                method: "PUT",
                data,
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

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["deleteEvent"],
        mutationFn: async (id) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/events/${id}`,
                method: "DELETE",
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
