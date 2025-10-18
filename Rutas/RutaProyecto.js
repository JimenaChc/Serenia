// routes/proyectoRoutes.js
import { Router } from "express";
import {
  getProyectos,
  getDetalleProyecto,
} from "../Controladores/ControladorProyecto.js";

const router = Router();

// Listar proyectos de un usuario
router.get("/usuario/:idUsuario", getProyectos);

// Ver detalle y progreso de un proyecto
router.get("/:idProyecto", getDetalleProyecto);

export default router;
