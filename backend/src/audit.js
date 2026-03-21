function auditLog(event, details = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details,
  };
  console.log('[AUDIT]', JSON.stringify(entry));
}

module.exports = { auditLog };
