import { registrarUsuario, loginUsuario , servicioActualizarDatosUsuario,servicioActualizarFotoPerfil,servicioObtenerUsuario} from "../Servicios/ServicioUsuario.js";

export async function registrar(req, res) {
  const { Nombre, Apellidos, Correo, Contrasena, Telefono } = req.body;

  try {
    await registrarUsuario(Nombre, Apellidos, Correo, Contrasena, Telefono);
    res.status(200).json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}

export async function login(req, res) {
  const { Correo, Contrasena } = req.body;

  try {
    const usuario = await loginUsuario(Correo, Contrasena);
    res.status(200).json({
      mensaje: "Login exitoso",
      usuario,
    });
  } catch (error) {
    res.status(401).json({ error: error.toString() });
  }
}

// Obtener usuario por ID
export async function obtenerUsuario(req, res) {
  const { idUsuario } = req.params;
  try {
    const usuario = await servicioObtenerUsuario(idUsuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
}

// Actualizar datos generales
export async function actualizarDatosUsuario(req, res) {
  const { idUsuario } = req.params;
  const datos = req.body;
  try {
    const resultado = await servicioActualizarDatosUsuario(idUsuario, datos);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar datos" });
  }
}

// Actualizar foto de perfil
export async function actualizarFotoPerfil(req, res) {
  const { idUsuario } = req.params;
  const { FotoPerfil } = req.body;
  try {
    const resultado = await servicioActualizarFotoPerfil(idUsuario, FotoPerfil);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar foto de perfil" });
  }
}






