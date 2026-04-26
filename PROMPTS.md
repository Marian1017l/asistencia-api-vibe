# FASE 1

## Contexto

Necesito desarrollar el backend de una API REST para controlar la asistencia de estudiantes de un programa académico. El sistema debe gestionar estudiantes y sus respectivos registros de presencia o ausencia, permitiendo además la generación de reportes básicos.

## Tecnologías Requeridas

-   **Entorno:** Node.js.

## Definición de Endpoints

Implementa los siguientes controladores endpoints el estándar REST:

-   `POST /api/estudiantes`: Crear un estudiante.
-   `GET /api/estudiantes`: Obtener listado completo de estudiantes.
-   `GET /api/estudiantes/:id`: Estudiante por ID.
-   `POST /api/asistencias`: Registrar asistencia.
-   `GET /api/asistencias/estudiante/:id`: Historial completo por estudiante.
-   `GET /api/reportes/ausentismo`: Ranking (Top 5) de estudiantes con mayor número de ausencias.

## Reglas de Negocio y Validaciones

-   **ID Estudiante:** Formato obligatorio `EST` seguido de 5 dígitos (ej: `EST00123`).
-   **Estados de asistencias:** Solo se permiten valores: `presente`, `ausente`, `justificada`.
-   **Unicidad:** Impedir registros duplicados para el mismo `estudianteId` en la misma fecha.
-   **Consistencia Temporal:** La fecha no puede ser superior a la fecha actual del servidor.

## Estructura

Separa las carpetas en:
- `/controllers`
- `/services`
- `/routes`
- `/middlewares` (si aplica)
- `/bd` (si aplica)
- `/dtos` (si aplica)

## Formato de respuestas

Sigue la estructura JSON siguiente para las respuestas de los endpoints:

```json
{
 "status": 200,
 "succes": true,
 "errors": null,
 "method": "GetStudent",
 "response": {...}
}
```

## Repositorio

Realiza commits con la siguiente estructura:

`feat-chore-fix-refactor (nombre del modulo): "descripción commit"`

Los commits se deben hacer limpios, no hacer commit con muchos cambios, solamente cambios puntuales.

**Nota:** No me indiques qué estás realizando en texto, simplemente procede a hacerlo, no gastes palabras en explicarlo.

# FASE 2

## Objetivo

Realizar una auditoría completa de los endpoints de la API para asegurar su correcto funcionamiento, validando tanto los casos de éxito como los de error.

## Tareas

1.  **Crear Lista de Chequeo:**
    -   En el archivo `AUDITORIA.md`, elabora una lista de chequeo detallada para cada endpoint.
    -   Define los criterios de aceptación, incluyendo:
        -   **Estado de Respuesta HTTP**
        -   **Formato de Respuesta JSON**
        -   **Validación de Reglas de Negocio:** Comprueba la lógica de negocio (unicidad, formato de ID, etc.).
        -   **Manejo de Errores:** Verifica que los errores se gestionen y reporten adecuadamente.

2.  **Ejecutar Pruebas:**
    -   Inicia el servidor de la aplicación.
    -   Utiliza la consola (por ejemplo, con `curl`) para realizar peticiones a cada endpoint y probar los criterios definidos.
    -   Documenta los comandos utilizados y las respuestas obtenidas.

3.  **Generar Reporte de Auditoría:**
    -   En `AUDITORIA.md`, actualiza el estado de cada prueba (CUMPLE / NO CUMPLE).
    -   Crea una tabla resumen que marque con una `X` el resultado de cada validación por endpoint para una visualización rápida.
    -   Si un endpoint "NO CUMPLE", proporciona una breve descripción del problema encontrado.

# FASE 3

## Objetivo
Crear y ejecutar un conjunto de pruebas automatizadas para todos los endpoints de la API, asegurando la robustez y el correcto funcionamiento del backend.

## Tareas

1.  **Instalación de Dependencias:**
    -   Instalar Jest y Supertest como dependencias de desarrollo.
        ```bash
        npm install --save-dev jest supertest
        ```

2.  **Configuración de Pruebas:**
    -   Añadir un script en `package.json` para ejecutar las pruebas con el comando `npm test`.

3.  **Creación de Casos de Prueba:**
    -   Crear un directorio `test/` en la raíz del proyecto.
    -   Dentro de `test/`, desarrollar los archivos de prueba para cada endpoint, cubriendo los siguientes escenarios como mínimo:
        -   Creación de estudiante (caso exitoso).
        -   Código de estudiante inválido.
        -   Duplicidad en la información.
        -   Asistencia válida.
        -   Asistencia incorrecta por violación de `enum`.
        -   Fecha futura al crear asistencia.
        -   Asistencia duplicada.
        -   `StatusCode` correcto de acuerdo al caso (404 para no encontrados, 409 para conflicto, etc.).
        -   Generación de reporte de ausentismo con los campos pertinentes y desde 1 estudiante hasta todos.
        -   Mal formato en JSON u otro tipo de `body` enviado.
        -   Validación correcta con DTOs.

4.  **Documentación de Resultados:**
    -   Tras ejecutar las pruebas, documentar los resultados en `AUDITORIA.MD`.
    -   Para cada prueba, indicar si **pasó** o **no pasó**.
    -   En caso de que una prueba no pase, explicar la razón (ej. "Se esperaba un status 409 pero se recibió 500", "La respuesta no incluyó el objeto esperado", etc.).