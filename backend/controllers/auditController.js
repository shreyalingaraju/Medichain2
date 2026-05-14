const db = require('../db');

exports.getAuditLogs = (req, res) => {
  const sql = `SELECT * FROM audit_logs ORDER BY timestamp DESC`;
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
