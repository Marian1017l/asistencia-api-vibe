const express = require('express');
const estudianteRoutes = require('./routes/estudiante.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');
const reporteRoutes = require('./routes/reporte.routes');

const app = express();

app.use(express.json());

app.use('/api/estudiantes', estudianteRoutes);
app.use('/api/asistencias', asistenciaRoutes);
app.use('/api/reportes', reporteRoutes);

module.exports = app;
