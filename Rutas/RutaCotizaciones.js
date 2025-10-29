// Rutas/rutasCotizacion.js
import express from "express";
import {
  crearCotizacion,
  listarCotizaciones,
  verCotizacion,
  obtenerProgreso,
  listarServicios,
  listarEspacios,
  guardarDetallesDisenio,
  registrarPago,
  obtenerImagenesProgreso,
  obtenerComentarios,
  agregarComentario
} from "../Controladores/ControladorCotizacion.js";

const router = express.Router();
//Listas
router.get("/servicios", listarServicios);
router.get("/espacios", listarEspacios);
router.get("/usuario/:idUsuario", listarCotizaciones);
router.get("/imagenesProgreso/:idCotizacion", obtenerImagenesProgreso);
router.get("/comentarios/:idCotizacion", obtenerComentarios);
router.post("/comentario", agregarComentario);

//Cotizaciones
router.post("/crear", crearCotizacion);
router.get("/progreso/:idCotizacion",obtenerProgreso);

//Guardar detalles diseño y pago
router.post("/detallesDisenio",guardarDetallesDisenio);
router.post("/pago",registrarPago);
router.get("/detalle/:idCotizacion", verCotizacion);




export default router;
