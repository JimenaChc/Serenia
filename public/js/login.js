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
      mostrarMensajeLogin(`Bienvenido, ${data.usuario.Nombre}!`, "exito");

      setTimeout(() => (window.location.href = "Feed.html"), 1500);
    } else {
      mostrarMensajeLogin(data.error, "error");
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

