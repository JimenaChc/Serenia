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


// ------------------------------------------------------
// REGISTRO
// ------------------------------------------------------
export async function registrarUsuario(nombre, apellidos, correo, contrasena, telefono, Direccion) {
  try {
    const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

    return await crearUsuario({
      Nombre: nombre,
      Apellidos: apellidos,
      Correo: correo,
      Contrasena: hash,
      Telefono: telefono,
      Direccion,
    });

  } catch (err) {
    console.error("Error servicio registrarUsuario:", err);
    throw new Error("Error registrando usuario");
  }
}


// ------------------------------------------------------
// LOGIN
// ------------------------------------------------------
export async function loginUsuario(correo, contrasena) {
  try {
    const usuario = await buscarPorCorreo(correo);

    if (!usuario) {
      throw { tipo: "credenciales", mensaje: "Correo o contraseña incorrectas" };
    }

    if (usuario.Bloqueado === "Bloqueado") {
      throw { tipo: "bloqueado", mensaje: "Tu cuenta está bloqueada. Restablece tu contraseña." };
    }

    const esValida = await bcrypt.compare(contrasena, usuario.Contrasena || "");

    if (!esValida) {
      await incrementarIntentos(correo);
      const actualizado = await buscarPorCorreo(correo);

      const intentos = actualizado?.IntentosFallidos || 0;

      if (intentos >= 4) {
        await bloquearUsuario(correo);
        throw { tipo: "bloqueado", mensaje: "Tu cuenta ha sido bloqueada. Ve a 'Recuperar contraseña'." };
      }

      throw {
        tipo: "credenciales",
        mensaje: `Credenciales incorrectas. Intentos restantes: ${4 - intentos}`,
      };
    }

    // contraseña correcta
    await resetearIntentos(correo);

    const necesitaConfigurar2FA =
      !usuario.SecretFA || usuario.SecretFA.trim() === "";

    return {
      Id_Usuario: usuario.Id_Usuario,
      Nombre: usuario.Nombre,
      Correo: usuario.Correo,
      necesitaConfigurar2FA,
    };

  } catch (err) {
    throw err;
  }
}

export function servicioObtenerGoogleClientID() {
  return process.env.GOOGLE_CLIENT_ID;
}


// ------------------------------------------------------
// LOGIN / REGISTRO CON GOOGLE
// ------------------------------------------------------
export async function loginORegistrarConGoogle(token) {
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    let usuario = await buscarPorCorreo(email);

    if (usuario) {
      const tiene2FA = usuario.SecretFA && usuario.SecretFA.trim() !== "";
      return { usuario, necesitaConfigurar2FA: !tiene2FA };
    }

    // crear usuario nuevo
    await crearUsuario({
      Nombre: given_name,
      Apellidos: family_name || "",
      Correo: email,
      Contrasena: null,
      Telefono: null,
      Direccion: null,
    });

    usuario = await buscarPorCorreo(email);
    return { usuario, necesitaConfigurar2FA: true };

  } catch (err) {
    console.error("Error loginORegistrarConGoogle:", err);
    throw new Error("Error procesando Google Login");
  }
}


// ------------------------------------------------------
// 2FA: GENERAR
// ------------------------------------------------------
export async function generarSecretoFA(idUsuario) {
  try {
    const secretObj = speakeasy.generateSecret({ length: 20 });

    await guardarSecretFA(idUsuario, secretObj.base32);

    return {
      secret: secretObj.base32,
      otpauth_url: secretObj.otpauth_url,
    };

  } catch (err) {
    console.error("Error generarSecretoFA:", err);
    throw new Error("Error generando secreto 2FA");
  }
}


// ------------------------------------------------------
// 2FA: VALIDAR
// ------------------------------------------------------
export async function validarCodigoFA(idUsuario, codigo) {
  try {
    const secreto = await obtenerSecretFA(idUsuario);
    if (!secreto) return false;

    return speakeasy.totp.verify({
      secret: secreto,
      encoding: "base32",
      token: codigo,
      window: 1,
    });

  } catch (err) {
    console.error("Error validarCodigoFA:", err);
    throw new Error("Error validando código 2FA");
  }
}


// ------------------------------------------------------
// OBTENER USUARIO
// ------------------------------------------------------
export async function servicioObtenerUsuario(idUsuario) {
  try {
    return await ObtenerUsuario(idUsuario);
  } catch (err) {
    throw new Error("Error obteniendo usuario");
  }
}


// ------------------------------------------------------
// ACTUALIZAR DATOS
// ------------------------------------------------------
export async function servicioActualizarDatosUsuario(idUsuario, datos) {
  try {
    return await ActualizarDatosUsuario(idUsuario, datos);
  } catch {
    throw new Error("Error actualizando datos del usuario");
  }
}


// ------------------------------------------------------
// ACTUALIZAR FOTO
// ------------------------------------------------------
export async function servicioActualizarFotoPerfil(idUsuario, FotoPerfil) {
  try {
    return await ActualizarFotoPerfil(idUsuario, FotoPerfil);
  } catch {
    throw new Error("Error actualizando foto de perfil");
  }
}


// ------------------------------------------------------
// ACTUALIZAR CONTRASEÑA
// ------------------------------------------------------
export async function servicioActualizarContrasena(correo, nuevaContrasena) {
  try {
    const usuario = await buscarPorCorreo(correo);
    if (!usuario) throw new Error("Usuario no encontrado");

    const hash = await bcrypt.hash(nuevaContrasena, 10);

    await ActualizarContrasena(usuario.Id_Usuario, hash);
    await resetearIntentos(correo);

    return { mensaje: "Contraseña actualizada correctamente" };

  } catch (err) {
    throw err;
  }
}


// ------------------------------------------------------
// RECUPERAR CONTRASEÑA – VALIDAR CORREO
// ------------------------------------------------------
export async function servicioVerificarCorreoRecuperacion(correo) {
  const usuario = await buscarPorCorreo(correo);

  if (!usuario) {
    throw new Error("Correo no encontrado");
  }

  return { mensaje: "Correo válido", Id_Usuario: usuario.Id_Usuario };
}


// ------------------------------------------------------
// RECUPERAR CONTRASEÑA – VALIDAR TOKEN
// ------------------------------------------------------
export async function servicioVerificarTokenRecuperacion(Id_Usuario, token) {
  try {
    const secreto = await obtenerSecretFA(Id_Usuario);

    if (!secreto) throw new Error("Token no encontrado");

    const valido = speakeasy.totp.verify({
      secret: secreto,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!valido) throw new Error("Token inválido o expirado");

    return { mensaje: "Token válido" };

  } catch (err) {
    throw err;
  }
}


// ------------------------------------------------------
// UBICACIONES
// ------------------------------------------------------
export async function servicioObtenerPaises() {
  return await obtenerPaises();
}

export async function servicioObtenerDependencias(idPadre) {
  return await obtenerUbiPorDependencia(idPadre);
}
