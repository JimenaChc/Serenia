import { registrarUsuario, servicioObtenerGoogleClientID, loginORegistrarConGoogle, generarSecretoFA,validarCodigoFA, loginUsuario , servicioActualizarDatosUsuario,servicioActualizarFotoPerfil,servicioObtenerUsuario} from "../Servicios/ServicioUsuario.js";

export async function registrar(req, res) {
  const { Nombre, Apellidos, Correo, Contrasena, Telefono } = req.body;

  try {
    await registrarUsuario(Nombre, Apellidos, Correo, Contrasena, Telefono);
    res.status(200).json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
}

export async function obtenerGoogleClientID(req, res) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error("No se encontró GOOGLE_CLIENT_ID");
      return res.status(500).json({ error: "GOOGLE_CLIENT_ID no configurado" });
    }

    console.log("Enviando GOOGLE_CLIENT_ID al cliente");
    res.json({ clientId }); 
  } catch (error) {
    console.error("Error al obtener GOOGLE_CLIENT_ID:", error);
    res.status(500).json({ error: "Error al obtener GOOGLE_CLIENT_ID" });
  }
}

export async function login(req, res) {
  const { Correo, Contrasena } = req.body;

  try {
    const usuario = await loginUsuario(Correo, Contrasena);
    res.status(200).json({
      mensaje: "Login exitoso",
      usuario,
    });
  } catch (error) {
    res.status(401).json({ error: error.toString() });
  }
}

export async function googleAuth(req, res) {
  const { token } = req.body;

  try {
    const { usuario, necesitaConfigurar2FA } = await loginORegistrarConGoogle(token);
    res.status(200).json({
      mensaje: "Autenticación exitosa con Google",
      usuario,
      necesitaConfigurar2FA
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
}

// Obtener usuario por ID
export async function obtenerUsuario(req, res) {
  const { idUsuario } = req.params;
  try {
    const usuario = await servicioObtenerUsuario(idUsuario);
    if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
}

// Actualizar datos generales
export async function actualizarDatosUsuario(req, res) {
  const { idUsuario } = req.params;
  const datos = req.body;
  try {
    const resultado = await servicioActualizarDatosUsuario(idUsuario, datos);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar datos" });
  }
}

// Actualizar foto de perfil
export async function actualizarFotoPerfil(req, res) {
  const { idUsuario } = req.params;
  const { FotoPerfil } = req.body;
  try {
    const resultado = await servicioActualizarFotoPerfil(idUsuario, FotoPerfil);
    res.status(200).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar foto de perfil" });
  }
}

// Generar 2FA y enviar secreto al usuario
export async function generarFAUsuario(req, res) {
  const { idUsuario } = req.body;
  try {
   const result = await generarSecretoFA(idUsuario); // ahora devuelve {secret, otpauth_url}
    res.json({
      mensaje: "Secreto generado. Configura tu app Google Authenticator.",
      secreto: result.secret,
      otpauth_url: result.otpauth_url
    });
  } catch (error) {
    console.error("Controlador -> generarFAUsuario error:", error);
    res.status(500).json({ error: "Error al generar 2FA" });
  }
}

// Verificar el código TOTP ingresado por el usuario
export async function verificar2FA(req, res) {
  const { idUsuario, codigo } = req.body;
  try {
    const esValido = await validarCodigoFA(idUsuario, codigo);
    if (!esValido) return res.status(401).json({ error: "Código incorrecto" });
    res.json({ mensaje: "2FA verificado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar 2FA" });
  }
}




