const { Router } = require('express');
const { postAsistencia, getAsistenciasByEstudiante } = require('../controllers/asistencia.controller');

const router = Router();

router.post('/', postAsistencia);
router.get('/estudiante/:id', getAsistenciasByEstudiante);

module.exports = router;
