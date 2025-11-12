// Controladores/ControladorVerificacion.js
import { enviarCorreoVerificacion, validarToken, eliminarToken } from "../Servicios/ServicioVerificacion.js";
import { registrarUsuario } from "../Servicios/ServicioUsuario.js";

export async function enviarVerificacion(req, res) {
  const { correo } = req.body;
  console.log("Correo recibido en ControladorVerificacion:", correo);
  try {
    const msg = await enviarCorreoVerificacion(correo);
    res.status(200).json({ mensaje: msg });
  } catch (error) {
    console.error(error);
     console.error("Error al enviar verificación:", error);
    res.status(500).json({ error });
  }
}

export async function verificarToken(req, res) {
  const { token } = req.params;

  try {
    const correo = await validarToken(token);
    res.status(200).json({ correo });
  } catch (error) {
    res.status(400).json({ error });
  }
}

// Crear usuario definitivo después de verificar
export async function completarRegistro(req, res) {
  const { token, nombre, apellidos, usuario, contrasena, telefono,Direccion } = req.body;

  try {
    const correo = await validarToken(token);
    await registrarUsuario(nombre, apellidos, correo, contrasena, telefono,Direccion);
    await eliminarToken(token);

    res.status(200).json({ mensaje: "Usuario creado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al completar el registro" });
  }
}
