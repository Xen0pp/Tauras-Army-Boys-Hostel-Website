"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { User, Building2, Calendar, MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatDate, getInitials } from '../../lib/mentorshipUtils';

export default function MentorshipCard({
    mentorship,
    userRole, // 'mentee' or 'mentor'
    onAccept,
    onDecline,
    onCancel,
    onViewDetails
}) {
    const isMentor = userRole === 'mentor';
    const otherUser = isMentor ? mentorship.mentee : mentorship.mentor;
    const status = mentorship.status?.toLowerCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300">
                        {getInitials(otherUser?.user?.firstName || otherUser?.firstName, otherUser?.user?.lastName || otherUser?.lastName)}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {otherUser?.user?.firstName || otherUser?.firstName} {otherUser?.user?.lastName || otherUser?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {isMentor ? 'Mentee' : `${otherUser?.position || 'Mentor'} at ${otherUser?.company || 'Company'}`}
                        </p>
                    </div>
                </div>
                <StatusBadge status={status} showDot />
            </div>

            {/* Message Preview */}
            {mentorship.message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    "{mentorship.message}"
                </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Requested {formatDate(mentorship.created_at || mentorship.createdAt)}
                </span>
                {mentorship.meeting_frequency && (
                    <span>• {mentorship.meeting_frequency}</span>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                {/* Mentor Actions - Pending Requests */}
                {isMentor && status === 'pending' && (
                    <>
                        <button
                            onClick={() => onAccept(mentorship.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Accept
                        </button>
                        <button
                            onClick={() => onDecline(mentorship.id)}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                        >
                            <XCircle className="w-4 h-4" />
                            Decline
                        </button>
                    </>
                )}

                {/* Mentee Actions - Pending Requests */}
                {!isMentor && status === 'pending' && (
                    <button
                        onClick={() => onCancel(mentorship.id)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        Cancel Request
                    </button>
                )}

                {/* Active Mentorship Actions */}
                {status === 'accepted' && (
                    <>
                        <button
                            onClick={() => onViewDetails(mentorship.id)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                        >
                            View Details
                        </button>
                        <button
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Message
                        </button>
                    </>
                )}

                {/* Declined/Cancelled - View Only */}
                {(status === 'declined' || status === 'cancelled') && (
                    <button
                        onClick={() => onViewDetails(mentorship.id)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                        View Details
                    </button>
                )}
            </div>
        </motion.div>
    );
}
