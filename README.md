# PROYECTADAS · Stream & Create

Plataforma para ver y crear videos verticales (estilo TikTok) con insignias que se ganan publicando sin romper la racha.

- **Backend:** Node.js + Express 5 + MongoDB (Mongoose) + JWT + Multer (`Backend/`)
- **Frontend:** React 19 + Vite + Tailwind CSS 4 + React Router (`Frontend-public/`)

## Requisitos

- Node.js 20.19 o superior
- MongoDB corriendo en `mongodb://127.0.0.1:27017`

## Cómo ejecutarlo

En dos terminales:

```bash
# Backend: API en http://localhost:4000/api y documentación en http://localhost:4000/api/docs
cd Backend
npm install
npm run dev

# Frontend: http://localhost:5173
cd Frontend-public
npm install
npm run dev
```

Si no existe `Backend/.env`, copia `Backend/.env.example` como `.env` y cambia `JWT_SECRET`.

**Datos de demostración (opcional):** `npm run seed` dentro de `Backend/` crea 5 creadores que se siguen entre sí
(contraseña `proyectadas123`). Si colocas videos en `Backend/scripts/videos-demo/`, también los publica.
`npm run seed -- --limpiar` borra y regenera esos datos.

## Páginas

| Ruta | Página |
| --- | --- |
| `/` | **Dashboard:** feed vertical (Tendencias, Siguiendo, Élite Gran Maestro), me gusta (botón o doble toque), guardar en Favoritos y la insignia del creador a la par de su nombre. Comentarios con respuestas en hilo, me gusta y orden "Más votados" o "Más recientes" |
| `/mis-proyectadas` | **Mis Proyectadas:** "Subir Proyectada" abre la galería o el explorador; vista previa en vivo, portada (3 fotogramas del video o una imagen propia), descripción con etiquetas rápidas, "Guardar como Borrador" y "Publicar Proyectada"; racha, vidas e insignia; borradores y proyectadas recientes con filtros Todas / Publicadas / Borradores y "Continuar Edición" |
| `/perfil` | **Mi Perfil:** nombre, biografía, me gusta, seguidores, seguidos y videos; "Camino de Insignias" (trayectoria de rangos + Regla Vital 24H con reloj y vidas); pestañas Proyectadas, Favoritos, Con Me Gusta y Borradores |
| `/u/:usuario` | **Perfil de otro:** se abre al tocar el nombre de alguien; portada con su proyectada más popular, rango de insignias y Proyectadas Públicas (más populares o más recientes) |
| `/privacidad`, `/terminos`, `/insignias`, `/soporte` | **Páginas del pie:** Privacidad, Términos de Servicio, Insignias y Creadores, y Soporte (preguntas frecuentes). Se pueden leer sin iniciar sesión |
| `/login`, `/registro` | Acceso |

La **campana** del encabezado avisa de nuevos seguidores, me gusta a tus proyectadas y comentarios, comentarios y
respuestas, y de tu racha: cuando faltan 4 horas o menos para publicar y cuando tu insignia se apaga. Las
notificaciones se borran solas a los 90 días.

Un **borrador** solo lo ve su autor: no aparece en el feed ni en su perfil público y no cuenta para la racha hasta que
se publica.

Las pantallas siguen los diseños de STITCH. Lo que esos diseños mostraban pero la app no tiene (búsqueda de videos y
hashtags, privacidad y categoría por video, desactivar interacciones, videos fijados, publicaciones programadas,
mensajes, remix/dúo y editor con IA) se omitió o se reemplazó por datos reales.

## Insignias y racha

| Insignia | Forma | Proyectadas en la racha |
| --- | --- | --- |
| Bronce | Círculo | 1 |
| Plata | Círculo | 5 |
| Oro | Círculo | 15 |
| Diamante | Diamante | 30 |
| Rubí | Rombo | 50 |
| Gran Maestro | Corona | 100 |

- Hay que publicar al menos una proyectada cada **24 horas**.
- Si pasan 24 horas sin publicar, la insignia se **apaga** y hay 24 horas más para revivirla (botón *Revivir* o
  publicando). Cada reanimación gasta una oportunidad: **3 → 2 → 1**.
- Sin oportunidades, o si no se revive a tiempo, la insignia se pierde y el progreso vuelve a 0.
- Las oportunidades se reinician cada **1° de mes** (zona horaria `APP_TIMEZONE`, por defecto `America/El_Salvador`).

Los umbrales y las reglas están en `Backend/src/Configs/insignias.js`; la lógica, en `Backend/src/utils/insignias.js`.

## Producción

- **Backend:** define `JWT_SECRET`, `MONGO_URI` y `CORS_ORIGIN` (dominio del frontend). Los videos se guardan en `Backend/uploads/`.
- **Frontend:** define `VITE_API_URL` con la URL del backend antes de `npm run build`. Opcional:
  `VITE_CORREO_SOPORTE` con el correo que se muestra en la página de Soporte.
- Al arrancar, el backend actualiza los datos de versiones anteriores (por ejemplo, marca como publicados los videos
  que existían antes de los borradores).
