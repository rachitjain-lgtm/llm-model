const providerService = require('../services/provider.service');

const getProviders = async (req, res) => {
  try {
    const providers = await providerService.listProviderProfiles(req.user.id);
    res.status(200).json({ success: true, data: providers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createProvider = async (req, res) => {
  try {
    const provider = await providerService.createProviderProfile(req.user.id, req.body);
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateProvider = async (req, res) => {
  try {
    const provider = await providerService.updateProviderProfile(req.params.id, req.user.id, req.body);
    res.status(200).json({ success: true, data: provider });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteProvider = async (req, res) => {
  try {
    await providerService.deleteProviderProfile(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: 'Provider deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
};
