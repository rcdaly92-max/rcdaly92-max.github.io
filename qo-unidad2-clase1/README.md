# Actividad UTE: Unidad 2, Química Orgánica (Clase 1)

**URL para estudiantes:** https://rcdaly92-max.github.io/qo-unidad2-clase1/

Diez preguntas de selección única (1 punto por acierto), acerca de las propiedades estructurales de los compuestos orgánicos y su nomenclatura. Registra identificación, grupo y respuestas. El servidor calcula aciertos, porcentaje y nota sobre 10.

## Activar recepción en QO (acción de la docente)

1. Abrir el archivo privado [QO](https://docs.google.com/spreadsheets/d/1jU-eKdBcRkboBzaMkICY80xr0mgxGewIpEvC6XclS_o/edit).
2. Abrir **Extensiones → Apps Script**. Crear un proyecto independiente o añadir el receptor `Code.gs` en un proyecto sin funciones `doGet`/`doPost` conflictivas. **No sustituir los receptores de otras actividades.**
3. Copiar el archivo `Code.gs` de esta carpeta, guardar y ejecutar `verificarQO()` para autorizar.
4. En **Implementar → Nueva implementación → Aplicación web**, ejecutar **como la cuenta propietaria** y permitir acceso **Cualquier persona**. Copiar la URL terminada en `/exec`.
5. Editar **solo** `const ENDPOINT='';` en `index.html` y pegar la URL obtenida entre comillas. Publicar el cambio.
6. Probar primero con un alumno ficticio identificable como **PRUEBA TÉCNICA**; confirmar **una fila** en INTENTOS y **diez filas** en RESPUESTAS, además de la confirmación en pantalla. Retirar después las filas de prueba si procede.
7. Entregar el enlace a estudiantes **solo tras** comprobar el registro.

**Criterio:** 1 acierto = 1 punto, nota máxima 10. Los datos existentes de INTENTOS y RESPUESTAS se conservan; se agregan filas nuevas. Se evita duplicar el mismo identificador de entrega.

**Importante:** Sin URL /exec configurada, la página se ofrece como práctica y no afirma registrar calificaciones. Nunca reutilizar una URL de otra actividad sin comprobar que el servidor acepte `qo-unidad2-clase1`.

**Privacidad:** La hoja QO debe permanecer privada; no publicar enlaces de acceso a edición ni claves. El script valida el identificador de la actividad y calcula la puntuación en servidor.
