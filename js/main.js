//registrando a service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      let reg;
      reg = await navigator.serviceWorker.register('/sw.js', { type: "module" });

      console.log('Service worker registrada! 😎', reg);
    } catch (err) {
      console.log('😥 Service worker registro falhou: ', err);
    }
  });
}

let posicaoInicial;
const capturarLocalizacao = document.getElementById('localizacao');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');

const sucesso = (posicao) => {
  posicaoInicial = posicao;
  latitude.textContent = posicaoInicial.coords.latitude;
  longitude.textContent = posicaoInicial.coords.longitude;
};

const erro = (error) => {
let errorMessage;
  switch (error.code) {
    case 0:
      errorMessage = 'Não foi possível obter a localização';
      break;
    case 1:
      errorMessage = 'Permissão negada';
      break;
    case 2:
      errorMessage = 'Localização indisponivel';
      break;
    case 3:
      errorMessage = 'Tempo de solicitação excedido';
      break;
  }
  console.log(errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(sucesso, erro);
});






// }

// const apiKey = "8c8e07369161486895eee8393d7ecca8"
// let url = 'https://newsapi.org/v2/top-headlines?country=br&apiKey=' + apiKey ;
// const main = document.querySelector('main');

// async function postNews() {
//   const res = await fetch(url);
//   const data = await res.json();
//   main.innerHTML = data.articles.map(createArticle).join('\n');
  
// }

// function createArticle(article) {
//   console.log(article);
//   return ` 
//       <div class="article">
//             <a href="${article.url}"  target="_blank">
//               <img src="${article.urlToImage}" 
//                 class="image" alt="${article.content}"/>
//               <h2>${article.title}</h2>
//               <p>${article.description}</p>
//             </a>
//       </div>
//   `;
// }