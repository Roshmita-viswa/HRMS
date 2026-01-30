const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'db.json');

let db = {
  data: {
    users: [],
    employees: [],
    departments: [],
    // Recruitment
    jobRequirements: [],
    jobPostings: [],
    candidates: [],
    interviews: [],
    backgroundVerifications: [],
    // Leave & Attendance
    leaveTypes: [],
    leaveRequests: [],
    attendance: [],
    // Engagement
    engagement: [],
    insuranceRecords: [],
    // Exit
    separations: [],
    noDueClearances: [],
    exitDocuments: [],
    // Performance
    performanceReviews: [],
    // Audit
    auditLogs: [],
    // Counters
    _id: {
      users: 0,
      employees: 0,
      jobRequirements: 0,
      jobPostings: 0,
      candidates: 0,
      interviews: 0,
      backgroundVerifications: 0,
      leaveRequests: 0,
      attendance: 0,
      engagement: 0,
      separations: 0,
      performanceReviews: 0,
      auditLogs: 0
    }
  }
};

function read() {
  if (fs.existsSync(file)) {
    try {
      const loadedData = JSON.parse(fs.readFileSync(file, 'utf-8'));
      // Check if this is HRMS data (has users, employees, etc.)
      if (loadedData.users && Array.isArray(loadedData.users) && loadedData._id) {
        db.data = { ...createDefaultSchema(), ...loadedData };
      } else {
        // Different system data, use default HRMS schema
        console.log('Existing db.json is from different system, using default HRMS schema');
        db.data = createDefaultSchema();
      }
    } catch (e) {
      console.error('Error reading db.json:', e);
      db.data = createDefaultSchema();
    }
  } else {
    db.data = createDefaultSchema();
  }
}

function createDefaultSchema() {
  return {
    users: [],
    employees: [],
    departments: [],
    jobRequirements: [],
    jobPostings: [],
    candidates: [],
    interviews: [],
    backgroundVerifications: [],
    leaveTypes: [],
    leaveRequests: [],
    attendance: [],
    engagement: [],
    insuranceRecords: [],
    separations: [],
    noDueClearances: [],
    exitDocuments: [],
    performanceReviews: [],
    auditLogs: [],
    _id: {
      users: 0,
      employees: 0,
      jobRequirements: 0,
      jobPostings: 0,
      candidates: 0,
      interviews: 0,
      backgroundVerifications: 0,
      leaveRequests: 0,
      attendance: 0,
      engagement: 0,
      separations: 0,
      performanceReviews: 0,
      auditLogs: 0
    }
  };
}

function write() {
  fs.writeFileSync(file, JSON.stringify(db.data, null, 2));
}

function nextId(table) {
  db.data._id[table] = (db.data._id[table] || 0) + 1;
  return db.data._id[table];
}

read();

module.exports = { db, write, read, nextId };
