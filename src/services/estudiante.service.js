const { estudiantes } = require('../bd/database');

const crearEstudiante = (dto) => {
  const existe = estudiantes.find((e) => e.id === dto.id);
  if (existe) return { error: `Ya existe un estudiante con el ID ${dto.id}` };

  const nuevo = { ...dto, creadoEn: new Date().toISOString() };
  estudiantes.push(nuevo);
  return { data: nuevo };
};

const obtenerEstudiantes = () => estudiantes;

const obtenerEstudiantePorId = (id) => {
  const estudiante = estudiantes.find((e) => e.id === id);
  if (!estudiante) return { error: `Estudiante con ID ${id} no encontrado` };
  return { data: estudiante };
};

module.exports = { crearEstudiante, obtenerEstudiantes, obtenerEstudiantePorId };
