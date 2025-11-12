document.getElementById("formActualizarContrasena")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const correo = localStorage.getItem("correoRecuperacion");
  const datos = Object.fromEntries(new FormData(e.target));

  if (datos.NuevaContrasena !== datos.ConfirmarContrasena) {
    mostrarMensaje("Las contraseñas no coinciden", "error");
    return;
  }

  try {
    const res = await fetch("/api/usuarios/actualizar-contrasena", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo, nuevaContrasena: datos.NuevaContrasena })
    });

    const data = await res.json();
    if (res.ok) {
      mostrarMensaje("Contraseña actualizada con éxito");
      localStorage.removeItem("correoRecuperacion");
      setTimeout(() => window.location.href = "login.html", 1500);
    } else {
      mostrarMensaje(data.error || "Error al actualizar contraseña", "error");
    }
  } catch (err) {
    mostrarMensaje("Error al conectar con el servidor", "error");
  }
});

function togglePassword(id, el) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";

  // Cambiamos el icono
  const icon = el.querySelector("i");
  if (input.type === "password") {
    icon.classList.remove("bi-eye-slash");
    icon.classList.add("bi-eye");
  } else {
    icon.classList.remove("bi-eye");
    icon.classList.add("bi-eye-slash");
  }
}

function mostrarMensaje(texto, tipo = "ok") {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}
