import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";
import Encriptador from "./ServicioEncriptarDesencriptar.js";
import { buscarPorCorreo,crearUsuario,obtenerGoogleClientID, guardarSecretFA, obtenerSecretFA,ObtenerUsuario,ActualizarDatosUsuario,ActualizarFotoPerfil } from "../Datos/DatosUsuario.js";

const encriptador = new Encriptador(process.env.ENCRYPTION_SECRET, process.env.ENCRYPTION_SALT);
export async function registrarUsuario(nombre, apellidos, correo, contrasena, telefono) {
  return new Promise(async (resolve, reject) => {
    try {
      // Cifrar la contraseña antes de guardarla
      const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
      const sql = "CALL RegistrarUsuario(?, ?, ?, ?, ?)";
      conexion.query(sql, [nombre, apellidos, correo, hash, telefono], (err, resultado) => {
        if (err) reject(err);
        else resolve(resultado);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function servicioObtenerGoogleClientID() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  return clientId;
}

export async function loginUsuario(correo, contrasena) {
  return new Promise((resolve, reject) => {
    buscarPorCorreo(correo, async (err, usuario) => {
      if (err) return reject("Error al consultar usuario");
      if (!usuario) return reject("Usuario no encontrado");
    

     const esValida = await bcrypt.compare(contrasena, usuario.Contrasena);
      if (!esValida) return reject("Correo o contraseña incorrectas");

 
    const necesitaConfigurar2FA = !usuario.SecretFA || usuario.SecretFA.trim() === "";

    let telefonoDescifrado = usuario.Telefono;
      try {
        telefonoDescifrado = descifrarTexto(usuario.Telefono);
      } catch (e) {
        // si falla, lo dejamos tal cual
        telefonoDescifrado = usuario.Telefono;
      }
  
      resolve({
        Id_Usuario: usuario.Id_Usuario,
        Nombre: usuario.Nombre,
        Correo: usuario.Correo,
        necesitaConfigurar2FA
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
      try {
        if (usuario && usuario.Telefono) usuario.Telefono = descifrarTexto(usuario.Telefono);
      } catch (e) {
        // si falla, devolvemos lo que haya
      }
      resolve(usuario);
    });
  });
}

// Actualizar datos generales
export function servicioActualizarDatosUsuario(idUsuario, datos) {
  return new Promise((resolve, reject) => {
     if (datos && datos.telefono !== undefined && datos.telefono !== null) {
      datos.telefono = datos.telefono ? cifrarTexto(datos.telefono) : datos.telefono;
    }
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

     const secretCifrado = encriptador.cifrar(secretBase32);
    // Guardar en la BD con la función de datos corregida
    guardarSecretFA(idUsuario, secretCifrado, (err, result) => {
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
    obtenerSecretFA(idUsuario, (err, secretoCifrado) => {
      if (err) return reject(err);
      if (!secretoCifrado) return resolve(false);
      const secreto = encriptador.descifrar(secretoCifrado);
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