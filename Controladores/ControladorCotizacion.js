// Controladores/ControladorCotizacion.js
import { parse } from "dotenv";
import {
  registrarCotizacion,
  listarCotizacionesUsuario,
  servicioObtenerCotizacion,
  consultarProgreso,
  servicioListarEspacios,
  servicioListarServicios,
  servicioGuardarDisenio,
  servicioRegistrarPago,
  servicioObtenerImagenesProgreso,
  servicioObtenerComentarios,
  servicioAgregarComentario
} from "../Servicios/ServicioCotizacion.js";

export async function crearCotizacion(req, res) {
  try {
    const { Id_Usuario, Id_Servicio, NombreProyecto, Id_Espacio_Evento, Descripcion, MontoEstimado, Id_Tablero, Imagenes, Ubicacion} = req.body;

    const resultado = await registrarCotizacion(
      {
        Id_Usuario,
        Id_Servicio,
        NombreProyecto,
        Id_Espacio_Evento,
        Descripcion,
        MontoEstimado,
        Id_Tablero,
        Ubicacion
      },
      Imagenes || []
    );

    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la cotización" });
  }
}

export async function listarCotizaciones(req, res) {
  try {
    const { idUsuario } = req.params;
    const resultado = await listarCotizacionesUsuario(idUsuario);
    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al listar cotizaciones:", error);
    res.status(500).json({ error: "Error al listar las cotizaciones" });
  }
}

export async function verCotizacion(req, res) {
  try {
    const { idCotizacion } = req.params;
    const resultado = await servicioObtenerCotizacion(idCotizacion);
    if (!resultado)
      return res.status(404).json({ mensaje: "Cotización no encontrada" });

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener detalle:", error);
    res.status(500).json({ error: "Error al obtener la cotización" });
  }
}


export function obtenerProgreso(req, res) {
  const { idCotizacion } = req.params;

  consultarProgreso(idCotizacion, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(data);
  });
}

// listar servicios
export function listarServicios(req, res) {
  servicioListarServicios((err, resultados) => {
    if (err) {
      console.error("Error al obtener servicios:", err);
      return res.status(500).json({ error: "Error al obtener servicios" });
    }
    res.json(resultados);
  });
}

// listar espacios
export function listarEspacios(req, res) {
  servicioListarEspacios((err, resultados) => {
    if (err) {
      console.error("Error al obtener espacios:", err);
      return res.status(500).json({ error: "Error al obtener espacios" });
    }
    res.json(resultados);
  });
}

export function guardarDetallesDisenio(req, res) {
  const datos = req.body;
  servicioGuardarDisenio(datos, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Detalles guardados correctamente" });
  });
}

export function registrarPago(req, res) {
  const datos = req.body;
  datos.Monto = parseFloat(datos.Monto);
  servicioRegistrarPago(datos, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Pago registrado correctamente" });
  });
}

export function obtenerImagenesProgreso(req, res) {
  const idCotizacion = req.params.idCotizacion;

  servicioObtenerImagenesProgreso(idCotizacion, (err, imagenes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(imagenes);
  });
}

// Obtener comentarios
export async function obtenerComentarios(req, res) {
  const idCotizacion = req.params.idCotizacion;
  servicioObtenerComentarios(idCotizacion, (err, comentarios) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json(comentarios);
  });
}

// Agregar comentario
export async function agregarComentario(req, res) {
  const { Id_Cotizacion, mensaje, tipo } = req.body;
  servicioAgregarComentario({ Id_Cotizacion, mensaje, tipo }, (err) => {
    if(err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: "Comentario agregado" });
  });
}
