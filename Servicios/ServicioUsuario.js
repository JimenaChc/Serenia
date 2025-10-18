import conexion from "../Config/db.js";
import { buscarPorCorreo,ObtenerUsuario,ActualizarDatosUsuario,ActualizarFotoPerfil } from "../Datos/DatosUsuario.js";
import bcrypt from "bcryptjs";

export async function registrarUsuario(nombre, apellidos, correo, contrasena, telefono) {
  return new Promise((resolve, reject) => {
    const sql = "CALL RegistrarUsuario(?, ?, ?, ?, ?)";
    conexion.query(sql, [nombre, apellidos, correo, contrasena, telefono], (err, resultado) => {
      if (err) reject(err);
      else resolve(resultado);
      }
    );
  });
}

export async function loginUsuario(correo, contrasena) {
  return new Promise((resolve, reject) => {
    buscarPorCorreo(correo, async (err, usuario) => {
      if (err) return reject("Error al consultar usuario");
      if (!usuario) return reject("Usuario no encontrado");

     if (usuario.Contrasena !== contrasena) return reject("Contraseña incorrecta");
  
      resolve({
        Id_Usuario: usuario.Id_Usuario,
        Nombre: usuario.Nombre,
        Correo: usuario.Correo,
      });
    });
  });
}

// Obtener usuario por ID
export function servicioObtenerUsuario(idUsuario) {
  return new Promise((resolve, reject) => {
    ObtenerUsuario(idUsuario, (err, usuario) => {
      if (err) return reject(err);
      resolve(usuario);
    });
  });
}

// Actualizar datos generales
export function servicioActualizarDatosUsuario(idUsuario, datos) {
  return new Promise((resolve, reject) => {
    ActualizarDatosUsuario(idUsuario, datos, (err) => {
      if (err) return reject(err);
      resolve({ mensaje: "Datos actualizados correctamente" });
    });
  });
}

// Actualizar foto de perfil
export function servicioActualizarFotoPerfil(idUsuario, FotoPerfil) {
  return new Promise((resolve, reject) => {
    ActualizarFotoPerfil(idUsuario, FotoPerfil, (err) => {
      if (err) return reject(err);
      resolve({ mensaje: "Foto de perfil actualizada correctamente" });
    });
  });
}