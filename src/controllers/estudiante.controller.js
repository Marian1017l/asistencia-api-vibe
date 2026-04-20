const { CreateEstudianteDto } = require('../dtos/estudiante.dto');
const { crearEstudiante, obtenerEstudiantes, obtenerEstudiantePorId } = require('../services/estudiante.service');
const { sendSuccess, sendError } = require('../middlewares/response.middleware');
const { validateEstudianteId } = require('../middlewares/validate.middleware');

const postEstudiante = (req, res) => {
  const { id, nombre, email, programa } = req.body;

  if (!id || !nombre) return sendError(res, 'PostEstudiante', 'Los campos id y nombre son requeridos');
  if (!validateEstudianteId(id)) return sendError(res, 'PostEstudiante', 'El ID debe tener formato EST seguido de 5 dígitos (ej: EST00123)');

  const dto = new CreateEstudianteDto({ id, nombre, email, programa });
  const result = crearEstudiante(dto);

  if (result.error) return sendError(res, 'PostEstudiante', result.error, 409);
  sendSuccess(res, 'PostEstudiante', result.data, 201);
};

const getEstudiantes = (req, res) => {
  const data = obtenerEstudiantes();
  sendSuccess(res, 'GetEstudiantes', data);
};

const getEstudianteById = (req, res) => {
  const { id } = req.params;
  const result = obtenerEstudiantePorId(id);

  if (result.error) return sendError(res, 'GetEstudianteById', result.error, 404);
  sendSuccess(res, 'GetEstudianteById', result.data);
};

module.exports = { postEstudiante, getEstudiantes, getEstudianteById };
