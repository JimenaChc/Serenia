import nodemailer from "nodemailer";
import { crearVerificacion, obtenerCorreoPorToken, eliminarVerificacion } from "../Datos/DatosVerificacion.js";

// Enviar correo de verificación
export const enviarCorreoVerificacion = async (correo) => {
  return new Promise((resolve, reject) => {
    crearVerificacion(correo, async (err, token) => {
      if (err) return reject("Error al generar token");

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.CORREO_APP,
          pass: process.env.PASS_CORREO_APP,
        },
      });

      const link = `http://localhost:3000/completar-registro.html?token=${token}`;

      const mailOptions = {
        from: process.env.CORREO_APP,
        to: correo,
        subject: "Verifica tu correo electrónico",
        html: `
          <h2>¡Ya falta poco!</h2>
          <p>Hola:</p>
          <p>Para terminar de configurar tu cuenta y empezar, confirma que tenemos tu correo electrónico correcto.</p>
          <a href="${link}" style="background-color:#4CAF50;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verifica tu correo electrónico</a>
        `,
      };

      await transporter.sendMail(mailOptions);
      resolve("Correo enviado correctamente");
    });
  });
};

// Validar token recibido desde el enlace
export const validarToken = async (token) => {
  return new Promise((resolve, reject) => {
    obtenerCorreoPorToken(token, (err, correo) => {
      if (err) reject("Error al validar token");
      else if (!correo) reject("Token inválido o expirado");
      else resolve(correo);
    });
  });
};

// Eliminar token una vez usado
export const eliminarToken = eliminarVerificacion;