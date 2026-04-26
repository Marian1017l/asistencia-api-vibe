const estudiantes = [];
const asistencias = [];

const resetDatabase = () => {
  estudiantes.splice(0);
  asistencias.splice(0);
};

module.exports = { estudiantes, asistencias, resetDatabase };
