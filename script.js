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

function procesar() {

    let trabajador = document.getElementById("trabajadores").value;

    let registros = datos.slice(1).filter(row => row[2] === trabajador);

    let agrupado = {};

    registros.forEach(row => {

        let fecha = row[0];
        let hora = row[1];

        if (!agrupado[fecha]) {
            agrupado[fecha] = [];
        }

        agrupado[fecha].push(hora);
    });

    datosOrdenados = [];

    let tbody = document.querySelector("#tabla tbody");
    tbody.innerHTML = "";

    for (let fecha in agrupado) {

        let turnos = ordenarTurnos(agrupado[fecha]);

        datosOrdenados.push(
            `${fecha},${turnos.IngresoA},${turnos.SalidaA},${turnos.IngresoB},${turnos.SalidaB}`
        );

        // 🔥 PINTAR EN TABLA
        let fila = `
            <tr>
                <td>${fecha}</td>
                <td>${turnos.IngresoA}</td>
                <td>${turnos.SalidaA}</td>
                <td>${turnos.IngresoB}</td>
                <td>${turnos.SalidaB}</td>
            </tr>
        `;

        tbody.innerHTML += fila;
    }

    alert("Datos procesados correctamente");
}

function ordenarTurnos(marcas) {

    marcas.sort((a, b) => a.localeCompare(b));

    let resultado = {
        IngresoA: "",
        SalidaA: "",
        IngresoB: "",
        SalidaB: ""
    };

    const LIMITE = "12:30";

    if (marcas.length === 1) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
        } else {
            resultado.IngresoB = marcas[0];
        }
    }

    else if (marcas.length === 2) {

        if (marcas[0] < LIMITE) {
            resultado.IngresoA = marcas[0];
            resultado.SalidaA  = marcas[1];
        } else {
            resultado.IngresoB = marcas[0];
            resultado.SalidaB  = marcas[1];
        }
    }

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
