const request = require('supertest');
const app = require('../src/app');
const { resetDatabase } = require('../src/bd/database');

beforeEach(() => resetDatabase());

describe('POST /api/estudiantes', () => {
  it('debe crear un estudiante exitosamente y retornar 201', async () => {
    const res = await request(app).post('/api/estudiantes').send({
      id: 'EST00001',
      nombre: 'Ana García',
      email: 'ana@uni.edu',
      programa: 'Sistemas',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.response).toMatchObject({ id: 'EST00001', nombre: 'Ana García' });
  });

  it('debe rechazar un ID con formato inválido y retornar 400', async () => {
    const res = await request(app).post('/api/estudiantes').send({
      id: 'ST001',
      nombre: 'Luis Pérez',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toMatch(/formato/i);
  });

  it('debe rechazar cuando faltan campos requeridos y retornar 400', async () => {
    const res = await request(app).post('/api/estudiantes').send({ id: 'EST00002' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toMatch(/requeridos/i);
  });

  it('debe rechazar un ID duplicado y retornar 409', async () => {
    await request(app).post('/api/estudiantes').send({ id: 'EST00003', nombre: 'Pedro' });
    const res = await request(app).post('/api/estudiantes').send({ id: 'EST00003', nombre: 'Pedro Copia' });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('debe rechazar un body malformado (no JSON) y retornar 400', async () => {
    const res = await request(app)
      .post('/api/estudiantes')
      .set('Content-Type', 'application/json')
      .send('{ id: EST00004, nombre: }');

    expect(res.status).toBe(400);
  });

  it('debe validar correctamente el DTO y persistir solo los campos definidos', async () => {
    const res = await request(app).post('/api/estudiantes').send({
      id: 'EST00005',
      nombre: 'María',
      email: 'maria@uni.edu',
      programa: 'Derecho',
      campoExtra: 'ignorado',
    });

    expect(res.status).toBe(201);
    expect(res.body.response).toHaveProperty('id', 'EST00005');
    expect(res.body.response).toHaveProperty('nombre', 'María');
    expect(res.body.response).toHaveProperty('email');
    expect(res.body.response).toHaveProperty('programa');
  });
});

describe('GET /api/estudiantes', () => {
  it('debe retornar lista vacía cuando no hay estudiantes', async () => {
    const res = await request(app).get('/api/estudiantes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.response)).toBe(true);
    expect(res.body.response.length).toBe(0);
  });

  it('debe retornar todos los estudiantes registrados', async () => {
    await request(app).post('/api/estudiantes').send({ id: 'EST00010', nombre: 'Carlos' });
    await request(app).post('/api/estudiantes').send({ id: 'EST00011', nombre: 'Diana' });

    const res = await request(app).get('/api/estudiantes');

    expect(res.status).toBe(200);
    expect(res.body.response.length).toBe(2);
  });
});

describe('GET /api/estudiantes/:id', () => {
  it('debe retornar el estudiante cuando existe', async () => {
    await request(app).post('/api/estudiantes').send({ id: 'EST00020', nombre: 'Elena' });

    const res = await request(app).get('/api/estudiantes/EST00020');

    expect(res.status).toBe(200);
    expect(res.body.response.id).toBe('EST00020');
    expect(res.body.method).toBe('GetEstudianteById');
  });

  it('debe retornar 404 cuando el estudiante no existe', async () => {
    const res = await request(app).get('/api/estudiantes/EST99999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
