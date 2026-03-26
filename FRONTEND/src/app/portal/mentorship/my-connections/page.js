"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, CheckCircle, XCircle, Clock, Loader2, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useGetMentorshipRequests, useUpdateMentorshipRequest } from '../../../../hooks/tanstack/useMentorship';
import { useAuth } from '@/contexts/AuthContext';
import { enqueueSnackbar } from 'notistack';

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const statusConfig = {
  accepted: { label: 'Accepted', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400', icon: CheckCircle },
  pending:  { label: 'Pending',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', icon: Clock },
  rejected: { label: 'Declined', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: XCircle },
};

function StatusPill({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function UserAvatar({ name, photoURL, size = 'md' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-base';
  return photoURL ? (
    <img src={photoURL} alt={name} className={`${sizeClass} rounded-full object-cover`} />
  ) : (
    <div className={`${sizeClass} bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-700 dark:text-gray-300`}>
      {initials}
    </div>
  );
}

export default function MyConnectionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mentee'); // 'mentee' or 'mentor'

  const { data: menteeRequestsData, isLoading: menteeLoading } = useGetMentorshipRequests('mentee');
  const { data: mentorRequestsData, isLoading: mentorLoading } = useGetMentorshipRequests('mentor');
  const updateRequest = useUpdateMentorshipRequest();

  const menteeRequests = menteeRequestsData?.results || [];
  const mentorRequests = mentorRequestsData?.results || [];

  const handleAccept = async (requestId) => {
    try {
      await updateRequest.mutateAsync({ requestId, updateData: { status: 'accepted' } });
      enqueueSnackbar('Request accepted! Chat is now open.', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to accept request', { variant: 'error' });
    }
  };

  const handleDecline = async (requestId) => {
    try {
      await updateRequest.mutateAsync({ requestId, updateData: { status: 'rejected' } });
      enqueueSnackbar('Request declined', { variant: 'info' });
    } catch {
      enqueueSnackbar('Failed to decline request', { variant: 'error' });
    }
  };

  const isLoading = menteeLoading || mentorLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Connections</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your mentorship requests and active connections
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit mb-8">
          {[
            { key: 'mentee', label: 'As Mentee', count: menteeRequests.length },
            { key: 'mentor', label: 'As Mentor', count: mentorRequests.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} variants={tabVariants} initial="hidden" animate="visible">
              {/* MENTEE VIEW */}
              {activeTab === 'mentee' && (
                <div className="space-y-4">
                  {menteeRequests.length === 0 ? (
                    <EmptyConnections
                      title="No mentor requests yet"
                      description="Visit Find Mentors to request a mentorship connection"
                      actionLink="/portal/mentorship/mentors"
                      actionLabel="Find Mentors"
                    />
                  ) : (
                    menteeRequests.map((req, i) => {
                      const mentor = req.mentor || {};
                      const mentorName = mentor.user
                        ? `${mentor.user.firstName || ''} ${mentor.user.lastName || ''}`.trim()
                        : mentor.name || req.mentorUid || req.mentorId;
                      return (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                        >
                          <div className="flex items-start gap-4 justify-between">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={mentorName} photoURL={mentor.user?.avatar} />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{mentorName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {mentor.position} {mentor.company ? `@ ${mentor.company}` : ''}
                                </p>
                                {req.message && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">"{req.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <StatusPill status={req.status} />
                              {req.status === 'accepted' && req.conversationId && (
                                <Link href={`/portal/mentorship/chat/${req.conversationId}`}>
                                  <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                                    <MessageCircle className="w-4 h-4" />
                                    Open Chat
                                  </button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}

              {/* MENTOR VIEW */}
              {activeTab === 'mentor' && (
                <div className="space-y-4">
                  {mentorRequests.length === 0 ? (
                    <EmptyConnections
                      title="No incoming requests yet"
                      description="When students request mentorship, they'll appear here"
                    />
                  ) : (
                    mentorRequests.map((req, i) => {
                      const mentee = req.mentee || {};
                      const menteeName = mentee.user
                        ? `${mentee.user.firstName || ''} ${mentee.user.lastName || ''}`.trim()
                        : req.menteeUid || req.menteeId;
                      return (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                        >
                          <div className="flex items-start gap-4 justify-between flex-wrap gap-y-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={menteeName} photoURL={mentee.user?.avatar} />
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{menteeName}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{req.topic}</p>
                                {req.message && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 italic">"{req.message}"</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {req.status === 'pending' ? (
                                <>
                                  <button
                                    onClick={() => handleAccept(req.id)}
                                    disabled={updateRequest.isPending}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleDecline(req.id)}
                                    disabled={updateRequest.isPending}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-red-600 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Decline
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <StatusPill status={req.status} />
                                  {req.status === 'accepted' && req.conversationId && (
                                    <Link href={`/portal/mentorship/chat/${req.conversationId}`}>
                                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                                        <MessageCircle className="w-4 h-4" />
                                        Open Chat
                                      </button>
                                    </Link>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function EmptyConnections({ title, description, actionLink, actionLabel }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">{description}</p>
      {actionLink && (
        <Link href={actionLink}>
          <button className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 transition-colors">
            {actionLabel}
          </button>
        </Link>
      )}
    </div>
  );
}
