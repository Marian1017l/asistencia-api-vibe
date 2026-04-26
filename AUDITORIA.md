# Auditoría de Endpoints — API de Asistencias

## Checklist original

| # | Aspecto | Pregunta |
|---|---------|----------|
| 1 | Validación de entrada | ¿Valida el formato del código del estudiante? ¿Rechaza fechas futuras? ¿Valida el enum del estado? |
| 2 | Manejo de errores | ¿Hay try/catch en las rutas? ¿Devuelve códigos HTTP correctos (400, 404, 409, 500)? |
| 3 | Inyección y seguridad | Si usa base de datos, ¿parametriza consultas? ¿Escapa entradas? ¿Tiene rate limiting? ¿CORS configurado? |
| 4 | Datos sensibles | ¿Expone información de estudiantes sin autenticación? ¿Hay manejo de datos personales según habeas data? |
| 5 | Estructura y mantenibilidad | ¿Separa rutas, controladores y lógica? ¿O todo está en `index.js`? ¿Los nombres son descriptivos? |
| 6 | Dependencias | ¿Qué paquetes agregó? ¿Los necesita? ¿Tienen vulnerabilidades? Ejecuta `npm audit`. |
| 7 | Configuración | ¿Hardcodea puertos o credenciales? ¿Usa variables de entorno? ¿Hay `.env.example`? |
| 8 | Idempotencia y duplicados | ¿Permite registrar dos asistencias iguales para el mismo estudiante y fecha? |
| 9 | Pruebas | ¿Generó alguna prueba automatizada? ¿O cero? |
| 10 | Documentación | ¿El README explica cómo correrlo? ¿Hay comentarios útiles o vacíos? |

---

## Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/estudiantes` | Crear estudiante |
| GET | `/api/estudiantes` | Listar todos los estudiantes |
| GET | `/api/estudiantes/:id` | Obtener estudiante por ID |
| POST | `/api/asistencias` | Registrar asistencia |
| GET | `/api/asistencias/estudiante/:id` | Ver historial de asistencia |
| GET | `/api/reportes/ausentismo` | Top 5 estudiantes con más ausencias |

---

## Pruebas por consola

### Grupo A — Estudiantes

#### T1 — POST estudiante válido
```
curl -X POST http://localhost:3000/api/estudiantes
  -d '{"id":"EST00001","nombre":"Ana García","email":"ana@uni.edu","programa":"Ingeniería"}'
```
**Respuesta obtenida:** HTTP 201
```json
{"status":201,"success":true,"errors":null,"method":"PostEstudiante",
 "response":{"id":"EST00001","nombre":"Ana García","email":"ana@uni.edu",
 "programa":"Ingeniería","creadoEn":"2026-04-20T15:24:41.076Z"}}
```
**Resultado:** CUMPLE — código 201, formato estándar, `creadoEn` generado.

---

#### T2 — POST estudiante con ID duplicado
```
curl -X POST http://localhost:3000/api/estudiantes
  -d '{"id":"EST00001","nombre":"Otro"}'
```
**Respuesta obtenida:** HTTP 409
```json
{"status":409,"success":false,"errors":"Ya existe un estudiante con el ID EST00001","method":"PostEstudiante","response":null}
```
**Resultado:** CUMPLE — detecta duplicado y devuelve 409 Conflict con mensaje descriptivo.

---

#### T3 — POST estudiante con ID en formato inválido
```
curl -X POST http://localhost:3000/api/estudiantes
  -d '{"id":"123ABC","nombre":"Carlos"}'
```
**Respuesta obtenida:** HTTP 400
```json
{"status":400,"success":false,"errors":"El ID debe tener formato EST seguido de 5 dígitos (ej: EST00123)","method":"PostEstudiante","response":null}
```
**Resultado:** CUMPLE — valida regex `^EST\d{5}$` y devuelve 400 con mensaje claro.

---

#### T4 — POST estudiante sin campos requeridos
```
curl -X POST http://localhost:3000/api/estudiantes
  -d '{"id":"EST00002"}'
```
**Respuesta obtenida:** HTTP 400
```json
{"status":400,"success":false,"errors":"Los campos id y nombre son requeridos","method":"PostEstudiante","response":null}
```
**Resultado:** CUMPLE — detecta ausencia de campos obligatorios.

---

#### T5 — GET todos los estudiantes
```
curl http://localhost:3000/api/estudiantes
```
**Respuesta obtenida:** HTTP 200 — array de objetos estudiante.
**Resultado:** CUMPLE — devuelve 200 con lista correcta.

---

#### T6 — GET estudiante por ID existente
```
curl http://localhost:3000/api/estudiantes/EST00001
```
**Respuesta obtenida:** HTTP 200 — objeto estudiante.
**Resultado:** CUMPLE — devuelve 200 con datos del estudiante.

---

#### T7 — GET estudiante por ID inexistente
```
curl http://localhost:3000/api/estudiantes/EST99999
```
**Respuesta obtenida:** HTTP 404
```json
{"status":404,"success":false,"errors":"Estudiante con ID EST99999 no encontrado","method":"GetEstudianteById","response":null}
```
**Resultado:** CUMPLE — devuelve 404 con mensaje descriptivo.

---

### Grupo B — Asistencias

#### T8 — POST asistencia válida
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST00001","fecha":"2026-04-15","estado":"presente"}'
```
**Respuesta obtenida:** HTTP 201
```json
{"status":201,"success":true,"errors":null,"method":"PostAsistencia",
 "response":{"id":"0b08d136-...","estudianteId":"EST00001","fecha":"2026-04-15","estado":"presente","creadoEn":"..."}}
```
**Resultado:** CUMPLE — 201, UUID generado, `creadoEn` correcto.

---

#### T9 — POST asistencia con fecha futura
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST00001","fecha":"2030-01-01","estado":"presente"}'
```
**Respuesta obtenida:** HTTP 400
```json
{"status":400,"success":false,"errors":"La fecha no es válida o es superior a la fecha actual",...}
```
**Resultado:** CUMPLE — rechaza fechas futuras.

---

#### T10 — POST asistencia con estado inválido
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST00001","fecha":"2026-04-14","estado":"tardanza"}'
```
**Respuesta obtenida:** HTTP 400
```json
{"status":400,"success":false,"errors":"El estado debe ser: presente, ausente o justificada",...}
```
**Resultado:** CUMPLE — valida enum `[presente, ausente, justificada]`.

---

#### T11 — POST asistencia duplicada (mismo estudiante y fecha)
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST00001","fecha":"2026-04-15","estado":"ausente"}'
```
**Respuesta obtenida:** HTTP 409
```json
{"status":409,"success":false,"errors":"Ya existe un registro de asistencia para EST00001 en la fecha 2026-04-15",...}
```
**Resultado:** CUMPLE — impide duplicados por estudiante+fecha.

---

#### T12 — POST asistencia con estudiante inexistente
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST99999","fecha":"2026-04-14","estado":"ausente"}'
```
**Respuesta obtenida (antes del fix):** HTTP **409** (esperado: **404**)

> **Corrección aplicada:** El servicio `registrarAsistencia` ahora incluye `statusCode` en el objeto de error y el controlador lo propaga. Después del fix devuelve correctamente HTTP 404.

**Respuesta obtenida (después del fix):** HTTP 404
```json
{"status":404,"success":false,"errors":"Estudiante con ID EST99999 no encontrado","method":"PostAsistencia","response":null}
```
**Resultado:** CUMPLE (tras corrección)

---

#### T13 — POST asistencia sin campos requeridos
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST00001"}'
```
**Respuesta obtenida:** HTTP 400
```json
{"status":400,"success":false,"errors":"Los campos estudianteId, fecha y estado son requeridos",...}
```
**Resultado:** CUMPLE — valida presencia de todos los campos.

---

#### T14 — GET asistencias de estudiante existente
```
curl http://localhost:3000/api/asistencias/estudiante/EST00001
```
**Respuesta obtenida:** HTTP 200 — array con registros de asistencia.
**Resultado:** CUMPLE — devuelve historial correcto.

---

#### T15 — GET asistencias de estudiante inexistente
```
curl http://localhost:3000/api/asistencias/estudiante/EST99999
```
**Respuesta obtenida:** HTTP 404
```json
{"status":404,"success":false,"errors":"Estudiante con ID EST99999 no encontrado",...}
```
**Resultado:** CUMPLE — 404 correcto.

---

### Grupo C — Reportes y casos especiales

#### T16 — GET reporte de ausentismo
```
curl http://localhost:3000/api/reportes/ausentismo
```
**Respuesta obtenida:** HTTP 200
```json
{"status":200,"success":true,"errors":null,"method":"GetTopAusentismo",
 "response":[{"estudianteId":"EST00001","nombre":"Ana García","ausencias":1},
             {"estudianteId":"EST00002","nombre":"Carlos Lopez","ausencias":1}]}
```
**Resultado:** CUMPLE — devuelve ranking, máximo 5, ordenado por ausencias.

---

#### T17 — POST asistencia con fecha no parseable
```
curl -X POST http://localhost:3000/api/asistencias
  -d '{"estudianteId":"EST00001","fecha":"no-es-fecha","estado":"presente"}'
```
**Respuesta obtenida:** HTTP 400
```json
{"status":400,"success":false,"errors":"La fecha no es válida o es superior a la fecha actual",...}
```
**Resultado:** CUMPLE — `isNaN(date.getTime())` detecta valores imposibles.

---

#### T18 — Ruta no existente
```
curl http://localhost:3000/api/ruta-inexistente
```
**Respuesta obtenida:** HTTP 404 — HTML de Express con stack interno expuesto.
**Resultado:** NO CUMPLE — respuesta en HTML (no JSON) y sin middleware global que estandarice el error.

---

#### T19 — CORS desde origen externo
```
curl -I -X OPTIONS http://localhost:3000/api/estudiantes
  -H "Origin: http://malicio.us"
```
**Respuesta obtenida:** Sin cabeceras `Access-Control-*`.
**Resultado:** NO CUMPLE — CORS no está configurado; navegadores bloquearán peticiones cross-origin.

---

#### T20 — Body JSON malformado
```
curl -X POST http://localhost:3000/api/estudiantes
  -d 'texto no json'
```
**Respuesta obtenida:** HTTP 400 — HTML con stack trace completo del servidor.
**Resultado:** NO CUMPLE — expone rutas internas del sistema en la respuesta.

---

#### T21 — npm audit
```
npm audit
```
**Resultado:** `found 0 vulnerabilities`
**Resultado:** CUMPLE — sin vulnerabilidades conocidas en dependencias.

---

## Pruebas automatizadas (Jest + Supertest)

**Fecha de ejecución:** 2026-04-26
**Comando:** `npm test`
**Resultado general:** ✅ 29/29 pruebas pasaron

### Resumen por suite

| Suite | Pruebas | Resultado |
|---|---|---|
| `test/estudiante.test.js` | 9 | ✅ Todas pasaron |
| `test/asistencia.test.js` | 14 | ✅ Todas pasaron |
| `test/reporte.test.js` | 6 | ✅ Todas pasaron |

### Detalle por prueba

#### Estudiantes

| # | Descripción | Status esperado | Status recibido | Resultado |
|---|---|---|---|---|
| 1 | Crear estudiante exitosamente | 201 | 201 | ✅ Pasó |
| 2 | ID con formato inválido | 400 | 400 | ✅ Pasó |
| 3 | Campos requeridos faltantes | 400 | 400 | ✅ Pasó |
| 4 | ID duplicado | 409 | 409 | ✅ Pasó |
| 5 | Body malformado (JSON inválido) | 400 | 400 | ✅ Pasó |
| 6 | Validación correcta con DTO (campos persistidos) | 201 | 201 | ✅ Pasó |
| 7 | Lista vacía cuando no hay estudiantes | 200 | 200 | ✅ Pasó |
| 8 | Retornar todos los estudiantes registrados | 200 | 200 | ✅ Pasó |
| 9 | Estudiante encontrado por ID | 200 | 200 | ✅ Pasó |
| 10 | Estudiante no existe → 404 | 404 | 404 | ✅ Pasó |

#### Asistencias

| # | Descripción | Status esperado | Status recibido | Resultado |
|---|---|---|---|---|
| 11 | Registrar asistencia "presente" | 201 | 201 | ✅ Pasó |
| 12 | Registrar asistencia "ausente" | 201 | 201 | ✅ Pasó |
| 13 | Registrar asistencia "justificada" | 201 | 201 | ✅ Pasó |
| 14 | Estado inválido (violación de enum) | 400 | 400 | ✅ Pasó |
| 15 | Fecha futura | 400 | 400 | ✅ Pasó |
| 16 | Asistencia duplicada (mismo estudianteId + fecha) | 409 | 409 | ✅ Pasó |
| 17 | Estudiante no existe → 404 | 404 | 404 | ✅ Pasó* |
| 18 | Campos requeridos faltantes | 400 | 400 | ✅ Pasó |
| 19 | Body malformado (JSON inválido) | 400 | 400 | ✅ Pasó |
| 20 | estudianteId con formato inválido | 400 | 400 | ✅ Pasó |
| 21 | Historial completo del estudiante | 200 | 200 | ✅ Pasó |
| 22 | Historial de estudiante inexistente → 404 | 404 | 404 | ✅ Pasó |
| 23 | Estudiante sin asistencias → array vacío | 200 | 200 | ✅ Pasó |

> *Prueba 17 detectó un bug: el controlador devolvía 409 en lugar de 404 para estudiante no encontrado. Se corrigió propagando el `statusCode` desde el servicio.

#### Reportes

| # | Descripción | Status esperado | Status recibido | Resultado |
|---|---|---|---|---|
| 24 | Lista vacía cuando no hay ausencias | 200 | 200 | ✅ Pasó |
| 25 | Ranking con 1 estudiante y campos correctos | 200 | 200 | ✅ Pasó |
| 26 | Máximo 5 estudiantes en el ranking (Top 5) | 200 | 200 | ✅ Pasó |
| 27 | Ordenado de mayor a menor número de ausencias | 200 | 200 | ✅ Pasó |
| 28 | No incluye "presente" ni "justificada" en el conteo | 200 | 200 | ✅ Pasó |
| 29 | Incluye todos los estudiantes con ausencias hasta Top 5 | 200 | 200 | ✅ Pasó |

### Correcciones aplicadas durante la ejecución de pruebas

| Problema detectado | Corrección aplicada |
|---|---|
| `uuid@14` usa ESM y Jest no lo soporta en modo CommonJS | Reemplazado por `crypto.randomUUID()` nativo de Node.js |
| `POST /api/asistencias` devolvía 409 cuando el estudiante no existía | Servicio ahora incluye `statusCode` en el objeto de error; el controlador lo propaga |

---

## Tabla de resultados consolidada

| # | Aspecto | Criterio evaluado | Resultado | Cumple | No Cumple |
|---|---------|-------------------|-----------|--------|-----------|
| 1a | Validación — ID estudiante | Formato `EST` + 5 dígitos (T3) | Regex `^EST\d{5}$` aplicada correctamente | X | |
| 1b | Validación — fecha futura | Rechaza fechas > hoy (T9) | `validateFecha` bloquea correctamente | X | |
| 1c | Validación — fecha inválida | Rechaza strings no fecha (T17) | `isNaN` detecta valores imposibles | X | |
| 1d | Validación — enum estado | Solo acepta presente/ausente/justificada (T10) | Enum validado en middleware | X | |
| 1e | Validación — campos requeridos | Rechaza cuerpos incompletos (T4, T13) | Mensajes descriptivos, HTTP 400 | X | |
| 2a | Manejo errores — HTTP 400 | Entrada inválida devuelve 400 (T3, T4, T9, T10, T13, T17) | Correcto | X | |
| 2b | Manejo errores — HTTP 404 | Recurso no encontrado devuelve 404 (T7, T12, T15) | Correcto tras fix en T12 | X | |
| 2c | Manejo errores — HTTP 409 | Duplicados devuelven 409 (T2, T11) | Correcto | X | |
| 2d | Manejo errores — HTTP 500 | Errores internos manejados con try/catch | Sin try/catch ni middleware global de errores | | X |
| 2e | Manejo errores — ruta inexistente | Devuelve JSON estándar en rutas no definidas (T18) | Devuelve HTML con mensaje de Express crudo | | X |
| 2f | Manejo errores — body malformado | JSON inválido produce respuesta controlada (T20) | Devuelve HTML con stack trace expuesto | | X |
| 3a | Seguridad — inyección SQL/NoSQL | No usa base de datos relacional/documental | Almacenamiento en memoria, no aplica inyección | X | |
| 3b | Seguridad — rate limiting | Límite de peticiones por IP/tiempo | Sin rate limiting implementado | | X |
| 3c | Seguridad — CORS | Cabeceras Access-Control configuradas (T19) | CORS no configurado | | X |
| 4a | Datos sensibles — autenticación | Endpoints protegidos con token/sesión | Todos los endpoints son públicos | | X |
| 4b | Datos sensibles — habeas data | Mecanismo para anonimizar/eliminar datos | Sin ningún control de privacidad | | X |
| 5a | Estructura — separación de capas | Rutas, controladores, servicios separados | Arquitectura en capas correcta (routes/controllers/services/dtos) | X | |
| 5b | Estructura — nombres descriptivos | Identificadores claros y en idioma consistente | Nombres descriptivos en español | X | |
| 6a | Dependencias — necesarias | Paquetes justificados | Solo `express`, `uuid` reemplazado por `crypto` nativo | X | |
| 6b | Dependencias — vulnerabilidades | `npm audit` sin hallazgos (T21) | 0 vulnerabilidades | X | |
| 7a | Configuración — puerto | Puerto via variable de entorno | `process.env.PORT \|\| 3000` correcto | X | |
| 7b | Configuración — `.env.example` | Plantilla de variables de entorno | No existe `.env.example` | | X |
| 8  | Idempotencia — duplicados | Impide registrar dos asistencias mismo estudiante+fecha (T11) | Verificación en servicio, retorna 409 | X | |
| 9  | Pruebas automatizadas | Archivos de test con Jest + Supertest | 29 pruebas, 29 pasaron (100%) | X | |
| 10a | Documentación — README | Instrucciones para ejecutar el proyecto | README vacío | | X |
| 10b | Documentación — comentarios | Comentarios útiles en código no obvio | Sin comentarios en ningún archivo | | X |

---

## Resumen ejecutivo

| Estado | Cantidad |
|--------|----------|
| **CUMPLE** | **16** |
| **NO CUMPLE** | **10** |

### Problemas críticos (alta prioridad)

1. **T18/T20 — Sin middleware global de errores**: Rutas no definidas y JSON malformado devuelven HTML con stack traces internos expuestos, lo que filtra rutas del sistema operativo.
2. **Sin autenticación**: Cualquier cliente puede leer, crear y consultar datos de todos los estudiantes.
3. **Sin CORS**: Peticiones desde navegadores en otros dominios fallarán o serán irrestrictas según configuración del cliente.

### Problemas moderados

4. Sin `try/catch` en controladores — una excepción no controlada derrumba el servidor.
5. Sin rate limiting — vulnerable a abuso y denegación de servicio.
6. README vacío — no hay instrucciones de instalación ni uso.
