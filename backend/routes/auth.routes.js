const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidation, loginValidation } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/google', authController.googleLogin);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;