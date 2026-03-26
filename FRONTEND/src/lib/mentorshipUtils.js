// Mentorship utility functions

/**
 * Calculate mentor availability based on capacity and active mentees
 */
export const calculateAvailability = (mentor) => {
  const capacity = mentor?.mentoring_capacity || mentor?.mentoringCapacity || 3;
  const activeMentees = mentor?.active_mentees_count || mentor?.activeMenteesCount || 0;
  
  return {
    isFull: activeMentees >= capacity,
    availableSlots: Math.max(0, capacity - activeMentees),
    capacityPercentage: capacity > 0 ? (activeMentees / capacity) * 100 : 0,
    totalCapacity: capacity,
    activeMentees: activeMentees
  };
};

/**
 * Check if a user can request mentorship from a specific mentor
 */
export const canRequestMentorship = (user, mentor, existingRequests = []) => {
  if (!user || !mentor) return { canRequest: false, reason: 'Invalid user or mentor' };
  
  // Check if user is trying to mentor themselves
  // Compare the logged-in user's ID with the mentor's associated user ID
  const mentorUserId = mentor.user?.id || mentor.userId || mentor.user_id;
  if (user.id === mentorUserId) {
    return { canRequest: false, reason: 'Cannot request mentorship from yourself!' };
  }
  
  // Check if mentor is full
  const availability = calculateAvailability(mentor);
  if (availability.isFull) {
    return { canRequest: false, reason: 'Mentor has reached capacity' };
  }
  
  // Check for existing pending or active requests
  const hasPendingRequest = existingRequests.some(
    req => 
      (req.mentor_id === mentor.id || req.mentorId === mentor.id || req.mentor === mentor.id) && 
      ['pending', 'accepted', 'active'].includes(req.status?.toLowerCase())
  );
  
  if (hasPendingRequest) {
    return { canRequest: false, reason: 'You already have a pending or active request with this mentor' };
  }
  
  return { canRequest: true, reason: null };
};

/**
 * Get mentorship status display information
 */
export const getMentorshipStatus = (request) => {
  const status = request?.status?.toLowerCase() || 'pending';
  
  const statusMap = {
    pending: { label: 'Pending', color: 'yellow' },
    accepted: { label: 'Active', color: 'green' },
    active: { label: 'Active', color: 'green' },
    declined: { label: 'Declined', color: 'red' },
    cancelled: { label: 'Cancelled', color: 'gray' },
    completed: { label: 'Completed', color: 'blue' }
  };
  
  return statusMap[status] || statusMap.pending;
};

/**
 * Filter mentors based on search criteria
 */
export const filterMentors = (mentors, filters) => {
  if (!mentors || !Array.isArray(mentors)) return [];
  
  return mentors.filter(mentor => {
    // Search filter (name, company, position)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = `${mentor.user?.firstName || ''} ${mentor.user?.lastName || ''}`.toLowerCase();
      const company = (mentor.company || '').toLowerCase();
      const position = (mentor.position || '').toLowerCase();
      
      const matchesSearch = 
        fullName.includes(searchLower) ||
        company.includes(searchLower) ||
        position.includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Expertise filter
    if (filters.expertise && filters.expertise.length > 0) {
      const mentorExpertise = mentor.expertise || [];
      const hasMatchingExpertise = filters.expertise.some(exp => 
        mentorExpertise.some(me => me.toLowerCase().includes(exp.toLowerCase()))
      );
      if (!hasMatchingExpertise) return false;
    }
    
    // Years of experience filter
    if (filters.minExperience !== undefined || filters.maxExperience !== undefined) {
      const years = mentor.yearsOfExperience || mentor.years_experience || 0;
      if (filters.minExperience && years < filters.minExperience) return false;
      if (filters.maxExperience && years > filters.maxExperience) return false;
    }
    
    // Availability filter
    if (filters.availability !== undefined && filters.availability !== 'all') {
      const { isFull } = calculateAvailability(mentor);
      if (filters.availability === 'available' && isFull) return false;
      if (filters.availability === 'full' && !isFull) return false;
    }
    
    return true;
  });
};

/**
 * Format meeting schedule for display
 */
export const formatMeetingSchedule = (availability) => {
  if (!availability) return 'Not specified';
  
  const { weekdays, preferred_time, preferredTime } = availability;
  const days = weekdays || [];
  const time = preferred_time || preferredTime || '';
  
  if (days.length === 0 && !time) return 'Flexible';
  
  const dayStr = days.length > 0 ? days.join(', ') : 'Any day';
  const timeStr = time || 'Flexible timing';
  
  return `${dayStr} - ${timeStr}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now - date;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

/**
 * Get initials from name
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}` || '?';
};

/**
 * Validate mentor application data
 */
export const validateMentorApplication = (formData) => {
  const errors = {};
  
  if (!formData.current_company?.trim()) {
    errors.current_company = 'Company name is required';
  }
  
  if (!formData.current_position?.trim()) {
    errors.current_position = 'Position is required';
  }
  
  if (!formData.years_experience || formData.years_experience < 1) {
    errors.years_experience = 'Please enter valid years of experience (minimum 1)';
  }
  
  if (!formData.expertise_areas || formData.expertise_areas.length === 0) {
    errors.expertise_areas = 'Please select at least one expertise area';
  }
  
  if (!formData.bio?.trim() || formData.bio.length < 50) {
    errors.bio = 'Bio must be at least 50 characters';
  }
  
  if (!formData.linkedin_url?.trim()) {
      errors.linkedin_url = 'LinkedIn URL is required';
  } else if (!formData.linkedin_url.includes('linkedin.com')) {
    errors.linkedin_url = 'Please enter a valid LinkedIn URL';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
