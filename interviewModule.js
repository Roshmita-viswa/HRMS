/**
 * Interview Management Module - Core Interview Logic
 * Handles interview scheduling, feedback recording, status updates, and background verification
 */

const db = require('./db');
const emailService = require('./emailService');

// ==================== Interview Scheduling ====================

/**
 * Schedule a new interview
 * @param {object} data - { candidateId, date, time, panel (array of interviewer IDs), round, type, location }
 * @returns {object} Created interview
 */
function scheduleInterview(data) {
  try {
    const {
      candidateId,
      date,
      time,
      panel = [],
      round = 1,
      type = 'technical',
      location = 'virtual'
    } = data;

    if (!candidateId || !date || !time) {
      throw new Error('Candidate ID, date, and time are required');
    }

    const candidate = getCandidateById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Validate panel members exist
    for (const interviewerId of panel) {
      const interviewer = db.data.users.find(u => u.id === interviewerId);
      if (!interviewer) {
        throw new Error(`Interviewer with ID ${interviewerId} not found`);
      }
    }

    const interview = {
      id: db.nextId('interviews'),
      candidateId,
      date,
      time,
      panel,
      round,
      type,
      location,
      status: 'scheduled',
      feedback: null,
      rating: null,
      remarks: '',
      outcome: null,
      scheduledBy: null, // Will be set by the API
      scheduledAt: new Date().toISOString(),
      completedAt: null
    };

    db.data.interviews.push(interview);

    // Update candidate status
    updateCandidateStatus(candidateId, 'interview_scheduled');

    db.write();

    return interview;
  } catch (error) {
    throw new Error(`Failed to schedule interview: ${error.message}`);
  }
}

/**
 * Get interview by ID
 * @param {number} interviewId - Interview ID
 * @returns {object} Interview object
 */
function getInterviewById(interviewId) {
  const interview = db.data.interviews.find(i => i.id === interviewId);
  if (!interview) {
    throw new Error('Interview not found');
  }
  return interview;
}

/**
 * Get interviews for a candidate
 * @param {number} candidateId - Candidate ID
 * @returns {array} Array of interviews
 */
function getInterviewsByCandidate(candidateId) {
  return db.data.interviews.filter(i => i.candidateId === candidateId);
}

/**
 * Get all interviews with optional filters
 * @param {object} filters - { status, date, interviewerId }
 * @returns {array} Filtered interviews
 */
function getInterviews(filters = {}) {
  let interviews = [...db.data.interviews];

  if (filters.status) {
    interviews = interviews.filter(i => i.status === filters.status);
  }

  if (filters.date) {
    interviews = interviews.filter(i => i.date === filters.date);
  }

  if (filters.interviewerId) {
    interviews = interviews.filter(i => i.panel.includes(filters.interviewerId));
  }

  return interviews;
}

/**
 * Update interview details
 * @param {number} interviewId - Interview ID
 * @param {object} updates - Fields to update
 * @returns {object} Updated interview
 */
function updateInterview(interviewId, updates) {
  try {
    const interview = getInterviewById(interviewId);

    const allowedUpdates = ['date', 'time', 'panel', 'type', 'location', 'status'];
    const updatedInterview = { ...interview };

    for (const field of allowedUpdates) {
      if (updates[field] !== undefined) {
        updatedInterview[field] = updates[field];
      }
    }

    // Update the interview in database
    const index = db.data.interviews.findIndex(i => i.id === interviewId);
    db.data.interviews[index] = updatedInterview;

    db.write();

    return updatedInterview;
  } catch (error) {
    throw new Error(`Failed to update interview: ${error.message}`);
  }
}

// ==================== Interview Feedback & Completion ====================

/**
 * Record interview feedback and outcome
 * @param {number} interviewId - Interview ID
 * @param {object} feedback - { rating, remarks, outcome, panelFeedback }
 * @returns {object} Updated interview
 */
function recordInterviewFeedback(interviewId, feedback) {
  try {
    const interview = getInterviewById(interviewId);
    const { rating, remarks, outcome, panelFeedback = [] } = feedback;

    if (interview.status !== 'scheduled') {
      throw new Error('Can only record feedback for scheduled interviews');
    }

    if (rating && (rating < 1 || rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const validOutcomes = ['selected', 'rejected', 'hold', 'next_round'];
    if (outcome && !validOutcomes.includes(outcome)) {
      throw new Error('Invalid outcome. Must be: selected, rejected, hold, or next_round');
    }

    const updatedInterview = {
      ...interview,
      rating: rating || interview.rating,
      remarks: remarks || interview.remarks,
      outcome,
      panelFeedback,
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    // Update in database
    const index = db.data.interviews.findIndex(i => i.id === interviewId);
    db.data.interviews[index] = updatedInterview;

    // Update candidate status based on outcome
    if (outcome) {
      updateCandidateStatus(interview.candidateId, outcome === 'selected' ? 'selected' :
                           outcome === 'rejected' ? 'rejected' :
                           outcome === 'next_round' ? 'interview_scheduled' : 'on_hold');
    }

    db.write();

    return updatedInterview;
  } catch (error) {
    throw new Error(`Failed to record feedback: ${error.message}`);
  }
}

/**
 * Get interview feedback summary
 * @param {number} interviewId - Interview ID
 * @returns {object} Feedback summary
 */
function getInterviewFeedback(interviewId) {
  const interview = getInterviewById(interviewId);

  return {
    interviewId: interview.id,
    candidateId: interview.candidateId,
    rating: interview.rating,
    remarks: interview.remarks,
    outcome: interview.outcome,
    panelFeedback: interview.panelFeedback || [],
    completedAt: interview.completedAt
  };
}

// ==================== Background Verification ====================

/**
 * Initiate background verification
 * @param {number} candidateId - Candidate ID
 * @param {object} data - { type, agency, documents }
 * @returns {object} Created verification record
 */
function initiateBackgroundVerification(candidateId, data) {
  try {
    const candidate = getCandidateById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }

    const verification = {
      id: db.nextId('backgroundVerifications'),
      candidateId,
      type: data.type || 'standard',
      agency: data.agency || null,
      status: 'initiated',
      documents: data.documents || [],
      remarks: '',
      initiatedBy: null, // Will be set by API
      initiatedAt: new Date().toISOString(),
      completedAt: null,
      verifiedBy: null
    };

    db.data.backgroundVerifications.push(verification);

    // Update candidate status
    updateCandidateStatus(candidateId, 'background_verification');

    db.write();

    return verification;
  } catch (error) {
    throw new Error(`Failed to initiate verification: ${error.message}`);
  }
}

/**
 * Update background verification status
 * @param {number} verificationId - Verification ID
 * @param {object} updates - { status, remarks, verifiedBy }
 * @returns {object} Updated verification
 */
function updateBackgroundVerification(verificationId, updates) {
  try {
    const verification = db.data.backgroundVerifications.find(v => v.id === verificationId);
    if (!verification) {
      throw new Error('Background verification not found');
    }

    const { status, remarks, verifiedBy } = updates;
    const validStatuses = ['initiated', 'in_progress', 'completed_passed', 'completed_failed'];

    if (status && !validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    const updatedVerification = {
      ...verification,
      status: status || verification.status,
      remarks: remarks || verification.remarks,
      verifiedBy: verifiedBy || verification.verifiedBy
    };

    if (status === 'completed_passed' || status === 'completed_failed') {
      updatedVerification.completedAt = new Date().toISOString();

      // Update candidate status
      const newStatus = status === 'completed_passed' ? 'verified' : 'verification_failed';
      updateCandidateStatus(verification.candidateId, newStatus);
    }

    // Update in database
    const index = db.data.backgroundVerifications.findIndex(v => v.id === verificationId);
    db.data.backgroundVerifications[index] = updatedVerification;

    db.write();

    return updatedVerification;
  } catch (error) {
    throw new Error(`Failed to update verification: ${error.message}`);
  }
}

/**
 * Get background verifications for candidate
 * @param {number} candidateId - Candidate ID
 * @returns {array} Verification records
 */
function getBackgroundVerifications(candidateId) {
  return db.data.backgroundVerifications.filter(v => v.candidateId === candidateId);
}

// ==================== Dashboard & Analytics ====================

/**
 * Get interview dashboard data
 * @returns {object} Dashboard statistics
 */
function getInterviewDashboard() {
  const interviews = db.data.interviews;
  const candidates = db.data.candidates;

  const totalInterviews = interviews.length;
  const scheduledInterviews = interviews.filter(i => i.status === 'scheduled').length;
  const completedInterviews = interviews.filter(i => i.status === 'completed').length;

  const avgRating = interviews
    .filter(i => i.rating)
    .reduce((sum, i) => sum + i.rating, 0) / interviews.filter(i => i.rating).length || 0;

  const outcomeStats = interviews.reduce((acc, i) => {
    if (i.outcome) {
      acc[i.outcome] = (acc[i.outcome] || 0) + 1;
    }
    return acc;
  }, {});

  const upcomingInterviews = interviews
    .filter(i => i.status === 'scheduled' && new Date(i.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 10);

  return {
    totalInterviews,
    scheduledInterviews,
    completedInterviews,
    averageRating: Math.round(avgRating * 10) / 10,
    outcomeStats,
    upcomingInterviews
  };
}

/**
 * Get background verification dashboard
 * @returns {object} Verification statistics
 */
function getVerificationDashboard() {
  const verifications = db.data.backgroundVerifications;

  const stats = verifications.reduce((acc, v) => {
    acc.total++;
    acc[v.status] = (acc[v.status] || 0) + 1;
    return acc;
  }, { total: 0 });

  return stats;
}

// ==================== Helper Functions ====================

/**
 * Get candidate by ID (helper)
 * @param {number} candidateId - Candidate ID
 * @returns {object} Candidate object
 */
function getCandidateById(candidateId) {
  const candidate = db.data.candidates.find(c => c.id === candidateId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }
  return candidate;
}

/**
 * Update candidate status
 * @param {number} candidateId - Candidate ID
 * @param {string} status - New status
 */
function updateCandidateStatus(candidateId, status) {
  const candidate = getCandidateById(candidateId);
  candidate.status = status;
  db.write();
}

// ==================== Notifications ====================

/**
 * Send interview scheduled notification
 * @param {number} interviewId - Interview ID
 */
async function sendInterviewScheduledNotification(interviewId) {
  try {
    const interview = getInterviewById(interviewId);
    const candidate = getCandidateById(interview.candidateId);

    // Get job posting details
    const posting = db.data.jobPostings.find(p => p.id === candidate.jobPostingId);

    await emailService.sendInterviewScheduled(candidate, posting, interview);
  } catch (error) {
    console.error('Failed to send interview notification:', error);
  }
}

/**
 * Send interview completed notification
 * @param {number} interviewId - Interview ID
 */
async function sendInterviewCompletedNotification(interviewId) {
  try {
    const interview = getInterviewById(interviewId);
    const candidate = getCandidateById(interview.candidateId);

    // Get job posting details
    const posting = db.data.jobPostings.find(p => p.id === candidate.jobPostingId);

    await emailService.sendInterviewCompleted(candidate, posting, interview);
  } catch (error) {
    console.error('Failed to send interview completion notification:', error);
  }
}

module.exports = {
  scheduleInterview,
  getInterviewById,
  getInterviewsByCandidate,
  getInterviews,
  updateInterview,
  recordInterviewFeedback,
  getInterviewFeedback,
  initiateBackgroundVerification,
  updateBackgroundVerification,
  getBackgroundVerifications,
  getInterviewDashboard,
  getVerificationDashboard,
  sendInterviewScheduledNotification,
  sendInterviewCompletedNotification
};