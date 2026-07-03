const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect); // Protect all chat routes

router.get('/', chatController.getChats);
router.post('/', chatController.createChat);
router.get('/:id', chatController.getChat);
router.put('/:id/title', chatController.renameChat);
router.put('/:id/settings', chatController.updateSettings);
router.delete('/:id', chatController.deleteChat);
router.post('/:id/messages', chatController.addMessage);
router.post('/:id/generate', chatController.generateResponse);

module.exports = router;
