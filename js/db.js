db.collection("platillos").onSnapshot((coleccion) => {
     coleccion.docChanges().forEach((registro) => {
        if (registro.type === "added") {
          MostrarPlatillo(registro.doc.data(), registro.doc.id);
        }
        if (registro.type === "modified") {
            actualizarPlatillo(registro.doc.data(), registro.doc.id);
        }
        if (registro.type === "removed") {
            borrarPlatillo(registro.doc.id);
        }   
     });

  });

  const formularioAgregar = document.getElementById("platillonuevo");
  formularioAgregar.addEventListener("submit", (e) => {
    e.preventDefault();
    const platilloNuevo = {
      nombre: formularioAgregar.title.value,
      ingredientes: formularioAgregar.ingredients.value,
      precio: formularioAgregar.price.value
    }
    db.collection("platillos").add(platilloNuevo)
    .catch((error) => {
        console.log(error);
        alert("Error al agregar el platillo");
    });
    formularioAgregar.title.value = "";
    formularioAgregar.ingredients.value = "";
    formularioAgregar.price.value = "";
    alert("Platillo agregado exitosamente");
  });

  const eliminarPlatillo = document.querySelector(".recipes");
    eliminarPlatillo.addEventListener("click", (e) => {
        if (e.target.tagName === 'I') {
            const id = e.target.getAttribute("data-id");
            db.collection("platillos").doc(id).delete()
        }
})
