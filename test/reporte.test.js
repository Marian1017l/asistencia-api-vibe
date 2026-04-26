const request = require('supertest');
const app = require('../src/app');
const { resetDatabase } = require('../src/bd/database');

const crearEstudiante = (id, nombre) =>
  request(app).post('/api/estudiantes').send({ id, nombre, email: `${id}@uni.edu`, programa: 'Sistemas' });

const registrarAusencia = (estudianteId, fecha) =>
  request(app).post('/api/asistencias').send({ estudianteId, fecha, estado: 'ausente' });

beforeEach(() => resetDatabase());

describe('GET /api/reportes/ausentismo', () => {
  it('debe retornar lista vacía cuando no hay ausencias', async () => {
    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.response)).toBe(true);
    expect(res.body.response.length).toBe(0);
    expect(res.body.method).toBe('GetTopAusentismo');
  });

  it('debe retornar ranking con 1 estudiante y los campos correctos', async () => {
    await crearEstudiante('EST00200', 'Sofía');
    await registrarAusencia('EST00200', '2026-04-10');

    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.status).toBe(200);
    expect(res.body.response.length).toBe(1);

    const entrada = res.body.response[0];
    expect(entrada).toHaveProperty('estudianteId', 'EST00200');
    expect(entrada).toHaveProperty('nombre', 'Sofía');
    expect(entrada).toHaveProperty('ausencias', 1);
  });

  it('debe retornar máximo 5 estudiantes en el ranking (Top 5)', async () => {
    for (let i = 1; i <= 7; i++) {
      const id = `EST002${String(i).padStart(2, '0')}`;
      await crearEstudiante(id, `Estudiante ${i}`);
      await registrarAusencia(id, '2026-04-10');
    }

    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.status).toBe(200);
    expect(res.body.response.length).toBeLessThanOrEqual(5);
  });

  it('debe ordenar el ranking de mayor a menor número de ausencias', async () => {
    await crearEstudiante('EST00301', 'Primero');
    await crearEstudiante('EST00302', 'Segundo');
    await crearEstudiante('EST00303', 'Tercero');

    await registrarAusencia('EST00302', '2026-04-10');
    await registrarAusencia('EST00302', '2026-04-11');
    await registrarAusencia('EST00302', '2026-04-12');

    await registrarAusencia('EST00301', '2026-04-10');
    await registrarAusencia('EST00301', '2026-04-11');

    await registrarAusencia('EST00303', '2026-04-10');

    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.status).toBe(200);
    const ranking = res.body.response;
    expect(ranking[0].estudianteId).toBe('EST00302');
    expect(ranking[0].ausencias).toBe(3);
    expect(ranking[1].estudianteId).toBe('EST00301');
    expect(ranking[1].ausencias).toBe(2);
    expect(ranking[2].estudianteId).toBe('EST00303');
    expect(ranking[2].ausencias).toBe(1);
  });

  it('no debe incluir asistencias "presente" o "justificada" en el conteo', async () => {
    await crearEstudiante('EST00400', 'Carlos');
    await request(app).post('/api/asistencias').send({ estudianteId: 'EST00400', fecha: '2026-04-10', estado: 'presente' });
    await request(app).post('/api/asistencias').send({ estudianteId: 'EST00400', fecha: '2026-04-11', estado: 'justificada' });

    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.status).toBe(200);
    expect(res.body.response.length).toBe(0);
  });

  it('debe incluir todos los estudiantes con ausencias hasta el top 5', async () => {
    await crearEstudiante('EST00501', 'A');
    await crearEstudiante('EST00502', 'B');
    await crearEstudiante('EST00503', 'C');

    await registrarAusencia('EST00501', '2026-04-10');
    await registrarAusencia('EST00502', '2026-04-10');
    await registrarAusencia('EST00503', '2026-04-10');

    const res = await request(app).get('/api/reportes/ausentismo');

    expect(res.status).toBe(200);
    expect(res.body.response.length).toBe(3);
  });
});
