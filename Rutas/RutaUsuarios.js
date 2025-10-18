import express from "express";
import {
    registrar,
    login,
  actualizarDatosUsuario,
  actualizarFotoPerfil,
  obtenerUsuario
} from "../Controladores/ControladorUsuario.js";

const router = express.Router();
router.post("/registro", registrar);
router.post("/login",login);
// Obtener datos de un usuario
router.get("/:idUsuario", obtenerUsuario);

// Actualizar datos generales (nombre, correo, teléfono, contraseña)
router.put("/:idUsuario", actualizarDatosUsuario);

// Actualizar solo la foto de perfil
router.put("/:idUsuario/foto", actualizarFotoPerfil);

export default router;