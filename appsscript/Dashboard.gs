function getDashboardStats() {
  var jobs = getRows('JOBS').filter(function(j) { return j.Status !== 'DELETED' && j.Status !== 'CANCELLED'; });
  var tasks = getRows('TASKS').filter(function(t) { return t.Status !== 'DELETED'; });
  var users = getRows('USERS').filter(function(u) { return u.Status === 'ACTIVE'; });
  var payments = getRows('PAYMENTS').filter(function(p) { return p.Status !== 'DELETED'; });
  var activity = getRows('ACTIVITY_LOG').slice(-10); // Last 10
  
  var openTasks = 0;
  var completedTasks = 0;
  var overdueTasks = 0;
  var now = new Date();
  
  var taskStatusDistribution = {};
  var workTypeDistribution = {};
  var userWorkload = {};
  
  users.forEach(function(u) {
    userWorkload[u['User ID']] = {
      id: u['User ID'],
      name: u.Name,
      capacity: parseInt(u.Capacity) || 40,
      open: 0
    };
  });
  
  tasks.forEach(function(t) {
    if (t.Status === 'COMPLETED') {
      completedTasks++;
    } else {
      openTasks++;
      if (t['Due Date'] && new Date(t['Due Date']) < now) {
        overdueTasks++;
      }
      if (t['Assigned To'] && userWorkload[t['Assigned To']]) {
        userWorkload[t['Assigned To']].open++;
      }
    }
    taskStatusDistribution[t.Status] = (taskStatusDistribution[t.Status] || 0) + 1;
  });
  
  jobs.forEach(function(j) {
    var wt = j['Work Type'] || 'Unspecified';
    workTypeDistribution[wt] = (workTypeDistribution[wt] || 0) + 1;
  });
  
  var totalRevenue = 0;
  var outstandingBalance = 0;
  var pendingPayments = 0;
  
  payments.forEach(function(p) {
    var amt = parseFloat(p.Amount) || 0;
    var adv = parseFloat(p.Advance) || 0;
    var bal = parseFloat(p.Balance) || 0;
    
    totalRevenue += amt;
    outstandingBalance += bal;
    if (p.Status === 'PENDING' || p.Status === 'PARTIAL') {
      pendingPayments++;
    }
  });
  
  var workloadByEmployee = Object.keys(userWorkload).map(function(k) { return userWorkload[k]; });
  var overloadedEmployees = workloadByEmployee.filter(function(w) { return w.open > w.capacity; }).length;
  
  var completionRate = 0;
  if ((openTasks + completedTasks) > 0) {
    completionRate = Math.round((completedTasks / (openTasks + completedTasks)) * 100);
  }
  
  return {
    totalJobs: jobs.length,
    openTasks: openTasks,
    completedTasks: completedTasks,
    overdueTasks: overdueTasks,
    completionRate: completionRate,
    activeEmployees: users.length,
    overloadedEmployees: overloadedEmployees,
    pendingPayments: pendingPayments,
    totalRevenue: totalRevenue,
    outstandingBalance: outstandingBalance,
    recentActivity: activity.map(function(a){ delete a._rowIndex; return a; }).reverse(),
    taskStatusDistribution: taskStatusDistribution,
    workTypeDistribution: workTypeDistribution,
    workloadByEmployee: workloadByEmployee
  };
}
