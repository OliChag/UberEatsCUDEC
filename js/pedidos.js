let contenidoPlatillo = "";
db.collection("platillos").onSnapshot((datos) => {
     datos.docChanges().forEach((registro) => {
        if (registro.type === "added") {
            agregarPlatillo(registro.doc.data(), registro.doc.id);
        }
         });
         var elems = document.querySelectorAll('select');
         M.FormSelect.init(elems);
 });

 function agregarPlatillo(platillo, id) {
    contenidoPlatillo += `<option value='${id}'>
    ${platillo.nombre} -  $${platillo.precio}
    </option>`;
    document.getElementById("listaPlatillo").innerHTML = contenidoPlatillo;
    }

const formularioPedido = document.getElementById("formPedido");
formularioPedido.addEventListener("submit", (e) => {
    e.preventDefault();
    const pedidoNuevo = {
        platillo: formularioPedido.listaPlatillo.value,
        nombre: formularioPedido.nombre.value,
        direccion: formularioPedido.direccion.value
    };

    db.collection("pedidos").add(pedidoNuevo)
    .then(() => {
        alert("Pedido realizado exitosamente");
        formularioPedido.reset();
    })
    .catch((error) => {
        console.log(error);
        alert("Error al realizar el pedido");
    });
});