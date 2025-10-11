document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = Object.fromEntries(new FormData(e.target));

  const res = await fetch("/api/usuarios/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();
  const mensajeDiv = document.getElementById("mensaje");

  if (res.ok) {
    mensajeDiv.innerHTML = `<p class="mensaje-exito">Bienvenido, ${data.usuario.Nombre}!</p>`;
    setTimeout(() => (window.location.href = "inicio.html"), 1500);
  } else {
    mensajeDiv.innerHTML = `<p class="mensaje-error">${data.error}</p>`;
  }
});
