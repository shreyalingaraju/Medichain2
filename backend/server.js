const express = require('express');
const db = require('./db');
const patientRoutes = require('./routes/patientRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const auditRoutes = require('./routes/auditRoutes');
const qrRoutes = require('./routes/qrRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Audit log middleware
app.use((req, res, next) => {
  const role = req.headers['x-user-role'] || 'unknown'; // Example: get role from headers
  const action = `Requested ${req.path}`;
  const method = req.method;
  const url = req.originalUrl;

  const sql = `INSERT INTO audit_logs (role, action, method, url) VALUES (?, ?, ?, ?)`;
  db.run(sql, [role, action, method, url], function(err) {
    if (err) {
      console.error('Failed to insert audit log:', err.message);
    }
  });

  next();
});

// Routes
app.use('/patients', patientRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/audit', auditRoutes);
app.use('/qr', qrRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
