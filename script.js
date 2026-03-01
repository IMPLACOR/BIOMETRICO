let datos = [];
let datosOrdenados = [];

async function cargarCSV() {

    try {

        const response = await fetch("registros.csv?nocache=" + new Date().getTime());
        const text = await response.text();

        datos = text.trim().split(/\r?\n/).map(line => line.split(","));

        let nombres = [...new Set(datos.slice(1).map(row => row[2]))];

        let select = document.getElementById("trabajadores");
        select.innerHTML = "";

        nombres.forEach(nombre => {
            let option = document.createElement("option");
            option.value = nombre;
            option.text = nombre;
            select.appendChild(option);
        });

        alert("CSV cargado correctamente");

    } catch (error) {
        alert("Error cargando CSV");
        console.error(error);
    }
}

function ordenarTurnos(marcas) {

    // Ordenar horas correctamente
    marcas.sort((a, b) => a.localeCompare(b));

    let resultado = {
        IngresoA: "",
        SalidaA: "",
        IngresoB: "",
        SalidaB: ""
    };

    const LIMITE = "12:30";

    // ===== 1 MARCA =====
    if (marcas.length === 1) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
        } else {
            resultado.IngresoB = marcas[0];
        }
    }

    // ===== 2 MARCAS =====
    else if (marcas.length === 2) {

        if (marcas[0] < LIMITE) {
            // Turno A completo
            resultado.IngresoA = marcas[0];
            resultado.SalidaA  = marcas[1];
        } else {
            // Turno B completo
            resultado.IngresoB = marcas[0];
            resultado.SalidaB  = marcas[1];
        }
    }

    // ===== 3 MARCAS (caso raro pero posible) =====
    else if (marcas.length === 3) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
            resultado.SalidaA  = marcas[1];
            resultado.IngresoB = marcas[2];
        } else {
            resultado.IngresoB = marcas[0];
            resultado.SalidaB  = marcas[1];
        }
    }

    // ===== 4 O MÁS MARCAS =====
    else if (marcas.length >= 4) {

        resultado.IngresoA = marcas[0];
        resultado.SalidaA  = marcas[1];
        resultado.IngresoB = marcas[2];
        resultado.SalidaB  = marcas[3];
    }

    return resultado;
}

function descargar() {

    let encabezado = "Fecha,IngresoA,SalidaA,IngresoB,SalidaB\n";
    let contenido = encabezado + datosOrdenados.join("\n");

    let blob = new Blob([contenido], { type: "text/csv" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ordenado.csv";
    link.click();
}
