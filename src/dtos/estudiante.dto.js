class CreateEstudianteDto {
  constructor({ id, nombre, email, programa }) {
    this.id = id;
    this.nombre = nombre;
    this.email = email;
    this.programa = programa;
  }
}

module.exports = { CreateEstudianteDto };
