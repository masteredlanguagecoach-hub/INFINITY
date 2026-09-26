function listUsers() {
  var rows = getRows('USERS');
  return rows.map(function(row) {
    var cleanUser = Object.assign({}, row);
    delete cleanUser['Password Hash'];
    delete cleanUser['Password Salt'];
    delete cleanUser._rowIndex;
    return cleanUser;
  }).filter(function(u) { return u.Status !== 'DELETED'; });
}

function getUser(userId) {
  var user = findById('USERS', userId);
  if (!user || user.Status === 'DELETED') return null;
  var cleanUser = Object.assign({}, user);
  delete cleanUser['Password Hash'];
  delete cleanUser['Password Salt'];
  delete cleanUser._rowIndex;
  return cleanUser;
}

function createUser(data, createdByRole) {
  if (createdByRole !== 'ADMIN') throw new Error('Unauthorized');
  
  var salt = generateSalt();
  var hash = hashPassword(data.Password || 'default123', salt);
  var now = new Date().toISOString();
  
  var newUser = {
    'User ID': generateId('USR'),
    'Name': data.Name,
    'Email': data.Email,
    'Password Hash': hash,
    'Password Salt': salt,
    'Role': data.Role || 'VIEWER',
    'Department': data.Department || '',
    'Status': data.Status || 'ACTIVE',
    'Capacity': data.Capacity || 40,
    'Created At': now,
    'Updated At': now
  };
  
  var inserted = insertRow('USERS', newUser);
  var cleanUser = Object.assign({}, inserted);
  delete cleanUser['Password Hash'];
  delete cleanUser['Password Salt'];
  delete cleanUser._rowIndex;
  return cleanUser;
}

function updateUser(userId, data) {
  data['Updated At'] = new Date().toISOString();
  // Ensure we don't update password fields via this method directly
  delete data['Password Hash'];
  delete data['Password Salt'];
  
  var updated = updateRow('USERS', userId, data);
  var cleanUser = Object.assign({}, updated);
  delete cleanUser['Password Hash'];
  delete cleanUser['Password Salt'];
  delete cleanUser._rowIndex;
  return cleanUser;
}

function activateUser(userId) {
  return updateUser(userId, { Status: 'ACTIVE' });
}

function deactivateUser(userId) {
  return updateUser(userId, { Status: 'INACTIVE' });
}

function changeRole(userId, newRole) {
  return updateUser(userId, { Role: newRole });
}

function resetPassword(userId, newPassword) {
  var salt = generateSalt();
  var hash = hashPassword(newPassword, salt);
  updateRow('USERS', userId, {
    'Password Hash': hash,
    'Password Salt': salt,
    'Updated At': new Date().toISOString()
  });
  return { success: true };
}
