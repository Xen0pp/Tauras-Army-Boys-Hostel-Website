"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Award, Briefcase, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useGetPendingMentors, useApproveMentor, useRejectMentor } from '@/hooks/tanstack/useAdminMentors';
import { enqueueSnackbar } from 'notistack';
import { getInitials, formatDate } from '@/lib/mentorshipUtils';
import axiosRequest from '@/lib/axiosRequest';

export default function MentorApplicationsPage() {
  const { user, loading: authLoading, getAuthToken } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: mentorsResponse, isLoading } = useGetPendingMentors();
  const approveMutation = useApproveMentor();
  const rejectMutation = useRejectMentor();

  const pendingMentors = mentorsResponse?.results || [];

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

  const handleApprove = async (mentorId) => {
    try {
      await approveMutation.mutateAsync(mentorId);
      enqueueSnackbar('Mentor application approved successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to approve mentor application', { variant: 'error' });
    }
  };

  const handleReject = async (mentorId) => {
    try {
      await rejectMutation.mutateAsync({ mentorId, reason: rejectReason });
      enqueueSnackbar('Mentor application rejected', { variant: 'info' });
      setRejectingId(null);
      setRejectReason('');
    } catch (error) {
      enqueueSnackbar('Failed to reject mentor application', { variant: 'error' });
    }
  };

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
            Mentor Applications
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Review and approve pending mentor applications
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {pendingMentors.length} pending application{pendingMentors.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Applications List */}
        {pendingMentors.length > 0 ? (
          <div className="grid gap-6">
            {pendingMentors.map((mentor, index) => (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-300">
                      {getInitials(mentor.user?.firstName, mentor.user?.lastName)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {mentor.user?.firstName} {mentor.user?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mentor.user?.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Applied {formatDate(mentor.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Professional Details */}
                <div className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Briefcase className="w-4 h-4" />
                      Current Position
                    </div>
                    <p className="text-gray-900 dark:text-white">{mentor.position}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.company}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <Clock className="w-4 h-4" />
                      Experience
                    </div>
                    <p className="text-gray-900 dark:text-white">{mentor.yearsOfExperience || 0} years</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <User className="w-4 h-4" />
                      Capacity
                    </div>
                    <p className="text-gray-900 dark:text-white">{mentor.mentoring_capacity || 3} mentees</p>
                  </div>
                </div>

                {/* Expertise */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Award className="w-4 h-4" />
                    Expertise Areas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(mentor.expertise || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {mentor.bio}
                  </p>
                </div>

                {/* Actions */}
                {rejectingId === mentor.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Reason for rejection (optional)"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReject(mentor.id)}
                        disabled={rejectMutation.isPending}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(mentor.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {approveMutation.isPending ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setRejectingId(mentor.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Applications
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All mentor applications have been processed
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
