function listPayments(filters) {
  var payments = getRows('PAYMENTS');
  
  return payments.filter(function(p) {
    if (p.Status === 'DELETED') return false;
    if (filters) {
      if (filters.status && p.Status !== filters.status) return false;
      if (filters.jobId && p['Job ID'] !== filters.jobId) return false;
    }
    return true;
  }).map(function(p) {
    delete p._rowIndex;
    return p;
  });
}

function getPayment(paymentId) {
  var p = findById('PAYMENTS', paymentId);
  if (!p || p.Status === 'DELETED') return null;
  delete p._rowIndex;
  return p;
}

function createPayment(data, userId) {
  var now = new Date().toISOString();
  
  var amount = parseFloat(data.Amount) || 0;
  var advance = parseFloat(data.Advance) || 0;
  var balance = amount - advance;
  
  var newPayment = {
    'Payment ID': generateId('PAY'),
    'Job ID': data.JobId || '',
    'Client': data.Client || '',
    'Amount': amount,
    'Advance': advance,
    'Balance': balance,
    'Status': data.Status || 'PENDING',
    'Payment Date': data.PaymentDate || '',
    'Notes': data.Notes || '',
    'Updated At': now
  };
  
  var inserted = insertRow('PAYMENTS', newPayment);
  appendAudit(userId, '', 'CREATE', 'payments', inserted['Payment ID'], '', JSON.stringify(inserted));
  delete inserted._rowIndex;
  return inserted;
}

function updatePayment(paymentId, data, userId) {
  data['Updated At'] = new Date().toISOString();
  if (data.Amount !== undefined || data.Advance !== undefined) {
    var oldP = getPayment(paymentId);
    var amount = data.Amount !== undefined ? parseFloat(data.Amount) : parseFloat(oldP.Amount);
    var advance = data.Advance !== undefined ? parseFloat(data.Advance) : parseFloat(oldP.Advance);
    data.Balance = amount - advance;
  }
  
  var oldData = findById('PAYMENTS', paymentId);
  var updated = updateRow('PAYMENTS', paymentId, data);
  appendAudit(userId, '', 'UPDATE', 'payments', paymentId, JSON.stringify(oldData), JSON.stringify(updated));
  delete updated._rowIndex;
  return updated;
}

function getPaymentSummary() {
  var payments = listPayments();
  var totalRevenue = 0;
  var totalAdvance = 0;
  var outstanding = 0;
  var pendingCount = 0;
  
  payments.forEach(function(p) {
    totalRevenue += parseFloat(p.Amount) || 0;
    totalAdvance += parseFloat(p.Advance) || 0;
    outstanding += parseFloat(p.Balance) || 0;
    if (p.Status === 'PENDING' || p.Status === 'PARTIAL') pendingCount++;
  });
  
  return {
    totalRevenue: totalRevenue,
    totalAdvance: totalAdvance,
    outstanding: outstanding,
    pendingCount: pendingCount
  };
}
