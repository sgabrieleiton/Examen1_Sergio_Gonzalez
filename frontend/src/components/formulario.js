import { crearEquipo, listarCategorias } from "../modules/equipos.js";
import { mostrarMensaje } from "./mensajes.js";

const $form = document.querySelector("#form-equipo");
const $selectCategoria = document.querySelector("#categoria_id");
const $btnGuardar = document.querySelector("#btn-guardar");

/**
 * TODO [F3] Formulario de registro de equipos.
 *
 * iniciarFormulario({ alGuardar }):
 *  1. Llene el <select id="categoria_id"> con listarCategorias()
 *     (cree cada <option> con createElement, value = id, texto = nombre).
 *  2. Al enviar el formulario (submit):
 *     - Evite el envío tradicional.
 *     - Limpie los errores anteriores: textContent de [data-error] y aria-invalid de los campos.
 *     - Construya el objeto con FormData. categoria_id y costo_interno deben ir como números.
 *     - Deshabilite #btn-guardar y cambie su texto a "Guardando…" mientras espera.
 *     - Llame a crearEquipo(datos).
 *     - Éxito: limpie el formulario, mostrarMensaje("exito", "Equipo <codigo> registrado.")
 *              y llame a alGuardar().
 *     - 422: por cada campo de error.datos.errors, escriba el PRIMER mensaje en
 *            el <p data-error="<campo>"> y marque el campo con aria-invalid="true".
 *     - Otro error: mostrarMensaje("error", ...).
 *     - Siempre (finally): rehabilite el botón y restaure su texto.
 */
export const iniciarFormulario = ({ alGuardar }) => {

  // Cargar las categorías en el select
  listarCategorias()
    .then((respuesta) => {
      for (const categoria of respuesta.data) {
        const opcion = document.createElement("option");
        opcion.value = categoria.id;
        opcion.textContent = categoria.nombre;
        $selectCategoria.append(opcion);
      }
    })
    .catch((error) => {
      mostrarMensaje(
        "error",
        error.message ?? "No se pudieron cargar las categorías."
      );
    });

  // Registrar equipo
  $form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Limpiar errores anteriores
    $form.querySelectorAll("[data-error]").forEach(($error) => {
      $error.textContent = "";
    });

    $form.querySelectorAll('[aria-invalid="true"]').forEach(($campo) => {
      $campo.removeAttribute("aria-invalid");
    });

    // Obtener y convertir los datos
    const datos = Object.fromEntries(
      new FormData($form).entries()
    );

    datos.categoria_id = datos.categoria_id === ""
      ? null : Number(datos.categoria_id);

    datos.costo_interno = datos.costo_interno === ""
      ? null : Number(datos.costo_interno);

    // Deshabilitar el botón
    const textoOriginal = $btnGuardar.textContent;
    $btnGuardar.disabled = true;
    $btnGuardar.textContent = "Guardando…";

    try {
      await crearEquipo(datos);

      $form.reset();

      mostrarMensaje(
        "exito",
        `Equipo ${datos.codigo} registrado.`
      );

      await alGuardar();

    } catch (error) {

      // Mostrar errores 422 al lado de cada campo
      if (error.status === 422) {
        for (const [campo, mensajes] of Object.entries(
          error.datos?.errors ?? {}
        )) {
          const $mensaje = $form.querySelector(
            `[data-error="${campo}"]`
          );

          if ($mensaje) {
            $mensaje.textContent = mensajes[0];
          }

          const $campo = $form.elements.namedItem(campo);

          if ($campo) {
            $campo.setAttribute("aria-invalid", "true");
          }
        }

      } else {
        mostrarMensaje(
          "error",
          error.message ?? "No se pudo registrar el equipo."
        );
      }

    } finally {
      $btnGuardar.disabled = false;
      $btnGuardar.textContent = textoOriginal;
    }
  });
};