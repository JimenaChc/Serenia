const idUsuario = localStorage.getItem("idUsuario");

document.getElementById("btnVerificar").addEventListener("click", async (e) => {
  const btn = e.target;
  const codigo = document.getElementById("codigo").value.trim();

  if (!codigo) return alert("Por favor ingresa el código");
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = "Verificando...";
  try {
    const res = await fetch("/api/usuarios/verificar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario, codigo })
    });

    const data = await res.json();

    if (res.ok) {
      mostrarMensaje("Autenticación completada correctamente");
      setTimeout(() => window.location.href = "Feed.html", 1000);
    } else {
      mostrarMensaje(" Código incorrecto, inténtalo de nuevo");
    }
  } catch (error) {
    console.error("Error al verificar 2FA:", error);
  }
  btn.disabled = false;
  btn.textContent = originalText;
});

function mostrarMensaje(texto) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");
  setTimeout(() => mensaje.classList.remove("show"), 2000);
}
