const $noticiasGrid = document.getElementById("noticias-grid");

const TOKEN = import.meta.env.VITE_NEWSDATA_TOKEN;

async function obtenerNoticias() {
  try {
    const res = await fetch(
      `https://newsdata.io/api/1/news?apikey=${TOKEN}&q=crypto&language=en`,
    );
    const data = await res.json();
    renderizarNoticias(data.results);
  } catch {
    console.error("error");
  }
}

function renderizarNoticias(noticias) {
  let html = "";
  noticias.forEach((noticia) => {
    html += `
            <a class="noticia-card" href="${noticia.link}" target="_blank">
                <p class="noticia-fuente">${noticia.source_id}</p>
                <p class="noticia-titulo">${noticia.title}</p>
                <p class="noticia-fecha">${new Date(noticia.pubDate).toLocaleDateString("es-AR")}</p>
            </a>
        `;
  });
  $noticiasGrid.innerHTML = html;
}

obtenerNoticias();
