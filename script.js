console.log("Formulario desarrollado por www.ignovacion.com");

const scriptURL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"; // Reemplaza YOUR_SCRIPT_ID con tu Script ID.

// Mostrar/ocultar secciones según el tipo de rendición
document.getElementById("tipoRendicion").addEventListener("change", function () {
    const tipo = this.value;
    document.getElementById("seccionVoucher").style.display = tipo === "voucher" ? "block" : "none";
    document.getElementById("seccionGastos").style.display = tipo === "gastos" ? "block" : "none";
    mostrarMensaje("Completa la información y presiona Enviar.", "blue");
});

// Función para leer NFC
async function leerNFC(campoDestino, tipo) {
    if ("NDEFReader" in window) {
        try {
            const nfcReader = new NDEFReader();
            await nfcReader.scan();
            mostrarMensaje("Escaneando NFC... Acerca el tag al dispositivo.", "orange");

            nfcReader.onreading = (event) => {
                const lines = new TextDecoder().decode(event.message.records[0].data).split("\n");
                if (tipo === "coordinador") {
                    document.getElementById("coordinador").value = lines[0] || "";
                    document.getElementById("codigoCoordinador").value = lines[1] || "";
                    document.getElementById("colegio").value = lines[2] || "";
                    document.getElementById("programa").value = lines[3] || "";
                    document.getElementById("estudiantes").value = lines[4] || "";
                    document.getElementById("apoderados").value = lines[5] || "";
                    document.getElementById("correoCoordinador").value = lines[6] || "";
                } else if (tipo === "responsable") {
                    document.getElementById("responsable").value = lines[0] || "";
                    document.getElementById("actividad").value = lines[1] || "";
                    document.getElementById("correoResponsable").value = lines[2] || "";
                }
                mostrarMensaje("Lectura completada con éxito.", "green");
            };
        } catch (error) {
            mostrarMensaje("Error al leer NFC: " + error, "red");
        }
    } else {
        alert("NFC no soportado en este navegador. Usa Chrome en Android.");
    }
}

// Mostrar mensajes
function mostrarMensaje(mensaje, color) {
    const status = document.getElementById("status");
    status.style.color = color;
    status.innerText = mensaje;
}

// Eventos de lectura NFC
document.getElementById("firmarCoordinador").addEventListener("click", () => leerNFC(null, "coordinador"));
document.getElementById("firmarResponsable").addEventListener("click", () => leerNFC(null, "responsable"));

// Enviar formulario
document.getElementById("formulario").addEventListener("submit", async (event) => {
    event.preventDefault();
    const tipo = document.getElementById("tipoRendicion").value;
    const formData = new FormData();
    formData.append("tipo", tipo);

    if (tipo === "voucher") {
        ["coordinador", "codigoCoordinador", "colegio", "programa", "estudiantes", "apoderados", "responsable", "actividad", "correoResponsable"].forEach(id => {
            formData.append(id, document.getElementById(id).value || "");
        });
    } else if (tipo === "gastos") {
        ["coordinadorGasto", "codigoCoordinadorGasto", "colegioGasto", "programaGasto", "fechaGasto", "asuntoGasto", "valorGasto"].forEach(id => {
            formData.append(id, document.getElementById(id).value || "");
        });
        const fileInput = document.getElementById("imagenGasto");
        if (fileInput.files.length > 0) {
            formData.append("imagenGasto", fileInput.files[0]);
        }
    }

    try {
        const response = await fetch(scriptURL, { method: "POST", body: formData });
        const result = await response.text();
        console.log(result);
        alert("Datos enviados correctamente.");
        window.location.reload();
    } catch (error) {
        console.error("Error al enviar los datos:", error);
        mostrarMensaje("Error al enviar los datos. Intenta nuevamente.", "red");
    }
});
