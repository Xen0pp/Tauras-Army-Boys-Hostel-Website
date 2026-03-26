"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, Target, MessageCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useGetMentors } from '../../../hooks/tanstack/useMentorship';
import { useAuth } from '@/contexts/AuthContext';

export default function MentorshipHub() {
  const { user } = useAuth();
  const { data: mentorsResponse } = useGetMentors();
  
  const [totalMentors, setTotalMentors] = useState(0);

  useEffect(() => {
    if (mentorsResponse?.results) {
      setTotalMentors(mentorsResponse.results.length);
    }
  }, [mentorsResponse]);

  const features = [
    {
      icon: Users,
      title: "Find Your Mentor",
      description: "Connect with experienced alumni who can guide your career journey",
      link: "/portal/mentorship/mentors",
      stats: `${totalMentors} mentor${totalMentors !== 1 ? 's' : ''} available`
    },
    {
      icon: MessageCircle,
      title: "My Connections",
      description: "View your active mentorships and chat with your mentor or mentees",
      link: "/portal/mentorship/my-connections",
      stats: user ? "View your mentorships" : "Sign in to view"
    },
    {
      icon: BookOpen,
      title: "Apply as Mentor",
      description: "Share your expertise and help guide the next generation",
      link: "/portal/mentorship/apply-mentor",
      stats: "Help others grow"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
              Mentorship Hub
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Connect, Learn, and Grow with the Alumni Network
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={feature.link}>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-8 cursor-pointer group hover:-translate-y-1 border border-gray-100 dark:border-gray-700 h-full">
                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-6 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                    <feature.icon className="w-7 h-7 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {feature.stats}
                    </span>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}