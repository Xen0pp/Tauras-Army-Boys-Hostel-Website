"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, Award, Clock, Linkedin, Github, Globe, MapPin, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { calculateAvailability, formatMeetingSchedule, canRequestMentorship } from '../../lib/mentorshipUtils';
import { useCreateMentorshipRequest, useGetMentorshipRequests } from '../../hooks/tanstack/useMentorship';
import { useAuth } from '@/contexts/AuthContext';
import { enqueueSnackbar } from 'notistack';

export default function MentorProfileModal({ mentor, isOpen, onClose }) {
    const { user } = useAuth();
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [meetingFrequency, setMeetingFrequency] = useState('bi-weekly');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const createRequest = useCreateMentorshipRequest();
    const { data: requestsResponse } = useGetMentorshipRequests('mentee');
    const existingRequests = requestsResponse?.results || [];

    if (!mentor) return null;

    const availability = calculateAvailability(mentor);
    const requestEligibility = canRequestMentorship(user, mentor, existingRequests);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();

        if (!agreedToTerms) {
            enqueueSnackbar('Please agree to the mentorship terms', { variant: 'warning' });
            return;
        }

        try {
            await createRequest.mutateAsync({
                mentorId: mentor.id,
                topic: meetingFrequency, // Backend expects 'topic' field
                message: requestMessage
            });

            enqueueSnackbar('Mentorship request sent successfully!', { variant: 'success' });
            setShowRequestForm(false);
            setRequestMessage('');
            setAgreedToTerms(false);
            onClose();
        } catch (error) {
            enqueueSnackbar(error.message || 'Failed to send request', { variant: 'error' });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors z-10"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Header */}
                                <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-start gap-6">
                                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700 dark:text-gray-300">
                                            {mentor.user?.firstName?.[0]}{mentor.user?.lastName?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                                {mentor.user?.firstName} {mentor.user?.lastName}
                                            </h2>
                                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-1">
                                                {mentor.position}
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                                                {mentor.company}
                                            </p>
                                            <div className="flex items-center gap-3">
                                                <StatusBadge
                                                    status={availability.isFull ? 'full' : 'available'}
                                                    showDot
                                                />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {availability.availableSlots} of {availability.totalCapacity} slots available
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 space-y-6">
                                    {/* Bio */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            About
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {mentor.bio || 'No bio provided.'}
                                        </p>
                                    </div>

                                    {/* Expertise */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <Award className="w-5 h-5" />
                                            Expertise
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(mentor.expertise || []).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Experience */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Briefcase className="w-5 h-5" />
                                                Experience
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {mentor.yearsOfExperience || mentor.years_experience || 0} years
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                                <Clock className="w-5 h-5" />
                                                Availability
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {formatMeetingSchedule(mentor.availability)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Social Links */}
                                    {(mentor.linkedin_url || mentor.github_url || mentor.portfolio_url) && (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                                Links
                                            </h3>
                                            <div className="flex flex-wrap gap-3">
                                                {mentor.linkedin_url && (
                                                    <a
                                                        href={mentor.linkedin_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                                                    >
                                                        <Linkedin className="w-4 h-4" />
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {mentor.github_url && (
                                                    <a
                                                        href={mentor.github_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        <Github className="w-4 h-4" />
                                                        GitHub
                                                    </a>
                                                )}
                                                {mentor.portfolio_url && (
                                                    <a
                                                        href={mentor.portfolio_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        Portfolio
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Request Form */}
                                    {!showRequestForm ? (
                                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                            {requestEligibility.canRequest ? (
                                                <button
                                                    onClick={() => setShowRequestForm(true)}
                                                    className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                                                >
                                                    Request Mentorship
                                                </button>
                                            ) : (
                                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                                                        {requestEligibility.reason}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <form onSubmit={handleRequestSubmit} className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Request Mentorship
                                            </h3>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Why do you want mentorship from {mentor.user?.firstName}?
                                                </label>
                                                <textarea
                                                    value={requestMessage}
                                                    onChange={(e) => setRequestMessage(e.target.value)}
                                                    rows={4}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    placeholder="Share your goals and what you hope to learn..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Preferred Meeting Frequency
                                                </label>
                                                <select
                                                    value={meetingFrequency}
                                                    onChange={(e) => setMeetingFrequency(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="weekly">Weekly</option>
                                                    <option value="bi-weekly">Bi-weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="flexible">Flexible</option>
                                                </select>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="terms"
                                                    checked={agreedToTerms}
                                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                                    className="mt-1 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                                />
                                                <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300">
                                                    I agree to be respectful, committed, and responsive in this mentorship relationship
                                                </label>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRequestForm(false)}
                                                    className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={createRequest.isPending}
                                                    className="flex-1 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                >
                                                    {createRequest.isPending ? 'Sending...' : 'Send Request'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
