import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";

import {
  buscarPorCorreo,
  crearUsuario,
  obtenerGoogleClientID,
  guardarSecretFA,
  obtenerSecretFA,
  ObtenerUsuario,
  ActualizarDatosUsuario,
  ActualizarFotoPerfil,
  ActualizarContrasena,
  resetearIntentos,
  bloquearUsuario,
  incrementarIntentos,
  obtenerPaises,
  obtenerUbiPorDependencia,
} from "../Datos/DatosUsuario.js";

const SALT_ROUNDS = 10;

export async function registrarUsuario(nombre, apellidos, correo, contrasena, telefono, Direccion) {
  try {
    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
    const result = await crearUsuario({
      Nombre: nombre,
      Apellidos: apellidos,
      Correo: correo,
      Contrasena: hash,
      Telefono: telefono,
      Direccion,
    });
    return result;
  } catch (err) {
    console.error("Error servicio registrarUsuario:", err);
    throw err;
  }
}

export function servicioObtenerGoogleClientID() {
  return obtenerGoogleClientID();
}

export async function loginUsuario(correo, contrasena) {
  try {
    const usuario = await buscarPorCorreo(correo);
    if (!usuario) throw "Correo o contraseña incorrectas";

    if (usuario.Bloqueado === "Bloqueado") throw "Tu cuenta está bloqueada. Restablece tu contraseña.";

    const esValida = await bcrypt.compare(contrasena, usuario.Contrasena || "");

    if (!esValida) {
      // incrementar intentos
      await incrementarIntentos(correo);
      // obtener usuario actualizado
      const usuarioActualizado = await buscarPorCorreo(correo);
      const nuevosIntentos = usuarioActualizado?.IntentosFallidos || 0;
      if (nuevosIntentos >= 4) {
        await bloquearUsuario(correo);
        throw { tipo: "bloqueado", mensaje: "Tu cuenta ha sido bloqueada. Ve a 'Recuperar contraseña'." };
      }
      throw { tipo: "credenciales", mensaje: `Credenciales incorrectas. Intentos restantes: ${4 - nuevosIntentos}` };
    }

    // contraseña correcta: resetear intentos
    await resetearIntentos(correo);

    const necesitaConfigurar2FA = !usuario.SecretFA || usuario.SecretFA.trim() === "";

    return {
      Id_Usuario: usuario.Id_Usuario,
      Nombre: usuario.Nombre,
      Correo: usuario.Correo,
      necesitaConfigurar2FA,
    };
  } catch (err) {
    // re-lanzar para controlador
    throw err;
  }
}

export async function loginORegistrarConGoogle(token) {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    let usuarioExistente = await buscarPorCorreo(email);

    if (usuarioExistente) {
      const tiene2FA = usuarioExistente.SecretFA && usuarioExistente.SecretFA.trim() !== "";
      return { usuario: usuarioExistente, necesitaConfigurar2FA: !tiene2FA };
    }

    // crear usuario nuevo (sin contraseña)
    await crearUsuario({
      Nombre: given_name,
      Apellidos: family_name || "",
      Correo: email,
      Contrasena: null,
      Telefono: null,
      Direccion: null,
    });

    const nuevoUsuario = await buscarPorCorreo(email);
    return { usuario: nuevoUsuario, necesitaConfigurar2FA: true };
  } catch (err) {
    console.error("Error loginORegistrarConGoogle:", err);
    throw err;
  }
}

export async function generarSecretoFA(idUsuario) {
  try {
    const secretObj = speakeasy.generateSecret({ length: 20 });
    const secretBase32 = secretObj.base32;
    await guardarSecretFA(idUsuario, secretBase32);
    return { secret: secretBase32, otpauth_url: secretObj.otpauth_url };
  } catch (err) {
    console.error("Error generarSecretoFA:", err);
    throw err;
  }
}

export async function validarCodigoFA(idUsuario, codigo) {
  try {
    const secreto = await obtenerSecretFA(idUsuario);
    if (!secreto) return false;
    const isValid = speakeasy.totp.verify({
      secret: secreto,
      encoding: "base32",
      token: codigo,
      window: 1,
    });
    return isValid;
  } catch (err) {
    console.error("Error validarCodigoFA:", err);
    throw err;
  }
}

// Otros servicios adaptados a async/await:
export async function servicioObtenerUsuario(idUsuario) {
  try {
    const u = await ObtenerUsuario(idUsuario);
    return u;
  } catch (err) {
    throw err;
  }
}

export async function servicioActualizarDatosUsuario(idUsuario, datos) {
  try {
    const res = await ActualizarDatosUsuario(idUsuario, datos);
    return res;
  } catch (err) {
    throw err;
  }
}

export async function servicioActualizarFotoPerfil(idUsuario, FotoPerfil) {
  try {
    const res = await ActualizarFotoPerfil(idUsuario, FotoPerfil);
    return res;
  } catch (err) {
    throw err;
  }
}

export async function servicioActualizarContrasena(correo, nuevaContrasena) {
  try {
    const usuario = await buscarPorCorreo(correo);
    if (!usuario) throw "Usuario no encontrado";
    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await ActualizarContrasena(usuario.Id_Usuario, hash);
    await resetearIntentos(correo);
    return { mensaje: "Contraseña actualizada correctamente" };
  } catch (err) {
    throw err;
  }
}

export async function servicioVerificarCorreoRecuperacion(correo) {
  const usuario = await buscarPorCorreo(correo);
  if (!usuario) throw "Correo no encontrado";
  return { mensaje: "Correo válido", Id_Usuario: usuario.Id_Usuario };
}

export async function servicioVerificarTokenRecuperacion(Id_Usuario, token) {
  try {
    const secreto = await obtenerSecretFA(Id_Usuario);
    if (!secreto) throw "Token no encontrado";
    const valido = speakeasy.totp.verify({ secret: secreto, encoding: "base32", token, window: 1 });
    if (!valido) throw "Token inválido o expirado";
    return { mensaje: "Token válido" };
  } catch (err) {
    throw err;
  }
}

export async function servicioObtenerPaises() {
  return await obtenerPaises();
}

export async function servicioObtenerDependencias(idPadre) {
  return await obtenerUbiPorDependencia(idPadre);
}
