import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { registrar,login } from "./Controladores/ControladorUsuario.js";
import RutaImagenes from "./Rutas/RutaImagenes.js";
import RutaTableros from "./Rutas/RutaTableros.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("Public")); 
app.use("/api/imagenes",RutaImagenes);
app.use("/api/tableros", RutaTableros);
// Ruta para registrar usuario
app.post("/api/usuarios/registro", registrar);
app.post("/api/usuarios/login",login);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
