const db = require('../db');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const generateQR = async (patientData) => {
  try {
    const tier0Data = {
      name: patientData.name,
      blood_group: patientData.blood_group,
      allergies: patientData.allergies,
      emergency_contact: patientData.emergency_contact
    };
    
    // Simple Base64 "encryption" as requested
    const encryptedData = Buffer.from(JSON.stringify(tier0Data)).toString('base64');
    
    const qrContent = JSON.stringify({
      patient_id: patientData.id,
      tier0: encryptedData
    });
    
    const dir = path.join(__dirname, '../qrcodes');
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    const filePath = path.join(dir, `${patientData.id}.png`);
    await QRCode.toFile(filePath, qrContent);
  } catch (err) {
    console.error('Failed to generate QR code:', err);
  }
};

exports.createPatient = (req, res) => {
  const { name, age, gender, contact_info, medical_history, blood_group, allergies, emergency_contact } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const sql = `INSERT INTO patients (name, age, gender, contact_info, medical_history, blood_group, allergies, emergency_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, age, gender, contact_info, medical_history, blood_group, allergies, emergency_contact], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    const patientId = this.lastID;
    
    generateQR({ id: patientId, name, blood_group, allergies, emergency_contact });
    
    res.status(201).json({ id: patientId, message: 'Patient created successfully' });
  });
};

exports.getPatient = (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM patients WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Patient not found' });
    res.json(row);
  });
};

exports.updatePatient = (req, res) => {
  const { id } = req.params;
  const { name, age, gender, contact_info, medical_history, blood_group, allergies, emergency_contact } = req.body;
  
  const sql = `UPDATE patients SET name = COALESCE(?, name), age = COALESCE(?, age), gender = COALESCE(?, gender), contact_info = COALESCE(?, contact_info), medical_history = COALESCE(?, medical_history), blood_group = COALESCE(?, blood_group), allergies = COALESCE(?, allergies), emergency_contact = COALESCE(?, emergency_contact) WHERE id = ?`;
  db.run(sql, [name, age, gender, contact_info, medical_history, blood_group, allergies, emergency_contact, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: 'Patient not found' });
    
    // Fetch updated patient data to generate new QR code
    db.get('SELECT * FROM patients WHERE id = ?', [id], (err, row) => {
      if (!err && row) {
        generateQR(row);
      }
    });

    res.json({ message: 'Patient updated successfully' });
  });
};
