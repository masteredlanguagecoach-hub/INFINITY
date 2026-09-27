const fs = require('fs');
const path = require('path');
const XLSX = require('../backend/node_modules/xlsx');
const { callAppsScript } = require('../backend/lib/appsScriptClient');

const WORKBOOK_PATH = 'C:/Users/user/Downloads/IWC 2026 JUN 13.xlsx';
const OUTPUT_PAYLOAD_PATH = path.join(__dirname, '../IWC_2026_DATABASE_PAYLOAD.json');

// Known employee normalization dictionary
const KNOWN_EMPLOYEES = {
  'REJIN': 'REJIN',
  'REJI N': 'REJIN',
  'NAVEEN': 'NAVEEN',
  'DHANISH': 'DHANISH',
  'JIJI': 'JIJI',
  'NANDANA': 'NANDANA',
  'NANDHANA': 'NANDHANA',
  'KICHU': 'KICHU',
  'JINISH': 'JINISH',
  'SHANOOJ': 'SHANOOJ',
  'MAHESH': 'MAHESH'
};

const INVALID_TASK_VALUES = new Set([
  'NO', 'NIL', '-', '', 'NULL', 'UNDEFINED', 'NA', 'N/A'
]);

function parseDate(raw) {
  if (raw === null || raw === undefined || raw === '') {
    return { original: null, normalized: null, warning: null };
  }
  const str = String(raw).trim();
  
  // Excel serial date code
  if (typeof raw === 'number' && raw > 30000 && raw < 60000) {
    const d = XLSX.SSF.parse_date_code(raw);
    const pad = n => String(n).padStart(2, '0');
    const normalized = `${d.y}-${pad(d.m)}-${pad(d.d)}`;
    return { original: str, normalized, warning: null };
  }

  const clean = str.replace(/\.\./g, '.');
  const dotParts = clean.split('.');
  if (dotParts.length === 3) {
    let [d, m, y] = dotParts;
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    if (y.length === 2) y = '20' + y;
    if (y.length === 3) y = '20' + y.slice(1);
    let warning = null;
    const yNum = parseInt(y, 10);
    if (yNum > 2030 || yNum < 2020) warning = `Suspicious Year: ${y}`;
    return { original: str, normalized: `${y}-${m}-${d}`, warning };
  }

  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    let [d, m, y] = slashParts;
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    if (y.length === 2) y = '20' + y;
    return { original: str, normalized: `${y}-${m}-${d}`, warning: null };
  }

  return { original: str, normalized: null, warning: 'Unparseable date format' };
}

function normalizeHeader(h) {
  if (!h) return '';
  return String(h).trim().toUpperCase().replace(/\s+/g, ' ');
}

function extractPayloadFromWorkbook() {
  console.log(`Reading workbook from: ${WORKBOOK_PATH}`);
  const wb = XLSX.readFile(WORKBOOK_PATH);

  const payload = {
    metadata: {
      sourceFile: 'IWC 2026 JUN 13.xlsx',
      extractedAt: new Date().toISOString(),
      sheets: wb.SheetNames
    },
    jobs: [],
    tasks: [],
    payments: [],
    dailyWork: [],
    skippedRows: [],
    warnings: [],
    unmappedEmployees: new Set()
  };

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

    if (rows.length < 2) continue;

    // Header row is row index 1 (Excel Row 2)
    const headerRow = rows[1] || [];
    
    // Find S.NO index in header
    let snoColIdx = headerRow.findIndex(cell => normalizeHeader(cell) === 'S.NO');
    if (snoColIdx === -1) {
      // Try row 0
      snoColIdx = (rows[0] || []).findIndex(cell => normalizeHeader(cell) === 'S.NO');
    }
    if (snoColIdx === -1) snoColIdx = 0;

    // Build header mapping for the jobs section (columns up to PAYMENT)
    const jobHeaders = {};
    let paymentColIdx = -1;

    for (let c = snoColIdx; c < headerRow.length; c++) {
      const h = normalizeHeader(headerRow[c]);
      if (h) {
        jobHeaders[h] = c;
        if (h === 'PAYMENT' || h === 'ADVANCE') {
          paymentColIdx = Math.max(paymentColIdx, c);
        }
      }
    }

    // Detect employee daily work column groups in row 1
    // Format: [EmployeeName, null..., 'DATE', 'DAY', 'DAY BY WORK', 'COMPLET WORK', 'OUT', 'DELEVERY']
    const dailyWorkEmployees = [];
    for (let c = (paymentColIdx > 0 ? paymentColIdx + 1 : 18); c < headerRow.length; c++) {
      const cellVal = normalizeHeader(headerRow[c]);
      if (cellVal && KNOWN_EMPLOYEES[cellVal]) {
        dailyWorkEmployees.push({
          name: KNOWN_EMPLOYEES[cellVal],
          startCol: c
        });
      }
    }

    const safeSheetId = sheetName.replace(/\s+/g, '_');

    // Process data rows starting from row index 2 (Excel Row 3)
    for (let r = 2; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const excelRowNum = r + 1;
      const legacyId = `LEGACY-${safeSheetId}-${excelRowNum}`;

      // Check if this row has meaningful production data
      const snoVal = row[snoColIdx];
      const inDateRaw = jobHeaders['IN DATE'] !== undefined ? row[jobHeaders['IN DATE']] : null;
      const outDateRaw = jobHeaders['OUT DATE'] !== undefined ? row[jobHeaders['OUT DATE']] : null;
      const companyRaw = jobHeaders['WEDDING COMPANY'] !== undefined ? row[jobHeaders['WEDDING COMPANY']] : null;
      const locationRaw = jobHeaders['LOCATION'] !== undefined ? row[jobHeaders['LOCATION']] : null;
      const workNameRaw = (jobHeaders['WORK NAME'] !== undefined ? row[jobHeaders['WORK NAME']] : null) ||
                          (jobHeaders['COUPLE NAME'] !== undefined ? row[jobHeaders['COUPLE NAME']] : null) ||
                          (jobHeaders['FUNCTION & CAM'] !== undefined ? row[jobHeaders['FUNCTION & CAM']] : null);

      const hasJobData = inDateRaw || outDateRaw || companyRaw || locationRaw || (workNameRaw && String(workNameRaw).trim() !== '');

      if (hasJobData) {
        const inDateParsed = parseDate(inDateRaw);
        const outDateParsed = parseDate(outDateRaw);
        if (inDateParsed.warning) payload.warnings.push({ legacyId, field: 'IN DATE', warning: inDateParsed.warning, value: inDateRaw });
        if (outDateParsed.warning) payload.warnings.push({ legacyId, field: 'OUT DATE', warning: outDateParsed.warning, value: outDateRaw });

        const funcAndCam = jobHeaders['FUNCTION & CAM'] !== undefined ? row[jobHeaders['FUNCTION & CAM']] : '';
        const systemNotes = jobHeaders['SYSTEM'] !== undefined ? row[jobHeaders['SYSTEM']] : '';
        const paymentRaw = jobHeaders['PAYMENT'] !== undefined ? row[jobHeaders['PAYMENT']] : '';
        const advanceRaw = jobHeaders['ADVANCE'] !== undefined ? row[jobHeaders['ADVANCE']] : '';

        // Build Job Record
        const jobRecord = {
          jobId: legacyId,
          legacyId,
          sourceSheet: sheetName,
          sourceRow: excelRowNum,
          sourceSerialNumber: snoVal ? String(snoVal).trim() : '',
          createdAt: inDateParsed.normalized ? `${inDateParsed.normalized}T00:00:00.000Z` : new Date().toISOString(),
          createdBy: 'HISTORICAL_IMPORT',
          client: (companyRaw ? String(companyRaw).trim() : 'Unspecified Client'),
          company: (companyRaw ? String(companyRaw).trim() : 'Unspecified Company'),
          location: (locationRaw ? String(locationRaw).trim() : ''),
          function: (funcAndCam ? String(funcAndCam).trim() : ''),
          workType: (workNameRaw ? String(workNameRaw).trim() : 'Wedding Video Editing'),
          inDate: inDateParsed.normalized || inDateParsed.original || '',
          dueDate: outDateParsed.normalized || outDateParsed.original || '',
          originalInDate: inDateParsed.original,
          originalDueDate: outDateParsed.original,
          priority: 'MEDIUM',
          status: (paymentRaw && String(paymentRaw).toUpperCase() === 'REJECT') ? 'CANCELLED' : 
                  (outDateParsed.normalized ? 'COMPLETED' : 'IN_PROGRESS'),
          notes: [
            systemNotes ? `System: ${systemNotes}` : '',
            paymentRaw ? `Payment: ${paymentRaw}` : '',
            advanceRaw ? `Advance: ${advanceRaw}` : ''
          ].filter(Boolean).join(' | '),
          updatedAt: new Date().toISOString(),
          rawSourceData: JSON.stringify(row.slice(0, paymentColIdx > 0 ? paymentColIdx + 1 : 20))
        };

        payload.jobs.push(jobRecord);

        // Extract Task assignments from stages: TEASER, HIGHLIGHTS, CUT, PRE WED, REEL
        const taskStages = ['TEASER', 'HIGHLIGHTS', 'CUT', 'PRE WED', 'REEL'];
        taskStages.forEach((stage, sIdx) => {
          const colIdx = jobHeaders[stage];
          if (colIdx !== undefined) {
            const rawAssignee = row[colIdx];
            if (rawAssignee !== null && rawAssignee !== undefined) {
              const valStr = String(rawAssignee).trim().toUpperCase();
              if (valStr && !INVALID_TASK_VALUES.has(valStr)) {
                let mappedName = KNOWN_EMPLOYEES[valStr] || valStr;
                if (!KNOWN_EMPLOYEES[valStr]) {
                  payload.unmappedEmployees.add(valStr);
                }

                const taskId = `${legacyId}-TASK-${stage.replace(/\s+/g, '_')}`;
                payload.tasks.push({
                  taskId,
                  jobId: legacyId,
                  legacyId,
                  taskType: stage,
                  title: `${stage} - ${jobRecord.client}`,
                  assignedTo: mappedName,
                  assignedName: mappedName,
                  originalStage: stage,
                  originalValue: String(rawAssignee).trim(),
                  sourceSheet: sheetName,
                  sourceRow: excelRowNum,
                  priority: 'MEDIUM',
                  status: (valStr === 'HOLD' || valStr === 'LEAVE' || valStr === '?') ? valStr : 'COMPLETED',
                  startedAt: jobRecord.inDate ? `${jobRecord.inDate}T00:00:00.000Z` : '',
                  completedAt: jobRecord.dueDate ? `${jobRecord.dueDate}T00:00:00.000Z` : '',
                  notes: `Imported from stage ${stage} (Source value: ${rawAssignee})`,
                  updatedAt: new Date().toISOString()
                });
              }
            }
          }
        });

        // Extract Payment record
        if (paymentRaw || advanceRaw) {
          const paymentId = `${legacyId}-PAY`;
          let amount = 0;
          let advance = 0;
          let balance = 0;
          let payStatus = 'PENDING';

          if (typeof paymentRaw === 'number') amount = paymentRaw;
          if (typeof advanceRaw === 'number') advance = advanceRaw;
          if (amount > 0 && advance > 0) balance = amount - advance;
          if (String(paymentRaw).toUpperCase() === 'YES' || String(paymentRaw).toUpperCase() === 'PAID') {
            payStatus = 'PAID';
          } else if (String(paymentRaw).toUpperCase() === 'REJECT') {
            payStatus = 'CANCELLED';
          }

          payload.payments.push({
            paymentId,
            jobId: legacyId,
            legacyId,
            client: jobRecord.client,
            amount: amount,
            advance: advance,
            balance: balance,
            status: payStatus,
            paymentDate: jobRecord.dueDate || jobRecord.inDate || '',
            notes: `Payment: ${paymentRaw} | Advance: ${advanceRaw}`,
            sourceSheet: sheetName,
            sourceRow: excelRowNum,
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        payload.skippedRows.push({
          sourceSheet: sheetName,
          sourceRow: excelRowNum,
          reason: snoVal ? 'Header / Template Serial row with no job details' : 'Empty row'
        });
      }

      // Extract Daily Work data for each employee group
      dailyWorkEmployees.forEach(emp => {
        const start = emp.startCol;
        const dateRaw = row[start - 2] || row[start - 1] || row[start];
        const dayName = row[start + 1];
        const dayByWork = row[start + 2];
        const completWork = row[start + 3];
        const outVal = row[start + 4];
        const deliveryVal = row[start + 5];

        if (dayByWork || completWork || outVal || deliveryVal) {
          const dateParsed = parseDate(dateRaw);
          const dwId = `LEGACY-DW-${safeSheetId}-${emp.name}-${excelRowNum}`;
          payload.dailyWork.push({
            dailyWorkId: dwId,
            legacyId: dwId,
            date: dateParsed.normalized || dateParsed.original || '',
            userId: emp.name,
            employeeName: emp.name,
            sourceEmployeeName: emp.name,
            day: dayName ? String(dayName).trim() : '',
            assignedWork: dayByWork ? String(dayByWork).trim() : '',
            completedWork: completWork ? String(completWork).trim() : '',
            out: outVal ? String(outVal).trim() : '',
            delivery: deliveryVal ? String(deliveryVal).trim() : '',
            status: 'COMPLETED',
            sourceSheet: sheetName,
            sourceRow: excelRowNum,
            rawSourceData: JSON.stringify([dateRaw, dayName, dayByWork, completWork, outVal, deliveryVal]),
            updatedAt: new Date().toISOString()
          });
        }
      });
    }
  }

  payload.unmappedEmployees = Array.from(payload.unmappedEmployees);
  return payload;
}

async function run() {
  console.log('--- STARTING HISTORICAL DATA EXTRACTION ---');
  const payload = extractPayloadFromWorkbook();

  console.log(`\nExtraction Summary:`);
  console.log(`- Total Historical Jobs: ${payload.jobs.length}`);
  console.log(`- Total Production Tasks: ${payload.tasks.length}`);
  console.log(`- Total Payment Records: ${payload.payments.length}`);
  console.log(`- Total Daily Work Records: ${payload.dailyWork.length}`);
  console.log(`- Total Skipped Template Rows: ${payload.skippedRows.length}`);
  console.log(`- Unmapped Employees: ${payload.unmappedEmployees.join(', ') || 'None'}`);
  console.log(`- Warnings / Suspicious Dates: ${payload.warnings.length}`);

  // Save full JSON payload
  fs.writeFileSync(OUTPUT_PAYLOAD_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`\nSuccessfully saved payload to: ${OUTPUT_PAYLOAD_PATH}`);

  return payload;
}

if (require.main === module) {
  run().catch(console.error);
}

module.exports = { extractPayloadFromWorkbook };
