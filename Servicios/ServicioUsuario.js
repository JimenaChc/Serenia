import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { buscarPorCorreo,crearUsuario,obtenerGoogleClientID, guardarSecretFA, obtenerSecretFA,ObtenerUsuario,ActualizarDatosUsuario,ActualizarFotoPerfil } from "../Datos/DatosUsuario.js";
import bcrypt from "bcryptjs";

export async function registrarUsuario(nombre, apellidos, correo, contrasena, telefono) {
  return new Promise((resolve, reject) => {
    const sql = "CALL RegistrarUsuario(?, ?, ?, ?, ?)";
    conexion.query(sql, [nombre, apellidos, correo, contrasena, telefono], (err, resultado) => {
      if (err) reject(err);
      else resolve(resultado);
      }
    );
  });
}

export function servicioObtenerGoogleClientID() {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  console.log("[Servicio] GOOGLE_CLIENT_ID:", clientId); // para verificar
  return clientId;
}

export async function loginUsuario(correo, contrasena) {
  return new Promise((resolve, reject) => {
    buscarPorCorreo(correo, async (err, usuario) => {
      if (err) return reject("Error al consultar usuario");
      if (!usuario) return reject("Usuario no encontrado");

     if (usuario.Contrasena !== contrasena) return reject("Contraseña incorrecta");
  
      resolve({
        Id_Usuario: usuario.Id_Usuario,
        Nombre: usuario.Nombre,
        Correo: usuario.Correo,
      });
    });
  });
}



export async function loginORegistrarConGoogle(token) {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, given_name, family_name } = payload;

  return new Promise((resolve, reject) => {
    buscarPorCorreo(email, (err, usuarioExistente) => {
      if (err) return reject(err);
      console.log(usuarioExistente)

      if (usuarioExistente) {
        // Revisamos si el SecretFA existe y no está vacío
        const tiene2FA = usuarioExistente.SecretFA && usuarioExistente.SecretFA.trim() !== "";
        resolve({ 
          usuario: usuarioExistente,
          necesitaConfigurar2FA: !tiene2FA
        });
      } else {
        // Usuario nuevo: crear cuenta y marcar que necesita configurar 2FA
        crearUsuario({
          Nombre: given_name,
          Apellidos: family_name || "",
          Correo: email,
          Contrasena: null,
          Telefono: null
        }, (err, resultado) => {
          if (err) return reject(err);
          // Recuperamos el usuario recién creado para mantener consistencia
          buscarPorCorreo(email, (err2, nuevoUsuario) => {
            if (err2) return reject(err2);
            resolve({ 
              usuario: nuevoUsuario,
              necesitaConfigurar2FA: true
            });
          });
        });
      }
    });
  });
}


// Obtener usuario por ID
export function servicioObtenerUsuario(idUsuario) {
  return new Promise((resolve, reject) => {
    ObtenerUsuario(idUsuario, (err, usuario) => {
      if (err) return reject(err);
      resolve(usuario);
    });
  });
}

// Actualizar datos generales
export function servicioActualizarDatosUsuario(idUsuario, datos) {
  return new Promise((resolve, reject) => {
    ActualizarDatosUsuario(idUsuario, datos, (err) => {
      if (err) return reject(err);
      resolve({ mensaje: "Datos actualizados correctamente" });
    });
  });
}

// Actualizar foto de perfil
export function servicioActualizarFotoPerfil(idUsuario, FotoPerfil) {
  return new Promise((resolve, reject) => {
    ActualizarFotoPerfil(idUsuario, FotoPerfil, (err) => {
      if (err) return reject(err);
      resolve({ mensaje: "Foto de perfil actualizada correctamente" });
    });
  });
}

//Doble factor de autenticación a la hora de loggearse

export function generarSecretoFA(idUsuario) {
  return new Promise((resolve, reject) => {
    // Genera objeto completo para obtener base32 y otpauth_url
    const secretObj = speakeasy.generateSecret({ length: 20 }); 
    const secretBase32 = secretObj.base32;
    // Guardar en la BD con la función de datos corregida
    guardarSecretFA(idUsuario, secretBase32, (err, result) => {
      if (err) {
        console.error("Servicio -> guardarSecretFA falló:", err);
        return reject(err);
      }
      // devolver tanto el secreto como la url otpauth para generar QR en frontend
      resolve({ secret: secretBase32, otpauth_url: secretObj.otpauth_url });
    });
  });
}

// Validar código TOTP ingresado por el usuario
export function validarCodigoFA(idUsuario, codigo) {
  return new Promise((resolve, reject) => {
    obtenerSecretFA(idUsuario, (err, secreto) => {
      if (err) return reject(err);
      if (!secreto) return resolve(false);

      const isValid = speakeasy.totp.verify({
        secret: secreto,
        encoding: "base32",
        token: codigo,
        window: 1 // margen de 30s antes/después
      });

      resolve(isValid);
    });
  });
}