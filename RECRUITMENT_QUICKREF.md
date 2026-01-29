# Recruitment Module - Quick Reference Guide

## 📦 What's Included

### 1. **recruitmentModule.js** (450+ lines)
Core recruitment business logic including:
- Job requirement creation and approval workflow
- Job posting management from requirements
- Candidate application processing
- Resume file validation
- Status tracking and workflow management
- Automated interview scheduling
- Recruitment analytics and reporting

### 2. **emailService.js** (500+ lines)
Automated email notification system:
- HTML email templates for 6 different scenarios
- Application confirmation emails
- Status change notifications (shortlist, select, reject)
- Interview scheduling emails
- Job posting notifications
- Bulk email operations
- Email sending logs and audit trail
- SMTP configuration and verification

### 3. **recruitmentRoutes.js** (400+ lines)
RESTful API endpoints (25+ routes):
- Job requirement CRUD operations
- Job posting management
- Candidate application submission
- Resume file upload (with validation)
- Candidate status updates with email notifications
- Interview scheduling
- Bulk candidate operations
- Recruitment analytics
- Email configuration testing

### 4. **RECRUITMENT.md** (400+ lines)
Complete documentation covering:
- Database schema design
- API endpoint reference
- Request/response examples
- Email notification workflows
- Validation rules
- Error handling
- Best practices
- Integration guidelines

---

## 🎯 Key Features

### Job Management
✅ Create job requirements with approval workflow  
✅ Generate job postings from approved requirements  
✅ Track job posting status (open, closed, filled)  
✅ Dashboard with posting statistics  

### Candidate Management
✅ Submit job applications with resume upload  
✅ Track candidate status through hiring pipeline  
✅ Add interview records with ratings/feedback  
✅ Candidate ratings and ranking system  
✅ Bulk candidate operations (status updates)  

### Resume Handling
✅ Secure file upload with validation  
✅ Support for PDF, DOC, DOCX, TXT formats  
✅ 5MB file size limit  
✅ Unique filename generation  
✅ Secure download endpoint  

### Candidate Status Tracking
```
APPLIED → SHORTLISTED → INTERVIEWED → SELECTED
   ↓
   └──────────────────→ REJECTED (at any stage)
```

### Automated Email Notifications
✅ Application confirmation  
✅ Shortlisted notification  
✅ Interview scheduled email  
✅ Selection congratulations  
✅ Rejection with optional feedback  
✅ Job posting announcements  
✅ Bulk status update emails  

### Analytics & Reporting
✅ Recruitment dashboard statistics  
✅ Candidate conversion rates  
✅ Top candidate rankings  
✅ Email communication logs  
✅ Status change audit trail  

---

## 📊 Database Schema

### 5 Main Collections

```
jobRequirements
├── id, title, department, budget, description
├── status: pending | approved | rejected | closed
└── approval tracking

jobPostings
├── id, requirementId, title, location
├── status: open | closed | filled
└── applicant tracking

candidates
├── id, jobPostingId, candidateName, email
├── status: applied | shortlisted | interviewed | selected | rejected
├── resume filename
├── interviews (array)
├── ratings/feedback
└── notes

emailLogs
├── id, candidateId, emailType, messageId
└── status: sent | failed

statusChangeLogs
├── id, candidateId, oldStatus, newStatus
└── audit trail
```

---

## 🔗 API Endpoints (25+)

### Job Requirements (5 endpoints)
```
POST   /api/recruitment/requirements              Create requirement
GET    /api/recruitment/requirements              List requirements
GET    /api/recruitment/requirements/:id          Get details
PUT    /api/recruitment/requirements/:id/approve  Approve
PUT    /api/recruitment/requirements/:id/reject   Reject
```

### Job Postings (4 endpoints)
```
POST   /api/recruitment/postings                  Create posting
GET    /api/recruitment/postings                  List postings
GET    /api/recruitment/postings/:id              Get details
PUT    /api/recruitment/postings/:id/status       Update status
```

### Candidates (7 endpoints)
```
POST   /api/recruitment/apply                     Submit application
GET    /api/recruitment/candidates                List candidates
GET    /api/recruitment/candidates/:id            Get details
GET    /api/recruitment/candidates/posting/:id    By posting
PUT    /api/recruitment/candidates/:id/status     Update status
POST   /api/recruitment/candidates/:id/interview  Add interview
GET    /api/recruitment/resume/:filename          Download resume
```

### Bulk Operations (1 endpoint)
```
POST   /api/recruitment/bulk-update               Bulk status update
```

### Analytics (3 endpoints)
```
GET    /api/recruitment/stats                     Dashboard stats
GET    /api/recruitment/top-candidates            Top rated
GET    /api/recruitment/email-logs/:id            Email history
```

### Email (2 endpoints)
```
POST   /api/recruitment/email/verify              Check config
POST   /api/recruitment/email/test                Send test email
```

---

## 🚀 Quick Start

### 1. Integration
Add to `server.js`:
```javascript
const recruitmentRoutes = require('./recruitmentRoutes');
app.use('/api/recruitment', recruitmentRoutes);
```

### 2. Create Job Requirement
```bash
curl -X POST http://localhost:3000/api/recruitment/requirements \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "department": "Engineering",
    "budget": 150000,
    "description": "Experienced developer needed",
    "positions": 2
  }'
```

### 3. Approve & Create Job Posting
```bash
# Approve requirement
curl -X PUT http://localhost:3000/api/recruitment/requirements/1/approve

# Create posting from requirement
curl -X POST http://localhost:3000/api/recruitment/postings \
  -H "Content-Type: application/json" \
  -d '{
    "requirementId": 1,
    "title": "Senior Developer",
    "description": "Job details...",
    "location": "New York, NY",
    "salaryRange": {"min": 120000, "max": 150000}
  }'
```

### 4. Receive Application
```bash
curl -X POST http://localhost:3000/api/recruitment/apply \
  -F "jobPostingId=1" \
  -F "candidateName=John Smith" \
  -F "email=john@example.com" \
  -F "phone=555-1234" \
  -F "experience=8 years" \
  -F "skills=JavaScript,Node.js,React" \
  -F "resume=@resume.pdf"
```

### 5. Update Candidate Status (with auto email)
```bash
curl -X PUT http://localhost:3000/api/recruitment/candidates/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shortlisted",
    "notes": "Great background, schedule interview"
  }'
```

### 6. Schedule Interview (with auto email)
```bash
curl -X POST http://localhost:3000/api/recruitment/candidates/1/interview \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-02-05T14:00:00Z",
    "interviewer": "Sarah Johnson",
    "rating": 4.5,
    "feedback": "Excellent skills",
    "location": "NYC Office"
  }'
```

### 7. View Statistics
```bash
curl http://localhost:3000/api/recruitment/stats
```

---

## 📧 Email Configuration

### Environment Variables
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SECURE=false
COMPANY_NAME=Your Company
COMPANY_WEBSITE=https://yourcompany.com
```

### Test Email Configuration
```bash
# Verify SMTP connection
curl -X POST http://localhost:3000/api/recruitment/email/verify

# Send test email
curl -X POST http://localhost:3000/api/recruitment/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 🔐 File Upload Security

- **Location:** `uploads/resumes/` directory
- **File Types:** PDF, DOC, DOCX, TXT only
- **Max Size:** 5MB per file
- **Naming:** Auto-generated with timestamp (prevents overwrites)
- **Access Control:** Via API endpoint only
- **Validation:** MIME type + extension check

---

## 📈 Analytics Available

### Dashboard Statistics
```javascript
{
  requirements: { total, pending, approved, rejected, closed },
  postings: { total, open, closed, filled },
  candidates: { total, applied, shortlisted, interviewed, selected, rejected },
  conversionRate: "percentage of selected / total"
}
```

### Top Candidates
Ranked by average interview rating

### Email Communication History
All emails sent to each candidate with status (sent/failed)

---

## ✅ Validation Rules

### Job Requirement
- Title: Required
- Department: Required
- Budget: Required, must be > 0
- Positions: Optional (default 1), must be > 0
- Status: Must be pending before posting creation

### Application
- Job Posting: Must exist and be open
- Name & Email: Required
- Resume: PDF/DOC/DOCX/TXT, max 5MB
- Skills: Can be array or comma-separated
- Duplicate Check: One app per email per posting

### Interview
- Date: Required, valid timestamp
- Interviewer: Required
- Rating: Optional, 1-5 scale
- Feedback: Optional text

---

## 🔄 Email Automation Workflow

```
Application Submitted
    ↓
Send Confirmation Email
    ↓
Mark as Shortlisted
    ↓
Send Shortlisted Notification
    ↓
Schedule Interview
    ↓
Send Interview Details Email
    ↓
(Mark as Interviewed)
    ↓
    ├─→ Mark as Selected → Send Selection Email
    │
    └─→ Reject → Send Rejection Email
```

---

## 🐛 Error Handling

### Common Errors

| Scenario | Error Code | Solution |
|----------|-----------|----------|
| Requirement not approved | 400 | Approve via `/approve` endpoint first |
| Duplicate application | 400 | Candidate can only apply once |
| Invalid resume | 400 | Use PDF, DOC, DOCX, or TXT (max 5MB) |
| Email send failed | 500 | Check SMTP credentials |
| Candidate not found | 404 | Verify candidate ID |

---

## 🔧 Troubleshooting

### Email Not Sending
```bash
# Verify configuration
curl -X POST http://localhost:3000/api/recruitment/email/verify

# Check logs
curl http://localhost:3000/api/recruitment/email-logs/1
```

### Resume Upload Issues
- Check file type (must be PDF/DOC/DOCX/TXT)
- Verify file size < 5MB
- Ensure `uploads/resumes/` directory exists

### Missing Candidates
- Verify job posting is open
- Check for duplicate applications
- Ensure applicant met all requirements

---

## 📚 Full Documentation

See **RECRUITMENT.md** for:
- Complete API reference
- All request/response examples
- Database schema details
- Email template examples
- Integration guidelines
- Best practices

---

## 🎓 Frontend Integration Example

```javascript
// Apply for job with resume
const formData = new FormData();
formData.append('jobPostingId', '1');
formData.append('candidateName', 'John Smith');
formData.append('email', 'john@example.com');
formData.append('resume', fileInput.files[0]);

const response = await fetch('/api/recruitment/apply', {
  method: 'POST',
  body: formData
});

// Update candidate status
const response = await fetch('/api/recruitment/candidates/1/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'shortlisted',
    notes: 'Great candidate'
  })
});
```

---

**Version:** 1.0.0  
**Last Updated:** January 29, 2026  
**Status:** Production Ready ✅  
**GitHub:** https://github.com/Roshmita-viswa/HRMS
