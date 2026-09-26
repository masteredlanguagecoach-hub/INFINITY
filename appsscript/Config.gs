function getConfig() {
  var props = PropertiesService.getScriptProperties();
  var rawId = props.getProperty('DATABASE_SPREADSHEET_ID') || '';
  
  // If the user pasted a full Google Sheet URL, extract the actual ID
  var match = rawId.match(/\/d\/([a-zA-Z0-9-_]+)/);
  var spreadsheetId = match ? match[1] : rawId.trim();

  return {
    DATABASE_SPREADSHEET_ID: spreadsheetId,
    API_SECRET: props.getProperty('API_SECRET') || '',
    SESSION_EXPIRY: parseInt(props.getProperty('SESSION_EXPIRY') || '21600', 10),
    APP_NAME: props.getProperty('APP_NAME') || 'Production Decision Center'
  };
}

