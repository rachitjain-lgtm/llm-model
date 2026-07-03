const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { verifyAccessToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = verifyAccessToken(token);
    const db = getDb();
    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    
    delete user.password;
    user.id = user._id.toString();
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

module.exports = { protect };