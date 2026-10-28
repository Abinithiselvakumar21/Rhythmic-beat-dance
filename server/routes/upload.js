
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyAdmin = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;

    cb(null, uniqueName);
  }
});

const allowedTypes = {
  image: ['image/jpeg', 'image/png', 'image/webp'],
  song: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a']
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const kind = req.body.kind;
    const allowed = allowedTypes[kind];

    if (!allowed || !allowed.includes(file.mimetype)) {
      return cb(new Error('Unsupported file type. Choose a JPG, PNG, WEBP image or supported audio file.'));
    }

    cb(null, true);
  }
});

router.post('/', verifyAdmin, (req, res) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        message: error.message || 'File upload failed'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: 'Please select a file to upload'
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      kind: req.body.kind,
      url: `/uploads/${req.file.filename}`
    });
  });
});

module.exports = router;
