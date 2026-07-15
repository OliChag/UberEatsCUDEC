let contenido = "";
document.addEventListener('DOMContentLoaded', function() {
  // nav menu
  const menus = document.querySelectorAll('.side-menu');
  M.Sidenav.init(menus, {edge: 'right'});
  // add recipe form
  const forms = document.querySelectorAll('.side-form');
  M.Sidenav.init(forms, {edge: 'left'});
});

function MostrarPlatillo(platillo, id) {
  let fotoPlatillo;
  if (platillo.foto ) {
    fotoPlatillo ="data:image/png;base64, " + platillo.foto;
  }
  else {
    fotoPlatillo = "img/dish.png";
  }
  contenido = `
  <div class='card-panel recipe white row ' id='${id}' data-id='${id}'>
  <img src="${fotoPlatillo}" height="50" width="100" >
  <div class='recipe-details'>
   <div class='recipe-title'>
    ${platillo.nombre}
   </div>
   <div class='recipe-ingredients'>
    ${platillo.ingredientes}
   </div>
   <div class='recipe-price'>
    ${'$' + platillo.precio}
   </div>
   <div class='recipe-delete'>
        <i class='material-icons' data-id='${id}'>delete_outline</i>
      </div>

  </div>
  `;
  document.querySelector(".recipes").innerHTML += contenido;
}

function actualizarPlatillo(platillo, id) {
  let tarjeta = document.getElementById(`${id}`);
  tarjeta.querySelector(".recipe-title").innerHTML = platillo.nombre;
  tarjeta.querySelector(".recipe-ingredients").innerHTML = platillo.ingredientes;
  tarjeta.querySelector(".recipe-price").innerHTML = '$' + platillo.precio;
}

const borrarPlatillo = (id) => {
  const platillo = document.querySelector(`.recipe[data-id='${id}']`);
  platillo.remove();
}

let streaming = false; 
const width = 320;
let height = 0;
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const foto = document.getElementById('foto');
const btnFoto = document.getElementById('btnFoto');

btnFoto.addEventListener('click', function() {
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
   .then((stream) => {
    video.srcObject = stream;
    video.play();
  }).catch(error => {
    console.log("Error al acceder a la cámara: ", error);
  })
  })

  video.addEventListener('canplay', () => {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
 })

function tomarFoto() {

  const contexto = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        contexto.drawImage(video, 0, 0, width, height);
        const fotoFinal = canvas.toDataURL('image/png');
        foto.setAttribute('src', fotoFinal);
        document.getElementById("foto").value = fotoFinal;
    } else {
        limpiarFoto()
    }
}

const btnTomarFoto = document.getElementById('btnTomarFoto');
btnTomarFoto.addEventListener('click', tomarFoto);

 function limpiarFoto() {
  const contexto = canvas.getContext('2d');
  contexto.fillStyle = "red";
  contexto.fillRect(0, 0, canvas.width, canvas.height);
  foto.setAttribute('src', "");
 }
