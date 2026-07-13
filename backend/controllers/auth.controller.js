const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const result = await authService.googleLoginUser(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAuthToken(refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const token = await authService.generatePasswordResetToken({ email });
    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, token, newPassword } = req.body;
    await authService.resetUserPassword({ email, token, newPassword });
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};