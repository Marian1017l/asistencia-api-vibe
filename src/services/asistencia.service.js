const { asistencias, estudiantes } = require('../bd/database');
const { randomUUID } = require('crypto');

const registrarAsistencia = (dto) => {
  const estudianteExiste = estudiantes.find((e) => e.id === dto.estudianteId);
  if (!estudianteExiste) return { error: `Estudiante con ID ${dto.estudianteId} no encontrado`, statusCode: 404 };

  const duplicado = asistencias.find(
    (a) => a.estudianteId === dto.estudianteId && a.fecha === dto.fecha
  );
  if (duplicado) return { error: `Ya existe un registro de asistencia para ${dto.estudianteId} en la fecha ${dto.fecha}`, statusCode: 409 };

  const nueva = { id: randomUUID(), ...dto, creadoEn: new Date().toISOString() };
  asistencias.push(nueva);
  return { data: nueva };
};

const obtenerAsistenciasPorEstudiante = (estudianteId) => {
  const estudianteExiste = estudiantes.find((e) => e.id === estudianteId);
  if (!estudianteExiste) return { error: `Estudiante con ID ${estudianteId} no encontrado` };

  const historial = asistencias.filter((a) => a.estudianteId === estudianteId);
  return { data: historial };
};

module.exports = { registrarAsistencia, obtenerAsistenciasPorEstudiante };
