import express from "express";
import {
    registrar,
    login,
  actualizarDatosUsuario,
  actualizarFotoPerfil,
  obtenerUsuario,
  googleAuth,
  generarFAUsuario,
  verificar2FA,
  obtenerGoogleClientID
} from "../Controladores/ControladorUsuario.js";

const router = express.Router();
router.post("/registro", registrar);
router.post("/login",login);
router.post("/google-auth", googleAuth);
router.post("/activar", generarFAUsuario);
router.post("/verificar", verificar2FA);


//obtener google client Id

router.get("/google-client-id", obtenerGoogleClientID);
// Obtener datos de un usuario
router.get("/:idUsuario", obtenerUsuario);



// Actualizar datos generales (nombre, correo, teléfono, contraseña)
router.put("/:idUsuario", actualizarDatosUsuario);

// Actualizar solo la foto de perfil
router.put("/:idUsuario/foto", actualizarFotoPerfil);

export default router;