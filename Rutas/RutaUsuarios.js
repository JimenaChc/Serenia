import express from "express";

import {
  ControladorRegistrarUsuario,
  ControladorLogin,
  ControladorGoogleLogin,
  ControladorObtenerGoogleClientID,
  ControladorGenerarSecreto,
  ControladorValidar2FA,
  ControladorObtenerUsuario,
  ControladorActualizarDatosUsuario,
  ControladorActualizarFotoPerfil,
  ControladorActualizarContrasena,
  ControladorVerificarCorreo,
  ControladorVerificarToken,
  ControladorObtenerPaises,
  ControladorObtenerDependencias,
} from "../Controladores/ControladorUsuario.js";

const router = express.Router();

// Registro y login
router.post("/registro", ControladorRegistrarUsuario);
router.post("/login", ControladorLogin);

// Google
router.post("/google-auth", ControladorGoogleLogin);
router.get("/google-client-id", ControladorObtenerGoogleClientID);

// 2FA
router.post("/activar", ControladorGenerarSecreto);
router.post("/verificar", ControladorValidar2FA);

// Recuperación de contraseña
router.post("/verificar-correo", ControladorVerificarCorreo);
router.post("/verificar-token", ControladorVerificarToken);
router.post("/actualizar-contrasena", ControladorActualizarContrasena);

// Ubicaciones
router.get("/paises", ControladorObtenerPaises);
router.get("/hijos/:idPadre", ControladorObtenerDependencias);

// Usuario
router.get("/:idUsuario", ControladorObtenerUsuario);

// Actualizar datos generales
router.put("/:idUsuario", ControladorActualizarDatosUsuario);

// Actualizar foto
router.put("/:idUsuario/foto", ControladorActualizarFotoPerfil);

export default router;
