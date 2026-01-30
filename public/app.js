// Smart HRMS - JavaScript Application
// ============================================

// API Configuration
const API_BASE = 'http://localhost:3000/api';
let currentUser = null;
let selectedRole = localStorage.getItem('selectedRole') || 'ADMIN'; // Default role

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  checkAuth();
  setupPageNavigation();
  initializeRoleSelection();
});

function setupEventListeners() {
  document.getElementById('userBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    document.getElementById('userDropdown').classList.remove('show');
  });

  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabs = e.target.parentElement.querySelectorAll('.tab-btn');
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Role selection
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      selectedRole = e.currentTarget.dataset.role;
      localStorage.setItem('selectedRole', selectedRole);
    });
  });

  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    try {
      await login(selectedRole);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

function setupPageNavigation() {
  document.querySelectorAll('.menu-link, .nav-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = e.target.getAttribute('href');
      if (href && href !== '#logout' && href !== '#profile' && href !== '#settings') {
        e.preventDefault();
        const pageId = href.substring(1);
        showPage(pageId);
      }
    });
  });
}

// ==================== AUTHENTICATION ====================
function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    // Auto-login as admin for demo
    login('ADMIN');
  } else {
    hideLoginModal();
    loadDashboard();
  }
}

async function login(role) {
  try {
    // Create dummy user based on selected role
    const dummyUsers = {
      'ADMIN': {
        id: 1,
        name: 'System Administrator',
        email: 'admin@hrms.com',
        role: 'ADMIN'
      },
      'HR': {
        id: 2,
        name: 'HR Manager',
        email: 'hr@hrms.com',
        role: 'HR'
      },
      'MANAGER': {
        id: 3,
        name: 'Department Manager',
        email: 'manager@hrms.com',
        role: 'MANAGER'
      },
      'EMPLOYEE': {
        id: 4,
        name: 'John Employee',
        email: 'john@hrms.com',
        role: 'EMPLOYEE'
      }
    };

    const user = dummyUsers[role];
    if (!user) {
      alert('Invalid role selected');
      return;
    }

    // Create a dummy token
    const dummyToken = btoa(JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      iat: Date.now(),
      exp: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
    }));

    // Store dummy token and user
    localStorage.setItem('token', dummyToken);
    currentUser = user;

    hideLoginModal();
    updateUserDisplay();
    loadDashboard();

  } catch (e) {
    console.error('Login error:', e);
    alert('Login error: ' + e.message);
  }
}

function showLoginModal() {
  document.getElementById('loginModal').style.display = 'flex';
  document.getElementById('app').classList.remove('logged-in');
}

function hideLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
  document.getElementById('app').classList.add('logged-in');
}

function updateUserDisplay() {
  if (currentUser) {
    const userBtn = document.getElementById('userBtn');
    userBtn.innerHTML = `👤 ${currentUser.name} (${currentUser.role})`;
    updateMenuVisibility();
  }
}

function initializeRoleSelection() {
  // Set the active role tab based on stored preference
  const activeTab = document.querySelector(`.role-tab[data-role="${selectedRole}"]`);
  if (activeTab) {
    document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
    activeTab.classList.add('active');
  }
}

// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  document.querySelectorAll('.menu-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + pageId) {
      link.classList.add('active');
    }
  });

  // Load page data
  if (pageId === 'dashboard') loadDashboard();
  else if (pageId === 'employees') loadEmployees();
  else if (pageId === 'recruitment') loadRecruitment();
  else if (pageId === 'leave') loadLeaveData();
  else if (pageId === 'engagement') loadEngagement();
  else if (pageId === 'exit') loadExitData();
  else if (pageId === 'analytics') loadAnalytics();
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
  try {
    // Use dummy data instead of API call
    const stats = {
      totalEmployees: 45,
      activeEmployees: 42,
      openPositions: 8,
      attritionRate: '6.7%',
      pendingApprovals: 12,
      separations: 3
    };

    document.getElementById('totalEmployees').textContent = stats.totalEmployees;
    document.getElementById('activeEmployees').textContent = stats.activeEmployees;
    document.getElementById('openPositions').textContent = stats.openPositions;
    document.getElementById('attritionRate').textContent = stats.attritionRate;
    document.getElementById('pendingApprovals').textContent = stats.pendingApprovals;
    document.getElementById('separations').textContent = stats.separations;

    // Update dashboard title based on role
    updateDashboardTitle();

    // Load dummy charts
    loadDummyCharts();
  } catch (e) {
    console.error('Dashboard load error:', e);
  }
}

function loadDummyCharts() {
  // Dummy headcount chart
  const headcountChart = document.getElementById('headcountChart');
  headcountChart.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #666;">
      <div style="margin-bottom: 10px;">📊 Headcount by Department</div>
      <div style="font-size: 24px; margin: 10px 0;">IT: 15 | HR: 8 | Finance: 6 | Sales: 12</div>
      <div style="font-size: 14px;">Demo data - Interactive charts would be implemented here</div>
    </div>
  `;

  // Dummy salary chart
  const salaryChart = document.getElementById('salaryChart');
  salaryChart.innerHTML = `
    <div style="padding: 20px; text-align: center; color: #666;">
      <div style="margin-bottom: 10px;">💰 Salary Distribution</div>
      <div style="font-size: 24px; margin: 10px 0;">₹3-5L: 20 | ₹5-8L: 15 | ₹8-12L: 8 | ₹12L+: 2</div>
      <div style="font-size: 14px;">Demo data - Salary distribution visualization</div>
    </div>
  `;
}

function updateDashboardTitle() {
  const titleElement = document.querySelector('#dashboard h1');
  const subtitleElement = document.querySelector('#dashboard .page-header p');

  if (titleElement && subtitleElement && currentUser) {
    const roleContent = {
      'ADMIN': {
        title: 'System Administration Dashboard',
        subtitle: 'Manage system-wide operations, users, and oversee all HR activities.'
      },
      'HR': {
        title: 'HR Management Dashboard',
        subtitle: 'Oversee recruitment, employee management, and HR operations.'
      },
      'MANAGER': {
        title: 'Team Management Dashboard',
        subtitle: 'Manage your team, approve requests, and track performance.'
      },
      'EMPLOYEE': {
        title: 'Employee Portal',
        subtitle: 'Access your personal information, submit requests, and track your progress.'
      }
    };

    const content = roleContent[currentUser.role] || {
      title: 'Dashboard',
      subtitle: 'Welcome back! Here\'s an overview of your HR metrics.'
    };

    titleElement.textContent = content.title;
    subtitleElement.textContent = content.subtitle;
  }
}

async function loadHeadcountChart() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/headcount`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    displayHeadcountChart(data);
  } catch (e) {
    console.error('Headcount chart error:', e);
  }
}

async function loadSalaryChart() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/salary-distribution`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await response.json();
    displaySalaryChart(data);
  } catch (e) {
    console.error('Salary chart error:', e);
  }
}

function displayHeadcountChart(data) {
  const chart = document.getElementById('headcountChart');
  chart.innerHTML = '';
  const maxValue = Math.max(...Object.values(data), 1);
  
  Object.entries(data).forEach(([dept, count]) => {
    const bar = document.createElement('div');
    bar.style.cssText = `
      flex: 1;
      background: linear-gradient(180deg, #6366f1, #8b5cf6);
      border-radius: 8px 8px 0 0;
      height: ${(count / maxValue) * 250}px;
      position: relative;
      transition: all 0.3s ease;
    `;
    bar.innerHTML = `<span style="position: absolute; bottom: -30px; left: 0; right: 0; text-align: center; font-weight: 600;">${dept}: ${count}</span>`;
    bar.onmouseover = () => bar.style.opacity = '0.8';
    bar.onmouseout = () => bar.style.opacity = '1';
    chart.appendChild(bar);
  });
}

function displaySalaryChart(data) {
  const chart = document.getElementById('salaryChart');
  chart.innerHTML = '';
  const maxValue = Math.max(...Object.values(data), 1);
  
  Object.entries(data).forEach(([range, count]) => {
    const bar = document.createElement('div');
    bar.style.cssText = `
      flex: 1;
      background: linear-gradient(180deg, #10b981, #34d399);
      border-radius: 8px 8px 0 0;
      height: ${(count / maxValue) * 250}px;
      position: relative;
      transition: all 0.3s ease;
    `;
    bar.innerHTML = `<span style="position: absolute; bottom: -30px; left: 0; right: 0; text-align: center; font-weight: 600; font-size: 0.8rem;">${range.substring(0, 5)}K: ${count}</span>`;
    bar.onmouseover = () => bar.style.opacity = '0.8';
    bar.onmouseout = () => bar.style.opacity = '1';
    chart.appendChild(bar);
  });
}

// ==================== EMPLOYEES ====================
async function loadEmployees() {
  try {
    const response = await fetch(`${API_BASE}/employees`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const employees = await response.json();

    const container = document.getElementById('employeesList');
    container.innerHTML = '';

    employees.forEach(emp => {
      const card = document.createElement('div');
      card.className = 'card-item';
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title">${emp.first_name} ${emp.last_name}</h3>
          <span class="badge badge-success">${emp.status}</span>
        </div>
        <p><strong>ID:</strong> ${emp.employee_id}</p>
        <p><strong>Department:</strong> ${emp.department}</p>
        <p><strong>Designation:</strong> ${emp.designation}</p>
        <p><strong>Joining:</strong> ${emp.joining_date}</p>
        <button class="btn btn-primary" onclick="viewEmployee(${emp.id})">View Details</button>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error('Employees load error:', e);
  }
}

function showEmployeeForm() {
  const form = `
    <h2>Add New Employee</h2>
    <form onsubmit="submitEmployeeForm(event)">
      <div class="form-group">
        <label>First Name</label>
        <input type="text" name="first_name" required>
      </div>
      <div class="form-group">
        <label>Last Name</label>
        <input type="text" name="last_name" required>
      </div>
      <div class="form-group">
        <label>Employee ID</label>
        <input type="text" name="employee_id" required>
      </div>
      <div class="form-group">
        <label>Department</label>
        <input type="text" name="department" required>
      </div>
      <div class="form-group">
        <label>Designation</label>
        <input type="text" name="designation" required>
      </div>
      <div class="form-group">
        <label>Joining Date</label>
        <input type="date" name="joining_date" required>
      </div>
      <button type="submit" class="btn btn-primary">Add Employee</button>
    </form>
  `;
  openModal(form);
}

async function submitEmployeeForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    showToast('Employee added successfully!');
    closeModal();
    loadEmployees();
  } catch (e) {
    console.error('Employee add error:', e);
  }
}

// ==================== RECRUITMENT ====================
async function loadRecruitment() {
  try {
    const [postings, candidates, interviews] = await Promise.all([
      fetch(`${API_BASE}/job-postings`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch(`${API_BASE}/candidates`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch(`${API_BASE}/interviews`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json())
    ]);

    displayJobPostings(postings);
    displayCandidates(candidates);
    displayInterviews(interviews);
  } catch (e) {
    console.error('Recruitment load error:', e);
  }
}

function displayJobPostings(postings) {
  const container = document.getElementById('jobPostingsList');
  container.innerHTML = postings.map(p => `
    <div class="card-item">
      <div class="card-header">
        <h3 class="card-title">${p.title}</h3>
        <span class="badge badge-pending">${p.status}</span>
      </div>
      <p><strong>Location:</strong> ${p.location}</p>
      <p><strong>Salary:</strong> ${p.salary_range}</p>
      <p><strong>Posted:</strong> ${new Date(p.posted_date).toLocaleDateString()}</p>
    </div>
  `).join('');
}

function displayCandidates(candidates) {
  const container = document.getElementById('candidatesList');
  container.innerHTML = candidates.map(c => `
    <div class="card-item">
      <div class="card-header">
        <h3 class="card-title">${c.name}</h3>
        <span class="badge badge-pending">${c.status}</span>
      </div>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Experience:</strong> ${c.experience_years} years</p>
      <p><strong>Applied:</strong> ${new Date(c.applied_date).toLocaleDateString()}</p>
    </div>
  `).join('');
}

function displayInterviews(interviews) {
  const container = document.getElementById('interviewsList');
  container.innerHTML = interviews.map(i => `
    <div class="card-item">
      <div class="card-header">
        <h3 class="card-title">Interview Round ${i.round_number}</h3>
        <span class="badge badge-pending">${i.status}</span>
      </div>
      <p><strong>Candidate ID:</strong> ${i.candidate_id}</p>
      <p><strong>Date:</strong> ${new Date(i.interview_date).toLocaleDateString()}</p>
      <p><strong>Rating:</strong> ${i.rating || 'N/A'}/5</p>
    </div>
  `).join('');
}

function showRecruitmentForm() {
  const form = `
    <h2>Create Job Posting</h2>
    <form onsubmit="submitRecruitmentForm(event)">
      <div class="form-group">
        <label>Job Title</label>
        <input type="text" name="title" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="4" required></textarea>
      </div>
      <div class="form-group">
        <label>Location</label>
        <input type="text" name="location" required>
      </div>
      <div class="form-group">
        <label>Salary Range</label>
        <input type="text" name="salary_range" placeholder="e.g., 50,000 - 70,000" required>
      </div>
      <button type="submit" class="btn btn-primary">Post Job</button>
    </form>
  `;
  openModal(form);
}

async function submitRecruitmentForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  data.requirement_id = 1; // Default requirement

  try {
    await fetch(`${API_BASE}/job-postings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    showToast('Job posting created!');
    closeModal();
    loadRecruitment();
  } catch (e) {
    console.error('Job posting error:', e);
  }
}

// ==================== LEAVE MANAGEMENT ====================
async function loadLeaveData() {
  try {
    const [leaveTypes, leaveRequests] = await Promise.all([
      fetch(`${API_BASE}/leave-types`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json()),
      fetch(`${API_BASE}/leave-requests`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(r => r.json())
    ]);

    displayLeaveTypes(leaveTypes);
    displayLeaveRequests(leaveRequests);
  } catch (e) {
    console.error('Leave data load error:', e);
  }
}

function displayLeaveTypes(types) {
  const tbody = document.getElementById('leaveTypesTable');
  tbody.innerHTML = types.map(t => `
    <tr>
      <td>${t.name}</td>
      <td>${t.days_per_year}</td>
      <td>${t.is_paid ? 'Yes' : 'No'}</td>
      <td>${t.requires_approval ? 'Yes' : 'No'}</td>
    </tr>
  `).join('');
}

function displayLeaveRequests(requests) {
  const tbody = document.getElementById('leaveRequestsTable');
  tbody.innerHTML = requests.map(r => `
    <tr>
      <td>Employee ${r.employee_id}</td>
      <td>${r.leave_type_id}</td>
      <td>${r.start_date}</td>
      <td>${r.end_date}</td>
      <td><span class="badge badge-pending">${r.status}</span></td>
      <td>
        <button class="btn btn-secondary" onclick="approveLeave(${r.id})">Approve</button>
      </td>
    </tr>
  `).join('');
}

function showLeaveForm() {
  const form = `
    <h2>Request Leave</h2>
    <form onsubmit="submitLeaveForm(event)">
      <div class="form-group">
        <label>Leave Type</label>
        <select name="leave_type_id" required>
          <option value="">Select Type</option>
          <option value="1">Casual Leave</option>
          <option value="2">Earned Leave</option>
          <option value="3">Sick Leave</option>
        </select>
      </div>
      <div class="form-group">
        <label>From Date</label>
        <input type="date" name="start_date" required>
      </div>
      <div class="form-group">
        <label>To Date</label>
        <input type="date" name="end_date" required>
      </div>
      <div class="form-group">
        <label>Reason</label>
        <textarea name="reason" rows="3" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit Request</button>
    </form>
  `;
  openModal(form);
}

async function submitLeaveForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    await fetch(`${API_BASE}/leave-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    showToast('Leave request submitted!');
    closeModal();
    loadLeaveData();
  } catch (e) {
    console.error('Leave request error:', e);
  }
}

async function approveLeave(id) {
  try {
    await fetch(`${API_BASE}/leave-requests/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    showToast('Leave approved!');
    loadLeaveData();
  } catch (e) {
    console.error('Approve error:', e);
  }
}

// ==================== ENGAGEMENT ====================
async function loadEngagement() {
  try {
    const response = await fetch(`${API_BASE}/engagement`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const engagement = await response.json();

    const container = document.getElementById('engagementList');
    container.innerHTML = engagement.map(e => `
      <div class="card-item">
        <div class="card-header">
          <h3 class="card-title">${e.event_type}</h3>
          <span class="badge badge-success">${e.status}</span>
        </div>
        <p><strong>Date:</strong> ${e.event_date}</p>
        <p><strong>Employee ID:</strong> ${e.employee_id}</p>
        <p><strong>Message:</strong> ${e.message}</p>
      </div>
    `).join('');
  } catch (e) {
    console.error('Engagement load error:', e);
  }
}

function showEngagementForm() {
  const form = `
    <h2>Create Engagement Activity</h2>
    <form onsubmit="submitEngagementForm(event)">
      <div class="form-group">
        <label>Event Type</label>
        <select name="event_type" required>
          <option value="">Select Type</option>
          <option value="birthday">Birthday</option>
          <option value="anniversary">Anniversary</option>
          <option value="special_day">Special Day</option>
          <option value="communication">Communication</option>
        </select>
      </div>
      <div class="form-group">
        <label>Employee ID</label>
        <input type="number" name="employee_id" required>
      </div>
      <div class="form-group">
        <label>Event Date</label>
        <input type="date" name="event_date" required>
      </div>
      <div class="form-group">
        <label>Message</label>
        <textarea name="message" rows="3" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Create Activity</button>
    </form>
  `;
  openModal(form);
}

async function submitEngagementForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    await fetch(`${API_BASE}/engagement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    showToast('Engagement activity created!');
    closeModal();
    loadEngagement();
  } catch (e) {
    console.error('Engagement error:', e);
  }
}

// ==================== EXIT MANAGEMENT ====================
async function loadExitData() {
  try {
    const response = await fetch(`${API_BASE}/separations`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const separations = await response.json();

    const container = document.getElementById('separationsList');
    container.innerHTML = separations.map(s => `
      <div class="card-item">
        <div class="card-header">
          <h3 class="card-title">Employee ${s.employee_id}</h3>
          <span class="badge badge-pending">${s.status}</span>
        </div>
        <p><strong>Separation Date:</strong> ${s.separation_date}</p>
        <p><strong>Reason:</strong> ${s.reason}</p>
        <p><strong>Last Working Day:</strong> ${s.last_working_day}</p>
      </div>
    `).join('');
  } catch (e) {
    console.error('Exit data load error:', e);
  }
}

function showExitForm() {
  const form = `
    <h2>Initiate Separation</h2>
    <form onsubmit="submitExitForm(event)">
      <div class="form-group">
        <label>Employee ID</label>
        <input type="number" name="employee_id" required>
      </div>
      <div class="form-group">
        <label>Separation Date</label>
        <input type="date" name="separation_date" required>
      </div>
      <div class="form-group">
        <label>Last Working Day</label>
        <input type="date" name="last_working_day" required>
      </div>
      <div class="form-group">
        <label>Reason</label>
        <textarea name="reason" rows="3" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Initiate Separation</button>
    </form>
  `;
  openModal(form);
}

async function submitExitForm(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    await fetch(`${API_BASE}/separations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    showToast('Separation initiated!');
    closeModal();
    loadExitData();
  } catch (e) {
    console.error('Exit error:', e);
  }
}

// ==================== ANALYTICS ====================
async function loadAnalytics() {
  try {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    const stats = await response.json();

    const metricsContainer = document.getElementById('analyticsMetrics');
    metricsContainer.innerHTML = `
      <div style="padding: 1rem; background: #f3f4f6; border-radius: 8px; margin-bottom: 1rem;">
        <p><strong>Total Employees:</strong> ${stats.totalEmployees}</p>
        <p><strong>Active Employees:</strong> ${stats.activeEmployees}</p>
        <p><strong>Attrition Rate:</strong> ${stats.attritionRate}%</p>
        <p><strong>Open Positions:</strong> ${stats.openPositions}</p>
      </div>
    `;
  } catch (e) {
    console.error('Analytics load error:', e);
  }
}

// ==================== UTILITY FUNCTIONS ====================
function openModal(content) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modalBody');
  body.innerHTML = content;
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
}

function viewEmployee(id) {
  showToast(`Viewing employee ${id}`);
}

// Load dashboard on initialization
setTimeout(() => {
  if (currentUser) {
    showPage('dashboard');
  }
}, 500);
