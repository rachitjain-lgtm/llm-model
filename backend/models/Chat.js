const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    model: {
      type: String,
      default: 'gpt-4o',
    },
    provider: {
      type: String,
      default: 'Cloud AI',
    },
    settings: {
      maxTokens: { type: Number, default: 2048 },
      temperature: { type: Number, default: 0.7 },
      useGuardrails: { type: Boolean, default: true },
      useKnowledgeBase: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chat', chatSchema);