const mongoose = require('mongoose');

const READY_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

const getDatabaseStatus = () => {
  const readyState = mongoose.connection.readyState;

  return {
    readyState,
    status: READY_STATES[readyState] || 'unknown',
    isConnected: readyState === 1
  };
};

const requireDatabase = (req, res, next) => {
  const database = getDatabaseStatus();

  if (database.isConnected) {
    return next();
  }

  return res.status(503).json({
    success: false,
    code: 'DATABASE_UNAVAILABLE',
/*  */    message: 'Database unavailable. Start MongoDB locally or set MONGO_URI in backend/.env.',
    database
  });
};

module.exports = {
  getDatabaseStatus,
  requireDatabase
};
