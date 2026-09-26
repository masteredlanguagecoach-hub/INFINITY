function getMonthlyReport(year, month) {
  var jobs = listJobs();
  var tasks = listTasks();
  
  var targetPrefix = year + '-' + (month < 10 ? '0' + month : month);
  
  var filteredJobs = jobs.filter(function(j) {
    return j['Created At'] && j['Created At'].indexOf(targetPrefix) === 0;
  });
  
  return {
    year: year,
    month: month,
    jobsCreated: filteredJobs.length,
    jobs: filteredJobs
  };
}

function getEmployeePerformanceReport(startDate, endDate) {
  var tasks = listTasks();
  var users = listUsers();
  
  var start = startDate ? new Date(startDate) : new Date(0);
  var end = endDate ? new Date(endDate) : new Date();
  
  var stats = {};
  users.forEach(function(u) {
    stats[u['User ID']] = { name: u.Name, completed: 0, open: 0, overdue: 0 };
  });
  
  tasks.forEach(function(t) {
    if (!t['Assigned To'] || !stats[t['Assigned To']]) return;
    
    var tDate = new Date(t['Updated At']);
    if (tDate >= start && tDate <= end) {
      if (t.Status === 'COMPLETED') {
        stats[t['Assigned To']].completed++;
      } else {
        stats[t['Assigned To']].open++;
        if (t['Due Date'] && new Date(t['Due Date']) < new Date()) {
          stats[t['Assigned To']].overdue++;
        }
      }
    }
  });
  
  return Object.keys(stats).map(function(k) { return stats[k]; });
}

function getWorkTypeReport(startDate, endDate) {
  var jobs = listJobs();
  var start = startDate ? new Date(startDate) : new Date(0);
  var end = endDate ? new Date(endDate) : new Date();
  
  var stats = {};
  
  jobs.forEach(function(j) {
    var jDate = new Date(j['Created At']);
    if (jDate >= start && jDate <= end) {
      var wt = j['Work Type'] || 'Unspecified';
      stats[wt] = (stats[wt] || 0) + 1;
    }
  });
  
  return stats;
}

function getDepartmentReport(startDate, endDate) {
  // Simplified department report based on user assignments
  var tasks = listTasks();
  var users = listUsers();
  
  var start = startDate ? new Date(startDate) : new Date(0);
  var end = endDate ? new Date(endDate) : new Date();
  
  var userDept = {};
  users.forEach(function(u) { userDept[u['User ID']] = u.Department || 'Unspecified'; });
  
  var deptStats = {};
  
  tasks.forEach(function(t) {
    var tDate = new Date(t['Updated At']);
    if (tDate >= start && tDate <= end) {
      var dept = userDept[t['Assigned To']] || 'Unassigned';
      if (!deptStats[dept]) deptStats[dept] = { open: 0, completed: 0 };
      
      if (t.Status === 'COMPLETED') deptStats[dept].completed++;
      else deptStats[dept].open++;
    }
  });
  
  return deptStats;
}
