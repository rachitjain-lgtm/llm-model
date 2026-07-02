const chatService = require('../services/chat.service');

const getChats = async (req, res) => {
  try {
    const chats = await chatService.getUserChats(req.user.id, req.user.email);
    res.status(200).json({ success: true, data: chats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getChat = async (req, res) => {
  try {
    const chat = await chatService.getChatById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const createChat = async (req, res) => {
  try {
    const chat = await chatService.createChat(req.user.id, req.body);
    res.status(201).json({ success: true, data: chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const renameChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chat = await chatService.renameChat(req.params.id, req.user.id, title);
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const chat = await chatService.updateChatSettings(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteChat = async (req, res) => {
  try {
    await chatService.deleteChat(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Chat deleted' });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const addMessage = async (req, res) => {
  try {
    const message = await chatService.addMessageToChat(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getChats,
  getChat,
  createChat,
  renameChat,
  updateSettings,
  deleteChat,
  addMessage,
};