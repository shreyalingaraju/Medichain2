const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'phr.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initDb();
  }
});

function initDb() {
  db.serialize(() => {
    // Create patients table
    db.run(`CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      contact_info TEXT,
      medical_history TEXT,
      blood_group TEXT,
      allergies TEXT,
      emergency_contact TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    // Alter table for existing databases (will silently fail if columns already exist)
    db.run(`ALTER TABLE patients ADD COLUMN blood_group TEXT`, () => {});
    db.run(`ALTER TABLE patients ADD COLUMN allergies TEXT`, () => {});
    db.run(`ALTER TABLE patients ADD COLUMN emergency_contact TEXT`, () => {});

    // Create prescriptions table
    db.run(`CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      medication TEXT NOT NULL,
      dosage TEXT NOT NULL,
      instructions TEXT,
      prescribed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients(id)
    )`);

    // Create audit_logs table
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      role TEXT,
      action TEXT NOT NULL,
      method TEXT NOT NULL,
      url TEXT NOT NULL
    )`);
  });
}

module.exports = db;
