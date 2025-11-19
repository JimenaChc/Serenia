import conexion from "../Config/db.js";
import dotenv from "dotenv";
dotenv.config();
import { OAuth2Client } from "google-auth-library";
import speakeasy from "speakeasy";
import bcrypt from "bcrypt";
import { buscarPorCorreo,crearUsuario,obtenerGoogleClientID, guardarSecretFA,
   obtenerSecretFA,ObtenerUsuario,ActualizarDatosUsuario,ActualizarFotoPerfil,
 ActualizarContrasena, resetearIntentos,bloquearUsuario,incrementarIntentos,
obtenerPaises, obtenerUbiPorDependencia } from "../Datos/DatosUsuario.js";
const SALT_ROUNDS = 10;
export async function registrarUsuario(nombre, apellidos, correo, contrasena, telefono,Direccion) {
  return new Promise(async (resolve, reject) => {
    try {
      // Cifrar la contraseña antes de guardarla
      const hash = await bcrypt.hash(contrasena, SALT_ROUNDS);
      const sql = "CALL RegistrarUsuario(?, ?, ?, ?, ?, ?)";
      conexion.query(sql, [nombre, apellidos, correo, hash, telefono, Direccion], (err, resultado) => {
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
      if (!usuario) return reject("Correo o contraseña incorrectas"); // mensaje genérico

      // Verificamos si el usuario está bloqueado
      if (usuario.Bloqueado === "Bloqueado") {
        return reject("Tu cuenta está bloqueada. Restablece tu contraseña para continuar.");
      }

      // Comprobamos la contraseña
      const esValida = await bcrypt.compare(contrasena, usuario.Contrasena);

      if (!esValida) {
  // Incrementar intentos y luego verificar si se debe bloquear
  incrementarIntentos(correo, (err2) => {
  if (err2) {
    console.error("Error al incrementar intentos:", err2);
  } else {
    console.log("incrementarIntentos: OK para", correo);
  }

  buscarPorCorreo(correo, (err3, usuarioActualizado) => {
    if (err3) {
      console.error("Error al obtener usuario actualizado:", err3);
    } else {
      console.log("Usuario actualizado tras incrementar:", usuarioActualizado);
    }

    const nuevosIntentos = usuarioActualizado?.IntentosFallidos || 0;
    console.log("Intentos actuales:", nuevosIntentos);

    if (nuevosIntentos >= 4) {
      bloquearUsuario(correo, (err4) => {
        if (err4) console.error("Error al bloquear usuario:", err4);
        else console.log("Usuario bloqueado:", correo);
      });
      return reject({ tipo: "bloqueado", mensaje: "Tu cuenta ha sido bloqueada. Ve a 'Recuperar contraseña' para restablecerla." });
    }

    return reject({ tipo: "credenciales", mensaje: `Credenciales incorrectas. Intentos restantes: ${4 - nuevosIntentos}` });
  });
});

  return; // Salimos de la función
}


      // Si la contraseña es correcta, reseteamos intentos
      resetearIntentos(correo, (err4) => {
        if (err4) console.error("Error al resetear intentos:", err4);
      });

      const necesitaConfigurar2FA = !usuario.SecretFA || usuario.SecretFA.trim() === "";

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

//  Verificar si el correo existe
export function servicioVerificarCorreo(correo) {
  return new Promise((resolve, reject) => {
    buscarPorCorreo(correo, (err, usuario) => {
      if (err) return reject("Error interno");
      if (!usuario) return reject("Correo no encontrado");
      resolve({ mensaje: "Correo válido" });
    });
  });
}

// Validar token (Google Authenticator)
export function servicioVerificarTokenFA(correo, token) {
  return new Promise((resolve, reject) => {
    buscarPorCorreo(correo, (err, usuario) => {
      if (err) {
        console.error("Error al buscar usuario:", err);
        return reject("Error interno del servidor");
      }
      if (!usuario) {
        return reject("Usuario no encontrado");
      }

      // Validar que tenga un secreto guardado
      if (!usuario.SecretFA || usuario.SecretFA.trim() === "") {
        return reject("El usuario no tiene configurado autenticación 2FA");
      }

      let secreto = usuario.SecretFA;

      // Verificar el token del Google Authenticator
      const valido = speakeasy.totp.verify({
        secret: secreto,
        encoding: "base32",
        token,
        window: 1, // tolerancia de ±30 segundos
      });

      if (!valido) {
        return reject("Token inválido o expirado");
      }

      resolve({ mensaje: "Token válido", Id_Usuario: usuario.Id_Usuario });
    });
  });
}

// 3️Actualizar contraseña
export async function servicioActualizarContrasena(correo, nuevaContrasena) {
  return new Promise(async (resolve, reject) => {
    buscarPorCorreo(correo, async (err, usuario) => {
      if (err || !usuario) return reject("Usuario no encontrado");
      const hash = await bcrypt.hash(nuevaContrasena, 10);
      ActualizarContrasena(usuario.Id_Usuario, hash, (err2) => {
        if (err2) return reject("Error al actualizar contraseña");
         resetearIntentos(correo, (err2) => {
          if (err2) console.error("Error al resetear intentos:", err2);
        });
        resolve({ mensaje: "Contraseña actualizada correctamente" });
      });
    });
  });
}
export function servicioVerificarCorreoRecuperacion(correo) {
  return new Promise((resolve, reject) => {
    buscarPorCorreo(correo, (err, usuario) => {
      if (err) return reject("Error interno");
      if (!usuario) return reject("Correo no encontrado");
      resolve({ mensaje: "Correo válido", Id_Usuario: usuario.Id_Usuario });
    });
  });
}

// Verificar token Google Authenticator
export function servicioVerificarTokenRecuperacion(Id_Usuario, token) {
  return new Promise((resolve, reject) => {
    obtenerSecretFA(Id_Usuario, (err, secretoCifrado) => {
      if (err) return reject("Error interno");
      if (!secretoCifrado) return reject("Token no encontrado");

      let secreto;
      try {
        // Intentamos descifrar, si falla asumimos que ya está en claro
        secreto = encriptador.descifrar(secretoCifrado);
      } catch (e) {
        secreto = secretoCifrado;
      }

      const valido = speakeasy.totp.verify({
        secret: secreto,
        encoding: "base32",
        token,
        window: 1 // permite ±30s
      });

      if (!valido) return reject("Token inválido o expirado");
      resolve({ mensaje: "Token válido" });
    });
  });
}

// Actualizar contraseña
export async function servicioActualizarContrasenaRecuperacion(correo, nuevaContrasena) {
  return new Promise(async (resolve, reject) => {
    try {
      const hash = await bcrypt.hash(nuevaContrasena, 10);
      
      ActualizarContrasena(correo, hash, (err) => {
        if (err) {
          console.error("Error al actualizar contraseña:", err);
          return reject("Error al actualizar contraseña");
        }
        resolve({ mensaje: "Contraseña actualizada correctamente" });
      });
    } catch (error) {
      console.error("Error al encriptar contraseña:", error);
      reject("Error al encriptar contraseña");
    }
  });
}

export function servicioObtenerPaises() {
  return new Promise((resolve, reject) => {
    obtenerPaises((err, results) => {
      if (err) return reject("Error obteniendo países");
      resolve(results);
    });
  });
}

export function servicioObtenerDependencias(idPadre) {
  return new Promise((resolve, reject) => {
    obtenerUbiPorDependencia(idPadre, (err, results) => {
      if (err) return reject("Error obteniendo ubicaciones dependientes");
      resolve(results);
    });
  });
}