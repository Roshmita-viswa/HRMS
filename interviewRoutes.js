/**
 * Interview Routes - RESTful API Endpoints
 * Handles interview scheduling, feedback, background verification, and dashboard
 */

const express = require('express');
const router = express.Router();
const interviewModule = require('./interviewModule');
const { db } = require('./db');

// ==================== Interview Scheduling Routes ====================

/**
 * POST /api/interviews
 * Schedule a new interview (HR/Admin only)
 * Body: { candidateId, date, time, panel: [interviewerIds], round, type, location }
 */
router.post('/', (req, res) => {
  try {
    const interviewData = {
      ...req.body,
      scheduledBy: req.user.id
    };

    const interview = interviewModule.scheduleInterview(interviewData);

    // Send notification
    interviewModule.sendInterviewScheduledNotification(interview.id);

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/interviews
 * Get all interviews with optional filters
 * Query: ?status=scheduled&date=2024-01-01&interviewerId=1
 */
router.get('/', (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.date) filters.date = req.query.date;
    if (req.query.interviewerId) filters.interviewerId = parseInt(req.query.interviewerId);

    const interviews = interviewModule.getInterviews(filters);

    // Enrich with candidate and interviewer details
    const enrichedInterviews = interviews.map(interview => {
      const candidate = db.data.candidates.find(c => c.id === interview.candidateId);
      const panel = interview.panel.map(id => {
        const user = db.data.users.find(u => u.id === id);
        return user ? { id: user.id, name: user.name } : null;
      }).filter(Boolean);

      return {
        ...interview,
        candidate: candidate ? {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email
        } : null,
        panel
      };
    });

    res.json(enrichedInterviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/interviews/:id
 * Get interview by ID
 */
router.get('/:id', (req, res) => {
  try {
    const interviewId = parseInt(req.params.id);
    const interview = interviewModule.getInterviewById(interviewId);

    // Enrich with details
    const candidate = db.data.candidates.find(c => c.id === interview.candidateId);
    const panel = interview.panel.map(id => {
      const user = db.data.users.find(u => u.id === id);
      return user ? { id: user.id, name: user.name, email: user.email } : null;
    }).filter(Boolean);

    const enrichedInterview = {
      ...interview,
      candidate,
      panel
    };

    res.json(enrichedInterview);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /api/interviews/:id
 * Update interview details
 * Body: { date, time, panel, type, location, status }
 */
router.put('/:id', (req, res) => {
  try {
    const interviewId = parseInt(req.params.id);
    const interview = interviewModule.updateInterview(interviewId, req.body);

    res.json({
      message: 'Interview updated successfully',
      interview
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/interviews/candidate/:candidateId
 * Get interviews for a specific candidate
 */
router.get('/candidate/:candidateId', (req, res) => {
  try {
    const candidateId = parseInt(req.params.candidateId);
    const interviews = interviewModule.getInterviewsByCandidate(candidateId);

    res.json(interviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Interview Feedback Routes ====================

/**
 * POST /api/interviews/:id/feedback
 * Record interview feedback and outcome
 * Body: { rating, remarks, outcome, panelFeedback: [{interviewerId, feedback, rating}] }
 */
router.post('/:id/feedback', (req, res) => {
  try {
    const interviewId = parseInt(req.params.id);
    const feedback = interviewModule.recordInterviewFeedback(interviewId, req.body);

    // Send completion notification
    interviewModule.sendInterviewCompletedNotification(interviewId);

    res.json({
      message: 'Interview feedback recorded successfully',
      feedback
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/interviews/:id/feedback
 * Get interview feedback
 */
router.get('/:id/feedback', (req, res) => {
  try {
    const interviewId = parseInt(req.params.id);
    const feedback = interviewModule.getInterviewFeedback(interviewId);

    res.json(feedback);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// ==================== Background Verification Routes ====================

/**
 * POST /api/verifications
 * Initiate background verification (HR/Admin only)
 * Body: { candidateId, type, agency, documents: [] }
 */
router.post('/verifications', (req, res) => {
  try {
    const verificationData = {
      ...req.body,
      initiatedBy: req.user.id
    };

    const verification = interviewModule.initiateBackgroundVerification(
      verificationData.candidateId,
      verificationData
    );

    res.status(201).json({
      message: 'Background verification initiated',
      verification
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/verifications/:id
 * Update background verification status
 * Body: { status, remarks, verifiedBy }
 */
router.put('/verifications/:id', (req, res) => {
  try {
    const verificationId = parseInt(req.params.id);
    const updates = {
      ...req.body,
      verifiedBy: req.user.id
    };

    const verification = interviewModule.updateBackgroundVerification(verificationId, updates);

    res.json({
      message: 'Background verification updated',
      verification
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/verifications/candidate/:candidateId
 * Get background verifications for a candidate
 */
router.get('/verifications/candidate/:candidateId', (req, res) => {
  try {
    const candidateId = parseInt(req.params.candidateId);
    const verifications = interviewModule.getBackgroundVerifications(candidateId);

    res.json(verifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/verifications
 * Get all background verifications
 */
router.get('/verifications', (req, res) => {
  try {
    const verifications = db.data.backgroundVerifications;

    // Enrich with candidate details
    const enrichedVerifications = verifications.map(verification => {
      const candidate = db.data.candidates.find(c => c.id === verification.candidateId);
      return {
        ...verification,
        candidate: candidate ? {
          id: candidate.id,
          name: candidate.name,
          email: candidate.email
        } : null
      };
    });

    res.json(enrichedVerifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== Dashboard Routes ====================

/**
 * GET /api/dashboard/interviews
 * Get interview dashboard statistics
 */
router.get('/dashboard/interviews', (req, res) => {
  try {
    const dashboard = interviewModule.getInterviewDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dashboard/verifications
 * Get background verification dashboard statistics
 */
router.get('/dashboard/verifications', (req, res) => {
  try {
    const dashboard = interviewModule.getVerificationDashboard();
    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/dashboard/upcoming-interviews
 * Get upcoming interviews for dashboard
 */
router.get('/dashboard/upcoming-interviews', (req, res) => {
  try {
    const interviews = interviewModule.getInterviews({ status: 'scheduled' });
    const upcoming = interviews
      .filter(i => new Date(i.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 20)
      .map(interview => {
        const candidate = db.data.candidates.find(c => c.id === interview.candidateId);
        const posting = candidate ? db.data.jobPostings.find(p => p.id === candidate.jobPostingId) : null;

        return {
          id: interview.id,
          date: interview.date,
          time: interview.time,
          candidate: candidate ? candidate.name : 'Unknown',
          position: posting ? posting.title : 'Unknown',
          type: interview.type,
          location: interview.location
        };
      });

    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;