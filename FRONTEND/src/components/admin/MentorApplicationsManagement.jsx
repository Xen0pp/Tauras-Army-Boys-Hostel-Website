"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Award, Briefcase, Clock, User } from 'lucide-react';
import { useGetPendingMentors, useApproveMentor, useRejectMentor } from '@/hooks/tanstack/useAdminMentors';
import { enqueueSnackbar } from 'notistack';
import { formatDate } from '@/lib/mentorshipUtils';

export default function MentorApplicationsManagement() {
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');

    const { data: mentorsResponse, isLoading } = useGetPendingMentors();
    const approveMutation = useApproveMentor();
    const rejectMutation = useRejectMentor();

    const pendingMentors = mentorsResponse?.results || [];

    const handleApprove = async (mentorId) => {
        try {
            await approveMutation.mutateAsync(mentorId);
            enqueueSnackbar('Mentor application approved!', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Failed to approve application', { variant: 'error' });
        }
    };

    const handleReject = async (mentorId) => {
        try {
            await rejectMutation.mutateAsync({ mentorId, reason: rejectReason });
            enqueueSnackbar('Application rejected', { variant: 'info' });
            setRejectingId(null);
            setRejectReason('');
        } catch (error) {
            enqueueSnackbar('Failed to reject application', { variant: 'error' });
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div>
            {/* Stats Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pending Applications</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {pendingMentors.length} application{pendingMentors.length !== 1 ? 's' : ''} awaiting review
                    </p>
                </div>
                {pendingMentors.length > 0 && (
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-medium rounded-full">
                        {pendingMentors.length} Pending
                    </span>
                )}
            </div>

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
                                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-300 uppercase">
                                        {mentor.photoURL
                                            ? <img src={mentor.photoURL} alt={mentor.name} className="w-16 h-16 rounded-full object-cover" />
                                            : getInitials(mentor.name)
                                        }
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                            {mentor.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.email}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            Applied {formatDate(mentor.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                                    Pending
                                </span>
                            </div>

                            {/* Professional Details */}
                            <div className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <Briefcase className="w-4 h-4" />
                                        Position
                                    </div>
                                    <p className="text-gray-900 dark:text-white">{mentor.position || '—'}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{mentor.company || '—'}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <Clock className="w-4 h-4" />
                                        Experience
                                    </div>
                                    <p className="text-gray-900 dark:text-white">{mentor.experience || mentor.yearsOfExperience || 0} years</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        <User className="w-4 h-4" />
                                        Capacity
                                    </div>
                                    <p className="text-gray-900 dark:text-white">{mentor.capacity || mentor.mentoring_capacity || 3} mentees max</p>
                                </div>
                            </div>

                            {/* Expertise */}
                            <div className="mb-4">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Award className="w-4 h-4" />
                                    Skills / Expertise
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(mentor.skills || mentor.expertise || []).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {!(mentor.skills || mentor.expertise || []).length && (
                                        <span className="text-sm text-gray-400">No skills listed</span>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            {mentor.bio && (
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h4>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{mentor.bio}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {rejectingId === mentor.id ? (
                                <div className="space-y-3">
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Reason for rejection (optional)"
                                        rows={3}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleReject(mentor.id)}
                                            disabled={rejectMutation.isPending}
                                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
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
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 text-sm"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                    </button>
                                    <button
                                        onClick={() => setRejectingId(mentor.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-sm"
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
                        All mentor applications have been processed.
                    </p>
                </div>
            )}
        </div>
    );
}
