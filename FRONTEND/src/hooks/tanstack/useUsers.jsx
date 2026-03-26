"use client";
import { useQuery } from "@tanstack/react-query";
import axiosRequest from "../../lib/axiosRequest";
import { useAuth } from "@/contexts/AuthContext";

export const useGetUsers = (roleId) => {
    const { getAuthToken } = useAuth();

    return useQuery({
        queryKey: ["users", roleId],
        queryFn: async () => {
            const token = await getAuthToken();
            const url = roleId ? `/api/users?role=${roleId}` : `/api/users`;
            return await axiosRequest({
                url,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        },
    });
};
