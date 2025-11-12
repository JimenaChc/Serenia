// Registro
document.getElementById("formRegistro")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.submitter;
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = "Registrando...";
  const datos = Object.fromEntries(new FormData(e.target));

  const res = await fetch("/api/usuarios/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();
  mostrarMensajeFlotante("Usuario registrado correctamente");
  if (res.ok) window.location.href = "login.html";
  btn.disabled = false;
  btn.textContent = originalText;
});

function mostrarMensajeFlotante(texto, duracion = 2000) {
  const mensaje = document.getElementById("mensajeFlotante");
  mensaje.textContent = texto;
  mensaje.classList.add("show");

  setTimeout(() => {
    mensaje.classList.remove("show");
  }, duracion);
}



