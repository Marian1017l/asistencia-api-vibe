const { CreateAsistenciaDto } = require('../dtos/asistencia.dto');
const { registrarAsistencia, obtenerAsistenciasPorEstudiante } = require('../services/asistencia.service');
const { sendSuccess, sendError } = require('../middlewares/response.middleware');
const { validateEstudianteId, validateEstado, validateFecha } = require('../middlewares/validate.middleware');

const postAsistencia = (req, res) => {
  const { estudianteId, fecha, estado } = req.body;

  if (!estudianteId || !fecha || !estado) return sendError(res, 'PostAsistencia', 'Los campos estudianteId, fecha y estado son requeridos');
  if (!validateEstudianteId(estudianteId)) return sendError(res, 'PostAsistencia', 'El estudianteId debe tener formato EST seguido de 5 dígitos (ej: EST00123)');
  if (!validateEstado(estado)) return sendError(res, 'PostAsistencia', 'El estado debe ser: presente, ausente o justificada');
  if (!validateFecha(fecha)) return sendError(res, 'PostAsistencia', 'La fecha no es válida o es superior a la fecha actual');

  const dto = new CreateAsistenciaDto({ estudianteId, fecha, estado });
  const result = registrarAsistencia(dto);

  if (result.error) return sendError(res, 'PostAsistencia', result.error, result.statusCode);
  sendSuccess(res, 'PostAsistencia', result.data, 201);
};

const getAsistenciasByEstudiante = (req, res) => {
  const { id } = req.params;
  const result = obtenerAsistenciasPorEstudiante(id);

  if (result.error) return sendError(res, 'GetAsistenciasByEstudiante', result.error, 404);
  sendSuccess(res, 'GetAsistenciasByEstudiante', result.data);
};

module.exports = { postAsistencia, getAsistenciasByEstudiante };
