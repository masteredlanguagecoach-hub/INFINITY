function _createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function _processRequest(e, isPost) {
  // Parse the body once — we always POST from the Node.js backend
  var body = {};
  try {
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
  } catch (parseErr) {
    return _createResponse({ success: false, error: 'Invalid JSON body: ' + parseErr.toString() });
  }

  // Action can come from body (POST) or query param (GET fallback)
  var action = body.action || e.parameter.action;
  if (!action) {
    return _createResponse({ success: false, error: 'No action specified' });
  }

  // Validate API secret — from body (POST) or query param (GET fallback)
  var secret = body.apiSecret || e.parameter.apiSecret;
  if (!validateApiSecret(secret)) {
    return _createResponse({ success: false, error: { code: 'API_SECRET_INVALID', message: 'Invalid API secret' } });
  }

  // Public actions — no session required
  if (action === 'login') {
    return _createResponse(login(body.email, body.password));
  }
  if (action === 'testConnection') {
    return _createResponse(testConnection());
  }
  if (action === 'discoverSheets') {
    return _createResponse(discoverSheets());
  }
  if (action === 'initializeDatabase') {
    return _createResponse(initializeDatabase(body.adminEmail, body.adminPassword));
  }

  // All other actions require a valid session
  var sessionId = body.sessionId || e.parameter.sessionId;
  var session = validateSession(sessionId);

  if (!session) {
    return _createResponse({ success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required or session expired' } });
  }

  // Session stores the user object — handle both Google Sheet column names and normalized names
  var u = session.user || {};
  var role = u['Role'] || u.role || '';
  var userId = u['User ID'] || u.userId || u.id || '';

  try {
    switch(action) {
      case 'logout':
        return _createResponse({ success: logout(sessionId) });
      case 'getSession':
        return _createResponse({ session: session });
        
      case 'getDashboard':
        if (!canAccess(role, 'dashboard')) return _createResponse({ error: 'Forbidden' });
        return _createResponse(getDashboardStats());
        
      case 'getDecisionCenter':
        if (!canAccess(role, 'decision-center')) return _createResponse({ error: 'Forbidden' });
        return _createResponse(_getDecisionCenterLogic());
        
      // Jobs
      case 'listJobs':
        if (!canAccess(role, 'jobs')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ jobs: listJobs(body.filters) });
      case 'getJob':
        if (!canAccess(role, 'jobs')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ job: getJob(e.parameter.jobId || body.jobId) });
      case 'createJob':
        if (!canAccess(role, 'jobs')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ job: createJob(body.data, userId) });
      case 'updateJob':
        if (!canAccess(role, 'jobs')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ job: updateJob(body.jobId, body.data, userId) });
      case 'deleteJob':
        if (!canAccess(role, 'jobs')) return _createResponse({ error: 'Forbidden' });
        return _createResponse(deleteJob(body.jobId, userId));
        
      // Tasks
      case 'listTasks':
        if (!canAccess(role, 'tasks')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ tasks: listTasks(body.filters) });
      case 'getTask':
        if (!canAccess(role, 'tasks')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ task: getTask(e.parameter.taskId || body.taskId) });
      case 'createTask':
        if (!canAccess(role, 'tasks')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ task: createTask(body.data, userId) });
      case 'updateTask':
        if (!canAccess(role, 'tasks')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ task: updateTask(body.taskId, body.data, userId) });
      case 'assignTask':
        if (!canAccess(role, 'tasks')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ task: assignTask(body.taskId, body.assignedTo, userId) });
        
      // Users
      case 'listUsers':
        if (!canAccess(role, 'team')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ users: listUsers() });
      case 'getUser':
        if (!canAccess(role, 'team')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ user: getUser(e.parameter.userId || body.userId) });
      case 'createUser':
        if (role !== 'ADMIN') return _createResponse({ error: 'Forbidden' });
        return _createResponse({ user: createUser(body.data, role) });
      case 'updateUser':
        if (!canAccess(role, 'team')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ user: updateUser(body.userId, body.data) });
      case 'activateUser':
        if (role !== 'ADMIN') return _createResponse({ error: 'Forbidden' });
        return _createResponse({ user: activateUser(body.userId) });
      case 'deactivateUser':
        if (role !== 'ADMIN') return _createResponse({ error: 'Forbidden' });
        return _createResponse({ user: deactivateUser(body.userId) });
      case 'changeRole':
        if (role !== 'ADMIN') return _createResponse({ error: 'Forbidden' });
        return _createResponse({ user: changeRole(body.userId, body.newRole) });
      case 'resetPassword':
        if (role !== 'ADMIN' && userId !== body.userId) return _createResponse({ error: 'Forbidden' });
        return _createResponse(resetPassword(body.userId, body.newPassword));
        
      // Payments
      case 'listPayments':
        if (!canAccess(role, 'payments')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ payments: listPayments(body.filters) });
      case 'getPayment':
        if (!canAccess(role, 'payments')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ payment: getPayment(e.parameter.paymentId || body.paymentId) });
      case 'createPayment':
        if (!canAccess(role, 'payments')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ payment: createPayment(body.data, userId) });
      case 'updatePayment':
        if (!canAccess(role, 'payments')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ payment: updatePayment(body.paymentId, body.data, userId) });
      case 'getPaymentSummary':
        if (!canAccess(role, 'payments')) return _createResponse({ error: 'Forbidden' });
        return _createResponse(getPaymentSummary());
        
      // Reports
      case 'getMonthlyReport':
        if (!canAccess(role, 'reports')) return _createResponse({ error: 'Forbidden' });
        return _createResponse(getMonthlyReport(body.year, body.month));
      case 'getEmployeePerformanceReport':
        if (!canAccess(role, 'reports')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ report: getEmployeePerformanceReport(body.startDate, body.endDate) });
      case 'getWorkTypeReport':
        if (!canAccess(role, 'reports')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ report: getWorkTypeReport(body.startDate, body.endDate) });
      case 'getDepartmentReport':
        if (!canAccess(role, 'reports')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ report: getDepartmentReport(body.startDate, body.endDate) });
        
      // Audit
      case 'listAuditLog':
        if (!canAccess(role, 'audit')) return _createResponse({ error: 'Forbidden' });
        return _createResponse({ logs: listAuditLog(body.filters) });
        
      default:
        return _createResponse({ error: 'Unknown action' });
    }
  } catch (err) {
    return _createResponse({ error: err.toString() });
  }
}

function doGet(e) {
  return _processRequest(e, false);
}

function doPost(e) {
  return _processRequest(e, true);
}

function _getDecisionCenterLogic() {
  var users = listUsers();
  var tasks = listTasks();
  var jobs = listJobs();
  var now = new Date();
  
  var employeeStats = users.map(function(u) {
    var capacity = parseInt(u.Capacity) || 40;
    var uTasks = tasks.filter(function(t) { return t['Assigned To'] === u['User ID']; });
    
    var openTasks = uTasks.filter(function(t) { return t.Status !== 'COMPLETED'; });
    var compTasks = uTasks.filter(function(t) { return t.Status === 'COMPLETED'; });
    var overdue = openTasks.filter(function(t) { return t['Due Date'] && new Date(t['Due Date']) < now; });
    
    var util = capacity > 0 ? (openTasks.length / capacity) * 100 : 0;
    var signal = 'AVAILABLE';
    if (util >= 100) signal = 'OVERLOADED';
    else if (util >= 80) signal = 'HIGH';
    
    return {
      userId: u['User ID'],
      name: u.Name,
      department: u.Department,
      openCount: openTasks.length,
      completedCount: compTasks.length,
      overdueCount: overdue.length,
      capacity: capacity,
      utilizationPercent: Math.round(util),
      signal: signal
    };
  });
  
  var highestWorkload = employeeStats.reduce(function(prev, curr) { return prev.utilizationPercent > curr.utilizationPercent ? prev : curr; }, {utilizationPercent: -1});
  var highestOverdue = employeeStats.reduce(function(prev, curr) { return prev.overdueCount > curr.overdueCount ? prev : curr; }, {overdueCount: -1});
  
  var taskTypeStats = {};
  tasks.filter(function(t){ return t.Status !== 'COMPLETED'; }).forEach(function(t) {
    var tt = t['Task Type'] || 'Unspecified';
    taskTypeStats[tt] = (taskTypeStats[tt] || 0) + 1;
  });
  var highestBacklogTaskType = Object.keys(taskTypeStats).reduce(function(a, b){ return taskTypeStats[a] > taskTypeStats[b] ? a : b }, "");
  
  var sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);
  var jobsDeadlineApproaching = jobs.filter(function(j) {
    if (j.Status === 'COMPLETED' || !j['Due Date']) return false;
    var dd = new Date(j['Due Date']);
    return dd >= now && dd <= sevenDaysLater;
  });
  var jobsOverdue = jobs.filter(function(j) {
    if (j.Status === 'COMPLETED' || !j['Due Date']) return false;
    return new Date(j['Due Date']) < now;
  });
  
  var deptStats = {};
  employeeStats.forEach(function(e) {
    var d = e.department || 'Unspecified';
    if (!deptStats[d]) deptStats[d] = { overloadedCount: 0, total: 0 };
    deptStats[d].total++;
    if (e.signal === 'OVERLOADED') deptStats[d].overloadedCount++;
  });
  var bottleneckDepartments = Object.keys(deptStats).filter(function(d) { return deptStats[d].overloadedCount > 0; });
  
  return {
    employeeStats: employeeStats,
    insights: {
      highestWorkloadEmployee: highestWorkload.utilizationPercent >= 0 ? highestWorkload : null,
      highestOverdueEmployee: highestOverdue.overdueCount >= 0 ? highestOverdue : null,
      highestBacklogTaskType: highestBacklogTaskType,
      jobsDeadlineApproaching: jobsDeadlineApproaching.length,
      jobsOverdue: jobsOverdue.length,
      bottleneckDepartments: bottleneckDepartments
    }
  };
}
