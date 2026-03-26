"use client";

import axiosRequest from "../../lib/axiosRequest";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

// Get all approved mentors
export const useGetMentors = ({ expertise = "", company = "" } = {}) => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["mentors", expertise, company],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        const params = new URLSearchParams();
        if (expertise) params.append("expertise", expertise);
        if (company) params.append("company", company);

        return await axiosRequest({
          url: `/api/mentorship/mentors/?${params.toString()}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });
      } catch (error) {
        console.error('Error fetching mentors:', error);
        return { mentors: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get mentor profile by ID
export const useGetMentorProfile = (mentorId) => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        return await axiosRequest({
          url: `/api/mentorship/mentors/${mentorId}/`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });
      } catch (error) {
        console.error('Error fetching mentor profile:', error);
        return null;
      }
    },
    enabled: !!mentorId,
  });
};

// Apply as mentor
export const useApplyAsMentor = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationKey: ["applyAsMentor"],
    mutationFn: async (mentorData) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/mentorship/mentors/`,
        method: "POST",
        data: mentorData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
  });
};

// Get user's mentorship requests
export const useGetMentorshipRequests = (type = "mentee") => {
  const { getAuthToken } = useAuth();

  return useQuery({
    queryKey: ["mentorshipRequests", type],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        return await axiosRequest({
          url: `/api/mentorship/requests/?type=${type}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });
      } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        return { requests: [] };
      }
    },
    staleTime: 2 * 60 * 1000,
  });
};

// Create mentorship request
export const useCreateMentorshipRequest = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationKey: ["createMentorshipRequest"],
    mutationFn: async (requestData) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/mentorship/requests/`,
        method: "POST",
        data: requestData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorshipRequests"] });
    },
  });
};

// Update mentorship request (accept/reject)
export const useUpdateMentorshipRequest = () => {
  const queryClient = useQueryClient();
  const { getAuthToken } = useAuth();

  return useMutation({
    mutationKey: ["updateMentorshipRequest"],
    mutationFn: async ({ requestId, updateData }) => {
      const token = await getAuthToken();
      return await axiosRequest({
        url: `/api/mentorship/requests/${requestId}/`,
        method: "PUT",
        data: updateData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentorshipRequests"] });
    },
  });
};
