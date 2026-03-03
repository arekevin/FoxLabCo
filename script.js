/* ============================= */
/* CONFIG */
/* ============================= */

const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTyStjv4icl3Pbl3_gh3_oHn3Q_79w9dN-Apsur9Pi0Ff2GbnbZo31c1JLQqOAoq_jrQ0KkhZIHN_Z1/pub?gid=0&single=true&output=csv";
const cloudName = "dvzdwcr5m";
const numeroWhatsApp = "573126161008";

let productosGlobal = [];
let productosFiltrados = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

let paginaActual = 1;
const productosPorPagina = 8;

/* ============================= */
/* UTILIDADES */
/* ============================= */

const $ = id => document.getElementById(id);
const formatoPrecio = num => `$${Number(num).toLocaleString()}`;

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function limpiarTexto(texto) {
  return texto?.trim().toLowerCase();
}

/* ============================= */
/* CARGAR PRODUCTOS */
/* ============================= */

async function fetchProductos() {
  const res = await fetch(sheetURL);
  const csv = await res.text();

  const lines = csv.trim().split("\n");
  const headers = lines.shift().split(",");

  return lines.map((line, index) => {
    const values = line.split(",");
    let obj = {};

    headers.forEach((h, i) => {
      obj[h.trim()] = values[i]?.trim();
    });

    obj.id = index;
    obj.Precio = parseInt(obj.Precio) || 0;
    obj.Coleccion = limpiarTexto(obj.Coleccion);

    return obj;
  });
}

/* ============================= */
/* FILTRO */
/* ============================= */

function mostrarProductos(coleccion = "todas", boton = null) {

 document.getElementById("estudioCreativo").style.display = "none";

  // 🔥 Manejar botón activo
  if (boton) {
    const botones = document.querySelectorAll(".colecciones button");
    botones.forEach(btn => btn.classList.remove("active"));
    boton.classList.add("active");
  }

  const slug = limpiarTexto(coleccion);

  productosFiltrados = slug === "todas"
    ? productosGlobal
    : productosGlobal.filter(p => p.Coleccion === slug);

  paginaActual = 1;
  renderPagina();
}

/* ============================= */
/* RENDER */
/* ============================= */

function renderPagina() {

  const cont = document.getElementById("productos");
  const paginacion = document.getElementById("paginacion");
  const btnAnterior = document.getElementById("btnAnterior");
  const btnSiguiente = document.getElementById("btnSiguiente");
  const infoPagina = document.getElementById("infoPagina");

  cont.innerHTML = "";

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const inicio = (paginaActual - 1) * productosPorPagina;
  const fin = inicio + productosPorPagina;

  productosFiltrados.slice(inicio, fin).forEach(p => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img 
        src="https://res.cloudinary.com/${cloudName}/image/upload/w_600,q_auto,f_webp/${p.Imagen}" 
        alt="${p.Nombre}" 
        class="img-producto"
      >
      <h3>${p.Nombre}</h3>
      <div class="precio">${formatoPrecio(p.Precio)}</div>
      <button class="btn-agregar">Agregar al carrito</button>
    `;

    card.querySelector(".img-producto")
      .addEventListener("click", () => abrirModal(p.Imagen));

    card.querySelector(".btn-agregar")
      .addEventListener("click", e => agregarAlCarrito(p, e.target));

    cont.appendChild(card);
  });

  /* ============================= */
  /* CONTROL PAGINACIÓN PREMIUM */
  /* ============================= */

  if (totalPaginas <= 1) {
    paginacion.style.display = "none";
    return;
  } else {
    paginacion.style.display = "flex"; // o block según tu CSS
  }

  infoPagina.textContent = `Página ${paginaActual} de ${totalPaginas}`;

  btnAnterior.disabled = paginaActual === 1;
  btnSiguiente.disabled = paginaActual === totalPaginas;

}

/* ============================= */
/* PAGINACIÓN */
/* ============================= */

function paginaSiguiente() {
  if (paginaActual * productosPorPagina < productosFiltrados.length) {
    paginaActual++;
    renderPagina();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function paginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    renderPagina();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/* ============================= */
/* MODAL */
/* ============================= */

function abrirModal(imgId) {
  $("imagenGrande").src =
    `https://res.cloudinary.com/${cloudName}/image/upload/w_1200,q_auto,f_webp/${imgId}`;
  $("modalImagen").classList.add("activo");
}

function cerrarModal() {
  $("modalImagen").classList.remove("activo");
}

/* ============================= */
/* CARRITO */
/* ============================= */

function agregarAlCarrito(producto, boton) {

  const existente = carrito.find(p => p.id === producto.id);

  existente
    ? existente.cantidad++
    : carrito.push({ ...producto, cantidad: 1 });

  guardarCarrito();
  actualizarCarritoUI();
  animarBoton(boton);
}

function animarBoton(boton) {
  if (!boton) return;

  const texto = boton.innerText;
  boton.innerText = "Agregado ✓";
  boton.disabled = true;

  setTimeout(() => {
    boton.innerText = texto;
    boton.disabled = false;
  }, 1200);
}

function eliminarProducto(id) {
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();
  actualizarCarritoUI();
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(p => p.id === id);
  if (!item) return;

  item.cantidad += cambio;
  if (item.cantidad <= 0) eliminarProducto(id);

  guardarCarrito();
  actualizarCarritoUI();
}

/* ============================= */
/* UI CARRITO */
/* ============================= */

function actualizarCarritoUI() {

  const lista = $("listaCarrito");
  const contador = $("contadorCarrito");
  const totalSpan = $("totalCarrito");

  lista.innerHTML = "";
  let total = 0;
  let totalItems = 0;

  carrito.forEach(item => {

    total += item.Precio * item.cantidad;
    totalItems += item.cantidad;

    lista.innerHTML += `
      <div class="item-carrito">
        <img src="https://res.cloudinary.com/${cloudName}/image/upload/w_200,q_auto,f_webp/${item.Imagen}">
        <div class="item-info">
          <h4>${item.Nombre}</h4>
          <div class="precio">${formatoPrecio(item.Precio * item.cantidad)}</div>
          <div class="controles-cantidad">
            <button onclick="cambiarCantidad(${item.id}, -1)">−</button>
            <span>${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
          </div>
          <button onclick="eliminarProducto(${item.id})">Eliminar</button>
        </div>
      </div>
    `;
  });

  contador.textContent = totalItems;
  totalSpan.textContent = formatoPrecio(total);
}

/* ============================= */
/* CARRITO PANEL */
/* ============================= */

function abrirCarrito() {
  $("carritoPanel").classList.add("activo");
  $("carritoOverlay").classList.add("activo");
}

function cerrarCarrito() {
  $("carritoPanel").classList.remove("activo");
  $("carritoOverlay").classList.remove("activo");
}

/* ============================= */
/* WHATSAPP */
/* ============================= */

function enviarPedidoWhatsApp() {

  if (!carrito.length) return alert("Tu carrito está vacío");

  let mensaje = "Hola Foxlab Co 👋\n\nPedido:\n\n";
  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.Precio * item.cantidad;
    total += subtotal;

    mensaje += `• ${item.Nombre}\n`;
    mensaje += `  Cantidad: ${item.cantidad}\n`;
    mensaje += `  Subtotal: ${formatoPrecio(subtotal)}\n\n`;
  });

  mensaje += `Total: ${formatoPrecio(total)}\n\nMi nombre es:`;

  window.open(
    `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`,
    "_blank"
  );

  carrito = [];
  guardarCarrito();
  actualizarCarritoUI();
  cerrarCarrito();
}

/* ============================= */
/* INIT */
/* ============================= */

(async function init() {
  try {
    productosGlobal = await fetchProductos();
    productosFiltrados = [...productosGlobal];
    renderPagina();
    actualizarCarritoUI();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
})();