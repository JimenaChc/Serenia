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

// ------------------------------
// REGISTRO
// ------------------------------
export async function ControladorRegistrarUsuario(req, res) {
  try {
    const {
      Nombre,
      Apellidos,
      Correo,
      Contrasena,
      Telefono,
      Direccion,
    } = req.body;

    const resultado = await registrarUsuario(
      Nombre,
      Apellidos,
      Correo,
      Contrasena,
      Telefono,
      Direccion
    );

    res.status(201).json({
      mensaje: "Usuario registrado exitosamente",
      resultado,
    });
  } catch (error) {
    console.error("Error Registro:", error);
    res.status(500).json({ error: "Error al registrar usuario", detalle: error });
  }
}

// ------------------------------
// LOGIN NORMAL
// ------------------------------
export async function ControladorLogin(req, res) {
  try {
    const { Correo, Contrasena } = req.body;

    const resultado = await loginUsuario(Correo, Contrasena);

    res.json(resultado);
  } catch (error) {
    console.error("Error Login:", error);

    if (error?.tipo === "bloqueado") {
      return res.status(423).json({
        error: error.mensaje,
      });
    }

    if (error?.tipo === "credenciales") {
      return res.status(401).json({
        error: error.mensaje,
      });
    }

    res.status(500).json({ error: "Error en el inicio de sesión" });
  }
}

// ------------------------------
// LOGIN / REGISTRO CON GOOGLE
// ------------------------------
export async function ControladorGoogleLogin(req, res) {
  try {
    const { token } = req.body;
    const resultado = await loginORegistrarConGoogle(token);
    res.json(resultado);
  } catch (error) {
    console.error("Error Login Google:", error);
    res.status(500).json({ error: "Error al procesar Google Login" });
  }
}

// Obtener clientID
export function ControladorObtenerGoogleClientID(req, res) {
  const id = servicioObtenerGoogleClientID();
  res.json({ client_id: id });
}

// ------------------------------
// 2FA: GENERAR
// ------------------------------
export async function ControladorGenerarSecreto(req, res) {
  try {
    const { Id_Usuario } = req.body;
    const resultado = await generarSecretoFA(Id_Usuario);
    res.json(resultado);
  } catch (error) {
    console.error("Error generar 2FA:", error);
    res.status(500).json({ error: "Error al generar código 2FA" });
  }
}

// ------------------------------
// 2FA: VALIDAR
// ------------------------------
export async function ControladorValidar2FA(req, res) {
  try {
    const { Id_Usuario, Codigo } = req.body;

    const valido = await validarCodigoFA(Id_Usuario, Codigo);

    if (!valido) return res.status(401).json({ error: "Código incorrecto" });

    res.json({ mensaje: "Código válido" });
  } catch (error) {
    console.error("Error validar 2FA:", error);
    res.status(500).json({ error: "Error validando el código" });
  }
}

// ------------------------------
// OBTENER PERFIL
// ------------------------------
export async function ControladorObtenerUsuario(req, res) {
  try {
    const { Id_Usuario } = req.params;

    const usuario = await servicioObtenerUsuario(Id_Usuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json(usuario);
  } catch (error) {
    console.error("Error obtener usuario:", error);
    res.status(500).json({ error: "Error obteniendo usuario" });
  }
}

// ------------------------------
// ACTUALIZAR PERFIL
// ------------------------------
export async function ControladorActualizarDatosUsuario(req, res) {
  try {
    const { Id_Usuario } = req.params;
    const datos = req.body;

    await servicioActualizarDatosUsuario(Id_Usuario, datos);

    res.json({ mensaje: "Datos actualizados correctamente" });
  } catch (error) {
    console.error("Error actualizar datos:", error);
    res.status(500).json({ error: "Error al actualizar datos" });
  }
}

// ------------------------------
// ACTUALIZAR FOTO
// ------------------------------
export async function ControladorActualizarFotoPerfil(req, res) {
  try {
    const { Id_Usuario } = req.params;
    const { FotoPerfil } = req.body;

    await servicioActualizarFotoPerfil(Id_Usuario, FotoPerfil);

    res.json({ mensaje: "Foto actualizada" });
  } catch (error) {
    console.error("Error actualizar foto:", error);
    res.status(500).json({ error: "Error al actualizar foto" });
  }
}

// ------------------------------
// RECUPERAR CONTRASEÑA: VALIDAR CORREO
// ------------------------------
export async function ControladorVerificarCorreo(req, res) {
  try {
    const { Correo } = req.body;
    const resultado = await servicioVerificarCorreoRecuperacion(Correo);
    res.json(resultado);
  } catch (error) {
    console.error("Error verificar correo:", error);
    res.status(404).json({ error: error });
  }
}

// ------------------------------
// RECUPERAR CONTRASEÑA: VALIDAR TOKEN
// ------------------------------
export async function ControladorVerificarToken(req, res) {
  try {
    const { Id_Usuario, Token } = req.body;

    const resultado = await servicioVerificarTokenRecuperacion(Id_Usuario, Token);

    res.json(resultado);
  } catch (error) {
    console.error("Error verificar token:", error);
    res.status(400).json({ error: error });
  }
}

// ------------------------------
// ACTUALIZAR CONTRASEÑA
// ------------------------------
export async function ControladorActualizarContrasena(req, res) {
  try {
    const { Correo, NuevaContrasena } = req.body;

    const resultado = await servicioActualizarContrasena(Correo, NuevaContrasena);

    res.json(resultado);
  } catch (error) {
    console.error("Error actualizar contraseña:", error);
    res.status(500).json({ error: "Error al actualizar contraseña" });
  }
}

// ------------------------------
// UBICACIONES
// ------------------------------
export async function ControladorObtenerPaises(req, res) {
  try {
    const resultado = await servicioObtenerPaises();
    res.json(resultado);
  } catch (error) {
    console.error("Error obtener paises:", error);
    res.status(500).json({ error: "Error al obtener ubicaciones" });
  }
}

export async function ControladorObtenerDependencias(req, res) {
  try {
    const { idPadre } = req.params;
    const resultado = await servicioObtenerDependencias(idPadre);
    res.json(resultado);
  } catch (error) {
    console.error("Error obtener dependencias:", error);
    res.status(500).json({ error: "Error al obtener dependencias" });
  }
}
