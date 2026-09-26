function listTasks(filters) {
  var tasks = getRows('TASKS');
  
  return tasks.filter(function(task) {
    if (task.Status === 'DELETED') return false;
    
    if (filters) {
      if (filters.status && task.Status !== filters.status) return false;
      if (filters.assignedTo && task['Assigned To'] !== filters.assignedTo) return false;
      if (filters.jobId && task['Job ID'] !== filters.jobId) return false;
    }
    return true;
  }).map(function(t) {
    delete t._rowIndex;
    return t;
  });
}

function getTask(taskId) {
  var task = findById('TASKS', taskId);
  if (!task || task.Status === 'DELETED') return null;
  delete task._rowIndex;
  return task;
}

function createTask(data, userId) {
  var now = new Date().toISOString();
  
  var assignedTo = data.AssignedTo || data['Assigned To'] || data.assignedTo || '';
  var assignedName = data.AssignedName || data['Assigned Name'] || data.assignedName || '';
  if (assignedTo && !assignedName) {
    try {
      var u = getUser(assignedTo);
      if (u) assignedName = u.Name || u.name || '';
    } catch (e) {}
  }

  var newTask = {
    'Task ID': generateId('TSK'),
    'Job ID': data.JobId || data['Job ID'] || data.jobId || '',
    'Task Type': data.TaskType || data['Task Type'] || data.taskType || 'HIGHLIGHTS',
    'Title': data.Title || data.title || '',
    'Assigned To': assignedTo,
    'Assigned Name': assignedName,
    'Assigned Date': assignedTo ? now : '',
    'Due Date': data.DueDate || data['Due Date'] || data.dueDate || '',
    'Priority': data.Priority || data.priority || 'MEDIUM',
    'Status': data.Status || data.status || 'PENDING',
    'Started At': '',
    'Completed At': '',
    'Notes': data.Notes || data.notes || '',
    'Updated At': now
  };
  
  var inserted = insertRow('TASKS', newTask);
  appendAudit(userId, '', 'CREATE', 'tasks', inserted['Task ID'], '', JSON.stringify(inserted));
  delete inserted._rowIndex;
  return inserted;
}


function updateTask(taskId, data, userId) {
  data['Updated At'] = new Date().toISOString();
  if (data.Status === 'COMPLETED' && !data['Completed At']) {
    data['Completed At'] = data['Updated At'];
  }
  if (data.Status === 'IN_PROGRESS' && !data['Started At']) {
    data['Started At'] = data['Updated At'];
  }
  
  var oldData = findById('TASKS', taskId);
  var updated = updateRow('TASKS', taskId, data);
  appendAudit(userId, '', 'UPDATE', 'tasks', taskId, JSON.stringify(oldData), JSON.stringify(updated));
  delete updated._rowIndex;
  return updated;
}

function assignTask(taskId, targetUserId, assignedByUserId) {
  var user = getUser(targetUserId);
  if (!user) throw new Error('User not found');
  
  return updateTask(taskId, {
    'Assigned To': targetUserId,
    'Assigned Name': user.Name,
    'Assigned Date': new Date().toISOString()
  }, assignedByUserId);
}
