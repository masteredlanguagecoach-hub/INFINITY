function hashPassword(password, salt) {
  var rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + salt);
  var txtHash = '';
  for (var j = 0; j < rawHash.length; j++) {
    var hashVal = rawHash[j];
    if (hashVal < 0) hashVal += 256;
    if (hashVal.toString(16).length == 1) txtHash += '0';
    txtHash += hashVal.toString(16);
  }
  return txtHash;
}

function generateSalt() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var salt = '';
  for (var i = 0; i < 32; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

function createSession(userId, userObj) {
  var config = getConfig();
  var sessionId = Utilities.getUuid();
  var cache = CacheService.getScriptCache();
  
  var sessionData = {
    userId: userId,
    user: userObj,
    createdAt: new Date().getTime()
  };
  
  cache.put('SESSION_' + sessionId, JSON.stringify(sessionData), config.SESSION_EXPIRY);
  return sessionId;
}

function getSession(sessionId) {
  if (!sessionId) return null;
  var cache = CacheService.getScriptCache();
  var data = cache.get('SESSION_' + sessionId);
  if (data) {
    return JSON.parse(data);
  }
  return null;
}

function destroySession(sessionId) {
  if (!sessionId) return false;
  var cache = CacheService.getScriptCache();
  cache.remove('SESSION_' + sessionId);
  return true;
}

function login(email, password) {
  var users = findByField('USERS', 'Email', email);
  if (users.length === 0) return { error: 'Invalid credentials' };
  
  var user = users[0];
  if (user.Status !== 'ACTIVE') return { error: 'Account is not active' };
  
  var hash = hashPassword(password, user['Password Salt']);
  if (hash !== user['Password Hash']) {
    return { error: 'Invalid credentials' };
  }
  
  var cleanUser = Object.assign({}, user);
  delete cleanUser['Password Hash'];
  delete cleanUser['Password Salt'];
  delete cleanUser._rowIndex;
  
  var sessionId = createSession(user['User ID'], cleanUser);
  return {
    success: true,
    sessionId: sessionId,
    user: cleanUser
  };
}

function logout(sessionId) {
  return destroySession(sessionId);
}

function validateApiSecret(secret) {
  var config = getConfig();
  return config.API_SECRET === secret;
}

function validateSession(sessionId) {
  var session = getSession(sessionId);
  if (!session) return false;
  
  var config = getConfig();
  var cache = CacheService.getScriptCache();
  cache.put('SESSION_' + sessionId, JSON.stringify(session), config.SESSION_EXPIRY);
  
  return session;
}

function canAccess(role, module) {
  var matrix = {
    'ADMIN': ['all'],
    'MANAGER': ['dashboard', 'decision-center', 'jobs', 'tasks', 'team', 'payments', 'reports', 'audit'],
    'TEAM_LEADER': ['dashboard', 'decision-center', 'jobs', 'tasks', 'team'],
    'EDITOR': ['dashboard', 'tasks', 'jobs', 'jobs (assigned)', 'tasks (own)'],
    'DATA_ENTRY': ['jobs', 'tasks'],
    'VIEWER': ['dashboard', 'decision-center', 'reports']
  };
  
  var perms = matrix[role] || [];
  if (perms.indexOf('all') !== -1) return true;
  return perms.indexOf(module) !== -1;
}
