const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const providerController = require('../controllers/provider.controller');

router.use(protect);
router.get('/', providerController.getProviders);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);

module.exports = router;
