import { registrarUsuario, loginUsuario } from "../Servicios/ServicioUsuario.js";

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
    res.status(401).json({ error });
  }
}




