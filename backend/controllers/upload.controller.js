const uploadService = require('../services/upload.service');

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const text = await uploadService.parseFile(req.file);
    res.status(200).json({ success: true, text });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadFile,
};
