const STUDENT_ID_REGEX = /^EST\d{5}$/;
const VALID_STATES = ['presente', 'ausente', 'justificada'];

const validateEstudianteId = (id) => STUDENT_ID_REGEX.test(id);

const validateEstado = (estado) => VALID_STATES.includes(estado);

const validateFecha = (fecha) => {
  const date = new Date(fecha);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
};

module.exports = { validateEstudianteId, validateEstado, validateFecha };
