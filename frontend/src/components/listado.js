import { listarEquipos, eliminarEquipo } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const POR_PAGINA = 6;

const $lista = document.querySelector("#lista-equipos");
const $plantilla = document.querySelector("#tpl-equipo");
const $resumen = document.querySelector("#resumen");
const $paginaActual = document.querySelector("#pagina-actual");
const $btnAnterior = document.querySelector("#btn-anterior");
const $btnSiguiente = document.querySelector("#btn-siguiente");

let paginaActual = 1;
let ultimaPagina = 1;

// YA IMPLEMENTADO — "2026-09-15" -> "15 set 2026"
export const formatearFecha = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" });

export const cargarPagina = async (pagina = 1) => {
  $lista.setAttribute("aria-busy", "true");

  try {
    const respuesta = await listarEquipos(pagina, POR_PAGINA);
    const { data, meta } = respuesta;

    paginaActual = meta.current_page;
    ultimaPagina = meta.last_page;

    $lista.replaceChildren();

    for (const equipo of data) {
      const tarjeta = $plantilla.content.cloneNode(true);
      const $li = tarjeta.querySelector("li");

      $li.dataset.id = equipo.id;

      tarjeta.querySelector(".codigo").textContent = equipo.codigo;
      tarjeta.querySelector(".nombre").textContent = equipo.nombre;
      tarjeta.querySelector(".categoria").textContent =
        equipo.categoria?.nombre ?? "Sin categoría";
      tarjeta.querySelector(".fecha").textContent =
        formatearFecha(equipo.fecha_adquisicion);

      const $estado = tarjeta.querySelector(".estado");
      $estado.textContent = equipo.estado;
      $estado.dataset.estado = equipo.estado;

      $lista.append(tarjeta);
    }

    // Mostrar mensaje si está vacío
    if (data.length === 0) {
      const $vacio = document.createElement("li");
      $vacio.className = "vacio";
      $vacio.textContent = "No hay equipos registrados.";
      $lista.append($vacio);
    }

    // Mostrar resumen y página
    $resumen.textContent =
      `Mostrando ${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total}`;

    $paginaActual.textContent =
      `Página ${paginaActual} de ${ultimaPagina}`;

    $btnAnterior.disabled = paginaActual <= 1;
    $btnSiguiente.disabled = paginaActual >= ultimaPagina;

  } catch (error) {
    mostrarMensaje(
      "error",
      error.message ?? "No se pudo cargar el inventario."
    );
  } finally {
    $lista.setAttribute("aria-busy", "false");
  }
};

// F4 - Eliminar mediante delegación de eventos
const alHacerClicEnLista = async (evento) => {
  const $boton = evento.target.closest(".btn-eliminar");

  if (!$boton) return;

  const id = $boton.closest("[data-id]")?.dataset.id;

  if (!id || !confirm("¿Desea eliminar este equipo?")) return;

  const ultimaTarjeta =
    $lista.querySelectorAll(".tarjeta").length === 1;

  $boton.disabled = true;

  try {
    await eliminarEquipo(id);

    mostrarMensaje("exito", "Equipo eliminado.");

    const paginaDestino = ultimaTarjeta && paginaActual > 1
      ? paginaActual - 1 : paginaActual;

    await cargarPagina(paginaDestino);

  } catch (error) {
    if (error.status === 409) {
      mostrarMensaje(
        "error",
        error.datos?.mensaje ?? error.message
      );
    } else {
      mostrarMensaje("error", "No se pudo eliminar el equipo.");
    }
  } finally {
    $boton.disabled = false;
  }
};

// Inicializar lista y botones
export const iniciarListado = () => {
  $lista.addEventListener("click", alHacerClicEnLista);

  $btnAnterior.addEventListener("click", () => {
    if (paginaActual > 1) {
      cargarPagina(paginaActual - 1);
    }
  });

  $btnSiguiente.addEventListener("click", () => {
    if (paginaActual < ultimaPagina) {
      cargarPagina(paginaActual + 1);
    }
  });
  
    cargarPagina(1);
};