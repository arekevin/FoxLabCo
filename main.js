/* ============================= */
/* UTILIDADES GLOBALES */
/* ============================= */

const $ = id => document.getElementById(id);
const formatoPrecio = num => `$${Number(num).toLocaleString()}`;
const limpiarTexto = texto => texto?.trim().toLowerCase();

/* ============================= */
/* NAV ACTIVE */
/* ============================= */

const links = document.querySelectorAll(".filter");
const current = window.location.pathname;

links.forEach(link => {
  if (current.includes(link.getAttribute("href"))) {
    link.classList.add("active");
  }
});

/* ============================= */
/* MENU HAMBURGUESA */
/* ============================= */

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const overlay = document.getElementById("overlay");

if (menuBtn && mobileMenu && overlay) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    mobileMenu.classList.remove("active");
    overlay.classList.remove("active");
  });
}