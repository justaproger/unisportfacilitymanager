const express = require('express');
const { body } = require('express-validator');
const {
  getUniversities,
  getUniversity,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  addAdministrator,
  removeAdministrator
} = require('../controllers/universityController');
const { protect, authorize, belongsToUniversity } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `university-${uniqueSuffix}.${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// University validation rules
const universityValidation = [
  body('name').notEmpty().withMessage('University name is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State/Province is required'),
  body('address.zipCode').notEmpty().withMessage('Zip/Postal code is required'),
  body('address.country').notEmpty().withMessage('Country is required'),
  body('contact.email').isEmail().withMessage('Please include a valid email'),
  body('contact.phone').notEmpty().withMessage('Contact phone is required')
];

// Public routes
router.get('/', getUniversities);
router.get('/:id', getUniversity);

// Protected routes - Super Admin only
router.post(
  '/', 
  protect, 
  authorize('super-admin'),
  upload.single('logo'),
  createUniversity
);

router.delete(
  '/:id', 
  protect, 
  authorize('super-admin'),
  deleteUniversity
);

router.post(
  '/:id/administrators', 
  protect, 
  authorize('super-admin'),
  addAdministrator
);

router.delete(
  '/:id/administrators/:userId', 
  protect, 
  authorize('super-admin'),
  removeAdministrator
);

// Protected routes - University Admin or Super Admin
router.put(
  '/:id', 
  protect, 
  authorize('admin', 'super-admin'),
  belongsToUniversity,
  upload.single('logo'),
  updateUniversity
);

module.exports = router;