const $mercadoGrid = document.getElementById("mercado-grid");
const $buscadorInput = document.getElementById("buscador-input");
const $buscadorBtn = document.getElementById("buscador-btn");
const $buscadorResultado = document.getElementById("buscador-resultado");
const $tendenciasGrid = document.getElementById("tendencias-grid");

async function obtenerLasAccionesMasRelevantes() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1",
    );
    const data = await res.json();
    renderizarAccionesRelevantes(data);
  } catch {
    console.error("error");
  }
}

const renderizarAccionesRelevantes = (criptos) => {
  let html = "";

  criptos.forEach((cripto) => {
    html += `
            <div class="cripto-card">
                <div class="cripto-card-header">
                    <img class="cripto-img" src="${cripto.image}" alt="${cripto.name}">
                    <div>
                        <p class="cripto-nombre">${cripto.name}</p>
                        <p class="cripto-simbolo">${cripto.symbol}</p>
                    </div>
                </div>
                <div class="cripto-card-footer">
                    <p class="cripto-precio">$${cripto.current_price}</p>
                </div>
            </div>
        `;
  });

  $mercadoGrid.innerHTML = html;
};

obtenerLasAccionesMasRelevantes();

//aca los actualizo cada 60 segundos asi se hace dinamico
setInterval(() => {
  obtenerLasAccionesMasRelevantes();
}, 60000);

async function buscarCripto(nombre) {
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${nombre}`);
    const cripto = await res.json();
    renderizarCripto(cripto);
  } catch (err) {
    console.error(err);
  }
}

function renderizarCripto(cripto) {
  const variacion = cripto.market_data.price_change_percentage_24h.toFixed(2);
  const esPositiva = variacion >= 0;

  $buscadorResultado.innerHTML = `
        <div class="cripto-detalle">
            <div class="cripto-detalle-header">
                <img class="cripto-detalle-img" src="${cripto.image.large}" alt="${cripto.name}">
                <div>
                    <h3 class="cripto-detalle-nombre">${cripto.name}</h3>
                    <p class="cripto-detalle-simbolo">${cripto.symbol.toUpperCase()}</p>
                </div>
            </div>
            <div class="cripto-detalle-datos">
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Precio actual</p>
                    <p class="cripto-detalle-valor">$${cripto.market_data.current_price.usd.toLocaleString()}</p>
                </div>
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Variación 24hs</p>
                    <p class="cripto-detalle-valor ${esPositiva ? "positiva" : "negativa"}">
                        ${esPositiva ? "+" : ""}${variacion}%
                    </p>
                </div>
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Máximo 24hs</p>
                    <p class="cripto-detalle-valor">$${cripto.market_data.high_24h.usd.toLocaleString()}</p>
                </div>
                <div class="cripto-detalle-card">
                    <p class="cripto-detalle-label">Mínimo 24hs</p>
                    <p class="cripto-detalle-valor">$${cripto.market_data.low_24h.usd.toLocaleString()}</p>
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

async function obtenerTendencias() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending");
    const tendencias = await res.json();
    renderizarTendencias(tendencias.coins);
  } catch {
    console.error("error");
  }
}

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
            <p class="cripto-precio">${parseFloat(tendencia.item.data.price).toLocaleString()}</p>
        </div>
    </div>
`;
  });
  $tendenciasGrid.innerHTML = html;
};

obtenerTendencias();
