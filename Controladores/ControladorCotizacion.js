// Controladores/ControladorCotizacion.js
import {
  registrarCotizacion,
  listarCotizacionesUsuario,
  consultarProgreso,
  servicioListarEspacios,
  servicioListarServicios
} from "../Servicios/ServicioCotizacion.js";

export async function crearCotizacion(req, res) {
  try {
    const { Id_Usuario, Id_Servicio, NombreProyecto, Id_Espacio_Evento, Descripcion, MontoEstimado, Id_Tablero, Imagenes } = req.body;

    const resultado = await registrarCotizacion(
      {
        Id_Usuario,
        Id_Servicio,
        NombreProyecto,
        Id_Espacio_Evento,
        Descripcion,
        MontoEstimado,
        Id_Tablero,
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
    const resultado = await obtenerCotizacion(idCotizacion);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
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

