# Interview Management Module

This module provides comprehensive interview scheduling, feedback recording, and background verification functionality for the HRMS system.

## Features

- **Interview Scheduling**: Schedule interviews with date, time, interview panel, and location
- **Feedback Recording**: Record interview remarks, ratings, and outcomes
- **Status Updates**: Automatically update candidate status based on interview outcomes
- **Background Verification**: Track background verification process
- **Dashboard APIs**: Provide statistics and upcoming interviews for dashboard display
- **Email Notifications**: Send notifications for scheduled and completed interviews

## API Endpoints

### Interview Scheduling

**POST /api/interviews**
- Schedule a new interview
- Body: `{ candidateId, date, time, panel: [interviewerIds], round, type, location }`

**GET /api/interviews**
- Get all interviews with optional filters
- Query: `?status=scheduled&date=2024-01-01&interviewerId=1`

**GET /api/interviews/:id**
- Get interview details by ID

**PUT /api/interviews/:id**
- Update interview details

### Interview Feedback

**POST /api/interviews/:id/feedback**
- Record interview feedback and outcome
- Body: `{ rating, remarks, outcome, panelFeedback }`

**GET /api/interviews/:id/feedback**
- Get interview feedback summary

### Background Verification

**POST /api/verifications**
- Initiate background verification
- Body: `{ candidateId, type, agency, documents }`

**PUT /api/verifications/:id**
- Update verification status
- Body: `{ status, remarks, verifiedBy }`

**GET /api/verifications/candidate/:candidateId**
- Get verifications for a candidate

### Dashboard

**GET /api/dashboard/interviews**
- Get interview statistics

**GET /api/dashboard/verifications**
- Get verification statistics

**GET /api/dashboard/upcoming-interviews**
- Get upcoming interviews

## Database Schema

### Interviews Table
- `id`, `candidate_id`, `interview_date`, `interview_time`, `panel` (JSON), `round_number`, `interview_type`, `location`, `feedback`, `rating`, `remarks`, `outcome`, `status`, `scheduled_by`, `scheduled_at`, `completed_at`

### Background Verifications Table
- `id`, `candidate_id`, `verification_type`, `agency`, `status`, `documents` (JSON), `remarks`, `initiated_by`, `initiated_at`, `completed_at`, `verified_by`

## Candidate Status Flow

1. `applied` → `shortlisted` → `interview_scheduled`
2. `interview_scheduled` → `interviewed` → `selected` / `rejected` / `on_hold` / `next_round`
3. `selected` → `background_verification` → `verified` / `verification_failed`
4. `verified` → `joined`

## Email Notifications

- **Interview Scheduled**: Sent when interview is scheduled
- **Interview Completed**: Sent when feedback is recorded with outcome

## Usage Example

```javascript
// Schedule an interview
const interview = await fetch('/api/interviews', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    candidateId: 1,
    date: '2024-01-15',
    time: '10:00',
    panel: [2, 3], // Interviewer IDs
    round: 1,
    type: 'technical',
    location: 'virtual'
  })
});

// Record feedback
await fetch('/api/interviews/1/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rating: 4,
    remarks: 'Good technical skills',
    outcome: 'selected'
  })
});
```</content>
<parameter name="filePath">c:\Users\rosev\HR\INTERVIEW_MODULE_README.md