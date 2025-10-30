console.log("login.js cargado correctamente");
document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = Object.fromEntries(new FormData(e.target));

  try {
    const res = await fetch("/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const data = await res.json();

    if (res.ok) {
      // Guardar usuario en localStorage
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      localStorage.setItem("idUsuario", data.usuario.Id_Usuario);
      const necesita2FA = data.usuario?.necesitaConfigurar2FA || data.necesitaConfigurar2FA;

if (necesita2FA) {
  window.location.href = "ActivarFA.html";
} else {
  window.location.href = "verificarFA.html";
}
    console.log("Respuesta backend:", data);
  mostrarMensajeLogin(data.error || "Error al iniciar sesión", "error");
    }
  } catch (err) {
    mostrarMensajeLogin("Error de conexión con el servidor", "error");
    console.error(err);
  }
});

function mostrarMensajeLogin(texto, duracion = 2000) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");

  setTimeout(() => {
    mensaje.classList.remove("show");
  }, duracion);
}

// Configuración opcional para cargar client_id dinámicamente desde backend
async function configurarGoogleSignIn() {
  try {
    const res = await fetch("/api/usuarios/google-client-id");
    const { clientId } = await res.json();
    if (!clientId) throw new Error("Client ID no recibido");

const waitForGoogle = () => new Promise((resolve) => {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });

    await waitForGoogle();

    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
      document.querySelector(".g_id_signin"),
      {
        type: "standard",
        shape: "rectangular",
        theme: "outline",
        text: "signup_with",
        size: "large",
        logo_alignment: "left"
      }
    );

  } catch (err) {
    console.error("No se pudo cargar Google Client ID:", err);
  }
}


// Función que maneja la respuesta de Google
async function handleCredentialResponse(response) {
  const token = response.credential;

  try {
    const res = await fetch("/api/usuarios/google-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();

    if (res.ok) {
      const { usuario, necesitaConfigurar2FA } = data;
  localStorage.setItem("usuario", JSON.stringify(usuario));
  localStorage.setItem("idUsuario", usuario.Id_Usuario);
  if (necesitaConfigurar2FA) {
    // Primera vez: configurar Google Authenticator
    window.location.href = "ActivarFA.html";
  } else {
    // Usuario con 2FA ya configurado: ir a verificación
    window.location.href = "verificarFA.html";
  }
} else {
  mostrarMensajeLogin(data.error || "Error en autenticación con Google");
}
  } catch (error) {
    console.error("Error con Google Auth:", error);
    mostrarMensajeLogin("Error en autenticación con Google");
  }
}


configurarGoogleSignIn();

