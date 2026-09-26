function getSheet(sheetName) {
  var config = getConfig();
  if (!config.DATABASE_SPREADSHEET_ID) throw new Error('Database ID not configured');
  var ss = SpreadsheetApp.openById(config.DATABASE_SPREADSHEET_ID);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet ' + sheetName + ' not found');
  }
  return sheet;
}

function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) return [];
  return sheet.getRange(1, 1, 1, lastCol).getValues()[0];
}

function getRows(sheetName) {
  var sheet = getSheet(sheetName);
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 2 || lastCol === 0) return [];
  
  var data = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    for (var j = 0; j < headers.length; j++) {
      rowObj[headers[j]] = data[i][j];
    }
    rowObj._rowIndex = i + 1; // 1-based index in sheet
    rows.push(rowObj);
  }
  return rows;
}

function findById(sheetName, id) {
  var rows = getRows(sheetName);
  if (rows.length === 0) return null;
  var idField = Object.keys(rows[0])[0]; 
  if(idField === '_rowIndex' && Object.keys(rows[0]).length > 1) idField = Object.keys(rows[0])[0]; // safety
  var headers = getHeaders(getSheet(sheetName));
  idField = headers[0];
  
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][idField] === id) {
      return rows[i];
    }
  }
  return null;
}

function findByField(sheetName, field, value) {
  var rows = getRows(sheetName);
  var results = [];
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][field] === value) {
      results.push(rows[i]);
    }
  }
  return results;
}

function insertRow(sheetName, obj) {
  var sheet = getSheet(sheetName);
  var headers = getHeaders(sheet);
  if (headers.length === 0) throw new Error('Sheet ' + sheetName + ' has no headers');
  
  var rowData = [];
  for (var i = 0; i < headers.length; i++) {
    rowData.push(obj[headers[i]] !== undefined ? obj[headers[i]] : '');
  }
  sheet.appendRow(rowData);
  
  var idField = headers[0];
  return findById(sheetName, obj[idField]);
}

function updateRow(sheetName, id, updates) {
  var sheet = getSheet(sheetName);
  var rows = getRows(sheetName);
  if (rows.length === 0) throw new Error('Sheet is empty');
  
  var headers = getHeaders(sheet);
  var idField = headers[0];
  var rowIndex = -1;
  var existingData = null;
  
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][idField] === id) {
      rowIndex = rows[i]._rowIndex;
      existingData = rows[i];
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error('Row not found for ID: ' + id);
  
  var updatedRowData = [];
  for (var j = 0; j < headers.length; j++) {
    var field = headers[j];
    if (updates[field] !== undefined) {
      updatedRowData.push(updates[field]);
    } else {
      updatedRowData.push(existingData[field]);
    }
  }
  
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([updatedRowData]);
  return findById(sheetName, id);
}

function deleteRow(sheetName, id) {
  var sheet = getSheet(sheetName);
  var rows = getRows(sheetName);
  var headers = getHeaders(sheet);
  var idField = headers[0];
  var rowIndex = -1;
  
  for (var i = 0; i < rows.length; i++) {
    if (rows[i][idField] === id) {
      rowIndex = rows[i]._rowIndex;
      break;
    }
  }
  
  if (rowIndex !== -1) {
    if (headers.indexOf('Status') !== -1) {
      updateRow(sheetName, id, {'Status': 'DELETED', 'Updated At': new Date().toISOString()});
      return true;
    } else {
      sheet.deleteRow(rowIndex);
      return true;
    }
  }
  return false;
}

function generateId(prefix) {
  return prefix + '-' + new Date().getTime().toString().substr(-6) + Math.floor(Math.random() * 1000);
}

function discoverSheets() {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.DATABASE_SPREADSHEET_ID);
  var sheets = ss.getSheets();
  var result = [];
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    result.push({
      name: sheet.getName(),
      headers: getHeaders(sheet)
    });
  }
  return result;
}

function testConnection() {
  try {
    var sheets = discoverSheets();
    var requiredSheets = ['USERS', 'JOBS', 'TASKS', 'PAYMENTS', 'DAILY_WORK', 'ACTIVITY_LOG', 'SETTINGS'];
    var foundSheets = sheets.map(function(s) { return s.name; });
    var missingSheets = [];
    for (var i = 0; i < requiredSheets.length; i++) {
      if (foundSheets.indexOf(requiredSheets[i]) === -1) {
        missingSheets.push(requiredSheets[i]);
      }
    }
    
    return {
      success: true,
      message: 'Connection successful',
      sheetsFound: foundSheets.length,
      missingSheets: missingSheets
    };
  } catch (e) {
    return {
      success: false,
      message: e.toString()
    };
  }
}

function initializeDatabase(adminEmail, adminPassword) {
  var config = getConfig();
  var ss = SpreadsheetApp.openById(config.DATABASE_SPREADSHEET_ID);
  
  var schemas = {
    'USERS': ['User ID', 'Name', 'Email', 'Password Hash', 'Password Salt', 'Role', 'Department', 'Status', 'Capacity', 'Created At', 'Updated At'],
    'JOBS': ['Job ID', 'Created At', 'Created By', 'Client', 'Company', 'Location', 'Function', 'Work Type', 'In Date', 'Due Date', 'Priority', 'Status', 'Notes', 'Updated At'],
    'TASKS': ['Task ID', 'Job ID', 'Task Type', 'Title', 'Assigned To', 'Assigned Name', 'Assigned Date', 'Due Date', 'Priority', 'Status', 'Started At', 'Completed At', 'Notes', 'Updated At'],
    'PAYMENTS': ['Payment ID', 'Job ID', 'Client', 'Amount', 'Advance', 'Balance', 'Status', 'Payment Date', 'Notes', 'Updated At'],
    'DAILY_WORK': ['Log ID', 'User ID', 'User Name', 'Date', 'Task ID', 'Job ID', 'Hours', 'Notes', 'Updated At'],
    'ACTIVITY_LOG': ['Timestamp', 'User ID', 'User Name', 'Action', 'Module', 'Record ID', 'Old Value', 'New Value'],
    'SETTINGS': ['Key', 'Value', 'Updated At']
  };
  
  var createdSheets = [];
  
  for (var name in schemas) {
    var sheet = ss.getSheetByName(name);
    var headers = schemas[name];
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      createdSheets.push(name);
    } else {
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      }
    }
  }
  
  // Check if an admin exists, if not, create one
  var userRows = getRows('USERS');
  var adminCreated = null;
  if (userRows.length === 0) {
    var email = adminEmail || 'admin@gmail.com';
    var pass = adminPassword || 'Admin@123456';
    var salt = generateSalt();
    var hash = hashPassword(pass, salt);
    var now = new Date().toISOString();
    var adminUser = {
      'User ID': generateId('USR'),
      'Name': 'System Admin',
      'Email': email,
      'Password Hash': hash,
      'Password Salt': salt,
      'Role': 'ADMIN',
      'Department': 'Executive',
      'Status': 'ACTIVE',
      'Capacity': 40,
      'Created At': now,
      'Updated At': now
    };
    insertRow('USERS', adminUser);
    adminCreated = {
      email: email,
      role: 'ADMIN'
    };
  }
  
  return {
    success: true,
    message: 'Database schema initialized successfully',
    createdSheets: createdSheets,
    adminCreated: adminCreated
  };
}

