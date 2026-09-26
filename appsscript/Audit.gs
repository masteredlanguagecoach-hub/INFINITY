function appendAudit(userId, userName, action, module, recordId, oldValue, newValue) {
  if (!userName && userId) {
    var u = getUser(userId);
    userName = u ? u.Name : 'System';
  }
  
  var logEntry = {
    'Timestamp': new Date().toISOString(),
    'User ID': userId || 'SYSTEM',
    'User Name': userName || 'System',
    'Action': action,
    'Module': module,
    'Record ID': recordId,
    'Old Value': oldValue || '',
    'New Value': newValue || ''
  };
  
  insertRow('ACTIVITY_LOG', logEntry);
}

function listAuditLog(filters) {
  var logs = getRows('ACTIVITY_LOG');
  
  return logs.filter(function(log) {
    if (filters) {
      if (filters.userId && log['User ID'] !== filters.userId) return false;
      if (filters.module && log['Module'] !== filters.module) return false;
      if (filters.startDate && new Date(log['Timestamp']) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(log['Timestamp']) > new Date(filters.endDate)) return false;
    }
    return true;
  }).map(function(l) {
    delete l._rowIndex;
    return l;
  }).reverse(); // Most recent first
}
