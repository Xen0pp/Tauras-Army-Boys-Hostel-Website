"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, Briefcase, Award, Clock, Link as LinkIcon, 
  Plus, X, CheckCircle, ArrowLeft, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useApplyAsMentor } from '../../../../hooks/tanstack/useMentorship';
import { validateMentorApplication } from '../../../../lib/mentorshipUtils';
import { enqueueSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

const EXPERTISE_OPTIONS = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design',
  'Product Management', 'Digital Marketing', 'Business Development',
  'Entrepreneurship', 'Finance', 'Consulting'
];

const WEEKDAY_OPTIONS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const TIME_OPTIONS = [
  'Morning (9 AM - 12 PM)', 
  'Afternoon (12 PM - 5 PM)', 
  'Evening (5 PM - 8 PM)', 
  'Flexible'
];

export default function ApplyMentorPage() {
  const { user, getAuthToken } = useAuth();
  const [mentorStatus, setMentorStatus] = useState(null); // null | 'approved' | 'pending'
  const [statusLoading, setStatusLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    expertise_areas: [],
    years_experience: '',
    current_company: '',
    current_position: '',
    mentoring_capacity: 3,
    bio: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    availability: {
      weekdays: [],
      preferred_time: ''
    }
  });

  const [newExpertise, setNewExpertise] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const applyMutation = useApplyAsMentor();

  // Check if user already has an approved or pending mentor profile
  useEffect(() => {
    if (!user) { setStatusLoading(false); return; }
    const check = async () => {
      try {
        const token = await getAuthToken();
        // Check approved mentors collection
        const [approvedRes, pendingRes] = await Promise.allSettled([
          axios.get(`/api/mentorship/mentors/me`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/api/mentorship/applications/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (approvedRes.status === 'fulfilled' && approvedRes.value?.data?.exists) {
          setMentorStatus('approved');
        } else if (pendingRes.status === 'fulfilled' && pendingRes.value?.data?.exists) {
          setMentorStatus('pending');
        }
      } catch {
        // Silently fail — show the form
      } finally {
        setStatusLoading(false);
      }
    };
    check();
  }, [user, getAuthToken]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAvailabilityChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [field]: value
      }
    }));
  };

  const toggleWeekday = (day) => {
    const current = formData.availability.weekdays;
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day];
    handleAvailabilityChange('weekdays', updated);
  };

  const addExpertise = (expertise) => {
    if (expertise && !formData.expertise_areas.includes(expertise)) {
      setFormData(prev => ({
        ...prev,
        expertise_areas: [...prev.expertise_areas, expertise]
      }));
      setNewExpertise('');
    }
  };

  const removeExpertise = (expertise) => {
    setFormData(prev => ({
      ...prev,
      expertise_areas: prev.expertise_areas.filter(item => item !== expertise)
    }));
    // Clear error when user removes expertise
    if (errors.expertise_areas) {
      setErrors(prev => ({
        ...prev,
        expertise_areas: ''
      }));
    }
  };

  // Step validation functions
  const validateStep1 = () => {
    const stepErrors = {};
    
    if (!formData.current_company.trim()) {
      stepErrors.current_company = 'Current company is required';
    }
    if (!formData.current_position.trim()) {
      stepErrors.current_position = 'Current position is required';
    }
    if (!formData.years_experience || formData.years_experience < 1) {
      stepErrors.years_experience = 'Years of experience must be at least 1';
    }
    
    return stepErrors;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    
    if (formData.expertise_areas.length === 0) {
      stepErrors.expertise_areas = 'Please select at least one expertise area';
    }
    
    return stepErrors;
  };

  const validateStep3 = () => {
    const stepErrors = {};
    
    if (!formData.bio.trim()) {
      stepErrors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 50) {
      stepErrors.bio = `Bio must be at least 50 characters (currently ${formData.bio.trim().length})`;
    }
    
    return stepErrors;
  };

  const validateStep4 = () => {
    const stepErrors = {};
    
    if (!formData.linkedin_url) {
        stepErrors.linkedin_url = 'LinkedIn URL is required';
    } else if (!formData.linkedin_url.includes('linkedin.com')) {
      stepErrors.linkedin_url = 'Please enter a valid LinkedIn URL';
    }
    
    return stepErrors;
  };

  const handleNext = () => {
    let stepErrors = {};
    
    // Validate current step before proceeding
    switch (currentStep) {
      case 1:
        stepErrors = validateStep1();
        break;
      case 2:
        stepErrors = validateStep2();
        break;
      case 3:
        stepErrors = validateStep3();
        break;
      case 4:
        stepErrors = validateStep4();
        break;
    }
    
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      enqueueSnackbar('Please fill in all required fields', { variant: 'warning' });
      return;
    }
    
    // Clear errors and proceed
    setErrors({});
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setErrors({});
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all steps
    const allErrors = {
      ...validateStep1(),
      ...validateStep2(),
      ...validateStep3(),
      ...validateStep4()
    };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      enqueueSnackbar('Please fix the errors in the form', { variant: 'error' });
      
      // Navigate to first step with errors
      if (allErrors.current_company || allErrors.current_position || allErrors.years_experience) {
        setCurrentStep(1);
      } else if (allErrors.expertise_areas) {
        setCurrentStep(2);
      } else if (allErrors.bio) {
        setCurrentStep(3);
      } else if (allErrors.linkedin_url) {
        setCurrentStep(4);
      }
      return;
    }


    try {
      await applyMutation.mutateAsync(formData);
      setSubmitted(true);
      enqueueSnackbar('Application submitted successfully!', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to submit application', { variant: 'error' });
    }
  };

  // Loading status check
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Already an approved mentor
  if (mentorStatus === 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You're a Mentor!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your mentor profile is active. You can manage your requests from My Connections.
          </p>
          <Link href="/portal/mentorship/my-connections">
            <button className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Go to My Connections
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // Application pending review
  if (mentorStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Application Pending</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your mentor application is currently under review. We'll notify you once an admin has reviewed it — usually within 2–3 business days.
          </p>
          <Link href="/portal/mentorship">
            <button className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Back to Mentorship Hub
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Application Submitted!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Thank you for applying to become a mentor. Our admin team will review your application and get back to you within 2-3 business days.
          </p>
          <Link href="/portal/mentorship">
            <button className="w-full py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
              Back to Mentorship Hub
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/portal/mentorship">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Become a Mentor
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Share your expertise and help students achieve their goals
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${
                  step <= currentStep 
                    ? 'bg-gray-900 dark:bg-gray-100' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Professional Information */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Professional Information
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Company *
                  </label>
                  <input
                    type="text"
                    value={formData.current_company}
                    onChange={(e) => handleInputChange('current_company', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.current_company ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                  />
                  {errors.current_company && (
                    <p className="text-red-500 text-sm mt-1">{errors.current_company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Position *
                  </label>
                  <input
                    type="text"
                    value={formData.current_position}
                    onChange={(e) => handleInputChange('current_position', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.current_position ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Senior Software Engineer"
                  />
                  {errors.current_position && (
                    <p className="text-red-500 text-sm mt-1">{errors.current_position}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Years of Experience *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.years_experience}
                    onChange={(e) => handleInputChange('years_experience', parseInt(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.years_experience ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="5"
                  />
                  {errors.years_experience && (
                    <p className="text-red-500 text-sm mt-1">{errors.years_experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mentoring Capacity
                  </label>
                  <select
                    value={formData.mentoring_capacity}
                    onChange={(e) => handleInputChange('mentoring_capacity', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num} mentee{num > 1 ? 's' : ''} at a time</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Expertise Areas */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Expertise Areas
                </h2>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Add your areas of expertise *
                </label>
                <div className="flex gap-2">
                  <select
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select an expertise area</option>
                    {EXPERTISE_OPTIONS.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => addExpertise(newExpertise)}
                    className="px-4 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {errors.expertise_areas && (
                  <p className="text-red-500 text-sm mt-1">{errors.expertise_areas}</p>
                )}
              </div>

              {formData.expertise_areas.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.expertise_areas.map((expertise, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                    >
                      {expertise}
                      <button
                        type="button"
                        onClick={() => removeExpertise(expertise)}
                        className="hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: About You */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  About You
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio & Mentoring Philosophy *
                </label>
                <textarea
                  rows={6}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.bio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Tell us about your background, experience, and what motivates you to mentor students..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.bio && (
                    <p className="text-red-500 text-sm">{errors.bio}</p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.bio.length}/50 minimum
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Availability
                </label>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preferred Days</p>
                    <div className="flex flex-wrap gap-2">
                      {WEEKDAY_OPTIONS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleWeekday(day)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.availability.weekdays.includes(day)
                              ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preferred Time</p>
                    <select
                      value={formData.availability.preferred_time}
                      onChange={(e) => handleAvailabilityChange('preferred_time', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select preferred time</option>
                      {TIME_OPTIONS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Professional Links */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <LinkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Professional Links
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      errors.linkedin_url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedin_url && (
                    <p className="text-red-500 text-sm mt-1">{errors.linkedin_url}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GitHub Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => handleInputChange('github_url', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Portfolio/Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio_url}
                    onChange={(e) => handleInputChange('portfolio_url', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-4">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevious}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Previous
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={applyMutation.isPending}
                className="px-8 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {applyMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
