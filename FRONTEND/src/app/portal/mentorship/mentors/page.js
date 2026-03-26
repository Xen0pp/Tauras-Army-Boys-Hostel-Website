"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, Send, Loader2, X, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useGetMentors, useCreateMentorshipRequest, useGetMentorshipRequests } from '../../../../hooks/tanstack/useMentorship';
import { useAuth } from '@/contexts/AuthContext';
import MentorFilters from '../../../../components/mentorship/MentorFilters';
import MentorProfileModal from '../../../../components/mentorship/MentorProfileModal';
import StatusBadge from '../../../../components/mentorship/StatusBadge';
import EmptyState from '../../../../components/mentorship/EmptyState';
import { filterMentors, calculateAvailability, getInitials } from '../../../../lib/mentorshipUtils';
import { enqueueSnackbar } from 'notistack';

export default function MentorsPage() {
  const { user, loading: authLoading } = useAuth();
  const [filters, setFilters] = useState({
    search: '',
    expertise: [],
    minExperience: null,
    maxExperience: null,
    availability: 'all'
  });
  const [filteredMentors, setFilteredMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [requestingMentor, setRequestingMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  const { data: mentorsResponse, isLoading, error } = useGetMentors();
  const { data: myRequestsResponse } = useGetMentorshipRequests('mentee');
  const createRequest = useCreateMentorshipRequest();

  const mentors = mentorsResponse?.results || [];
  const myRequests = myRequestsResponse?.results || [];

  useEffect(() => {
    const filtered = filterMentors(mentors, filters);
    setFilteredMentors(filtered);
  }, [mentors, filters]);

  const handleClearFilters = () => {
    setFilters({
      search: '',
      expertise: [],
      minExperience: null,
      maxExperience: null,
      availability: 'all'
    });
  };

  const handleViewProfile = (mentor) => {
    setSelectedMentor(mentor);
    setShowProfileModal(true);
  };

  const getRequestStatus = (mentorId) => {
    const req = myRequests.find(r =>
      (r.mentorUid === mentorId || r.mentorId === mentorId) &&
      ['pending', 'accepted'].includes(r.status?.toLowerCase())
    );
    return req?.status || null;
  };

  const handleRequestMentor = (mentor) => {
    if (!user) {
      enqueueSnackbar('Please sign in to request mentorship', { variant: 'warning' });
      return;
    }
    setRequestingMentor(mentor);
    setRequestMessage('');
  };

  const handleSubmitRequest = async () => {
    if (!requestingMentor) return;
    setSubmittingRequest(true);
    try {
      await createRequest.mutateAsync({
        mentorUid: requestingMentor.uid || requestingMentor.id,
        message: requestMessage,
      });
      enqueueSnackbar('Mentorship request sent! Waiting for mentor to respond.', { variant: 'success' });
      setRequestingMentor(null);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.error || 'Failed to send request', { variant: 'error' });
    } finally {
      setSubmittingRequest(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Error loading mentors: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Find Your Mentor
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with experienced alumni who can guide your career journey
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <MentorFilters
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : filteredMentors.length > 0 ? (
          /* Mentor Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor, index) => {
              const availability = calculateAvailability(mentor);
              const requestStatus = getRequestStatus(mentor.uid || mentor.id);

              return (
                <motion.div
                  key={mentor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700 p-6"
                >
                  {/* Mentor Header */}
                  <div className="flex items-start gap-4 mb-4">
                    {mentor.user?.avatar || mentor.photoURL ? (
                      <img
                        src={mentor.user?.avatar || mentor.photoURL}
                        alt={mentor.user?.firstName}
                        className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 dark:text-gray-300 flex-shrink-0">
                        {getInitials(mentor.user?.firstName, mentor.user?.lastName) ||
                          mentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {mentor.user?.firstName
                          ? `${mentor.user.firstName} ${mentor.user.lastName}`
                          : mentor.name}
                      </h3>
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {mentor.position}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {mentor.company}
                      </p>
                    </div>
                  </div>

                  {/* Availability Badge */}
                  <div className="mb-4">
                    <StatusBadge
                      status={availability.isFull ? 'full' : 'available'}
                      showDot
                    />
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {availability.availableSlots}/{availability.totalCapacity} slots
                    </span>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {mentor.bio || 'No bio provided.'}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(mentor.expertise || mentor.skills || []).slice(0, 3).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {(mentor.expertise || mentor.skills || []).length > 3 && (
                      <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                        +{(mentor.expertise || mentor.skills).length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Experience */}
                  <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {mentor.yearsOfExperience || mentor.experience || 0} years experience
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProfile(mentor)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </button>

                    {requestStatus === 'accepted' ? (
                      <Link href="/portal/mentorship/my-connections" className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Connected
                        </button>
                      </Link>
                    ) : requestStatus === 'pending' ? (
                      <button
                        disabled
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium cursor-not-allowed"
                      >
                        <Loader2 className="w-4 h-4" />
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRequestMentor(mentor)}
                        disabled={availability.isFull || !user}
                        title={!user ? 'Sign in to request mentorship' : availability.isFull ? 'Mentor is at full capacity' : ''}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                        Request
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <EmptyState
            icon={Users}
            title="No mentors found"
            description={
              filters.search || filters.expertise?.length > 0
                ? "Try adjusting your filters to see more results"
                : "Check back later for available mentors!"
            }
            action={
              <Link href="/portal/mentorship/apply-mentor">
                <button className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Apply as Mentor
                </button>
              </Link>
            }
          />
        )}
      </div>

      {/* Mentor Profile Modal */}
      <MentorProfileModal
        mentor={selectedMentor}
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          setSelectedMentor(null);
        }}
      />

      {/* Request Mentorship Modal */}
      <AnimatePresence>
        {requestingMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={(e) => e.target === e.currentTarget && setRequestingMentor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Mentorship</h2>
                <button
                  onClick={() => setRequestingMentor(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-base font-bold text-gray-700 dark:text-gray-300">
                  {getInitials(
                    requestingMentor.user?.firstName,
                    requestingMentor.user?.lastName
                  ) || requestingMentor.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {requestingMentor.user?.firstName
                      ? `${requestingMentor.user.firstName} ${requestingMentor.user.lastName}`
                      : requestingMentor.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{requestingMentor.position}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Introduce yourself (optional)
                </label>
                <textarea
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell the mentor a bit about yourself, your goals, and what you're hoping to learn..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setRequestingMentor(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={submittingRequest}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {submittingRequest ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Request</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
