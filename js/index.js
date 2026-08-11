let contenido = "";
let streamActual = null;
let streaming = false;

const width = 320;
let height = 0;

document.addEventListener("DOMContentLoaded", () => {
  const menus = document.querySelectorAll(".side-menu");
  M.Sidenav.init(menus, { edge: "right" });

  const forms = document.querySelectorAll(".side-form");
  M.Sidenav.init(forms, { edge: "left" });

  configurarFormulario();
  configurarCamara();
});

function MostrarPlatillo(platillo, id) {
  let fotoPlatillo;

  if (platillo.imagen) {
    fotoPlatillo = platillo.imagen.startsWith("data:image/")
      ? platillo.imagen
      : `data:image/png;base64,${platillo.imagen}`;
  } else {
    fotoPlatillo = "img/dish.png";
  }

  contenido = `
    <div class="card-panel recipe white row" id="${id}" data-id="${id}">
      <img src="${fotoPlatillo}" alt="Foto del platillo" height="50" width="100">

      <div class="recipe-details">
        <div class="recipe-title">${platillo.nombre}</div>
        <div class="recipe-ingredients">${platillo.ingredientes}</div>
        <div class="recipe-price">$${platillo.precio}</div>

        <div class="recipe-delete">
          <i class="material-icons" data-id="${id}">delete_outline</i>
        </div>
      </div>
    </div>
  `;

  document.querySelector(".recipes").innerHTML += contenido;
}

function actualizarPlatillo(platillo, id) {
  const tarjeta = document.getElementById(id);

  if (!tarjeta) return;

  tarjeta.querySelector(".recipe-title").textContent = platillo.nombre;
  tarjeta.querySelector(".recipe-ingredients").textContent = platillo.ingredientes;
  tarjeta.querySelector(".recipe-price").textContent = `$${platillo.precio}`;
}

function borrarPlatillo(id) {
  const platillo = document.querySelector(`.recipe[data-id="${id}"]`);

  if (platillo) {
    platillo.remove();
  }
}

function configurarFormulario() {
  const formulario = document.getElementById("platillonuevo");

  formulario.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const precio = document.getElementById("precio").value.trim();
    const ingredientes = document.getElementById("ingredientes").value.trim();
    const fotoInput = document.getElementById("fotoBase64");

    if (!nombre || !precio || !ingredientes) {
      alert("Completa el nombre, precio e ingredientes.");
      return;
    }

    const nuevoPlatillo = {
      nombre: nombre,
      precio: Number(precio),
      ingredientes: ingredientes,
      imagen: fotoInput ? fotoInput.value : ""
    };

    db.collection("platillos")
      .add(nuevoPlatillo)
      .then(() => {
        alert("Platillo agregado correctamente.");

        formulario.reset();

        const foto = document.getElementById("foto");
        if (foto) {
          foto.src = "";
          foto.style.display = "none";
        }

        if (fotoInput) {
          fotoInput.value = "";
        }

        detenerCamara();

        const sideForm = document.getElementById("side-form");
        const instancia = M.Sidenav.getInstance(sideForm);

        if (instancia) {
          instancia.close();
        }
      })
      .catch((error) => {
        console.log("Error al agregar platillo:", error);
        alert("No se pudo agregar el platillo.");
      });
  });
}

function configurarCamara() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const foto = document.getElementById("foto");
  const fotoInput = document.getElementById("fotoBase64");
  const btnFoto = document.getElementById("btnFoto");
  const btnTomarFoto = document.getElementById("btnTomarFoto");

  btnFoto.addEventListener("click", () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: {
            ideal: "environment"
          }
        },
        audio: false
      })
      .then((stream) => {
        streamActual = stream;
        streaming = false;

        video.srcObject = stream;
        video.style.display = "block";
        foto.style.display = "none";

        video.play();
      })
      .catch((error) => {
        console.log("Error al acceder a la cámara:", error);
        alert("No fue posible abrir la cámara.");
      });
  });

  video.addEventListener("canplay", () => {
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth / width);

      video.setAttribute("width", width);
      video.setAttribute("height", height);

      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);

      streaming = true;
    }
  });

  btnTomarFoto.addEventListener("click", () => {
    if (!width || !height) {
      alert("Primero abre la cámara.");
      return;
    }

    const contexto = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    contexto.drawImage(video, 0, 0, width, height);

    const fotoFinal = canvas.toDataURL("image/png");

    foto.src = fotoFinal;
    foto.style.display = "block";

    if (fotoInput) {
      fotoInput.value = fotoFinal.replace("data:image/png;base64,", "");
    }

    detenerCamara();
  });
}

function detenerCamara() {
  const video = document.getElementById("video");

  if (streamActual) {
    streamActual.getTracks().forEach((track) => track.stop());
    streamActual = null;
  }

  if (video) {
    video.pause();
    video.srcObject = null;
    video.style.display = "none";
  }

  streaming = false;
}