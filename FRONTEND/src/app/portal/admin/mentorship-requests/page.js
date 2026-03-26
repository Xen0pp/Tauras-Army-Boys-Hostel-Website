"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, User, Calendar, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axiosRequest from '@/lib/axiosRequest';
import { formatDate, getInitials } from '@/lib/mentorshipUtils';
import StatusBadge from '@/components/mentorship/StatusBadge';

export default function AdminMentorshipRequestsPage() {
  const { user, getAuthToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all mentorship requests
  const { data: requestsResponse, isLoading } = useQuery({
    queryKey: ["adminMentorshipRequests", statusFilter],
    queryFn: async () => {
      try {
        const token = await getAuthToken();
        return await axiosRequest({
          url: `/api/admin/mentorship/requests/?status=${statusFilter}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });
      } catch (error) {
        console.error('Error fetching mentorship requests:', error);
        return { results: [] };
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  const requests = requestsResponse?.results || [];

  // Check admin access
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!authLoading && user) {
        try {
          const token = await getAuthToken();
          const response = await axiosRequest({
            url: '/api/admin/check/',
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          if (response?.isAdmin) {
            setIsAdmin(true);
          } else {
            router.push('/portal');
          }
        } catch (error) {
          router.push('/portal');
        }
      } else if (!authLoading && !user) {
        router.push('/portal');
      }
      setCheckingAdmin(false);
    };

    checkAdminStatus();
  }, [user, authLoading, getAuthToken, router]);

  const statusTabs = [
    { key: 'all', label: 'All Requests', count: requests.length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'accepted', label: 'Active', count: requests.filter(r => r.status === 'accepted').length },
    { key: 'declined', label: 'Declined', count: requests.filter(r => r.status === 'declined').length },
  ];

  if (authLoading || checkingAdmin || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Mentorship Requests
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Overview of all mentorship requests in the system
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 min-w-[120px] py-3 px-4 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    statusFilter === tab.key
                      ? 'bg-white/20'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        {requests.length > 0 ? (
          <div className="grid gap-6">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Mentee Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                        {getInitials(request.mentee?.firstName, request.mentee?.lastName)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mentee</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.mentee?.firstName} {request.mentee?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{request.mentee?.email}</p>
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-center my-2">→</div>
                    
                    {/* Mentor Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-sm font-bold text-green-700 dark:text-green-300">
                        {getInitials(request.mentor?.firstName, request.mentor?.lastName)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mentor</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {request.mentor?.firstName} {request.mentor?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {request.mentor?.position} at {request.mentor?.company}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <StatusBadge status={request.status} showDot />
                </div>

                {/* Message */}
                {request.message && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "{request.message}"
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Requested {formatDate(request.createdAt)}
                  </span>
                  {request.topic && (
                    <span>• {request.topic}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Requests Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {statusFilter === 'all' 
                ? 'No mentorship requests in the system yet'
                : `No ${statusFilter} mentorship requests`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
