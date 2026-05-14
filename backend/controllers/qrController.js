const path = require('path');
const fs = require('fs');

exports.getQR = (req, res) => {
  const { id } = req.params;
  const filePath = path.join(__dirname, '../qrcodes', `${id}.png`);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'QR code not found for this patient' });
  }
};
