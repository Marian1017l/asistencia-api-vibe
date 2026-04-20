class CreateAsistenciaDto {
  constructor({ estudianteId, fecha, estado }) {
    this.estudianteId = estudianteId;
    this.fecha = fecha;
    this.estado = estado;
  }
}

module.exports = { CreateAsistenciaDto };
