function listJobs(filters) {
  var jobs = getRows('JOBS');
  
  return jobs.filter(function(job) {
    if (job.Status === 'DELETED') return false;
    
    if (filters) {
      if (filters.status && job.Status !== filters.status) return false;
      if (filters.priority && job.Priority !== filters.priority) return false;
      if (filters.search) {
        var s = filters.search.toLowerCase();
        if ((job.Client || '').toLowerCase().indexOf(s) === -1 &&
            (job['Job ID'] || '').toLowerCase().indexOf(s) === -1 &&
            (job.Company || '').toLowerCase().indexOf(s) === -1) {
          return false;
        }
      }
    }
    return true;
  }).map(function(j) {
    delete j._rowIndex;
    return j;
  });
}

function getJob(jobId) {
  var job = findById('JOBS', jobId);
  if (!job || job.Status === 'DELETED') return null;
  delete job._rowIndex;
  
  var tasks = findByField('TASKS', 'Job ID', jobId).filter(function(t) { return t.Status !== 'DELETED'; }).map(function(t) {
    delete t._rowIndex;
    return t;
  });
  
  job.tasks = tasks;
  return job;
}

function createJob(data, userId) {
  var now = new Date().toISOString();
  
  var newJob = {
    'Job ID': generateId('JOB'),
    'Created At': now,
    'Created By': userId,
    'Client': data.Client || '',
    'Company': data.Company || '',
    'Location': data.Location || '',
    'Function': data.Function || '',
    'Work Type': data.WorkType || '',
    'In Date': data.InDate || now,
    'Due Date': data.DueDate || '',
    'Priority': data.Priority || 'Normal',
    'Status': data.Status || 'OPEN',
    'Notes': data.Notes || '',
    'Updated At': now
  };
  
  var inserted = insertRow('JOBS', newJob);
  appendAudit(userId, '', 'CREATE', 'jobs', inserted['Job ID'], '', JSON.stringify(inserted));
  delete inserted._rowIndex;
  return inserted;
}

function updateJob(jobId, data, userId) {
  data['Updated At'] = new Date().toISOString();
  var oldData = findById('JOBS', jobId);
  var updated = updateRow('JOBS', jobId, data);
  appendAudit(userId, '', 'UPDATE', 'jobs', jobId, JSON.stringify(oldData), JSON.stringify(updated));
  delete updated._rowIndex;
  return updated;
}

function deleteJob(jobId, userId) {
  var oldData = findById('JOBS', jobId);
  var res = updateRow('JOBS', jobId, { Status: 'CANCELLED', 'Updated At': new Date().toISOString() });
  appendAudit(userId, '', 'DELETE', 'jobs', jobId, JSON.stringify(oldData), JSON.stringify(res));
  return { success: true };
}
