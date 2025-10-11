// Registro
document.getElementById("formRegistro")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const datos = Object.fromEntries(new FormData(e.target));

  const res = await fetch("/api/usuarios/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  const data = await res.json();
  alert(data.mensaje);
  if (res.ok) window.location.href = "login.html";
});


