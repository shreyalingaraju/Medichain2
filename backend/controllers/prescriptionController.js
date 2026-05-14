const db = require('../db');
const fs = require('fs');
const path = require('path');

const drugsDataPath = path.join(__dirname, '../data/drugs.json');
let drugsData = {};
try {
  drugsData = JSON.parse(fs.readFileSync(drugsDataPath, 'utf8'));
} catch (err) {
  console.error("Could not load drugs data:", err.message);
}

exports.createPrescription = (req, res) => {
  const { patient_id, medication, dosage, instructions } = req.body;
  if (!patient_id || !medication || !dosage) {
    return res.status(400).json({ error: 'patient_id, medication, and dosage are required' });
  }

  const newDrug = medication.toLowerCase();

  // Fetch current prescriptions for the patient
  db.all('SELECT medication FROM prescriptions WHERE patient_id = ?', [patient_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    let highestSeverity = 'safe';
    let interactingDrug = null;

    if (drugsData[newDrug]) {
      const existingDrugs = rows.map(r => r.medication.toLowerCase());
      const interactions = drugsData[newDrug].interacts_with || [];

      for (let interaction of interactions) {
        let interactionName = typeof interaction === 'string' ? interaction : interaction.drug;
        let interactionSeverity = typeof interaction === 'string' ? 'severe' : interaction.severity;

        if (existingDrugs.includes(interactionName)) {
          if (interactionSeverity === 'severe') {
            highestSeverity = 'severe';
            interactingDrug = interactionName;
            break; // Severe is highest, no need to check further
          } else if (interactionSeverity === 'moderate' && highestSeverity !== 'severe') {
            highestSeverity = 'moderate';
            interactingDrug = interactionName;
          }
        }
      }
    }

    if (highestSeverity === 'severe') {
      return res.status(400).json({ 
        error: `Warning: Severe interaction detected with ${interactingDrug}. Prescription not saved.`,
        interaction: 'severe'
      });
    }

    const sql = `INSERT INTO prescriptions (patient_id, medication, dosage, instructions) VALUES (?, ?, ?, ?)`;
    db.run(sql, [patient_id, medication, dosage, instructions], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ 
        id: this.lastID, 
        message: 'Prescription added successfully',
        interaction: highestSeverity
      });
    });
  });
};
