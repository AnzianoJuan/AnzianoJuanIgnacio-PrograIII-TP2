import { errores } from "./errores.js";
import { getElemById } from "./getElements.js";

const $mercadoGrid = getElemById("mercado-grid");
const $buscadorInput = getElemById("buscador-input");
const $buscadorBtn = getElemById("buscador-btn");
const $buscadorResultado = getElemById("buscador-resultado");
const $tendenciasGrid = getElemById("tendencias-grid");
const API_URL = import.meta.env.VITE_API_URL;

//  Obtengo las 10 criptos más relevantes
async function obtenerLasAccionesMasRelevantes() {
  try {
    const res = await fetch(
      `${API_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1`,
    );
    if (!res.ok) {
      throw new Error("Error en la api");
    }

    const data = await res.json();
    renderizarAccionesRelevantes(data);
  } catch (error) {
    errores($mercadoGrid, " en la carga de criptos");
    console.error(error);
  }
}

//renderizo las criptos mas relevantes atraves de innerHTML
const renderizarAccionesRelevantes = (criptos) => {
  let html = "";
  criptos.forEach((cripto) => {
    html += `
      <div class="cripto-card">
          <div class="cripto-card-header">
              <img class="cripto-img" src="${cripto.image}" alt="${cripto.name}">
              <div>
                  <p class="cripto-nombre">${cripto.name}</p>
                  <p class="cripto-simbolo">${cripto.symbol.toUpperCase()}</p>
              </div>
          </div>
          <div class="cripto-card-footer">
              <p class="cripto-precio">$${cripto.current_price.toLocaleString()}</p>
          </div>
      </div>
    `;
  });
  $mercadoGrid.innerHTML = html;
};

obtenerLasAccionesMasRelevantes();

setInterval(() => {
  obtenerLasAccionesMasRelevantes();
}, 60000);

//  Búsqueda de cripto, primero ID , luego nombre
async function buscarCripto(nombre) {
  try {
    const resBusqueda = await fetch(`${API_URL}/search?query=${nombre}`);
    if (!resBusqueda.ok) {
      throw new Error("Error en la búsqueda");
    }
    const dataBusqueda = await resBusqueda.json();

    if (dataBusqueda.coins.length === 0) {
      errores($buscadorResultado, ` no se encontró la cripto ${nombre}`);
      return;
    }

    const idCorrecto = dataBusqueda.coins[0].id;

    const res = await fetch(`${API_URL}/coins/${idCorrecto}`);
    if (!res.ok) {
      throw new Error("Error en la api");
    }

    const cripto = await res.json();
    renderizarCripto(cripto);
  } catch (err) {
    errores($buscadorResultado, ` no se encontró la cripto ${nombre}`);
    console.error(err);
  }
}


//renderizo la cripto si fue encontrada en la busqueda!
function renderizarCripto(cripto) {
  $buscadorResultado.innerHTML = `
        <div class="cripto-detalle">
            <div class="cripto-detalle-header">
                <img class="cripto-detalle-img" src="${cripto.image.large}" alt="${cripto.name}">
                <div>
                    <h3 class="cripto-detalle-nombre">${cripto.name}</h3>
                    <p class="cripto-detalle-simbolo">${cripto.symbol}</p>
                </div>
            </div>
            <div class="cripto-detalle-datos">
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Precio actual</p>
                    <p class="cripto-detalle-valor">$${cripto.market_data.current_price.usd.toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
}

//se lanza el evento para buscar la cripto
$buscadorBtn.addEventListener("click", () => {
  const nombre = $buscadorInput.value.trim();
  if (nombre === "") {
    return;//si es usuario no escribio nada, corta aca
  }
  buscarCripto(nombre);
});

//  obtengo las criptos que sean mas buscadas en el ultimo momento
async function obtenerTendencias() {
  try {
    const res = await fetch(`${API_URL}/search/trending`);
    if (!res.ok) {
      throw new Error("error con la api");
    }
    const tendencias = await res.json();
    renderizarTendencias(tendencias.coins);
  } catch (error) {
    errores($tendenciasGrid, " en cargar las tendencias");
    console.error(error);
  }
}

//renderiza las tendencias atraves del grid , primero se acumulan porque son un conjunto
const renderizarTendencias = (tendencias) => {
  let html = "";
  tendencias.forEach((tendencia) => {
    html += `
    <div class="cripto-card">
        <div class="cripto-card-header">
            <img class="cripto-img" src="${tendencia.item.small}" alt="${tendencia.item.name}">
            <div>
                <p class="cripto-nombre">${tendencia.item.name}</p>
                <p class="cripto-simbolo">${tendencia.item.symbol}</p>
            </div>
        </div>
        <div class="cripto-card-footer">
            <p class="cripto-precio"> $${tendencia.item.data.price.toLocaleString()}</p>
        </div>
    </div>
`;
  });
  $tendenciasGrid.innerHTML = html;
};

obtenerTendencias();

setInterval(() => {
  obtenerTendencias();
}, 60000);
