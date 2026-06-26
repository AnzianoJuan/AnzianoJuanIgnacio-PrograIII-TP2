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
const $ordenPrecio = getElemById("orden-precio");
const $btnCargarMas = getElemById("btn-cargar-mas");

let page = 1;

let datosMercado = [];

//  MERCADO
async function cargarMercado() {
  $btnCargarMas.disabled = true;// lo desabilito un toque porque puede pasar que deje de funcionar
  try {
    const data = await obtenerMercado(page);

    if (page === 1) {
      datosMercado = data;// muestra los primeros
    } else {
      datosMercado = [...datosMercado, ...data];// sino es porque quiere cargar mas , por ende empiezo a sacar copias 
    }

    page++;//aumento
    aplicarFiltro();// aplico el filtro 
  } catch (error) {
    errores($mercadoGrid, " en la carga de criptos");
    console.error(error);
  }finally{
        $btnCargarMas.disabled = false; // lo libero asi se permite seguir enviando peticiones
  }
}

$btnCargarMas.addEventListener("click", cargarMercado);

function filtrarPorVariacion(criptos, criterio) {
  if (criterio === "subiendo") {
    return criptos.filter(
      ({ price_change_percentage_24h }) => price_change_percentage_24h > 0,// retorna las criptos filtradas que suben 
    );
  }
  if (criterio === "bajando") {
    return criptos.filter(
      ({ price_change_percentage_24h }) => price_change_percentage_24h < 0,// viceversa
    );
  }
  return criptos;// return default
}

function aplicarFiltro() {
  let resultado = filtrarPorVariacion(datosMercado, $filtroVariacion.value);// filta por subiendo o bajando
  resultado = ordenarPorPrecio(resultado, $ordenPrecio.value);// ordena

  if (resultado.length === 0) {
    errores($mercadoGrid, " no hay resultados con ese filtro");// si no encuentra nada , error en el grid
    return;
  }

  renderizarAccionesRelevantes(resultado); //llama a renderizar
}

const renderizarAccionesRelevantes = (criptos) => {
  let html = "";
  criptos.forEach(
    ({
      id,
      image,
      name,// destructuring
      symbol,
      current_price,
      price_change_percentage_24h,
    }) => {
      const esPositiva = price_change_percentage_24h > 0;
      const claseVariacion = esPositiva
        ? "variacion-positiva"
        : "variacion-negativa";
      const signo = esPositiva ? "+" : "";// cambio la clase dependiendo la variacion

      html += `
      <div class="cripto-card" data-id="${id}">
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
  agregarClicksATarjetas();
};

//clicks a las tarjetas , para ver detalles 
function agregarClicksATarjetas() {
  const tarjetas = document.querySelectorAll(".cripto-card");
  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => {
      const id = tarjeta.dataset.id;
      window.location.href = `/src/pages/detalle-cripto/index.html?id=${id}`;//le paso el id para ver detalle
    });
  });
}

async function buscarCripto(nombre) {
  try {
    const cripto = await buscarCriptoPorNombre(nombre);// llamo al fetch
    if (!cripto) {
      errores($buscadorResultado, ` no se encontró la cripto ${nombre}`);
      return;
    }
    renderizarCripto(cripto); ///renderizo
  } catch (err) {
    errores($buscadorResultado, ` no se encontró la cripto ${nombre}`);
    console.error(err);
  }
}

function renderizarCripto({
  name,
  symbol,
  image: { large },// destructuring
  market_data: {
    current_price: { usd },
    price_change_percentage_24h,
  },
}) {
  const esPositiva = price_change_percentage_24h > 0;
  const claseVariacion = esPositiva
    ? "variacion-positiva"
    : "variacion-negativa";
  const signo = esPositiva ? "+" : ""; // cambio las clases dependiendo la variacion

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

// se lanza cuando hace click
$buscadorBtn.addEventListener("click", () => {
  const nombre = $buscadorInput.value.trim();
  if (nombre === "") {
    return;
  }
  buscarCripto(nombre);
});

// renderiza las tendencias
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
        id,
        small,
        name,// destructuring
        symbol,
        data: { price, price_change_percentage_24h },
      },
    }) => {
      const variacionUsd = price_change_percentage_24h.usd;
      const esPositiva = variacionUsd > 0;
      const claseVariacion = esPositiva
        ? "variacion-positiva"
        : "variacion-negativa";
      const signo = esPositiva ? "+" : ""; // clase de variacion 

      html += `
        <div class="cripto-card" data-id="${id}">
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
  agregarClicksATarjetas();// agrega el detalle 
};

cargarTendencias();

//ordena por precios
function ordenarPorPrecio(criptos, direccion) {
  if (direccion === "desc") {
    return criptos.toSorted((a, b) => b.current_price - a.current_price);
  }
  if (direccion === "asc") {
    return criptos.toSorted((a, b) => a.current_price - b.current_price);
  }
  return criptos;
}

//cargo el mercado 
cargarMercado();
$filtroVariacion.addEventListener("change", aplicarFiltro);
$ordenPrecio.addEventListener("change", aplicarFiltro);
