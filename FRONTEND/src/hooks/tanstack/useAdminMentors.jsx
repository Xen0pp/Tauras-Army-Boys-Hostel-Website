"use client";

import axiosRequest from "../../lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// Get pending mentor applications (Admin only)
export const useGetPendingMentors = () => {
    const { getAuthToken } = useAuth();

    return useQuery({
        queryKey: ["pendingMentors"],
        queryFn: async () => {
            try {
                const token = await getAuthToken();
                return await axiosRequest({
                    url: `/api/admin/mentors/pending/`,
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    timeout: 10000,
                });
            } catch (error) {
                console.error('Error fetching pending mentors:', error);
                return { results: [] };
            }
        },
        staleTime: 2 * 60 * 1000,
    });
};

// Approve mentor application (Admin only)
export const useApproveMentor = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["approveMentor"],
        mutationFn: async (mentorId) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/admin/mentors/${mentorId}/approve/`,
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 15000,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingMentors"] });
            queryClient.invalidateQueries({ queryKey: ["mentors"] });
        },
    });
};

// Reject mentor application (Admin only)
export const useRejectMentor = () => {
    const queryClient = useQueryClient();
    const { getAuthToken } = useAuth();

    return useMutation({
        mutationKey: ["rejectMentor"],
        mutationFn: async ({ mentorId, reason }) => {
            const token = await getAuthToken();
            return await axiosRequest({
                url: `/api/admin/mentors/${mentorId}/reject/`,
                method: "PUT",
                data: { reason },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 15000,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pendingMentors"] });
        },
    });
};
