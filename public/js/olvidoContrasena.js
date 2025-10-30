document.getElementById("formRecuperarCorreo")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const { Correo } = Object.fromEntries(new FormData(e.target));

  try {
    const res = await fetch("/api/usuarios/verificar-correo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: Correo })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("correoRecuperacion", Correo);
      mostrarMensaje("Correo válido. Ingresa tu código de autenticación.");
      setTimeout(() => window.location.href = "validarToken.html", 1500);
    } else {
      mostrarMensaje(data.error || "Correo no encontrado", "error");
    }
  } catch (err) {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
});

function mostrarMensaje(texto, tipo = "ok") {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}
