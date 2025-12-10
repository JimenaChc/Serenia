import express from "express";
import {
    registrar,
    login,
  obtenerUsuario,
  googleAuth,
  generarFAUsuario,
  verificar2FA,
  obtenerGoogleClientID,
  recuperarActualizarContrasena,
  verificarCorreo,
  verificarTokenFA,
  obtenerPaises,
  obtenerUbicacionesDependencias
} from "../Controladores/ControladorUsuario.js";

const router = express.Router();
router.post("/registro", registrar);
router.post("/login",login);
router.post("/google-auth", googleAuth);
router.post("/activar", generarFAUsuario);
router.post("/verificar", verificar2FA);
router.post("/verificar-correo", verificarCorreo);
router.post("/verificar-token", verificarTokenFA);
router.post("/actualizar-contrasena", recuperarActualizarContrasena);


//obtener google client Id

router.get("/google-client-id", obtenerGoogleClientID);
// Obtener datos de un usuario


router.get("/paises", obtenerPaises);
router.get("/hijos/:idPadre", obtenerUbicacionesDependencias);
router.get("/:idUsuario", obtenerUsuario);

// Actualizar datos generales (nombre, correo, teléfono, contraseña)
router.put("/:idUsuario", actualizarDatosUsuario);

// Actualizar solo la foto de perfil
router.put("/:idUsuario/foto", actualizarFotoPerfil);

export default router;
