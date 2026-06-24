import { errores } from "./errores.js";
import { getElemById } from "./getElements.js";
import { obtenerMercado } from "@/services/MercadoServices.js";
import { buscarCriptoPorNombre } from "@/services/BuscadorServices.js";
import { obtenerTendencias } from "@/services/TendenciasServices.js";

const $mercadoGrid = getElemById("mercado-grid");
const $buscadorInput = getElemById("buscador-input");
const $buscadorBtn = getElemById("buscador-btn");
const $buscadorResultado = getElemById("buscador-resultado");
const $tendenciasGrid = getElemById("tendencias-grid");
const $filtroVariacion = getElemById("filtro-variacion");

let datosMercado = [];

//  MERCADO
async function cargarMercado() {
  try {
    const data = await obtenerMercado();
    datosMercado = data;
    aplicarFiltro();
  } catch (error) {
    errores($mercadoGrid, " en la carga de criptos");
    console.error(error);
  }
}

function filtrarPorVariacion(criptos, criterio) {
  if (criterio === "subiendo") {
    return criptos.filter(
      ({ price_change_percentage_24h }) => price_change_percentage_24h > 0,
    );
  }
  if (criterio === "bajando") {
    return criptos.filter(
      ({ price_change_percentage_24h }) => price_change_percentage_24h < 0,
    );
  }
  return criptos;
}

function aplicarFiltro() {
  const resultado = filtrarPorVariacion(datosMercado, $filtroVariacion.value);

  if (resultado.length === 0) {
    errores($mercadoGrid, " no hay resultados con ese filtro");
    return;
  }

  renderizarAccionesRelevantes(resultado);
}

const renderizarAccionesRelevantes = (criptos) => {
  let html = "";
  criptos.forEach(
    ({ image, name, symbol, current_price, price_change_percentage_24h }) => {
      const esPositiva = price_change_percentage_24h > 0;
      const claseVariacion = esPositiva
        ? "variacion-positiva"
        : "variacion-negativa";
      const signo = esPositiva ? "+" : "";

      html += `
      <div class="cripto-card">
          <div class="cripto-card-header">
              <img class="cripto-img" src="${image}" alt="${name}">
              <div>
                  <p class="cripto-nombre">${name}</p>
                  <p class="cripto-simbolo">${symbol.toUpperCase()}</p>
              </div>
          </div>
          <div class="cripto-card-footer">
              <p class="cripto-precio">$${current_price.toLocaleString()}</p>
              <p class="cripto-variacion ${claseVariacion}">
                ${signo}${price_change_percentage_24h.toFixed(2)}%
              </p>
          </div>
      </div>
    `;
    },
  );
  $mercadoGrid.innerHTML = html;
};

cargarMercado();
$filtroVariacion.addEventListener("change", aplicarFiltro);

async function buscarCripto(nombre) {
  try {
    const cripto = await buscarCriptoPorNombre(nombre);
    if (!cripto) {
      errores($buscadorResultado, ` no se encontró la cripto ${nombre}`);
      return;
    }
    renderizarCripto(cripto);
  } catch (err) {
    errores($buscadorResultado, ` no se encontró la cripto ${nombre}`);
    console.error(err);
  }
}

function renderizarCripto({
  name,
  symbol,
  image: { large },
  market_data: {
    current_price: { usd },
    price_change_percentage_24h,
  },
}) {
  const esPositiva = price_change_percentage_24h > 0;
  const claseVariacion = esPositiva
    ? "variacion-positiva"
    : "variacion-negativa";
  const signo = esPositiva ? "+" : "";

  $buscadorResultado.innerHTML = `
        <div class="cripto-detalle">
            <div class="cripto-detalle-header">
                <img class="cripto-detalle-img" src="${large}" alt="${name}">
                <div>
                    <h3 class="cripto-detalle-nombre">${name}</h3>
                    <p class="cripto-detalle-simbolo">${symbol}</p>
                </div>
            </div>
            <div class="cripto-detalle-datos">
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Precio actual</p>
                    <p class="cripto-detalle-valor">$${usd.toLocaleString()}</p>
                </div>
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Variación 24h</p>
                    <p class="cripto-detalle-valor ${claseVariacion}">
                      ${signo}${price_change_percentage_24h.toFixed(2)}%
                    </p>
                </div>
            </div>
        </div>
    `;
}

$buscadorBtn.addEventListener("click", () => {
  const nombre = $buscadorInput.value.trim();
  if (nombre === "") {
    return;
  }
  buscarCripto(nombre);
});

async function cargarTendencias() {
  try {
    const tendencias = await obtenerTendencias();
    renderizarTendencias(tendencias);
  } catch (error) {
    errores($tendenciasGrid, " en cargar las tendencias");
    console.error(error);
  }
}

const renderizarTendencias = (tendencias) => {
  let html = "";
  tendencias.forEach(
    ({
      item: {
        small,
        name,
        symbol,
        data: { price, price_change_percentage_24h },
      },
    }) => {
      const variacionUsd = price_change_percentage_24h.usd;
      const esPositiva = variacionUsd > 0;
      const claseVariacion = esPositiva
        ? "variacion-positiva"
        : "variacion-negativa";
      const signo = esPositiva ? "+" : "";

      html += `
        <div class="cripto-card">
            <div class="cripto-card-header">
                <img class="cripto-img" src="${small}" alt="${name}">
                <div>
                    <p class="cripto-nombre">${name}</p>
                    <p class="cripto-simbolo">${symbol}</p>
                </div>
            </div>
            <div class="cripto-card-footer">
                <p class="cripto-precio">$${price.toLocaleString()}</p>
                <p class="cripto-variacion ${claseVariacion}">
                  ${signo}${variacionUsd.toFixed(2)}%
                </p>
            </div>
        </div>
      `;
    },
  );
  $tendenciasGrid.innerHTML = html;
};

cargarTendencias();
