const { Router } = require('express');
const { postEstudiante, getEstudiantes, getEstudianteById } = require('../controllers/estudiante.controller');

const router = Router();

router.post('/', postEstudiante);
router.get('/', getEstudiantes);
router.get('/:id', getEstudianteById);

module.exports = router;
