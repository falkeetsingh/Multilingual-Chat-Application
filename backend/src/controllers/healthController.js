const getHealth = (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'multilingual-chat-backend',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  getHealth,
};
