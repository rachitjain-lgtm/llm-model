const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');

const BUILTIN_PROFILES = [
  {
    id: 'openrouter',
    name: 'OpenRouter Default',
    providerType: 'openrouter',
    isBuiltin: true,
    config: {
      apiKey: process.env.OPENROUTER_API_KEY || '',
      apiBaseUrl: process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
      appName: process.env.OPENROUTER_APP_NAME || 'AI Studio',
    },
    models: [
      { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1' },
      { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3' },
      { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
      { id: 'x-ai/grok-4.3', label: 'Grok 4.3' },
      { id: 'google/gemma-3-12b-it', label: 'Gemma 3 12B' },
      { id: 'mistralai/mistral-small-3.2-24b-instruct', label: 'Mistral Small 3.2 24B' },
      { id: 'qwen/qwen3-coder', label: 'Qwen 3 Coder' },
    ],
  },
  {
    id: 'nvidia',
    name: 'NVIDIA Default',
    providerType: 'nvidia',
    isBuiltin: true,
    config: {
      apiKey: process.env.NVIDIA_API_KEY || '',
      apiBaseUrl: process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1/chat/completions',
    },
    models: [
      { id: 'meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B' },
      { id: 'meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
      { id: 'meta/llama-3.3-70b-instruct', label: 'Llama 3.3 70B (NVIDIA)' },
      { id: 'meta/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 Vision (NVIDIA)' },
    ],
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeList = (models) => {
  if (!models) return [];
  if (Array.isArray(models)) {
    return models.map((model) => {
      if (typeof model === 'string') {
        return { id: model, label: model };
      }
      return {
        id: model.id,
        label: model.label || model.id,
      };
    }).filter((model) => model.id);
  }
  if (typeof models === 'string') {
    return models.split(',').map((m) => m.trim()).filter(Boolean).map((m) => ({ id: m, label: m }));
  }
  return [];
};

const sanitizeProfile = (profile) => ({
  id: profile.id,
  name: profile.name,
  providerType: profile.providerType,
  isBuiltin: !!profile.isBuiltin,
  config: profile.config || {},
  models: normalizeList(profile.models),
  createdAt: profile.createdAt,
  updatedAt: profile.updatedAt,
});

const getCustomCollection = () => getDb().collection('provider_profiles');

const listProviderProfiles = async (userId) => {
  const custom = await getCustomCollection().find({ userId: new ObjectId(userId) }).sort({ updatedAt: -1 }).toArray();
  return [...BUILTIN_PROFILES.map(clone), ...custom.map((profile) => sanitizeProfile({
    id: profile._id.toString(),
    name: profile.name,
    providerType: profile.providerType,
    isBuiltin: false,
    config: profile.config || {},
    models: profile.models || [],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  }))];
};

const getProviderProfileById = async (providerProfileId, userId) => {
  if (!providerProfileId) return clone(BUILTIN_PROFILES[0]);

  const builtin = BUILTIN_PROFILES.find((profile) => profile.id === providerProfileId);
  if (builtin) return clone(builtin);

  if (ObjectId.isValid(providerProfileId)) {
    const custom = await getCustomCollection().findOne({ _id: new ObjectId(providerProfileId), userId: new ObjectId(userId) });
    if (custom) {
      return sanitizeProfile({
        id: custom._id.toString(),
        name: custom.name,
        providerType: custom.providerType,
        isBuiltin: false,
        config: custom.config || {},
        models: custom.models || [],
        createdAt: custom.createdAt,
        updatedAt: custom.updatedAt,
      });
    }
  }

  return clone(BUILTIN_PROFILES[0]);
};

const createProviderProfile = async (userId, payload) => {
  const db = getDb();
  const providerType = String(payload.providerType || '').toLowerCase().trim();
  if (!providerType) {
    throw new Error('providerType is required');
  }

  const doc = {
    userId: new ObjectId(userId),
    name: payload.name || `${providerType} profile`,
    providerType,
    config: payload.config || {},
    models: normalizeList(payload.models),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection('provider_profiles').insertOne(doc);
  return sanitizeProfile({
    id: result.insertedId.toString(),
    ...doc,
  });
};

const updateProviderProfile = async (profileId, userId, payload) => {
  const db = getDb();
  const objId = new ObjectId(profileId);
  const existing = await db.collection('provider_profiles').findOne({ _id: objId, userId: new ObjectId(userId) });
  if (!existing) {
    throw new Error('Provider profile not found');
  }

  const updated = {
    ...existing,
    name: payload.name ?? existing.name,
    providerType: payload.providerType ? String(payload.providerType).toLowerCase().trim() : existing.providerType,
    config: payload.config ? { ...existing.config, ...payload.config } : existing.config,
    models: payload.models ? normalizeList(payload.models) : normalizeList(existing.models),
    updatedAt: new Date(),
  };

  await db.collection('provider_profiles').updateOne(
    { _id: objId, userId: new ObjectId(userId) },
    { $set: updated }
  );

  return sanitizeProfile({ id: profileId, ...updated });
};

const deleteProviderProfile = async (profileId, userId) => {
  const db = getDb();
  if (!ObjectId.isValid(profileId)) return true;
  await db.collection('provider_profiles').deleteOne({ _id: new ObjectId(profileId), userId: new ObjectId(userId) });
  return true;
};

module.exports = {
  BUILTIN_PROFILES,
  listProviderProfiles,
  getProviderProfileById,
  createProviderProfile,
  updateProviderProfile,
  deleteProviderProfile,
};
