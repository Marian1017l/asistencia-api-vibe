const { Router } = require('express');
const { getTopAusentismo } = require('../controllers/reporte.controller');

const router = Router();

router.get('/ausentismo', getTopAusentismo);

module.exports = router;
