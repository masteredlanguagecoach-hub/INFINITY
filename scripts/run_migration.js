const fs = require('fs');
const path = require('path');
const { callAppsScript } = require('../backend/lib/appsScriptClient');

const PAYLOAD_PATH = path.join(__dirname, '../IWC_2026_DATABASE_PAYLOAD.json');
const MIGRATION_LOG_PATH = path.join(__dirname, '../MIGRATION_REPORT.json');

const CONCURRENCY = 6;

async function executeWithConcurrency(items, fn, label = 'Processing') {
  let completed = 0;
  let errors = [];
  const results = [];

  const chunks = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    chunks.push(items.slice(i, i + CONCURRENCY));
  }

  for (let idx = 0; idx < chunks.length; idx++) {
    const chunk = chunks[idx];
    const promises = chunk.map(async (item) => {
      try {
        const res = await fn(item);
        completed++;
        return { success: true, item, res };
      } catch (err) {
        errors.push({ item, error: err.message || err });
        return { success: false, item, error: err };
      }
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
    
    if (completed % 25 === 0 || completed === items.length) {
      process.stdout.write(`\r${label}: ${completed}/${items.length} (${Math.round((completed / items.length) * 100)}%)`);
    }
  }
  console.log(`\n${label} completed: ${completed} items, ${errors.length} errors.`);
  return { results, errors };
}

async function runMigration() {
  console.log('====================================================');
  console.log('STARTING HISTORICAL WORKBOOK MIGRATION TO GOOGLE SHEETS');
  console.log('====================================================');

  if (!fs.existsSync(PAYLOAD_PATH)) {
    throw new Error(`Payload file not found at: ${PAYLOAD_PATH}`);
  }

  const payload = JSON.parse(fs.readFileSync(PAYLOAD_PATH, 'utf-8'));
  console.log(`Loaded payload with ${payload.jobs.length} jobs, ${payload.tasks.length} tasks, ${payload.payments.length} payments, ${payload.dailyWork.length} daily work records.`);

  // Authenticate as ADMIN
  const loginRes = await callAppsScript('login', { email: 'admin@gmail.com', password: 'Admin@123456' });
  if (!loginRes || !loginRes.sessionId) {
    throw new Error('Failed to authenticate admin session with Google Apps Script.');
  }
  const sessionId = loginRes.sessionId;
  console.log('Admin session established successfully.');

  // Check existing records for idempotent migration
  console.log('\nChecking existing records in database to ensure idempotency...');
  const existingJobsRes = await callAppsScript('listJobs', { sessionId });
  const existingJobs = new Set((existingJobsRes.jobs || []).map(j => j['Job ID'] || j.JobId || j.jobId));

  const existingTasksRes = await callAppsScript('listTasks', { sessionId });
  const existingTasks = new Set((existingTasksRes.tasks || []).map(t => t['Task ID'] || t.TaskId || t.taskId));

  const existingPaymentsRes = await callAppsScript('listPayments', { sessionId });
  const existingPayments = new Set((existingPaymentsRes.payments || []).map(p => p['Payment ID'] || p.PaymentId || p.paymentId));

  console.log(`Existing database counts -> Jobs: ${existingJobs.size}, Tasks: ${existingTasks.size}, Payments: ${existingPayments.size}`);

  const jobsToInsert = payload.jobs.filter(j => !existingJobs.has(j.jobId) && !existingJobs.has(j.legacyId));
  const tasksToInsert = payload.tasks.filter(t => !existingTasks.has(t.taskId) && !existingTasks.has(t.legacyId));
  const paymentsToInsert = payload.payments.filter(p => !existingPayments.has(p.paymentId) && !existingPayments.has(p.legacyId));

  console.log(`\nNew records to import:`);
  console.log(`- Jobs to import: ${jobsToInsert.length} (Skipping ${payload.jobs.length - jobsToInsert.length} already existing)`);
  console.log(`- Tasks to import: ${tasksToInsert.length} (Skipping ${payload.tasks.length - tasksToInsert.length} already existing)`);
  console.log(`- Payments to import: ${paymentsToInsert.length} (Skipping ${payload.payments.length - paymentsToInsert.length} already existing)`);

  const migrationStats = {
    migrationId: `MIG-${Date.now()}`,
    sourceFile: payload.metadata.sourceFile,
    importedAt: new Date().toISOString(),
    status: 'IN_PROGRESS',
    totalSourceRecords: payload.jobs.length + payload.tasks.length + payload.payments.length + payload.dailyWork.length,
    jobsImported: 0,
    tasksImported: 0,
    paymentsImported: 0,
    dailyWorkImported: 0,
    rowsSkipped: payload.skippedRows.length,
    unmappedEmployees: payload.unmappedEmployees,
    suspiciousDates: payload.warnings.length,
    duplicateCandidates: (payload.jobs.length - jobsToInsert.length) + (payload.tasks.length - tasksToInsert.length) + (payload.payments.length - paymentsToInsert.length),
    recordsRequiringReview: payload.warnings.length,
    warnings: payload.warnings,
    errors: []
  };

  // 1. Import JOBS
  if (jobsToInsert.length > 0) {
    console.log('\n--- 1/3 Importing JOBS ---');
    const jobResults = await executeWithConcurrency(jobsToInsert, async (job) => {
      const jobData = {
        'Job ID': job.jobId,
        'Created At': job.createdAt,
        'Created By': 'HISTORICAL_IMPORT',
        'Client': job.client,
        'Company': job.company,
        'Location': job.location,
        'Function': job.function,
        'Work Type': job.workType,
        'In Date': job.inDate,
        'Due Date': job.dueDate,
        'Priority': job.priority,
        'Status': job.status,
        'Notes': `[${job.legacyId} | Sheet: ${job.sourceSheet} | Row: ${job.sourceRow} | S.No: ${job.sourceSerialNumber}] ${job.notes}`,
        'Updated At': job.updatedAt
      };
      return await callAppsScript('createJob', { sessionId, data: jobData });
    }, 'Importing Jobs');
    migrationStats.jobsImported = jobResults.results.filter(r => r.success).length;
    migrationStats.errors.push(...jobResults.errors);
  } else {
    console.log('\n--- 1/3 JOBS: All historical jobs already imported ---');
    migrationStats.jobsImported = payload.jobs.length;
  }

  // 2. Import TASKS
  if (tasksToInsert.length > 0) {
    console.log('\n--- 2/3 Importing PRODUCTION TASKS ---');
    const taskResults = await executeWithConcurrency(tasksToInsert, async (task) => {
      const taskData = {
        'Task ID': task.taskId,
        'Job ID': task.jobId,
        'Task Type': task.taskType,
        'Title': task.title,
        'Assigned To': task.assignedTo,
        'Assigned Name': task.assignedName,
        'Assigned Date': task.startedAt || new Date().toISOString(),
        'Due Date': task.dueDate || '',
        'Priority': task.priority,
        'Status': task.status,
        'Started At': task.startedAt,
        'Completed At': task.completedAt,
        'Notes': `[${task.legacyId} | Stage: ${task.originalStage} | Source Value: ${task.originalValue} | Sheet: ${task.sourceSheet} | Row: ${task.sourceRow}]`,
        'Updated At': task.updatedAt
      };
      return await callAppsScript('createTask', { sessionId, data: taskData });
    }, 'Importing Tasks');
    migrationStats.tasksImported = taskResults.results.filter(r => r.success).length;
    migrationStats.errors.push(...taskResults.errors);
  } else {
    console.log('\n--- 2/3 TASKS: All historical tasks already imported ---');
    migrationStats.tasksImported = payload.tasks.length;
  }

  // 3. Import PAYMENTS
  if (paymentsToInsert.length > 0) {
    console.log('\n--- 3/3 Importing PAYMENTS ---');
    const paymentResults = await executeWithConcurrency(paymentsToInsert, async (pay) => {
      const payData = {
        'Payment ID': pay.paymentId,
        'Job ID': pay.jobId,
        'Client': pay.client,
        'Amount': pay.amount,
        'Advance': pay.advance,
        'Balance': pay.balance,
        'Status': pay.status,
        'Payment Date': pay.paymentDate,
        'Notes': `[${pay.legacyId} | Sheet: ${pay.sourceSheet} | Row: ${pay.sourceRow}] ${pay.notes}`,
        'Updated At': pay.updatedAt
      };
      return await callAppsScript('createPayment', { sessionId, data: payData });
    }, 'Importing Payments');
    migrationStats.paymentsImported = paymentResults.results.filter(r => r.success).length;
    migrationStats.errors.push(...paymentResults.errors);
  } else {
    console.log('\n--- 3/3 PAYMENTS: All historical payments already imported ---');
    migrationStats.paymentsImported = payload.payments.length;
  }

  migrationStats.status = 'COMPLETED';

  // Save Migration Report
  fs.writeFileSync(MIGRATION_LOG_PATH, JSON.stringify(migrationStats, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log('MIGRATION DATA QUALITY REPORT');
  console.log('====================================================');
  console.log(`- Total Source Records: ${migrationStats.totalSourceRecords}`);
  console.log(`- Jobs Imported: ${migrationStats.jobsImported}`);
  console.log(`- Tasks Imported: ${migrationStats.tasksImported}`);
  console.log(`- Payments Imported: ${migrationStats.paymentsImported}`);
  console.log(`- Daily Work Records in Payload: ${payload.dailyWork.length}`);
  console.log(`- Rows Skipped (Template/Blank): ${migrationStats.rowsSkipped}`);
  console.log(`- Unmapped Employees: ${migrationStats.unmappedEmployees.join(', ') || 'None'}`);
  console.log(`- Suspicious Dates (Preserved & Flagged): ${migrationStats.suspiciousDates}`);
  console.log(`- Duplicate Candidates Handled: ${migrationStats.duplicateCandidates}`);
  console.log(`- Records Requiring Review: ${migrationStats.recordsRequiringReview}`);
  console.log(`- Migration Status: ${migrationStats.status}`);
  console.log(`- Report Saved to: ${MIGRATION_LOG_PATH}`);
  console.log('====================================================\n');

  return migrationStats;
}

if (require.main === module) {
  runMigration().catch(console.error);
}

module.exports = { runMigration };
