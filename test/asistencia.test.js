const request = require('supertest');
const app = require('../src/app');
const { resetDatabase } = require('../src/bd/database');

const ESTUDIANTE_BASE = { id: 'EST00100', nombre: 'Test Estudiante', email: 'test@uni.edu', programa: 'Sistemas' };

beforeEach(async () => {
  resetDatabase();
  await request(app).post('/api/estudiantes').send(ESTUDIANTE_BASE);
});

describe('POST /api/asistencias', () => {
  it('debe registrar asistencia "presente" exitosamente y retornar 201', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2026-04-20',
      estado: 'presente',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.response).toMatchObject({ estudianteId: 'EST00100', estado: 'presente' });
    expect(res.body.response).toHaveProperty('id');
  });

  it('debe registrar asistencia "ausente" exitosamente y retornar 201', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2026-04-19',
      estado: 'ausente',
    });

    expect(res.status).toBe(201);
    expect(res.body.response.estado).toBe('ausente');
  });

  it('debe registrar asistencia "justificada" exitosamente y retornar 201', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2026-04-18',
      estado: 'justificada',
    });

    expect(res.status).toBe(201);
    expect(res.body.response.estado).toBe('justificada');
  });

  it('debe rechazar un estado inválido (violación de enum) y retornar 400', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2026-04-17',
      estado: 'tardanza',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toMatch(/presente|ausente|justificada/i);
  });

  it('debe rechazar una fecha futura y retornar 400', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2030-12-31',
      estado: 'presente',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toMatch(/fecha/i);
  });

  it('debe rechazar una asistencia duplicada para la misma fecha y retornar 409', async () => {
    await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2026-04-15',
      estado: 'presente',
    });

    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
      fecha: '2026-04-15',
      estado: 'ausente',
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('debe rechazar cuando el estudiante no existe y retornar 404', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST99999',
      fecha: '2026-04-20',
      estado: 'presente',
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('debe rechazar cuando faltan campos requeridos y retornar 400', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'EST00100',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toMatch(/requeridos/i);
  });

  it('debe rechazar un body malformado (JSON inválido) y retornar 400', async () => {
    const res = await request(app)
      .post('/api/asistencias')
      .set('Content-Type', 'application/json')
      .send('{ estudianteId: EST00100, fecha: 2026-04-20 }');

    expect(res.status).toBe(400);
  });

  it('debe rechazar un estudianteId con formato inválido y retornar 400', async () => {
    const res = await request(app).post('/api/asistencias').send({
      estudianteId: 'NOFORMATO',
      fecha: '2026-04-20',
      estado: 'presente',
    });

    expect(res.status).toBe(400);
    expect(res.body.errors).toMatch(/formato/i);
  });
});

describe('GET /api/asistencias/estudiante/:id', () => {
  it('debe retornar el historial completo del estudiante', async () => {
    await request(app).post('/api/asistencias').send({ estudianteId: 'EST00100', fecha: '2026-04-10', estado: 'presente' });
    await request(app).post('/api/asistencias').send({ estudianteId: 'EST00100', fecha: '2026-04-11', estado: 'ausente' });

    const res = await request(app).get('/api/asistencias/estudiante/EST00100');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.response)).toBe(true);
    expect(res.body.response.length).toBe(2);
    expect(res.body.method).toBe('GetAsistenciasByEstudiante');
  });

  it('debe retornar 404 si el estudiante no existe', async () => {
    const res = await request(app).get('/api/asistencias/estudiante/EST99998');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('debe retornar lista vacía si el estudiante existe pero no tiene asistencias', async () => {
    const res = await request(app).get('/api/asistencias/estudiante/EST00100');

    expect(res.status).toBe(200);
    expect(res.body.response).toEqual([]);
  });
});
