const { asistencias, estudiantes } = require('../bd/database');

const obtenerTopAusentismo = () => {
  const conteo = {};

  asistencias
    .filter((a) => a.estado === 'ausente')
    .forEach((a) => {
      conteo[a.estudianteId] = (conteo[a.estudianteId] || 0) + 1;
    });

  const ranking = Object.entries(conteo)
    .map(([estudianteId, ausencias]) => {
      const estudiante = estudiantes.find((e) => e.id === estudianteId);
      return { estudianteId, nombre: estudiante?.nombre || 'Desconocido', ausencias };
    })
    .sort((a, b) => b.ausencias - a.ausencias)
    .slice(0, 5);

  return { data: ranking };
};

module.exports = { obtenerTopAusentismo };
