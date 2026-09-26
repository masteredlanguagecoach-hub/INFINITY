# Production Decision Center — Quick Start

## Prerequisites
- Node.js 18+ installed
- Google account with access to your Google Sheet

## Step 1: Configure Backend

Edit `backend/.env` with your values:
```
APPS_SCRIPT_URL=    ← your Apps Script Web App URL
APPS_SCRIPT_API_SECRET=  ← must match API_SECRET in Script Properties
SESSION_SECRET=     ← any long random string
```

## Step 2: Start the Backend

```powershell
# PowerShell (with execution policy workaround):
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" start
# OR if npm works normally:
npm start
```

## Step 3: Start the Frontend (Development)

In a new terminal:
```powershell
cd frontend
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run dev
```

Open http://localhost:5173

## Step 4: Production Build

```powershell
cd frontend
node "C:\Program Files\nodejs\node_modules\npm\bin\npm-cli.js" run build
```

Then start backend with NODE_ENV=production — it will serve the frontend automatically.

## Apps Script Setup

See full instructions in PRODUCTION_DECISION_CENTER.md (in docs/).

Quick summary:
1. Go to script.google.com → New Project
2. Copy all files from appsscript/ folder
3. Project Settings → Script Properties → Add:
   - DATABASE_SPREADSHEET_ID = (your sheet ID from URL)
   - API_SECRET = (same as APPS_SCRIPT_API_SECRET in backend .env)
   - SESSION_EXPIRY = 21600
4. Deploy → Web App → Execute as Me → Anyone
5. Copy the URL into backend/.env as APPS_SCRIPT_URL

## First Admin User

After Apps Script is deployed, open the app and go to Settings → Setup Wizard.
Or run this in the Apps Script editor (once):

```javascript
function createFirstAdmin() {
  const result = createUser({
    Name: 'Administrator',
    Email: 'your@gmail.com',
    Password: 'YourPassword123!',
    Role: 'ADMIN',
    Department: 'Management',
    Capacity: 10
  }, 'ADMIN');
  Logger.log(JSON.stringify(result));
}
```
