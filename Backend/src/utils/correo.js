import nodemailer from 'nodemailer';
import config from '../../Config.js';
import logger from './logger.js';

const { correo } = config;
const transporte = correo.host
  ? nodemailer.createTransport({
      host: correo.host,
      port: correo.puerto,
      secure: correo.seguro,
      auth: correo.usuario ? { user: correo.usuario, pass: correo.password } : undefined,
    })
  : null;

const escapar = (valor) =>
  String(valor).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Correo con el diseño de PROYECTADAS: un título, párrafos y un botón opcional. */
function plantilla({ titulo, parrafos, boton }) {
  const cuerpo = parrafos.map((p) => `<p style="margin:0 0 14px;line-height:1.6">${escapar(p)}</p>`).join('');
  const accion = boton
    ? `<p style="margin:24px 0"><a href="${escapar(boton.url)}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#7b2cbf;color:#ffffff;font-weight:700;text-decoration:none">${escapar(boton.texto)}</a></p>
       <p style="margin:0 0 14px;font-size:13px;color:#9a94a8">Si el botón no funciona, copia este enlace en tu navegador:<br>${escapar(boton.url)}</p>`
    : '';
  return `<div style="background:#13131b;padding:32px 16px;font-family:Inter,Arial,sans-serif;color:#e4e1ed">
  <div style="max-width:520px;margin:0 auto;background:#1b1b23;border-radius:20px;padding:32px">
    <p style="margin:0 0 24px;font-size:20px;font-weight:800;letter-spacing:-0.02em">PROYECTADAS</p>
    <h1 style="margin:0 0 16px;font-size:22px">${escapar(titulo)}</h1>
    ${cuerpo}${accion}
  </div>
</div>`;
}

/**
 * Envía un correo. Sin SMTP configurado lo escribe en el log (para probar en desarrollo).
 * Nunca lanza: un correo que falla no debe romper la acción que lo pidió.
 */
export async function enviarCorreo({ para, asunto, titulo, parrafos, boton }) {
  const texto = [...parrafos, boton ? `${boton.texto}: ${boton.url}` : ''].filter(Boolean).join('\n\n');
  if (!transporte) {
    logger.info(`[correo no enviado: falta SMTP_HOST] Para: ${para} · ${asunto}\n${texto}`);
    return false;
  }
  try {
    await transporte.sendMail({
      from: correo.remitente,
      to: para,
      subject: asunto,
      text: texto,
      html: plantilla({ titulo: titulo ?? asunto, parrafos, boton }),
    });
    return true;
  } catch (error) {
    logger.error(`No se pudo enviar el correo "${asunto}" a ${para}: ${error.message}`);
    return false;
  }
}

export const correoRecuperacion = (usuario, enlace) => ({
  para: usuario.email,
  asunto: 'Restablece tu contraseña de PROYECTADAS',
  titulo: 'Crea una contraseña nueva',
  parrafos: [
    `Hola, ${usuario.nombre}. Recibimos una solicitud para restablecer la contraseña de @${usuario.username}.`,
    'El enlace vence en 1 hora y solo sirve una vez. Si no lo pediste, ignora este correo: tu contraseña no cambiará.',
  ],
  boton: { texto: 'Crear contraseña nueva', url: enlace },
});

export const correoPasswordCambiada = (usuario) => ({
  para: usuario.email,
  asunto: 'Tu contraseña de PROYECTADAS cambió',
  parrafos: [
    `Hola, ${usuario.nombre}. La contraseña de @${usuario.username} se cambió y se cerraron las sesiones en tus otros dispositivos.`,
    'Si no fuiste tú, restablécela de inmediato desde "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.',
  ],
});

export const correoEmailCambiado = (usuario, correoAnterior) => ({
  para: correoAnterior,
  asunto: 'El correo de tu cuenta de PROYECTADAS cambió',
  parrafos: [
    `Hola, ${usuario.nombre}. El correo de @${usuario.username} ahora es ${usuario.email}.`,
    'Si no fuiste tú, comunícate con el equipo de PROYECTADAS desde la página de Soporte.',
  ],
});
