import './style.css';

const cameraView = document.querySelector("#camera--view"),
  cameraSensor = document.querySelector("#camera--sensor"),
  cameraTrigger = document.querySelector("#camera--trigger"),
  switchCameraButton = document.getElementById("switch-camera"),
  photoTitleInput = document.getElementById("photo-title");

let cameraMode = "user";
const lastPhotos = [];

const constraints = () => ({ video: { facingMode: cameraMode }, audio: false });

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("cameraDB", 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("photos")) {
        db.createObjectStore("photos", { autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function savePhoto(photoWithLocation) {
  const db = await openDB();
  const transaction = db.transaction("photos", "readwrite");
  const store = transaction.objectStore("photos");
  store.add(photoWithLocation);
}

async function loadPhotos() {
  const db = await openDB();
  const transaction = db.transaction("photos", "readonly");
  const store = transaction.objectStore("photos");
  const request = store.getAll();
  request.onsuccess = () => {
    lastPhotos.length = 0;
    lastPhotos.push(...request.result.slice(-10));
    updatePhotoGallery();
  };
}

function updatePhotoGallery() {
  const gallery = document.getElementById("photo-gallery");
  if (!gallery) return;

  gallery.innerHTML = "";

  lastPhotos.forEach((photoWithLocation) => {
    const img = document.createElement("img");
    img.src = photoWithLocation.photo;
    img.classList.add("photo-preview");

    const title = document.createElement("h3");
    title.innerText = `Título: ${photoWithLocation.title || "Sem título"}`;

    const iframe = document.createElement("iframe");
    iframe.width = "100%";
    iframe.height = "300";
    iframe.frameBorder = "0";
    iframe.style.border = "0";
    iframe.allowFullscreen = true;
    iframe.src = `https://www.google.com/maps?q=${photoWithLocation.location.latitude},${photoWithLocation.location.longitude}&z=15&output=embed`;

    gallery.appendChild(img);
    gallery.appendChild(title);
    gallery.appendChild(iframe);
  });
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { type: "module" });
      console.log('Service Worker registrado!', reg);
    } catch (err) {
      console.log('Registro do Service Worker falhou:', err);
    }
  });
}

const photosData = [

];

const cardsContainer = document.getElementById("cards-container");
const photoMap = document.getElementById("photo-map");

function createPhotoCards() {
  photosData.forEach((photo) => {
    const card = document.createElement("div");
    card.classList.add("photo-card");

    const img = document.createElement("img");
    img.src = photo.imagem;
    img.alt = "Foto com localização";

    card.appendChild(img);
    cardsContainer.appendChild(card);

    card.addEventListener("click", () => {
      photoMap.src = `https://www.google.com/maps?q=${photo.latitude},${photo.longitude}&z=15&output=embed`;
    });
  });
}

createPhotoCards();

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints())
    .then((stream) => {
      cameraView.srcObject = stream;
    })
    .catch((error) => console.error("Ocorreu um erro.", error));
}

cameraTrigger.onclick = async function () {
  const photoTitle = photoTitleInput.value.trim();
  if (!photoTitle) {
    alert("Por favor, insira um título antes de tirar a foto.");
    return;
  }

  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);
  const photoData = cameraSensor.toDataURL("image/webp");

  navigator.geolocation.getCurrentPosition(async (posicao) => {
    const photoWithLocation = {
      title: photoTitle,
      photo: photoData,
      location: { latitude: posicao.coords.latitude, longitude: posicao.coords.longitude },
      timestamp: new Date().toISOString()
    };

    lastPhotos.push(photoWithLocation);
    if (lastPhotos.length > 3) lastPhotos.shift();

    await savePhoto(photoWithLocation);
    updatePhotoGallery();
  }, erro);
};

switchCameraButton.onclick = function () {
  cameraMode = cameraMode === "user" ? "environment" : "user";
  cameraStart();
};

window.addEventListener("load", () => {
  cameraStart();
  loadPhotos();
});
