import "./errores.css";

export const errores = (contenedor, contexto) => {
  contenedor.innerHTML = `<p class="error-visible">Error, ${contexto}</p>`;

  setTimeout(() => {
    contenedor.innerHTML = "";
  }, 5000);
};// modularizacion para los errores
