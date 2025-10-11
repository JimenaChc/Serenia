import { servicioCrearTablero, servicioListarTableros, servicioGuardarImagenEnTablero } from "../Servicios/ServicioTableros.js";

export async function crearTableroController(req, res) {
  try {
    const { nombre } = req.body;
    const idUsuario = req.body.idUsuario; 
    const result = await servicioCrearTablero(nombre, idUsuario);
    res.status(201).json({ mensaje: "Tablero creado", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear tablero" });
  }
}

export async function listarTablerosController(req, res) {
  try {
    const idUsuario = req.params.idUsuario;
    const tableros = await servicioListarTableros(idUsuario);
    res.json(tableros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al listar tableros" });
  }
}

export async function guardarImagenController(req, res) {
  try {
    const { idTablero, idImagen } = req.body;
    await servicioGuardarImagenEnTablero(idTablero, idImagen);
    res.json({ mensaje: "Imagen guardada en el tablero" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar imagen en tablero" });
  }
}
