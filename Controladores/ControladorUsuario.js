
import {
  registrarUsuario,
  loginUsuario,
  loginORegistrarConGoogle,
  servicioObtenerGoogleClientID,
  generarSecretoFA,
  validarCodigoFA,
  servicioObtenerUsuario,
  servicioActualizarDatosUsuario,
  servicioActualizarFotoPerfil,
  servicioActualizarContrasena,
  servicioVerificarCorreoRecuperacion,
  servicioVerificarTokenRecuperacion,
  servicioObtenerPaises,
  servicioObtenerDependencias,
} from "../Servicios/ServicioUsuario.js";


// ------------------------------------------------------
// REGISTRO
// ------------------------------------------------------
export async function ControladorRegistrarUsuario(req, res) {
  try {
    const datos = req.body;

    const resultado = await registrarUsuario(
      datos.Nombre,
      datos.Apellidos,
      datos.Correo,
      datos.Contrasena,
      datos.Telefono,
      datos.Direccion
    );

    return res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      resultado,
    });

  } catch (error) {
    console.error("Error Registro:", error);
    return res.status(500).json({
      error: "Error al registrar usuario",
      detalle: error.message,
    });
  }
}


// ------------------------------------------------------
// LOGIN NORMAL
// ------------------------------------------------------
export async function ControladorLogin(req, res) {
  try {
    const { Correo, Contrasena } = req.body;

    const resultado = await loginUsuario(Correo, Contrasena);

    return res.json(resultado);

  } catch (error) {
    console.error("Error Login:", error);

    if (error?.tipo === "bloqueado") {
      return res.status(423).json({ error: error.mensaje });
    }

    if (error?.tipo === "credenciales") {
      return res.status(401).json({ error: error.mensaje });
    }

    return res.status(500).json({ error: "Error en el inicio de sesión" });
  }
}


// ------------------------------------------------------
// LOGIN / REGISTRO CON GOOGLE
// ------------------------------------------------------
export async function ControladorGoogleLogin(req, res) {
  try {
    const { token } = req.body;

    const resultado = await loginORegistrarConGoogle(token);

    return res.json(resultado);

  } catch (error) {
    console.error("Error Login Google:", error);
    return res.status(500).json({
      error: "Error al procesar Google Login",
    });
  }
}


// GOOGLE CLIENT ID
export function ControladorObtenerGoogleClientID(req, res) {
  const id = servicioObtenerGoogleClientID();
  return res.json({ clientId: id });
}



// ------------------------------------------------------
// 2FA – GENERAR SECRET
// ------------------------------------------------------
export async function ControladorGenerarSecreto(req, res) {
  try {
    const { Id_Usuario } = req.body;

    const resultado = await generarSecretoFA(Id_Usuario);

    return res.json(resultado);

  } catch (error) {
    console.error("Error generar 2FA:", error);
    return res.status(500).json({
      error: "Error al generar código 2FA",
    });
  }
}


// ------------------------------------------------------
// 2FA – VALIDAR
// ------------------------------------------------------
export async function ControladorValidar2FA(req, res) {
  try {
    const { Id_Usuario, Codigo } = req.body;

    const valido = await validarCodigoFA(Id_Usuario, Codigo);

    if (!valido)
      return res.status(401).json({ error: "Código incorrecto" });

    return res.json({ mensaje: "Código válido" });

  } catch (error) {
    console.error("Error validar 2FA:", error);
    return res.status(500).json({ error: "Error validando código" });
  }
}


// ------------------------------------------------------
// OBTENER USUARIO (PERFIL)
// ------------------------------------------------------
export async function ControladorObtenerUsuario(req, res) {
  try {
    const { Id_Usuario } = req.params;

    const usuario = await servicioObtenerUsuario(Id_Usuario);

    if (!usuario)
      return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json(usuario);

  } catch (error) {
    console.error("Error obtener usuario:", error);
    return res.status(500).json({ error: "Error obteniendo usuario" });
  }
}


// ------------------------------------------------------
// ACTUALIZAR DATOS DEL PERFIL
// ------------------------------------------------------
export async function ControladorActualizarDatosUsuario(req, res) {
  try {
    const { Id_Usuario } = req.params;
    const datos = req.body;

    await servicioActualizarDatosUsuario(Id_Usuario, datos);

    return res.json({ mensaje: "Datos actualizados correctamente" });

  } catch (error) {
    console.error("Error actualizar datos:", error);
    return res.status(500).json({ error: "Error al actualizar datos" });
  }
}


// ------------------------------------------------------
// ACTUALIZAR FOTO DE PERFIL
// ------------------------------------------------------
export async function ControladorActualizarFotoPerfil(req, res) {
  try {
    const { Id_Usuario } = req.params;
    const { FotoPerfil } = req.body;

    await servicioActualizarFotoPerfil(Id_Usuario, FotoPerfil);

    return res.json({ mensaje: "Foto actualizada" });

  } catch (error) {
    console.error("Error actualizar foto:", error);
    return res.status(500).json({ error: "Error al actualizar foto" });
  }
}


// ------------------------------------------------------
// RECUPERAR CONTRASEÑA → VALIDAR CORREO
// ------------------------------------------------------
export async function ControladorVerificarCorreo(req, res) {
  try {
    const { Correo } = req.body;

    const resultado = await servicioVerificarCorreoRecuperacion(Correo);

    return res.json(resultado);

  } catch (error) {
    console.error("Error verificar correo:", error);
    return res.status(404).json({ error: error.message || error });
  }
}


// ------------------------------------------------------
// RECUPERAR CONTRASEÑA → VALIDAR TOKEN
// ------------------------------------------------------
export async function ControladorVerificarToken(req, res) {
  try {
    const { Id_Usuario, Token } = req.body;

    const resultado = await servicioVerificarTokenRecuperacion(
      Id_Usuario,
      Token
    );

    return res.json(resultado);

  } catch (error) {
    console.error("Error verificar token:", error);
    return res.status(400).json({ error: error.message || error });
  }
}


// ------------------------------------------------------
// ACTUALIZAR CONTRASEÑA
// ------------------------------------------------------
export async function ControladorActualizarContrasena(req, res) {
  try {
    const { Correo, NuevaContrasena } = req.body;

    const resultado = await servicioActualizarContrasena(
      Correo,
      NuevaContrasena
    );

    return res.json(resultado);

  } catch (error) {
    console.error("Error actualizar contraseña:", error);
    return res.status(500).json({ error: "Error al actualizar contraseña" });
  }
}


// ------------------------------------------------------
// UBICACIONES
// ------------------------------------------------------
export async function ControladorObtenerPaises(req, res) {
  try {
    const resultado = await servicioObtenerPaises();
    return res.json(resultado);

  } catch (error) {
    console.error("Error obtener paises:", error);
    return res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
}


export async function ControladorObtenerDependencias(req, res) {
  try {
    const { idPadre } = req.params;

    const resultado = await servicioObtenerDependencias(idPadre);

    return res.json(resultado);

  } catch (error) {
    console.error("Error obtener dependencias:", error);
    return res.status(500).json({ error: "Error al obtener dependencias" });
  }
}
