const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

// In-memory file storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

router.post('/', protect, upload.single('file'), uploadController.uploadFile);

module.exports = router;
