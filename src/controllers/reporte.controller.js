const { obtenerTopAusentismo } = require('../services/reporte.service');
const { sendSuccess } = require('../middlewares/response.middleware');

const getTopAusentismo = (req, res) => {
  const result = obtenerTopAusentismo();
  sendSuccess(res, 'GetTopAusentismo', result.data);
};

module.exports = { getTopAusentismo };
