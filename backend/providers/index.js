const openrouter = require("./openrouter.provider");
const openai = require("./openai.provider");
const azure = require("./azure.provider");
const nvidia = require("./nvidia.provider");
const awsBedrock = require("./aws-bedrock.provider");
const huggingface = require("./huggingface.provider");

const registry = {
  openrouter,
  openai,
  azure,
  nvidia,
  "aws-bedrock": awsBedrock,
  huggingface,
};

const normalizeProviderId = (provider) => {
  if (!provider) return "openrouter";
  return String(provider).toLowerCase().trim();
};

const getProvider = (provider) => registry[normalizeProviderId(provider)] || registry.openrouter;

module.exports = {
  registry,
  getProvider,
  normalizeProviderId,
};
